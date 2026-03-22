import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import BlameOnion from './components/BlameOnion';
import PraiseOnion from './components/PraiseOnion';
import { LogIn, LogOut, TrendingUp, Sprout, Star } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({
    fertilizer_count: 0,
    praise_exp: 0,
    praise_level: 1
  });

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create profile if doesn't exist
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
      // Offline mode/Guest logic
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

  const handleBlame = (text) => {
    // We could log the text or save it to a 'burn history' if needed, 
    // but for now we just increment fertilizer.
    console.log('Burning negative thought:', text);
    updateProfile({
      fertilizer_count: profile.fertilizer_count + 1
    });
  };

  const handlePraise = (text) => {
    const baseExp = text.length * 2;
    const bonus = profile.fertilizer_count > 0 ? 1.5 : 1.0;
    const gainedExp = Math.floor(baseExp * bonus);
    
    let newExp = profile.praise_exp + gainedExp;
    let newLevel = profile.praise_level;
    let newFertilizer = profile.fertilizer_count > 0 ? profile.fertilizer_count - 1 : 0;

    // Level up logic (100, 300, 600, 1000...)
    const nextLevelExp = (newLevel * (newLevel + 1) / 2) * 100;
    if (newExp >= nextLevelExp) {
      newLevel += 1;
    }

    updateProfile({
      praise_exp: newExp,
      praise_level: newLevel,
      fertilizer_count: newFertilizer
    });
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile({ fertilizer_count: 0, praise_exp: 0, praise_level: 1 });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      {/* Header / Stats Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="flex justify-between items-start max-w-6xl mx-auto">
          <div className="flex gap-4 pointer-events-auto">
            {!session ? (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium transition-all"
              >
                <LogIn size={16} /> Sign in
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-black/10 hover:bg-black/20 backdrop-blur-md border border-black/10 rounded-full text-sm font-medium transition-all"
              >
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 pointer-events-auto items-end">
            <div className="flex gap-3 bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 px-3 border-r border-gray-200 dark:border-gray-700">
                <Star className="text-yellow-500 fill-yellow-500" size={18} />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Level</span>
                  <span className="text-lg font-black leading-none">{profile.praise_level}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 border-r border-gray-200 dark:border-gray-700">
                <TrendingUp className="text-blue-500" size={18} />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Exp</span>
                  <span className="text-lg font-black leading-none">{profile.praise_exp}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3">
                <Sprout className="text-green-500" size={18} />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Fertilizer</span>
                  <span className="text-lg font-black leading-none">{profile.fertilizer_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split UI */}
      <div className="flex flex-1 flex-col md:flex-row h-full">
        <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-800">
          <BlameOnion onBlame={handleBlame} />
        </div>
        <div className="flex-1">
          <PraiseOnion onPraise={handlePraise} fertilizerCount={profile.fertilizer_count} />
        </div>
      </div>
    </div>
  );
}

export default App;
