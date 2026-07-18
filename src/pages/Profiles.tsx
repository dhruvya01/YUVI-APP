import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, Heart, Star, MapPin, Music, Coffee, Flame } from 'lucide-react';

interface ProfileData {
  name: string;
  nickname: string;
  birthday: string;
  color: string;
  food: string;
  song: string;
  movie: string;
  quote: string;
  traits: string;
  loveLanguage: string;
  hobbies: string;
  dreamDest: string;
  mood: string;
  status: 'Online' | 'Offline';
  avatar: string;
}

const defaultYuvi: ProfileData = {
  name: 'Yuvi',
  nickname: 'Yuv',
  birthday: 'January 1, 2000',
  color: 'Blue',
  food: 'Pizza',
  song: 'Perfect - Ed Sheeran',
  movie: 'Inception',
  quote: '"To infinity and beyond."',
  traits: 'Funny, Caring, Loyal',
  loveLanguage: 'Quality Time',
  hobbies: 'Gaming, Coding, Photography',
  dreamDest: 'Tokyo, Japan',
  mood: '😊 Happy',
  status: 'Online',
  avatar: 'Y',
};

const defaultManvi: ProfileData = {
  name: 'Manvi',
  nickname: 'Manu',
  birthday: 'February 14, 2000',
  color: 'Pink',
  food: 'Pasta',
  song: 'A Thousand Years',
  movie: 'The Notebook',
  quote: '"Love is in the air."',
  traits: 'Sweet, Creative, Passionate',
  loveLanguage: 'Words of Affirmation',
  hobbies: 'Painting, Reading, Travel',
  dreamDest: 'Paris, France',
  mood: '🥰 Loved',
  status: 'Online',
  avatar: 'M',
};

function ProfileCard({ initialData, delay }: { initialData: ProfileData; delay: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<ProfileData>(initialData);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, save to backend or localStorage here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, type: 'spring' }}
      className="glass-panel p-8 rounded-3xl relative overflow-hidden"
    >
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="p-2 bg-[var(--color-bg-glass)] hover:bg-black/10 rounded-full transition-colors border border-[var(--color-border-glass)]"
        >
          {isEditing ? <Save className="w-5 h-5 text-green-500" /> : <Edit2 className="w-5 h-5 text-[var(--color-text-main)]" />}
        </button>
      </div>

      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="w-32 h-32 rounded-full border-4 border-[var(--color-accent-primary)] mb-4 flex items-center justify-center bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] relative shadow-lg">
          <span className="text-5xl font-serif text-white">{data.avatar}</span>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm" title={data.status}></div>
        </div>
        
        {isEditing ? (
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="text-3xl font-bold font-serif text-center bg-black/5 rounded px-2 py-1 mb-2 border border-[var(--color-border-glass)] w-full max-w-[200px]"
          />
        ) : (
          <h2 className="text-3xl font-bold font-serif text-[var(--color-text-main)] mb-1">{data.name}</h2>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-black/5 rounded-full text-sm text-[var(--color-text-muted)] font-medium border border-[var(--color-border-glass)]">
            "{isEditing ? (
              <input value={data.nickname} onChange={(e) => handleChange('nickname', e.target.value)} className="bg-transparent w-20 outline-none text-center" />
            ) : data.nickname}"
          </span>
          <span className="px-3 py-1 bg-black/5 rounded-full text-sm text-[var(--color-text-muted)] font-medium border border-[var(--color-border-glass)]">
            {isEditing ? (
              <input value={data.mood} onChange={(e) => handleChange('mood', e.target.value)} className="bg-transparent w-20 outline-none text-center" />
            ) : data.mood}
          </span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {[
          { label: 'Birthday', icon: Star, field: 'birthday' as keyof ProfileData },
          { label: 'Favorite Color', icon: Heart, field: 'color' as keyof ProfileData },
          { label: 'Favorite Food', icon: Coffee, field: 'food' as keyof ProfileData },
          { label: 'Favorite Song', icon: Music, field: 'song' as keyof ProfileData },
          { label: 'Love Language', icon: Heart, field: 'loveLanguage' as keyof ProfileData },
          { label: 'Hobbies', icon: Flame, field: 'hobbies' as keyof ProfileData },
          { label: 'Dream Destination', icon: MapPin, field: 'dreamDest' as keyof ProfileData },
        ].map((item) => (
          <div key={item.field} className="flex flex-col border-b border-[var(--color-border-glass)] pb-2">
            <div className="flex items-center gap-2 text-sm text-[var(--color-accent-primary)] font-semibold uppercase tracking-wider mb-1">
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={data[item.field]}
                onChange={(e) => handleChange(item.field, e.target.value)}
                className="text-[var(--color-text-main)] bg-black/5 rounded px-2 py-1 outline-none border border-[var(--color-border-glass)]"
              />
            ) : (
              <div className="text-[var(--color-text-main)]">{data[item.field]}</div>
            )}
          </div>
        ))}

        <div className="pt-4 text-center">
          {isEditing ? (
             <textarea
               value={data.quote}
               onChange={(e) => handleChange('quote', e.target.value)}
               className="w-full text-center italic font-serif text-[var(--color-text-muted)] bg-black/5 rounded p-2 border border-[var(--color-border-glass)] resize-none"
             />
          ) : (
            <p className="italic font-serif text-[var(--color-text-muted)] text-lg">
              {data.quote}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Profiles() {
  return (
    <div className="min-h-screen pt-12 pb-32 px-4 max-w-6xl mx-auto relative z-10">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-main)] mb-2">Our Profiles</h1>
        <p className="text-[var(--color-text-muted)] text-lg">The souls behind the magic.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProfileCard initialData={defaultYuvi} delay={0.1} />
        <ProfileCard initialData={defaultManvi} delay={0.3} />
      </div>
    </div>
  );
}
