import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, Send, LogIn, LogOut, Sprout, TrendingUp, Medal } from 'lucide-react';

const GameUI = ({ 
  session, 
  profile, 
  onLogin, 
  onLogout, 
  onAction 
}) => {
  const [text, setText] = useState('');
  const [flyingTexts, setFlyingTexts] = useState([]);

  const handleAction = (type) => {
    if (!text.trim()) return;
    
    // Add to flying texts animation
    const id = Date.now();
    setFlyingTexts(prev => [...prev, { id, text, type }]);
    
    // Trigger game logic
    onAction(type, text);
    
    // Reset
    setText('');
    setTimeout(() => {
      setFlyingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors duration-500">
            ONION<span className="text-green-500">GAME</span>
          </h1>
          <div className="flex gap-2">
            {!session ? (
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold shadow-2xl hover:scale-105 transition-all"
              >
                <LogIn size={16} /> Sign in with Google
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full text-sm font-bold shadow-xl hover:scale-105 transition-all"
              >
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          {[
            { label: 'Level', val: profile.praise_level, icon: Medal, color: 'text-yellow-500' },
            { label: 'Exp', val: profile.praise_exp, icon: TrendingUp, color: 'text-blue-500' },
            { label: 'Fertilizer', val: profile.fertilizer_count, icon: Sprout, color: 'text-green-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-colors duration-500">
              <stat.icon className={stat.color} size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">{stat.label}</span>
                <span className="text-xl font-black leading-none dark:text-white">{stat.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flying Texts Overlay */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {flyingTexts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: 400, scale: 0.5 }}
              animate={{ opacity: 0, y: -200, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`text-2xl font-bold px-4 py-2 rounded-full shadow-2xl ${
                item.type === 'blame' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-gray-900'
              }`}
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer / Input */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 pointer-events-auto">
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col gap-4 transition-all duration-500">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Talk to your onion..."
            className="w-full h-20 bg-transparent border-none focus:ring-0 resize-none text-lg text-gray-900 dark:text-white placeholder-gray-400"
          />
          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              {profile.fertilizer_count > 0 && (
                <span className="flex items-center gap-1 text-yellow-500 animate-pulse">
                  <Star size={12} fill="currentColor" /> Bonus Active
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('blame')}
                disabled={!text.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
              >
                <Flame size={16} /> Blame
              </button>
              <button
                onClick={() => handleAction('praise')}
                disabled={!text.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all disabled:opacity-30"
              >
                <Star size={16} /> Praise
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
