export default async function handler(req, res) {
  // Récupère les segments de chemin
  const { path } = req.query;
  const pathSegments = Array.isArray(path) ? path : [path].filter(Boolean);
  const pathString = pathSegments.join('/');
  
  // Récupère les autres paramètres de query
  const { path: _, ...queryParams } = req.query;
  const queryString = new URLSearchParams(
    Object.entries(queryParams).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = Array.isArray(value) ? value[0] : value;
      }
      return acc;
    }, {})
  ).toString();
  
  // Construit l'URL cible
  const targetUrl = `https://anime-sama.si/s2/scans/${pathString}${queryString ? `?${queryString}` : ''}`;
  
  console.log('[Vercel Proxy] Requête vers:', targetUrl);
  console.log('[Vercel Proxy] Path segments:', pathSegments);
  console.log('[Vercel Proxy] Query params:', queryParams);

  try {
    const response = await fetch(targetUrl, {
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

    console.log('[Vercel Proxy] Status:', response.status);
    console.log('[Vercel Proxy] Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      console.error('[Vercel Proxy] Erreur HTTP:', response.status, response.statusText);
      res.status(response.status);
      return res.json({ 
        error: `Erreur HTTP ${response.status}`,
        details: response.statusText,
        url: targetUrl
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
