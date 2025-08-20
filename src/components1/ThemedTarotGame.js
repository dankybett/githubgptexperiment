import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { themeUtils } from "../utils/themes";

const ThemedTarotGame = ({ onClose, currentTheme = 'retro' }) => {
  const [gameState, setGameState] = useState('start'); // start, dealing, revealing, complete
  const [drawnCards, setDrawnCards] = useState([]);
  const [revealedCards, setRevealedCards] = useState([false, false, false]);
  const [fortune, setFortune] = useState('');

  // Major Arcana with meanings for Past/Present/Future
  const majorArcana = [
    { name: "The Fool", number: 0, filename: "0. The Fool.png",
      past: "naive beginnings", present: "new adventures await", future: "leap of faith required" },
    { name: "The Magician", number: 1, filename: "1. The Magician.png",
      past: "manifested your will", present: "powerful creative energy", future: "mastery awaits" },
    { name: "The High Priestess", number: 2, filename: "2. The High Priestess.png",
      past: "hidden wisdom gained", present: "trust your intuition", future: "secrets will be revealed" },
    { name: "The Empress", number: 3, filename: "3. The Empress.png",
      past: "abundant growth", present: "creative fertility flows", future: "nurturing brings rewards" },
    { name: "The Emperor", number: 4, filename: "4. The Emperor.png",
      past: "established order", present: "take control and lead", future: "authority will be yours" },
    { name: "The Hierophant", number: 5, filename: "5. The Hierophant.png",
      past: "traditional lessons learned", present: "seek spiritual guidance", future: "wisdom through tradition" },
    { name: "The Lovers", number: 6, filename: "6. The Lovers.png",
      past: "important choices made", present: "harmony and connection", future: "union and partnership" },
    { name: "The Chariot", number: 7, filename: "7. The Chariot.png",
      past: "conquered through willpower", present: "determination drives success", future: "victory through focus" },
    { name: "Strength", number: 8, filename: "8. Strength.png",
      past: "inner courage displayed", present: "gentle power prevails", future: "resilience conquers all" },
    { name: "The Hermit", number: 9, filename: "9. The Hermit.png",
      past: "soul-searching journey", present: "seek inner wisdom", future: "enlightenment through solitude" },
    { name: "Wheel of Fortune", number: 10, filename: "10. Wheel of fortune.png",
      past: "cycles of change", present: "fate turns in your favor", future: "destiny unfolds" },
    { name: "Justice", number: 11, filename: "11. Justice.png",
      past: "karmic balance restored", present: "fair judgment needed", future: "truth will prevail" },
    { name: "The Hanged Man", number: 12, filename: "12. The Hanged Man.png",
      past: "necessary sacrifice made", present: "surrender brings wisdom", future: "new perspective emerges" },
    { name: "Death", number: 13, filename: "13. Death.png",
      past: "transformation completed", present: "endings bring new beginnings", future: "rebirth awaits" },
    { name: "Temperance", number: 14, filename: "14. Temperance.png",
      past: "found balance and harmony", present: "moderation brings peace", future: "healing and integration" },
    { name: "The Devil", number: 15, filename: "15. The Devil.png",
      past: "broke free from chains", present: "beware of temptation", future: "liberation from bondage" },
    { name: "The Tower", number: 16, filename: "16. The Tower.png",
      past: "foundations shaken", present: "sudden revelation comes", future: "breakthrough after chaos" },
    { name: "The Star", number: 17, filename: "17. The Star.png",
      past: "hope restored after darkness", present: "dreams are within reach", future: "wishes will be granted" },
    { name: "The Moon", number: 18, filename: "18. The Moon.png",
      past: "illusions clouded judgment", present: "trust your instincts", future: "hidden truths emerge" },
    { name: "The Sun", number: 19, filename: "19. The Sun.png",
      past: "joy and success achieved", present: "radiant energy surrounds you", future: "happiness and fulfillment" },
    { name: "Judgement", number: 20, filename: "20. Judgement.png",
      past: "awakening and rebirth", present: "time for self-reflection", future: "spiritual awakening" },
    { name: "The World", number: 21, filename: "21. The World.png",
      past: "completion of journey", present: "success and accomplishment", future: "cosmic fulfillment" }
  ];

  const positions = ["Past", "Present", "Future"];

  const drawThreeCards = () => {
    const shuffled = [...majorArcana].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    setDrawnCards(selected);
    setGameState('dealing');
    
    // Start revealing cards after a brief pause
    setTimeout(() => {
      setGameState('revealing');
      revealNextCard(selected, 0);
    }, 1000);
  };

  const revealNextCard = (cards, index) => {
    if (index < 3) {
      setTimeout(() => {
        setRevealedCards(prev => {
          const newRevealed = [...prev];
          newRevealed[index] = true;
          return newRevealed;
        });
        
        if (index === 2) {
          // All cards revealed, generate fortune
          setTimeout(() => generateFortune(cards), 500);
        } else {
          // Reveal next card
          revealNextCard(cards, index + 1);
        }
      }, 1500);
    }
  };

  const generateFortune = (cards) => {
    const pastCard = cards[0];
    const presentCard = cards[1];
    const futureCard = cards[2];

    let fortune = `🔮 Your fortune has been revealed! 🔮\n\n`;
    
    fortune += `✨ PAST (${pastCard.name}): Your journey began with ${pastCard.past}. `;
    fortune += `This foundation has shaped your current path.\n\n`;
    
    fortune += `🌟 PRESENT (${presentCard.name}): Right now, ${presentCard.present}. `;
    fortune += `This is your moment to act with purpose.\n\n`;
    
    fortune += `🌙 FUTURE (${futureCard.name}): What lies ahead shows ${futureCard.future}. `;
    
    // Add combination insights
    const cardSum = pastCard.number + presentCard.number + futureCard.number;
    if (cardSum > 30) {
      fortune += `The high energy of your cards suggests major life changes approaching.`;
    } else if (cardSum < 15) {
      fortune += `The gentle energy of your cards suggests a time of inner growth and reflection.`;
    } else {
      fortune += `The balanced energy of your cards suggests harmony between action and contemplation.`;
    }

    setFortune(fortune);
    setGameState('complete');
  };

  const resetGame = () => {
    setGameState('start');
    setDrawnCards([]);
    setRevealedCards([false, false, false]);
    setFortune('');
  };

  // Get theme styles
  const theme = themeUtils.getCurrentTheme(currentTheme);
  const buttonStyles = themeUtils.getComponentStyles(currentTheme, 'button', 'primary');
  const secondaryButtonStyles = themeUtils.getComponentStyles(currentTheme, 'button', 'secondary');

  return (
    <div className="w-full text-center" style={{ fontFamily: 'Press Start 2P, monospace' }}>
      {gameState === 'start' && (
        <div>
          <div className="mb-8 p-6 border-2 border-purple-400 bg-purple-900/20 rounded-lg">
            <div className="text-4xl mb-4">🔮</div>
            <p className="text-lg mb-4 text-purple-200" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px', lineHeight: '1.6' }}>
              The ancient cards await your call. Three sacred arcana will reveal the threads of your past, 
              illuminate your present, and unveil the mysteries of your future.
            </p>
            <p className="text-purple-300" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}>
              Are you ready to glimpse your destiny?
            </p>
          </div>
          
          <motion.button 
            onClick={drawThreeCards}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-4 ${buttonStyles} font-bold text-lg shadow-lg`}
            style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '14px' }}
          >
            ✨ TELL MY FORTUNE ✨
          </motion.button>
        </div>
      )}

      {(gameState === 'dealing' || gameState === 'revealing' || gameState === 'complete') && (
        <div>
          {/* Position labels */}
          <div className="flex justify-center space-x-8 mb-6">
            {positions.map((position, index) => (
              <div key={position} className="text-center">
                <div className="text-lg font-bold text-purple-300 mb-2" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '14px' }}>
                  {position}
                </div>
                <div className="w-24 h-2 bg-purple-500/30 rounded-full">
                  <motion.div 
                    className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: revealedCards[index] ? '100%' : '0%' }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className="flex justify-center space-x-6 mb-8">
            {drawnCards.map((card, index) => (
              <div key={index} className="text-center">
                <div className="relative w-64 h-96 mb-4">
                  {/* Card back */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-purple-800 to-indigo-900 border-3 border-purple-400 rounded-lg flex items-center justify-center"
                    animate={{ 
                      rotateY: revealedCards[index] ? 180 : 0,
                      opacity: revealedCards[index] ? 0 : 1
                    }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔮</div>
                      <div className="text-xs text-purple-300" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '8px' }}>
                        MYSTIC
                      </div>
                      <div className="text-xs text-purple-300" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '8px' }}>
                        TAROT
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Card front with actual tarot image */}
                  <motion.div 
                    className="absolute inset-0 border-3 border-yellow-400 rounded-lg overflow-hidden"
                    animate={{ 
                      rotateY: revealedCards[index] ? 0 : -180,
                      opacity: revealedCards[index] ? 1 : 0
                    }}
                    transition={{ duration: 0.8 }}
                  >
                    <img 
                      src={`/Tarot Cards/${card.filename}`}
                      alt={card.name}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </motion.div>
                </div>
                
                <div className="text-purple-300 font-bold" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}>
                  {positions[index]}
                </div>
                {revealedCards[index] && (
                  <motion.div 
                    className="text-xs text-purple-400 mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '8px' }}
                  >
                    {card.name}
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Fortune text */}
          {fortune && (
            <motion.div 
              className="max-w-3xl mx-auto p-6 bg-purple-900/30 border-2 border-purple-400 rounded-lg mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div 
                className="whitespace-pre-line text-sm leading-relaxed text-purple-100"
                style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px', lineHeight: '1.8' }}
              >
                {fortune}
              </div>
            </motion.div>
          )}

          {gameState === 'complete' && (
            <div className="flex justify-center gap-4">
              <motion.button 
                onClick={resetGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 ${secondaryButtonStyles} font-bold`}
                style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px' }}
              >
                🔄 Draw Again
              </motion.button>
              
              <motion.button 
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 ${buttonStyles} font-bold`}
                style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px' }}
              >
                🚪 Close
              </motion.button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemedTarotGame;