const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 判斷是開發環境還是打包環境
  // 透過檢查環境變數或是打包後的路徑是否存在
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // 開發模式：直接讀取 React 的開發伺服器網址
    win.loadURL('http://localhost:5173');
  } else {
    // 打包後，讀取 vite 產出的 dist 資料夾內的 index.html
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }



  // 如果遇到畫面一片黑，可以嘗試關閉硬體加速（視 Docker 效能而定）
  // app.disableHardwareAcceleration();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

