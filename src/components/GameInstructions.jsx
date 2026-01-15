import React from 'react';

const GameInstructions = () => {
  return (
    <div className="game-instructions">
      <h3>操作指南</h3>
      <p>【方向键】控制移动方向</p>
      <p>【空格键】暂停/继续运行</p>
      <p>【规则】吸收能量块提升等级</p>
      <p>【警告】触碰边界或自身将终止程序</p>
    </div>
  );
};

export default GameInstructions;
