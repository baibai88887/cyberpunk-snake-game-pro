import { useState, useEffect, useRef, useCallback } from 'react';
import { config } from '../utils/config';
import { initAudioContext, playStartSound, playEatSound, playLevelUpSound, playGameOverSound, playGlitchSound } from '../utils/audio';
import { saveHighScore } from '../utils/storage';

export function useGameLogic(canvasRef) {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(config.initialSpeed);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalLevel, setFinalLevel] = useState(1);
  const [snake, setSnake] = useState([]);
  const [direction, setDirection] = useState('right');
  const [nextDirection, setNextDirection] = useState('right');
  const [food, setFood] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  const gameLoopRef = useRef(null);
  const audioContextRef = useRef(null);

  const initGame = useCallback(() => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ]);
    setDirection('right');
    setNextDirection('right');
    generateFood();
    setScore(0);
    setLevel(1);
    setSpeed(config.initialSpeed);
    setIsRunning(false);
    setIsPaused(false);
    setGameOver(false);
  }, []);

  const generateFood = useCallback(() => {
    let newFood;
    let collision;
    do {
      collision = false;
      newFood = {
        x: Math.floor(Math.random() * (config.canvasWidth / config.gridSize)),
        y: Math.floor(Math.random() * (config.canvasHeight / config.gridSize))
      };
      for (let segment of snake) {
        if (segment.x === newFood.x && segment.y === newFood.y) {
          collision = true;
          break;
        }
      }
    } while (collision);
    setFood(newFood);
  }, [snake]);

  const checkCollision = useCallback((head) => {
    if (
      head.x < 0 ||
      head.x >= config.canvasWidth / config.gridSize ||
      head.y < 0 ||
      head.y >= config.canvasHeight / config.gridSize
    ) {
      return true;
    }
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    return false;
  }, [snake]);

  const updateSnake = useCallback(() => {
    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (nextDirection) {
        case 'up':
          head.y -= 1;
          break;
        case 'down':
          head.y += 1;
          break;
        case 'left':
          head.x -= 1;
          break;
        case 'right':
          head.x += 1;
          break;
      }

      if (checkCollision(head)) {
        handleGameOver();
        return prevSnake;
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        playEatSound();
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore % 50 === 0) {
            handleLevelUp();
          }
          return newScore;
        });
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
    // 将direction更新移到setSnake回调外
    setDirection(nextDirection);
  }, [nextDirection, food, checkCollision, generateFood]);

  const handleLevelUp = useCallback(() => {
    setLevel(prev => {
      const newLevel = prev + 1;
      playLevelUpSound();
      setSpeed(prevSpeed => Math.max(config.maxSpeed, prevSpeed - config.speedIncrement));
      return newLevel;
    });
  }, []);

  const handleGameOver = useCallback(() => {
    setIsRunning(false);
    setGameOver(true);
    setFinalScore(score);
    setFinalLevel(level);
    playGameOverSound();
    saveHighScore(score, level);
  }, [score, level]);

  const startGame = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = initAudioContext();
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsRunning(true);
    setIsPaused(false);
    playStartSound();
  }, []);

  const pauseGame = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const restartGame = useCallback(() => {
    initGame();
  }, [initGame]);

  const setSnakeDirection = useCallback((newDirection) => {
    if (
      (newDirection === 'up' && direction !== 'down') ||
      (newDirection === 'down' && direction !== 'up') ||
      (newDirection === 'left' && direction !== 'right') ||
      (newDirection === 'right' && direction !== 'left')
    ) {
      setNextDirection(newDirection);
    }
  }, [direction]);

  useEffect(() => {
    // 初始调用initGame来设置初始状态
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        updateSnake();
      }, speed);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isRunning, isPaused, speed, updateSnake]);

  // 确保食物被正确生成
  useEffect(() => {
    if (Object.keys(food).length === 0 && snake.length > 0) {
      generateFood();
    }
  }, [snake, food, generateFood]);

  return {
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
  };
}
