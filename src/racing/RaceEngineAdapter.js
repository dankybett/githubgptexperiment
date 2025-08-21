/**
 * RACE ENGINE ADAPTER
 * 
 * Simplified adapter that uses the ExcitingRaceEngine as the main racing engine.
 * This manages the race flow and callbacks to App.js.
 */

import { excitingRaceEngine } from './ExcitingRaceEngine';

export class RaceEngineAdapter {
  constructor() {
    this.originalCallbacks = {};
    this.lastCommentaryTime = 0;
    this.commentaryInterval = 2000; // Commentary every 2 seconds
    this.winnerAnnounced = false; // Track if winner announcement has been made
  }

  // Initialize race
  initializeRace(horses, settings, callbacks) {
    this.originalCallbacks = callbacks;
    excitingRaceEngine.initializeHorses(horses);
    return this.startRace(settings);
  }

  // Start race and handle updates
  startRace(settings) {
    // Reset commentary timer and winner announcement flag for new race
    this.lastCommentaryTime = 0;
    this.winnerAnnounced = false;
    
    // Initialize the engine but don't start its internal countdown
    excitingRaceEngine.settings = settings;
    excitingRaceEngine.raceState = 'countdown';
    excitingRaceEngine.raceTime = 0;
    excitingRaceEngine.winner = null;  // Reset winner for new race
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
    
    // Start the update loop
    const updateLoop = () => {
      if (excitingRaceEngine.raceState === 'racing' || excitingRaceEngine.raceState === 'finished') {
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
        
        // Check for winner declaration (at 90%) - only announce once
        if (excitingRaceEngine.winner && excitingRaceEngine.raceState === 'finished' && !this.winnerAnnounced) {
          this.originalCallbacks.setWinner(excitingRaceEngine.winner.name);
          this.originalCallbacks.setWinnerIndex(excitingRaceEngine.winner.id);
          
          // Immediate winner announcement commentary (only once)
          const winnerAnnouncements = [
            `${excitingRaceEngine.winner.name} crosses the line first! What a victory!`,
            `AND THE WINNER IS ${excitingRaceEngine.winner.name}! Incredible finish!`,
            `${excitingRaceEngine.winner.name} takes the victory! What a race!`,
            `IT'S ${excitingRaceEngine.winner.name}! They've done it!`,
            `Victory to ${excitingRaceEngine.winner.name}! What an amazing performance!`,
            `${excitingRaceEngine.winner.name} wins it! Sensational racing!`
          ];
          const announcement = winnerAnnouncements[Math.floor(Math.random() * winnerAnnouncements.length)];
          this.originalCallbacks.setCommentary(announcement);
          this.winnerAnnounced = true; // Mark as announced
          
          // Don't set isRacing to false yet - let horses continue running
        }
        
        // Check if race is completely finished (all horses reach 99%)
        const allFinished = raceData.horses.every(horse => horse.position >= 0.99);
        if (allFinished) {
          this.originalCallbacks.setIsRacing(false);
          return; // Stop the loop only when all horses finish
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

  // Get engine info
  getEngineInfo() {
    return {
      mode: 'exciting',
      features: [
        'Rubber-band catch-up mechanics',
        'Random surge system for overtaking',
        'Pack dynamics and slipstreaming', 
        'Final stretch excitement boost',
        'Tight racing with constant position changes',
        'Maximum excitement optimization'
      ]
    };
  }

  // Reset function
  reset() {
    excitingRaceEngine.reset();
  }
}

// Export singleton instance
export const raceEngineAdapter = new RaceEngineAdapter();