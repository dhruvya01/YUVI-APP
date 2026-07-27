import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

interface PandaRunnerProps {
  onBack: () => void;
  onFinish: (score: number, coins: number, xp: number) => void;
  highScore: number;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: 'rock' | 'spike' | 'bamboo';
  passed: boolean;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

export default function PandaRunner({ onBack, onFinish, highScore }: PandaRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [displayScore, setDisplayScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const gameRef = useRef({
    panda: { x: 50, y: 300, vy: 0, width: 35, height: 35, grounded: true },
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    score: 0,
    speed: 4,
    groundY: 340,
    frameCount: 0,
    spawnTimer: 0,
    coinSpawnTimer: 0,
    running: false,
  });

  const animFrameRef = useRef<number | null>(null);

  const playSound = useCallback((type: 'jump' | 'coin' | 'hit' | 'milestone') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      if (type === 'jump') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
        osc.start(); osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'coin') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.06);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
        osc.start(); osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.15);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
      }
    } catch { /* blocked */ }
  }, [soundEnabled]);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g.running) return;
    if (g.panda.grounded) {
      g.panda.vy = -11;
      g.panda.grounded = false;
      playSound('jump');
    }
  }, [playSound]);

  // Input handlers
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('mousedown', jump);
    return () => {
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('mousedown', jump);
    };
  }, [jump]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const g = gameRef.current;
    if (!g.running) return;

    g.frameCount++;

    // Speed increases over time
    g.speed = 4 + Math.floor(g.score / 100) * 0.5;
    if (g.speed > 12) g.speed = 12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#0f0c29');
    sky.addColorStop(0.5, '#302b63');
    sky.addColorStop(1, '#24243e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 25; i++) {
      const sx = ((i * 149.7 + g.frameCount * 0.1) % canvas.width);
      const sy = (i * 67.3) % (g.groundY * 0.5);
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8 + (i % 3) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mountains (parallax)
    ctx.fillStyle = '#1a1a3e';
    for (let i = 0; i < 5; i++) {
      const mx = ((i * 120 - g.frameCount * 0.3) % (canvas.width + 200)) - 100;
      ctx.beginPath();
      ctx.moveTo(mx, g.groundY);
      ctx.lineTo(mx + 60, g.groundY - 80 - (i % 3) * 30);
      ctx.lineTo(mx + 120, g.groundY);
      ctx.fill();
    }

    // Ground
    ctx.fillStyle = '#2d6a4f';
    ctx.fillRect(0, g.groundY, canvas.width, canvas.height - g.groundY);
    ctx.fillStyle = '#52b788';
    ctx.fillRect(0, g.groundY, canvas.width, 3);

    // Moving ground lines
    ctx.strokeStyle = 'rgba(64,145,108,0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const lx = ((i * 60 - g.frameCount * g.speed) % canvas.width + canvas.width) % canvas.width;
      ctx.beginPath();
      ctx.moveTo(lx, g.groundY + 10);
      ctx.lineTo(lx + 20, g.groundY + 10);
      ctx.stroke();
    }

    // Physics for panda
    g.panda.vy += 0.6; // gravity
    g.panda.y += g.panda.vy;

    if (g.panda.y >= g.groundY - g.panda.height) {
      g.panda.y = g.groundY - g.panda.height;
      g.panda.vy = 0;
      g.panda.grounded = true;
    }

    // Draw Panda
    const p = g.panda;
    ctx.save();
    // Body
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ears
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(p.x + 6, p.y + 4, 6, 0, Math.PI * 2);
    ctx.arc(p.x + p.width - 6, p.y + 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Eye patches
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(p.x + 11, p.y + 14, 5, 6, -0.2, 0, Math.PI * 2);
    ctx.ellipse(p.x + p.width - 11, p.y + 14, 5, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.x + 12, p.y + 13, 2, 0, Math.PI * 2);
    ctx.arc(p.x + p.width - 12, p.y + 13, 2, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(p.x + p.width / 2, p.y + 20, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blush
    ctx.fillStyle = 'rgba(255,150,150,0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x + 6, p.y + 20, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(p.x + p.width - 6, p.y + 20, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Running legs animation
    const legOffset = Math.sin(g.frameCount * 0.3) * 4;
    ctx.fillStyle = '#333';
    ctx.fillRect(p.x + 8, p.y + p.height - 2, 6, 4 + legOffset);
    ctx.fillRect(p.x + p.width - 14, p.y + p.height - 2, 6, 4 - legOffset);

    ctx.restore();

    // Spawn obstacles
    g.spawnTimer++;
    const spawnRate = Math.max(50, 100 - Math.floor(g.score / 50) * 5);
    if (g.spawnTimer > spawnRate) {
      g.spawnTimer = 0;
      const r = Math.random();
      const type: 'rock' | 'spike' | 'bamboo' = r > 0.7 ? 'spike' : r > 0.4 ? 'bamboo' : 'rock';
      const h = type === 'spike' ? 20 : type === 'bamboo' ? 45 : 25;
      const w = type === 'spike' ? 15 : type === 'bamboo' ? 12 : 20;
      g.obstacles.push({
        x: canvas.width + 20,
        width: w,
        height: h,
        type,
        passed: false,
      });
    }

    // Spawn coins
    g.coinSpawnTimer++;
    if (g.coinSpawnTimer > 70) {
      g.coinSpawnTimer = 0;
      if (Math.random() > 0.4) {
        g.coins.push({
          x: canvas.width + 20,
          y: g.groundY - 60 - Math.random() * 50,
          collected: false,
        });
      }
    }

    // Update & draw obstacles
    for (let i = g.obstacles.length - 1; i >= 0; i--) {
      const obs = g.obstacles[i];
      obs.x -= g.speed;

      // Draw obstacle
      ctx.save();
      if (obs.type === 'rock') {
        ctx.fillStyle = '#6b705c';
        ctx.beginPath();
        ctx.moveTo(obs.x, g.groundY);
        ctx.lineTo(obs.x + obs.width / 2, g.groundY - obs.height);
        ctx.lineTo(obs.x + obs.width, g.groundY);
        ctx.fill();
        ctx.fillStyle = '#8a8f7a';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, g.groundY - obs.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'spike') {
        ctx.fillStyle = '#e63946';
        for (let s = 0; s < 3; s++) {
          ctx.beginPath();
          ctx.moveTo(obs.x + s * 6, g.groundY);
          ctx.lineTo(obs.x + s * 6 + 3, g.groundY - obs.height);
          ctx.lineTo(obs.x + s * 6 + 6, g.groundY);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(obs.x, g.groundY - obs.height, obs.width, obs.height);
        ctx.fillStyle = '#52b788';
        // leaves
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width, g.groundY - obs.height + 8, 8, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(obs.x, g.groundY - obs.height + 15, 7, 3.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Collision
      const pRight = p.x + p.width - 5;
      const pBottom = p.y + p.height;
      const oLeft = obs.x;
      const oRight = obs.x + obs.width;
      const oTop = g.groundY - obs.height;

      if (pRight > oLeft + 3 && p.x + 5 < oRight && pBottom > oTop + 3) {
        // Hit!
        g.running = false;
        playSound('hit');
        setGameState('gameover');
        setDisplayScore(g.score);
        onFinish(g.score, Math.floor(g.score / 8), Math.floor(g.score / 3));
        return;
      }

      // Score for passing
      if (!obs.passed && obs.x + obs.width < p.x) {
        obs.passed = true;
        g.score += 10;
        setDisplayScore(g.score);
        if (g.score % 100 === 0) playSound('milestone');
      }

      // Remove offscreen
      if (obs.x < -50) {
        g.obstacles.splice(i, 1);
      }
    }

    // Update & draw coins
    for (let i = g.coins.length - 1; i >= 0; i--) {
      const coin = g.coins[i];
      coin.x -= g.speed;

      if (!coin.collected) {
        // Draw coin
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦', coin.x, coin.y + 4);

        // Collision
        const dist = Math.hypot((p.x + p.width / 2) - coin.x, (p.y + p.height / 2) - coin.y);
        if (dist < 22) {
          coin.collected = true;
          g.score += 25;
          setDisplayScore(g.score);
          playSound('coin');
        }
      }

      if (coin.x < -20) {
        g.coins.splice(i, 1);
      }
    }

    // Distance score
    if (g.frameCount % 10 === 0) {
      g.score += 1;
      setDisplayScore(g.score);
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [playSound, onFinish]);

  const startGame = () => {
    const g = gameRef.current;
    g.panda = { x: 50, y: 300, vy: 0, width: 35, height: 35, grounded: true };
    g.obstacles = [];
    g.coins = [];
    g.score = 0;
    g.speed = 4;
    g.frameCount = 0;
    g.spawnTimer = 0;
    g.coinSpawnTimer = 0;
    g.running = true;
    setDisplayScore(0);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing') {
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, gameLoop]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg flex justify-between items-center mb-3 relative z-20">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-full text-sm text-[var(--color-text-main)] hover:bg-black/10">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 glass-panel rounded-full hover:bg-black/10">
          {soundEnabled ? <Volume2 className="w-4 h-4 text-green-500" /> : <VolumeX className="w-4 h-4 text-red-500" />}
        </button>
      </div>

      <div className="relative glass-panel rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border-glass)] w-full max-w-md aspect-[4/5]">
        <canvas ref={canvasRef} width={360} height={450} className="w-full h-full block touch-none" />

        {gameState === 'playing' && (
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none z-10">
            <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold">
              🏃 {displayScore}
            </div>
            <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-[10px] font-medium">
              Tap to Jump!
            </div>
          </div>
        )}

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-10">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel p-6 rounded-3xl max-w-xs space-y-4 text-center">
              <h2 className="text-xl font-bold font-serif text-[var(--color-text-main)]">Panda Runner! 🏃</h2>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Tap or press Space to jump over obstacles. Collect golden coins for bonus points!
              </p>
              <div className="text-sm font-semibold text-[var(--color-accent-primary)]">
                High Score: {highScore} pts
              </div>
              <button onClick={startGame} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
                <Play className="w-5 h-5 fill-current" /> Run!
              </button>
            </motion.div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 z-10">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel p-6 rounded-3xl max-w-xs space-y-4 text-center">
              <h2 className="text-xl font-bold font-serif text-rose-500">Crashed! 💥</h2>
              <div className="text-lg font-bold text-[var(--color-text-main)]">Score: {displayScore}</div>
              {displayScore > highScore && <div className="text-xs text-green-500 font-bold animate-bounce">🎉 New High Score!</div>}
              <div className="border-t border-[var(--color-border-glass)] pt-3 flex justify-around text-xs font-bold text-[var(--color-text-main)]">
                <span>🪙 +{Math.floor(displayScore / 8)}</span>
                <span>⭐ +{Math.floor(displayScore / 3)} XP</span>
              </div>
              <button onClick={startGame} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
                <RotateCcw className="w-4 h-4" /> Run Again
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
