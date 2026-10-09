import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

const readVersion = (pkgPath) => JSON.parse(fs.readFileSync(new URL(pkgPath, import.meta.url), 'utf8')).version;

export default defineConfig({
  plugins: [react()],
  base: './', // 關鍵：確保打包後的相對路徑正確，否則打包後會開出白畫面
  // 行動版沒有 Electron 的 app.getVersion() 可用，改在打包時把版本號寫進前端
  define: {
    __APP_VERSION__: JSON.stringify(readVersion('./package.json')),
    __CAP_SQLITE_VERSION__: JSON.stringify(readVersion('./node_modules/@capacitor-community/sqlite/package.json')),
  },
  server: {
    port: 5173,
    strictPort: true // 確保一定要鎖定 5173 埠，防止搶埠造成 Electron 連不上
  }
});

