import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

interface CatchBambooProps {
  onBack: () => void;
  onFinish: (score: number, coins: number, xp: number) => void;
  highScore: number;
}

interface GameObject {
  x: number;
  y: number;
  type: 'bamboo' | 'golden' | 'bomb';
  speed: number;
  width: number;
  height: number;
}

export default function CatchBamboo({ onBack, onFinish, highScore }: CatchBambooProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lives, setLives] = useState(3);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playerRef = useRef({ x: 150, y: 380, width: 50, height: 50, speed: 8 });
  const objectsRef = useRef<GameObject[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const animationFrameRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number>(0);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const gameStateRef = useRef<'idle' | 'playing' | 'gameover'>('idle');
  const touchTargetRef = useRef<number | null>(null);

  // Keep refs synced
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const playSound = useCallback((type: 'collect' | 'bomb' | 'gameover') => {
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

      if (type === 'collect') {
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
        osc.start(); osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'bomb') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
        osc.start(); osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
      }
    } catch { /* blocked */ }
  }, [soundEnabled]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const up = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const touchX = (e.touches[0].clientX - rect.left) * scaleX;
      touchTargetRef.current = touchX - playerRef.current.width / 2;
    };
    const handleTouchEnd = () => { touchTargetRef.current = null; };

    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    return () => {
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Main Game Loop
  const updateGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameStateRef.current !== 'playing') return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 137.5) % canvas.width;
      const sy = (i * 73.1) % (canvas.height * 0.6);
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground
    ctx.fillStyle = '#2d6a4f';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    ctx.fillStyle = '#40916c';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 4);

    // Move Player
    const player = playerRef.current;
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
      player.x = Math.max(0, player.x - player.speed);
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
      player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }

    // Touch movement
    if (touchTargetRef.current !== null) {
      const diff = touchTargetRef.current - player.x;
      if (Math.abs(diff) > 3) {
        player.x += Math.sign(diff) * Math.min(Math.abs(diff), player.speed * 1.5);
      }
    }

    // Draw Player (basket)
    const bx = player.x;
    const by = player.y;
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(bx + 5, by + 10);
    ctx.lineTo(bx + player.width - 5, by + 10);
    ctx.lineTo(bx + player.width - 10, by + player.height);
    ctx.lineTo(bx + 10, by + player.height);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Basket handle
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bx + player.width / 2, by + 5, 15, Math.PI, 0);
    ctx.stroke();

    // Panda face in basket
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bx + player.width / 2, by + 25, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(bx + player.width / 2 - 5, by + 23, 2.5, 0, Math.PI * 2);
    ctx.arc(bx + player.width / 2 + 5, by + 23, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(bx + player.width / 2, by + 28, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Spawn Objects
    spawnTimerRef.current++;
    const spawnRate = Math.max(20, 45 - Math.floor(scoreRef.current / 50) * 5);
    if (spawnTimerRef.current > spawnRate) {
      spawnTimerRef.current = 0;
      const r = Math.random();
      let type: 'bamboo' | 'golden' | 'bomb' = 'bamboo';
      if (r > 0.82) type = 'bomb';
      else if (r > 0.7) type = 'golden';

      objectsRef.current.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        type,
        speed: 2.5 + Math.random() * 2.5 + scoreRef.current * 0.01,
        width: 28,
        height: 28,
      });
    }

    // Update & Draw Objects
    const objects = objectsRef.current;
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      obj.y += obj.speed;

      // Draw
      ctx.save();
      if (obj.type === 'bamboo') {
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(obj.x + 11, obj.y, 6, obj.height);
        ctx.fillStyle = '#52b788';
        ctx.fillRect(obj.x + 6, obj.y + 4, 5, 8);
        ctx.fillRect(obj.x + 17, obj.y + 12, 5, 8);
      } else if (obj.type === 'golden') {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(obj.x + 14, obj.y + 14, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐', obj.x + 14, obj.y + 18);
      } else if (obj.type === 'bomb') {
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(obj.x + 14, obj.y + 14, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💣', obj.x + 14, obj.y + 18);
      }
      ctx.restore();

      // Collision
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const ox = obj.x + obj.width / 2;
      const oy = obj.y + obj.height / 2;
      const dist = Math.hypot(px - ox, py - oy);

      if (dist < (player.width / 2 + obj.width / 2 - 4)) {
        if (obj.type === 'bamboo') {
          setScore(s => s + 10);
          playSound('collect');
        } else if (obj.type === 'golden') {
          setScore(s => s + 50);
          playSound('collect');
        } else if (obj.type === 'bomb') {
          setLives(l => {
            const next = l - 1;
            if (next <= 0) {
              setGameState('gameover');
              playSound('gameover');
            }
            return next;
          });
          playSound('bomb');
        }
        objects.splice(i, 1);
        continue;
      }

      if (obj.y > canvas.height) {
        objects.splice(i, 1);
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateGame);
  }, [playSound]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setLives(3);
    setGameState('playing');
    objectsRef.current = [];
    playerRef.current.x = 150;
    spawnTimerRef.current = 0;
  };

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('gameover');
          playSound('gameover');
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, playSound]);

  // Rewards on gameover
  useEffect(() => {
    if (gameState === 'gameover') {
      onFinish(scoreRef.current, Math.floor(scoreRef.current / 5), Math.floor(scoreRef.current / 2));
    }
  }, [gameState, onFinish]);

  // Game loop trigger
  useEffect(() => {
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, updateGame]);

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
              🎋 {score}
            </div>
            <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold">
              ⏱ {timeLeft}s
            </div>
            <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold flex gap-0.5">
              {Array.from({ length: lives }).map((_, i) => (
                <span key={i}>❤️</span>
              ))}
            </div>
          </div>
        )}

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-10">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel p-6 rounded-3xl max-w-xs space-y-4 text-center">
              <h2 className="text-xl font-bold font-serif text-[var(--color-text-main)]">Catch the Bamboo! 🎋</h2>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Swipe or use arrow keys to move. Catch 🎋 bamboo & ⭐ golden items. Avoid 💣 bombs!
              </p>
              <div className="text-sm font-semibold text-[var(--color-accent-primary)]">
                High Score: {highScore} pts
              </div>
              <button onClick={startGame} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
                <Play className="w-5 h-5 fill-current" /> Play
              </button>
            </motion.div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 z-10">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel p-6 rounded-3xl max-w-xs space-y-4 text-center">
              <h2 className="text-xl font-bold font-serif text-rose-500">Game Over!</h2>
              <div className="text-lg font-bold text-[var(--color-text-main)]">Score: {score}</div>
              {score > highScore && <div className="text-xs text-green-500 font-bold animate-bounce">🎉 New High Score!</div>}
              <div className="border-t border-[var(--color-border-glass)] pt-3 flex justify-around text-xs font-bold text-[var(--color-text-main)]">
                <span>🪙 +{Math.floor(score / 5)}</span>
                <span>⭐ +{Math.floor(score / 2)} XP</span>
              </div>
              <button onClick={startGame} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
