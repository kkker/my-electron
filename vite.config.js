import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true // 確保一定要鎖定 5173 埠，防止搶埠造成 Electron 連不上
  }
});

