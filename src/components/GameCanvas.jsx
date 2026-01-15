import React, { useRef, useEffect } from 'react';
import { config } from '../utils/config';
import { playGlitchSound } from '../utils/audio';

const GameCanvas = ({ snake, food, direction }) => {
  const canvasRef = useRef(null);
  const visualEffectsRef = useRef({
    foodFlash: false,
    flashCounter: 0,
    maxFlash: 5,
    glitchEffect: false,
    glitchCounter: 0,
    maxGlitch: 3,
    staticNoise: true,
    noiseIntensity: 0.02,
    pulseEffect: true,
    pulseCounter: 0,
    pulseSpeed: 0.02
  });

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const visualEffects = visualEffectsRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (visualEffects.pulseEffect) {
      visualEffects.pulseCounter += visualEffects.pulseSpeed;
      const pulseValue = Math.sin(visualEffects.pulseCounter) * 0.1 + 0.9;

      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, `rgba(0, 0, 0, ${0.95 + pulseValue * 0.05})`);
      bgGradient.addColorStop(0.5, `rgba(5, 5, 25, ${0.95 + pulseValue * 0.05})`);
      bgGradient.addColorStop(1, `rgba(10, 0, 30, ${0.95 + pulseValue * 0.05})`);

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      bgGradient.addColorStop(0.5, 'rgba(5, 5, 25, 0.95)');
      bgGradient.addColorStop(1, 'rgba(10, 0, 30, 0.95)');

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.2;
    for (let i = 0; i <= config.canvasWidth; i += config.gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, config.canvasHeight);
      ctx.stroke();
    }
    for (let i = 0; i <= config.canvasHeight; i += config.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(config.canvasWidth, i);
      ctx.stroke();
    }

    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 0.3;
    ctx.globalAlpha = 0.15;
    for (let i = -config.canvasWidth; i <= config.canvasWidth * 2; i += config.gridSize * 2) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + config.canvasHeight, config.canvasHeight);
      ctx.stroke();
    }

    ctx.fillStyle = '#00ffff';
    ctx.globalAlpha = 0.3;
    for (let i = 0; i <= config.canvasWidth; i += config.gridSize * 2) {
      for (let j = 0; j <= config.canvasHeight; j += config.gridSize * 2) {
        ctx.beginPath();
        ctx.arc(i, j, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    if (visualEffects.foodFlash) {
      ctx.fillStyle = visualEffects.flashCounter % 2 === 0 ? '#ff00ff' : '#ff66ff';
      visualEffects.flashCounter++;

      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ff00ff';

      if (visualEffects.flashCounter >= visualEffects.maxFlash) {
        visualEffects.foodFlash = false;
        visualEffects.flashCounter = 0;
        ctx.shadowBlur = 0;
      }
    } else {
      ctx.fillStyle = '#ff00ff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff00ff';
    }

    ctx.beginPath();
    ctx.arc(
      food.x * config.gridSize + config.gridSize / 2,
      food.y * config.gridSize + config.gridSize / 2,
      config.gridSize / 2 - 1,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(
      food.x * config.gridSize + config.gridSize / 2,
      food.y * config.gridSize + config.gridSize / 2,
      config.gridSize / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    const foodX = food.x * config.gridSize + config.gridSize / 2;
    const foodY = food.y * config.gridSize + config.gridSize / 2;
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      ctx.arc(foodX, foodY, config.gridSize / 2 + 3 + ring * 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;

    for (let i = 0; i < snake.length; i++) {
      const segment = snake[i];
      const opacity = 0.4 + (i / snake.length) * 0.6;

      if (i === 0) {
        const gradient = ctx.createLinearGradient(
          segment.x * config.gridSize + 1,
          segment.y * config.gridSize + 1,
          segment.x * config.gridSize + config.gridSize - 1,
          segment.y * config.gridSize + config.gridSize - 1
        );
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, '#0099ff');
        gradient.addColorStop(1, '#0055ff');

        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00ffff';

        ctx.fillStyle = gradient;
        ctx.fillRect(
          segment.x * config.gridSize + 1,
          segment.y * config.gridSize + 1,
          config.gridSize - 2,
          config.gridSize - 2
        );

        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          segment.x * config.gridSize + 1,
          segment.y * config.gridSize + 1,
          config.gridSize - 2,
          config.gridSize - 2
        );

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(
          segment.x * config.gridSize + config.gridSize * 0.3,
          segment.y * config.gridSize + config.gridSize * 0.35,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
          segment.x * config.gridSize + config.gridSize * 0.7,
          segment.y * config.gridSize + config.gridSize * 0.35,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(
          segment.x * config.gridSize + config.gridSize * 0.3 - 1,
          segment.y * config.gridSize + config.gridSize * 0.35 - 1,
          1,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
          segment.x * config.gridSize + config.gridSize * 0.7 - 1,
          segment.y * config.gridSize + config.gridSize * 0.35 - 1,
          1,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(segment.x * config.gridSize + config.gridSize / 2, segment.y * config.gridSize + 1);
        ctx.lineTo(segment.x * config.gridSize + config.gridSize / 2, segment.y * config.gridSize + config.gridSize / 2);
        ctx.stroke();
      } else {
        const bodyGradient = ctx.createLinearGradient(
          segment.x * config.gridSize + 1,
          segment.y * config.gridSize + 1,
          segment.x * config.gridSize + config.gridSize - 1,
          segment.y * config.gridSize + config.gridSize - 1
        );
        bodyGradient.addColorStop(0, `rgba(0, 255, 255, ${opacity})`);
        bodyGradient.addColorStop(1, `rgba(0, 150, 255, ${opacity})`);

        ctx.fillStyle = bodyGradient;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(0, 255, 255, ${opacity * 0.8})`;
        ctx.fillRect(
          segment.x * config.gridSize + 1,
          segment.y * config.gridSize + 1,
          config.gridSize - 2,
          config.gridSize - 2
        );

        ctx.strokeStyle = `rgba(0, 255, 255, ${opacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          segment.x * config.gridSize + 1,
          segment.y * config.gridSize + 1,
          config.gridSize - 2,
          config.gridSize - 2
        );
      }
    }

    ctx.shadowBlur = 0;

    if (visualEffects.glitchEffect) {
      visualEffects.glitchCounter++;

      for (let i = 0; i < visualEffects.maxGlitch; i++) {
        const glitchX = Math.random() * canvas.width;
        const glitchY = Math.random() * canvas.height;
        const glitchWidth = Math.random() * 20 + 5;
        const glitchHeight = Math.random() * 5 + 2;

        const glitchColors = ['#ff00ff', '#00ffff', '#ffffff'];
        const glitchColor = glitchColors[Math.floor(Math.random() * glitchColors.length)];

        ctx.fillStyle = glitchColor;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(glitchX, glitchY, glitchWidth, glitchHeight);
      }

      if (visualEffects.glitchCounter >= visualEffects.maxGlitch) {
        visualEffects.glitchEffect = false;
        visualEffects.glitchCounter = 0;
      }

      ctx.globalAlpha = 1;
    }

    if (visualEffects.staticNoise) {
      ctx.globalAlpha = visualEffects.noiseIntensity;
      ctx.fillStyle = '#ffffff';

      for (let i = 0; i < canvas.width * canvas.height * visualEffects.noiseIntensity; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        ctx.fillRect(x, y, 1, 1);
      }

      ctx.globalAlpha = 1;
    }

    if (Math.random() < 0.02) {
      visualEffects.glitchEffect = true;
      playGlitchSound();
    }
  };

  useEffect(() => {
    drawGame();
  }, [snake, food, direction]);

  return (
    <canvas
      ref={canvasRef}
      id="gameCanvas"
      width={config.canvasWidth}
      height={config.canvasHeight}
    />
  );
};

export default GameCanvas;
