    setCardTypesUsed(new Set());
    setNextCardBonus(0);
    setTurnPhase('buy');
    
    // Initialize judges
    const judges = judgeSystem.selectJudges();
    setSelectedJudges(judges);
    setGameLog({ turns: [], extraDrawsTotal: 0, finalStamina: 0, hadStaminaLock: false });
    setJudgeScores([]);
    
    // Set judge-aware message
    const judgeNames = judges.map(j => `${j.emoji} ${j.name}`).join(', ');
    setMessage(`Turn 1/8 - Judges selected: ${judgeNames}. Your turn!`);
    setGameState('playing');
  };

  // Initialize game on mount and when deck changes
  useEffect(() => {
    startGame();
  }, [selectedDeck]);

  // Calculate specific card combo bonuses (immediate point bonuses)
  const calculateComboBonus = (card, previousCard, wildCardResults = {}) => {
    let comboBonus = 0;
    let comboText = '';

    if (!previousCard) return { comboBonus: 0, comboText: '' };

    // Specific card combinations give fixed bonus points
    if (card.name === "Extended Trot" && previousCard?.tags.includes("Walk")) {
      comboBonus = 2;
      comboText = "Walk→Trot combo +2! ";
    }
    else if (card.name === "Flying Change" && previousCard?.tags.includes("Canter")) {
      comboBonus = 2;
      comboText = "Canter combo +2! ";
    }
    else if (card.name === "Collected Walk" && previousCard?.tags.includes("Transition")) {
      comboBonus = 1;
      comboText = "Transition combo +1! ";
    }
    else if (card.name === "Medium Walk" && previousCard?.tags.includes("Walk")) {
      comboBonus = 2;
      comboText = "Walk chain +2! ";
    }
    else if (card.name === "Collected Trot" && previousCard?.tags.includes("Transition")) {
      comboBonus = 2;
      comboText = "Transition combo +2! ";
    }
    else if (card.name === "Collected Canter" && previousCard?.tags.includes("Transition")) {
      comboBonus = 2;
      comboText = "Transition combo +2! ";
    }
    else if (card.name === "Piaffe" && previousCard?.name === "Collected Trot") {
      comboBonus = 2;
      comboText = "Classical sequence +2! ";
    }
    else if (card.name === "Pirouette" && previousCard?.name === "Collected Canter") {
      comboBonus = 2;
      comboText = "Classical sequence +2! ";
    }
    else if (card.name === "Canter Pirouette" && previousCard?.tags.includes("Transition")) {
      comboBonus = 3;
      comboText = "Transition mastery +3! ";
    }
    else if (card.name === "Rein Back" && previousCard?.tags.includes("Walk")) {
      comboBonus = 1;
      comboText = "Walk combo +1! ";
    }
    else if (card.name === "Shoulder-In" && previousCard?.tags.includes("Trot")) {
      comboBonus = 1;
      comboText = "Trot chain +1! ";
    }
    else if (card.name === "Passage" && previousCard?.name === "Piaffe") {
      comboBonus = 2;
      comboText = "Classical sequence +2! ";
    }
    else if (card.name === "Bold Extension") {
      comboBonus = cantersPlayed;
      comboText = `Canter mastery +${cantersPlayed}! `;
    }
    else if (card.name === "Perfect Harmony") {
      comboBonus = gaitTypesUsed.size * 2;
      comboText = `Perfect harmony +${comboBonus}! `;
    }
    else if (card.name === "Training Level Test") {
      comboBonus = gaitTypesUsed.size;
      comboText = `Variety bonus +${comboBonus}! `;
    }
    // FREESTYLE DECK CARDS
    else if (card.name === "Spontaneous Leap") {
      comboBonus = Math.min(flowLevel * 2, 6);
      comboText = `Flow sacrifice +${comboBonus}! `;
    }
    else if (card.name === "Phoenix Rising" && lastFlowBreakTurn === currentTurn - 1) {
      comboBonus = 3;
      comboText = `Rising from ashes +${comboBonus}! `;
    }
    else if (card.name === "From the Ashes" && lastFlowBreakTurn === currentTurn - 1) {
      // This card's cost reduction is handled in playCard function
      comboText = `Ash bonus - free play! `;
    }
    else if (card.name === "Improvised Grace") {
      const turnsSinceBreak = lastFlowBreakTurn >= 0 ? Math.min(4, currentTurn - lastFlowBreakTurn - 1) : 0;
      comboBonus = turnsSinceBreak;
      comboText = `Improvisation +${comboBonus}! `;
    }
    else if (card.name === "All or Nothing") {
      if (flowLevel >= 5) {
        comboBonus = 6;
        comboText = `All or nothing +${comboBonus}! `;
      }
    }
    else if (card.name === "Unpredictable") {
      comboBonus = cardTypesUsed.size;
      comboText = `Unpredictable +${comboBonus}! `;
    }
    else if (card.name === "Freestyle Finale") {
      comboBonus = flowBreakCount;
      comboText = `Freestyle finale +${comboBonus}! `;
    }
    else if (card.name === "High Wire Act") {
      // Check if this will break flow (we need to calculate flow here)
      const { flowBroke } = calculateFlowLevel(card, previousCard, wildCardResults);
      if (flowBroke) {
        comboBonus = 5;
        comboText = `High wire risk +${comboBonus}! `;
      }
    }
    // HYBRID DECK CARDS
    else if (card.name === "Flow Gambit" && flowLevel >= 3) {
