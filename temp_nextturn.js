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
