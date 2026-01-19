export default async function handler(req, res) {
  // Récupère l'URL complète
  const fullUrl = req.url || '';
  console.log('[Vercel Proxy] URL reçue:', fullUrl);
  
  // Extrait le chemin après /api/anime-sama/
  const match = fullUrl.match(/\/api\/anime-sama\/(.+)/);
  
  if (!match) {
    console.error('[Vercel Proxy] URL invalide:', fullUrl);
    res.status(400);
    return res.json({ 
      error: 'URL invalide',
      received: fullUrl
    });
  }
  
  const pathAndQuery = match[1];
  
  // Liste des variantes à essayer pour les noms de manga
  const urlVariants = [
    pathAndQuery, // Original : "One%20Piece/1/1.jpg"
    pathAndQuery.replace(/One%20Piece/gi, 'One-Piece'),  // "One-Piece/1/1.jpg"
    pathAndQuery.replace(/One%20Piece/gi, 'one-piece'),  // "one-piece/1/1.jpg"
  ];
  
  console.log('[Vercel Proxy] Tentative avec variantes:', urlVariants);
  
  let response;
  let targetUrl;
  let lastError;
  
  // Essaie chaque variante jusqu'à ce qu'une fonctionne
  for (const variant of urlVariants) {
    targetUrl = `https://anime-sama.si/s2/scans/${variant}`;
    console.log('[Vercel Proxy] Essai:', targetUrl);
    
    try {
      response = await fetch(targetUrl, {
        method: req.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, image/*, */*',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://anime-sama.si/',
          'Origin': 'https://anime-sama.si',
          'DNT': '1',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });
      
      console.log('[Vercel Proxy] Status:', response.status, 'pour', targetUrl);
      
      // Si on obtient un succès (200), on sort de la boucle
      if (response.ok) {
        console.log('[Vercel Proxy] ✓ Succès avec:', targetUrl);
        break;
      }
      
      lastError = { status: response.status, statusText: response.statusText, url: targetUrl };
    } catch (error) {
      console.error('[Vercel Proxy] Erreur fetch:', error);
      lastError = { error: error.message, url: targetUrl };
    }
  }

  // Si aucune variante n'a fonctionné
  if (!response || !response.ok) {
    console.error('[Vercel Proxy] Toutes les variantes ont échoué');
    res.status(lastError?.status || 404);
    return res.json({ 
      error: `Aucune variante n'a fonctionné`,
      tried: urlVariants.map(v => `https://anime-sama.si/s2/scans/${v}`),
      lastError
    });
  }

  console.log('[Vercel Proxy] Content-Type:', response.headers.get('content-type'));

  try {
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
