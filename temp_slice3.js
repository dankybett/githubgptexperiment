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
      onBack={onBack}
      onShowTutorial={() => {
        setShowTutorial(true);
        setTutorialStep(0);
      }}
      selectedJudges={selectedJudges}
      onJudgeClick={(judge) => {
        // Find the corresponding system judge and show its details
        setShowJudgePanel(true);
      }}
    >
      {/* Game Content */}
      <div className="space-y-4">
        {/* Message */}
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded-lg text-center">
            {message}
          </div>
        )}

        {/* Score Header */}
        <div className="flex justify-center gap-8 text-sm bg-white rounded-lg p-4 shadow-lg mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold">Score: {totalScore}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="font-bold">Stamina: {stamina}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Flow:</div>
            <div className="flex gap-1">
              {[...Array(Math.max(7, flowMeter))].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full ${
                    i < flowMeter ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Compact Routine Summary */}
        <RoutineSummary />


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
                  <span className={`text-xs px-2 py-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                    {getPrimaryGaitType(card)}
                  </span>
                  
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
                  {card.flow && <div>{card.tags?.includes("Wild") ? "? (Random: Walk/Trot/Canter)" : card.flow}</div>}
                  {card.bonus && <div className="text-green-600">{card.bonus}</div>}
                </div>
                
                {/* Enhanced Flow Indicator - only show when not discarding */}
                {!needsDiscard && <FlowIndicator card={card} />}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 flex-wrap">
          {/* Draw Card Button */}
          {turnPhase === 'buy' && deck.length > 0 && (
            <button
              onClick={buyCard}
              disabled={stamina < 1 || needsDiscard}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                stamina >= 1 && !needsDiscard
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              Draw Card (1 Stamina)
            </button>
          )}
          
          {/* Deck Selector Button */}
          <button
            onClick={() => setShowDeckSelector(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            {deckLibrary[selectedDeck].name}
          </button>
          
          {/* View Deck Button */}
          <button
            onClick={() => setShowDeckViewer(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Deck
          </button>
          
          {/* View Judges Button */}
          <button
            onClick={() => setShowJudgePanel(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Judges Panel
          </button>
        </div>

        {/* Tutorial Modal */}
        {showTutorial && <DressageTutorial />}
        
        {/* Calculated Risk Choice Modal */}
        {showCalculatedRiskChoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold mb-2">Calculated Risk</h2>
                <p className="text-gray-700 mb-4">Choose your approach:</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleCalculatedRiskChoice(true)}
                  className="w-full p-4 bg-green-100 border border-green-400 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <div className="font-bold text-green-800">Safe Choice</div>
                  <div className="text-sm text-green-700">Guaranteed +2 points</div>
                </button>
                
                <button
                  onClick={() => handleCalculatedRiskChoice(false)}
                  className="w-full p-4 bg-red-100 border border-red-400 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <div className="font-bold text-red-800">Risky Choice</div>
                  <div className="text-sm text-red-700">50% chance: +4 points OR break flow</div>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Deck Selector Modal */}
        {showDeckSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Select Deck</h2>
                <button 
                  onClick={() => setShowDeckSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(deckLibrary).map(([key, deckInfo]) => (
                  <div 
                    key={key}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDeck === key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedDeck(key);
                      setShowDeckSelector(false);
                      // Game will restart automatically via useEffect
                    }}
                  >
                    <div className="font-bold">{deckInfo.name}</div>
                    <div className="text-sm text-gray-600">{deckInfo.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {deckInfo.cards.length} cards
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Deck Viewer Modal */}
        {showDeckViewer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {deckLibrary[selectedDeck].name} - {getCurrentDeck().length} Cards
                </h2>
                <button 
                  onClick={() => setShowDeckViewer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* Group cards by type */}
              {['walk', 'trot', 'canter', 'transition', 'specialty', 'power', 'freestyle', 'hybrid', 'finish'].map(cardType => {
                const typeCards = getCurrentDeck().filter(card => card.type === cardType);
                if (typeCards.length === 0) return null;
                
                return (
                  <div key={cardType} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 capitalize">
                      {cardType} Cards ({typeCards.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {typeCards.map(card => (
                        <div 
                          key={card.id}
                          className={`p-3 rounded-lg border-2 ${getCardColor(card.type)}`}
                        >
                          {/* Type Label */}
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs px-2 py-1 rounded font-bold ${getTypeColor(getPrimaryGaitType(card))}`}>
                              {getPrimaryGaitType(card)}
                            </span>
                            {card.cost > 0 && (
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-red-600" />
                                <span className="text-xs text-red-600">{card.cost}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="font-bold text-sm mb-1">{card.name}</div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-3 h-3" />
                            <span className="text-sm font-semibold">{card.base}</span>
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            {card.flow && <div className="text-blue-600">{card.tags?.includes("Wild") ? "? (Random: Walk/Trot/Canter)" : card.flow}</div>}
                            {card.bonus && <div className="text-green-600">{card.bonus}</div>}
                            {card.risk && <div className="text-red-600">{card.risk}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Judges Panel Modal */}
        {showJudgePanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🏆 Competition Judges</h2>
                <button 
                  onClick={() => setShowJudgePanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {selectedJudges.map((judge, index) => (
                  <div key={judge.id} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-1">{judge.emoji}</div>
                      <div className="font-bold text-lg">{judge.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{judge.description}</div>
                    </div>
                    
                    {/* Judge Requirements */}
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="font-semibold text-sm mb-2">Scoring Criteria:</h4>
                      <div className="text-xs space-y-1">
                        {Object.entries(judge.modifiers).map(([key, modifier]) => (
                          <div key={key} className={`${modifier.value > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {modifier.description}
                          </div>
                        ))}
                      </div>
                      
                      {/* Special case for Gait Specialist */}
                      {judge.id === 'gaitSpecialist' && judge.declaredGait && (
                        <div className="mt-2 p-2 bg-blue-100 rounded">
                          <div className="font-semibold text-sm text-blue-800">
                            Specialty: {judge.declaredGait} moves
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Cap: +{judge.cap.positive}{judge.cap.negative < 0 ? ` / ${judge.cap.negative}` : ''}
                      </div>
                    </div>
                    
                    {/* Current Progress (if game in progress) */}
                    {gameLog.turns.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded">
                        <h5 className="font-semibold text-sm text-blue-800 mb-1">Current Progress:</h5>
                        <div className="text-xs text-blue-700">
                          {Object.entries(judge.triggerCounts || {}).map(([key, count]) => (
                            count > 0 && <div key={key}>{key}: {count}</div>
                          ))}
                          <div className="font-semibold mt-1">
                            Modifier: {judge.currentModifier >= 0 ? '+' : ''}{judge.currentModifier || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Final Scores (if game finished) */}
              {judgeScores.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-bold mb-3">📊 Final Judge Scores</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {judgeScores.map((score, index) => (
                      <div key={index} className="bg-gray-50 rounded p-3 text-center">
                        <div className="font-semibold">{score.emoji} {score.judgeName}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          Core: {score.coreScore} + Modifier: {score.judgeModifier >= 0 ? '+' : ''}{score.judgeModifier}
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {score.finalScore}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-lg font-bold">
                    Average Score: {judgeSystem.getAverageFinalScore(judgeScores)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DressageArena>
  );
};

export default FullArenaGame;
