import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JudgeSystem } from './JudgeSystem';

const JudgeCard = ({ judge, score, reaction, isReacting, integrated = false }) => {
  const judgeBoxStyle = {
    background: isReacting 
      ? 'linear-gradient(145deg, #fff3cd, #ffeaa7)' 
      : 'linear-gradient(145deg, #f0f0f0, #d0d0d0)',
    border: `2px solid ${isReacting ? '#f39c12' : '#999'}`,
    borderRadius: '8px'
  };

  const integratedStyle = integrated ? {
    ...judgeBoxStyle,
    background: isReacting 
      ? 'linear-gradient(145deg, rgba(255,243,205,0.95), rgba(255,234,167,0.95))' 
      : 'linear-gradient(145deg, rgba(240,240,240,0.95), rgba(208,208,208,0.95))',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  } : judgeBoxStyle;

  return (
    <motion.div 
      className={`text-center transition-all duration-300 ${integrated ? 'p-2' : 'p-3'}`}
      style={integratedStyle}
      animate={isReacting ? { scale: 1.05 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="mb-1 flex justify-center"
        animate={isReacting ? { rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <img 
          src={judge.avatar} 
          alt={judge.name}
          className={integrated ? "w-10 h-10 object-contain" : "w-12 h-12 object-contain"}
        />
      </motion.div>
      
      <div className={`font-semibold ${integrated ? 'text-xs' : 'text-xs'}`}>{judge.name}</div>
      <div className={`text-gray-600 ${integrated ? 'text-xs' : 'text-xs'}`}>{judge.specialty}</div>
      
      <div className={`mt-1 font-bold ${integrated ? 'text-xs' : 'text-sm'}`}>
        {score !== undefined ? score.toFixed(1) : '--'}
      </div>

      <AnimatePresence>
        {reaction && isReacting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-1 text-gray-700 bg-white bg-opacity-70 rounded px-2 py-1 ${integrated ? 'text-xs' : 'text-xs'}`}
          >
            {reaction}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const JudgesPanel = ({ 
  lastPlayedCard = null, 
  currentScore = 0, 
  flowLength = 0, 
  flowBroke = false,
  competitionLevel = 'Training',
  integrated = false,
  selectedJudges = null, // New judge system
  onJudgeClick = null // Callback for judge clicks
}) => {
  // Fixed assignments: Each visual judge always has the same scoring system
  const judgeAssignments = {
    'queen': 'perfectionist',      // Judge Regina is The Perfectionist
    'maestro': 'finishersEye',     // Judge Maestro is Finisher's Eye  
    'samurai': 'linearityJudge',   // Judge Takeshi is Linearity Judge
    'alien': 'maverick',           // Judge Zyx is The Maverick
    'hero': 'reboundJudge',        // Judge Hero is Rebound Judge
    'icecream': 'improvisationAficionado', // Judge Gelato is Improvisation Aficionado
    'robot': 'sprinter',           // Judge X-42 is The Sprinter
    'strongman': 'marathoner',     // Judge Atlas is The Marathoner
    'typewriter': 'punctualist',   // Judge Quill is The Punctualist
    'cowboy': 'paletteJudge',      // Judge Tex is Palette Judge
    'gachaman': 'gaitSpecialist',  // Judge Gachi is Gait Specialist
    'ghost': 'handManagementJudge' // Judge Phantom is Hand Management Judge
  };

  // All available judges with their images
  const allJudges = [
    {
      id: 'alien',
      name: 'Judge Zyx',
      avatar: '/judges/alienjudge.png',
      specialty: 'Innovation',
      preferences: ['creativity', 'unique_moves', 'risk'],
      personality: 'curious'
    },
    {
      id: 'cowboy',
      name: 'Judge Tex',
      avatar: '/judges/cowboyjudge.png',
      specialty: 'Spirit',
      preferences: ['boldness', 'freedom', 'power'],
      personality: 'laid_back'
    },
    {
      id: 'gachaman',
      name: 'Judge Gachi',
      avatar: '/judges/gachamanjudge.png',
      specialty: 'Power',
      preferences: ['strength', 'intensity', 'combos'],
      personality: 'intense'
    },
    {
      id: 'ghost',
      name: 'Judge Phantom',
      avatar: '/judges/ghostjudge.png',
      specialty: 'Grace',
      preferences: ['elegance', 'flow', 'artistry'],
      personality: 'mysterious'
    },
    {
      id: 'hero',
      name: 'Judge Hero',
      avatar: '/judges/herojudge.png',
      specialty: 'Courage',
      preferences: ['risk', 'advanced_moves', 'boldness'],
      personality: 'encouraging'
    },
    {
      id: 'icecream',
      name: 'Judge Gelato',
      avatar: '/judges/icecreammanjudge.png',
      specialty: 'Joy',
      preferences: ['variety', 'creativity', 'fun'],
      personality: 'cheerful'
    },
    {
      id: 'maestro',
      name: 'Judge Maestro',
      avatar: '/judges/maestrojudge.png',
      specialty: 'Artistry',
      preferences: ['precision', 'elegance', 'flow'],
      personality: 'refined'
    },
    {
      id: 'queen',
      name: 'Judge Regina',
      avatar: '/judges/queenjudge.png',
      specialty: 'Excellence',
      preferences: ['perfection', 'technique', 'precision'],
      personality: 'demanding'
    },
    {
      id: 'robot',
      name: 'Judge X-42',
      avatar: '/judges/robotjudge.png',
      specialty: 'Precision',
      preferences: ['accuracy', 'technique', 'consistency'],
      personality: 'analytical'
    },
    {
      id: 'samurai',
      name: 'Judge Takeshi',
      avatar: '/judges/samuraijudge.png',
      specialty: 'Discipline',
      preferences: ['technique', 'precision', 'tradition'],
      personality: 'strict'
    },
    {
      id: 'strongman',
      name: 'Judge Atlas',
      avatar: '/judges/strongmanjudge.png',
      specialty: 'Strength',
      preferences: ['power', 'boldness', 'advanced_moves'],
      personality: 'tough'
    },
    {
      id: 'typewriter',
      name: 'Judge Quill',
      avatar: '/judges/typewriterjudge.png',
      specialty: 'Narrative',
      preferences: ['creativity', 'variety', 'storytelling'],
      personality: 'thoughtful'
    }
  ];

  // Create visual judges from the new judge system
  const [judges] = useState(() => {
    if (selectedJudges && selectedJudges.length > 0) {
      // Map new judges to visual judges
      return selectedJudges.map(newJudge => {
        const visualId = judgeVisualMapping[newJudge.id];
        const visualJudge = allJudges.find(j => j.id === visualId);
        return {
          ...visualJudge,
          systemJudge: newJudge, // Keep reference to the scoring system
          name: `${newJudge.emoji} ${newJudge.name}`, // Use new judge name
          specialty: newJudge.shortDesc // Use new judge description
        };
      });
    } else {
      // Fallback to random selection if new system not available
      const shuffled = [...allJudges].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    }
  });

  const [judgeScores, setJudgeScores] = useState({});
  const [judgeReactions, setJudgeReactions] = useState({});
  const [reactingJudges, setReactingJudges] = useState({});

  // Generate judge reactions based on the card played
  const generateJudgeReaction = (judge, card, score, combo, broke) => {
    const reactions = {
      alien: {
        high: ['Fascinating!', 'Most intriguing!', 'Revolutionary!', 'Extraordinary innovation!'],
        medium: ['Interesting approach', 'Curious technique', 'Novel attempt', 'Unique perspective'],
        low: ['Too conventional', 'More creativity needed', 'Think outside reality', 'Where is innovation?'],
        combo: ['Brilliant sequence!', 'Cosmic harmony!', 'Transcendent flow!'],
        flow_broken: ['Reality disrupted', 'Dimension shifted', 'Quantum interference']
      },
      cowboy: {
        high: ['Yeehaw! Outstanding!', 'Mighty fine riding!', 'That\'s the spirit!', 'Born to ride!'],
        medium: ['Not bad, partner', 'Good honest effort', 'Getting there', 'Keep at it'],
        low: ['Needs more grit', 'Show some backbone', 'Ride with heart', 'Find your courage'],
        combo: ['Smooth as silk!', 'Like breaking a bronco!', 'Pure poetry!'],
        flow_broken: ['Lost the rhythm', 'Back to basics', 'Settle down now']
      },
      gachaman: {
        high: ['INCREDIBLE POWER!', 'MAXIMUM INTENSITY!', 'PURE STRENGTH!', 'UNSTOPPABLE!'],
        medium: ['Good energy', 'Show more power', 'Building up', 'Getting stronger'],
        low: ['Too weak!', 'MORE POWER!', 'Push harder!', 'Find your strength!'],
        combo: ['ULTIMATE COMBO!', 'CHAIN ATTACK!', 'POWER SURGE!'],
        flow_broken: ['Power disrupted', 'Energy scattered', 'Focus lost']
      },
      ghost: {
        high: ['Ethereal beauty...', 'Transcendent grace...', 'Hauntingly perfect...', 'Sublime elegance...'],
        medium: ['Gentle movement', 'Flowing nicely', 'Graceful attempt', 'Pleasant drift'],
        low: ['More soul needed', 'Find your spirit', 'Embrace the mystery', 'Let go...'],
        combo: ['Spectral harmony...', 'Ghostly perfection...', 'Ethereal flow...'],
        flow_broken: ['Spirit disrupted', 'Essence scattered', 'Lost in shadows']
      },
      hero: {
        high: ['Heroic performance!', 'Brave and bold!', 'Champion spirit!', 'Victory is yours!'],
        medium: ['Noble effort', 'Good courage shown', 'Fighting well', 'Keep pushing'],
        low: ['Never give up!', 'Find your courage!', 'Heroes persist!', 'Rise above!'],
        combo: ['Heroic combo!', 'Champion sequence!', 'Victorious flow!'],
        flow_broken: ['Temporary setback', 'Heroes recover', 'Fight on!']
      },
      icecream: {
        high: ['Sweet perfection!', 'Delightfully cool!', 'Simply delicious!', 'What a treat!'],
        medium: ['Pretty good', 'Nice and smooth', 'Sweet effort', 'Getting there'],
        low: ['Needs more flavor', 'Add some sprinkles', 'Make it sweeter', 'More joy needed'],
        combo: ['Triple scoop combo!', 'Sweet harmony!', 'Delicious flow!'],
        flow_broken: ['Melted a bit', 'Cool down', 'Stay sweet']
      },
      maestro: {
