const { app, BrowserWindow, ipcMain } = require('electron'); // 1. 引入 ipcMain
const path = require('path');
const { exec } = require('child_process'); // 引入 Node.js 原生執行指令工具

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,     // 允許網頁端使用 Node 語法 (Docker 內部開發安全，適合此模式)
      contextIsolation: false    // 關閉上下文隔離，讓 React 可以直接拿到 electron 模組
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// 🌟 2. 建立 IPC 監聽器：當 React 發送 'request-docker-info' 訊號時觸發
ipcMain.handle('request-docker-info', async (event, args) => {
  return new Promise((resolve) => {
    // 執行 Linux 指令，讀取 Docker 容器內部的 Ubuntu 版本資訊
    exec('cat /etc/os-release', (error, stdout, stderr) => {
      if (error) {
        resolve(`讀取失敗: ${error.message}`);
      } else {
        resolve(stdout); // 將讀取到的 Linux 系統資訊回傳給 React
      }
    });
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
