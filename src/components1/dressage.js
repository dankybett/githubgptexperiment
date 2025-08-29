import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw, Play, Trophy, Zap, Star, Plus } from 'lucide-react';

const DressageCardGame = () => {
  // Card definitions
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

  const [gameState, setGameState] = useState('menu');
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [playedCards, setPlayedCards] = useState([]);
  const [stamina, setStamina] = useState(3);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [flowMeter, setFlowMeter] = useState(0);
  const [comboLength, setComboLength] = useState(0);
  const [turnPhase, setTurnPhase] = useState('draw'); // 'draw', 'buy', 'play', 'discard'
  const [currentTurn, setCurrentTurn] = useState(1);
  const [maxTurns] = useState(8);
  const [gaitTypesUsed, setGaitTypesUsed] = useState(new Set());
  const [cantersPlayed, setCantersPlayed] = useState(0);
  const [stretchingCircleUsed, setStretchingCircleUsed] = useState(false);
  const [staminaSurgeActive, setStaminaSurgeActive] = useState(false);
  const [maxHandSize] = useState(4);

  // Shuffle deck
  const shuffleDeck = () => {
    const shuffled = [...cardDeck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    return shuffled;
  };

  // Discard a card during discard phase
  const discardCard = (card) => {
    setHand(prev => prev.filter(c => c.id !== card.id));
    
    if (hand.length - 1 <= maxHandSize) {
      // Hand size is now acceptable, move to next turn
      setTurnPhase('draw');
      setTimeout(() => {
        startNewTurn();
      }, 1000);
    } else {
      setMessage(`Discard ${hand.length - 1 - maxHandSize} more card${hand.length - 1 - maxHandSize !== 1 ? 's' : ''}.`);
    }
  };

  // Start new game
  const startGame = () => {
    const newDeck = shuffleDeck();
    setHand(newDeck.slice(0, maxHandSize)); // Start with max hand size
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
    setTurnPhase('buy'); // Skip first draw since we start with cards
    setMessage('Turn 1/8 - Your turn! Draw cards with stamina or play a move.');
    setGameState('playing');
  };

  // Draw a new card from deck
  const drawCard = () => {
    if (deck.length === 0) return null;
    const newCard = deck[0];
    setDeck(prev => prev.slice(1));
    return newCard;
  };

  // Start turn by drawing a card
  const startNewTurn = () => {
    const newCard = drawCard();
    if (newCard) {
      setHand(prev => [...prev, newCard]);
    }
    
    setCurrentTurn(prev => prev + 1);
    setTurnPhase('buy');
    
    // Check turn warnings
    const nextTurn = currentTurn + 1;
    if (nextTurn > maxTurns) {
      // Game over - forced finish
      setGameOver(true);
      setGameState('finished');
      setMessage(`Time's up! The judge ended your routine. Final score: ${totalScore}`);
      return;
    } else if (nextTurn === maxTurns) {
      setMessage(`Turn ${nextTurn}/${maxTurns} - FINAL TURN! You must finish this turn!`);
    } else if (nextTurn >= maxTurns - 1) {
      setMessage(`Turn ${nextTurn}/${maxTurns} - Judge getting impatient! Consider finishing soon.`);
    } else {
      setMessage(`Turn ${nextTurn}/${maxTurns} - Draw more cards with stamina, then play a move.`);
    }
  };

  // Buy additional cards with stamina
  const buyCard = () => {
    if (stamina < 1) {
      setMessage("Not enough stamina to draw cards!");
      return;
    }
    if (deck.length === 0) {
      setMessage("No more cards in deck!");
      return;
    }

    const newCard = drawCard();
    if (newCard) {
      setHand(prev => [...prev, newCard]);
      setStamina(prev => prev - 1);
      setMessage(`Drew ${newCard.name}! Draw more or play a move.`);
    }
  };

  // Calculate combo bonuses and flow
  const calculateScore = (card, previousCard) => {
    let score = card.base;
    let bonusText = '';
    let flowBonus = 0;
    let newComboLength = comboLength;
    let flowBroke = false;

    // Check for combo matches
    let hasCombo = false;
    
    if (card.name === "Collected Walk" && previousCard?.tags.includes("Transition")) {
      score += 1;
      bonusText += "Transition combo +1! ";
      hasCombo = true;
    }
    if (card.name === "Medium Walk" && previousCard?.tags.includes("Walk")) {
      score += 2;
      bonusText += "Walk chain +2! ";
      hasCombo = true;
    }
    if (card.name === "Extended Trot" && previousCard?.tags.includes("Walk")) {
      score += 2;
      bonusText += "Walk→Trot +2! ";
      hasCombo = true;
    }
    if (card.name === "Canter Pirouette" && previousCard?.tags.includes("Transition")) {
      score += 3;
      bonusText += "Transition mastery +3! ";
      hasCombo = true;
    }
    if (card.name === "Collected Trot" && previousCard?.tags.includes("Transition")) {
      score += 2;
      bonusText += "Transition combo +2! ";
      hasCombo = true;
    }
    if (card.name === "Piaffe" && previousCard?.name === "Collected Trot") {
      score += 2;
      bonusText += "Perfect sequence +2! ";
      hasCombo = true;
    }
    if (card.name === "Flying Change" && previousCard?.tags.includes("Canter")) {
      score += 2;
      bonusText += "Canter combo +2! ";
      hasCombo = true;
    }
    if (card.name === "Rein Back" && previousCard?.tags.includes("Walk")) {
      score += 1;
      bonusText += "Walk combo +1! ";
      hasCombo = true;
    }
    if (card.name === "Shoulder-In" && previousCard?.tags.includes("Trot")) {
      score += 1;
      bonusText += "Trot chain +1! ";
      hasCombo = true;
    }
    if (card.name === "Passage" && previousCard?.name === "Piaffe") {
      score += 2;
      bonusText += "Classical sequence +2! ";
      hasCombo = true;
    }
    if (card.name === "Collected Trot" && previousCard?.tags.includes("Transition")) {
      score += 2;
      bonusText += "Transition combo +2! ";
      hasCombo = true;
    }
    if (card.name === "Collected Canter" && previousCard?.tags.includes("Transition")) {
      score += 2;
      bonusText += "Transition combo +2! ";
      hasCombo = true;
    }
    if (card.name === "Tempo Change") {
      // Tempo Change always maintains flow and gives small bonus
      score += 1;
      bonusText += "Perfect transition +1! ";
      hasCombo = true;
    }

    // New strategic card combos
    if (card.name === "Bold Extension") {
      const bonusPoints = cantersPlayed;
      score += bonusPoints;
      bonusText += `Canter mastery +${bonusPoints}! `;
      hasCombo = bonusPoints > 0;
    }
    if (card.name === "Training Level Test") {
      const varietyBonus = gaitTypesUsed.size;
      score += varietyBonus;
      bonusText += `Variety bonus +${varietyBonus}! `;
      hasCombo = varietyBonus > 0;
    }
    if (card.name === "Flow Master") {
      if (newComboLength >= 7) {
        score += 4;
        bonusText += "Flow perfection +4! ";
        hasCombo = true;
      } else if (newComboLength >= 5) {
        score += 2;
        bonusText += "Flow mastery +2! ";
        hasCombo = true;
      }
    }
    if (card.name === "Perfect Harmony") {
      const harmonyBonus = gaitTypesUsed.size * 2;
      score += harmonyBonus;
      bonusText += `Perfect harmony +${harmonyBonus}! `;
      hasCombo = harmonyBonus > 0;
    }
    if (card.name === "Technical Showcase") {
      if (newComboLength < 3) {
        score -= 3;
        bonusText += "Technical failure -3! ";
      } else {
        bonusText += "Technical mastery! ";
      }
    }
    if (card.name === "Freestyle Finish") {
      const freestyleBonus = gaitTypesUsed.size;
      score += freestyleBonus;
      bonusText += `Freestyle variety +${freestyleBonus}! `;
    }

    // Flow meter logic
    if (hasCombo || card.tags.includes("Transition")) {
      newComboLength += 1;
      bonusText += `Flow +${newComboLength}! `;
    } else if (previousCard && !card.tags.includes("Finish")) {
      // Flow breaks unless it's a natural progression or finish
      const naturalFlow = (
        (previousCard.tags.includes("Walk") && card.tags.includes("Trot")) ||
        (previousCard.tags.includes("Trot") && card.tags.includes("Canter")) ||
        card.tags.includes("Walk") // Walks are always graceful
      );
      
      if (!naturalFlow) {
        flowBroke = true;
        bonusText += "Flow broken... ";
        newComboLength = 0;
      } else {
        newComboLength = Math.max(1, newComboLength);
      }
    } else {
      newComboLength = Math.max(1, newComboLength);
    }

    // Counter-Canter penalty
    if (card.name === "Counter-Canter" && !previousCard?.tags.includes("Transition")) {
      score -= 1;
      bonusText += "Risky entry -1. ";
      flowBroke = true;
      newComboLength = 0;
    }

    // Flow multiplier bonus
    if (newComboLength >= 3) {
      flowBonus = Math.floor(score * 0.5);
      score += flowBonus;
      bonusText += `Flow mastery +${flowBonus}! `;
    }

    // Final Halt bonus
    if (card.name === "Final Halt & Salute" && playedCards.length >= 5) {
      score += 2;
      bonusText += "Long routine +2! ";
    }

    return { score, bonusText, newComboLength, flowBroke };
  };

  // Play a card
  const playCard = (card) => {
    if (gameOver) return;
    
    // Check stamina cost (with Stamina Surge bonus)
    const actualCost = staminaSurgeActive && card.name !== "Stamina Surge" ? 0 : card.cost;
    if (stamina < actualCost) {
      setMessage("Not enough stamina for this move!");
      return;
    }

    // Check unique card restrictions
    if (card.unique && card.name === "Stretching Circle" && stretchingCircleUsed) {
      setMessage("Stretching Circle can only be used once per game!");
      return;
    }

    // Check if Final Halt is required on final turn (only if player has it)
    if (currentTurn >= maxTurns && !card.tags.includes("Finish")) {
      const hasFinishCard = hand.some(c => c.tags.includes("Finish") && stamina >= c.cost);
      if (hasFinishCard) {
        setMessage("Final turn! You must finish with Final Halt & Salute!");
        return;
      }
      // If no affordable finish card available, allow any affordable move
    }

    // Check if Final Halt is being played but routine is too short (unless final turn)
    if (card.tags.includes("Finish") && playedCards.length < 3 && currentTurn < maxTurns) {
      setMessage("Routine too short! Perform at least 3 moves before finishing (unless final turn).");
      return;
    }

    const previousCard = playedCards[playedCards.length - 1];
    const { score, bonusText, newComboLength, flowBroke } = calculateScore(card, previousCard);

    // Update stamina
    let newStamina = stamina - actualCost;
    
    // Special card effects
    if (card.name === "Free Walk on Long Rein" || card.name === "Simple Change") {
      newStamina += 1;
      setMessage(`${bonusText}Stamina restored!`);
    } else if (card.name === "Stretching Circle" && !stretchingCircleUsed) {
      newStamina += 2;
      setStretchingCircleUsed(true);
      setMessage(`${bonusText}Deep stretch - stamina fully restored!`);
    } else if (card.name === "Steady Rhythm" && newComboLength >= 3) {
      newStamina += 1;
      setMessage(`${bonusText}Rhythm maintained - stamina restored!`);
    } else if (card.name === "Stamina Surge") {
      newStamina += 3;
      setStaminaSurgeActive(true);
      setMessage(`${bonusText}Energy surge - next card is free!`);
    } else if (card.name === "Tempo Change") {
      // Draw extra card
      const extraCard = drawCard();
      if (extraCard) {
        setHand(prev => [...prev, extraCard]);
        setMessage(`${bonusText}Drew extra card: ${extraCard.name}!`);
      } else {
        setMessage(bonusText || `${card.name} executed beautifully!`);
      }
    } else {
      setMessage(bonusText || `${card.name} executed beautifully!`);
    }

    // Track gait types and canter count
    const newGaitTypes = new Set(gaitTypesUsed);
    if (card.tags.includes("Walk")) newGaitTypes.add("Walk");
    if (card.tags.includes("Trot")) newGaitTypes.add("Trot");
    if (card.tags.includes("Canter")) newGaitTypes.add("Canter");
    if (card.tags.includes("Transition")) newGaitTypes.add("Transition");
    
    setGaitTypesUsed(newGaitTypes);
    
    if (card.tags.includes("Canter")) {
      setCantersPlayed(prev => prev + 1);
    }

    // Clear stamina surge after use
    if (staminaSurgeActive && card.name !== "Stamina Surge") {
      setStaminaSurgeActive(false);
    }

    // Update game state
    setStamina(Math.max(0, newStamina));
    setTotalScore(prev => prev + score);
    setPlayedCards(prev => [...prev, { ...card, earnedScore: score }]);
    setHand(prev => prev.filter(c => c.id !== card.id));
    setComboLength(newComboLength);
    setFlowMeter(prev => flowBroke ? 0 : Math.min(10, prev + (newComboLength > 0 ? 1 : 0)));

    // Check if game should end
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
      // Final turn passed without finishing gracefully
      setGameOver(true);
      setGameState('finished');
      let finalScore = totalScore + score;
      let penaltyMessage = "";
      
      // Only apply penalty if they had affordable finish options
      const hadAffordableFinish = hand.some(c => c.tags.includes("Finish") && stamina >= c.cost);
      if (hadAffordableFinish && !card.tags.includes("Finish")) {
        finalScore -= 3; // Reduced penalty
        penaltyMessage = " -3 penalty for not finishing gracefully.";
      }
      
      setMessage(`Time's up!${penaltyMessage} Final score: ${Math.max(0, finalScore)}`);
    } else if (deck.length === 0 && hand.length === 0) {
      // Game ends if no more cards
      setGameOver(true);
      setGameState('finished');
      const finalScore = totalScore + score;
      setMessage(`All cards played! Final score: ${finalScore}`);
    } else {
      // Continue to next turn - check if need to discard first
      if (hand.length > maxHandSize) {
        setTurnPhase('discard');
        setMessage(`Turn ${currentTurn} complete! Discard down to ${maxHandSize} cards before continuing.`);
      } else {
        setTurnPhase('draw');
        setTimeout(() => {
          startNewTurn();
        }, 1500);
      }
    }
  };

  // Get card color based on type
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

  // Check if move maintains flow
  const wouldMaintainFlow = (card) => {
    if (playedCards.length === 0) return true;
    const previousCard = playedCards[playedCards.length - 1];
    
    // Always maintains flow
    if (card.tags.includes("Transition") || card.tags.includes("Walk") || card.tags.includes("Finish")) {
      return true;
    }
    
    // Natural progressions
    if (previousCard.tags.includes("Walk") && card.tags.includes("Trot")) return true;
    if (previousCard.tags.includes("Trot") && card.tags.includes("Canter")) return true;
    if (previousCard.tags.includes("Transition")) return true;
    
    // Combo continuations
    if (card.name === "Medium Walk" && previousCard.tags.includes("Walk")) return true;
    if (card.name === "Extended Trot" && previousCard.tags.includes("Walk")) return true;
    if (card.name === "Collected Trot" && previousCard.tags.includes("Transition")) return true;
    if (card.name === "Piaffe" && previousCard.name === "Collected Trot") return true;
    if (card.name === "Flying Change" && previousCard.tags.includes("Canter")) return true;
    if (card.name === "Shoulder-In" && previousCard.tags.includes("Trot")) return true;
    if (card.name === "Passage" && previousCard.name === "Piaffe") return true;
    
    return false;
  };

  const Card = ({ card, onClick, onDiscard, disabled = false, showFlowIndicator = false, discardMode = false }) => {
    const maintainsFlow = wouldMaintainFlow(card);
    const flowClass = showFlowIndicator ? (maintainsFlow ? 'ring-2 ring-green-400' : 'ring-2 ring-red-400') : '';
    
    return (
      <div 
        className={`p-3 rounded-lg border-2 transition-all ${getCardColor(card.type)} ${flowClass} ${
          disabled ? 'opacity-50' : 'hover:scale-105 cursor-pointer'
        }`}
      >
        <div className="font-bold text-sm mb-1 flex items-center justify-between">
          <span>{card.name}</span>
          {showFlowIndicator && (
            <span className={`text-xs ${maintainsFlow ? 'text-green-600' : 'text-red-600'}`}>
              {maintainsFlow ? '✓' : '✗'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span className="font-semibold">{card.base}</span>
          </div>
          {card.cost > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <Zap className="w-4 h-4" />
              <span className="text-sm">{card.cost}</span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-600 mb-3">
          {card.combo && <div className="mb-1">{card.combo}</div>}
          {card.risk && <div className="text-red-600">{card.risk}</div>}
          {card.bonus && <div className="text-green-600">{card.bonus}</div>}
        </div>
        {discardMode ? (
          <button
            onClick={() => onDiscard && onDiscard(card)}
            className="w-full py-1 px-2 rounded text-xs font-bold bg-red-500 hover:bg-red-600 text-white cursor-pointer"
          >
            Discard
          </button>
        ) : (
          <button
            onClick={() => !disabled && onClick(card)}
            disabled={disabled}
            className={`w-full py-1 px-2 rounded text-xs font-bold ${
              disabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            }`}
          >
            Play Move
          </button>
        )}
      </div>
    );
  };

  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-b from-blue-50 to-green-50 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">🐎 Dressage Combo Card Game</h1>
          <p className="text-lg text-gray-600 mb-6">Master the art of equestrian elegance through strategic card play</p>
          <button 
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 mx-auto text-lg"
          >
            <Play className="w-5 h-5" />
            Start New Game
          </button>
        </div>
        
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">How to Play</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-bold mb-2">🎯 Objective</h3>
              <p className="mb-4">Build an elegant dressage routine by playing cards in sequence for combo bonuses!</p>
              
              <h3 className="font-bold mb-2">🔄 Turn Structure</h3>
              <p className="mb-4">Each turn: Draw a card → Optionally buy more cards with stamina → Play exactly one card</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">⚡ Stamina System</h3>
              <p className="mb-4">Spend stamina to draw extra cards OR play advanced moves. Manage wisely!</p>
              
              <h3 className="font-bold mb-2">🗂️ Hand Management</h3>
              <p className="mb-4">Maintain exactly 4 cards! After playing, discard excess cards strategically.</p>
              
              <h3 className="font-bold mb-2">⏰ Turn Limit</h3>
              <p className="mb-4">You have exactly 8 turns to build your routine. Plan wisely!</p>
              
              <h3 className="font-bold mb-2">🌊 Flow System</h3>
              <p className="mb-4">Chain compatible moves for flow bonuses! Breaking flow resets your combo chain.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <h3 className="font-bold mb-4">Flow & Strategy Guide</h3>
          <div className="text-sm space-y-2 mb-4">
            <p><strong>🌊 Natural Flow:</strong> Walk → Trot → Canter always maintains flow</p>
            <p><strong>🔗 Transitions:</strong> Yellow cards connect ANY moves together gracefully</p>
            <p><strong>⚡ Flow Bonuses:</strong> 3+ combo length gives +50% points to that move</p>
            <p><strong>🎯 Hand Management:</strong> Spend stamina early for options, save late for power moves</p>
          </div>
          
          <h4 className="font-bold mb-2">Move Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>Walks - Safe & Graceful</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span>Trots - Foundation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-400 rounded"></div>
              <span>Canters - High Risk/Reward</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Transitions - Flow Connectors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span>Specialty - Advanced</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-400 rounded"></div>
              <span>Power - Game Changers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span>Finish - Routine Ender</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    let rating = "Novice";
    if (totalScore >= 35) rating = "Master";
    else if (totalScore >= 25) rating = "Advanced";
    else if (totalScore >= 18) rating = "Intermediate";

    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-b from-blue-50 to-green-50 min-h-screen">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-4xl font-bold mb-2">Routine Complete!</h1>
          <div className="text-2xl mb-4">Final Score: <span className="font-bold text-blue-600">{totalScore}</span></div>
          <div className="text-xl mb-6">Rating: <span className="font-bold text-green-600">{rating}</span></div>
          <button 
            onClick={() => setGameState('menu')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Play Again
          </button>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Your Routine</h2>
          <div className="grid gap-3">
            {playedCards.map((card, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{index + 1}. {card.name}</span>
                <span className="font-bold text-blue-600">+{card.earnedScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gradient-to-b from-blue-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Dressage Combo Card Game</h1>
        <div className="flex justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold">Score: {totalScore}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="font-bold">Stamina: {stamina}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm">Flow:</div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < flowMeter ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              ))}
            </div>
            <span className="text-sm">Chain: {comboLength}</span>
          </div>
          <div className={`text-sm font-bold ${
            currentTurn >= maxTurns ? 'text-red-600' : 
            currentTurn >= maxTurns - 1 ? 'text-yellow-600' : 
            'text-gray-600'
          }`}>
            Turn: {currentTurn}/{maxTurns}
          </div>
        </div>
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded-lg inline-block">
            {message}
          </div>
        )}
      </div>

      {/* Turn Phase Indicator */}
      <div className="text-center mb-4">
        {turnPhase === 'draw' && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg inline-block">
            🎯 Drawing new card...
          </div>
        )}
        {turnPhase === 'discard' && (
          <div className="bg-orange-100 border border-orange-400 text-orange-800 px-4 py-2 rounded-lg inline-block">
            🗂️ Discard {hand.length - maxHandSize} card{hand.length - maxHandSize !== 1 ? 's' : ''} to continue
          </div>
        )}
        {turnPhase === 'buy' && (
          <div className={`px-4 py-2 rounded-lg inline-block ${
            currentTurn >= maxTurns ? 'bg-red-100 border border-red-400 text-red-800' :
            currentTurn >= maxTurns - 1 ? 'bg-yellow-100 border border-yellow-400 text-yellow-800' :
            'bg-green-100 border border-green-400 text-green-800'
          }`}>
            {currentTurn >= maxTurns ? '⏰ FINAL TURN - Must finish!' :
             currentTurn >= maxTurns - 1 ? '⚠️ Judge getting impatient!' :
             '💰 Buy more cards with stamina, then play a move'}
          </div>
        )}
      </div>

      {/* Buy Cards Action */}
      {turnPhase === 'buy' && deck.length > 0 && (
        <div className="text-center mb-6">
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
          <p className="text-xs text-gray-600 mt-2">Remember: You'll discard down to {maxHandSize} cards after playing</p>
        </div>
      )}

      {/* Played Cards */}
      {playedCards.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Your Routine ({playedCards.length} moves)</h2>
          <div className="grid gap-3">
            {playedCards.map((card, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${getCardColor(card.type)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm bg-white px-2 py-1 rounded">{index + 1}</span>
                    <span className="font-bold text-base">{card.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold text-sm">{card.base}</span>
                    </div>
                    <div className="font-bold text-blue-600 text-lg">+{card.earnedScore}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Tags:</span>
                    <div className="flex gap-1">
                      {card.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-white px-2 py-1 rounded text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {card.cost > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <Zap className="w-3 h-3" />
                      <span className="text-xs">Cost: {card.cost}</span>
                    </div>
                  )}
                </div>

                {(card.combo || card.bonus || card.risk) && (
                  <div className="mt-2 text-xs space-y-1">
                    {card.combo && <div className="text-blue-600">💫 {card.combo}</div>}
                    {card.bonus && <div className="text-green-600">✨ {card.bonus}</div>}
                    {card.risk && <div className="text-red-600">⚠️ {card.risk}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Flow Summary */}
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Routine Summary:</span>
              <div className="flex items-center gap-4">
                <span>Total Score: <strong className="text-blue-600">{totalScore}</strong></span>
                <span>Current Flow Chain: <strong className="text-green-600">{comboLength}</strong></span>
                <span>Moves: <strong>{playedCards.length}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hand */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">
          Your Hand ({hand.length} cards)
          {turnPhase === 'discard' && (
            <span className="text-orange-600 text-sm ml-2">
              - Choose {hand.length - maxHandSize} to discard
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {hand.map(card => (
            <Card 
              key={card.id} 
              card={card} 
              onClick={playCard}
              onDiscard={discardCard}
              discardMode={turnPhase === 'discard'}
              disabled={
                turnPhase !== 'discard' && (
                  (staminaSurgeActive && card.name !== "Stamina Surge" ? 0 : stamina) < card.cost || 
                  (card.unique && card.name === "Stretching Circle" && stretchingCircleUsed) ||
                  (card.tags.includes("Finish") && playedCards.length < 3 && currentTurn < maxTurns) ||
                  (currentTurn >= maxTurns && !card.tags.includes("Finish") && hand.some(c => c.tags.includes("Finish") && (staminaSurgeActive ? 0 : stamina) >= c.cost))
                )
              }
              showFlowIndicator={playedCards.length > 0 && turnPhase !== 'discard'}
            />
          ))}
        </div>
        {turnPhase === 'discard' ? (
          <div className="mt-3 text-sm text-center">
            <div className="text-orange-600">Choose cards to discard. Keep your best options for next turn!</div>
          </div>
        ) : (
          playedCards.length > 0 && (
            <div className="mt-3 text-sm text-center space-y-1">
              <div className="text-green-600">✓ Green ring = Maintains flow</div>
              <div className="text-red-600">✗ Red ring = Breaks flow</div>
            </div>
          )
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setGameState('menu')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </button>
      </div>
    </div>
  );
};

export default DressageCardGame;