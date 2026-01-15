const config = {
  highScoresKey: 'snakeGameHighScores',
  maxHighScores: 10
};

export function getHighScores() {
  try {
    const scores = localStorage.getItem(config.highScoresKey);
    return scores ? JSON.parse(scores) : [];
  } catch (error) {
    console.error('获取高分失败:', error);
    return [];
  }
}

export function saveHighScore(score, level) {
  try {
    const highScores = getHighScores();
    const newScore = {
      score: score,
      level: level,
      date: new Date().toISOString()
    };
    
    highScores.push(newScore);
    
    highScores.sort((a, b) => b.score - a.score);
    
    const topScores = highScores.slice(0, config.maxHighScores);
    
    localStorage.setItem(config.highScoresKey, JSON.stringify(topScores));
    
    return true;
  } catch (error) {
    console.error('保存高分失败:', error);
    return false;
  }
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}
