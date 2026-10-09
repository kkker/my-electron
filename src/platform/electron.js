// Electron 實作：透過 IPC 向主進程（electron-main.js）索取資料
// 注意：window.require 放在函式內延遲呼叫，非 Electron 環境 import 此檔也不會出錯

const ipc = () => window.require('electron').ipcRenderer;

export const getDbInfo = () => ipc().invoke('request-db-info');

export const getSystemInfo = () => ipc().invoke('request-docker-info');
