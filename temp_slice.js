      setNeedsDiscard(false);
      setMessage(`Cards discarded! Starting next turn...`);
      
      // Now that discard is complete, proceed with turn progression
      setTimeout(() => {
        startNextTurn('Cards discarded!');
      }, 1000);
    } else {
      setMessage(`Discard ${newHand.length - maxHandSize} more card${newHand.length - maxHandSize !== 1 ? 's' : ''}.`);
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

  // Handle Calculated Risk choice
  const handleCalculatedRiskChoice = (safe) => {
    const card = pendingCardPlay;
    setShowCalculatedRiskChoice(false);
    setPendingCardPlay(null);
    
    // Execute the card with the chosen risk level
    executeCardPlay(card, safe ? 'safe' : 'risky');
  };

  // Play a card with arena integration
  const playCard = (card) => {
    if (gameOver || needsDiscard || isPerforming) return; // Prevent clicks during animation
    
    // Special case for Calculated Risk - show choice modal
    if (card.name === "Calculated Risk") {
      setPendingCardPlay(card);
      setShowCalculatedRiskChoice(true);
      return;
    }
    
    executeCardPlay(card);
  };

  // Execute card play (separated to handle Calculated Risk choices)
  const executeCardPlay = (card, riskChoice = null) => {
    if (gameOver || needsDiscard || isPerforming) return; // Prevent clicks during animation
    
    // Calculate actual cost with special cases
    let actualCost = card.cost;
    if (staminaSurgeActive && card.name !== "Stamina Surge") {
      actualCost = 0;
    } else if (card.name === "From the Ashes" && lastFlowBreakTurn === currentTurn - 1) {
      actualCost = 0; // Free if flow was broken last turn
    }
    if (stamina < actualCost) {
      setMessage("Not enough stamina for this move!");
      return;
    }

    // Handle Wild Card type determination
    let wildCardMessage = '';
    if (card.tags?.includes("Wild")) {
      const wildTypes = ["Walk", "Trot", "Canter"];
      const randomType = wildTypes[Math.floor(Math.random() * wildTypes.length)];
      setWildCardResults(prev => ({ ...prev, [card.id]: randomType }));
      wildCardMessage = `Wild Card became: ${randomType}! `;
    }

    const previousCard = playedCards[playedCards.length - 1];
    
    // Handle Calculated Risk special scoring
    let calculatedRiskBonus = 0;
    let calculatedRiskText = '';
    if (card.name === "Calculated Risk" && riskChoice) {
      if (riskChoice === 'safe') {
        calculatedRiskBonus = 2;
        calculatedRiskText = 'Safe choice +2! ';
      } else if (riskChoice === 'risky') {
        const riskySuccess = Math.random() < 0.5; // 50% chance
        if (riskySuccess) {
          calculatedRiskBonus = 4;
          calculatedRiskText = 'Risky success +4! ';
        } else {
          calculatedRiskBonus = 0;
          calculatedRiskText = 'Risky failure - flow broken! ';
          // Force flow break for failed risky choice
        }
      }
    }
    
    const { score, bonusText, newFlowLevel, flowBroke: flowBrokeNow } = calculateScore(card, previousCard, wildCardResults);
    
    // Apply Calculated Risk modifications
    let finalScore = score + calculatedRiskBonus;
    let finalBonusText = bonusText + calculatedRiskText;
    let finalFlowBroke = flowBrokeNow;
    let finalFlowLevel = newFlowLevel;
    
    // Force flow break for failed risky Calculated Risk
    if (card.name === "Calculated Risk" && riskChoice === 'risky' && calculatedRiskBonus === 0) {
      finalFlowBroke = true;
      finalFlowLevel = 0;
    }

    // Set arena state for animations
    setIsPerforming(true);
    setLastPlayedCard({ ...card, earnedScore: finalScore });
    setFlowBroke(finalFlowBroke);
    
    // Update game state
    let newStamina = stamina - actualCost;
    
    // Handle special card effects
    if (card.name === "Free Walk on Long Rein" || card.name === "Simple Change") {
      newStamina += 1;
    } else if (card.name === "Stretching Circle" && !stretchingCircleUsed) {
      newStamina += 2;
      setStretchingCircleUsed(true);
    } else if (card.name === "Steady Rhythm" && finalFlowLevel >= 3) {
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
    
    // FREESTYLE CARD SPECIAL EFFECTS
    else if (card.name === "Artistic Rebellion") {
      // Draw cards equal to flow level lost
      const cardsToDraw = flowLevel;
      for (let i = 0; i < cardsToDraw && deck.length > 0; i++) {
        const extraCard = drawCard();
        if (extraCard) {
          setTimeout(() => {
            setHand(prev => [...prev, extraCard]);
          }, 100 * (i + 1));
        }
      }
    } else if (card.name === "Bold Improvisation") {
      // Next card gets bonus points equal to flow level lost (max +3)
      setNextCardBonus(Math.min(flowLevel, 3));
    } else if (card.name === "Creative Explosion") {
      // Gain +2 stamina
      newStamina += 2;
    } else if (card.name === "From the Ashes" && lastFlowBreakTurn === currentTurn - 1) {
      // Cost already handled in cost calculation - no additional effect needed
    } else if (card.name === "High Wire Act") {
      if (!flowBrokeNow) {
        // If this maintains flow: Draw 2 cards
        for (let i = 0; i < 2 && deck.length > 0; i++) {
          const extraCard = drawCard();
          if (extraCard) {
            setTimeout(() => {
              setHand(prev => [...prev, extraCard]);
            }, 100 * (i + 1));
          }
        }
      }
      // If this breaks flow: +5 points (handled in combo bonus)
    }
    
    // HYBRID CARD SPECIAL EFFECTS
    else if (card.name === "Strategic Pause") {
      // Draw 2, discard 1 (if flow ≥3, keep both)
      const cardsToDraw = flowLevel >= 3 ? 2 : 1; // If flow ≥3, we keep both so draw 2 without discarding
      for (let i = 0; i < 2 && deck.length > 0; i++) {
        const extraCard = drawCard();
        if (extraCard) {
          setTimeout(() => {
            setHand(prev => [...prev, extraCard]);
          }, 100 * (i + 1));
        }
      }
      // If flow < 3, player will need to discard 1 card after drawing 2
      if (flowLevel < 3) {
        setTimeout(() => {
          setNeedsDiscard(true);
          setMessage(`Strategic Pause: Choose 1 card to discard.`);
