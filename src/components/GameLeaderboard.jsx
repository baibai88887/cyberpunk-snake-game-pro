import React, { useEffect } from 'react';
import { getHighScores, formatDate } from '../utils/storage';

const GameLeaderboard = ({ leaderboard, setLeaderboard }) => {
  useEffect(() => {
    const scores = getHighScores();
    setLeaderboard(scores);
  }, [setLeaderboard]);

  return (
    <div className="game-leaderboard">
      <h3>排行榜</h3>
      <div id="leaderboard" className="leaderboard-list">
        {leaderboard.length === 0 ? (
          <div className="leaderboard-empty">暂无记录</div>
        ) : (
          leaderboard.map((score, index) => (
            <div key={index} className="leaderboard-item">
              <div className="leaderboard-rank">{index + 1}</div>
              <div className="leaderboard-score">{score.score}</div>
              <div className="leaderboard-level">Lv{score.level}</div>
              <div className="leaderboard-date">{formatDate(score.date)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameLeaderboard;
