import React, { useEffect, useState } from 'react';
import './App.css';

// 關鍵：在 Electron 環境下的 React，可以用這行拿到 Electron 的通訊工具
const { ipcRenderer } = window.require ? window.require('electron') : {};

// 將 byte 數轉成易讀的檔案大小
const formatBytes = (bytes) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);

function App() {
  const [sysInfo, setSysInfo] = useState('點擊下方按鈕以獲取系統資訊...');
  const [dbInfo, setDbInfo] = useState(null);
  const [dbError, setDbError] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);

  // 🌟 透過 IPC 向主進程索取本地 SQLite 資料庫狀態
  const loadDbInfo = async () => {
    if (!ipcRenderer) {
      setDbError('目前不在 Electron 環境內，無法呼叫 IPC');
      return;
    }
    setDbLoading(true);
    const result = await ipcRenderer.invoke('request-db-info');
    if (result.ok) {
      setDbInfo(result.data);
      setDbError(null);
    } else {
      setDbError(result.error);
    }
    setDbLoading(false);
  };

  // 畫面載入時自動抓一次資料庫資訊
  useEffect(() => {
    loadDbInfo();
  }, []);

  // 呼叫 Electron 主進程的功能
  const getDockerSystemInfo = async () => {
    if (ipcRenderer) {
      setSysInfo('正在從主進程獲取資訊...');
      // 發送 IPC 訊號，並等待主進程回傳 Linux 系統資訊
      const result = await ipcRenderer.invoke('request-docker-info');
      setSysInfo(result);
    } else {
      setSysInfo('目前不在 Electron 環境內，無法呼叫 IPC');
    }
  };

  const isUpToDate = dbInfo && dbInfo.pendingMigrations.length === 0;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🗄️ 本地 SQLite 資料庫狀態</h1>
        <p className="subtitle">
          App v{dbInfo ? dbInfo.appVersion : '-'} ・ 資料由 React 透過 IPC 向 Electron 主進程即時取得
        </p>
      </header>

      {dbError && (
        <div className="migration-check-box is-error">
          <span className="check-icon">✕</span>
          <div className="check-text">
            <h4>無法取得資料庫資訊</h4>
            <p>{dbError}</p>
          </div>
        </div>
      )}

      {dbInfo && (
        <>
          <div className="grid-container">
            <div className="status-card">
              <h3>Knex 版本</h3>
              <p className="value-text text-blue">v{dbInfo.knexVersion}</p>
            </div>
            <div className="status-card">
              <h3>SQLite 引擎版本</h3>
              <p className="value-text text-green">v{dbInfo.sqliteVersion}</p>
              <p className="subtitle">better-sqlite3 v{dbInfo.betterSqlite3Version}</p>
            </div>
            <div className="status-card">
              <h3>Schema 版本（最後一支 Migration）</h3>
              <p className="value-text text-purple">{dbInfo.schemaVersion}</p>
            </div>
          </div>

          <div className="details-panel">
            <h3>📁 資料庫檔案路徑</h3>
            <div className="path-box">
              <code>{dbInfo.dbPath}</code>
            </div>
            <p className="subtitle">
              檔案大小：{formatBytes(dbInfo.fileSize)} ・ 資料表：{dbInfo.tables.join(', ') || '（無）'}
            </p>

            <div className={`migration-check-box ${isUpToDate ? '' : 'is-warning'}`}>
              <span className="check-icon">{isUpToDate ? '✓' : '!'}</span>
              <div className="check-text">
                <h4>
                  {isUpToDate
                    ? `Migration 已是最新（共 ${dbInfo.completedMigrations.length} 支）`
                    : `尚有 ${dbInfo.pendingMigrations.length} 支 Migration 未執行`}
                </h4>
                {dbInfo.completedMigrations.map((name) => (
                  <p key={name}>✔ {name}</p>
                ))}
                {dbInfo.pendingMigrations.map((name) => (
                  <p key={name}>… {name}</p>
                ))}
              </div>
            </div>

            <button className="action-button" onClick={loadDbInfo} disabled={dbLoading}>
              {dbLoading ? '讀取中...' : '🔄 重新讀取'}
            </button>
          </div>
        </>
      )}

      {/* 原有的 IPC 測試：顯示從作業系統底層撈出來的資料 */}
      <div className="details-panel">
        <h3>📦 容器 / 作業系統資訊</h3>
        <button className="action-button" onClick={getDockerSystemInfo}>
          獲取系統資訊
        </button>
        <pre className="path-box">{sysInfo}</pre>
      </div>
    </div>
  );
}

export default App;
