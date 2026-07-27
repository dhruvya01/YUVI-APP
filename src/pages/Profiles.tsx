import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Save, Heart, Star, MapPin, Music, Coffee, Flame, Camera, Palette, Check, UserCheck } from 'lucide-react';
import type { Profile } from '../types';
import { profileRepo } from '../repositories/ProfileRepository';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/ThemeContext';

const DEFAULT_YUVI: Profile = {
  id: 'yuvi',
  name: 'Yuvi',
  nickname: 'Handsome',
  birthday: 'December 2',
  color: 'Midnight Blue 💙',
  food: 'Pizza 🍕',
  song: 'Forever Yours 🎵',
  movie: 'Interstellar 🚀',
  quote: 'In all the world, there is no heart for me like yours.',
  traits: 'Loving, Ambitious, Caring',
  loveLanguage: 'Quality Time & Words',
  hobbies: 'Coding, Gaming, Traveling',
  dreamDest: 'Switzerland 🏔️',
  mood: 'In Love 🥰',
  status: 'Online',
  avatar: '👨‍💻',
  themePreference: 'midnight',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const DEFAULT_MANVI: Profile = {
  id: 'manvi',
  name: 'Manvi',
  nickname: 'Angel',
  birthday: 'August 14',
  color: 'Sakura Pink 💖',
  food: 'Pasta & Chocolates 🍝',
  song: 'Lover 🎶',
  movie: 'Tangled 👑',
  quote: 'You are my today and all of my tomorrows.',
  traits: 'Sweet, Creative, Cute',
  loveLanguage: 'Physical Touch & Gifts',
  hobbies: 'Painting, Reading, Music',
  dreamDest: 'Paris 🗼',
  mood: 'Happy 😊',
  status: 'Online',
  avatar: '👩‍🎨',
  themePreference: 'sakura',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

function ProfileCard({ initialData, onSave }: { initialData: Profile; onSave: (data: Profile) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<Profile>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof Profile, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const updated = { ...data, photo: reader.result };
        setData(updated);
        await onSave(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(data);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0.95, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="glass-panel p-6 rounded-3xl relative overflow-hidden border border-[var(--color-border-glass)] shadow-xl"
    >
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={isSaving}
          className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors border border-[var(--color-border-glass)] disabled:opacity-50"
          title={isEditing ? "Save Profile" : "Edit Profile"}
        >
          {isEditing ? <Save className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-4 h-4 text-[var(--color-text-main)]" />}
        </button>
      </div>

      <div className="flex flex-col items-center mb-6 relative z-10">
        {/* Profile Picture Container with Upload */}
        <div className="relative group mb-3">
          <div className="w-28 h-28 rounded-full border-4 border-[var(--color-accent-primary)] flex items-center justify-center bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] overflow-hidden shadow-xl">
            {data.photo ? (
              <img src={data.photo} alt={data.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-serif text-white">{data.avatar}</span>
            )}
          </div>

          {/* Camera Upload Button Overlay */}
          <label className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
            <Camera className="w-6 h-6 mb-1" />
            <span className="text-[9px] font-bold">Change Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              className="hidden" 
            />
          </label>

          <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" title={data.status} />
        </div>
        
        {isEditing ? (
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="text-2xl font-bold font-serif text-center bg-black/5 rounded-xl px-2 py-1 mb-2 border border-[var(--color-border-glass)] w-full max-w-[180px] text-[var(--color-text-main)]"
          />
        ) : (
          <h2 className="text-2xl font-bold font-serif text-[var(--color-text-main)] mb-1">{data.name}</h2>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-0.5 bg-black/5 rounded-full text-xs text-[var(--color-text-muted)] font-medium border border-[var(--color-border-glass)]">
            "{isEditing ? (
              <input value={data.nickname} onChange={(e) => handleChange('nickname', e.target.value)} className="bg-transparent w-20 outline-none text-center" />
            ) : data.nickname}"
          </span>
          <span className="px-3 py-0.5 bg-black/5 rounded-full text-xs text-[var(--color-text-muted)] font-medium border border-[var(--color-border-glass)]">
            {isEditing ? (
              <input value={data.mood} onChange={(e) => handleChange('mood', e.target.value)} className="bg-transparent w-20 outline-none text-center" />
            ) : data.mood}
          </span>
        </div>
      </div>

      <div className="space-y-3 relative z-10 text-xs">
        {[
          { label: 'Birthday', icon: Star, field: 'birthday' as keyof Profile },
          { label: 'Favorite Color', icon: Heart, field: 'color' as keyof Profile },
          { label: 'Favorite Food', icon: Coffee, field: 'food' as keyof Profile },
          { label: 'Favorite Song', icon: Music, field: 'song' as keyof Profile },
          { label: 'Love Language', icon: Heart, field: 'loveLanguage' as keyof Profile },
          { label: 'Hobbies', icon: Flame, field: 'hobbies' as keyof Profile },
          { label: 'Dream Destination', icon: MapPin, field: 'dreamDest' as keyof Profile },
        ].map((item) => (
          <div key={item.field} className="flex flex-col border-b border-[var(--color-border-glass)] pb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-accent-primary)] font-semibold uppercase tracking-wider mb-0.5">
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={data[item.field] as string}
                onChange={(e) => handleChange(item.field, e.target.value)}
                className="text-[var(--color-text-main)] bg-black/5 rounded-lg px-2 py-1 outline-none border border-[var(--color-border-glass)]"
              />
            ) : (
              <div className="text-[var(--color-text-main)] font-medium">{data[item.field] as string}</div>
            )}
          </div>
        ))}

        <div className="pt-2 text-center">
          {isEditing ? (
             <textarea
               value={data.quote}
               onChange={(e) => handleChange('quote', e.target.value)}
               className="w-full text-center italic font-serif text-[var(--color-text-muted)] bg-black/5 rounded-xl p-2 border border-[var(--color-border-glass)] resize-none text-xs"
             />
          ) : (
            <p className="italic font-serif text-[var(--color-text-muted)] text-sm">
              "{data.quote}"
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Profiles() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profiles' | 'settings'>('profiles');
  const [yuvi, setYuvi] = useState<Profile>(DEFAULT_YUVI);
  const [manvi, setManvi] = useState<Profile>(DEFAULT_MANVI);

  useEffect(() => {
    async function loadProfiles() {
      try {
        const y = await profileRepo.getYuvi();
        const m = await profileRepo.getManvi();
        if (y) setYuvi(y);
        if (m) setManvi(m);
      } catch (e) {
        console.error('Error loading profiles:', e);
      }
    }
    loadProfiles();
  }, []);

  const handleSave = async (updatedData: Profile) => {
    await profileRepo.update(updatedData.id, updatedData);
    if (updatedData.id === 'yuvi') setYuvi(updatedData);
    if (updatedData.id === 'manvi') setManvi(updatedData);
  };

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
    <div className="min-h-screen pt-6 pb-28 px-4 max-w-md mx-auto relative z-10">
      
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between mb-6 glass-panel p-2 rounded-full border border-[var(--color-border-glass)] shadow-lg">
        <button
          onClick={() => setActiveTab('profiles')}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'profiles' 
              ? 'bg-[var(--color-accent-primary)] text-white shadow-md' 
              : 'text-[var(--color-text-muted)] hover:text-black dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Profiles
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'settings' 
              ? 'bg-[var(--color-accent-primary)] text-white shadow-md' 
              : 'text-[var(--color-text-muted)] hover:text-black dark:hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" /> App Themes
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profiles' ? (
          <motion.div
            key="profiles-tab"
            initial={{ opacity: 0.95, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <ProfileCard initialData={yuvi} onSave={handleSave} />
            <ProfileCard initialData={manvi} onSave={handleSave} />
          </motion.div>
        ) : (
          <motion.div
            key="settings-tab"
            initial={{ opacity: 0.95, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            <div className="glass-panel p-4 rounded-2xl border border-[var(--color-border-glass)] mb-4">
              <h2 className="text-base font-serif font-bold text-[var(--color-text-main)] mb-1">Select App Theme</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Choose a color palette for your couple app</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {themes.map((t) => {
                const isActive = theme === t.id;
                return (
                  <motion.div
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`glass-panel p-4 rounded-2xl cursor-pointer transition-all border ${
                      isActive ? 'border-[var(--color-accent-primary)] shadow-md bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border-glass)] hover:border-[var(--color-accent-secondary)]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-bold text-[var(--color-text-main)]">{t.name}</h3>
                      {isActive && (
                        <div className="bg-[var(--color-accent-primary)] text-white rounded-full p-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">{t.description}</p>
                    <div className="flex gap-2">
                      {t.colors.map((color, idx) => (
                        <div 
                          key={idx} 
                          className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
