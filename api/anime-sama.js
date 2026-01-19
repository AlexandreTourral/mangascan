export default async function handler(req, res) {
  // Récupère l'URL complète
  const fullUrl = req.url || '';
  console.log('[Vercel Proxy] URL reçue:', fullUrl);
  
  // Extrait le chemin après /api/anime-sama
  // Format attendu: /api/anime-sama/One%20Piece/1/1.jpg ou /api/anime-sama/get_nb_chap_et_img.php?oeuvre=...
  const match = fullUrl.match(/^\/api\/anime-sama(.*)$/);
  
  if (!match) {
    console.error('[Vercel Proxy] URL invalide:', fullUrl);
    res.status(400);
    return res.json({ 
      error: 'URL invalide',
      received: fullUrl
    });
  }
  
  // Récupère tout après /api/anime-sama (y compris le / initial)
  const pathAndQuery = match[1];
  
  // Si le chemin est vide ou juste "/", retourne une erreur
  if (!pathAndQuery || pathAndQuery === '/') {
    res.status(400);
    return res.json({ 
      error: 'Chemin manquant',
      hint: 'Format attendu: /api/anime-sama/One%20Piece/1/1.jpg ou /api/anime-sama/get_nb_chap_et_img.php?oeuvre=...'
    });
  }
  
  // Construit l'URL cible (retire le / initial car on ajoute /s2/scans/)
  const targetUrl = `https://anime-sama.si/s2/scans${pathAndQuery}`;
  
  console.log('[Vercel Proxy] ===== DEBUG =====');
  console.log('[Vercel Proxy] pathAndQuery:', pathAndQuery);
  console.log('[Vercel Proxy] URL cible:', targetUrl);
  console.log('[Vercel Proxy] =================');

  try {
    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, image/*, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://anime-sama.si/',
        'DNT': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
    });

    console.log('[Vercel Proxy] Status:', response.status);
    console.log('[Vercel Proxy] Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      console.error('[Vercel Proxy] Erreur HTTP:', response.status, response.statusText);
      
      // Essaie de lire le corps de la réponse pour plus d'infos
      let errorBody = null;
      try {
        const text = await response.text();
        errorBody = text.substring(0, 500); // Limite à 500 caractères
      } catch (e) {
        // Ignore si on ne peut pas lire le corps
      }
      
      res.status(response.status);
      return res.json({ 
        error: `Erreur HTTP ${response.status}`,
        details: response.statusText,
        url: targetUrl,
        errorBody,
        hint: response.status === 404 
          ? "L'URL demandée n'existe pas sur anime-sama.si. Vérifiez le nom du manga, le numéro de chapitre et de page."
          : null
      });
    }

    // Récupère le content-type de la réponse
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Si c'est du JSON ou du texte
    if (contentType.includes('application/json') || contentType.includes('text/html') || contentType.includes('text/plain')) {
      const text = await response.text();
      console.log('[Vercel Proxy] Succès - Texte/JSON reçu');
      
      // Essaie de parser en JSON si possible
      try {
        const data = JSON.parse(text);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
        res.status(200);
        return res.json(data);
      } catch {
        // Si ce n'est pas du JSON valide, renvoie le texte
        res.setHeader('Content-Type', contentType);
        res.status(200);
        return res.send(text);
      }
    }
    
    // Si c'est une image ou autre fichier binaire
    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    console.log('[Vercel Proxy] Succès - Fichier binaire envoyé');
    res.status(200);
    return res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('[Vercel Proxy] Erreur:', error);
    res.status(500);
    return res.json({ 
      error: 'Erreur serveur', 
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
