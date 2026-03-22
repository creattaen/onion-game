import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import OnionScene from './components/OnionScene';
import GameUI from './components/GameUI';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [theme, setTheme] = useState('light');
  const [session, setSession] = useState(null);
  const [onionStatus, setOnionStatus] = useState('normal');
  const [profile, setProfile] = useState({
    fertilizer_count: 0,
    praise_exp: 0,
    praise_level: 1
  });

  // Auth & Profile Fetching
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert([{ user_id: userId, fertilizer_count: 0, praise_exp: 0, praise_level: 1 }])
        .select()
        .single();
      if (newProfile) setProfile(newProfile);
    } else if (data) {
      setProfile(data);
    }
  };

  const updateProfile = async (updates) => {
    if (!session) {
      setProfile(prev => ({ ...prev, ...updates }));
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', session.user.id)
      .select()
      .single();
    if (data) setProfile(data);
  };

  // Game Actions
  const handleAction = (type, text) => {
    setOnionStatus(type);
    
    if (type === 'blame') {
      updateProfile({ fertilizer_count: profile.fertilizer_count + 1 });
    } else {
      const baseExp = text.length * 2;
      const bonus = profile.fertilizer_count > 0 ? 1.5 : 1.0;
      const gainedExp = Math.floor(baseExp * bonus);
      
      let newExp = profile.praise_exp + gainedExp;
      let newLevel = profile.praise_level;
      let newFertilizer = profile.fertilizer_count > 0 ? profile.fertilizer_count - 1 : 0;

      const nextLevelExp = (newLevel * (newLevel + 1) / 2) * 100;
      if (newExp >= nextLevelExp) {
        newLevel += 1;
        // Level up trigger can be handled here if needed (e.g. sound)
      }

      updateProfile({
        praise_exp: newExp,
        praise_level: newLevel,
        fertilizer_count: newFertilizer
      });
    }

    // Reset onion status after animation
    setTimeout(() => setOnionStatus('normal'), 1000);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 bg-gray-50 dark:bg-[#050505] overflow-hidden`}>
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-400/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full" />
      </div>

      {/* 3D Scene */}
      <OnionScene status={onionStatus} />

      {/* UI Overlay */}
      <GameUI 
        session={session}
        profile={profile}
        onLogin={handleLogin}
        onLogout={() => supabase.auth.signOut()}
        onAction={handleAction}
      />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 p-4 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl text-gray-900 dark:text-white hover:scale-110 active:scale-95 transition-all border border-gray-100 dark:border-gray-800"
      >
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>
    </div>
  );
}

export default App;
