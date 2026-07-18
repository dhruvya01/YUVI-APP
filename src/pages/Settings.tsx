
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Check } from 'lucide-react';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; name: string; description: string; colors: string[] }[] = [
    { id: 'panda-paradise', name: '🐼 Panda Paradise', description: 'Soft, cozy, peaceful, and full of cuddles.', colors: ['#2F3E34', '#A8D5BA', '#F8F8F5'] },
    { id: 'sakura', name: '🌸 Sakura Pink', description: 'Romantic cherry blossoms and soft pinks.', colors: ['#f43f5e', '#fda4af', '#fff0f3'] },
    { id: 'midnight', name: '🌙 Midnight Blue', description: 'Deep blues and starry nights.', colors: ['#3b82f6', '#818cf8', '#0f172a'] },
    { id: 'lavender', name: '💜 Lavender Dream', description: 'Soft purples and dreamy clouds.', colors: ['#a855f7', '#d8b4fe', '#faf5ff'] },
    { id: 'ocean', name: '🌊 Ocean Love', description: 'Calming cyans and gentle waves.', colors: ['#0ea5e9', '#7dd3fc', '#f0fdfa'] },
    { id: 'forest', name: '🌿 Forest Green', description: 'Natural greens and peaceful woods.', colors: ['#22c55e', '#86efac', '#f0fdf4'] },
    { id: 'classic', name: '❤️ Classic Red', description: 'Timeless deep reds and passion.', colors: ['#e11d48', '#fb7185', '#fff1f2'] },
    { id: 'galaxy', name: '✨ Galaxy Love', description: 'Dark space with neon purple glows.', colors: ['#d946ef', '#c084fc', '#09090b'] },
  ];

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-5xl mx-auto relative z-10">
      <div className="flex items-center gap-4 mb-12 glass-panel p-4 rounded-2xl">
        <SettingsIcon className="w-8 h-8 text-[var(--color-accent-primary)]" />
        <h1 className="text-3xl font-serif font-bold text-[var(--color-text-main)]">Settings</h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-6 ml-2">Theme Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((t, i) => {
              const isActive = theme === t.id;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setTheme(t.id)}
                  className={`glass-panel p-6 rounded-2xl cursor-pointer transition-all ${
                    isActive ? 'border-[var(--color-accent-primary)] shadow-[0_0_20px_var(--color-glow)] scale-105 z-10' : 'border-[var(--color-border-glass)] hover:border-[var(--color-accent-secondary)]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-[var(--color-text-main)]">{t.name}</h3>
                    {isActive && (
                      <div className="bg-[var(--color-accent-primary)] text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-6 h-10">{t.description}</p>
                  <div className="flex gap-2">
                    {t.colors.map((color, idx) => (
                      <div 
                        key={idx} 
                        className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
