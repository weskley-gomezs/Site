import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        servicos: path.resolve(__dirname, 'servicos.html'),
        sites: path.resolve(__dirname, 'sites.html'),
        sistemas: path.resolve(__dirname, 'sistemas.html'),
        lojas: path.resolve(__dirname, 'lojas-virtuais.html'),
        portfolio: path.resolve(__dirname, 'portfolio.html'),
        sobre: path.resolve(__dirname, 'sobre.html'),
        contato: path.resolve(__dirname, 'contato.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
