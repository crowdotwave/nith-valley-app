import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base so the same build works from a GitHub Pages subpath and from
  // Capacitor's local file:// origin without rebuilding.
  base: './',
  server: { port: 5173 },
});
