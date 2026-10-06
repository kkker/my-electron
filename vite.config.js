import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // 關鍵：確保打包後的相對路徑正確，否則打包後會開出白畫面
  server: {
    port: 5173,
    strictPort: true // 確保一定要鎖定 5173 埠，防止搶埠造成 Electron 連不上
  }
});

