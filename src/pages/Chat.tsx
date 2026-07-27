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
  Smile,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { profileRepo } from '../repositories/ProfileRepository';
import type { Profile } from '../types';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'yuvi' | 'manvi';
  photo?: string;
  photoCaption?: string;
  sticker?: string;
  isVoice?: boolean;
  createdAt: string;
  isSaved?: boolean;
  reaction?: string;
}

const CHAT_REACTIONS = ['❤️', '🔥', '😂', '💖', '👍', '🥰'];

const LOVE_STICKERS = [
  '💖', '💌', '🌹', '🧸', '👑', '🎁', '🎀', '🐼', '🐾', '💕', '🍦', '🦄', '✨', '💐', '💍', '🍓'
];

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<'yuvi' | 'manvi'>('yuvi');
  const [loading, setLoading] = useState(true);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<{ photo: string; caption?: string } | null>(null);
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null);
  const [showStickerDrawer, setShowStickerDrawer] = useState(false);

  // Real user profiles
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
          sticker: data.sticker || undefined,
          isVoice: data.isVoice || false,
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
  }, [messages, attachedPhoto]);

  // Handle Photo upload (Base64)
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
        setAttachedPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (overrides?: { text?: string; sticker?: string; isVoice?: boolean }) => {
    const textToSend = overrides?.text ?? inputText.trim();
    const photoToSend = attachedPhoto;
    const captionToSend = photoCaption.trim();
    const stickerToSend = overrides?.sticker;
    const isVoiceToSend = overrides?.isVoice ?? false;

    if (!textToSend && !photoToSend && !stickerToSend && !isVoiceToSend) return;

    setInputText('');
    setAttachedPhoto(null);
    setPhotoCaption('');
    setShowStickerDrawer(false);

    try {
      await addDoc(collection(db, 'forever_us_chat'), {
        text: textToSend,
        sender: currentUser,
        photo: photoToSend || null,
        photoCaption: captionToSend || null,
        sticker: stickerToSend || null,
        isVoice: isVoiceToSend,
        createdAt: new Date().toISOString(),
        isSaved: true
      });
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  const handleSendSticker = (stickerEmoji: string) => {
    handleSend({ sticker: stickerEmoji });
  };

  const handleSendVoiceNote = () => {
    handleSend({ text: '🎵 Voice Note (0:08)', isVoice: true });
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

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'forever_us_chat', messageId));
      setActiveReactionId(null);
    } catch (e) {
      console.error('Failed to delete message:', e);
    }
  };

  const handleClearAllChat = async () => {
    if (!window.confirm('Are you sure you want to delete all messages in this chat?')) return;
    try {
      const chatRef = collection(db, 'forever_us_chat');
      const snapshot = await getDocs(chatRef);
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.error('Failed to clear chat history:', e);
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
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col h-[100dvh] w-full max-w-md mx-auto overflow-hidden font-sans select-none">
      
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Profile Picture Avatar */}
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
              <div className="flex items-center gap-0.5 bg-rose-500/20 text-rose-400 text-[11px] font-black px-1.5 py-0.5 rounded-full border border-rose-500/30">
                <Flame className="w-3 h-3 fill-rose-400" />
                <span>108</span>
              </div>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Now
            </p>
          </div>
        </div>

        {/* Actions: Clear Chat & Sender Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAllChat}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-full transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>

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
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
            Messages Saved • Today
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-500 animate-pulse">
            Opening Chat...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
            <div className="w-16 h-16 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center text-3xl border border-pink-500/20">
              💬
            </div>
            <p className="text-sm font-semibold text-slate-300">No Messages Yet</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Send a text, photo, or love sticker to start chatting with {otherUser}!
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
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col space-y-1 relative group"
                >
                  <div className="flex items-start gap-2">
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-slate-700 bg-slate-800 flex items-center justify-center">
                      {senderProfile?.photo ? (
                        <img src={senderProfile.photo} alt={msg.sender} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold uppercase text-white">{msg.sender.charAt(0)}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-black capitalize ${
                            isMine ? 'text-blue-400' : 'text-pink-400'
                          }`}>
                            {senderProfile?.name || msg.sender}
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>

                        {/* Individual Delete Message Button */}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Photo Attachment */}
                      {msg.photo && (
                        <div 
                          onClick={() => setPreviewPhoto({ photo: msg.photo!, caption: msg.photoCaption })}
                          className="relative max-w-[200px] rounded-2xl overflow-hidden border border-slate-700 shadow-md cursor-pointer group bg-slate-800"
                        >
                          <img 
                            src={msg.photo} 
                            alt="Attached" 
                            className="w-full max-h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {msg.photoCaption && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1.5 px-3 text-center text-[11px] font-bold text-white border-t border-white/10">
                              {msg.photoCaption}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Love Sticker */}
                      {msg.sticker && (
                        <div className="text-5xl my-1 animate-bounce">
                          {msg.sticker}
                        </div>
                      )}

                      {/* Voice Note Simulation */}
                      {msg.isVoice && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2 rounded-2xl text-xs font-bold max-w-[200px] shadow-md">
                          <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
                          <span>Voice Note</span>
                          <div className="flex gap-0.5 items-center ml-auto">
                            <span className="w-1 h-3 bg-white rounded-full animate-bounce" />
                            <span className="w-1 h-4 bg-white rounded-full animate-bounce delay-100" />
                            <span className="w-1 h-2 bg-white rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      )}

                      {/* Text Card */}
                      {msg.text && !msg.isVoice && (
                        <div 
                          onClick={() => setActiveReactionId(isReactionActive ? null : msg.id)}
                          onDoubleClick={() => handleAddReaction(msg.id, '❤️')}
                          className={`px-3 py-1.5 rounded-2xl text-xs leading-relaxed text-slate-100 shadow-sm inline-block max-w-[85%] break-words cursor-pointer transition-all ${
                            isMine 
                              ? 'bg-blue-600/90 rounded-tr-none' 
                              : 'bg-pink-600/90 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}

                      {/* Reaction & Status */}
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

                      {/* Reaction Picker & Message Actions */}
                      <AnimatePresence>
                        {isReactionActive && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-1 bg-slate-800 border border-slate-700 p-1 rounded-full w-max shadow-xl mt-1"
                          >
                            {CHAT_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleAddReaction(msg.id, emoji)}
                                className="text-sm hover:scale-125 transition-transform p-1"
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-slate-400 hover:text-rose-400 p-1 border-l border-slate-700 ml-1"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* Photo Pending Preview */}
      {attachedPhoto && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={attachedPhoto} alt="Preview" className="w-12 h-12 object-cover rounded-xl border-2 border-blue-500" />
                <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-400">Photo Attached 📸</p>
                <p className="text-[10px] text-slate-400">Add a caption before sending</p>
              </div>
            </div>
            <button 
              onClick={() => { setAttachedPhoto(null); setPhotoCaption(''); }} 
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            placeholder="Add a photo caption..."
            className="w-full bg-black/60 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />
        </div>
      )}

      {/* Love Stickers Drawer */}
      <AnimatePresence>
        {showStickerDrawer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900 border-t border-slate-800 p-3 shrink-0 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">Send a Love Sticker ✨</span>
              <button onClick={() => setShowStickerDrawer(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2 text-2xl py-1">
              {LOVE_STICKERS.map((sticker) => (
                <button
                  key={sticker}
                  onClick={() => handleSendSticker(sticker)}
                  className="hover:scale-125 transition-transform p-1 text-center"
                >
                  {sticker}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0 pb-6 md:pb-3">
        
        {/* Photo Button */}
        <label className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-blue-400 flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-md border border-slate-700">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoSelect} 
            className="hidden" 
          />
          <Camera className="w-4 h-4" />
        </label>

        {/* Sticker Toggle Button */}
        <button
          type="button"
          onClick={() => setShowStickerDrawer(!showStickerDrawer)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 border border-slate-700 ${
            showStickerDrawer ? 'bg-pink-600 text-white' : 'bg-slate-800 text-pink-400 hover:bg-slate-700'
          }`}
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Text Input Pill */}
        <div className="flex-1 bg-slate-800/90 border border-slate-700 rounded-full flex items-center px-3 shadow-inner">
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
            onClick={handleSendVoiceNote}
            className="text-slate-400 hover:text-white p-1"
            title="Send Voice Note"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Send Button */}
        <button 
          type="button"
          onClick={() => handleSend()}
          disabled={!inputText.trim() && !attachedPhoto}
          className="w-9 h-9 bg-[#0084FF] hover:bg-blue-600 text-white rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md flex items-center justify-center shrink-0 active:scale-95"
        >
          <Send className="w-4 h-4 fill-white" />
        </button>
      </div>

      {/* Fullscreen Photo Viewer */}
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
                alt="Fullscreen" 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
              {previewPhoto.caption && (
                <div className="absolute inset-x-0 bottom-8 bg-black/80 py-2 px-4 text-center font-bold text-sm text-white tracking-wider border-t border-white/20">
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
