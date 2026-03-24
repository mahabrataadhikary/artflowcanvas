import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import fs from 'fs';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  Object.assign(process.env, env);
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'local-api-emulator',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              const url = new URL(req.url, `http://${req.headers.host}`);
              const apiPath = path.resolve(process.cwd(), url.pathname.slice(1) + '.ts');
              
              if (fs.existsSync(apiPath)) {
                console.log(`[Vite API] Handling ${req.url} using ${apiPath}`);
                try {
                  const module = await server.ssrLoadModule(apiPath);
                  const handler = module.default;
                  
                  let body = '';
                  req.on('data', chunk => { body += chunk; });
                  req.on('end', async () => {
                    try {
                      const vercelReq = Object.assign(req, { body: body ? JSON.parse(body) : {} });
                      const vercelRes = Object.assign(res, {
                        status: (s: number) => { res.statusCode = s; return vercelRes; },
                        json: (j: any) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(j)); return vercelRes; }
                      });
                      
                      await handler(vercelReq, vercelRes);
                    } catch (e: any) {
                      console.error(`[Vite API] Handler Error for ${req.url}:`, e);
                      res.statusCode = 500;
                      res.end(JSON.stringify({ error: e.message || 'Internal Server Error' }));
                    }
                  });
                  return;
                } catch (e: any) {
                  console.error(`[Vite API] Failed to load module ${apiPath}:`, e);
                }
              } else {
                console.warn(`[Vite API] File not found for ${req.url}: ${apiPath}`);
              }
            }
            next();
          });
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            animations: ['motion/react'],
            icons: ['lucide-react'],
          },
        },
      },
    },
  };
});
