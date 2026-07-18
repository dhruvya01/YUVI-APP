import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Coffee, BookOpen, Trees, Backpack, ShoppingBag, Scroll } from 'lucide-react';
import { usePandaState } from '../hooks/usePandaState';
import type { PandaRoom, InventoryItem } from '../types';

const ROOMS: PandaRoom[] = ['Bedroom', 'Kitchen', 'Living Room', 'Garden'];

const ROOM_THEMES: Record<PandaRoom, { bg: string, icon: typeof Home, color: string }> = {
  Bedroom: { bg: 'from-indigo-900 via-slate-800 to-indigo-950', icon: Home, color: 'text-indigo-400' },
  Kitchen: { bg: 'from-amber-100 to-orange-100', icon: Coffee, color: 'text-orange-500' },
  'Living Room': { bg: 'from-teal-100 via-neutral-100 to-teal-50', icon: BookOpen, color: 'text-teal-600' },
  Garden: { bg: 'from-emerald-100 via-green-50 to-emerald-200', icon: Trees, color: 'text-green-600' }
};

const COSTUME_SHOP: { id: string, name: string, price: number, icon: string }[] = [
  { id: 'hoodie', name: 'Panda Hoodie', price: 100, icon: '🧥' },
  { id: 'wizard', name: 'Wizard', price: 250, icon: '🧙‍♂️' },
  { id: 'ninja', name: 'Ninja', price: 200, icon: '🥷' },
  { id: 'chef', name: 'Chef Hat', price: 80, icon: '👨‍🍳' }
];

export default function PandaHouse() {
  const { mochi, momo, inventory, diary, buyItem, feed, pet, dressUp, arcadeStats, loading } = usePandaState();
  const [activeRoom, setActiveRoom] = useState<PandaRoom>('Bedroom');
  const [activeTab, setActiveTab] = useState<'house' | 'shop' | 'backpack' | 'diary'>('house');
  const [shopCategory, setShopCategory] = useState<'food' | 'costume'>('food');

  // Match room changes with AI updates
  useEffect(() => {
    if (mochi && activeTab === 'house') {
      setActiveRoom(mochi.currentRoom);
    }
  }, [mochi, activeTab]);

  if (loading || !mochi || !momo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <span className="text-white text-lg animate-pulse">Entering Panda House...</span>
      </div>
    );
  }

  const handleBuyCostume = async (costume: typeof COSTUME_SHOP[0]) => {
    const item: Omit<InventoryItem, 'quantity'> = {
      id: `costume_${costume.id}`,
      name: costume.name,
      type: 'costume',
      icon: costume.icon,
      effect: 'Wearable outfit'
    };
    await buyItem(item, costume.price);
  };

  const handleBuyFood = async (food: { id: string, name: string, price: number, icon: string, effect: string }) => {
    const item: Omit<InventoryItem, 'quantity'> = {
      id: food.id,
      name: food.name,
      type: 'food',
      icon: food.icon,
      effect: food.effect
    };
    await buyItem(item, food.price);
  };

  return (
    <div className={`min-h-screen pt-12 pb-32 px-4 transition-all duration-1000 bg-gradient-to-br ${ROOM_THEMES[activeRoom].bg}`}>
      {/* Top Navbar */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 relative z-20">
        <div className="glass-panel px-4 py-2 rounded-full flex gap-3 text-sm font-bold text-[var(--color-text-main)]">
          <span>🪙 {arcadeStats?.coins || 0}</span>
          <span>❤️ {arcadeStats?.hearts || 0}</span>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('house')} 
            className={`p-2 rounded-full transition-all border border-[var(--color-border-glass)] ${activeTab === 'house' ? 'bg-[var(--color-accent-primary)] text-white scale-110' : 'glass-panel text-[var(--color-text-main)] hover:bg-black/10'}`}
          >
            <Home className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('backpack')} 
            className={`p-2 rounded-full transition-all border border-[var(--color-border-glass)] ${activeTab === 'backpack' ? 'bg-[var(--color-accent-primary)] text-white scale-110' : 'glass-panel text-[var(--color-text-main)] hover:bg-black/10'}`}
          >
            <Backpack className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('shop')} 
            className={`p-2 rounded-full transition-all border border-[var(--color-border-glass)] ${activeTab === 'shop' ? 'bg-[var(--color-accent-primary)] text-white scale-110' : 'glass-panel text-[var(--color-text-main)] hover:bg-black/10'}`}
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('diary')} 
            className={`p-2 rounded-full transition-all border border-[var(--color-border-glass)] ${activeTab === 'diary' ? 'bg-[var(--color-accent-primary)] text-white scale-110' : 'glass-panel text-[var(--color-text-main)] hover:bg-black/10'}`}
          >
            <Scroll className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <AnimatePresence mode="wait">
          {activeTab === 'house' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Room Header Info */}
              <div className="text-center text-[var(--color-text-main)]">
                <h1 className="text-3xl font-bold font-serif">{activeRoom}</h1>
                <p className="text-xs opacity-75">
                  Mochi: {mochi.currentAction} | Momo: {momo.currentAction}
                </p>
              </div>

              {/* Central Room Canvas */}
              <div className="relative glass-panel rounded-3xl aspect-[1.8/1] overflow-hidden border border-[var(--color-border-glass)] shadow-2xl flex items-end justify-around p-8">
                {/* Room Decor Indicators */}
                {activeRoom === 'Garden' && <span className="absolute top-8 left-8 text-4xl animate-bounce">🌻</span>}
                {activeRoom === 'Kitchen' && <span className="absolute top-8 left-8 text-4xl">🍳</span>}
                {activeRoom === 'Bedroom' && <span className="absolute top-8 left-8 text-4xl">💤</span>}
                
                {/* Render Mochi */}
                <motion.div 
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => pet('mochi')}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {/* Speech bubble */}
                  {mochi.currentAction !== 'Idle' && (
                    <div className="absolute -top-12 bg-white text-black text-xs font-semibold px-2 py-1 rounded-xl shadow-md border border-slate-200">
                      {mochi.currentAction} in Room!
                    </div>
                  )}
                  {mochi.costume && <span className="absolute -top-4 text-xl">{mochi.costume === 'Wizard' ? '🧙‍♂️' : mochi.costume === 'Ninja' ? '🥷' : '🧥'}</span>}
                  <img src="/assets/panda_mochi.png" alt="Mochi" className="w-32 h-32 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="mt-2 text-xs font-bold text-[var(--color-text-main)]">Mochi</span>
                </motion.div>

                {/* Render Momo */}
                <motion.div 
                  className="flex flex-col items-center cursor-pointer group scale-x-[-1]"
                  onClick={() => pet('momo')}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                >
                  {momo.costume && <span className="absolute -top-4 text-xl">{momo.costume === 'Wizard' ? '🧙‍♂️' : momo.costume === 'Ninja' ? '🥷' : '🧥'}</span>}
                  <img src="/assets/panda_momo.png" alt="Momo" className="w-24 h-24 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="mt-2 text-xs font-bold text-[var(--color-text-main)] scale-x-[-1]">Momo</span>
                </motion.div>
              </div>

              {/* Room switcher buttons */}
              <div className="flex justify-center gap-4">
                {ROOMS.map((room) => (
                  <button
                    key={room}
                    onClick={() => setActiveRoom(room)}
                    className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${activeRoom === room ? 'bg-[var(--color-accent-primary)] text-white scale-105' : 'glass-panel text-[var(--color-text-main)] hover:bg-black/10'}`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'backpack' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8 rounded-3xl"
            >
              <h2 className="text-2xl font-bold font-serif mb-6 text-[var(--color-text-main)] flex items-center gap-2">
                <Backpack className="w-6 h-6" /> Inventory
              </h2>
              {inventory.length === 0 ? (
                <div className="text-center text-[var(--color-text-muted)] py-12">Your backpack is empty. Buy items from the shop!</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="border border-[var(--color-border-glass)] bg-black/5 p-4 rounded-2xl flex flex-col justify-between items-center text-center">
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <div className="font-bold text-sm text-[var(--color-text-main)]">{item.name}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] mb-3">Qty: {item.quantity} | {item.effect}</div>
                      {item.type === 'food' ? (
                        <div className="flex gap-2 w-full">
                          <button onClick={() => feed('mochi', item.name)} className="flex-1 py-1 text-[10px] bg-green-500 text-white rounded-lg font-bold">Feed Mochi</button>
                          <button onClick={() => feed('momo', item.name)} className="flex-1 py-1 text-[10px] bg-green-500 text-white rounded-lg font-bold">Feed Momo</button>
                        </div>
                      ) : (
                        <div className="flex gap-2 w-full">
                          <button onClick={() => dressUp('mochi', item.name)} className="flex-1 py-1 text-[10px] bg-blue-500 text-white rounded-lg font-bold">Dress Mochi</button>
                          <button onClick={() => dressUp('momo', item.name)} className="flex-1 py-1 text-[10px] bg-blue-500 text-white rounded-lg font-bold">Dress Momo</button>
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
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8 rounded-3xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-serif text-[var(--color-text-main)] flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" /> Shop
                </h2>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setShopCategory('food')} className={`px-3 py-1.5 rounded-full ${shopCategory === 'food' ? 'bg-orange-500 text-white font-bold' : 'bg-black/5 text-[var(--color-text-muted)]'}`}>Food</button>
                  <button onClick={() => setShopCategory('costume')} className={`px-3 py-1.5 rounded-full ${shopCategory === 'costume' ? 'bg-orange-500 text-white font-bold' : 'bg-black/5 text-[var(--color-text-muted)]'}`}>Costumes</button>
                </div>
              </div>

              {shopCategory === 'food' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'food_apple', name: 'Apple', price: 20, icon: '🍎', effect: '+20 Hunger' },
                    { id: 'food_strawberry', name: 'Strawberry', price: 40, icon: '🍓', effect: '+35 Hunger, +10 Happiness' },
                    { id: 'food_peanuts', name: 'Peanuts', price: 15, icon: '🥜', effect: '+15 Hunger' },
                    { id: 'food_cupcake', name: 'Cupcake', price: 50, icon: '🧁', effect: '+40 Hunger, +20 Happiness' }
                  ].map((food) => (
                    <div key={food.id} className="border border-[var(--color-border-glass)] bg-black/5 p-4 rounded-2xl flex flex-col items-center justify-between text-center">
                      <div className="text-4xl mb-2">{food.icon}</div>
                      <div className="font-bold text-sm text-[var(--color-text-main)]">{food.name}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] mb-3">{food.effect}</div>
                      <button 
                        onClick={() => handleBuyFood(food)} 
                        disabled={(arcadeStats?.coins || 0) < food.price}
                        className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        🪙 {food.price} Buy
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {COSTUME_SHOP.map((cos) => (
                    <div key={cos.id} className="border border-[var(--color-border-glass)] bg-black/5 p-4 rounded-2xl flex flex-col items-center justify-between text-center">
                      <div className="text-4xl mb-2">{cos.icon}</div>
                      <div className="font-bold text-sm text-[var(--color-text-main)]">{cos.name}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] mb-3">Exclusive wardrobe item</div>
                      <button 
                        onClick={() => handleBuyCostume(cos)} 
                        disabled={(arcadeStats?.coins || 0) < cos.price}
                        className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1"
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
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8 rounded-3xl max-h-[70vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold font-serif mb-6 text-[var(--color-text-main)] flex items-center gap-2">
                <Scroll className="w-6 h-6 animate-pulse" /> Panda Life Diary
              </h2>
              <div className="space-y-4">
                {diary.map((entry) => (
                  <div key={entry.id} className="border-b border-[var(--color-border-glass)] pb-3 text-sm text-[var(--color-text-main)]">
                    <div className="text-[10px] text-[var(--color-text-muted)] mb-1">{entry.date}</div>
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
