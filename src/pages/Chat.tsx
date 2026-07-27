import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, UserCheck } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'yuvi' | 'manvi';
  createdAt: string;
}

export default function Chat() {
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
    <div className="pt-6 pb-28 px-4 max-w-4xl mx-auto relative z-10 flex flex-col items-center justify-center">
      <div className="w-full glass-panel rounded-3xl overflow-hidden flex flex-col border border-[var(--color-border-glass)] shadow-2xl backdrop-blur-xl h-[calc(100vh-10rem)] max-h-[750px]">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-glass)] flex items-center justify-between bg-black/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md ${
                otherUser === 'manvi' ? 'bg-gradient-to-br from-pink-400 to-rose-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                {otherUser.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[var(--color-text-main)] capitalize">
                Chatting with {otherUser} 💕
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">Realtime Sync Active</p>
            </div>
          </div>

          {/* User Switcher for Dual-User Testing */}
          <div className="flex items-center gap-2 bg-black/10 p-1.5 rounded-full border border-[var(--color-border-glass)]">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] px-2 hidden sm:inline">Sending as:</span>
            <button
              onClick={() => setCurrentUser('yuvi')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                currentUser === 'yuvi' ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-black'
              }`}
            >
              <UserCheck className="w-3 h-3" /> Yuvi
            </button>
            <button
              onClick={() => setCurrentUser('manvi')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                currentUser === 'manvi' ? 'bg-pink-500 text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-black'
              }`}
            >
              <UserCheck className="w-3 h-3" /> Manvi
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-[var(--color-text-muted)] animate-pulse">
              Connecting to real-time chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-muted)] space-y-2">
              <span className="text-4xl">💌</span>
              <p className="text-sm font-medium">No messages yet. Send a message to start chatting!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMine = msg.sender === currentUser;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[80%] md:max-w-[65%]">
                      {!isMine && (
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                          msg.sender === 'manvi' ? 'bg-pink-500' : 'bg-blue-600'
                        }`}>
                          {msg.sender.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div 
                        className={`px-4 py-2.5 rounded-2xl shadow-sm relative text-sm ${
                          isMine 
                            ? 'bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white rounded-br-sm' 
                            : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-[var(--color-text-main)] border border-[var(--color-border-glass)] rounded-bl-sm'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                    </div>
                    <div className={`text-[10px] text-[var(--color-text-muted)] mt-1 ${isMine ? 'text-right pr-1' : 'text-left pl-9'}`}>
                      {formatTime(msg.createdAt)}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-black/5 border-t border-[var(--color-border-glass)] flex items-center gap-2">
          <div className="flex-1 bg-[var(--color-bg-glass)] backdrop-blur-md border border-[var(--color-border-glass)] rounded-2xl flex items-center shadow-inner">
            <button type="button" className="p-3 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors">
              <Smile className="w-5 h-5" />
            </button>
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
              className="flex-1 bg-transparent border-none focus:outline-none py-3 text-[var(--color-text-main)] placeholder-[var(--color-text-muted)] text-sm"
            />
          </div>

          <button 
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
