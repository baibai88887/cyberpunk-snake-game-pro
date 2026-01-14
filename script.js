// 游戏配置
const config = {
    gridSize: 20,
    canvasWidth: 350,
    canvasHeight: 350,
    initialSpeed: 150,
    speedIncrement: 10,
    maxSpeed: 50,
    highScoresKey: 'snakeGameHighScores',
    maxHighScores: 10
};

// 分数存储功能
function getHighScores() {
    try {
        const scores = localStorage.getItem(config.highScoresKey);
        return scores ? JSON.parse(scores) : [];
    } catch (error) {
        console.error('获取高分失败:', error);
        return [];
    }
}

function saveHighScore(score, level) {
    try {
        const highScores = getHighScores();
        const newScore = {
            score: score,
            level: level,
            date: new Date().toISOString()
        };
        
        // 添加新分数
        highScores.push(newScore);
        
        // 按分数排序（降序）
        highScores.sort((a, b) => b.score - a.score);
        
        // 只保留前N名
        const topScores = highScores.slice(0, config.maxHighScores);
        
        // 保存到localStorage
        localStorage.setItem(config.highScoresKey, JSON.stringify(topScores));
        
        return true;
    } catch (error) {
        console.error('保存高分失败:', error);
        return false;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// 更新排行榜显示
function updateLeaderboard() {
    const leaderboardElement = document.getElementById('leaderboard');
    const highScores = getHighScores();
    
    // 清空现有内容
    leaderboardElement.innerHTML = '';
    
    if (highScores.length === 0) {
        // 显示空状态
        leaderboardElement.innerHTML = '<div class="leaderboard-empty">暂无记录</div>';
        return;
    }
    
    // 创建排行榜条目
    highScores.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        item.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-score">${score.score}</div>
            <div class="leaderboard-level">Lv${score.level}</div>
            <div class="leaderboard-date">${formatDate(score.date)}</div>
        `;
        
        leaderboardElement.appendChild(item);
    });
}

// 音效系统
let audioContext = null;

// 初始化音频上下文（在用户交互时）
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(frequency, duration, type = 'sine', volume = 0.2, sweep = false, sweepAmount = 0) {
    // 确保音频上下文已初始化
    initAudioContext();
    
    if (!audioContext) return;
    
    // 确保音频上下文是运行状态
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            playSound(frequency, duration, type, volume, sweep, sweepAmount);
        });
        return;
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // 添加频率扫描效果
    if (sweep) {
        oscillator.frequency.exponentialRampToValueAtTime(
            frequency + sweepAmount,
            audioContext.currentTime + duration
        );
    }
    
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playStartSound() {
    // 赛博朋克风格启动音效 - 快速上升的sawtooth波
    playSound(880, 0.15, 'sawtooth', 0.3, true, 200);
    setTimeout(() => playSound(1318, 0.2, 'sawtooth', 0.4, true, 100), 80);
}

function playEatSound() {
    // 赛博朋克风格吃食物音效 - 尖锐的square波
    playSound(2093, 0.1, 'square', 0.3);
    setTimeout(() => playSound(2794, 0.08, 'square', 0.25), 40);
}

function playLevelUpSound() {
    // 赛博朋克风格升级音效 - 复杂的频率序列
    playSound(1046, 0.08, 'sawtooth', 0.3);
    setTimeout(() => playSound(1397, 0.08, 'sawtooth', 0.35), 60);
    setTimeout(() => playSound(1760, 0.1, 'sawtooth', 0.4), 120);
    setTimeout(() => playSound(2217, 0.15, 'sawtooth', 0.45, true, 150), 180);
}

function playGameOverSound() {
    // 赛博朋克风格游戏结束音效 - 故障感的sawtooth波
    playSound(330, 0.3, 'sawtooth', 0.35, true, -150);
    setTimeout(() => playSound(220, 0.2, 'square', 0.3), 100);
    setTimeout(() => playSound(110, 0.4, 'sawtooth', 0.25), 200);
}

function playGlitchSound() {
    // 赛博朋克风格故障音效
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const randomFreq = Math.random() * 1000 + 1000;
            playSound(randomFreq, 0.05, 'square', 0.3);
        }, i * 20);
    }
}

// 游戏状态
let gameState = {
    snake: [],
    direction: 'right',
    nextDirection: 'right',
    food: {},
    score: 0,
    level: 1,
    speed: config.initialSpeed,
    isRunning: false,
    isPaused: false,
    gameLoop: null
};

// DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreElement = document.getElementById('finalScore');
const finalLevelElement = document.getElementById('finalLevel');
const playAgainBtn = document.getElementById('playAgainBtn');

// 初始化游戏
function initGame() {
    // 初始化蛇
    gameState.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    // 初始化方向
    gameState.direction = 'right';
    gameState.nextDirection = 'right';
    
    // 生成食物
    generateFood();
    
    // 初始化分数和等级
    gameState.score = 0;
    gameState.level = 1;
    gameState.speed = config.initialSpeed;
    
    // 更新UI
    updateScore();
    updateLevel();
    
    // 绘制初始状态
    drawGame();
}

// 生成食物
function generateFood() {
    let newFood;
    let collision;
    
    do {
        collision = false;
        newFood = {
            x: Math.floor(Math.random() * (config.canvasWidth / config.gridSize)),
            y: Math.floor(Math.random() * (config.canvasHeight / config.gridSize))
        };
        
        // 检查食物是否生成在蛇身上
        for (let segment of gameState.snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                collision = true;
                break;
            }
        }
    } while (collision);
    
    gameState.food = newFood;
}

// 视觉效果配置
let visualEffects = {
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
};

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 颜色脉冲效果
    if (visualEffects.pulseEffect) {
        visualEffects.pulseCounter += visualEffects.pulseSpeed;
        const pulseValue = Math.sin(visualEffects.pulseCounter) * 0.1 + 0.9;

        // 应用脉冲效果到背景
        const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGradient.addColorStop(0, `rgba(0, 0, 0, ${0.95 + pulseValue * 0.05})`);
        bgGradient.addColorStop(0.5, `rgba(5, 5, 25, ${0.95 + pulseValue * 0.05})`);
        bgGradient.addColorStop(1, `rgba(10, 0, 30, ${0.95 + pulseValue * 0.05})`);

        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // 常规深色背景
        const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
        bgGradient.addColorStop(0.5, 'rgba(5, 5, 25, 0.95)');
        bgGradient.addColorStop(1, 'rgba(10, 0, 30, 0.95)');

        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 绘制赛博朋克风格网格线
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

    // 绘制对角线装饰网格
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 0.3;
    ctx.globalAlpha = 0.15;
    for (let i = -config.canvasWidth; i <= config.canvasWidth * 2; i += config.gridSize * 2) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + config.canvasHeight, config.canvasHeight);
        ctx.stroke();
    }

    // 绘制发光点在网格交叉处
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
    
    // 绘制食物（赛博朋克霓虹效果）
    if (visualEffects.foodFlash) {
        ctx.fillStyle = visualEffects.flashCounter % 2 === 0 ? '#ff00ff' : '#ff66ff';
        visualEffects.flashCounter++;

        // 添加食物发光效果
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

    // 绘制食物外发光圈
    ctx.beginPath();
    ctx.arc(
        gameState.food.x * config.gridSize + config.gridSize / 2,
        gameState.food.y * config.gridSize + config.gridSize / 2,
        config.gridSize / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // 绘制食物内核
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(
        gameState.food.x * config.gridSize + config.gridSize / 2,
        gameState.food.y * config.gridSize + config.gridSize / 2,
        config.gridSize / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // 绘制食物周围的能量环
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    const foodX = gameState.food.x * config.gridSize + config.gridSize / 2;
    const foodY = gameState.food.y * config.gridSize + config.gridSize / 2;
    for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath();
        ctx.arc(foodX, foodY, config.gridSize / 2 + 3 + ring * 3, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 重置阴影
    ctx.shadowBlur = 0;
    
    // 绘制蛇（赛博朋克霓虹效果）
    for (let i = 0; i < gameState.snake.length; i++) {
        const segment = gameState.snake[i];
        const opacity = 0.4 + (i / gameState.snake.length) * 0.6;

        if (i === 0) {
            // 蛇头 - 霓虹蓝色渐变
            const gradient = ctx.createLinearGradient(
                segment.x * config.gridSize + 1,
                segment.y * config.gridSize + 1,
                segment.x * config.gridSize + config.gridSize - 1,
                segment.y * config.gridSize + config.gridSize - 1
            );
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(0.5, '#0099ff');
            gradient.addColorStop(1, '#0055ff');

            // 添加蛇头发光效果
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#00ffff';

            ctx.fillStyle = gradient;
            ctx.fillRect(
                segment.x * config.gridSize + 1,
                segment.y * config.gridSize + 1,
                config.gridSize - 2,
                config.gridSize - 2
            );

            // 蛇头边框 - 发光效果
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                segment.x * config.gridSize + 1,
                segment.y * config.gridSize + 1,
                config.gridSize - 2,
                config.gridSize - 2
            );

            // 绘制蛇眼 - 霓虹粉色
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

            // 蛇眼高光
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

            // 蛇头装饰 - 科技感线条
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff00ff';
            ctx.beginPath();
            ctx.moveTo(segment.x * config.gridSize + config.gridSize / 2, segment.y * config.gridSize + 1);
            ctx.lineTo(segment.x * config.gridSize + config.gridSize / 2, segment.y * config.gridSize + config.gridSize / 2);
            ctx.stroke();
        } else {
            // 蛇身 - 霓虹蓝色，透明度渐变
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

            // 蛇身边框 - 细线
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
    
    // 重置阴影
    ctx.shadowBlur = 0;
    
    // 故障艺术效果
    if (visualEffects.glitchEffect) {
        visualEffects.glitchCounter++;
        
        for (let i = 0; i < visualEffects.maxGlitch; i++) {
            const glitchX = Math.random() * canvas.width;
            const glitchY = Math.random() * canvas.height;
            const glitchWidth = Math.random() * 20 + 5;
            const glitchHeight = Math.random() * 5 + 2;
            
            // 随机选择故障颜色
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
    
    // 静态噪点效果
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
    
    // 随机触发故障效果
    if (Math.random() < 0.02) {
        visualEffects.glitchEffect = true;
        playGlitchSound();
    }
}

// 更新蛇的位置
function updateSnake() {
    // 获取蛇头位置
    const head = { ...gameState.snake[0] };
    
    // 更新蛇头位置
    switch (gameState.direction) {
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
    
    // 更新方向
    gameState.direction = gameState.nextDirection;
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 添加新的蛇头
    gameState.snake.unshift(head);
    
    // 检查是否吃到食物
        if (head.x === gameState.food.x && head.y === gameState.food.y) {
            // 播放吃食物音效
            playEatSound();
            
            // 触发食物闪光效果
            visualEffects.foodFlash = true;
            visualEffects.flashCounter = 0;
            
            // 增加分数
            gameState.score += 10;
            updateScore();
            
            // 检查升级
            if (gameState.score % 50 === 0) {
                levelUp();
            }
            
            // 生成新食物
            generateFood();
        } else {
            // 移除蛇尾
            gameState.snake.pop();
        }
}

// 检查碰撞
function checkCollision(head) {
    // 检查边界碰撞
    if (head.x < 0 || 
        head.x >= config.canvasWidth / config.gridSize || 
        head.y < 0 || 
        head.y >= config.canvasHeight / config.gridSize) {
        return true;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 升级
function levelUp() {
    gameState.level++;
    updateLevel();
    
    // 播放升级音效
    playLevelUpSound();
    
    // 增加游戏速度
    if (gameState.speed > config.maxSpeed) {
        gameState.speed = Math.max(config.maxSpeed, gameState.speed - config.speedIncrement);
        
        // 重新设置游戏循环
        if (gameState.gameLoop) {
            clearInterval(gameState.gameLoop);
            gameState.gameLoop = setInterval(gameLoop, gameState.speed);
        }
    }
}

// 更新分数
function updateScore() {
    scoreElement.textContent = gameState.score;
}

// 更新等级
function updateLevel() {
    levelElement.textContent = gameState.level;
}

// 游戏循环
function gameLoop() {
    if (!gameState.isPaused && gameState.isRunning) {
        updateSnake();
        drawGame();
    }
}

// 开始游戏
function startGame() {
    if (!gameState.isRunning) {
        // 恢复音频上下文（浏览器安全限制）
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        gameState.isRunning = true;
        gameState.isPaused = false;
        
        // 播放开始音效
        playStartSound();
        
        // 启动游戏循环
        gameState.gameLoop = setInterval(gameLoop, gameState.speed);
        
        // 更新按钮状态
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        restartBtn.disabled = false;
    }
}

// 暂停游戏
function pauseGame() {
    if (gameState.isRunning && !gameState.isPaused) {
        gameState.isPaused = true;
        pauseBtn.textContent = '继续游戏';
    } else if (gameState.isRunning && gameState.isPaused) {
        gameState.isPaused = false;
        pauseBtn.textContent = '暂停游戏';
    }
}

// 重新开始游戏
function restartGame() {
    // 清除游戏循环
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    }
    
    // 重置游戏状态
    gameState.isRunning = false;
    gameState.isPaused = false;
    
    // 重新初始化游戏
    initGame();
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    restartBtn.disabled = true;
    pauseBtn.textContent = '暂停游戏';
    
    // 隐藏游戏结束模态框
    gameOverModal.style.display = 'none';
}

// 游戏结束
function gameOver() {
    // 清除游戏循环
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    }
    
    // 播放游戏结束音效
    playGameOverSound();
    
    // 更新游戏状态
    gameState.isRunning = false;
    
    // 保存当前分数
    saveHighScore(gameState.score, gameState.level);
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    restartBtn.disabled = false;
    pauseBtn.textContent = '暂停游戏';
    
    // 显示游戏结束模态框
    finalScoreElement.textContent = gameState.score;
    finalLevelElement.textContent = gameState.level;
    gameOverModal.style.display = 'block';
    
    // 更新排行榜显示
    updateLeaderboard();
}

// 键盘事件处理
function handleKeyPress(event) {
    const key = event.key;
    
    // 只在游戏运行时处理方向键
    if (gameState.isRunning) {
        switch (key) {
            case 'ArrowUp':
                if (gameState.direction !== 'down') {
                    gameState.nextDirection = 'up';
                }
                break;
            case 'ArrowDown':
                if (gameState.direction !== 'up') {
                    gameState.nextDirection = 'down';
                }
                break;
            case 'ArrowLeft':
                if (gameState.direction !== 'right') {
                    gameState.nextDirection = 'left';
                }
                break;
            case 'ArrowRight':
                if (gameState.direction !== 'left') {
                    gameState.nextDirection = 'right';
                }
                break;
            case ' ': // 空格键暂停/继续
                event.preventDefault();
                pauseGame();
                break;
        }
    } else if (key === 'Enter') {
        // 按Enter键开始游戏
        startGame();
    }
}

// 初始化事件监听
function initEventListeners() {
    // 按钮事件
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', restartGame);
    
    // 键盘事件
    document.addEventListener('keydown', handleKeyPress);
    
    // 防止页面滚动
    document.addEventListener('keydown', (event) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
    });
}

// 游戏初始化
function init() {
    initGame();
    initEventListeners();
    updateLeaderboard(); // 初始化时显示排行榜
    console.log('贪吃蛇游戏已初始化，按Enter键开始游戏或点击开始按钮');
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', init);

// 确保音频上下文在用户交互时初始化（浏览器安全限制）
window.addEventListener('click', initAudioContext);
window.addEventListener('keydown', initAudioContext);