/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const paquet = JSON.parse(readFileSync('./package.json', 'utf-8'));

// « base » = sous-dossier où l'app est publiée sur GitHub Pages :
// https://labaapt.github.io/mon-budget/
// Si le dépôt change de nom, il faut changer cette ligne.
export default defineConfig({
  base: '/mon-budget/',
  plugins: [react()],
  define: {
    __VERSION__: JSON.stringify(paquet.version),
  },
  test: {
    environment: 'node',
  },
});
