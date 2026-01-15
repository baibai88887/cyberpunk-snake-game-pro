import React, { useRef, useEffect } from 'react';
import GameTitle from './components/GameTitle';
import GameInfo from './components/GameInfo';
import GameCanvas from './components/GameCanvas';
import GameControls from './components/GameControls';
import GameInstructions from './components/GameInstructions';
import GameLeaderboard from './components/GameLeaderboard';
import GameOverModal from './components/GameOverModal';
import { useGameLogic } from './hooks/useGameLogic';
import { initAudioContext } from './utils/audio';

function App() {
  const canvasRef = useRef(null);
  
  const {
    score,
    level,
    isRunning,
    isPaused,
    gameOver,
    finalScore,
    finalLevel,
    snake,
    food,
    direction,
    leaderboard,
    startGame,
    pauseGame,
    restartGame,
    setSnakeDirection,
    setLeaderboard
  } = useGameLogic(canvasRef);

  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setSnakeDirection('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSnakeDirection('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setSnakeDirection('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          setSnakeDirection('right');
          break;
        case ' ':
          event.preventDefault();
          if (isRunning) {
            pauseGame();
          }
          break;
        case 'Enter':
          if (!isRunning && !gameOver) {
            startGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, gameOver, setSnakeDirection, pauseGame, startGame]);

  useEffect(() => {
    const handleClick = () => {
      initAudioContext();
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleClick);
    };
  }, []);

  return (
    <div className="game-container">
      <GameTitle />
      <GameInfo score={score} level={level} />
      
      <div className="game-main-content">
        <GameInstructions />
        <div className="game-center">
          <GameCanvas 
            snake={snake} 
            food={food} 
            direction={direction}
          />
          <GameControls 
            isRunning={isRunning}
            isPaused={isPaused}
            onStart={startGame}
            onPause={pauseGame}
            onRestart={restartGame}
          />
        </div>
        <GameLeaderboard 
          leaderboard={leaderboard}
          setLeaderboard={setLeaderboard}
        />
      </div>
      
      {gameOver && (
        <GameOverModal 
          finalScore={finalScore}
          finalLevel={finalLevel}
          onPlayAgain={restartGame}
        />
      )}
    </div>
  );
}

export default App;
