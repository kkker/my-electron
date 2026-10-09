// 平台適配層入口：整個前端「唯一」判斷執行平台的地方
// UI 只呼叫這裡匯出的函式，不直接碰 ipcRenderer / Capacitor 等平台 API
// 新增平台時：建立對應的實作檔（匯出相同函式），再於下方判斷式補上即可
import { Capacitor } from '@capacitor/core';
import * as electron from './electron';
import * as capacitor from './capacitor';
import * as web from './web';

// Electron 開啟 nodeIntegration 時，window.require 才會存在
const isElectron = typeof window.require === 'function';
// Android / iOS 原生殼內執行時為 true；一般瀏覽器為 false
const isCapacitor = Capacitor.isNativePlatform();

const impl = isElectron ? electron : isCapacitor ? capacitor : web;

// 'electron' | 'android' | 'ios' | 'web'
export const platformName = isElectron ? 'electron' : isCapacitor ? Capacitor.getPlatform() : 'web';

// 畫面顯示用：資料是從哪裡取得的
export const platformLabel = {
  electron: 'Electron 主進程（IPC）',
  android: 'Android 原生插件',
  ios: 'iOS 原生插件',
  web: '瀏覽器（無原生能力）',
}[platformName];

// 回傳 { ok: true, data } 或 { ok: false, error }
export const getDbInfo = impl.getDbInfo;

// 回傳顯示用的系統資訊字串
export const getSystemInfo = impl.getSystemInfo;
