// JudgeSystem.js - Handles judge scoring and modifiers for dressage game

export class JudgeSystem {
  constructor() {
    this.judgeDefinitions = {
      // FLOW PURISTS (Classic-leaning)
      perfectionist: {
        name: "The Perfectionist",
        emoji: "✨",
        description: "Values consistent high flow",
        shortDesc: "+1 per turn with flow 3+, -1 if break 2+ times",
        category: "flow_purist",
        modifiers: {
          highFlowTurns: { value: 1, max: 5, description: "+1 per turn with flow 3+" },
          frequentBreaks: { value: -1, max: -1, description: "-1 if you broke flow 2+ times" }
        },
        cap: { positive: 6, negative: -1 }
      },

      finishersEye: {
        name: "Finisher's Eye",
        emoji: "🎨",
        description: "Appreciates strong endings",
        shortDesc: "+3 if finish with flow 3+, +1 if used both Classic and Freestyle",
        category: "flow_purist",
        modifiers: {
          strongFinish: { value: 3, max: 3, description: "+3 if finish with flow 3+" },
          hybridMix: { value: 1, max: 1, description: "+1 if used both Classic and Freestyle cards" }
        },
        cap: { positive: 4, negative: 0 }
      },

      linearityJudge: {
        name: "Linearity Judge",
        emoji: "➡️",
        description: "Rewards natural gait progression",
        shortDesc: "+1 for Walk→Trot or Trot→Canter steps, -1 once for backwards gait",
        category: "flow_purist",
        modifiers: {
          naturalProgression: { value: 1, max: 4, description: "+1 per Walk→Trot or Trot→Canter step" },
          backwardsGait: { value: -1, max: -1, description: "-1 if any backwards gait without Transition" }
        },
        cap: { positive: 6, negative: -1 }
      },

      // FREESTYLE ENTHUSIASTS (Reward smart breaks/recovery)
      maverick: {
        name: "The Maverick",
        emoji: "⚡",
        description: "Loves bold artistic choices",
        shortDesc: "+2 first flow break from 3+, +1 per strong post-break move",
        category: "freestyle",
        modifiers: {
          boldBreak: { value: 2, max: 2, description: "+2 first time breaking flow from 3+" },
          strongRecovery: { value: 1, max: 3, description: "+1 per post-break turn scoring 4+ points" }
        },
        cap: { positive: 5, negative: 0 }
      },

      reboundJudge: {
        name: "Rebound Judge",
        emoji: "🛡️",
        description: "Admires quick recovery",
        shortDesc: "+2 if regain flow 2+ immediately after break; +1 if reach flow 3+ within 2 turns",
        category: "freestyle",
        modifiers: {
          quickRebound: { value: 2, max: 2, description: "+2 if flow 2+ turn after break" },
          extendedRebound: { value: 1, max: 1, description: "+1 if reach flow 3+ within 2 turns" }
        },
        cap: { positive: 3, negative: 0 }
      },

      improvisationAficionado: {
        name: "Improvisation Aficionado",
        emoji: "🎭",
        description: "Celebrates creative expression",
        shortDesc: "+1 per meaningful freestyle break, +1 for strong post-break recovery",
        category: "freestyle",
        modifiers: {
          meaningfulBreaks: { value: 1, max: 3, description: "+1 per freestyle card that breaks 2+ flow" },
          recoveryBoost: { value: 1, max: 1, description: "+1 if a post-break card scores above its base" }
        },
        cap: { positive: 4, negative: 0 }
      },

      // TEMPO SPECIALISTS
      sprinter: {
        name: "The Sprinter",
        emoji: "🏎️",
        description: "Rewards efficient performance",
        shortDesc: "+2 if finish by turn 6, +1 for drawing 3+ extra cards total",
        category: "tempo",
        modifiers: {
          earlyFinish: { value: 2, max: 2, description: "+2 if finish by turn 6" },
          cardDraw: { value: 1, max: 1, description: "+1 if draw 3+ extra cards total" }
        },
        cap: { positive: 3, negative: 0 }
      },

      marathoner: {
        name: "The Marathoner",
        emoji: "🏋️",
        description: "Values endurance and consistency",
        shortDesc: "+1 per turn played 7–8, +2 if finish with a 2-turn flow streak (2+)",
        category: "tempo",
        modifiers: {
          endurance: { value: 1, max: 2, description: "+1 per turn playing moves in turns 7–8" },
          finishStreak: { value: 2, max: 2, description: "+2 if your last 2 turns end at flow 2+" }
        },
        cap: { positive: 4, negative: 0 }
      },

      punctualist: {
        name: "The Punctualist",
        emoji: "⏱️",
        description: "Appreciates perfect timing",
        shortDesc: "+4 if finish exactly on turn 7, +1 if spend all stamina",
        category: "tempo",
        modifiers: {
          perfectTiming: { value: 4, max: 4, description: "+4 if finish exactly on turn 7" },
          efficient: { value: 1, max: 1, description: "+1 if end with ≤1 stamina" }
        },
        cap: { positive: 5, negative: 0 }
      },

      // VARIETY JUDGES
      paletteJudge: {
        name: "Palette Judge",
        emoji: "🖌️",
        description: "Loves diverse performances",
        shortDesc: "+1 per different card type (up to 5)",
        category: "variety",
        modifiers: {
          variety: { value: 1, max: 5, description: "+1 per different card type (Walk/Trot/Canter/Transition/Freestyle/Finish/Power/Specialty)" }
        },
        cap: { positive: 5, negative: 0 }
      },

      gaitSpecialist: {
        name: "Gait Specialist",
        emoji: "🐎",
        description: "Focuses on specific gait mastery",
        shortDesc: "+1 per play of declared gait, -1 if never played",
        category: "variety",
        modifiers: {
          specialtyBonus: { value: 1, max: 4, description: "+1 per play of declared gait" },
          missedSpecialty: { value: -1, max: -1, description: "-1 if never play declared gait" }
        },
        cap: { positive: 4, negative: -1 },
        declaredGait: null // Will be set randomly at game start
      },

      // RESOURCE MANAGEMENT
      handManagementJudge: {
        name: "Hand Management Judge",
        emoji: "🃏",
        description: "Values skillful card management",
        shortDesc: "+1 per extra draw, +1 if never stamina-locked",
        category: "resource",
        modifiers: {
          extraDraws: { value: 1, max: 3, description: "+1 per draw outside draw phase" },
          neverLocked: { value: 1, max: 1, description: "+1 if never have unplayable hand due to stamina" }
        },
        cap: { positive: 4, negative: 0 }
      }
    };
  }

  // Select 3 random judges for a game
  selectJudges() {
    const judgeIds = Object.keys(this.judgeDefinitions);
    const shuffled = [...judgeIds].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    
    // Initialize selected judges with fresh state
    const judges = selected.map(id => {
      const judge = { ...this.judgeDefinitions[id] };
      
      // Initialize tracking state
      judge.id = id;
      judge.currentModifier = 0;
      judge.triggerCounts = {};
      
      // Initialize trigger counters for each modifier
      Object.keys(judge.modifiers).forEach(key => {
        judge.triggerCounts[key] = 0;
      });
      
      // Special initialization for Gait Specialist
      if (id === 'gaitSpecialist') {
        const gaits = ['Walk', 'Trot', 'Canter'];
        judge.declaredGait = gaits[Math.floor(Math.random() * gaits.length)];
      }
      
      return judge;
    });
    
    return judges;
  }

  // Calculate judge modifiers based on game state
  calculateJudgeModifiers(judges, gameLog) {
    return judges.map(judge => {
      const updatedJudge = { ...judge };
      updatedJudge.currentModifier = 0;
      updatedJudge.triggerCounts = { ...judge.triggerCounts };
      
      // Calculate modifiers based on judge type
      switch (judge.id) {
        case 'perfectionist':
          updatedJudge.currentModifier = this.calculatePerfectionist(updatedJudge, gameLog);
          break;
        case 'finishersEye':
          updatedJudge.currentModifier = this.calculateFinishersEye(updatedJudge, gameLog);
          break;
        case 'linearityJudge':
          updatedJudge.currentModifier = this.calculateLinearityJudge(updatedJudge, gameLog);
          break;
        case 'maverick':
          updatedJudge.currentModifier = this.calculateMaverick(updatedJudge, gameLog);
          break;
        case 'reboundJudge':
          updatedJudge.currentModifier = this.calculateReboundJudge(updatedJudge, gameLog);
          break;
        case 'improvisationAficionado':
          updatedJudge.currentModifier = this.calculateImprovisationAficionado(updatedJudge, gameLog);
          break;
        case 'sprinter':
          updatedJudge.currentModifier = this.calculateSprinter(updatedJudge, gameLog);
          break;
        case 'marathoner':
          updatedJudge.currentModifier = this.calculateMarathoner(updatedJudge, gameLog);
          break;
        case 'punctualist':
          updatedJudge.currentModifier = this.calculatePunctualist(updatedJudge, gameLog);
          break;
        case 'paletteJudge':
          updatedJudge.currentModifier = this.calculatePaletteJudge(updatedJudge, gameLog);
          break;
        case 'gaitSpecialist':
          updatedJudge.currentModifier = this.calculateGaitSpecialist(updatedJudge, gameLog);
          break;
        case 'handManagementJudge':
          updatedJudge.currentModifier = this.calculateHandManagementJudge(updatedJudge, gameLog);
          break;
      }
      
      // Apply caps
      updatedJudge.currentModifier = Math.max(
        judge.cap.negative, 
        Math.min(judge.cap.positive, updatedJudge.currentModifier)
      );
      
      return updatedJudge;
    });
  }

  // Individual judge calculation methods
  calculatePerfectionist(judge, gameLog) {
    let modifier = 0;
    let highFlowTurns = 0;
    let breaks = 0;
    
    gameLog.turns.forEach(turn => {
      if (turn.postFlowLevel >= 3) highFlowTurns++;
      if (turn.flowBroke) breaks++;
    });
    
    judge.triggerCounts.highFlowTurns = Math.min(highFlowTurns, judge.modifiers.highFlowTurns.max);
    if (breaks >= 2) {
      judge.triggerCounts.frequentBreaks = 1;
      modifier += judge.modifiers.frequentBreaks.value;
    }
    modifier += judge.triggerCounts.highFlowTurns * judge.modifiers.highFlowTurns.value;
    return modifier;
  }

  calculateFinishersEye(judge, gameLog) {
    let modifier = 0;
    const lastTurn = gameLog.turns[gameLog.turns.length - 1];
    
    // Strong finish bonus
    if (lastTurn?.card?.tags?.includes("Finish") && lastTurn.preFlowLevel >= 3) {
      judge.triggerCounts.strongFinish = 1;
      modifier += judge.modifiers.strongFinish.value;
    }
    
    // Hybrid mix: used both classic and freestyle at least once
    let usedFreestyle = false;
    let usedClassic = false;
    gameLog.turns.forEach(turn => {
      if (turn.card.type === 'freestyle') usedFreestyle = true;
      if (turn.card.type !== 'freestyle') usedClassic = true;
    });
    if (usedFreestyle && usedClassic) {
      judge.triggerCounts.hybridMix = 1;
      modifier += judge.modifiers.hybridMix.value;
    }
    
    return modifier;
  }

  calculateLinearityJudge(judge, gameLog) {
    let modifier = 0;
    let naturalSteps = 0;
    let hasBackwards = false;
    
    for (let i = 1; i < gameLog.turns.length; i++) {
      const prevCard = gameLog.turns[i - 1].card;
      const currentCard = gameLog.turns[i].card;
      if (this.isNaturalProgression(prevCard, currentCard)) naturalSteps++;
      if (this.isBackwardsGait(prevCard, currentCard)) hasBackwards = true;
    }
    judge.triggerCounts.naturalProgression = Math.min(naturalSteps, judge.modifiers.naturalProgression.max);
    modifier += judge.triggerCounts.naturalProgression * judge.modifiers.naturalProgression.value;
    if (hasBackwards) {
      judge.triggerCounts.backwardsGait = 1;
      modifier += judge.modifiers.backwardsGait.value;
    }
    return modifier;
  }

  calculateMaverick(judge, gameLog) {
    let modifier = 0;
    let boldBreakTriggered = false;
    let strongRecoveries = 0;
    
    gameLog.turns.forEach((turn, index) => {
      if (!boldBreakTriggered && turn.flowBroke && turn.preFlowLevel >= 3) {
        boldBreakTriggered = true;
        judge.triggerCounts.boldBreak = 1;
        modifier += judge.modifiers.boldBreak.value;
      }
      if (index > 0 && gameLog.turns[index - 1].flowBroke && turn.earnedScore >= 4) {
        strongRecoveries++;
      }
    });
    judge.triggerCounts.strongRecovery = Math.min(strongRecoveries, judge.modifiers.strongRecovery.max);
    modifier += judge.triggerCounts.strongRecovery * judge.modifiers.strongRecovery.value;
    return modifier;
  }

  calculateReboundJudge(judge, gameLog) {
    let modifier = 0;
    let quickRebounds = 0;
    let extendedRebounds = 0;
    
    for (let i = 1; i < gameLog.turns.length; i++) {
      const prevTurn = gameLog.turns[i - 1];
      const currentTurn = gameLog.turns[i];
      if (prevTurn.flowBroke && currentTurn.postFlowLevel >= 2) {
        quickRebounds++;
        for (let j = i; j < Math.min(i + 2, gameLog.turns.length); j++) {
          if (gameLog.turns[j].postFlowLevel >= 3) {
            extendedRebounds++;
            break;
          }
        }
      }
    }
    judge.triggerCounts.quickRebound = Math.min(quickRebounds, judge.modifiers.quickRebound.max / judge.modifiers.quickRebound.value);
    judge.triggerCounts.extendedRebound = Math.min(extendedRebounds, judge.modifiers.extendedRebound.max);
    modifier += judge.triggerCounts.quickRebound * judge.modifiers.quickRebound.value;
    modifier += judge.triggerCounts.extendedRebound * judge.modifiers.extendedRebound.value;
    return modifier;
  }

  calculateImprovisationAficionado(judge, gameLog) {
    let modifier = 0;
    let meaningfulBreaks = 0;
    let recoveryBoost = false;
    
    gameLog.turns.forEach((turn, index) => {
      if (turn.flowBroke && turn.preFlowLevel >= 2 && (turn.card.type === 'freestyle' || this.isFreestyleBreakCard(turn.card))) {
        meaningfulBreaks++;
      }
      if (index > 0 && gameLog.turns[index - 1].flowBroke && turn.earnedScore > (turn.card.base || 0)) {
        recoveryBoost = true;
      }
    });
    judge.triggerCounts.meaningfulBreaks = Math.min(meaningfulBreaks, judge.modifiers.meaningfulBreaks.max);
    modifier += judge.triggerCounts.meaningfulBreaks * judge.modifiers.meaningfulBreaks.value;
    if (recoveryBoost) {
      judge.triggerCounts.recoveryBoost = 1;
      modifier += judge.modifiers.recoveryBoost.value;
    }
    return modifier;
  }

  calculateSprinter(judge, gameLog) {
    let modifier = 0;
    const finishTurnIndex = gameLog.turns.findIndex(turn => turn.card.tags?.includes("Finish"));
    if (finishTurnIndex >= 0 && finishTurnIndex <= 5) {
      judge.triggerCounts.earlyFinish = 1;
      modifier += judge.modifiers.earlyFinish.value;
    }
    if ((gameLog.extraDrawsTotal || 0) >= 3) {
      judge.triggerCounts.cardDraw = 1;
      modifier += judge.modifiers.cardDraw.value;
    }
    return modifier;
  }

  calculateMarathoner(judge, gameLog) {
    let modifier = 0;
    // Endurance: turns 7–8 (1-based turn numbers) => turnNumber >=7
    let enduranceTurns = 0;
    gameLog.turns.forEach(t => {
      if ((t.turnNumber || 0) >= 7) enduranceTurns++;
    });
    judge.triggerCounts.endurance = Math.min(enduranceTurns, judge.modifiers.endurance.max);
    modifier += judge.triggerCounts.endurance * judge.modifiers.endurance.value;
    // Finish streak: last two turns flow >=2
    if (gameLog.turns.length >= 2) {
      const last = gameLog.turns[gameLog.turns.length - 1];
      const prev = gameLog.turns[gameLog.turns.length - 2];
      if (last.postFlowLevel >= 2 && prev.postFlowLevel >= 2) {
        judge.triggerCounts.finishStreak = 1;
        modifier += judge.modifiers.finishStreak.value;
      }
    }
    return modifier;
  }

  calculatePunctualist(judge, gameLog) {
    let modifier = 0;
    const lastTurn = gameLog.turns[gameLog.turns.length - 1];
    const finishTurnNumber = lastTurn?.turnNumber || gameLog.turns.length;
    if (lastTurn?.card?.tags?.includes("Finish") && finishTurnNumber === 7) {
      judge.triggerCounts.perfectTiming = 1;
      modifier += judge.modifiers.perfectTiming.value;
    }
    // Efficient: end with ≤1 stamina
    if ((gameLog.finalStamina || 0) <= 1) {
      judge.triggerCounts.efficient = 1;
      modifier += judge.modifiers.efficient.value;
    }
    return modifier;
  }

  calculatePaletteJudge(judge, gameLog) {
    let modifier = 0;
    const cardTypes = new Set();
    gameLog.turns.forEach(turn => {
      if (turn.card.tags?.includes("Walk")) cardTypes.add("Walk");
      if (turn.card.tags?.includes("Trot")) cardTypes.add("Trot");
      if (turn.card.tags?.includes("Canter")) cardTypes.add("Canter");
      if (turn.card.tags?.includes("Transition")) cardTypes.add("Transition");
      if (turn.card.tags?.includes("Finish")) cardTypes.add("Finish");
      if (turn.card.type === "freestyle") cardTypes.add("Freestyle");
      if (turn.card.type === "power") cardTypes.add("Power");
      if (turn.card.type === "specialty") cardTypes.add("Specialty");
    });
    judge.triggerCounts.variety = Math.min(cardTypes.size, judge.modifiers.variety.max);
    modifier += judge.triggerCounts.variety * judge.modifiers.variety.value;
    return modifier;
  }

  calculateGaitSpecialist(judge, gameLog) {
    let modifier = 0;
    let specialtyCount = 0;
    let playedSpecialty = false;
    
    gameLog.turns.forEach(turn => {
      if (turn.card.tags?.includes(judge.declaredGait)) {
        specialtyCount++;
        playedSpecialty = true;
      }
    });
    judge.triggerCounts.specialtyBonus = Math.min(specialtyCount, judge.modifiers.specialtyBonus.max);
    modifier += judge.triggerCounts.specialtyBonus * judge.modifiers.specialtyBonus.value;
    if (!playedSpecialty) {
      judge.triggerCounts.missedSpecialty = 1;
      modifier += judge.modifiers.missedSpecialty.value;
    }
    return modifier;
  }

  calculateHandManagementJudge(judge, gameLog) {
    let modifier = 0;
    judge.triggerCounts.extraDraws = Math.min(gameLog.extraDrawsTotal || 0, judge.modifiers.extraDraws.max);
    modifier += judge.triggerCounts.extraDraws * judge.modifiers.extraDraws.value;
    if (!gameLog.hadStaminaLock) {
      judge.triggerCounts.neverLocked = 1;
      modifier += judge.modifiers.neverLocked.value;
    }
    return modifier;
  }

  // Helper methods
  isNaturalProgression(prevCard, currentCard) {
    const gaitOrder = { Walk: 1, Trot: 2, Canter: 3 };
    const prevGait = this.getPrimaryGait(prevCard);
    const currentGait = this.getPrimaryGait(currentCard);
    return gaitOrder[prevGait] && gaitOrder[currentGait] && gaitOrder[currentGait] === gaitOrder[prevGait] + 1;
  }

  isBackwardsGait(prevCard, currentCard) {
    const gaitOrder = { Walk: 1, Trot: 2, Canter: 3 };
    const prevGait = this.getPrimaryGait(prevCard);
    const currentGait = this.getPrimaryGait(currentCard);
    return gaitOrder[prevGait] && gaitOrder[currentGait] && gaitOrder[currentGait] < gaitOrder[prevGait] && !currentCard.tags?.includes("Transition");
  }

  getPrimaryGait(card) {
    if (card?.tags?.includes("Walk")) return "Walk";
    if (card?.tags?.includes("Trot")) return "Trot";
    if (card?.tags?.includes("Canter")) return "Canter";
    return null;
  }

  isFreestyleBreakCard(card) {
    const freestyleBreakCards = [
      "Spontaneous Leap", "Artistic Rebellion", "Bold Improvisation", 
      "Creative Explosion", "All or Nothing"
    ];
    return freestyleBreakCards.includes(card.name);
  }

  // Calculate final scores with judge modifiers
  calculateFinalScores(coreScore, judges) {
    return judges.map(judge => ({
      judgeName: judge.name,
      emoji: judge.emoji,
      coreScore: coreScore,
      judgeModifier: judge.currentModifier,
      finalScore: coreScore + judge.currentModifier,
      triggerCounts: judge.triggerCounts
    }));
  }

  // Get average final score
  getAverageFinalScore(judgeScores) {
    const total = judgeScores.reduce((sum, score) => sum + score.finalScore, 0);
    return Math.round((total / judgeScores.length) * 10) / 10; // Round to 1 decimal
  }
}

export default JudgeSystem;

