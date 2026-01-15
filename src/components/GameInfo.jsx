import React from 'react';

const GameInfo = ({ score, level }) => {
  return (
    <div className="game-info">
      <div className="score">SCORE: <span id="score">{score}</span></div>
      <div className="level">LEVEL: <span id="level">{level}</span></div>
    </div>
  );
};

export default GameInfo;
