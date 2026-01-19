import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query: { [key: string]: string | string[] | undefined };
  cookies: { [key: string]: string };
  body: any;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => VercelResponse;
  send: (body: any) => VercelResponse;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Récupère le chemin et les paramètres de la requête
  const { path = '', ...queryParams } = req.query;
  
  // Construit l'URL complète vers anime-sama.si
  const pathString = Array.isArray(path) ? path.join('/') : path;
  const queryString = new URLSearchParams(
    Object.entries(queryParams).reduce((acc, [key, value]) => {
      acc[key] = Array.isArray(value) ? value[0] : value || '';
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  
  const targetUrl = `https://anime-sama.si/s2/scans/${pathString}${queryString ? `?${queryString}` : ''}`;
  
  console.log('[Vercel Proxy] Requête vers:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': req.headers['accept'] || 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://anime-sama.si/',
        'Origin': 'https://anime-sama.si',
        'DNT': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
    });

    if (!response.ok) {
      console.error('[Vercel Proxy] Erreur HTTP:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `Erreur HTTP ${response.status}`,
        details: response.statusText 
      });
    }

    // Récupère le content-type de la réponse
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Si c'est du JSON, le parse et le renvoie
    if (contentType.includes('application/json')) {
      const data = await response.json();
      console.log('[Vercel Proxy] Succès - JSON reçu');
      return res.status(200).json(data);
    }
    
    // Si c'est une image ou autre, renvoie le buffer
    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    console.log('[Vercel Proxy] Succès - Fichier binaire envoyé');
    return res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error('[Vercel Proxy] Erreur:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      message: error instanceof Error ? error.message : 'Erreur inconnue' 
    });
  }
}
