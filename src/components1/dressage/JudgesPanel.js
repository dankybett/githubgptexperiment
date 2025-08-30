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
        className="text-2xl mb-2"
        animate={isReacting ? { rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {judge.avatar}
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
  const [judges] = useState([
    {
      id: 'ernst',
      name: 'Judge Ernst',
      avatar: '👨‍⚖️',
      specialty: 'Technique',
      preferences: ['precision', 'combos', 'flow'],
      personality: 'strict'
    },
    {
      id: 'maria', 
      name: 'Judge Maria',
      avatar: '👩‍⚖️',
      specialty: 'Artistry',
      preferences: ['variety', 'elegance', 'creativity'],
      personality: 'encouraging'
    },
    {
      id: 'klaus',
      name: 'Judge Klaus', 
      avatar: '🧑‍⚖️',
      specialty: 'Boldness',
      preferences: ['power', 'risk', 'advanced_moves'],
      personality: 'demanding'
    }
  ]);

  const [judgeScores, setJudgeScores] = useState({});
  const [judgeReactions, setJudgeReactions] = useState({});
  const [reactingJudges, setReactingJudges] = useState({});

  // Generate judge reactions based on the card played
  const generateJudgeReaction = (judge, card, score, combo, broke) => {
    const reactions = {
      ernst: {
        high: ['Excellent precision!', 'Perfect form!', 'Technically sound!', 'Beautiful execution!'],
        medium: ['Good technique', 'Solid performance', 'Well executed', 'Acceptable form'],
        low: ['Needs improvement', 'Form could be better', 'Work on precision', 'Room to grow'],
        combo: ['Wonderful sequence!', 'Perfect flow!', 'Masterful combination!'],
        flow_broken: ['Flow disrupted', 'Sequence broken', 'Loss of rhythm']
      },
      maria: {
        high: ['Magnificent artistry!', 'Pure elegance!', 'Breathtaking!', 'Sublime performance!'],
        medium: ['Lovely movement', 'Nice expression', 'Good artistry', 'Pleasant to watch'],
        low: ['More feeling needed', 'Express yourself more', 'Find your rhythm', 'Show more grace'],
        combo: ['Beautiful harmony!', 'Artistic genius!', 'Poetry in motion!'],
        flow_broken: ['Lost the magic', 'Artistry interrupted', 'Find your rhythm again']
      },
      klaus: {
        high: ['Bold and powerful!', 'Impressive risk!', 'Commanding presence!', 'Fearless execution!'],
        medium: ['Decent effort', 'Show more confidence', 'Good attempt', 'Adequate power'],
        low: ['Too safe', 'More boldness needed', 'Take risks!', 'Show some courage'],
        combo: ['Daring sequence!', 'Brave combination!', 'Powerful flow!'],
        flow_broken: ['Lost momentum', 'Hesitation noted', 'Confidence shaken']
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

    // Judge-specific preferences
    if (judge.id === 'ernst' && (card?.tags?.includes('Transition') || card?.name?.includes('Collected'))) level = 'high';
    if (judge.id === 'maria' && (card?.type === 'specialty' || card?.name?.includes('Passage'))) level = 'high';
    if (judge.id === 'klaus' && (card?.cost > 0 || card?.name?.includes('Bold') || card?.name?.includes('Extended'))) level = 'high';

    const options = reactions[judge.id][level];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Calculate individual judge scores based on their preferences
  const calculateJudgeScore = (judge, card, baseScore, combo, broke) => {
    let score = baseScore;
    
    // Ernst (Technique) bonuses
    if (judge.id === 'ernst') {
      if (card?.tags?.includes('Transition')) score += 0.5;
      if (combo >= 3) score += 1.0;
      if (broke) score -= 1.0;
    }
    
    // Maria (Artistry) bonuses  
    if (judge.id === 'maria') {
      if (card?.type === 'specialty') score += 0.5;
      if (card?.name?.includes('Passage') || card?.name?.includes('Piaffe')) score += 1.0;
      if (card?.tags?.includes('Walk')) score += 0.3; // Grace bonus
    }
    
    // Klaus (Boldness) bonuses
    if (judge.id === 'klaus') {
      if (card?.cost > 0) score += 0.8; // Expensive = bold
      if (card?.name?.includes('Bold') || card?.name?.includes('Extended')) score += 1.0;
      if (card?.risk) score += 0.5; // Risk taking
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