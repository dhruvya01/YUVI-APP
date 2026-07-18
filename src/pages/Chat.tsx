import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, Mic, Paperclip, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'yuvi' | 'manvi';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const initialMessages: Message[] = [
  { id: '1', text: 'Hey baby! 💕', sender: 'yuvi', timestamp: '10:00 AM', status: 'read' },
  { id: '2', text: 'Hiiii! How is your day going? 🥰', sender: 'manvi', timestamp: '10:05 AM', status: 'read' },
  { id: '3', text: 'Missing you so much! Can\'t wait to see you later.', sender: 'yuvi', timestamp: '10:06 AM', status: 'read' },
  { id: '4', text: 'Missing you more!! 🥺', sender: 'manvi', timestamp: '10:10 AM', status: 'read' },
  { id: '5', text: 'I built something special for us...', sender: 'yuvi', timestamp: '10:15 AM', status: 'read' },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = 'yuvi'; // We pretend we are Yuvi testing this
  const otherUser = 'manvi';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: currentUser,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    
    // Simulate Manvi typing back
    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Awww that is so sweet!! I love it! 😍',
        sender: otherUser,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };
      setMessages((prev) => [...prev, replyMessage]);
    }, 4000);
  };

  return (
    <div className="pt-8 pb-32 px-4 max-w-4xl mx-auto relative z-10 flex flex-col items-center justify-center">
      <div className="w-full glass-panel rounded-3xl overflow-hidden flex flex-col border border-[var(--color-border-glass)] shadow-2xl backdrop-blur-xl h-[calc(100vh-10rem)] max-h-[800px]">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-glass)] flex items-center justify-between bg-black/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-xl font-serif text-white shadow-md">
                {otherUser.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[var(--color-text-main)] capitalize">{otherUser}</h2>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">Online</p>
            </div>
          </div>
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-[var(--color-text-muted)]">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="text-center text-xs text-[var(--color-text-muted)] font-medium mb-6 bg-black/5 rounded-full px-4 py-1 w-max mx-auto border border-[var(--color-border-glass)]">
            Today
          </div>
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMine = msg.sender === currentUser;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[75%]">
                    {!isMine && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex-shrink-0 flex items-center justify-center text-[10px] text-white">
                        {msg.sender.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div 
                      className={`px-4 py-3 rounded-2xl shadow-sm relative ${
                        isMine 
                          ? 'bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white rounded-br-sm' 
                          : 'bg-white/60 backdrop-blur-md text-[var(--color-text-main)] border border-[var(--color-border-glass)] rounded-bl-sm'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                  <div className={`text-[10px] text-[var(--color-text-muted)] mt-1 ${isMine ? 'text-right pr-2' : 'text-left pl-10'}`}>
                    {msg.timestamp} {isMine && <span className="ml-1 opacity-70">✓✓</span>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex-shrink-0 flex items-center justify-center text-[10px] text-white">
                {otherUser.charAt(0).toUpperCase()}
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-[var(--color-border-glass)] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] opacity-60" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] opacity-60" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] opacity-60" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-black/5 border-t border-[var(--color-border-glass)] flex items-end gap-2">
          <div className="flex gap-2 text-[var(--color-text-muted)] pb-3 px-1">
            <button className="hover:text-[var(--color-accent-primary)] transition-colors"><Paperclip className="w-5 h-5" /></button>
            <button className="hover:text-[var(--color-accent-primary)] transition-colors"><ImageIcon className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 bg-[var(--color-bg-glass)] backdrop-blur-md border border-[var(--color-border-glass)] rounded-2xl flex items-end shadow-inner mb-1">
            <button className="p-3 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 max-h-32 bg-transparent border-none focus:outline-none resize-none py-3 text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]"
              rows={1}
            />
            <button className="p-3 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-3 mb-1 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
