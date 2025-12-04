import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // <--- NEW IMPORT

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), // <--- NEW PLUGIN CALL
    react(),
  ],
  // Remove any `css: { postcss: { ... } }` section if it exists
});
