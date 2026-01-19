import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/anime-sama': {
        target: 'https://anime-sama.si',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anime-sama/, '/s2/scans'),
        secure: false,
        ws: false,
        followRedirects: true,
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('[Proxy] Erreur:', err.message);
            if ('writeHead' in res && !res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({ 
                error: 'Proxy error', 
                message: err.message 
              }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[Proxy] Requête:', req.method, req.url, '->', proxyReq.path);
            // Supprime les en-têtes qui peuvent causer des problèmes
            proxyReq.removeHeader('connection');
            // Ajoute des en-têtes supplémentaires
            proxyReq.setHeader('Accept-Language', 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7');
            proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
            proxyReq.setHeader('Cache-Control', 'no-cache');
            proxyReq.setHeader('Pragma', 'no-cache');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Proxy] Réponse:', proxyRes.statusCode, req.url);
          });
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://anime-sama.si/',
          'Origin': 'https://anime-sama.si',
          'DNT': '1',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        }
      }
    }
  }
})
