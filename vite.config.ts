import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, './src/domain'),
      '@ecs': path.resolve(__dirname, './src/ecs'),
      '@app': path.resolve(__dirname, './src/application'),
      '@infra': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
