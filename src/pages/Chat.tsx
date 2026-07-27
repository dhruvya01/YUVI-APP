import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Camera, 
  Send, 
  Flame, 
  X,
  Bookmark,
  CheckCheck,
  Mic,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { profileRepo } from '../repositories/ProfileRepository';
import type { Profile } from '../types';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'yuvi' | 'manvi';
  photo?: string;
  photoCaption?: string;
  createdAt: string;
  isSaved?: boolean;
  reaction?: string;
}

const SNAP_REACTIONS = ['❤️', '🔥', '😂', '👻', '💖', '👍'];

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<'yuvi' | 'manvi'>('yuvi');
  const [loading, setLoading] = useState(true);
  const [snapPhoto, setSnapPhoto] = useState<string | null>(null);
  const [snapCaption, setSnapCaption] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<{ photo: string; caption?: string } | null>(null);
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null);

  // Real user profiles with Base64 photos
  const [yuviProfile, setYuviProfile] = useState<Profile | null>(null);
  const [manviProfile, setManviProfile] = useState<Profile | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUser = currentUser === 'yuvi' ? 'manvi' : 'yuvi';
  const activeOtherProfile = otherUser === 'manvi' ? manviProfile : yuviProfile;
  const activeSelfProfile = currentUser === 'yuvi' ? yuviProfile : manviProfile;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load real profile data
  useEffect(() => {
    async function loadUserProfiles() {
      try {
        const y = await profileRepo.getYuvi();
        const m = await profileRepo.getManvi();
        setYuviProfile(y);
        setManviProfile(m);
      } catch (e) {
        console.error('Failed to fetch user profiles for chat:', e);
      }
    }
    loadUserProfiles();
  }, []);

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
          photo: data.photo || undefined,
          photoCaption: data.photoCaption || undefined,
          createdAt: data.createdAt || new Date().toISOString(),
          isSaved: data.isSaved ?? true,
          reaction: data.reaction || undefined
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
  }, [messages, snapPhoto]);

  // Handle Photo Snap upload (Base64)
  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSnapPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!inputText.trim() && !snapPhoto) return;

    const textToSend = inputText.trim();
    const photoToSend = snapPhoto;
    const captionToSend = snapCaption.trim();

    setInputText('');
    setSnapPhoto(null);
    setSnapCaption('');

    try {
      await addDoc(collection(db, 'forever_us_chat'), {
        text: textToSend,
        sender: currentUser,
        photo: photoToSend || null,
        photoCaption: captionToSend || null,
        createdAt: new Date().toISOString(),
        isSaved: true
      });
    } catch (e) {
      console.error('Error sending Snapchat message:', e);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      const msgRef = doc(db, 'forever_us_chat', messageId);
      await updateDoc(msgRef, { reaction: emoji });
      setActiveReactionId(null);
    } catch (e) {
      console.error('Failed to add reaction:', e);
    }
  };

  const formatSnapTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col h-[100dvh] w-full max-w-md mx-auto overflow-hidden font-sans select-none">
      
      {/* Snapchat Header */}
      <div className="px-4 py-3 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Profile Picture Avatar with Ring */}
          <div className="relative">
            <div className={`w-10 h-10 rounded-full p-0.5 shadow-lg overflow-hidden ${
              otherUser === 'manvi' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' : 'bg-gradient-to-tr from-yellow-400 via-blue-500 to-indigo-500'
            }`}>
              {activeOtherProfile?.photo ? (
                <img src={activeOtherProfile.photo} alt={otherUser} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-sm text-white">
                  {otherUser.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold capitalize tracking-tight text-white">
                {activeOtherProfile?.name || otherUser}
              </h2>
              {/* Snapchat Streak Badge */}
              <div className="flex items-center gap-0.5 bg-amber-500/20 text-amber-400 text-[11px] font-black px-1.5 py-0.5 rounded-full border border-amber-500/30">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>108</span>
              </div>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Now
            </p>
          </div>
        </div>

        {/* Sender Identity Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-full border border-slate-700">
          <button
            onClick={() => setCurrentUser('yuvi')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
              currentUser === 'yuvi' ? 'bg-[#0084FF] text-white shadow-md' : 'text-slate-400'
            }`}
          >
            {yuviProfile?.photo && <img src={yuviProfile.photo} alt="Yuvi" className="w-3.5 h-3.5 rounded-full object-cover" />}
            Yuvi 💙
          </button>
          <button
            onClick={() => setCurrentUser('manvi')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
              currentUser === 'manvi' ? 'bg-[#FF2A85] text-white shadow-md' : 'text-slate-400'
            }`}
          >
            {manviProfile?.photo && <img src={manviProfile.photo} alt="Manvi" className="w-3.5 h-3.5 rounded-full object-cover" />}
            Manvi 💖
          </button>
        </div>
      </div>

      {/* Snapchat Chat Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        
        {/* Top Date Header */}
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
            Saved in Chat • Today
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-500 animate-pulse">
            Opening Chat...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
            <div className="w-16 h-16 rounded-full bg-yellow-400/10 text-yellow-400 flex items-center justify-center text-3xl border border-yellow-400/20">
              👻
            </div>
            <p className="text-sm font-semibold text-slate-300">No Chat History Yet</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Send a Chat or Snap photo to start your conversation!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMine = msg.sender === currentUser;
              const senderProfile = msg.sender === 'yuvi' ? yuviProfile : manviProfile;
              const isReactionActive = activeReactionId === msg.id;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col space-y-1 relative"
                >
                  <div className="flex items-start gap-2">
                    {/* Profile Picture Thumbnail next to message */}
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-slate-700 bg-slate-800 flex items-center justify-center">
                      {senderProfile?.photo ? (
                        <img src={senderProfile.photo} alt={msg.sender} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold uppercase text-white">{msg.sender.charAt(0)}</span>
                      )}
                    </div>

                    {/* Snapchat Color Bar Indicator */}
                    <div className={`w-1 self-stretch rounded-full shrink-0 ${
                      msg.photo ? 'bg-[#FFFC00]' : isMine ? 'bg-[#0084FF]' : 'bg-[#FF2A85]'
                    }`} />

                    <div className="flex-1 space-y-1">
                      {/* Sender Name & Snap Badge */}
                      <div className="flex items-center gap-1.5">
                        {msg.photo ? (
                          <div className="w-2.5 h-2.5 bg-rose-500 rounded-sm" title="Red Photo Snap" />
                        ) : (
                          <MessageSquare className="w-2.5 h-2.5 text-blue-400" />
                        )}
                        <span className={`text-xs font-black capitalize ${
                          isMine ? 'text-blue-400' : 'text-pink-400'
                        }`}>
                          {senderProfile?.name || msg.sender}
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium">
                          {formatSnapTime(msg.createdAt)}
                        </span>
                      </div>

                      {/* Snap Photo Attachment with Snapchat Banner Overlay */}
                      {msg.photo && (
                        <div 
                          onClick={() => setPreviewPhoto({ photo: msg.photo!, caption: msg.photoCaption })}
                          className="relative max-w-[180px] rounded-xl overflow-hidden border border-slate-700 shadow-md cursor-pointer group bg-slate-800"
                        >
                          <img 
                            src={msg.photo} 
                            alt="Snap" 
                            className="w-full max-h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {msg.photoCaption && (
                            <div className="absolute inset-x-0 bottom-6 bg-black/75 py-1 px-2 text-center text-[10px] font-bold text-white tracking-wide border-y border-white/10">
                              {msg.photoCaption}
                            </div>
                          )}
                          <div className="absolute bottom-1 left-1.5 bg-black/60 backdrop-blur-md text-[8px] px-1.5 py-0.5 rounded-full font-bold text-yellow-400 flex items-center gap-1">
                            <span>📷 Snap</span>
                          </div>
                        </div>
                      )}

                      {/* Compact Snapchat Saved-in-Chat Text Card */}
                      {msg.text && (
                        <div 
                          onClick={() => setActiveReactionId(isReactionActive ? null : msg.id)}
                          className="bg-slate-800/90 border-l-2 border-slate-600 px-2.5 py-1 rounded-r-xl rounded-bl-xl text-xs leading-snug text-slate-100 shadow-sm inline-block max-w-[80%] break-words cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                          {msg.text}
                        </div>
                      )}

                      {/* Snapchat Reaction & Status */}
                      <div className="flex items-center gap-2 text-[8px] text-slate-500 font-medium pl-0.5">
                        <div className="flex items-center gap-0.5">
                          <Bookmark className="w-2 h-2 text-slate-400 fill-slate-400" />
                          <span>Saved</span>
                        </div>
                        {msg.reaction && (
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded-full text-[10px] border border-slate-700 animate-bounce">
                            {msg.reaction}
                          </span>
                        )}
                        {isMine && <CheckCheck className="w-2.5 h-2.5 text-blue-400" />}
                      </div>

                      {/* Snapchat Quick Reaction Picker */}
                      <AnimatePresence>
                        {isReactionActive && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-1 bg-slate-800 border border-slate-700 p-1 rounded-full w-max shadow-xl mt-1"
                          >
                            {SNAP_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleAddReaction(msg.id, emoji)}
                                className="text-sm hover:scale-125 transition-transform p-1"
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Snap Photo Pending Preview with Snapchat Banner Editor */}
      {snapPhoto && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={snapPhoto} alt="Snap preview" className="w-12 h-12 object-cover rounded-xl border-2 border-yellow-400" />
                <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <p className="text-xs font-bold text-yellow-400">Snap Photo Ready 📸</p>
                <p className="text-[10px] text-slate-400">Add a classic Snapchat banner overlay</p>
              </div>
            </div>
            <button 
              onClick={() => { setSnapPhoto(null); setSnapCaption(''); }} 
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={snapCaption}
            onChange={(e) => setSnapCaption(e.target.value)}
            placeholder="Add a Snapchat caption bar..."
            className="w-full bg-black/60 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
          />
        </div>
      )}

      {/* Snapchat Input & Action Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0 pb-6 md:pb-3">
        
        {/* Camera Snap Button */}
        <label className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-yellow-400 flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-md border border-slate-700">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoSelect} 
            className="hidden" 
          />
          <Camera className="w-5 h-5" />
        </label>

        {/* Text Input Pill */}
        <div className="flex-1 bg-slate-800/90 border border-slate-700 rounded-full flex items-center px-3.5 shadow-inner">
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
            placeholder={`Message as ${activeSelfProfile?.name || currentUser}...`}
            className="w-full bg-transparent border-none focus:outline-none py-2 text-slate-100 placeholder-slate-500 text-xs font-sans"
          />
          <button 
            type="button" 
            onClick={() => alert('Voice note recorded! 🎙️')}
            className="text-slate-400 hover:text-white p-1"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Send Button */}
        <button 
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim() && !snapPhoto}
          className="w-10 h-10 bg-[#0084FF] hover:bg-blue-600 text-white rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md flex items-center justify-center shrink-0 active:scale-95"
        >
          <Send className="w-4 h-4 fill-white" />
        </button>
      </div>

      {/* Fullscreen Photo Snap Modal Viewer */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl"
            onClick={() => setPreviewPhoto(null)}
          >
            <button 
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-white z-50"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative max-w-full max-h-[85vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <img 
                src={previewPhoto.photo} 
                alt="Snap Fullscreen" 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
              {previewPhoto.caption && (
                <div className="absolute inset-x-0 bottom-12 bg-black/75 py-2 px-4 text-center font-bold text-sm text-white tracking-wider border-y border-white/20">
                  {previewPhoto.caption}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
