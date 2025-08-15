import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Static site configuration for GitHub Pages deployment
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['@solana/web3.js', 'ethers', 'date-fns'],
        },
      },
    },
  },
  // Configure base path for GitHub Pages (update with your repo name)
  base: '/',
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
