import React from 'react';

const GameControls = ({ isRunning, isPaused, onStart, onPause, onRestart }) => {
  return (
    <div className="game-controls">
      <button 
        id="startBtn" 
        onClick={onStart}
        disabled={isRunning}
      >
        启动程序
      </button>
      <button 
        id="pauseBtn" 
        onClick={onPause}
        disabled={!isRunning}
      >
        {isPaused ? '继续游戏' : '暂停运行'}
      </button>
      <button 
        id="restartBtn" 
        onClick={onRestart}
        disabled={!isRunning && !isPaused}
      >
        重新初始化
      </button>
    </div>
  );
};

export default GameControls;
