import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const JudgeCard = ({ judge, score, reaction, isReacting }) => {
  const judgeBoxStyle = {
    background: isReacting 
      ? 'linear-gradient(145deg, #fff3cd, #ffeaa7)' 
      : 'linear-gradient(145deg, #f0f0f0, #d0d0d0)',
    border: `2px solid ${isReacting ? '#f39c12' : '#999'}`,
    borderRadius: '8px'
  };

  return (
    <motion.div 
      className="text-center p-3 transition-all duration-300"
      style={judgeBoxStyle}
      animate={isReacting ? { scale: 1.05 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="mb-2 flex justify-center"
        animate={isReacting ? { rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <img 
          src={judge.avatar} 
          alt={judge.name}
          className="w-12 h-12 object-contain"
        />
      </motion.div>
      
      <div className="text-xs font-semibold">{judge.name}</div>
      <div className="text-xs text-gray-600">{judge.specialty}</div>
      
      <div className="mt-2 text-sm font-bold">
        {score !== undefined ? score.toFixed(1) : '--'}
      </div>

      <AnimatePresence>
        {reaction && isReacting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-xs text-gray-700 bg-white bg-opacity-70 rounded px-2 py-1"
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
  competitionLevel = 'Training'
}) => {
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

  // Randomly select 3 judges for this competition
  const [judges] = useState(() => {
    const shuffled = [...allJudges].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
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
        high: ['Magnifico!', 'Artistic perfection!', 'Sublime artistry!', 'Breathtaking beauty!'],
        medium: ['Bene, very good', 'Artistic merit', 'Nice expression', 'Growing artistry'],
        low: ['More passion!', 'Feel the music!', 'Art needs soul!', 'Express yourself!'],
        combo: ['Perfect symphony!', 'Artistic genius!', 'Harmonious flow!'],
        flow_broken: ['Music interrupted', 'Lost the rhythm', 'Find the beat again']
      },
      queen: {
        high: ['Absolutely regal!', 'Fit for royalty!', 'Magnificent!', 'Truly excellent!'],
        medium: ['Acceptable standard', 'Adequate performance', 'Room for refinement', 'Getting better'],
        low: ['Not royal quality', 'Demands excellence', 'Standards must rise', 'Unworthy performance'],
        combo: ['Queenly sequence!', 'Royal perfection!', 'Majestic flow!'],
        flow_broken: ['Standards dropped', 'Disappointing', 'Compose yourself']
      },
      robot: {
        high: ['OPTIMAL PERFORMANCE', 'PRECISION: 100%', 'EXCELLENCE ACHIEVED', 'PARAMETERS MET'],
        medium: ['ADEQUATE EXECUTION', 'ACCEPTABLE RANGE', 'STANDARD MET', 'PROCESSING...'],
        low: ['ERROR DETECTED', 'BELOW PARAMETERS', 'RECALIBRATION NEEDED', 'PERFORMANCE: POOR'],
        combo: ['SEQUENCE OPTIMAL', 'CHAIN EXECUTED', 'FLOW COMPUTED'],
        flow_broken: ['SYSTEM ERROR', 'FLOW DISRUPTED', 'RESET REQUIRED']
      },
      samurai: {
        high: ['Honorable technique!', 'Disciplined excellence!', 'Perfect form!', 'Warrior spirit!'],
        medium: ['Good discipline', 'Adequate form', 'Training shows', 'Respectful effort'],
        low: ['Discipline lacking', 'Form needs work', 'Train harder', 'Honor demands more'],
        combo: ['Masterful kata!', 'Perfect sequence!', 'Warrior\'s flow!'],
        flow_broken: ['Dishonor', 'Form broken', 'Restore discipline']
      },
      strongman: {
        high: ['MIGHTY STRENGTH!', 'POWERFUL DISPLAY!', 'CRUSHING IT!', 'UNSTOPPABLE FORCE!'],
        medium: ['Good muscle', 'Building power', 'Getting stronger', 'Solid effort'],
        low: ['Too weak!', 'LIFT MORE!', 'POWER UP!', 'STRENGTH NEEDED!'],
        combo: ['POWER COMBO!', 'CRUSHING SEQUENCE!', 'MIGHTY FLOW!'],
        flow_broken: ['Power lost', 'Strength failed', 'Muscle up!']
      },
      typewriter: {
        high: ['Eloquent performance!', 'Beautiful narrative!', 'Perfect prose!', 'Story well told!'],
        medium: ['Good chapter', 'Nice storyline', 'Developing well', 'Plot thickens'],
        low: ['Needs editing', 'Story unclear', 'More narrative', 'Find your voice'],
        combo: ['Perfect plot!', 'Story flows!', 'Narrative gold!'],
        flow_broken: ['Plot hole', 'Story interrupted', 'Lost the thread']
      }
    };

    if (broke) {
      const options = reactions[judge.id].flow_broken;
      return options[Math.floor(Math.random() * options.length)];
    }

    if (combo >= 3) {
      const options = reactions[judge.id].combo;
      return options[Math.floor(Math.random() * options.length)];
    }

    let level;
    if (score >= 4) level = 'high';
    else if (score >= 2) level = 'medium'; 
    else level = 'low';

    // Judge-specific preferences (can upgrade reaction level)
    switch (judge.id) {
      case 'alien':
        if (card?.type === 'specialty' || card?.cost > 2) level = 'high';
        break;
      case 'cowboy':
        if (card?.name?.includes('Extended') || card?.name?.includes('Bold')) level = 'high';
        break;
      case 'gachaman':
        if (card?.cost > 0 || combo >= 4) level = 'high';
        break;
      case 'ghost':
        if (card?.tags?.includes('Walk') || card?.name?.includes('Passage')) level = 'high';
        break;
      case 'hero':
        if (card?.cost > 1 || card?.risk) level = 'high';
        break;
      case 'icecream':
        if (card?.type === 'specialty') level = 'high';
        break;
      case 'maestro':
        if (card?.tags?.includes('Transition') || card?.type === 'specialty') level = 'high';
        break;
      case 'queen':
        if (card?.name?.includes('Perfect') || card?.name?.includes('Elite')) level = 'high';
        break;
      case 'robot':
        if (card?.tags?.includes('Transition') || combo >= 3) level = 'high';
        break;
      case 'samurai':
        if (card?.tags?.includes('Transition') || card?.name?.includes('Collected')) level = 'high';
        break;
      case 'strongman':
        if (card?.cost > 0 || card?.name?.includes('Power')) level = 'high';
        break;
      case 'typewriter':
        if (card?.type === 'specialty' || card?.name?.includes('Creative')) level = 'high';
        break;
    }

    const options = reactions[judge.id][level];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Calculate individual judge scores based on their preferences
  const calculateJudgeScore = (judge, card, baseScore, combo, broke) => {
    let score = baseScore;
    
    // Apply general combo/flow bonuses/penalties
    if (combo >= 3) score += 0.5;
    if (broke) score -= 0.5;
    
    // Judge-specific bonuses based on their preferences
    switch (judge.id) {
      case 'alien':
        if (card?.type === 'specialty' || card?.name?.includes('Creative')) score += 0.8;
        if (card?.cost > 2) score += 0.6; // Unusual moves
        break;
        
      case 'cowboy':
        if (card?.name?.includes('Extended') || card?.name?.includes('Bold')) score += 0.7;
        if (card?.tags?.includes('Canter') || card?.tags?.includes('Gallop')) score += 0.5;
        break;
        
      case 'gachaman':
        if (card?.cost > 0) score += 0.8;
        if (combo >= 4) score += 1.2; // Extra combo bonus
        if (card?.name?.includes('Power') || card?.name?.includes('Strong')) score += 0.6;
        break;
        
      case 'ghost':
        if (card?.tags?.includes('Walk') || card?.name?.includes('Passage')) score += 0.7;
        if (card?.tags?.includes('Transition')) score += 0.5;
        break;
        
      case 'hero':
        if (card?.cost > 1) score += 0.6;
        if (card?.name?.includes('Bold') || card?.name?.includes('Brave')) score += 0.8;
        if (card?.risk) score += 0.7;
        break;
        
      case 'icecream':
        if (card?.type === 'specialty') score += 0.6;
        score += Math.random() * 0.4; // Cheerful randomness
        break;
        
      case 'maestro':
        if (card?.tags?.includes('Transition') || card?.name?.includes('Collected')) score += 0.8;
        if (card?.type === 'specialty') score += 0.6;
        if (combo >= 3) score += 0.8; // Extra artistry bonus
        break;
        
      case 'queen':
        if (card?.name?.includes('Perfect') || card?.name?.includes('Elite')) score += 1.0;
        if (score < 3) score *= 0.7; // Demanding standards
        break;
        
      case 'robot':
        if (card?.tags?.includes('Transition')) score += 0.6;
        if (combo >= 3) score += 0.7;
        score = Math.round(score * 10) / 10; // Precise scoring
        break;
        
      case 'samurai':
        if (card?.tags?.includes('Transition') || card?.name?.includes('Collected')) score += 0.7;
        if (card?.name?.includes('Discipline') || card?.name?.includes('Form')) score += 0.8;
        if (broke) score -= 1.2; // Extra penalty for broken discipline
        break;
        
      case 'strongman':
        if (card?.cost > 0) score += 0.9;
        if (card?.name?.includes('Extended') || card?.name?.includes('Power')) score += 0.8;
        if (card?.name?.includes('Bold')) score += 0.6;
        break;
        
      case 'typewriter':
        if (card?.type === 'specialty') score += 0.7;
        if (combo >= 2) score += 0.6; // Story building
        if (card?.name?.includes('Creative') || card?.name?.includes('Artistic')) score += 0.5;
        break;
    }

    return Math.max(0, Math.min(10, score)); // Clamp between 0-10
  };

  // React to card plays
  useEffect(() => {
    if (lastPlayedCard) {
      const baseScore = lastPlayedCard.earnedScore || lastPlayedCard.base || 0;
      
      judges.forEach(judge => {
        const judgeScore = calculateJudgeScore(judge, lastPlayedCard, baseScore, flowLength, flowBroke);
        const reaction = generateJudgeReaction(judge, lastPlayedCard, judgeScore, flowLength, flowBroke);
        
        setJudgeScores(prev => ({ ...prev, [judge.id]: judgeScore }));
        setJudgeReactions(prev => ({ ...prev, [judge.id]: reaction }));
        setReactingJudges(prev => ({ ...prev, [judge.id]: true }));
      });

      // Clear reactions after 3 seconds
      const timer = setTimeout(() => {
        setReactingJudges({});
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [lastPlayedCard, flowLength, flowBroke, judges]);

  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {judges.map(judge => (
        <JudgeCard
          key={judge.id}
          judge={judge}
          score={judgeScores[judge.id]}
          reaction={judgeReactions[judge.id]}
          isReacting={reactingJudges[judge.id]}
        />
      ))}
      
      {/* Competition Stats */}
      <div className="text-center p-3" style={{
        background: 'linear-gradient(145deg, #e8f5e8, #c8e6c8)',
        border: '2px solid #28a745',
        borderRadius: '8px'
      }}>
        <div className="text-lg mb-2">📊</div>
        <div className="text-xs font-semibold">Competition</div>
        <div className="text-xs text-gray-600">{competitionLevel} Level</div>
        <div className="mt-2 text-xs">
          Target: {competitionLevel === 'Training' ? '18+' : 
                   competitionLevel === 'Intermediate' ? '25+' :
                   competitionLevel === 'Advanced' ? '35+' : '40+'} pts
        </div>
        <div className="text-sm font-bold mt-1 text-green-700">
          Average: {Object.keys(judgeScores).length > 0 
            ? (Object.values(judgeScores).reduce((a, b) => a + b, 0) / Object.values(judgeScores).length).toFixed(1)
            : '--'}
        </div>
      </div>
    </div>
  );
};

export default JudgesPanel;