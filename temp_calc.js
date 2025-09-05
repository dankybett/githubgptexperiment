        }
      } else {
        // Walk after Trot breaks flow
        flowBrokeNow = true;
        flowText = "Flow broken... ";
        newFlowLevel = 0;
      }
    } else if (effectivePreviousCard.tags.includes("Transition")) {
      // Any card after a Transition maintains flow (universal connector)
      newFlowLevel = flowLevel + 1;
      flowText = `After transition +${newFlowLevel}! `;
    } else if (effectivePreviousCard.tags.includes("Walk") && effectiveCard.tags.includes("Trot")) {
      // Natural progression: Walk → Trot
      newFlowLevel = flowLevel + 1;
      flowText = `Walk→Trot flow +${newFlowLevel}! `;
    } else if (effectivePreviousCard.tags.includes("Trot") && effectiveCard.tags.includes("Canter")) {
      // Natural progression: Trot → Canter
      newFlowLevel = flowLevel + 1;
      flowText = `Trot→Canter flow +${newFlowLevel}! `;
    } else if (["Spontaneous Leap", "Artistic Rebellion", "Bold Improvisation", "Creative Explosion", "All or Nothing"].includes(card.name)) {
      // Freestyle cards that intentionally break flow
      flowBrokeNow = true;
      flowText = "Artistic flow break! ";
      newFlowLevel = 0;
    } else if (card.name === "Chaos Control" && lastFlowBreakTurn === currentTurn - 1) {
      // Special case: start new flow at level 2 after recent break
      newFlowLevel = 2;
      flowText = `Chaos controlled +${newFlowLevel}! `;
    } else {
      // All other combinations break flow
      flowBrokeNow = true;
      flowText = "Flow broken... ";
      newFlowLevel = 0;
    }

    return { newFlowLevel, flowBroke: flowBrokeNow, flowText };
  };

  // Main scoring function - combines combo and flow bonuses
  const calculateScore = (card, previousCard, wildCardResults = {}) => {
    let score = card.base;
    let bonusText = '';

    // 1. Calculate combo bonuses (fixed point bonuses)
    const { comboBonus, comboText } = calculateComboBonus(card, previousCard, wildCardResults);
    score += comboBonus;
    bonusText += comboText;

    // 2. Calculate flow level and check if it broke
    const { newFlowLevel, flowBroke: flowBrokeNow, flowText } = calculateFlowLevel(card, previousCard, wildCardResults);
    bonusText += flowText;

    // 3. Flow Master special bonus
    if (card.name === "Flow Master") {
      if (newFlowLevel >= 7) {
        score += 4;
        bonusText += `Flow mastery +4! `;
      } else if (newFlowLevel >= 5) {
        score += 2;
        bonusText += `Flow mastery +2! `;
      }
    }

    // 4. Apply flow multiplier bonus (percentage bonus for high flow)
    if (newFlowLevel >= 3) {
      const flowMultiplierBonus = Math.floor(score * 0.5);
      score += flowMultiplierBonus;
      bonusText += `Flow level +${flowMultiplierBonus}! `;
    }

    return { score, bonusText, newFlowLevel, flowBroke: flowBrokeNow };
  };


  // Simplified flow analysis for UI components
  const analyzeFlow = (card) => {
    if (playedCards.length === 0) {
      return {
        maintains: true,
        reason: 'Opening move',
        totalScore: card.base
      };
    }

    // Special case for Wild Card - unpredictable
    if (card.tags?.includes("Wild")) {
      return {
        maintains: null, // Unknown
        reason: 'Unpredictable',
        totalScore: card.base
      };
    }

    const previousCard = playedCards[playedCards.length - 1];
    const { comboBonus } = calculateComboBonus(card, previousCard, wildCardResults);
    const { newFlowLevel, flowBroke, flowText } = calculateFlowLevel(card, previousCard, wildCardResults);
    
    let totalScore = card.base + comboBonus;
    if (newFlowLevel >= 3) {
      totalScore += Math.floor(totalScore * 0.5); // +50% flow bonus
    }

    return {
      maintains: !flowBroke,
      reason: flowText.trim(),
      totalScore,
      comboBonus,
      flowLevel: newFlowLevel
    };
  };

  // Clean Flow Indicator Component
  const FlowIndicator = ({ card }) => {
    const flowInfo = analyzeFlow(card);
    
    // Handle first card case
    if (playedCards.length === 0) {
      return (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="text-blue-700 font-medium">Opening Move</div>
          <div className="text-gray-700 text-xs mt-1">Score: {flowInfo.totalScore} points</div>
        </div>
      );
    }
    
    // Handle unpredictable Wild Card
    if (flowInfo.maintains === null) {
      return (
        <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
          <div className="text-purple-700 font-medium">? Flow Unknown</div>
          <div className="text-gray-700 text-xs mt-1">Depends on random result</div>
        </div>
      );
    }

    if (!flowInfo.maintains) {
      return (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <div className="text-red-700 font-medium">Breaks Flow</div>
          <div className="text-gray-700 text-xs mt-1">Score: {flowInfo.totalScore} points</div>
        </div>
      );
    }

    return (
      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
        <div className="text-green-700 font-medium">Maintains Flow</div>
        <div className="text-gray-700 text-xs mt-1">Score: {flowInfo.totalScore} points</div>
        {flowInfo.comboBonus > 0 && (
          <div className="text-blue-600 text-xs">+{flowInfo.comboBonus} combo bonus</div>
        )}
