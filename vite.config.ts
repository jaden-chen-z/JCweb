import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Ensure proper headers for video streaming
    headers: {
      'Accept-Ranges': 'bytes',
    }
  },
  build: {
    // Ensure video files are copied to dist without modification
    assetsInlineLimit: 0, // Don't inline any assets
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep video files in root for proper serving
          if (assetInfo.name?.endsWith('.mp4')) {
            return '[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})

