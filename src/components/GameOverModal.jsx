import React from 'react';

const GameOverModal = ({ finalScore, finalLevel, onPlayAgain }) => {
  return (
    <div id="gameOverModal" className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <h2>系统终止</h2>
        <p>最终得分: <span id="finalScore">{finalScore}</span></p>
        <p>最终等级: <span id="finalLevel">{finalLevel}</span></p>
        <button id="playAgainBtn" onClick={onPlayAgain}>重新启动</button>
      </div>
    </div>
  );
};

export default GameOverModal;
