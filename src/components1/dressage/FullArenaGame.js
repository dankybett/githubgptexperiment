import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, RotateCcw, Play, Trophy, Zap, Star, Plus } from 'lucide-react';
import DressageArena from './DressageArena';

// This is a modified version of the card game that works WITHIN the arena
const FullArenaGame = ({ selectedHorse, onBack }) => {
  // Copy all the game state from the original dressage.js
  const cardDeck = [
    // Walks (4 cards) - Safe foundation + stamina management
    { id: 1, name: "Collected Walk", base: 1, tags: ["Walk"], combo: "+1 if after [Transition]", cost: 0, type: "walk" },
    { id: 2, name: "Medium Walk", base: 1, tags: ["Walk"], combo: "+2 if after another [Walk]", cost: 0, type: "walk" },
    { id: 3, name: "Free Walk on Long Rein", base: 1, tags: ["Walk"], bonus: "Restore 1 Stamina", cost: 0, type: "walk" },
    { id: 4, name: "Stretching Circle", base: 1, tags: ["Walk"], bonus: "Restore 2 Stamina (once per game)", cost: 0, type: "walk", unique: true },
    
    // Trots (5 cards) - Reliable scoring + flow building
    { id: 5, name: "Working Trot", base: 2, tags: ["Trot"], combo: "Solid foundation move", cost: 0, type: "trot" },
    { id: 6, name: "Extended Trot", base: 2, tags: ["Trot"], combo: "+2 if after [Walk]", cost: 0, type: "trot" },
    { id: 7, name: "Collected Trot", base: 2, tags: ["Trot"], combo: "+2 if after [Transition]", cost: 0, type: "trot" },
    { id: 8, name: "Piaffe", base: 4, tags: ["Trot"], combo: "+2 if after Collected Trot", cost: 1, type: "trot" },
    { id: 9, name: "Steady Rhythm", base: 2, tags: ["Trot"], combo: "+1 Stamina if combo length ≥ 3", cost: 0, type: "trot" },
    
    // Canters (4 cards) - High risk/reward + power plays
    { id: 10, name: "Working Canter", base: 2, tags: ["Canter"], combo: "Safe setup for combos", cost: 0, type: "canter" },
    { id: 11, name: "Extended Canter", base: 3, tags: ["Canter"], risk: "Costs 1 Stamina", cost: 1, type: "canter" },
    { id: 12, name: "Canter Pirouette", base: 4, tags: ["Canter"], combo: "+3 if after [Transition]", cost: 2, type: "canter" },
    { id: 13, name: "Bold Extension", base: 2, tags: ["Canter"], combo: "+1 for each Canter played this game", cost: 1, type: "canter" },
    
    // Transitions (4 cards) - Flow enablers + utility
    { id: 14, name: "Flying Change", base: 2, tags: ["Transition"], combo: "+2 if after [Canter]", cost: 0, type: "transition" },
    { id: 15, name: "Simple Change", base: 1, tags: ["Transition"], bonus: "Restore 1 Stamina", cost: 0, type: "transition" },
    { id: 16, name: "Rein Back", base: 2, tags: ["Transition"], combo: "+1 if after [Walk]", cost: 0, type: "transition" },
    { id: 17, name: "Tempo Change", base: 2, tags: ["Transition"], combo: "Universal connector + draw 1 card", cost: 0, type: "transition" },
    
    // Specialty (5 cards) - Build-around strategies
    { id: 18, name: "Shoulder-In", base: 2, tags: ["Trot"], combo: "+1 if after another [Trot]", cost: 0, type: "specialty" },
    { id: 19, name: "Passage", base: 4, tags: ["Trot"], combo: "+2 if after Piaffe", cost: 1, type: "specialty" },
    { id: 20, name: "Counter-Canter", base: 3, tags: ["Canter"], risk: "-1 Style if not preceded by [Transition]", cost: 0, type: "specialty" },
    { id: 21, name: "Training Level Test", base: 1, tags: ["Walk"], combo: "+1 for each different gait type played", cost: 0, type: "specialty" },
    { id: 22, name: "Flow Master", base: 1, tags: ["Transition"], combo: "+2 if combo length ≥ 5, +4 if ≥ 7", cost: 0, type: "specialty" },
    
    // Power Cards (3 cards) - Game changers
    { id: 23, name: "Perfect Harmony", base: 3, tags: ["Specialty"], combo: "+2 for each gait type used this game", cost: 2, type: "power" },
    { id: 24, name: "Stamina Surge", base: 1, tags: ["Walk"], bonus: "Gain 3 Stamina, next card costs 0", cost: 0, type: "power" },
    { id: 25, name: "Technical Showcase", base: 6, tags: ["Specialty"], risk: "-3 if combo length < 3", cost: 3, type: "power" },
    
    // Finish (2 cards)
    { id: 26, name: "Final Halt & Salute", base: 3, tags: ["Finish"], bonus: "+2 if routine length ≥ 6", cost: 0, type: "finish" },
    { id: 27, name: "Freestyle Finish", base: 4, tags: ["Finish"], bonus: "+1 for each gait type used this game", cost: 1, type: "finish" }
  ];

  // Game state
  const [gameState, setGameState] = useState('playing');
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [playedCards, setPlayedCards] = useState([]);
  const [stamina, setStamina] = useState(3);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [flowMeter, setFlowMeter] = useState(0);
  const [comboLength, setComboLength] = useState(0);
  const [turnPhase, setTurnPhase] = useState('draw');
  const [currentTurn, setCurrentTurn] = useState(1);
  const [maxTurns] = useState(8);
  const [gaitTypesUsed, setGaitTypesUsed] = useState(new Set());
  const [cantersPlayed, setCantersPlayed] = useState(0);
  const [stretchingCircleUsed, setStretchingCircleUsed] = useState(false);
  const [staminaSurgeActive, setStaminaSurgeActive] = useState(false);
  const [maxHandSize] = useState(4);
  
  // Arena-specific state
  const [lastPlayedCard, setLastPlayedCard] = useState(null);
  const [isPerforming, setIsPerforming] = useState(false);
  const [flowBroke, setFlowBroke] = useState(false);

  // Shuffle deck
  const shuffleDeck = () => {
    const shuffled = [...cardDeck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    return shuffled;
  };

  // Start the game
  const startGame = () => {
    const newDeck = shuffleDeck();
    setHand(newDeck.slice(0, maxHandSize));
    setDeck(newDeck.slice(maxHandSize));
    setPlayedCards([]);
    setStamina(3);
    setTotalScore(0);
    setGameOver(false);
    setFlowMeter(0);
    setComboLength(0);
    setCurrentTurn(1);
    setGaitTypesUsed(new Set());
    setCantersPlayed(0);
    setStretchingCircleUsed(false);
    setStaminaSurgeActive(false);
    setTurnPhase('buy');
    setMessage('Turn 1/8 - Your turn! Draw cards with stamina or play a move.');
    setGameState('playing');
  };

  // Initialize game on mount
  useEffect(() => {
    startGame();
  }, []);

  // Simplified scoring for now (copy key parts from original)
  const calculateScore = (card, previousCard) => {
    let score = card.base;
    let bonusText = '';
    let flowBonus = 0;
    let newComboLength = comboLength;
    let flowBrokeNow = false;

    // Basic combo checking (simplified version)
    let hasCombo = false;
    
    if (card.name === "Extended Trot" && previousCard?.tags.includes("Walk")) {
      score += 2;
      bonusText += "Walk→Trot +2! ";
      hasCombo = true;
    }
    if (card.name === "Flying Change" && previousCard?.tags.includes("Canter")) {
      score += 2;
      bonusText += "Canter combo +2! ";
      hasCombo = true;
    }
    // Add more combo logic as needed...

    // Flow logic
    if (hasCombo || card.tags.includes("Transition")) {
      newComboLength += 1;
      bonusText += `Flow +${newComboLength}! `;
    } else if (previousCard && !card.tags.includes("Finish")) {
      const naturalFlow = (
        (previousCard.tags.includes("Walk") && card.tags.includes("Trot")) ||
        (previousCard.tags.includes("Trot") && card.tags.includes("Canter")) ||
        card.tags.includes("Walk")
      );
      
      if (!naturalFlow) {
        flowBrokeNow = true;
        bonusText += "Flow broken... ";
        newComboLength = 0;
      } else {
        newComboLength = Math.max(1, newComboLength);
      }
    } else {
      newComboLength = Math.max(1, newComboLength);
    }

    // Flow multiplier bonus
    if (newComboLength >= 3) {
      flowBonus = Math.floor(score * 0.5);
      score += flowBonus;
      bonusText += `Flow mastery +${flowBonus}! `;
    }

    return { score, bonusText, newComboLength, flowBroke: flowBrokeNow };
  };

  // Draw a card
  const drawCard = () => {
    if (deck.length === 0) return null;
    const newCard = deck[0];
    setDeck(prev => prev.slice(1));
    return newCard;
  };

  // Buy additional cards
  const buyCard = () => {
    if (stamina < 1 || deck.length === 0) return;
    
    const newCard = drawCard();
    if (newCard) {
      setHand(prev => [...prev, newCard]);
      setStamina(prev => prev - 1);
      setMessage(`Drew ${newCard.name}! Draw more or play a move.`);
    }
  };

  // Play a card with arena integration
  const playCard = (card) => {
    if (gameOver) return;
    
    const actualCost = staminaSurgeActive && card.name !== "Stamina Surge" ? 0 : card.cost;
    if (stamina < actualCost) {
      setMessage("Not enough stamina for this move!");
      return;
    }

    const previousCard = playedCards[playedCards.length - 1];
    const { score, bonusText, newComboLength, flowBroke: flowBrokeNow } = calculateScore(card, previousCard);

    // Set arena state for animations
    setIsPerforming(true);
    setLastPlayedCard({ ...card, earnedScore: score });
    setFlowBroke(flowBrokeNow);
    
    // Update game state
    let newStamina = stamina - actualCost;
    
    // Handle special card effects
    if (card.name === "Free Walk on Long Rein" || card.name === "Simple Change") {
      newStamina += 1;
    } else if (card.name === "Stretching Circle" && !stretchingCircleUsed) {
      newStamina += 2;
      setStretchingCircleUsed(true);
    } else if (card.name === "Steady Rhythm" && newComboLength >= 3) {
      newStamina += 1;
    } else if (card.name === "Stamina Surge") {
      newStamina += 3;
      setStaminaSurgeActive(true);
    } else if (card.name === "Tempo Change") {
      // Draw extra card
      const extraCard = drawCard();
      if (extraCard) {
        setHand(prev => [...prev, extraCard]);
      }
    }

    // Clear stamina surge after use
    if (staminaSurgeActive && card.name !== "Stamina Surge") {
      setStaminaSurgeActive(false);
    }

    // Update canters played counter
    if (card.tags.includes("Canter")) {
      setCantersPlayed(prev => prev + 1);
    }

    // Track gait types
    const newGaitTypes = new Set(gaitTypesUsed);
    if (card.tags.includes("Walk")) newGaitTypes.add("Walk");
    if (card.tags.includes("Trot")) newGaitTypes.add("Trot");
    if (card.tags.includes("Canter")) newGaitTypes.add("Canter");
    if (card.tags.includes("Transition")) newGaitTypes.add("Transition");
    setGaitTypesUsed(newGaitTypes);
    
    // Update state
    setStamina(Math.max(0, newStamina));
    setTotalScore(prev => prev + score);
    setPlayedCards(prev => [...prev, { ...card, earnedScore: score }]);
    setHand(prev => prev.filter(c => c.id !== card.id));
    setComboLength(newComboLength);
    setFlowMeter(prev => flowBrokeNow ? 0 : Math.min(10, prev + (newComboLength > 0 ? 1 : 0)));

    // Clear performance state after animation
    setTimeout(() => {
      setIsPerforming(false);
    }, 3000);

    // Handle game end conditions
    if (card.tags.includes("Finish")) {
      setGameOver(true);
      setGameState('finished');
      const finalScore = totalScore + score;
      let rating = "Novice";
      if (finalScore >= 35) rating = "Master";
      else if (finalScore >= 25) rating = "Advanced";
      else if (finalScore >= 18) rating = "Intermediate";
      
      const turnBonus = currentTurn <= 6 ? " Efficient timing bonus!" : currentTurn <= 7 ? " Good timing!" : "";
      setMessage(`Routine complete!${turnBonus} Final score: ${finalScore} - ${rating} level!`);
    } else if (currentTurn >= maxTurns) {
      // Final turn passed without finishing
      setGameOver(true);
      setGameState('finished');
      setMessage(`Time's up! Final score: ${Math.max(0, totalScore + score)}`);
    } else if (deck.length === 0 && hand.length === 1) { // Will be 0 after removing this card
      // Game ends if no more cards
      setGameOver(true);
      setGameState('finished');
      setMessage(`All cards played! Final score: ${totalScore + score}`);
    } else {
      // Continue to next turn
      startNextTurn(bonusText);
    }
  };

  // Start next turn
  const startNextTurn = (messageText) => {
    // Draw a new card automatically
    const newCard = drawCard();
    if (newCard) {
      setHand(prev => [...prev, newCard]);
    }
    
    // Increment turn
    const nextTurn = currentTurn + 1;
    setCurrentTurn(nextTurn);
    setTurnPhase('buy');
    
    // Set turn message
    if (nextTurn >= maxTurns) {
      setMessage(`Turn ${nextTurn}/${maxTurns} - FINAL TURN! You must finish this turn!`);
    } else if (nextTurn >= maxTurns - 1) {
      setMessage(`Turn ${nextTurn}/${maxTurns} - Judge getting impatient! Consider finishing soon.`);
    } else {
      setMessage(messageText || `Turn ${nextTurn}/${maxTurns} - Move executed! Draw more cards or play your next move.`);
    }
  };

  // Card color helper
  const getCardColor = (type) => {
    const colors = {
      walk: 'bg-green-100 border-green-400',
      trot: 'bg-blue-100 border-blue-400', 
      canter: 'bg-purple-100 border-purple-400',
      transition: 'bg-yellow-100 border-yellow-400',
      specialty: 'bg-orange-100 border-orange-400',
      power: 'bg-pink-100 border-pink-400',
      finish: 'bg-red-100 border-red-400'
    };
    return colors[type] || 'bg-gray-100 border-gray-400';
  };

  // Finished screen
  if (gameState === 'finished') {
    let rating = "Novice";
    if (totalScore >= 35) rating = "Master";
    else if (totalScore >= 25) rating = "Advanced";
    else if (totalScore >= 18) rating = "Intermediate";

    return (
      <DressageArena
        selectedHorse={selectedHorse}
        currentScore={totalScore}
        stamina={stamina}
        flowMeter={flowMeter}
        comboLength={comboLength}
        currentTurn={currentTurn}
        maxTurns={maxTurns}
        lastPlayedCard={lastPlayedCard}
        isPerforming={isPerforming}
        flowBroke={flowBroke}
      >
        <div className="bg-white rounded-lg p-6 shadow-lg text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-4xl font-bold mb-2">Routine Complete!</h1>
          <div className="text-2xl mb-4">Final Score: <span className="font-bold text-blue-600">{totalScore}</span></div>
          <div className="text-xl mb-6">Rating: <span className="font-bold text-green-600">{rating}</span></div>
          <div className="flex justify-center gap-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Back to Stable
              </button>
            )}
            <button 
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      </DressageArena>
    );
  }

  // Main game with arena
  return (
    <DressageArena
      selectedHorse={selectedHorse}
      currentScore={totalScore}
      stamina={stamina}
      flowMeter={flowMeter}
      comboLength={comboLength}
      currentTurn={currentTurn}
      maxTurns={maxTurns}
      lastPlayedCard={lastPlayedCard}
      isPerforming={isPerforming}
      flowBroke={flowBroke}
    >
      {/* Game Content */}
      <div className="space-y-4">
        {/* Message */}
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded-lg text-center">
            {message}
          </div>
        )}

        {/* Buy Cards */}
        {turnPhase === 'buy' && deck.length > 0 && (
          <div className="text-center">
            <button
              onClick={buyCard}
              disabled={stamina < 1}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 mx-auto ${
                stamina >= 1 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              Draw Card (1 Stamina)
            </button>
          </div>
        )}

        {/* Hand */}
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-bold mb-3">Your Hand ({hand.length} cards)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hand.map(card => (
              <div 
                key={card.id}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${getCardColor(card.type)}`}
                onClick={() => playCard(card)}
              >
                <div className="font-bold text-sm mb-1">{card.name}</div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4" />
                  <span className="font-semibold">{card.base}</span>
                  {card.cost > 0 && (
                    <>
                      <Zap className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600">{card.cost}</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  {card.combo && <div>{card.combo}</div>}
                  {card.bonus && <div className="text-green-600">{card.bonus}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Back to Stable
            </button>
          )}
        </div>
      </div>
    </DressageArena>
  );
};

export default FullArenaGame;