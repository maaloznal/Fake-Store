import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';

export default defineConfig({
  plugins: [
    Pages({
      outDir: 'docs',
    }),
  ],

  build: {
    outDir: 'docs',
  },
  base: '/your-repo-name/',
});
