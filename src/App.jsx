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

  // Theme Management
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
      }

      updateProfile({
        praise_exp: newExp,
        praise_level: newLevel,
        fertilizer_count: newFertilizer
      });
    }

    setTimeout(() => setOnionStatus('normal'), 1000);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div className="w-full h-full relative transition-colors duration-500 bg-white text-black dark:bg-gray-900 dark:text-white overflow-hidden">
      {/* 3D Scene - Background layer */}
      <div className="absolute inset-0 z-0">
        <OnionScene status={onionStatus} />
      </div>

      {/* UI Overlay - Foreground layer */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        <GameUI 
          session={session}
          profile={profile}
          onLogin={handleLogin}
          onLogout={() => supabase.auth.signOut()}
          onAction={handleAction}
        />
      </div>

      {/* Theme Toggle - High z-index foreground */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-2xl rounded-2xl text-gray-900 dark:text-white hover:scale-110 active:scale-95 transition-all border border-gray-100 dark:border-gray-700 pointer-events-auto"
      >
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      {/* Background Decor - Minimal for cleaner look */}
      <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-400/10 dark:bg-green-400/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 dark:bg-blue-400/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

export default App;
