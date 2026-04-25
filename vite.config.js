import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.warn('[Vite Proxy] WebSocket error:', err.message);
          });
          proxy.on('proxyReqWs', (_proxyReq, _req, _socket) => {
            console.log('[Vite Proxy] WebSocket connection established');
          });
          proxy.on('close', (_req, _socket, _head) => {
            console.log('[Vite Proxy] WebSocket connection closed');
          });
        }
      }
    }
  }
});
