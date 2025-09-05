        )}
        {flowInfo.flowLevel >= 3 && (
          <div className="text-purple-600 text-xs">Flow level {flowInfo.flowLevel} (+50%)</div>
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
              <span className="text-xs font-bold">+{card.earnedScore}</span>
              
              {/* Hover tooltip */}
              {hoveredCard === index && (
                <div className="absolute z-10 bottom-full left-0 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
                  {card.name} - {card.earnedScore} points
                  {card.earnedScore > card.base && <div className="text-green-300">Bonus: +{card.earnedScore - card.base}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-400">Press cards for details</div>
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

  // Discard a card - ONLY handles discarding
  const discardCard = (card) => {
    const newHand = hand.filter(c => c.instanceId !== card.instanceId);
    setHand(newHand);
    
    // Check if we still need to discard more
    if (newHand.length <= maxHandSize) {
      setNeedsDiscard(false);
