let audioContext = null;

export function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

export function playSound(frequency, duration, type = 'sine', volume = 0.2, sweep = false, sweepAmount = 0) {
  const ctx = initAudioContext();
  
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      playSound(frequency, duration, type, volume, sweep, sweepAmount);
    });
    return;
  }
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  if (sweep) {
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency + sweepAmount,
      ctx.currentTime + duration
    );
  }
  
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export function playStartSound() {
  playSound(880, 0.15, 'sawtooth', 0.3, true, 200);
  setTimeout(() => playSound(1318, 0.2, 'sawtooth', 0.4, true, 100), 80);
}

export function playEatSound() {
  playSound(2093, 0.1, 'square', 0.3);
  setTimeout(() => playSound(2794, 0.08, 'square', 0.25), 40);
}

export function playLevelUpSound() {
  playSound(1046, 0.08, 'sawtooth', 0.3);
  setTimeout(() => playSound(1397, 0.08, 'sawtooth', 0.35), 60);
  setTimeout(() => playSound(1760, 0.1, 'sawtooth', 0.4), 120);
  setTimeout(() => playSound(2217, 0.15, 'sawtooth', 0.45, true, 150), 180);
}

export function playGameOverSound() {
  playSound(330, 0.3, 'sawtooth', 0.35, true, -150);
  setTimeout(() => playSound(220, 0.2, 'square', 0.3), 100);
  setTimeout(() => playSound(110, 0.4, 'sawtooth', 0.25), 200);
}

export function playGlitchSound() {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const randomFreq = Math.random() * 1000 + 1000;
      playSound(randomFreq, 0.05, 'square', 0.3);
    }, i * 20);
  }
}
