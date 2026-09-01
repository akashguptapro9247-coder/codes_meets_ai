import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { uploadToImageKit, generateAuthParams, deleteFromImageKit } from './server/imagekitApi.js';
import { executeCodeOnPiston } from './server/executionApi.js';

// Custom Vite middleware plugin to serve ImageKit server-side endpoints safely
function imageKitPlugin() {
  return {
    name: 'vite-plugin-imagekit-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // 1. GET /api/imagekit/auth
        if (url === '/api/imagekit/auth' && req.method === 'GET') {
          try {
            const authParams = generateAuthParams();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(authParams));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 2. POST /api/imagekit/upload (Accepts JSON with base64/data or binary)
        if (url === '/api/imagekit/upload' && req.method === 'POST') {
          try {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const result = await uploadToImageKit({
                  base64Data: parsed.file,
                  fileName: parsed.fileName,
                  folder: parsed.folder
                });
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify(result));
              } catch (uploadErr) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: uploadErr.message }));
              }
            });
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 3. POST /api/imagekit/delete
        if (url === '/api/imagekit/delete' && req.method === 'POST') {
          try {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const result = await deleteFromImageKit(parsed.fileIds || []);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify(result));
              } catch (delErr) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: delErr.message }));
              }
            });
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // 4. POST /api/execute (Layer 2 Manual Piston execution proxy)
        if (url === '/api/execute' && req.method === 'POST') {
          try {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const result = await executeCodeOnPiston(parsed);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify(result));
              } catch (execErr) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: execErr.message }));
              }
            });
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        next();
      });
    }
  };
}

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.IMAGEKIT_PRIVATE_KEY = env.IMAGEKIT_PRIVATE_KEY || 'private_BSNkTDg+vq6eboXvrkDevE9+XMk=';

  return {
    plugins: [react(), imageKitPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@admin': path.resolve(__dirname, './src/admin'),
        '@layer1': path.resolve(__dirname, './src/layer1'),
        '@layer2': path.resolve(__dirname, './src/layer2'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@database': path.resolve(__dirname, './database'),
        '@assets': path.resolve(__dirname, './src/assets')
      }
    },
    optimizeDeps: {
      include: [
        '@uiw/react-codemirror',
        '@uiw/codemirror-theme-vscode',
        '@codemirror/lang-cpp',
        '@codemirror/lang-java',
        '@codemirror/lang-python'
      ]
    }
  };
});
