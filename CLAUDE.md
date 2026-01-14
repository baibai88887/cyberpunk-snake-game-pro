# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

This is a pure HTML/CSS/JavaScript game with no build process. To run locally:

```bash
# Using Python's built-in HTTP server (recommended)
python3 -m http.server 8080

# Then open http://localhost:8080 in your browser
```

VSCode launch configuration is set to debug on `http://localhost:8080`.

## Architecture

This is a single-page canvas-based game with a cyberpunk aesthetic. The architecture consists of three main files:

- **index.html**: DOM structure for the game container, canvas, UI controls, and modals
- **style.css**: Cyberpunk visual styling with neon effects, animations, and responsive design
- **script.js**: Complete game logic including game loop, rendering, audio system, and event handling

### Game Loop Architecture

The game uses `setInterval` for the main loop (not `requestAnimationFrame`). Key components:

- **config**: Global game settings (grid size, canvas dimensions, speed values) [script.js:2-9](script.js#L2-L9)
- **gameState**: Single source of truth for all game state (snake position, direction, score, flags) [script.js:98-109](script.js#L98-L109)
- **gameLoop()**: Main tick function that calls `updateSnake()` and `drawGame()` [script.js:499-504](script.js#L499-L504)
- **visualEffects**: Controls cyberpunk visual effects (glitch, flash, noise, pulse) [script.js:177-190](script.js#L177-L190)

### Rendering System

The Canvas rendering uses a cyberpunk color scheme:
- Primary colors: Neon cyan (#00ffff) and neon magenta (#ff00ff)
- Snake head: Cyan gradient with pink eyes and glow effects
- Food: Magenta circle with pulsing glow
- Background: Dark gradient with animated grid lines, CRT scanlines, and static noise

Visual effects are randomly triggered during the draw cycle:
- **glitchEffect**: Random horizontal glitch lines with sound effect (2% chance per frame)
- **foodFlash**: Flashes when food is eaten
- **pulseEffect**: Continuous color pulse on background
- **staticNoise**: Static noise overlay (always active)

### Audio System

Uses Web Audio API with synthetic sounds (no audio files). Key functions:
- `playSound()`: Generic oscillator-based sound generator with optional frequency sweep [script.js:21-58](script.js#L21-L58)
- Audio context is initialized on first user interaction (browser security requirement)
- Sound types: start (sawtooth sweep), eat (square), level-up (sawtooth sequence), game-over (descending sawtooth), glitch (random square)

### State Management

Game flow states are controlled via `gameState.isRunning` and `gameState.isPaused`:
- **Not running**: Initial state, buttons: Start enabled, Pause/Restart disabled
- **Running**: Game loop active, buttons: Start disabled, Pause/Restart enabled
- **Paused**: `isPaused=true`, game loop continues but doesn't update
- **Game Over**: Modal displayed, loop cleared, Play Again button active

### Collision Detection

Implemented in `checkCollision()` [script.js:448-466](script.js#L448-L466):
- Checks canvas boundaries (0 to canvasWidth/gridSize)
- Checks if new head position overlaps any existing snake segment
- Returns true to trigger `gameOver()`

### Direction Control

Uses `gameState.direction` for current frame and `gameState.nextDirection` for queued input:
- Prevents 180-degree turns (can't go up if moving down)
- Queue system prevents rapid-fire input bugs
- Keyboard shortcuts: Arrow keys for direction, Space for pause, Enter to start

### Level System

- Base speed: 150ms per tick
- Speed decrement: 10ms per level
- Minimum speed: 50ms per tick
- Level up: Every 50 points (5 food items)
- When leveling up, the existing `setInterval` is cleared and recreated with new speed

## Visual Style Notes

When making UI changes, maintain the cyberpunk aesthetic:
- Use `Courier New` or monospace fonts
- Colors: #00ffff (cyan), #ff00ff (magenta), black/dark purple backgrounds
- Add `box-shadow` and `text-shadow` for glow effects
- Use sharp corners (border-radius: 0), no rounded edges
- CSS animations should be subtle and continuous (borderGlow, pulse, glitchText)
