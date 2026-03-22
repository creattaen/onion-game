import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import VoiceInput from './VoiceInput';
import { Heart, Zap } from 'lucide-react';

const PraiseOnion = ({ onPraise, fertilizerCount }) => {
  const [text, setText] = useState('');
  const controls = useAnimation();
  const MotionDiv = motion.div;

  const handleAction = async () => {
    if (!text.trim()) return;

    // Animation: Grow/Pulse effect
    await controls.start({
      scale: [1, 1.4, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.6 }
    });

    onPraise(text);
    setText('');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-white text-gray-900 transition-all duration-500">
      <h2 className="text-2xl font-bold mb-4 text-green-600">Praise Onion</h2>
      <p className="text-sm text-gray-500 mb-8">Grow your positive energy.</p>

      <div className="relative mb-12">
        <MotionDiv
          animate={controls}
          className="text-8xl cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          🧅
          <div className="absolute inset-0 bg-green-500/10 blur-2xl rounded-full -z-10" />
        </MotionDiv>
      </div>
...

      <div className="w-full max-w-md space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your praises or positive affirmations..."
            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none resize-none text-gray-800 placeholder-gray-400"
          />
          <div className="absolute right-2 bottom-2 flex gap-2">
            <VoiceInput onTranscriptChange={setText} />
          </div>
        </div>
        
        <button
          onClick={handleAction}
          disabled={!text.trim()}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors group relative overflow-hidden"
        >
          <Heart size={20} className="group-hover:fill-current" />
          <span>Send Praise</span>
          {fertilizerCount > 0 && (
            <span className="ml-2 flex items-center gap-1 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full animate-bounce">
              <Zap size={12} />
              1.5x Bonus Active
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default PraiseOnion;
