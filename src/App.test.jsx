import React from 'react';

function App() {
  return (
    <div className="test-container">
      <h1>测试页面</h1>
      <p>如果您看到这段文字，说明React应用已经成功挂载。</p>
      <div style={{ border: '2px solid #00ffff', padding: '20px', margin: '20px 0' }}>
        <canvas id="testCanvas" width="350" height="350" style={{ border: '1px solid #ff00ff', background: '#000' }}></canvas>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button>开始</button>
          <button>暂停</button>
          <button>重启</button>
        </div>
      </div>
    </div>
  );
}

export default App;