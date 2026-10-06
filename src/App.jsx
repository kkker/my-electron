import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>🚀 Electron + React (Vite) 成功運行！</h1>
      <p>這是一個完全在 Docker 容器內執行的開發環境。</p>
      
      <div style={{ margin: '20px' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          點擊次數：{count}
        </button>
      </div>
      
      <p style={{ color: '#666' }}>嘗試修改 src/App.jsx，視窗將會即時熱重載更新！</p>
    </div>
  );
}

export default App;

