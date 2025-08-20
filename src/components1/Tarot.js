import React, { useState, useEffect } from 'react';

const TarotGame = () => {
  const [gameState, setGameState] = useState('start'); // start, dealing, revealing, complete
  const [drawnCards, setDrawnCards] = useState([]);
  const [revealedCards, setRevealedCards] = useState([false, false, false]);
  const [fortune, setFortune] = useState('');
  const [currentReveal, setCurrentReveal] = useState(0);

  // Major Arcana with meanings for Past/Present/Future
  const majorArcana = [
    { name: "The Fool", number: 0, 
      past: "naive beginnings", present: "new adventures await", future: "leap of faith required" },
    { name: "The Magician", number: 1,
      past: "manifested your will", present: "powerful creative energy", future: "mastery awaits" },
    { name: "The High Priestess", number: 2,
      past: "hidden wisdom gained", present: "trust your intuition", future: "secrets will be revealed" },
    { name: "The Empress", number: 3,
      past: "abundant growth", present: "creative fertility flows", future: "nurturing brings rewards" },
    { name: "The Emperor", number: 4,
      past: "established order", present: "take control and lead", future: "authority will be yours" },
    { name: "The Hierophant", number: 5,
      past: "traditional lessons learned", present: "seek spiritual guidance", future: "wisdom through tradition" },
    { name: "The Lovers", number: 6,
      past: "important choices made", present: "harmony and connection", future: "union and partnership" },
    { name: "The Chariot", number: 7,
      past: "conquered through willpower", present: "determination drives success", future: "victory through focus" },
    { name: "Strength", number: 8,
      past: "inner courage displayed", present: "gentle power prevails", future: "resilience conquers all" },
    { name: "The Hermit", number: 9,
      past: "soul-searching journey", present: "seek inner wisdom", future: "enlightenment through solitude" },
    { name: "Wheel of Fortune", number: 10,
      past: "cycles of change", present: "fate turns in your favor", future: "destiny unfolds" },
    { name: "Justice", number: 11,
      past: "karmic balance restored", present: "fair judgment needed", future: "truth will prevail" },
    { name: "The Hanged Man", number: 12,
      past: "necessary sacrifice made", present: "surrender brings wisdom", future: "new perspective emerges" },
    { name: "Death", number: 13,
      past: "transformation completed", present: "endings bring new beginnings", future: "rebirth awaits" },
    { name: "Temperance", number: 14,
      past: "found balance and harmony", present: "moderation brings peace", future: "healing and integration" },
    { name: "The Devil", number: 15,
      past: "broke free from chains", present: "beware of temptation", future: "liberation from bondage" },
    { name: "The Tower", number: 16,
      past: "foundations shaken", present: "sudden revelation comes", future: "breakthrough after chaos" },
    { name: "The Star", number: 17,
      past: "hope restored after darkness", present: "dreams are within reach", future: "wishes will be granted" },
    { name: "The Moon", number: 18,
      past: "illusions clouded judgment", present: "trust your instincts", future: "hidden truths emerge" },
    { name: "The Sun", number: 19,
      past: "joy and success achieved", present: "radiant energy surrounds you", future: "happiness and fulfillment" },
    { name: "Judgement", number: 20,
      past: "awakening and rebirth", present: "time for self-reflection", future: "spiritual awakening" },
    { name: "The World", number: 21,
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
    setCurrentReveal(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white font-mono">
      {/* Pixel art stars background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-white animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 pixel-text">
            ◆ MYSTIC PIXEL TAROT ◆
          </h1>
          <div className="text-xl text-purple-300">~ Reveal Your Digital Destiny ~</div>
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <div className="mb-8 p-8 border-4 border-purple-500 bg-purple-900/30 rounded-lg max-w-2xl mx-auto">
              <div className="text-2xl mb-4">🔮</div>
              <p className="text-lg mb-6 text-purple-200">
                The ancient cards await your call. Three sacred arcana will reveal the threads of your past, 
                illuminate your present, and unveil the mysteries of your future.
              </p>
              <p className="text-purple-400">Are you ready to glimpse your destiny?</p>
            </div>
            
            <button 
              onClick={drawThreeCards}
              className="px-12 py-4 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-4 border-white/30 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
            >
              ✨ TELL MY FORTUNE ✨
            </button>
          </div>
        )}

        {(gameState === 'dealing' || gameState === 'revealing' || gameState === 'complete') && (
          <div>
            {/* Position labels */}
            <div className="flex justify-center space-x-8 mb-8">
              {positions.map((position, index) => (
                <div key={position} className="text-center">
                  <div className="text-2xl font-bold text-purple-300 mb-2">{position}</div>
                  <div className="w-32 h-2 bg-purple-500/30 rounded-full">
                    <div 
                      className={`h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000 ${
                        revealedCards[index] ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Cards */}
            <div className="flex justify-center space-x-8 mb-12">
              {drawnCards.map((card, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-40 h-60 mb-4">
                    {/* Card back */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-purple-800 to-indigo-900 border-4 border-purple-400 rounded-lg flex items-center justify-center transition-all duration-700 ${
                      revealedCards[index] ? 'opacity-0 rotate-y-180' : 'opacity-100'
                    }`}>
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔮</div>
                        <div className="text-xs text-purple-300">MYSTIC</div>
                        <div className="text-xs text-purple-300">TAROT</div>
                      </div>
                    </div>
                    
                    {/* Card front */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-yellow-200 to-orange-300 border-4 border-yellow-400 rounded-lg p-4 flex flex-col items-center justify-center text-black transition-all duration-700 ${
                      revealedCards[index] ? 'opacity-100' : 'opacity-0 rotate-y-180'
                    }`}>
                      <div className="text-sm font-bold mb-2">{card.number}</div>
                      <div className="text-6xl mb-2">🃏</div>
                      <div className="text-xs font-bold text-center leading-tight">{card.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-purple-300 font-bold">{positions[index]}</div>
                  {revealedCards[index] && (
                    <div className="text-sm text-purple-400 mt-2 animate-fadeIn">
                      {card.name}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Fortune text */}
            {fortune && (
              <div className="max-w-4xl mx-auto p-8 bg-purple-900/50 border-4 border-purple-400 rounded-lg mb-8">
                <div className="whitespace-pre-line text-lg leading-relaxed text-purple-100">
                  {fortune}
                </div>
              </div>
            )}

            {gameState === 'complete' && (
              <div className="text-center">
                <button 
                  onClick={resetGame}
                  className="px-8 py-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-4 border-white/30 rounded-lg transform hover:scale-105 transition-all duration-300"
                >
                  🔄 Draw Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .pixel-text {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  );
};

export default TarotGame;