import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/pages/home.html'),
        tracks: resolve(__dirname, 'src/pages/tracks.html'),
      },
    },
  },
  server: {
    port: 10000,
    open: true,
    allowedHosts: ['localhost', 'racetrack-sih9.onrender.com']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'root-redirect',
      configureServer(server) {
        server.middlewares.use('/', (req, res, next) => {
          if (req.url === '/') {
            req.url = '/pages/home.html';
          }
          next();
        });
      },
    },
  ],
});
