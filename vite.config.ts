import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    // Ensure video files are treated as assets and not inlined
    assetsInlineLimit: 0, // Don't inline any assets (important for video files)
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep video files in root with original name for better caching
          if (assetInfo.name && /\.(mp4|webm|ogg)$/i.test(assetInfo.name)) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
})

