import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { supabase } from './supabaseClient';
import OnionScene from './components/OnionScene';
import { Moon, Sun, LogIn, LogOut, Star, Flame, Medal, TrendingUp, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [theme, setTheme] = useState('light');
  const [session, setSession] = useState(null);
  const [onionStatus, setOnionStatus] = useState('normal');
  const [profile, setProfile] = useState({ fertilizer_count: 0, praise_exp: 0, praise_level: 1 });
  const [text, setText] = useState('');
  const [flyingTexts, setFlyingTexts] = useState([]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (error && error.code === 'PGRST116') {
      const { data: newProfile } = await supabase.from('profiles').insert([{ user_id: userId, fertilizer_count: 0, praise_exp: 0, praise_level: 1 }]).select().single();
      if (newProfile) setProfile(newProfile);
    } else if (data) setProfile(data);
  };

  const updateProfile = async (updates) => {
    if (!session) { setProfile(prev => ({ ...prev, ...updates })); return; }
    const { data } = await supabase.from('profiles').update(updates).eq('user_id', session.user.id).select().single();
    if (data) setProfile(data);
  };

  const handleAction = (type) => {
    if (!text.trim()) return;
    const id = Date.now();
    setFlyingTexts(prev => [...prev, { id, text, type }]);
    setOnionStatus(type);
    
    if (type === 'blame') {
      updateProfile({ fertilizer_count: profile.fertilizer_count + 1 });
    } else {
      const baseExp = text.length * 2;
      const bonus = profile.fertilizer_count > 0 ? 1.5 : 1.0;
      updateProfile({
        praise_exp: profile.praise_exp + Math.floor(baseExp * bonus),
        fertilizer_count: profile.fertilizer_count > 0 ? profile.fertilizer_count - 1 : 0
      });
    }
    setText('');
    setTimeout(() => setOnionStatus('normal'), 1000);
    setTimeout(() => setFlyingTexts(prev => prev.filter(t => t.id !== id)), 1000);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden transition-colors duration-500 bg-white text-black dark:bg-gray-900 dark:text-white">
      
      {/* 3D 배경 */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <OnionScene status={onionStatus} />
        </Canvas>
      </div>

      {/* Flying Texts Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[5] flex items-center justify-center">
        <AnimatePresence>
          {flyingTexts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: 200, scale: 0.5 }}
              animate={{ opacity: 0, y: -200, scale: 1.5 }}
              className={`absolute text-2xl font-bold px-4 py-2 rounded-full shadow-2xl ${item.type === 'blame' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-gray-900'}`}
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 상단 UI (좌측 상단 고정) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-4 pointer-events-auto">
        <h1 className="text-3xl font-black tracking-tighter">ONION<span className="text-green-500">GAME</span></h1>
        <div className="flex gap-2">
          {!session ? (
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold shadow-xl">
              <LogIn size={16} /> Login
            </button>
          ) : (
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-full text-sm font-bold shadow-xl">
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <StatBox icon={Medal} label="LV" val={profile.praise_level} color="text-yellow-500" />
          <StatBox icon={TrendingUp} label="EXP" val={profile.praise_exp} color="text-blue-500" />
          <StatBox icon={Sprout} label="FERT" val={profile.fertilizer_count} color="text-green-500" />
        </div>
      </div>

      {/* 테마 변경 버튼 (우측 상단 고정) */}
      <div className="absolute top-4 right-4 z-10">
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </div>

      {/* 하단 채팅 바 (하단 중앙 고정) */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 w-[90%] max-w-2xl bg-white/80 dark:bg-black/80 p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Talk to your onion..."
          className="w-full h-20 bg-transparent border-none focus:ring-0 resize-none text-lg placeholder-gray-400"
        />
        <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-3">
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
            {profile.fertilizer_count > 0 && "Bonus Active"}
          </span>
          <div className="flex gap-2">
            <button onClick={() => handleAction('blame')} disabled={!text.trim()} className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-xl font-bold disabled:opacity-30">
              <Flame size={16} /> Blame
            </button>
            <button onClick={() => handleAction('praise')} disabled={!text.trim()} className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-xl font-bold disabled:opacity-30">
              <Star size={16} /> Praise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatBox = ({ icon: Icon, label, val, color }) => (
  <div className="bg-white/70 dark:bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-sm flex items-center gap-2 min-w-[70px]">
    <Icon className={color} size={14} />
    <div className="flex flex-col">
      <span className="text-[8px] font-bold text-gray-400">{label}</span>
      <span className="text-sm font-black leading-none">{val}</span>
    </div>
  </div>
);

export default App;
