import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Coffee, BookOpen, Trees, Backpack, ShoppingBag, Scroll, Heart, Zap } from 'lucide-react';
import { usePandaState } from '../hooks/usePandaState';
import { PandaCharacter } from '../components/panda/PandaCharacter';
import type { PandaRoom, InventoryItem } from '../types';

const ROOMS: PandaRoom[] = ['Bedroom', 'Kitchen', 'Living Room', 'Garden'];

const ROOM_THEMES: Record<PandaRoom, { bg: string, icon: typeof Home, title: string }> = {
  Bedroom: { bg: 'from-slate-900 via-indigo-950 to-slate-950', icon: Home, title: 'Cozy Bedroom 🛌' },
  Kitchen: { bg: 'from-amber-950 via-slate-900 to-orange-950', icon: Coffee, title: 'Tasty Kitchen 🍳' },
  'Living Room': { bg: 'from-teal-950 via-slate-900 to-emerald-950', icon: BookOpen, title: 'Living Room 🛋️' },
  Garden: { bg: 'from-emerald-950 via-slate-900 to-green-950', icon: Trees, title: 'Bamboo Garden 🌻' }
};

const COSTUMES: { id: string, name: string, price: number, icon: string }[] = [
  { id: 'crown', name: 'Royal Crown', price: 150, icon: '👑' },
  { id: 'glasses', name: 'Cool Shades', price: 80, icon: '🕶️' },
  { id: 'wizard', name: 'Wizard Hat', price: 250, icon: '🧙‍♂️' },
  { id: 'ninja', name: 'Ninja Mask', price: 200, icon: '🥷' },
  { id: 'chef', name: 'Chef Hat', price: 100, icon: '👨‍🍳' },
  { id: 'superhero', name: 'Cape & Mask', price: 300, icon: '🦸' }
];

export default function PandaHouse() {
  const { mochi, momo, inventory, diary, buyItem, feed, pet, dressUp, arcadeStats } = usePandaState();
  const [activeRoom, setActiveRoom] = useState<PandaRoom>('Bedroom');
  const [activeTab, setActiveTab] = useState<'house' | 'shop' | 'backpack' | 'diary'>('house');
  const [shopCategory, setShopCategory] = useState<'food' | 'costume'>('food');
  const [effects, setEffects] = useState<{ id: number; emoji: string; x: number }[]>([]);

  // Local stat meters
  const [mochiHunger, setMochiHunger] = useState(85);
  const [mochiHappiness, setMochiHappiness] = useState(95);
  const [mochiEnergy, setMochiEnergy] = useState(90);

  const [momoHunger, setMomoHunger] = useState(80);
  const [momoHappiness, setMomoHappiness] = useState(90);
  const [momoEnergy, setMomoEnergy] = useState(85);

  useEffect(() => {
    if (mochi && activeTab === 'house') {
      setActiveRoom(mochi.currentRoom);
    }
  }, [mochi, activeTab]);

  const triggerEffect = (emoji: string) => {
    const newEffect = { id: Date.now(), emoji, x: Math.random() * 60 + 20 };
    setEffects((prev) => [...prev, newEffect]);
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== newEffect.id));
    }, 1500);
  };

  const handleFeedPanda = async (target: 'mochi' | 'momo', itemName: string) => {
    await feed(target, itemName);
    triggerEffect('🎋');
    if (target === 'mochi') setMochiHunger((prev) => Math.min(100, prev + 20));
    else setMomoHunger((prev) => Math.min(100, prev + 20));
  };

  const handleBathPanda = (target: 'mochi' | 'momo') => {
    triggerEffect('🧼');
    if (target === 'mochi') setMochiHappiness((prev) => Math.min(100, prev + 15));
    else setMomoHappiness((prev) => Math.min(100, prev + 15));
  };

  const handleSleepPanda = (target: 'mochi' | 'momo') => {
    triggerEffect('💤');
    if (target === 'mochi') setMochiEnergy((prev) => Math.min(100, prev + 30));
    else setMomoEnergy((prev) => Math.min(100, prev + 30));
  };

  const handlePetPanda = (target: 'mochi' | 'momo') => {
    pet(target);
    triggerEffect('💖');
    if (target === 'mochi') setMochiHappiness((prev) => Math.min(100, prev + 10));
    else setMomoHappiness((prev) => Math.min(100, prev + 10));
  };

  const handleBuyCostume = async (costume: typeof COSTUMES[0]) => {
    const item: Omit<InventoryItem, 'quantity' | 'createdAt' | 'updatedAt'> = {
      id: `costume_${costume.id}`,
      name: costume.name,
      type: 'costume',
      icon: costume.icon,
      effect: 'Wearable outfit'
    };
    await buyItem(item, costume.price);
  };

  const handleBuyFood = async (food: { id: string, name: string, price: number, icon: string, effect: string }) => {
    const item: Omit<InventoryItem, 'quantity' | 'createdAt' | 'updatedAt'> = {
      id: food.id,
      name: food.name,
      type: 'food',
      icon: food.icon,
      effect: food.effect
    };
    await buyItem(item, food.price);
  };

  return (
    <div className={`min-h-screen pt-4 pb-28 px-4 transition-all duration-700 bg-gradient-to-b ${ROOM_THEMES[activeRoom].bg} text-white font-sans select-none relative overflow-hidden`}>
      
      {/* Floating Action Particles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {effects.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 1, y: '60vh', x: `${e.x}vw`, scale: 0.8 }}
              animate={{ opacity: 0, y: '30vh', scale: 1.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute text-4xl drop-shadow-lg"
            >
              {e.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Controls & Arcade Balance */}
      <div className="max-w-md mx-auto flex justify-between items-center mb-4 relative z-20">
        <div className="glass-panel px-3 py-1.5 rounded-full flex gap-3 text-xs font-black border border-slate-700 bg-slate-900/80">
          <span>🪙 {arcadeStats?.coins || 250}</span>
          <span>❤️ {arcadeStats?.hearts || 108}</span>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1.5 bg-slate-900/80 p-1 rounded-full border border-slate-800">
          {[
            { id: 'house', icon: Home, label: 'House' },
            { id: 'backpack', icon: Backpack, label: 'Items' },
            { id: 'shop', icon: ShoppingBag, label: 'Shop' },
            { id: 'diary', icon: Scroll, label: 'Diary' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`p-2 rounded-full transition-all text-xs flex items-center justify-center ${
                activeTab === tab.id 
                  ? 'bg-emerald-500 text-white shadow-md scale-105' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title={tab.label}
            >
              <tab.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto relative">
        <AnimatePresence mode="wait">
          {activeTab === 'house' && (
            <motion.div 
              initial={{ opacity: 0.95, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Room Title Header */}
              <div className="text-center">
                <h1 className="text-xl font-extrabold text-white tracking-tight">{ROOM_THEMES[activeRoom].title}</h1>
                <p className="text-[10px] text-slate-400 font-semibold">
                  Mochi: {mochi?.currentAction || 'Cozy'} | Momo: {momo?.currentAction || 'Cozy'}
                </p>
              </div>

              {/* Central Panda Play Room Canvas */}
              <div className="relative glass-panel rounded-3xl h-64 overflow-hidden border border-slate-800 shadow-2xl flex items-end justify-around p-6 bg-slate-950/60 backdrop-blur-xl">
                
                {/* Room Elements */}
                {activeRoom === 'Garden' && <span className="absolute top-4 left-4 text-3xl animate-bounce">🌻</span>}
                {activeRoom === 'Kitchen' && <span className="absolute top-4 left-4 text-3xl">🍳</span>}
                {activeRoom === 'Bedroom' && <span className="absolute top-4 left-4 text-3xl">🌙</span>}
                {activeRoom === 'Living Room' && <span className="absolute top-4 left-4 text-3xl">📺</span>}

                {/* Panda Mochi */}
                {mochi && (
                  <PandaCharacter 
                    panda={mochi} 
                    onPet={() => handlePetPanda('mochi')} 
                    size="lg"
                  />
                )}

                {/* Panda Momo */}
                {momo && (
                  <PandaCharacter 
                    panda={momo} 
                    onPet={() => handlePetPanda('momo')} 
                    size="lg"
                    reverse
                  />
                )}
              </div>

              {/* Live Stat Meters */}
              <div className="grid grid-cols-2 gap-3 glass-panel p-3 rounded-2xl border border-slate-800">
                
                {/* Mochi Stats */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold text-blue-400 flex items-center justify-between">
                    <span>Mochi 🐼</span>
                    <span>98% Happy</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Coffee className="w-2.5 h-2.5 text-amber-400" />
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${mochiHunger}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Heart className="w-2.5 h-2.5 text-rose-400" />
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-400 h-full rounded-full" style={{ width: `${mochiHappiness}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Zap className="w-2.5 h-2.5 text-yellow-400" />
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${mochiEnergy}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Momo Stats */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-extrabold text-pink-400 flex items-center justify-between">
                    <span>Momo 🐾</span>
                    <span>95% Happy</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Coffee className="w-2.5 h-2.5 text-amber-400" />
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${momoHunger}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Heart className="w-2.5 h-2.5 text-rose-400" />
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-400 h-full rounded-full" style={{ width: `${momoHappiness}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Zap className="w-2.5 h-2.5 text-yellow-400" />
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${momoEnergy}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Pet Interactive Action Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleFeedPanda('mochi', 'Bamboo')}
                  className="py-2 px-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-[11px] font-bold border border-emerald-500/30 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-base">🎋</span>
                  <span>Feed Bamboo</span>
                </button>
                <button
                  onClick={() => handleBathPanda('mochi')}
                  className="py-2 px-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-[11px] font-bold border border-cyan-500/30 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-base">🧼</span>
                  <span>Bubble Bath</span>
                </button>
                <button
                  onClick={() => handlePetPanda('momo')}
                  className="py-2 px-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-[11px] font-bold border border-rose-500/30 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-base">💖</span>
                  <span>Pet & Cuddle</span>
                </button>
                <button
                  onClick={() => handleSleepPanda('mochi')}
                  className="py-2 px-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl text-[11px] font-bold border border-indigo-500/30 active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-base">💤</span>
                  <span>Put to Sleep</span>
                </button>
              </div>

              {/* Room Navigation Buttons */}
              <div className="flex justify-around bg-slate-900/80 p-1.5 rounded-full border border-slate-800">
                {ROOMS.map((room) => (
                  <button
                    key={room}
                    onClick={() => setActiveRoom(room)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      activeRoom === room 
                        ? 'bg-emerald-500 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'backpack' && (
            <motion.div 
              initial={{ opacity: 0.95, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="glass-panel p-5 rounded-3xl border border-slate-800"
            >
              <h2 className="text-lg font-bold font-serif mb-4 text-white flex items-center gap-2">
                <Backpack className="w-5 h-5 text-emerald-400" /> Backpack Inventory
              </h2>
              {inventory.length === 0 ? (
                <div className="text-center text-slate-400 py-8 text-xs">Your backpack is empty. Buy items from the shop!</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {inventory.map((item) => (
                    <div key={item.id} className="border border-slate-800 bg-black/20 p-3 rounded-2xl flex flex-col justify-between items-center text-center">
                      <div className="text-3xl mb-1">{item.icon}</div>
                      <div className="font-bold text-xs text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-400 mb-2">Qty: {item.quantity} | {item.effect}</div>
                      {item.type === 'food' ? (
                        <div className="flex gap-1.5 w-full">
                          <button onClick={() => handleFeedPanda('mochi', item.name)} className="flex-1 py-1 text-[10px] bg-emerald-600 text-white rounded-lg font-bold">Mochi</button>
                          <button onClick={() => handleFeedPanda('momo', item.name)} className="flex-1 py-1 text-[10px] bg-emerald-600 text-white rounded-lg font-bold">Momo</button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5 w-full">
                          <button onClick={() => dressUp('mochi', item.name)} className="flex-1 py-1 text-[10px] bg-blue-600 text-white rounded-lg font-bold">Mochi</button>
                          <button onClick={() => dressUp('momo', item.name)} className="flex-1 py-1 text-[10px] bg-blue-600 text-white rounded-lg font-bold">Momo</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'shop' && (
            <motion.div 
              initial={{ opacity: 0.95, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="glass-panel p-5 rounded-3xl border border-slate-800"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" /> Pet Shop
                </h2>
                <div className="flex gap-1 text-xs">
                  <button onClick={() => setShopCategory('food')} className={`px-3 py-1 rounded-full text-xs font-bold ${shopCategory === 'food' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>Food</button>
                  <button onClick={() => setShopCategory('costume')} className={`px-3 py-1 rounded-full text-xs font-bold ${shopCategory === 'costume' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>Costumes</button>
                </div>
              </div>

              {shopCategory === 'food' ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'food_bamboo', name: 'Fresh Bamboo', price: 15, icon: '🎋', effect: '+25 Hunger' },
                    { id: 'food_apple', name: 'Sweet Apple', price: 20, icon: '🍎', effect: '+20 Hunger' },
                    { id: 'food_strawberry', name: 'Berry Snap', price: 40, icon: '🍓', effect: '+35 Hunger, +10 Joy' },
                    { id: 'food_cupcake', name: 'Love Cupcake', price: 50, icon: '🧁', effect: '+40 Hunger, +20 Joy' }
                  ].map((food) => (
                    <div key={food.id} className="border border-slate-800 bg-black/20 p-3 rounded-2xl flex flex-col items-center justify-between text-center">
                      <div className="text-3xl mb-1">{food.icon}</div>
                      <div className="font-bold text-xs text-white">{food.name}</div>
                      <div className="text-[10px] text-slate-400 mb-2">{food.effect}</div>
                      <button 
                        onClick={() => handleBuyFood(food)} 
                        disabled={(arcadeStats?.coins || 250) < food.price}
                        className="w-full py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        🪙 {food.price} Buy
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {COSTUMES.map((cos) => (
                    <div key={cos.id} className="border border-slate-800 bg-black/20 p-3 rounded-2xl flex flex-col items-center justify-between text-center">
                      <div className="text-3xl mb-1">{cos.icon}</div>
                      <div className="font-bold text-xs text-white">{cos.name}</div>
                      <div className="text-[10px] text-slate-400 mb-2">Wardrobe Accessory</div>
                      <button 
                        onClick={() => handleBuyCostume(cos)} 
                        disabled={(arcadeStats?.coins || 250) < cos.price}
                        className="w-full py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        🪙 {cos.price} Buy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'diary' && (
            <motion.div 
              initial={{ opacity: 0.95, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="glass-panel p-5 rounded-3xl border border-slate-800 max-h-[60vh] overflow-y-auto"
            >
              <h2 className="text-lg font-bold font-serif mb-4 text-white flex items-center gap-2">
                <Scroll className="w-5 h-5 text-amber-400" /> Panda Life Diary
              </h2>
              <div className="space-y-3 text-xs">
                {diary.map((entry) => (
                  <div key={entry.id} className="border-b border-slate-800 pb-2 text-slate-200">
                    <div className="text-[9px] text-slate-400 mb-0.5">{entry.date}</div>
                    <div>{entry.text}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
