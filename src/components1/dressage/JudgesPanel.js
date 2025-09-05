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
  // Map judge system IDs to visual character IDs
  const judgeVisualMapping = {
    perfectionist: 'queen',
    finishersEye: 'maestro',
    linearityJudge: 'samurai',
    maverick: 'alien',
    reboundJudge: 'hero',
    improvisationAficionado: 'icecream',
    sprinter: 'robot',
    marathoner: 'strongman',
    punctualist: 'typewriter',
    paletteJudge: 'cowboy',
    gaitSpecialist: 'gachaman',
    handManagementJudge: 'ghost'
  };

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

  // Create visual judges from the new judge system (reactive)
  const [judges, setJudges] = useState([]);

  useEffect(() => {
    if (selectedJudges && selectedJudges.length > 0) {
      const mapped = selectedJudges.map(newJudge => {
        const visualId = judgeVisualMapping[newJudge.id];
        const visualJudge = allJudges.find(j => j.id === visualId);
        return {
          ...visualJudge,
          // Preserve character identity for user recognition
          name: visualJudge?.name,
          avatar: visualJudge?.avatar,
          // Attach the scoring system judge for criteria/details
          systemJudge: newJudge,
          // Show category summary in the small subtitle
          specialty: newJudge.shortDesc
        };
      });
      setJudges(mapped);
    } else {
      // If not yet provided, show none to avoid random mismatch
      setJudges([]);
    }
  }, [selectedJudges]);

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

  // Define judge positions for integrated layout
  const judgePositions = [
    { position: 'absolute bottom-4 left-8', transform: '' }, // Bottom left
    { position: 'absolute bottom-4 right-8', transform: '' }, // Bottom right  
    { position: 'absolute top-4 right-8', transform: '' }, // Top right
  ];

  if (integrated) {
    return (
      <>
        {/* Judges Table - Foreground */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center" style={{ zIndex: 30 }}>
          {/* Judges Table */}
          <div className="relative">
            {/* Table Surface */}
            <div 
              className="relative px-8 py-2"
              style={{
                background: 'linear-gradient(180deg, #A0522D 0%, #8B4513 50%, #654321 100%)',
                border: '4px solid #5D4037',
                borderRadius: '12px 12px 0 0',
                height: '48px',
                minWidth: '280px',
                boxShadow: '0 -4px 12px rgba(0,0,0,0.3)'
              }}
            >
              {/* Table Front Panel with Label */}
              <div 
                className="absolute top-full left-0 right-0 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, #654321 0%, #4A2C17 100%)',
                  border: '4px solid #5D4037',
                  borderTop: 'none',
                  height: '28px',
                  borderRadius: '0 0 8px 8px'
                }}
              >
                <span className="text-sm font-bold text-amber-200 tracking-wide">JUDGES</span>
              </div>


              {/* Judges - Behind Table */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-4" style={{ transform: 'translateX(-50%) translateY(-8px)' }}>
                {judges.map((judge, index) => (
                  <div key={judge.id} className="flex flex-col items-center">
                    {/* Judge Character - Larger for Foreground - Clickable */}
                    <motion.div 
                      className="relative cursor-pointer"
                      animate={reactingJudges[judge.id] ? { 
                        y: [-2, -8, -2],
                        rotate: [-2, 2, -1, 1, 0]
                      } : { y: 0 }}
                      transition={{ duration: 1.0 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => onJudgeClick && onJudgeClick(judge)}
                      title={`Click to see ${judge.name} scoring criteria`}
                    >
                      <img 
                        src={judge.avatar} 
                        alt={judge.name}
                        className="w-32 h-32 object-contain filter drop-shadow-lg hover:brightness-110 transition-all"
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) brightness(1.1)'
                        }}
                      />
                      
                      {/* Click indicator removed per feedback */}
                    </motion.div>

                    {/* Judge Name Plate - Also Clickable */}
                    <div 
                      className="-mt-4 px-2 py-1 text-xs font-bold text-center rounded cursor-pointer hover:bg-gradient-to-r hover:from-yellow-300 hover:to-yellow-400 transition-all"
                      style={{
                        background: 'linear-gradient(145deg, #D4AF37, #B8860B)',
                        color: '#2C1810',
                        border: '1px solid #8B7355',
                        minWidth: '60px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      onClick={() => onJudgeClick && onJudgeClick(judge)}
                      title={`Click to see ${judge.name} scoring criteria`}
                    >
                      {judge.name.replace('Judge ', '').replace(/🧭|🎯|➡️|🔥|🦅|🎭|⚡|🏁|⏱️|🎨|🐎|🗃️/g, '').trim()}
                    </div>

                  </div>
                ))}
              </div>

              {/* Reaction Bubble - Above Everything */}
              <AnimatePresence>
                {judges.some(judge => reactingJudges[judge.id]) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.7 }}
                    animate={{ opacity: 1, y: -60, scale: 1 }}
                    exit={{ opacity: 0, y: -80, scale: 1.2 }}
                    className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-xl px-4 py-3 shadow-2xl border-2 border-gray-200"
                    style={{ zIndex: 40, maxWidth: '200px' }}
                  >
                    <div className="text-sm font-medium text-gray-800 text-center">
                      <span className="font-bold text-blue-600">
                        {judges.find(judge => reactingJudges[judge.id] && judgeReactions[judge.id])?.name.replace('Judge ', '') || 'Judge'}:
                      </span>
                      <br />
                      <span className="font-bold text-gray-900">
                        "{Object.entries(reactingJudges).find(([id, reacting]) => reacting)?.[0] && 
                         judgeReactions[Object.entries(reactingJudges).find(([id, reacting]) => reacting)?.[0]]}"
                      </span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Competition Stats - Top Left */}
        <div className="absolute top-4 left-8" style={{ zIndex: 20, display: 'none' }}>
          <div className="text-center p-2" style={{
            background: 'linear-gradient(145deg, rgba(232,245,232,0.95), rgba(200,230,200,0.95))',
            border: '2px solid #28a745',
            borderRadius: '6px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div className="text-sm mb-1">📊</div>
            <div className="text-xs font-semibold">Competition</div>
            <div className="text-xs text-gray-600">{competitionLevel}</div>
            <div className="mt-1 text-xs">
              Target: {competitionLevel === 'Training' ? '18+' : 
                       competitionLevel === 'Intermediate' ? '25+' :
                       competitionLevel === 'Advanced' ? '35+' : '40+'} pts
            </div>
            <div className="text-xs font-bold mt-1 text-green-700">
              Avg: {Object.keys(judgeScores).length > 0 
                ? (Object.values(judgeScores).reduce((a, b) => a + b, 0) / Object.values(judgeScores).length).toFixed(1)
                : '--'}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Standard non-integrated layout
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {judges.map(judge => (
        <JudgeCard
          key={judge.id}
          judge={judge}
          score={judgeScores[judge.id]}
          reaction={judgeReactions[judge.id]}
          isReacting={reactingJudges[judge.id]}
          integrated={false}
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
