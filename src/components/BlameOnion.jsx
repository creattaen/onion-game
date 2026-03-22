import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import VoiceInput from './VoiceInput';
import { Trash2 } from 'lucide-react';

const BlameOnion = ({ onBlame }) => {
  const [text, setText] = useState('');
  const controls = useAnimation();
  const MotionDiv = motion.div;

  const handleAction = async () => {
    if (!text.trim()) return;

    // Animation: Burn/Shrink effect
    await controls.start({
      scale: [1, 1.2, 0],
      rotate: [0, 10, -10, 0],
      opacity: [1, 1, 0],
      transition: { duration: 0.8 }
    });

    onBlame(text);
    setText('');

    // Reset onion
    controls.set({ scale: 1, opacity: 1 });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-900 text-white transition-all duration-500">
      <h2 className="text-2xl font-bold mb-4 text-red-400">Blame Onion</h2>
      <p className="text-sm text-gray-400 mb-8">Release your stress here.</p>

      <div className="relative mb-12">
        <MotionDiv
          animate={controls}
          className="text-8xl cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          🧅
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full -z-10" />
        </MotionDiv>
      </div>
...

      <div className="w-full max-w-md space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your negative thoughts..."
            className="w-full h-32 p-4 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none resize-none text-white placeholder-gray-500"
          />
          <div className="absolute right-2 bottom-2 flex gap-2">
            <VoiceInput onTranscriptChange={setText} />
          </div>
        </div>
        
        <button
          onClick={handleAction}
          disabled={!text.trim()}
          className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 size={20} />
          Burn into Fertilizer
        </button>
      </div>
    </div>
  );
};

export default BlameOnion;
