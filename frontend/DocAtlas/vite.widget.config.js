import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {}
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        outDir: 'dist-widget',
        emptyOutDir: true,
        rollupOptions: {
            input: 'src/widget.tsx',
            output: {
                format: 'iife',
                entryFileNames: 'widget.js',
                assetFileNames: 'widget.css'
            }
        }
    }
});