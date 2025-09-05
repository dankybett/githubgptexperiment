// JudgeSystem.js - Handles judge scoring and modifiers for dressage game

export class JudgeSystem {
  constructor() {
    this.judgeDefinitions = {
      // FLOW PURISTS (Classic-leaning)
      perfectionist: {
        name: "The Perfectionist",
        emoji: "🧭",
        description: "Values consistent high flow",
        shortDesc: "+1 per turn with flow ≥3, -2 if flow ever broken",
        category: "flow_purist",
        modifiers: {
          highFlowTurns: { value: 1, max: 5, description: "+1 per turn with flow ≥3" },
          flowBroken: { value: -2, max: -2, description: "-2 if you ever broke flow" }
        },
        cap: { positive: 6, negative: -2 }
      },

      finishersEye: {
        name: "Finisher's Eye",
        emoji: "🎯",
        description: "Appreciates strong endings",
        shortDesc: "+3 if finish with flow ≥3, +1 if routine ≥6 moves",
        category: "flow_purist",
        modifiers: {
          strongFinish: { value: 3, max: 3, description: "+3 if finish with flow ≥3" },
          longRoutine: { value: 1, max: 1, description: "+1 if routine length ≥6" }
        },
        cap: { positive: 4, negative: 0 }
      },

      linearityJudge: {
        name: "Linearity Judge",
        emoji: "➡️",
        description: "Rewards natural gait progression",
        shortDesc: "+1 for Walk→Trot→Canter sequences, -1 for backwards gaits",
        category: "flow_purist",
        modifiers: {
          naturalProgression: { value: 1, max: 4, description: "+1 per natural Walk→Trot→Canter sequence" },
          backwardsGait: { value: -1, max: -3, description: "-1 per backwards gait without transition" }
        },
        cap: { positive: 6, negative: -3 }
      },

      // FREESTYLE ENTHUSIASTS (Reward smart breaks/recovery)
      maverick: {
        name: "The Maverick",
        emoji: "🔥",
        description: "Loves bold artistic choices",
        shortDesc: "+2 first flow break from ≥3, +1 per strong post-break move",
        category: "freestyle",
        modifiers: {
          boldBreak: { value: 2, max: 2, description: "+2 first time breaking flow from ≥3" },
          strongRecovery: { value: 1, max: 3, description: "+1 per post-break turn scoring ≥4 points" }
        },
        cap: { positive: 5, negative: 0 }
      },

      reboundJudge: {
        name: "Rebound Judge",
        emoji: "🦅",
        description: "Admires quick recovery",
        shortDesc: "+2 if regain flow ≥2 immediately after break",
        category: "freestyle",
        modifiers: {
          quickRebound: { value: 2, max: 2, description: "+2 if flow ≥2 turn after break" },
          extendedRebound: { value: 1, max: 1, description: "+1 if reach flow ≥3 within 2 turns" }
        },
        cap: { positive: 3, negative: 0 }
      },

      improvisationAficionado: {
        name: "Improvisation Aficionado",
        emoji: "🎭",
        description: "Celebrates creative expression",
        shortDesc: "+1 per meaningful freestyle break, +1 for phoenix cards",
        category: "freestyle",
        modifiers: {
          meaningfulBreaks: { value: 1, max: 3, description: "+1 per freestyle card that breaks ≥2 flow" },
          phoenixTrigger: { value: 1, max: 1, description: "+1 if Phoenix Rising/From Ashes triggers" }
        },
        cap: { positive: 4, negative: 0 }
      },

      // TEMPO SPECIALISTS
      sprinter: {
        name: "The Sprinter",
        emoji: "⚡",
        description: "Rewards efficient performance",
        shortDesc: "+2 if finish by turn 6, +1 for drawing extra cards",
        category: "tempo",
        modifiers: {
          earlyFinish: { value: 2, max: 2, description: "+2 if finish by turn 6" },
          cardDraw: { value: 1, max: 1, description: "+1 if draw ≥3 extra cards total" }
        },
        cap: { positive: 3, negative: 0 }
      },

      marathoner: {
        name: "The Marathoner",
        emoji: "🏁",
        description: "Values endurance and consistency",
        shortDesc: "+1 per turn played 7-8, +2 if never break flow",
        category: "tempo",
        modifiers: {
          endurance: { value: 1, max: 2, description: "+1 per turn playing moves in turns 7-8" },
          neverBroken: { value: 2, max: 2, description: "+2 if never break flow" }
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
