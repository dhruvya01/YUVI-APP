import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'yuvi' | 'manvi';
  createdAt: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<'yuvi' | 'manvi'>('yuvi');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUser = currentUser === 'yuvi' ? 'manvi' : 'yuvi';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Real-time Firestore listener
  useEffect(() => {
    const chatRef = collection(db, 'forever_us_chat');
    const q = query(chatRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: ChatMessage[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          text: data.text || '',
          sender: data.sender || 'yuvi',
          createdAt: data.createdAt || new Date().toISOString()
        };
      });

      setMessages(fetched);
      setLoading(false);
    }, (error) => {
      console.error('Firestore chat error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      await addDoc(collection(db, 'forever_us_chat'), {
        text: textToSend,
        sender: currentUser,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[var(--color-bg-main)] flex flex-col h-[100dvh] w-full max-w-md mx-auto shadow-2xl">
      {/* Fullscreen Chat Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border-glass)] flex items-center justify-between bg-black/10 backdrop-blur-xl shrink-0 pt-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-1 text-[var(--color-text-muted)] hover:text-black transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
              otherUser === 'manvi' ? 'bg-gradient-to-br from-pink-400 to-rose-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              {otherUser.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-base font-bold font-serif text-[var(--color-text-main)] capitalize leading-tight">
              {otherUser} 💕
            </h2>
            <p className="text-[10px] text-emerald-500 font-semibold">Online</p>
          </div>
        </div>

        {/* Sender Toggle */}
        <div className="flex items-center gap-1 bg-black/10 p-1 rounded-full border border-[var(--color-border-glass)]">
          <button
            onClick={() => setCurrentUser('yuvi')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
              currentUser === 'yuvi' ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--color-text-muted)]'
            }`}
          >
            Yuvi
          </button>
          <button
            onClick={() => setCurrentUser('manvi')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
              currentUser === 'manvi' ? 'bg-pink-500 text-white shadow-sm' : 'text-[var(--color-text-muted)]'
            }`}
          >
            Manvi
          </button>
        </div>
      </div>

      {/* Messages Feed - Spans all available height */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-[var(--color-text-muted)] animate-pulse">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-muted)] space-y-2">
            <span className="text-4xl">💬</span>
            <p className="text-xs font-medium">No messages yet. Send a message to chat in real-time!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMine = msg.sender === currentUser;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[82%]">
                    {!isMine && (
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                        msg.sender === 'manvi' ? 'bg-pink-500' : 'bg-blue-600'
                      }`}>
                        {msg.sender.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div 
                      className={`px-3.5 py-2 rounded-2xl shadow-sm text-sm ${
                        isMine 
                          ? 'bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white rounded-br-none' 
                          : 'bg-white/90 dark:bg-slate-800/90 text-[var(--color-text-main)] border border-[var(--color-border-glass)] rounded-bl-none'
                      }`}
                    >
                      <p className="leading-snug whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  </div>
                  <div className={`text-[9px] text-[var(--color-text-muted)] mt-0.5 ${isMine ? 'text-right pr-1' : 'text-left pl-8'}`}>
                    {formatTime(msg.createdAt)}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fullscreen Input Bar at Bottom */}
      <div className="p-3 bg-black/10 backdrop-blur-xl border-t border-[var(--color-border-glass)] flex items-center gap-2 shrink-0 pb-6 md:pb-3">
        <div className="flex-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-[var(--color-border-glass)] rounded-full flex items-center px-4 shadow-inner">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message as ${currentUser === 'yuvi' ? 'Yuvi 💙' : 'Manvi 💖'}...`}
            className="w-full bg-transparent border-none focus:outline-none py-2.5 text-[var(--color-text-main)] placeholder-[var(--color-text-muted)] text-sm"
          />
        </div>

        <button 
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="w-10 h-10 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
