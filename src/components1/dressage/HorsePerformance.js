import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HorsePerformance = ({ 
  selectedHorse, 
  lastPlayedCard = null, 
  isPerforming = false,
  flowLength = 0,
  flowBroke = false 
}) => {
  const [currentMove, setCurrentMove] = useState(null);
  const [moveEffects, setMoveEffects] = useState([]);
  const [horsePosition, setHorsePosition] = useState({ x: 0, y: 0 });

  // Define movement animations for different card types
  const getMoveAnimation = (card) => {
    if (!card) return {};

    const moveAnimations = {
      // Walk movements - gentle and flowing
      walk: {
        position: [
          { x: 0, y: 0 },
          { x: -10, y: 0 },
          { x: 10, y: 0 },
          { x: 0, y: 0 }
        ],
        rotation: [0, -2, 2, 0],
        scale: [1, 1.02, 1.02, 1],
        duration: 2.5
      },
      
      // Trot movements - more energetic
      trot: {
        position: [
          { x: 0, y: 0 },
          { x: -15, y: -5 },
          { x: 15, y: -5 },
          { x: 0, y: 0 }
        ],
        rotation: [0, -5, 5, 0],
        scale: [1, 1.05, 1.05, 1],
        duration: 2.0
      },
      
      // Canter movements - powerful and bold
      canter: {
        position: [
          { x: 0, y: 0 },
          { x: -20, y: -10 },
          { x: 20, y: -10 },
          { x: 0, y: 0 }
        ],
        rotation: [0, -8, 8, 0],
        scale: [1, 1.1, 1.1, 1],
        duration: 1.8
      },
      
      // Transition movements - graceful changes
      transition: {
        position: [
          { x: 0, y: 0 },
          { x: 0, y: -8 },
          { x: 0, y: -8 },
          { x: 0, y: 0 }
        ],
        rotation: [0, 360],
        scale: [1, 1.05, 1.05, 1],
        duration: 2.2
      },
      
      // Specialty movements - dramatic and impressive
      specialty: {
        position: [
          { x: 0, y: 0 },
          { x: -25, y: -15 },
          { x: 25, y: -15 },
          { x: 0, y: -10 },
          { x: 0, y: 0 }
        ],
        rotation: [0, -10, 10, -5, 0],
        scale: [1, 1.15, 1.15, 1.08, 1],
        duration: 3.0
      },
      
      // Power movements - explosive and commanding
      power: {
        position: [
          { x: 0, y: 0 },
          { x: -30, y: -20 },
          { x: 30, y: -20 },
          { x: 0, y: -15 },
          { x: 0, y: 0 }
        ],
        rotation: [0, -15, 15, -8, 0],
        scale: [1, 1.2, 1.2, 1.1, 1],
        duration: 3.5
      },
      
      // Finish movements - elegant conclusion
      finish: {
        position: [
          { x: 0, y: 0 },
          { x: 0, y: -10 },
          { x: 0, y: 0 }
        ],
        rotation: [0, 0, 0],
        scale: [1, 1.1, 1],
        duration: 2.0
      }
    };

    return moveAnimations[card.type] || moveAnimations.walk;
  };

  // Generate visual effects for moves
  const generateMoveEffects = (card, combo, broke) => {
    const effects = [];
    
    // Base move effect
    effects.push({
      id: `move-${Date.now()}`,
      text: card.name,
      color: broke ? 'text-red-500' : combo >= 3 ? 'text-gold-500' : 'text-blue-500',
      size: 'text-lg',
      duration: 2000
    });

    // Combo effects
    if (combo >= 3) {
      effects.push({
        id: `combo-${Date.now()}`,
        text: `${combo} Combo!`,
        color: 'text-yellow-500',
        size: 'text-xl font-bold',
        duration: 2500,
        sparkle: true
      });
    }

    // High score effects
    if (card.earnedScore >= 5) {
      effects.push({
        id: `excellent-${Date.now()}`,
        text: 'Excellent!',
        color: 'text-green-500',
        size: 'text-xl font-bold', 
        duration: 2000
      });
    }

    // Flow broken effect
    if (broke) {
      effects.push({
        id: `flow-broken-${Date.now()}`,
        text: 'Flow Broken',
        color: 'text-red-500',
        size: 'text-sm',
        duration: 1500
      });
    }

    return effects;
  };

  // Trigger animation when card is played
  useEffect(() => {
    if (lastPlayedCard && isPerforming) {
      setCurrentMove(lastPlayedCard);
      const effects = generateMoveEffects(lastPlayedCard, flowLength, flowBroke);
      setMoveEffects(effects);

      // Clear effects after animation
      const timer = setTimeout(() => {
        setCurrentMove(null);
        setMoveEffects([]);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [lastPlayedCard, isPerforming, flowLength, flowBroke]);

  const moveAnimation = currentMove ? getMoveAnimation(currentMove) : {};
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div style={{ transform: 'translateY(-40px)' }}>
        {/* Horse with movement animation */}
        {selectedHorse && (
          <motion.div
            className="flex flex-col items-center z-10"
            animate={currentMove ? {
              x: moveAnimation.position?.map(p => p.x) || [0],
              y: moveAnimation.position?.map(p => p.y) || [0],
              rotate: moveAnimation.rotation || [0],
              scale: moveAnimation.scale || [1]
            } : {
              y: [0, -2, 0]
            }}
            transition={currentMove ? {
              duration: moveAnimation.duration || 2,
              ease: "easeInOut",
              times: moveAnimation.position ? 
                moveAnimation.position.map((_, i) => i / (moveAnimation.position.length - 1)) : 
                [0, 1]
            } : {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.img 
              src={selectedHorse.avatar} 
              alt={selectedHorse.name}
              className="w-24 h-24 object-contain drop-shadow-2xl filter brightness-110"
            />
            <motion.div 
              className="mt-2 px-3 py-1 bg-white bg-opacity-90 rounded-full shadow-md"
              animate={flowBroke ? { backgroundColor: ['#ffffff', '#ffebee', '#ffffff'] } : {}}
              transition={{ duration: 0.5, repeat: flowBroke ? 2 : 0 }}
            >
              <p className="text-sm font-semibold text-gray-800">{selectedHorse.name}</p>
            </motion.div>
          </motion.div>
        )}
        {/* Floating move text removed */}
      </div>
      {/* Arena atmosphere effects during performance */}
      {isPerforming && currentMove && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-radial from-yellow-200 via-transparent to-transparent pointer-events-none"
        />
      )}
    </div>
  );
};

export default HorsePerformance;
