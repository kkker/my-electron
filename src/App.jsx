import React, { useState } from 'react';

// 關鍵：在 Electron 環境下的 React，可以用這行拿到 Electron 的通訊工具
const { ipcRenderer } = window.require ? window.require('electron') : {};

function App() {
  const [count, setCount] = useState(0);
  const [sysInfo, setSysInfo] = useState('點擊下方按鈕以獲取系統資訊...');

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

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>🚀 Electron + React (Vite) 成功運行！</h1>
      <p>這是一個完全在 Docker 容器內執行的開發環境。</p>
      
      <div style={{ margin: '20px' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginRight: '10px' }}
        >
          點擊次數：{count}
        </button>

        {/* 🌟 新增的 IPC 測試按鈕 */}
        <button 
          onClick={getDockerSystemInfo}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          獲取 Docker 內部系統資訊
        </button>
      </div>
      
      {/* 🌟 顯示從 Linux 底層撈出來的資料 */}
      <div style={{ marginTop: '30px', textAlign: 'left', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', display: 'inline-block', maxWidth: '600px', width: '100%', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
        <strong>📦 容器底層 Linux 數據：</strong>
        <pre style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#333' }}>{sysInfo}</pre>
      </div>

      <p style={{ color: '#666', marginTop: '30px' }}>嘗試修改 src/App.jsx，視窗將會即時熱重載更新！</p>
    </div>
  );
}

export default App;
