import { useEffect, useRef, useState } from 'react';
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
  type: 'bamboo' | 'golden' | 'bomb' | 'rock';
  speed: number;
  width: number;
  height: number;
}

export default function CatchBamboo({ onBack, onFinish, highScore }: CatchBambooProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lives, setLives] = useState(3);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Game loop variables
  const playerRef = useRef({ x: 200, y: 340, width: 60, height: 60, speed: 8 });
  const objectsRef = useRef<GameObject[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const animationFrameRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<number>(0);

  // Initialize Audio
  const playSound = (type: 'collect' | 'bomb' | 'gameover') => {
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'bomb') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'gameover') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      // Audio Context blocked or unsupported
    }
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Game Loop
  const updateGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Background Drawing
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#e2f0d9');
    gradient.addColorStop(1, '#a8d5ba');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Move Player
    const player = playerRef.current;
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
      player.x = Math.max(0, player.x - player.speed);
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
      player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }

    // 4. Draw Player (Mochi Panda illustration)
    ctx.save();
    // Head/body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2 - 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2f3e34';
    ctx.stroke();

    // Ears
    ctx.fillStyle = '#2f3e34';
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y + 10, 10, 0, Math.PI * 2);
    ctx.arc(player.x + player.width - 10, player.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#2f3e34';
    ctx.beginPath();
    ctx.ellipse(player.x + 20, player.y + 25, 6, 8, Math.PI / 6, 0, Math.PI * 2);
    ctx.ellipse(player.x + player.width - 20, player.y + 25, 6, 8, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(player.x + 20, player.y + 23, 2, 0, Math.PI * 2);
    ctx.arc(player.x + player.width - 20, player.y + 23, 2, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#2f3e34';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 35, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 5. Spawn Objects
    spawnTimerRef.current++;
    if (spawnTimerRef.current > 40) {
      spawnTimerRef.current = 0;
      const typeRand = Math.random();
      let type: 'bamboo' | 'golden' | 'bomb' | 'rock' = 'bamboo';
      if (typeRand > 0.85) type = 'bomb';
      else if (typeRand > 0.75) type = 'golden';
      else if (typeRand > 0.65) type = 'rock';

      objectsRef.current.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        type,
        speed: 3 + Math.random() * 3,
        width: 30,
        height: 30,
      });
    }

    // 6. Update and Draw Objects
    const objects = objectsRef.current;
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      obj.y += obj.speed;

      // Draw Object
      ctx.save();
      if (obj.type === 'bamboo') {
        ctx.fillStyle = '#4e9a06';
        ctx.fillRect(obj.x + 10, obj.y, 10, obj.height);
        ctx.fillStyle = '#73d216';
        ctx.fillRect(obj.x + 12, obj.y + 5, 3, 5);
      } else if (obj.type === 'golden') {
        ctx.fillStyle = '#c4a000';
        ctx.fillRect(obj.x + 10, obj.y, 10, obj.height);
        ctx.fillStyle = '#f57900';
        ctx.beginPath();
        ctx.arc(obj.x + 15, obj.y + 15, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.type === 'bomb') {
        ctx.fillStyle = '#cc0000';
        ctx.beginPath();
        ctx.arc(obj.x + 15, obj.y + 15, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#eeeeec';
        ctx.fillRect(obj.x + 13, obj.y + 2, 4, 6);
      } else if (obj.type === 'rock') {
        ctx.fillStyle = '#888a85';
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y + 30);
        ctx.lineTo(obj.x + 15, obj.y);
        ctx.lineTo(obj.x + 30, obj.y + 30);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Check Collision with Player
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      const objCenterX = obj.x + obj.width / 2;
      const objCenterY = obj.y + obj.height / 2;
      const distance = Math.hypot(playerCenterX - objCenterX, playerCenterY - objCenterY);

      if (distance < (player.width / 2 + obj.width / 2 - 5)) {
        // Handle collision
        if (obj.type === 'bamboo') {
          setScore((s) => s + 10);
          playSound('collect');
        } else if (obj.type === 'golden') {
          setScore((s) => s + 50);
          playSound('collect');
        } else if (obj.type === 'bomb') {
          setLives((l) => {
            const nextLives = l - 1;
            if (nextLives <= 0) {
              setGameState('gameover');
              playSound('gameover');
            }
            return nextLives;
          });
          playSound('bomb');
        } else if (obj.type === 'rock') {
          player.speed = 4; // Slow down
          setTimeout(() => { player.speed = 8; }, 2000);
          playSound('bomb');
        }
        objects.splice(i, 1);
        continue;
      }

      // Remove offscreen
      if (obj.y > canvas.height) {
        objects.splice(i, 1);
      }
    }

    if (gameState === 'playing' && timeLeft > 0 && lives > 0) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }
  };

  // Start Game
  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setLives(3);
    setGameState('playing');
    objectsRef.current = [];
    playerRef.current.x = 200;
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
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
  }, [gameState]);

  // Handle Game Over Rewards
  useEffect(() => {
    if (gameState === 'gameover') {
      const finalCoins = Math.floor(score / 5);
      const finalXp = Math.floor(score / 2);
      onFinish(score, finalCoins, finalXp);
    }
  }, [gameState]);

  // Trigger loop on state change
  useEffect(() => {
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, soundEnabled, lives]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Top Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4 relative z-20">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-full text-sm text-[var(--color-text-main)] hover:bg-black/10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 glass-panel rounded-full hover:bg-black/10 transition-colors">
          {soundEnabled ? <Volume2 className="w-4 h-4 text-green-600" /> : <VolumeX className="w-4 h-4 text-red-500" />}
        </button>
      </div>

      <div className="relative glass-panel rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border-glass)] w-full max-w-md aspect-[4/5] bg-[#e2f0d9]">
        <canvas ref={canvasRef} width={400} height={500} className="w-full h-full block" />

        {/* Stats overlay when playing */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
              Score: {score}
            </div>
            <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
              Time: {timeLeft}s
            </div>
            <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex gap-1">
              {Array.from({ length: lives }).map((_, i) => (
                <span key={i} className="text-red-500">❤️</span>
              ))}
            </div>
          </div>
        )}

        {/* Idle Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-8 rounded-3xl max-w-xs space-y-6">
              <h2 className="text-2xl font-bold font-serif text-[var(--color-text-main)]">Catch the Bamboo! 🎋</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Move Mochi left & right using arrow keys or by touching the sides of the screen. Catch green & gold bamboo! Avoid red bombs!
              </p>
              <div className="text-sm font-semibold text-[var(--color-accent-primary)]">
                High Score: {highScore} pts
              </div>
              <button onClick={startGame} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-accent-secondary)] transition-colors shadow-lg">
                <Play className="w-5 h-5 fill-current" /> Start Game
              </button>
            </motion.div>
          </div>
        )}

        {/* GameOver Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-8 rounded-3xl max-w-xs space-y-6">
              <h2 className="text-2xl font-bold font-serif text-red-500">Game Over!</h2>
              <div className="space-y-2">
                <div className="text-lg text-[var(--color-text-main)] font-semibold">Your Score: {score}</div>
                {score > highScore && <div className="text-xs text-green-500 font-bold animate-bounce">New High Score! 🎉</div>}
                <div className="text-xs text-[var(--color-text-muted)]">High Score: {Math.max(score, highScore)}</div>
              </div>
              
              <div className="border-t border-[var(--color-border-glass)] pt-4 flex justify-around text-xs font-bold text-[var(--color-text-main)]">
                <div>🪙 +{Math.floor(score / 5)} Coins</div>
                <div>⭐ +{Math.floor(score / 2)} XP</div>
              </div>

              <div className="flex gap-2">
                <button onClick={startGame} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-2xl hover:bg-[var(--color-accent-secondary)] transition-colors">
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
