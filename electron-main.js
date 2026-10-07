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

    // 1. 偵測當前應用程式是跑在什麼作業系統上
    // process.platform 常見值：'win32' (Windows), 'linux' (Docker/Linux), 'darwin' (macOS)
    const platform = process.platform;
    //
    switch (platform) {
      case 'linux':
        // 如果在 Docker 容器內部（Linux），執行 cat 撈取 Ubuntu 版本
        exec('cat /etc/os-release', (error, stdout, stderr) => {
          if (error) {
            resolve(`[Linux] 讀取失敗: ${error.message}`);
          } else {
            resolve(`[環境：Docker Linux 容器]\n\n${stdout}`);
          }
        });
        break;

      case 'win32':
        // 如果在 Windows 本機執行，改用 Windows 終端機指令（取得系統版本與使用者名稱）
        exec('ver && echo Username: %USERNAME%', (error, stdout, stderr) => {
          if (error) {
            resolve(`[Windows] 讀取失敗: ${error.message}`);
          } else {
            resolve(`[環境：Windows 本機系統]\n\n${stdout}`);
          }
        });
        break;

      case 'darwin':
        // 如果在 macOS 本機執行，使用 sw_vers
        exec('sw_vers', (error, stdout, stderr) => {
          if (error) {
            resolve(`[macOS] 讀取失敗: ${error.message}`);
          } else {
            resolve(`[環境：macOS 本機系統]\n\n${stdout}`);
          }
        });
        break;

      default:
        resolve(`未知的作業系統平台: ${platform}`);
    }

  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  const platform = process.platform;

  switch (platform) {
    case 'darwin':
      // 依照 macOS (Darwin) 原生規範：使用者關閉所有視窗時，應用程式保持在背景常駐，不結束進程
      break;
      
    case 'win32':
    case 'linux':
    default:
      // Windows、Linux 或是其他作業系統的標準規範：當所有視窗關閉時，直接完全退出程式
      app.quit();
      break;
  }
});
