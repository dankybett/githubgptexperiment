          setMessage(`Strategic Pause: Choose 1 card to discard.`);
        }, 300);
      }
    } else if (card.name === "Second Chance" && flowBreakCount > 0) {
      // Draw 3 cards if flow broken this game
      for (let i = 0; i < 3 && deck.length > 0; i++) {
        const extraCard = drawCard();
        if (extraCard) {
          setTimeout(() => {
            setHand(prev => [...prev, extraCard]);
          }, 100 * (i + 1));
        }
      }
    } else if (card.name === "Rhythmic Recovery" && lastFlowBreakTurn === currentTurn - 1) {
      // +2 stamina (points already handled in combo bonus)
      newStamina += 2;
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

    // Track card types for Freestyle deck
    const newCardTypes = new Set(cardTypesUsed);
    newCardTypes.add(card.type);
    setCardTypesUsed(newCardTypes);

    // Handle flow breaking tracking
    if (finalFlowBroke) {
      setFlowBreakCount(prev => prev + 1);
      setLastFlowBreakTurn(currentTurn);
    }

    // Clear next card bonus after use
    if (nextCardBonus > 0) {
      setNextCardBonus(0);
    }
    
    // Update state - use functional updates to prevent race conditions
    const newHand = hand.filter(c => c.instanceId !== card.instanceId);
    setHand(newHand);  // Remove from hand FIRST
    setStamina(Math.max(0, newStamina));
    setTotalScore(prev => prev + finalScore);
    setPlayedCards(prev => [...prev, { ...card, earnedScore: finalScore }]);
    setFlowLevel(finalFlowLevel);
    setFlowMeter(prev => finalFlowBroke ? 0 : finalFlowLevel);
    
    console.log(`Played ${card.name} (${card.instanceId?.toString().slice(2,8)}), hand size: ${newHand.length}, routine length: ${playedCards.length + 1}`);

    // Update game log for judges
    setGameLog(prevLog => ({
      ...prevLog,
      turns: [...prevLog.turns, {
        turnNumber: currentTurn,
        card: { ...card, earnedScore: finalScore },
        preFlowLevel: flowLevel,
        postFlowLevel: finalFlowLevel,
        flowBroke: finalFlowBroke,
        earnedScore: finalScore,
        stamina: newStamina
      }],
      extraDrawsTotal: prevLog.extraDrawsTotal + (card.name === "Tempo Change" || card.name === "Artistic Rebellion" ? 1 : 0),
      finalStamina: newStamina
    }));

    // Clear performance state after animation
    setTimeout(() => {
      setIsPerforming(false);
    }, 3000);

    // Handle game end conditions first
    if (card.tags.includes("Finish")) {
      setGameOver(true);
      setGameState('finished');
      const finalTotalScore = totalScore + finalScore;
      
      // Calculate final judge scores
      const finalGameLog = {
        ...gameLog,
        turns: [...gameLog.turns, {
          turnNumber: currentTurn,
          card: { ...card, earnedScore: finalScore },
          preFlowLevel: flowLevel,
          postFlowLevel: finalFlowLevel,
          flowBroke: finalFlowBroke,
          earnedScore: finalScore,
          stamina: newStamina
        }],
        finalStamina: newStamina
      };
      
      const judgesWithScores = judgeSystem.calculateJudgeModifiers(selectedJudges, finalGameLog);
      const finalJudgeScores = judgeSystem.calculateFinalScores(finalTotalScore, judgesWithScores);
      const averageScore = judgeSystem.getAverageFinalScore(finalJudgeScores);
      setJudgeScores(finalJudgeScores);
      
      let rating = "Novice";
      if (averageScore >= 35) rating = "Master";
      else if (averageScore >= 25) rating = "Advanced";
      else if (averageScore >= 18) rating = "Intermediate";
      
      const turnBonus = currentTurn <= 6 ? " Efficient timing bonus!" : currentTurn <= 7 ? " Good timing!" : "";
      setMessage(`Routine complete!${turnBonus} Average judge score: ${averageScore} - ${rating} level!`);
      return;
    } else if (currentTurn >= maxTurns) {
      // Final turn passed without finishing
      setGameOver(true);
      setGameState('finished');
      setMessage(`Time's up! Final score: ${Math.max(0, totalScore + finalScore)}`);
      return;
    }

    // Check if player needs to discard after playing card
    if (newHand.length > maxHandSize) {
      setNeedsDiscard(true);
      setMessage(`Played ${card.name}! You have ${newHand.length} cards - discard down to ${maxHandSize}.`);
      return; // Don't proceed to turn end until discard is complete
    } else if (deck.length === 0 && newHand.length === 0) {
      // Game ends if no more cards
      setGameOver(true);
      setGameState('finished');
      setMessage(`All cards played! Final score: ${totalScore + finalScore}`);
    } else {
      // Continue to next turn
      startNextTurn(wildCardMessage + finalBonusText);
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
    // Check if this is a Wild Card with a determined result
    if (card.tags?.includes("Wild") && wildCardResults[card.id]) {
      return wildCardResults[card.id].toUpperCase();
    }
    
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
      finish: 'bg-red-100 border-red-400',
      freestyle: 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400',
      hybrid: 'bg-gradient-to-br from-blue-100 to-green-100 border-teal-400'
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
    const averageScore = judgeScores.length > 0 ? judgeSystem.getAverageFinalScore(judgeScores) : totalScore;
    let rating = "Novice";
    if (averageScore >= 35) rating = "Master";
    else if (averageScore >= 25) rating = "Advanced";
    else if (averageScore >= 18) rating = "Intermediate";

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
        <div className="bg-white rounded-lg p-6 shadow-lg text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-4xl font-bold mb-2">Routine Complete!</h1>
          
          {judgeScores.length > 0 ? (
            <div>
              <div className="text-lg mb-3">Judge Scores:</div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {judgeScores.map((score, index) => (
                  <div key={index} className="bg-gray-50 rounded p-2">
                    <div className="text-sm font-semibold">{score.emoji} {score.judgeName.split(' ')[1]}</div>
                    <div className="text-lg font-bold text-blue-600">{score.finalScore}</div>
                    <div className="text-xs text-gray-600">
                      {score.coreScore} + {score.judgeModifier >= 0 ? '+' : ''}{score.judgeModifier}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-2xl mb-4">Average Score: <span className="font-bold text-blue-600">{averageScore}</span></div>
            </div>
          ) : (
            <div className="text-2xl mb-4">Final Score: <span className="font-bold text-blue-600">{totalScore}</span></div>
          )}
          
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
