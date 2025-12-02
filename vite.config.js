import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';
            const accept = req.headers.accept || '';
            
            const isStaticAsset = /\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|json|map)$/.test(url);
            
            const isApiRequest = 
              url.includes('?') || 
              /\/\d+/.test(url) ||
              ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '') ||
              accept.includes('application/json');
            
            if (accept.includes('text/html') && !isStaticAsset && !isApiRequest) {
              req.url = '/index.html';
            }
            
            next();
          });
        };
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    proxy: {
      '/news': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/roles': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/children': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/rights': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/categories': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/regions': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  }
})
