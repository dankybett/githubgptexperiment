import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, RotateCcw, Play, Trophy, Zap, Star, Plus } from 'lucide-react';
import DressageArena from './DressageArena';

// This is a modified version of the card game that works WITHIN the arena
const FullArenaGame = ({ selectedHorse, onBack }) => {
  // Copy all the game state from the original dressage.js
  const cardDeck = [
    // Walks (4 cards) - Safe foundation + stamina management
    { id: 1, name: "Collected Walk", base: 1, tags: ["Walk"], flow: "+1 if after [Transition]", cost: 0, type: "walk" },
    { id: 2, name: "Medium Walk", base: 1, tags: ["Walk"], flow: "+2 if after another [Walk]", cost: 0, type: "walk" },
    { id: 3, name: "Free Walk on Long Rein", base: 1, tags: ["Walk"], bonus: "Restore 1 Stamina", cost: 0, type: "walk" },
    { id: 4, name: "Stretching Circle", base: 1, tags: ["Walk"], bonus: "Restore 2 Stamina (once per game)", cost: 0, type: "walk", unique: true },
    
    // Trots (5 cards) - Reliable scoring + flow building
    { id: 5, name: "Working Trot", base: 2, tags: ["Trot"], flow: "Solid foundation move", cost: 0, type: "trot" },
    { id: 6, name: "Extended Trot", base: 2, tags: ["Trot"], flow: "+2 if after [Walk]", cost: 0, type: "trot" },
    { id: 7, name: "Collected Trot", base: 2, tags: ["Trot"], flow: "+2 if after [Transition]", cost: 0, type: "trot" },
    { id: 8, name: "Piaffe", base: 4, tags: ["Trot"], flow: "+2 if after Collected Trot", cost: 1, type: "trot" },
    { id: 9, name: "Steady Rhythm", base: 2, tags: ["Trot"], flow: "+1 Stamina if flow level ≥ 3", cost: 0, type: "trot" },
    
    // Canters (4 cards) - High risk/reward + power plays
    { id: 10, name: "Working Canter", base: 2, tags: ["Canter"], flow: "Safe setup for flow", cost: 0, type: "canter" },
    { id: 11, name: "Extended Canter", base: 3, tags: ["Canter"], risk: "Costs 1 Stamina", cost: 1, type: "canter" },
    { id: 12, name: "Canter Pirouette", base: 4, tags: ["Canter"], flow: "+3 if after [Transition]", cost: 2, type: "canter" },
    { id: 13, name: "Bold Extension", base: 2, tags: ["Canter"], flow: "+1 for each Canter played this game", cost: 1, type: "canter" },
    
    // Transitions (4 cards) - Flow enablers + utility
    { id: 14, name: "Flying Change", base: 2, tags: ["Transition"], flow: "+2 if after [Canter]", cost: 0, type: "transition" },
    { id: 15, name: "Simple Change", base: 1, tags: ["Transition"], bonus: "Restore 1 Stamina", cost: 0, type: "transition" },
    { id: 16, name: "Rein Back", base: 2, tags: ["Transition"], flow: "+1 if after [Walk]", cost: 0, type: "transition" },
    { id: 17, name: "Tempo Change", base: 2, tags: ["Transition"], flow: "Universal connector + draw 1 card", cost: 0, type: "transition" },
    
    // Specialty (5 cards) - Build-around strategies
    { id: 18, name: "Shoulder-In", base: 2, tags: ["Trot"], flow: "+1 if after another [Trot]", cost: 0, type: "specialty" },
    { id: 19, name: "Passage", base: 4, tags: ["Trot"], flow: "+2 if after Piaffe", cost: 1, type: "specialty" },
    { id: 20, name: "Counter-Canter", base: 3, tags: ["Canter"], risk: "-1 Style if not preceded by [Transition]", cost: 0, type: "specialty" },
    { id: 21, name: "Training Level Test", base: 1, tags: ["Walk"], flow: "+1 for each different gait type played", cost: 0, type: "specialty" },
    { id: 22, name: "Flow Master", base: 1, tags: ["Transition"], flow: "+2 if flow level ≥ 5, +4 if ≥ 7", cost: 0, type: "specialty" },
    
    // Power Cards (3 cards) - Game changers
    { id: 23, name: "Perfect Harmony", base: 3, tags: ["Specialty"], flow: "+2 for each gait type used this game", cost: 2, type: "power" },
    { id: 24, name: "Stamina Surge", base: 1, tags: ["Walk"], bonus: "Gain 3 Stamina, next card costs 0", cost: 0, type: "power" },
    { id: 25, name: "Technical Showcase", base: 6, tags: ["Specialty"], risk: "-3 if flow level < 3", cost: 3, type: "power" },
    
    // Finish (2 cards)
    { id: 26, name: "Final Halt & Salute", base: 3, tags: ["Finish"], bonus: "+2 if routine length ≥ 6", cost: 0, type: "finish" },
    { id: 27, name: "Freestyle Finish", base: 4, tags: ["Finish"], bonus: "+1 for each gait type used this game", cost: 1, type: "finish" }
  ];

  // Game state
  const [gameState, setGameState] = useState('playing');
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [playedCards, setPlayedCards] = useState([]);
  const [stamina, setStamina] = useState(3);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [flowMeter, setFlowMeter] = useState(0);
  const [flowLevel, setFlowLevel] = useState(0);
  const [turnPhase, setTurnPhase] = useState('draw');
  const [currentTurn, setCurrentTurn] = useState(1);
  const [maxTurns] = useState(8);
  const [gaitTypesUsed, setGaitTypesUsed] = useState(new Set());
  const [cantersPlayed, setCantersPlayed] = useState(0);
  const [stretchingCircleUsed, setStretchingCircleUsed] = useState(false);
  const [staminaSurgeActive, setStaminaSurgeActive] = useState(false);
  const [maxHandSize] = useState(4);
  const [needsDiscard, setNeedsDiscard] = useState(false);
  
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
    setFlowLevel(0);
    setCurrentTurn(1);
    setGaitTypesUsed(new Set());
    setCantersPlayed(0);
    setStretchingCircleUsed(false);
    setStaminaSurgeActive(false);
    setNeedsDiscard(false);
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
    let newFlowLevel = flowLevel;
    let flowBrokeNow = false;

    // Basic flow checking (simplified version)
    let hasFlow = false;
    
    if (card.name === "Extended Trot" && previousCard?.tags.includes("Walk")) {
      score += 2;
      bonusText += "Walk→Trot +2! ";
      hasFlow = true;
    }
    if (card.name === "Flying Change" && previousCard?.tags.includes("Canter")) {
      score += 2;
      bonusText += "Canter flow +2! ";
      hasFlow = true;
    }
    // Add more flow logic as needed...

    // Flow logic with gait progression support
    if (hasFlow || card.tags.includes("Transition")) {
      newFlowLevel += 1;
      bonusText += `Flow +${newFlowLevel}! `;
    } else if (previousCard && !card.tags.includes("Finish")) {
      const naturalFlow = (
        // Cross-gait natural progressions
        (previousCard.tags.includes("Walk") && card.tags.includes("Trot")) ||
        (previousCard.tags.includes("Trot") && card.tags.includes("Canter")) ||
        // Walks always maintain flow
        card.tags.includes("Walk") ||
        // Same-gait progressions (Trot 1→2→3, Canter 1→2→3)
        ((previousCard.tags.includes("Trot") && card.tags.includes("Trot")) && 
         maintainsSameGaitFlow(card, previousCard)) ||
        ((previousCard.tags.includes("Canter") && card.tags.includes("Canter")) && 
         maintainsSameGaitFlow(card, previousCard))
      );
      
      if (!naturalFlow) {
        flowBrokeNow = true;
        bonusText += "Flow broken... ";
        newFlowLevel = 0;
      } else {
        // Increment flow level for maintaining flow
        newFlowLevel = Math.min(3, newFlowLevel + 1);
      }
    } else {
      // First card or finish card - set initial flow level
      newFlowLevel = 1;
    }

    // Flow multiplier bonus
    if (newFlowLevel >= 3) {
      flowBonus = Math.floor(score * 0.5);
      score += flowBonus;
      bonusText += `Flow mastery +${flowBonus}! `;
    }

    return { score, bonusText, newFlowLevel, flowBroke: flowBrokeNow };
  };

  // Gait progression system
  const getGaitLevel = (cardName, tags) => {
    // Trot progression levels
    if (tags.includes("Trot")) {
      if (["Working Trot", "Steady Rhythm"].includes(cardName)) return 1; // Foundation
      if (["Extended Trot"].includes(cardName)) return 2; // Advanced
      if (["Collected Trot", "Piaffe", "Shoulder-In", "Passage"].includes(cardName)) return 3; // Refined
    }
    
    // Canter progression levels  
    if (tags.includes("Canter")) {
      if (["Working Canter"].includes(cardName)) return 1; // Foundation
      if (["Extended Canter", "Bold Extension"].includes(cardName)) return 2; // Advanced
      if (["Canter Pirouette", "Counter-Canter"].includes(cardName)) return 3; // Refined
    }
    
    return 0; // Not a progressive gait
  };

  // Check if same-gait transition maintains flow
  const maintainsSameGaitFlow = (currentCard, previousCard) => {
    // Walks always maintain flow
    if (currentCard.tags.includes("Walk")) return true;
    
    // For trots and canters, check progression order
    const prevLevel = getGaitLevel(previousCard.name, previousCard.tags);
    const currentLevel = getGaitLevel(currentCard.name, currentCard.tags);
    
    if (prevLevel > 0 && currentLevel > 0) {
      // Allow same level or progression to higher level, but not regression
      return currentLevel >= prevLevel;
    }
    
    return false;
  };

  // Enhanced flow analysis function
  const analyzeFlow = (card) => {
    if (playedCards.length === 0) {
      return {
        maintains: true,
        type: 'start',
        flowBonus: 0,
        flowMultiplier: 1,
        newFlowLevel: 1,
        reason: 'Starting move'
      };
    }

    const previousCard = playedCards[playedCards.length - 1];
    const { score, bonusText, newFlowLevel, flowBroke } = calculateScore(card, previousCard);
    const flowBonus = score - card.base;
    const flowMultiplier = newFlowLevel >= 3 ? 1.5 : 1;
    
    // Always maintains flow
    if (card.tags.includes("Transition") || card.tags.includes("Walk") || card.tags.includes("Finish")) {
      return {
        maintains: true,
        type: card.tags.includes("Transition") ? 'transition' : card.tags.includes("Walk") ? 'graceful' : 'finish',
        flowBonus,
        flowMultiplier,
        newFlowLevel,
        reason: card.tags.includes("Transition") ? 'Universal connector' : card.tags.includes("Walk") ? 'Always graceful' : 'Routine finish'
      };
    }
    
    // Natural cross-gait progressions
    if (previousCard.tags.includes("Walk") && card.tags.includes("Trot")) {
      return {
        maintains: true,
        type: 'natural',
        flowBonus,
        flowMultiplier,
        newFlowLevel,
        reason: 'Walk → Trot progression'
      };
    }
    if (previousCard.tags.includes("Trot") && card.tags.includes("Canter")) {
      return {
        maintains: true,
        type: 'natural',
        flowBonus,
        flowMultiplier,
        newFlowLevel,
        reason: 'Trot → Canter progression'
      };
    }
    if (previousCard.tags.includes("Transition")) {
      return {
        maintains: true,
        type: 'connected',
        flowBonus,
        flowMultiplier,
        newFlowLevel,
        reason: 'After transition'
      };
    }
    
    // Same-gait progressions (new logic)
    if ((previousCard.tags.includes("Trot") && card.tags.includes("Trot")) ||
        (previousCard.tags.includes("Canter") && card.tags.includes("Canter"))) {
      
      if (maintainsSameGaitFlow(card, previousCard)) {
        const prevLevel = getGaitLevel(previousCard.name, previousCard.tags);
        const currentLevel = getGaitLevel(card.name, card.tags);
        const gaitType = card.tags.includes("Trot") ? "Trot" : "Canter";
        
        return {
          maintains: true,
          type: 'progression',
          flowBonus,
          flowMultiplier,
          newFlowLevel,
          reason: currentLevel > prevLevel ? `${gaitType} progression` : `${gaitType} continuation`
        };
      } else {
        // Same gait but wrong order (regression)
        return {
          maintains: false,
          type: 'regression',
          flowBonus: 0,
          flowMultiplier: 1,
          newFlowLevel: 0,
          reason: 'Improper gait regression',
          penalty: flowLevel
        };
      }
    }
    
    // Specific flow bonuses
    const specificFlowBonuses = {
      "Extended Trot": previousCard.tags.includes("Walk") && 'Walk → Trot flow',
      "Flying Change": previousCard.tags.includes("Canter") && 'Canter flow',
    };
    
    if (specificFlowBonuses[card.name]) {
      return {
        maintains: true,
        type: 'combo',
        flowBonus,
        flowMultiplier,
        newFlowLevel,
        reason: specificFlowBonuses[card.name]
      };
    }
    
    // Flow breaks
    return {
      maintains: !flowBroke,
      type: 'break',
      flowBonus: flowBroke ? 0 : flowBonus,
      flowMultiplier: 1,
      newFlowLevel: flowBroke ? 0 : newFlowLevel,
      reason: flowBroke ? 'Breaks flow pattern' : 'Maintains flow',
      penalty: flowBroke ? flowLevel : 0
    };
  };

  // Simplified Flow Indicator Component
  const FlowIndicator = ({ card }) => {
    const flowInfo = analyzeFlow(card);
    
    // Handle first card case
    if (playedCards.length === 0) {
      return (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="text-blue-700 font-medium">🎯 Opening Move</div>
          <div className="text-gray-700 text-xs mt-1">Score: {card.base} points</div>
        </div>
      );
    }
    
    if (!flowInfo.maintains) {
      return (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <div className="text-red-700 font-medium">✗ Breaks Flow</div>
          <div className="text-gray-700 text-xs mt-1">Score: {card.base} points</div>
        </div>
      );
    }

    const totalScore = card.base + flowInfo.flowBonus + (flowInfo.flowMultiplier > 1 ? Math.floor(card.base * 0.5) : 0);
    
    return (
      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
        <div className="text-green-700 font-medium">✓ Maintains Flow</div>
        <div className="text-gray-700 text-xs mt-1">Score: {totalScore} points</div>
        {flowInfo.flowBonus > 0 && (
          <div className="text-blue-600 text-xs">+{flowInfo.flowBonus} flow bonus</div>
        )}
        {flowInfo.flowMultiplier > 1 && (
          <div className="text-purple-600 text-xs">+{Math.floor(card.base * 0.5)} flow bonus</div>
        )}
      </div>
    );
  };

  // Compact Routine Summary Component
  const RoutineSummary = () => {
    const [hoveredCard, setHoveredCard] = useState(null);

    if (playedCards.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h3 className="text-sm font-bold mb-2">Your Routine</h3>
          <p className="text-xs text-gray-500">No moves performed yet</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg p-3 mb-4 border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">Your Routine ({playedCards.length} moves)</h3>
          <div className="text-xs text-gray-600">
            Score: <span className="font-bold text-blue-600">{totalScore}</span> | 
            Flow: <span className="font-bold text-green-600">{flowLevel}</span>
          </div>
        </div>
        
        {/* Card sequence */}
        <div className="flex flex-wrap gap-1 mb-1">
          {playedCards.map((card, index) => (
            <div 
              key={index}
              className={`relative inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-help ${
                getCardColor(card.type).replace('bg-', 'bg-').replace('-100', '-200').replace('border-', 'border-').replace('-400', '-500')
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <span className="text-xs bg-white px-1 rounded font-bold">{index + 1}</span>
              {getProgressionLevelText(card) ? (
                <span className={`text-xs px-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                  {card.tags.includes("Trot") ? "T" : "C"}{getGaitLevel(card.name, card.tags)}
                </span>
              ) : (
                <span className={`text-xs px-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                  {getPrimaryGaitType(card)[0]}
                </span>
              )}
              <span className="truncate max-w-16">{card.name}</span>
              <span className="text-xs font-bold">+{card.earnedScore}</span>
              
              {/* Hover tooltip */}
              {hoveredCard === index && (
                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
                  {card.name} - {card.earnedScore} points
                  {card.earnedScore > card.base && <div className="text-green-300">Bonus: +{card.earnedScore - card.base}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-400">Hover cards for details</div>
      </div>
    );
  };

  // Interactive Tutorial Component
  const DressageTutorial = () => {
    const tutorialSteps = [
      {
        title: "Welcome to Dressage!",
        content: "This tutorial covers both basic flow rules AND advanced special cards. Click 'Next' to learn everything!",
        example: null,
        section: "intro"
      },
      
      // BASIC FLOW SECTION
      {
        title: "Basic Flow Rule #1: Natural Progressions", 
        content: "Horses naturally progress: Walk → Trot → Canter. Walks are always graceful. Trots and Canters can chain if played in logical order (Working → Extended → Collected).",
        example: {
          cards: [
            { name: "Free Walk", tags: ["Walk"], base: 1, type: "walk" },
            { name: "Extended Trot", tags: ["Trot"], base: 2, type: "trot" }
          ],
          flow: "✓ Walk → Trot maintains flow and gets +2 flow bonus!"
        },
        section: "basic"
      },
      {
        title: "Basic Flow Rule #2: Transitions Connect Everything",
        content: "TRANSITION cards (yellow badges) can connect ANY moves together gracefully.",
        example: {
          cards: [
            { name: "Extended Canter", tags: ["Canter"], base: 3, type: "canter" },
            { name: "Simple Change", tags: ["Transition"], base: 1, type: "transition" },
            { name: "Free Walk", tags: ["Walk"], base: 1, type: "walk" }
          ],
          flow: "✓ Transitions let you go Canter → Walk safely!"
        },
        section: "basic"
      },
      {
        title: "Flow Breaking & Bonuses",
        content: "Some moves break flow, but flow level 3+ gives +50% bonus! Flow level shows in the top bar.",
        example: {
          cards: [
            { name: "Walk", tags: ["Walk"], base: 1, type: "walk" },
            { name: "Trot", tags: ["Trot"], base: 2, type: "trot" },
            { name: "Canter", tags: ["Canter"], base: 3, type: "canter" }
          ],
          flow: "✓ Flow level 3+ gives: Walk (1), Trot (3), Canter (4.5 points)!"
        },
        section: "basic"
      },
      {
        title: "Gait Progression System",
        content: "Trots and Canters have progression levels: Working (basic) → Extended (advanced) → Collected/Refined (expert). You can progress up or stay at same level, but not regress!",
        example: {
          cards: [
            { name: "Working Trot", tags: ["Trot"], base: 2, type: "trot" },
            { name: "Extended Trot", tags: ["Trot"], base: 2, type: "trot" },
            { name: "Collected Trot", tags: ["Trot"], base: 2, type: "trot" }
          ],
          flow: "✓ Working → Extended → Collected maintains flow!"
        },
        section: "basic"
      },

      // SPECIAL CARDS SECTION  
      {
        title: "Special Cards: Stamina Management",
        content: "Some cards restore stamina! Free Walk gives +1, Stretching Circle gives +2 (once per game).",
        example: {
          cards: [
            { name: "Free Walk on Long Rein", tags: ["Walk"], base: 1, type: "walk", bonus: "Restore 1 Stamina" },
            { name: "Stretching Circle", tags: ["Walk"], base: 1, type: "walk", bonus: "Restore 2 Stamina (once per game)" }
          ],
          flow: "💙 These cards help you buy more cards or play costly moves!"
        },
        section: "special"
      },
      {
        title: "Special Cards: Power Moves",
        content: "Advanced moves cost stamina but give huge rewards. Piaffe costs 1 stamina for 4 points!",
        example: {
          cards: [
            { name: "Piaffe", tags: ["Trot"], base: 4, type: "trot", cost: 1 },
            { name: "Canter Pirouette", tags: ["Canter"], base: 4, type: "canter", cost: 2 }
          ],
          flow: "⚡ High-cost, high-reward moves for experienced players!"
        },
        section: "special"
      },
      {
        title: "Special Cards: Strategic Cards",
        content: "Some cards get bonuses based on your game history. Bold Extension gets +1 for each Canter played!",
        example: {
          cards: [
            { name: "Bold Extension", tags: ["Canter"], base: 2, type: "canter" },
            { name: "Perfect Harmony", tags: ["Specialty"], base: 3, type: "power" }
          ],
          flow: "🎯 Plan your routine to maximize these strategic bonuses!"
        },
        section: "special"
      },

      // FINISHING SECTION
      {
        title: "Finishing Your Routine: When to Finish",
        content: "You have 8 turns max. You can finish anytime after 3 moves, but longer routines score more points!",
        example: {
          cards: [
            { name: "Final Halt & Salute", tags: ["Finish"], base: 3, type: "finish" },
            { name: "Freestyle Finish", tags: ["Finish"], base: 4, type: "finish" }
          ],
          flow: "🏁 Final Halt is safe. Freestyle gives +1 per gait type used!"
        },
        section: "finishing"
      },
      {
        title: "Finishing Strategy",
        content: "Plan ahead! If you don't finish gracefully by turn 8, you lose points. Save a finish card for emergencies.",
        example: null,
        section: "finishing"
      },
      {
        title: "Resource Management",
        content: "Stamina lets you draw cards OR play advanced moves. Spend early for options, save late for power plays!",
        example: null,
        section: "strategy"
      },

      {
        title: "You're Ready to Compete!",
        content: "You now know: Basic flow, gait progressions, special cards, finishing rules, and strategy! Practice makes perfect. Good luck!",
        example: null,
        section: "conclusion"
      }
    ];

    const currentStep = tutorialSteps[tutorialStep];
    
    // Get section info
    const getSectionInfo = (section) => {
      const sectionMap = {
        intro: { name: "Introduction", color: "bg-gray-500" },
        basic: { name: "Basic Flow Rules", color: "bg-blue-500" },
        special: { name: "Special Cards", color: "bg-purple-500" },
        finishing: { name: "Finishing & Strategy", color: "bg-green-500" },
        strategy: { name: "Finishing & Strategy", color: "bg-green-500" },
        conclusion: { name: "Ready to Play", color: "bg-yellow-500" }
      };
      return sectionMap[section] || { name: "Tutorial", color: "bg-gray-500" };
    };
    
    const sectionInfo = getSectionInfo(currentStep.section);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">🎓 Dressage Tutorial</h2>
              <span className={`text-xs px-2 py-1 rounded text-white font-medium ${sectionInfo.color}`}>
                {sectionInfo.name}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Step {tutorialStep + 1} of {tutorialSteps.length}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">{currentStep.title}</h3>
          <p className="text-gray-700 mb-4">{currentStep.content}</p>
          
          {currentStep.example && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Example:</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {currentStep.example.cards.map((card, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`px-3 py-2 rounded border-2 text-sm ${getCardColor(card.type)}`}>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {getProgressionLevelText(card) ? (
                          <span className={`text-xs px-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                            {getProgressionLevelText(card)}
                          </span>
                        ) : (
                          <span className={`text-xs px-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                            {getPrimaryGaitType(card)}
                          </span>
                        )}
                      </div>
                      <div className="font-bold mb-1">{card.name}</div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs">⭐ {card.base}</span>
                        {card.cost > 0 && (
                          <>
                            <span className="text-xs text-red-600">⚡ {card.cost}</span>
                          </>
                        )}
                      </div>
                      {card.bonus && (
                        <div className="text-xs text-green-600">{card.bonus}</div>
                      )}
                    </div>
                    {index < currentStep.example.cards.length - 1 && (
                      <div className="mx-2 text-gray-400">→</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="font-medium text-blue-700">{currentStep.example.flow}</div>
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
              disabled={tutorialStep === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            
            {tutorialStep < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setTutorialStep(tutorialStep + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setShowTutorial(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Start Playing!
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Draw a card
  const drawCard = () => {
    if (deck.length === 0) return null;
    const newCard = deck[0];
    setDeck(prev => prev.slice(1));
    return newCard;
  };

  // Discard a card
  const discardCard = (card) => {
    const newHand = hand.filter(c => c.id !== card.id);
    setHand(newHand);
    
    // Check if we still need to discard more
    if (newHand.length <= maxHandSize) {
      setNeedsDiscard(false);
      
      // Resume turn progression after discard is complete
      // Draw a new card automatically for next turn
      const newCard = drawCard();
      let finalHand = newHand;
      if (newCard) {
        finalHand = [...newHand, newCard];
        setHand(finalHand);
        
        // Check if drawing the new card puts us over limit again
        if (finalHand.length > maxHandSize) {
          setNeedsDiscard(true);
          setMessage(`Drew ${newCard.name}! You have ${finalHand.length} cards - discard down to ${maxHandSize}.`);
          return; // Stay in discard mode
        }
      }
      
      // Increment turn
      const nextTurn = currentTurn + 1;
      setCurrentTurn(nextTurn);
      setTurnPhase('buy');
      
      // Set appropriate message
      if (nextTurn >= maxTurns) {
        setMessage(`Turn ${nextTurn}/${maxTurns} - FINAL TURN! You must finish this turn!`);
      } else if (nextTurn >= maxTurns - 1) {
        setMessage(`Turn ${nextTurn}/${maxTurns} - Judge getting impatient! Consider finishing soon.`);
      } else {
        setMessage(`Turn ${nextTurn}/${maxTurns} - Cards discarded! ${newCard ? `Drew ${newCard.name}.` : ''} Play your next move.`);
      }
    }
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
    if (gameOver || needsDiscard) return;
    
    const actualCost = staminaSurgeActive && card.name !== "Stamina Surge" ? 0 : card.cost;
    if (stamina < actualCost) {
      setMessage("Not enough stamina for this move!");
      return;
    }

    const previousCard = playedCards[playedCards.length - 1];
    const { score, bonusText, newFlowLevel, flowBroke: flowBrokeNow } = calculateScore(card, previousCard);

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
    } else if (card.name === "Steady Rhythm" && newFlowLevel >= 3) {
      newStamina += 1;
    } else if (card.name === "Stamina Surge") {
      newStamina += 3;
      setStaminaSurgeActive(true);
    } else if (card.name === "Tempo Change") {
      // Draw extra card - this doesn't trigger discard, player can go over 4 cards
      const extraCard = drawCard();
      if (extraCard) {
        // Add the card after this function completes
        setTimeout(() => {
          setHand(prev => [...prev, extraCard]);
        }, 100);
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
    const newHand = hand.filter(c => c.id !== card.id);
    setHand(newHand);
    setFlowLevel(newFlowLevel);
    setFlowMeter(prev => flowBrokeNow ? 0 : Math.min(3, newFlowLevel));

    // Clear performance state after animation
    setTimeout(() => {
      setIsPerforming(false);
    }, 3000);

    // Check if player needs to discard after playing card
    if (newHand.length > maxHandSize) {
      setNeedsDiscard(true);
      setMessage(`Played ${card.name}! You have ${newHand.length} cards - discard down to ${maxHandSize}.`);
      return; // Don't proceed to turn end until discard is complete
    }

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
    } else if (deck.length === 0 && newHand.length === 0) {
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

  // Get primary gait type from card tags
  const getPrimaryGaitType = (card) => {
    if (card.tags.includes("Walk")) return "WALK";
    if (card.tags.includes("Trot")) return "TROT"; 
    if (card.tags.includes("Canter")) return "CANTER";
    if (card.tags.includes("Transition")) return "TRANSITION";
    if (card.tags.includes("Finish")) return "FINISH";
    return "SPECIALTY";
  };

  // Get progression level display text
  const getProgressionLevelText = (card) => {
    const level = getGaitLevel(card.name, card.tags);
    if (level === 0) return null;
    
    const gaitType = card.tags.includes("Trot") ? "TROT" : "CANTER";
    return `${gaitType} ${level}`;
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

  // Get type color for labels
  const getTypeColor = (gaitType) => {
    const colors = {
      "WALK": "bg-green-600 text-white",
      "TROT": "bg-blue-600 text-white", 
      "CANTER": "bg-purple-600 text-white",
      "TRANSITION": "bg-yellow-600 text-white",
      "SPECIALTY": "bg-orange-600 text-white",
      "FINISH": "bg-red-600 text-white"
    };
    return colors[gaitType] || "bg-gray-600 text-white";
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
        flowLength={flowLevel}
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
      comboLength={flowLevel}
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

        {/* Compact Routine Summary */}
        <RoutineSummary />

        {/* Buy Cards */}
        {turnPhase === 'buy' && deck.length > 0 && (
          <div className="text-center">
            <button
              onClick={buyCard}
              disabled={stamina < 1 || needsDiscard}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 mx-auto ${
                stamina >= 1 && !needsDiscard
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Your Hand ({hand.length} cards)</h2>
            {needsDiscard && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Must discard to {maxHandSize} cards
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hand.map(card => (
              <div 
                key={card.id}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
                  needsDiscard ? 'border-red-400 bg-red-50 hover:bg-red-100' : getCardColor(card.type)
                }`}
                onClick={() => needsDiscard ? discardCard(card) : playCard(card)}
                title={needsDiscard ? "Click to discard this card" : `Play ${card.name}`}
              >
                {/* Type Label with Progression Level */}
                <div className="flex items-center justify-between mb-2">
                  {getProgressionLevelText(card) ? (
                    <span className={`text-xs px-2 py-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                      {getProgressionLevelText(card)}
                    </span>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                      {getPrimaryGaitType(card)}
                    </span>
                  )}
                  
                  {/* Discard Indicator */}
                  {needsDiscard && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      DISCARD
                    </div>
                  )}
                </div>
                
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
                  {card.flow && <div>{card.flow}</div>}
                  {card.bonus && <div className="text-green-600">{card.bonus}</div>}
                </div>
                
                {/* Enhanced Flow Indicator - only show when not discarding */}
                {!needsDiscard && <FlowIndicator card={card} />}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => {
              setShowTutorial(true);
              setTutorialStep(0);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            🎓 Tutorial
          </button>
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

        {/* Tutorial Modal */}
        {showTutorial && <DressageTutorial />}
      </div>
    </DressageArena>
  );
};

export default FullArenaGame;