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
      newFlowLevel += 1;
      bonusText += `Flow +${newFlowLevel}! `;
    } else if (previousCard && !card.tags.includes("Finish")) {
      const naturalFlow = (
        (previousCard.tags.includes("Walk") && card.tags.includes("Trot")) ||
        (previousCard.tags.includes("Trot") && card.tags.includes("Canter")) ||
        card.tags.includes("Walk")
      );
      
      if (!naturalFlow) {
        flowBrokeNow = true;
        bonusText += "Flow broken... ";
        newFlowLevel = 0;
      } else {
        newFlowLevel = Math.max(1, newFlowLevel);
      }
    } else {
      newFlowLevel = Math.max(1, newFlowLevel);
    }

    // Flow multiplier bonus
    if (newFlowLevel >= 3) {
      flowBonus = Math.floor(score * 0.5);
      score += flowBonus;
      bonusText += `Flow mastery +${flowBonus}! `;
    }

    return { score, bonusText, newFlowLevel, flowBroke: flowBrokeNow };
  };

  // Enhanced flow analysis function
  const analyzeFlow = (card) => {
    if (playedCards.length === 0) {
      return {
        maintains: true,
        type: 'start',
        comboBonus: 0,
        flowMultiplier: 1,
        newFlowLevel: 1,
        reason: 'Starting move'
      };
    }

    const previousCard = playedCards[playedCards.length - 1];
    const { score, bonusText, newFlowLevel, flowBroke } = calculateScore(card, previousCard);
    const comboBonus = score - card.base;
    const flowMultiplier = newFlowLevel >= 3 ? 1.5 : 1;
    
    // Always maintains flow
    if (card.tags.includes("Transition") || card.tags.includes("Walk") || card.tags.includes("Finish")) {
      return {
        maintains: true,
        type: card.tags.includes("Transition") ? 'transition' : card.tags.includes("Walk") ? 'graceful' : 'finish',
        comboBonus,
        flowMultiplier,
        newFlowLevel,
        reason: card.tags.includes("Transition") ? 'Universal connector' : card.tags.includes("Walk") ? 'Always graceful' : 'Routine finish'
      };
    }
    
    // Natural progressions
    if (previousCard.tags.includes("Walk") && card.tags.includes("Trot")) {
      return {
        maintains: true,
        type: 'natural',
        comboBonus,
        flowMultiplier,
        newFlowLevel,
        reason: 'Walk → Trot progression'
      };
    }
    if (previousCard.tags.includes("Trot") && card.tags.includes("Canter")) {
      return {
        maintains: true,
        type: 'natural',
        comboBonus,
        flowMultiplier,
        newFlowLevel,
        reason: 'Trot → Canter progression'
      };
    }
    if (previousCard.tags.includes("Transition")) {
      return {
        maintains: true,
        type: 'connected',
        comboBonus,
        flowMultiplier,
        newFlowLevel,
        reason: 'After transition'
      };
    }
    
    // Specific combos
    const specificCombos = {
      "Extended Trot": previousCard.tags.includes("Walk") && 'Walk → Trot combo',
      "Flying Change": previousCard.tags.includes("Canter") && 'Canter combo',
    };
    
    if (specificCombos[card.name]) {
      return {
        maintains: true,
        type: 'combo',
        comboBonus,
        flowMultiplier,
        newFlowLevel,
        reason: specificCombos[card.name]
      };
    }
    
    // Flow breaks
    return {
      maintains: !flowBroke,
      type: 'break',
      comboBonus: flowBroke ? 0 : comboBonus,
      flowMultiplier: 1,
      newFlowLevel: flowBroke ? 0 : newFlowLevel,
      reason: flowBroke ? 'Breaks flow pattern' : 'Maintains flow',
      penalty: flowBroke ? flowLevel : 0
    };
  };

  // Enhanced Flow Indicator Component
  const FlowIndicator = ({ card }) => {
    const flowInfo = analyzeFlow(card);
    
    // Handle first card case
    if (playedCards.length === 0) {
      return (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="text-blue-700 font-medium flex items-center gap-1">
            <span>🎯</span>
            <span>Opening Move</span>
          </div>
          <div className="text-gray-700 font-medium text-xs mt-1">
            Score: {card.base} points
          </div>
          <div className="text-gray-600 text-xs">Starts your routine</div>
        </div>
      );
    }
    
    if (!flowInfo.maintains) {
      return (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <div className="text-red-700 font-medium flex items-center gap-1">
            <span>✗</span>
            <span>Breaks Flow</span>
          </div>
          <div className="text-red-600 text-xs mt-1">
            Loses flow level {flowInfo.penalty}
          </div>
          <div className="text-gray-600 text-xs">{flowInfo.reason}</div>
          <div className="text-gray-700 font-medium text-xs mt-1">
            Score: {card.base} points (no bonuses)
          </div>
        </div>
      );
    }

    const totalScore = card.base + flowInfo.comboBonus + (flowInfo.flowMultiplier > 1 ? Math.floor(card.base * 0.5) : 0);
    
    return (
      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
        <div className="text-green-700 font-medium flex items-center gap-1">
          <span>✓</span>
          <span>Maintains Flow</span>
        </div>
        {flowInfo.comboBonus > 0 && (
          <div className="text-blue-600 text-xs">
            Combo bonus: +{flowInfo.comboBonus}
          </div>
        )}
        {flowInfo.flowMultiplier > 1 && (
          <div className="text-purple-600 text-xs font-medium">
            🌟 Flow bonus: +{Math.floor(card.base * 0.5)}
          </div>
        )}
        <div className="text-gray-700 font-medium text-xs mt-1">
          Total: {totalScore} points
        </div>
        <div className="text-gray-600 text-xs">{flowInfo.reason}</div>
        <div className="text-gray-600 text-xs">Flow: {flowLevel} → {flowInfo.newFlowLevel}</div>
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
              <span className={`text-xs px-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                {getPrimaryGaitType(card)[0]}
              </span>
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
        content: "Horses naturally progress through gaits: Walk → Trot → Canter. These transitions always maintain flow.",
        example: {
          cards: [
            { name: "Free Walk", tags: ["Walk"], base: 1, type: "walk" },
            { name: "Extended Trot", tags: ["Trot"], base: 2, type: "trot" }
          ],
          flow: "✓ Walk → Trot maintains flow and gets +2 combo bonus!"
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
        content: "You now know: Basic flow, special cards, finishing rules, and strategy! Practice makes perfect. Good luck!",
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
                        <span className={`text-xs px-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                          {getPrimaryGaitType(card)}
                        </span>
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
    setFlowLevel(newFlowLevel);
    setFlowMeter(prev => flowBrokeNow ? 0 : Math.min(3, newFlowLevel));

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

  // Get primary gait type from card tags
  const getPrimaryGaitType = (card) => {
    if (card.tags.includes("Walk")) return "WALK";
    if (card.tags.includes("Trot")) return "TROT"; 
    if (card.tags.includes("Canter")) return "CANTER";
    if (card.tags.includes("Transition")) return "TRANSITION";
    if (card.tags.includes("Finish")) return "FINISH";
    return "SPECIALTY";
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
        comboLength={flowLevel}
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
                {/* Type Label */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                    {getPrimaryGaitType(card)}
                  </span>
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
                  {card.combo && <div>{card.combo}</div>}
                  {card.bonus && <div className="text-green-600">{card.bonus}</div>}
                </div>
                
                {/* Enhanced Flow Indicator */}
                <FlowIndicator card={card} />
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