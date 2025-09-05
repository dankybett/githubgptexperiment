    else if (card.name === "Flow Gambit" && flowLevel >= 3) {
      comboBonus = flowLevel;
      comboText = `Flow gambit +${flowLevel}! `;
    }
    else if (card.name === "Perfect Balance") {
      // Check if both classic and freestyle cards played
      const hasClassic = cardTypesUsed.has('walk') || cardTypesUsed.has('trot') || cardTypesUsed.has('canter') || cardTypesUsed.has('transition');
      const hasFreestyle = cardTypesUsed.has('freestyle');
      if (hasClassic && hasFreestyle) {
        comboText = `Perfect balance - free play! `;
      }
    }
    else if (card.name === "Calculated Risk") {
      // This will be handled by the choice modal - placeholder for now
      // The actual bonus will be set when the choice is made
    }
    else if (card.name === "Rhythmic Recovery" && lastFlowBreakTurn === currentTurn - 1) {
      comboBonus = 2;
      comboText = `Rhythmic recovery +2! `;
    }
    else if (card.name === "Balanced Finale") {
      // Check if both maintained flow ≥3 and broke flow at least once
      const hasHighFlow = playedCards.some((_, index) => {
        // Calculate flow for each played card to see if we ever reached 3+
        let tempFlow = 0;
        for (let i = 0; i <= index; i++) {
          const currentCard = playedCards[i];
          const prevCard = i > 0 ? playedCards[i - 1] : null;
          const { newFlowLevel } = calculateFlowLevel(currentCard, prevCard, wildCardResults);
          tempFlow = newFlowLevel;
          if (tempFlow >= 3) return true;
        }
        return false;
      });
      if (hasHighFlow && flowBreakCount > 0) {
        comboBonus = 3;
        comboText = `Balanced finale +3! `;
      }
    }

    // Add next card bonus if active
    if (nextCardBonus > 0) {
      comboBonus += nextCardBonus;
      comboText += `Next card bonus +${nextCardBonus}! `;
    }

    return { comboBonus, comboText };
  };

  // Calculate flow level - simplified rules for strategic decision-making
  const calculateFlowLevel = (card, previousCard, wildCardResults = {}) => {
    // Handle Wild Card - replace its tags with the determined type
    let effectiveCard = card;
    let effectivePreviousCard = previousCard;
    
    if (card.tags?.includes("Wild") && wildCardResults[card.id]) {
      effectiveCard = { ...card, tags: [wildCardResults[card.id]] };
    }
    
    if (previousCard?.tags?.includes("Wild") && wildCardResults[previousCard.id]) {
      effectivePreviousCard = { ...previousCard, tags: [wildCardResults[previousCard.id]] };
    }

    let newFlowLevel = flowLevel;
    let flowBrokeNow = false;
    let flowText = '';

    if (!effectivePreviousCard) {
      // First card - start flow at level 1
      newFlowLevel = 1;
      flowText = 'Flow started! ';
    } else if (effectiveCard.tags.includes("Finish")) {
      // Finish cards don't break flow
      flowText = 'Routine concluded! ';
    } else if (effectiveCard.tags.includes("Transition")) {
      // Transitions always maintain flow (universal connectors)
      newFlowLevel = flowLevel + 1;
      flowText = `Transition flow +${newFlowLevel}! `;
    } else if (effectiveCard.tags.includes("Walk")) {
      // Walks maintain flow only after Walk/Transition/Canter
      if (effectivePreviousCard.tags.includes("Walk") || 
          effectivePreviousCard.tags.includes("Transition") || 
          effectivePreviousCard.tags.includes("Canter")) {
        newFlowLevel = flowLevel + 1;
        if (effectivePreviousCard.tags.includes("Walk")) {
          flowText = `Walk sequence +${newFlowLevel}! `;
        } else if (effectivePreviousCard.tags.includes("Canter")) {
          flowText = `Canter→Walk flow +${newFlowLevel}! `;
        } else {
          flowText = `After transition +${newFlowLevel}! `;
        }
