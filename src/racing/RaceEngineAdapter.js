/**
 * RACE ENGINE ADAPTER
 * 
 * This adapter allows seamless switching between original and experimental
 * racing logic without changing the main App.js structure.
 */

import { experimentalRaceEngine } from './ExperimentalRaceEngine';
import { excitingRaceEngine } from './ExcitingRaceEngine';

export class RaceEngineAdapter {
  constructor() {
    this.useExperimentalEngine = true; // Default to experimental engine (new main engine)
    this.originalCallbacks = {};
    this.lastCommentaryTime = 0;
    this.commentaryInterval = 2000; // Commentary every 2 seconds
  }

  // Toggle between racing engines
  setExperimentalMode(enabled) {
    this.useExperimentalEngine = enabled;
    console.log(`Racing engine switched to: ${enabled ? 'EXPERIMENTAL' : 'ORIGINAL'}`);
  }

  // Initialize race with current engine
  initializeRace(horses, settings, callbacks) {
    this.originalCallbacks = callbacks;
    
    if (this.useExperimentalEngine) {
      excitingRaceEngine.initializeHorses(horses);
      return this.startExperimentalRace(settings);
    } else {
      // Use original logic (pass-through)
      return callbacks.originalStartRace(settings);
    }
  }

  // Start experimental race and handle updates
  startExperimentalRace(settings) {
    // Reset commentary timer for new race
    this.lastCommentaryTime = 0;
    
    // Initialize the engine but don't start its internal countdown
    excitingRaceEngine.settings = settings;
    excitingRaceEngine.raceState = 'countdown';
    excitingRaceEngine.raceTime = 0;
    excitingRaceEngine.lastSurgeTime = 0;
    excitingRaceEngine.lastBreakawayTime = 0;
    excitingRaceEngine.breakawayActive = false;
    excitingRaceEngine.lastComebackTime = 0;
    excitingRaceEngine.comebackActive = false;
    excitingRaceEngine.surgeTargetBias = Math.random() < 0.5 ? 0 : 1;
    
    // Reset all horses to starting positions
    excitingRaceEngine.horses.forEach(horse => {
      horse.position = 0;
      horse.velocity = 0;
      horse.isSurging = false;
      horse.surgeTimeLeft = 0;
      horse.surgeIntensity = 0;
      horse.targetSurgeIntensity = 0;
      horse.isBreakingAway = false;
      horse.breakawayTimeLeft = 0;
      horse.isComingBack = false;
      horse.comebackTimeLeft = 0;
      horse.energy = horse.maxEnergy;
      horse.isFatigued = false;
      horse.isExhausted = false;
      horse.recentPositionHistory = [0];
    });
    
    // Start the update loop for experimental engine
    const updateLoop = () => {
      if (excitingRaceEngine.raceState === 'racing') {
        excitingRaceEngine.updatePositions(0.016); // ~60fps
        
        const raceData = excitingRaceEngine.getRaceData();
        
        // Update UI through original callbacks
        this.originalCallbacks.setPositions(raceData.positions);
        this.originalCallbacks.setRaceTime(raceData.raceTime);
        
        // Generate commentary at controlled intervals
        const currentTime = Date.now();
        if (currentTime - this.lastCommentaryTime > this.commentaryInterval) {
          const commentary = excitingRaceEngine.generateCommentary();
          if (commentary) {
            this.originalCallbacks.setCommentary(commentary);
            this.lastCommentaryTime = currentTime;
          }
        }
        
        // Check for winner
        const winner = raceData.horses.find(horse => horse.position >= 1);
        if (winner && excitingRaceEngine.raceState === 'finished') {
          this.originalCallbacks.setWinner(winner.name);
          this.originalCallbacks.setWinnerIndex(winner.id);
          this.originalCallbacks.setIsRacing(false);
          return; // Stop the loop
        }
        
        // Update special states for enhanced UI
        this.updateSpecialStates(raceData);
        
        requestAnimationFrame(updateLoop);
      }
    };
    
    // Handle countdown cleanly with adapter managing the timing
    this.originalCallbacks.setCountdown(3);
    setTimeout(() => this.originalCallbacks.setCountdown(2), 1000);
    setTimeout(() => this.originalCallbacks.setCountdown(1), 2000);
    setTimeout(() => {
      this.originalCallbacks.setCountdown(null);
      this.originalCallbacks.setIsRacing(true);
      // Start the race in the engine
      excitingRaceEngine.raceState = 'racing';
      requestAnimationFrame(updateLoop);
    }, 3000);
  }

  // Update special states for enhanced visual feedback
  updateSpecialStates(raceData) {
    // Update UI with exciting racing data including fatigue
    const surgingHorses = raceData.surgingHorses || raceData.horses.map(horse => horse.isSurging);
    const fatiguedHorses = raceData.fatiguedHorses || raceData.horses.map(horse => horse.isFatigued || false);
    
    if (this.originalCallbacks.setSurgingHorses) {
      this.originalCallbacks.setSurgingHorses(surgingHorses);
    }
    if (this.originalCallbacks.setFatiguedHorses) {
      this.originalCallbacks.setFatiguedHorses(fatiguedHorses);
    }
  }

  // Get current engine status
  getEngineInfo() {
    return {
      mode: this.useExperimentalEngine ? 'experimental' : 'original',
      features: this.useExperimentalEngine ? [
        'Rubber-band catch-up mechanics',
        'Random surge system for overtaking',
        'Pack dynamics and slipstreaming', 
        'Final stretch excitement boost',
        'Tight racing with constant position changes',
        'Maximum excitement optimization'
      ] : [
        'Classic random-based racing',
        'Weather effects',
        'Surge/fatigue system',
        'Traditional racing mechanics'
      ]
    };
  }

  // Reset function
  reset() {
    if (this.useExperimentalEngine) {
      excitingRaceEngine.reset();
    }
  }
}

// Export singleton instance
export const raceEngineAdapter = new RaceEngineAdapter();