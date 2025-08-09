/**
 * EXCITING RACE ENGINE
 * 
 * Designed specifically for maximum excitement with these principles:
 * 1. Any horse can win
 * 2. Tight pack racing with constant overtaking
 * 3. Thrilling to watch
 */

export class ExcitingRaceEngine {
  constructor() {
    this.horses = [];
    this.raceState = 'waiting';
    this.raceTime = 0;
    this.settings = {};
    this.lastSurgeTime = 0;        // Track timing for alternating surges
    this.surgeTargetBias = 0;      // 0 = target leaders, 1 = target trailing horses
    this.lastBreakawayTime = 0;    // Track timing for rare breakaways
    this.breakawayActive = false;  // Whether someone is currently broken away
    this.lastComebackTime = 0;     // Track timing for comeback attempts
    this.comebackActive = false;   // Whether a comeback is currently happening
    
    // Excitement parameters
    this.excitementSettings = {
      rubberBandStrength: 0.8,      // Much stronger catch-up effect
      surgeFrequency: 0.04,         // Much more frequent surges for constant action
      comebackBoost: 3.0,           // Higher multiplier for horses behind
      packTightness: 0.08,          // Much tighter pack (was 0.15)
      finalStretchBoost: 1.5,       // Speed multiplier in final 20%
      maxSurgeSpeed: 0.09,          // More noticeable surge speed (increased from 0.07)
      baseSpeed: 0.04,              // Normal racing speed (will be scaled)
      leaderResistance: 0.15,       // New: slow down leaders to keep pack tight
      surgeAcceleration: 1.2,       // Faster acceleration into surge (was 0.8)
      surgeDeceleration: 0.8,       // Faster deceleration out of surge (was 0.6)
      breakawayChance: 0.15,        // 15% chance for breakaway during leader surge phase
      breakawayMinInterval: 8000,   // Minimum 8 seconds between breakaway attempts
      breakawayDuration: 4000,      // Breakaways last 4 seconds before catch-up kicks in
      breakawaySpeed: 0.11,         // Speed boost during breakaway (higher than normal surge)
      comebackChance: 0.12,         // 12% chance for comeback during trailing surge phase
      comebackMinInterval: 10000,   // Minimum 10 seconds between comeback attempts
      comebackDuration: 5000,       // Comebacks last 5 seconds for dramatic effect
      comebackSpeed: 0.13,          // Higher speed than breakaway for dramatic effect
      
      // Fatigue system settings
      maxEnergy: 100,               // Maximum energy level
      normalEnergyDrain: 0.8,       // Energy drain per second during normal racing
      surgeEnergyDrain: 2.5,        // Energy drain per second during surges
      breakawayEnergyDrain: 4.0,    // Energy drain per second during breakaways
      comebackEnergyDrain: 5.0,     // Energy drain per second during comebacks (highest)
      energyRecovery: 0.5,          // Energy recovery per second when not surging
      draftingEnergyBonus: 0.2,     // Extra energy recovery when drafting
    };
    
    // Speed scaling by race distance for realism
    this.speedScaling = {
      short: 1.5,    // Sprints are fastest
      medium: 1.0,   // Baseline speed
      long: 0.6      // Marathons are slower pace
    };
  }

  // Initialize all horses as completely equal
  initializeHorses(horseData) {
    this.horses = horseData.map((horse, index) => ({
      id: index,
      name: horse.name || `Horse ${index + 1}`,
      
      // Position and movement
      position: 0,
      velocity: 0,
      targetSpeed: this.excitementSettings.baseSpeed,
      
      // Excitement states
      isSurging: false,
      surgeTimeLeft: 0,
      momentum: 0,
      surgeIntensity: 0,        // Current surge strength (0-1)
      targetSurgeIntensity: 0,  // Target surge strength for smooth transitions
      isBreakingAway: false,    // Whether this horse is attempting a breakaway
      breakawayTimeLeft: 0,     // Time remaining in breakaway attempt
      isComingBack: false,      // Whether this horse is making a comeback
      comebackTimeLeft: 0,      // Time remaining in comeback attempt
      
      // Energy/fatigue system
      energy: this.excitementSettings.maxEnergy,  // Current energy level
      maxEnergy: this.excitementSettings.maxEnergy,  // Maximum energy
      isFatigued: false,        // Whether horse is noticeably tired
      isExhausted: false,       // Whether horse is very tired
      
      // Dynamic properties
      rubberBandForce: 0,
      packEffect: 1.0,
      recentPositionHistory: [0], // Track for overtaking detection
    }));
  }

  // Main update loop - designed for maximum excitement
  updatePositions(deltaTime) {
    if (this.raceState !== 'racing') return;
    
    this.raceTime += deltaTime;
    
    // Step 1: Calculate rubber band effects
    this.applyRubberBandEffect();
    
    // Step 2: Handle random surges for excitement
    this.handleRandomSurges();
    
    // Step 3: Apply pack dynamics
    this.calculatePackEffects();
    
    // Step 4: Final stretch excitement boost
    this.applyFinalStretchBoost();
    
    // Step 5: Update horse energy and fatigue
    this.updateHorseEnergy(deltaTime);
    
    // Step 6: Update each horse position
    this.horses.forEach(horse => {
      this.updateHorsePosition(horse, deltaTime);
      this.trackPositionHistory(horse);
    });
    
    // Check for race completion
    const winner = this.horses.find(horse => horse.position >= 1);
    if (winner && this.raceState === 'racing') {
      this.raceState = 'finished';
    }
  }

  // Rubber band effect - keep races tight but allow occasional breakaways
  applyRubberBandEffect() {
    const positions = this.horses.map(h => h.position);
    const leader = Math.max(...positions);
    const trailer = Math.min(...positions);
    const spread = leader - trailer;
    const averagePosition = positions.reduce((a, b) => a + b, 0) / positions.length;
    
    // Check if any horse is breaking away or coming back
    const breakawayHorses = this.horses.filter(h => h.isBreakingAway);
    const comebackHorses = this.horses.filter(h => h.isComingBack);
    
    this.horses.forEach(horse => {
      // Distance from average position (not just leader)
      const distanceFromAverage = averagePosition - horse.position;
      
      // If this horse is breaking away or coming back, reduce rubber band resistance
      if (horse.isBreakingAway || horse.isComingBack) {
        horse.rubberBandForce = 0; // No rubber band during special moves
      }
      // Strong catch-up force for horses behind the pack
      else if (distanceFromAverage > 0) {
        let catchupForce = distanceFromAverage * this.excitementSettings.rubberBandStrength * 2;
        
        // Increase catch-up force if someone is breaking away (dramatic chase)
        if (breakawayHorses.length > 0) {
          catchupForce *= 1.4; // 40% stronger catch-up during breakaways
        }
        // Reduce catch-up force if someone is coming back (give them room to shine)
        if (comebackHorses.length > 0) {
          catchupForce *= 0.7; // 30% weaker catch-up during comebacks
        }
        
        horse.rubberBandForce = catchupForce;
      }
      // Moderate slowdown for horses ahead of pack (unless breaking away)
      else {
        horse.rubberBandForce = distanceFromAverage * this.excitementSettings.leaderResistance;
      }
      
      // Extra penalty for runaway leaders (unless they're in a planned breakaway or comeback)
      const distanceFromLeader = leader - horse.position;
      if (!horse.isBreakingAway && !horse.isComingBack && distanceFromLeader < 0.02 && spread > this.excitementSettings.packTightness) {
        horse.rubberBandForce -= this.excitementSettings.leaderResistance * 2;
      }
      
      // Cap the rubber band force
      horse.rubberBandForce = Math.max(-0.4, Math.min(horse.rubberBandForce, 1.5)); // Slightly higher max for dramatic chases
    });
  }

  // Random surges create overtaking and excitement
  handleRandomSurges() {
    this.horses.forEach(horse => {
      // Handle breakaway countdown
      if (horse.isBreakingAway) {
        horse.breakawayTimeLeft -= 16;
        if (horse.breakawayTimeLeft <= 0) {
          horse.isBreakingAway = false;
          horse.breakawayTimeLeft = 0;
          this.breakawayActive = false; // Allow new breakaways
        }
      }
      
      // Handle comeback countdown
      if (horse.isComingBack) {
        horse.comebackTimeLeft -= 16;
        if (horse.comebackTimeLeft <= 0) {
          horse.isComingBack = false;
          horse.comebackTimeLeft = 0;
          this.comebackActive = false; // Allow new comebacks
        }
      }
      
      // Handle surge transitions with smooth acceleration/deceleration
      if (horse.isSurging) {
        horse.surgeTimeLeft -= 16; // milliseconds
        
        if (horse.surgeTimeLeft <= 0) {
          // End surge - start deceleration
          horse.isSurging = false;
          horse.surgeTimeLeft = 0;
          horse.targetSurgeIntensity = 0; // Decelerate to normal speed
        } else {
          // Still surging - determine intensity based on time remaining
          const totalSurgeTime = 400 + (Math.random() * 600);
          const progressThroughSurge = 1 - (horse.surgeTimeLeft / totalSurgeTime);
          
          // Create acceleration curve (ramp up then down)
          if (progressThroughSurge < 0.3) {
            // Acceleration phase
            horse.targetSurgeIntensity = progressThroughSurge / 0.3;
          } else if (progressThroughSurge > 0.7) {
            // Deceleration phase
            horse.targetSurgeIntensity = (1 - progressThroughSurge) / 0.3;
          } else {
            // Peak surge phase
            horse.targetSurgeIntensity = 1.0;
          }
        }
      } else {
        // Not surging - make sure we decelerate to 0
        horse.targetSurgeIntensity = 0;
      }
      
      // Smooth transition to target intensity
      const intensityDiff = horse.targetSurgeIntensity - horse.surgeIntensity;
      if (Math.abs(intensityDiff) > 0.01) {
        const transitionSpeed = horse.targetSurgeIntensity > horse.surgeIntensity 
          ? this.excitementSettings.surgeAcceleration 
          : this.excitementSettings.surgeDeceleration;
        horse.surgeIntensity += intensityDiff * transitionSpeed * (16/1000); // Smooth transition
      } else {
        horse.surgeIntensity = horse.targetSurgeIntensity;
      }
      
      // Strategic surge system for back-and-forth action
      if (!horse.isSurging && Math.random() < this.excitementSettings.surgeFrequency) {
        const positions = this.horses.map(h => h.position);
        const leader = Math.max(...positions);
        const trailer = Math.min(...positions);
        const horsePosition = horse.position;
        
        // Calculate horse's relative position (0 = trailing, 1 = leading)
        const relativePosition = (horsePosition - trailer) / ((leader - trailer) || 0.01);
        
        // Alternating surge bias for back-and-forth racing
        let surgeChance = 0.3; // Base chance
        
        // Every 3 seconds, switch the surge target bias
        if (this.raceTime - this.lastSurgeTime > 3000) {
          this.surgeTargetBias = 1 - this.surgeTargetBias; // Flip between 0 and 1
          this.lastSurgeTime = this.raceTime;
        }
        
        if (this.surgeTargetBias < 0.5) {
          // Target trailing horses for comebacks
          surgeChance *= (1 + (1 - relativePosition) * 2); // Trailing horses get 3x chance
        } else {
          // Target leading horses to create new breakaways
          surgeChance *= (1 + relativePosition * 1.5); // Leading horses get 2.5x chance
        }
        
        // Additional comeback boost for horses very far behind
        const distanceFromLeader = leader - horsePosition;
        if (distanceFromLeader > 0.05) {
          surgeChance *= 1.5; // Extra boost for horses falling behind
        }
        
        // Energy-based surge modification
        const energyPercentage = horse.energy / horse.maxEnergy;
        if (energyPercentage > 0.8) {
          surgeChance *= 1.3; // Fresh horses more likely to surge
        } else if (energyPercentage < 0.4) {
          surgeChance *= 0.5; // Tired horses less likely to surge
        } else if (energyPercentage < 0.2) {
          surgeChance *= 0.2; // Exhausted horses very unlikely to surge
        }
        
        if (Math.random() < surgeChance) {
          const timeSinceLastBreakaway = this.raceTime - this.lastBreakawayTime;
          const timeSinceLastComeback = this.raceTime - this.lastComebackTime;
          const canBreakaway = timeSinceLastBreakaway > this.excitementSettings.breakawayMinInterval;
          const canComeback = timeSinceLastComeback > this.excitementSettings.comebackMinInterval;
          const isLeaderPhase = this.surgeTargetBias >= 0.5;
          const isTrailerPhase = this.surgeTargetBias < 0.5;
          const isInLeadGroup = relativePosition > 0.7;
          const isInTrailingGroup = relativePosition < 0.3;
          
          // Check for rare comeback opportunity (trailing horses during trailer phase)
          if (canComeback && isTrailerPhase && isInTrailingGroup && 
              Math.random() < this.excitementSettings.comebackChance && 
              !this.comebackActive && !this.breakawayActive) {
            
            horse.isComingBack = true;
            horse.comebackTimeLeft = this.excitementSettings.comebackDuration;
            horse.isSurging = true;
            horse.surgeTimeLeft = this.excitementSettings.comebackDuration; // Longer surge for comeback
            horse.targetSurgeIntensity = 1.0;
            
            this.comebackActive = true;
            this.lastComebackTime = this.raceTime;
          }
          // Check for rare breakaway opportunity (leader horses during leader phase)
          else if (canBreakaway && isLeaderPhase && isInLeadGroup && 
              Math.random() < this.excitementSettings.breakawayChance && 
              !this.breakawayActive && !this.comebackActive) {
            
            horse.isBreakingAway = true;
            horse.breakawayTimeLeft = this.excitementSettings.breakawayDuration;
            horse.isSurging = true;
            horse.surgeTimeLeft = this.excitementSettings.breakawayDuration; // Longer surge for breakaway
            horse.targetSurgeIntensity = 1.0;
            
            this.breakawayActive = true;
            this.lastBreakawayTime = this.raceTime;
          } else {
            // Normal surge
            horse.isSurging = true;
            horse.surgeTimeLeft = 400 + (Math.random() * 600); // 0.4-1.0 second surge
            horse.targetSurgeIntensity = 1.0; // Full surge target
          }
        }
      }
    });
  }

  // Pack effects - horses influence each other for tight racing
  calculatePackEffects() {
    this.horses.forEach(horse => {
      const nearbyHorses = this.horses.filter(other => 
        other.id !== horse.id && 
        Math.abs(other.position - horse.position) < 0.12 // Larger drafting range for tighter pack
      );
      
      if (nearbyHorses.length === 0) {
        // Lonely horses get slight penalty to encourage pack racing
        horse.packEffect = 0.95; 
        return;
      }
      
      const horsesAhead = nearbyHorses.filter(other => other.position > horse.position);
      const horsesBehind = nearbyHorses.filter(other => other.position < horse.position);
      
      // Strong slipstream effect - following horses get significant boost
      if (horsesAhead.length > 0) {
        horse.packEffect = 1.25; // 25% boost from slipstream (was 15%)
      }
      // Pack racing bonus - being in the middle of the pack is advantageous
      else if (nearbyHorses.length >= 2) {
        horse.packEffect = 1.15; // 15% boost for pack racing
      }
      // Side-by-side racing - boost for competitive racing
      else {
        horse.packEffect = 1.1; // 10% boost for competitive racing (was 5%)
      }
    });
  }

  // Update energy and fatigue for all horses
  updateHorseEnergy(deltaTime) {
    this.horses.forEach(horse => {
      // Calculate energy consumption based on current activity
      let energyDrain = this.excitementSettings.normalEnergyDrain;
      
      // Higher drain for special activities
      if (horse.isComingBack) {
        energyDrain = this.excitementSettings.comebackEnergyDrain;
      } else if (horse.isBreakingAway) {
        energyDrain = this.excitementSettings.breakawayEnergyDrain;
      } else if (horse.surgeIntensity > 0.3) {
        // Scale energy drain based on surge intensity
        const surgeMultiplier = 1 + (horse.surgeIntensity * 1.5); // Up to 2.5x drain
        energyDrain = this.excitementSettings.surgeEnergyDrain * surgeMultiplier;
      }
      
      // Apply energy drain (convert deltaTime from seconds to match drain rates)
      horse.energy -= energyDrain * (deltaTime / 1000);
      
      // Energy recovery when not in high-intensity activities
      if (horse.surgeIntensity < 0.2 && !horse.isBreakingAway && !horse.isComingBack) {
        let recovery = this.excitementSettings.energyRecovery;
        
        // Bonus recovery when drafting (following other horses)
        if (horse.packEffect > 1.1) { // Getting slipstream bonus
          recovery += this.excitementSettings.draftingEnergyBonus;
        }
        
        horse.energy += recovery * (deltaTime / 1000);
      }
      
      // Clamp energy between 0 and max
      horse.energy = Math.max(0, Math.min(horse.energy, horse.maxEnergy));
      
      // Update fatigue states
      const energyPercentage = horse.energy / horse.maxEnergy;
      horse.isFatigued = energyPercentage < 0.6; // Fatigued below 60%
      horse.isExhausted = energyPercentage < 0.2; // Exhausted below 20%
    });
  }

  // Final stretch creates dramatic finishes
  applyFinalStretchBoost() {
    const raceProgress = Math.max(...this.horses.map(h => h.position));
    
    // Final 20% of race - everyone gets speed boost
    if (raceProgress > 0.8) {
      const finalStretchIntensity = (raceProgress - 0.8) / 0.2; // 0 to 1
      this.horses.forEach(horse => {
        horse.finalStretchBoost = 1 + (finalStretchIntensity * (this.excitementSettings.finalStretchBoost - 1));
      });
    } else {
      this.horses.forEach(horse => {
        horse.finalStretchBoost = 1.0;
      });
    }
  }

  // Update individual horse position
  updateHorsePosition(horse, deltaTime) {
    // Get distance-based speed scaling
    const distanceScale = this.speedScaling[this.settings.distance] || 1.0;
    
    // Calculate target speed based on all effects
    let targetSpeed = this.excitementSettings.baseSpeed * distanceScale;
    
    // Apply gradual surge effect
    if (horse.surgeIntensity > 0) {
      const baseSpeed = this.excitementSettings.baseSpeed * distanceScale;
      let surgeSpeed;
      
      // Use higher speed for special moves
      if (horse.isComingBack) {
        surgeSpeed = this.excitementSettings.comebackSpeed * distanceScale; // Highest speed
      } else if (horse.isBreakingAway) {
        surgeSpeed = this.excitementSettings.breakawaySpeed * distanceScale; // High speed
      } else {
        surgeSpeed = this.excitementSettings.maxSurgeSpeed * distanceScale; // Normal surge speed
      }
      
      // Interpolate between base and surge speed based on intensity
      targetSpeed = baseSpeed + ((surgeSpeed - baseSpeed) * horse.surgeIntensity);
    }
    
    // Apply fatigue-based speed reduction
    const energyPercentage = horse.energy / horse.maxEnergy;
    let fatigueMultiplier = 1.0;
    
    if (energyPercentage > 0.8) {
      fatigueMultiplier = 1.0;      // Fresh (80-100% energy)
    } else if (energyPercentage > 0.6) {
      fatigueMultiplier = 0.95;     // Slightly tired (60-80% energy)
    } else if (energyPercentage > 0.4) {
      fatigueMultiplier = 0.85;     // Noticeably slower (40-60% energy)
    } else if (energyPercentage > 0.2) {
      fatigueMultiplier = 0.70;     // Very tired (20-40% energy)
    } else {
      fatigueMultiplier = 0.50;     // Exhausted (0-20% energy)
    }
    
    // Apply all multipliers
    targetSpeed *= (1 + horse.rubberBandForce); // Rubber band
    targetSpeed *= horse.packEffect;             // Pack dynamics  
    targetSpeed *= horse.finalStretchBoost;     // Final stretch
    targetSpeed *= fatigueMultiplier;           // Energy/fatigue impact
    
    // Add small random variation for natural movement
    targetSpeed *= (0.95 + Math.random() * 0.1); // ±5% variation
    
    // Smooth velocity changes for realistic movement
    const speedDiff = targetSpeed - horse.velocity;
    horse.velocity += speedDiff * 0.3; // 30% adjustment per frame
    
    // Apply velocity to position
    horse.position += horse.velocity * deltaTime;
    
    // Ensure no horse goes backwards
    horse.position = Math.max(horse.position, Math.max(...horse.recentPositionHistory) - 0.01);
  }

  // Track position history for overtaking detection
  trackPositionHistory(horse) {
    horse.recentPositionHistory.push(horse.position);
    if (horse.recentPositionHistory.length > 10) {
      horse.recentPositionHistory.shift(); // Keep last 10 positions
    }
  }

  // Get exciting commentary based on race state
  generateCommentary() {
    if (this.raceState !== 'racing') return null;
    
    const surgingHorses = this.horses.filter(h => h.surgeIntensity > 0.5);
    const breakawayHorses = this.horses.filter(h => h.isBreakingAway);
    const comebackHorses = this.horses.filter(h => h.isComingBack);
    const fatiguedHorses = this.horses.filter(h => h.isFatigued);
    const exhaustedHorses = this.horses.filter(h => h.isExhausted);
    const freshHorses = this.horses.filter(h => h.energy / h.maxEnergy > 0.8);
    const leader = this.horses.reduce((leader, horse) => 
      horse.position > leader.position ? horse : leader
    );
    
    // Calculate race tightness
    const positions = this.horses.map(h => h.position);
    const spread = Math.max(...positions) - Math.min(...positions);
    const raceProgress = Math.max(...positions);
    
    const comments = [];
    
    // Comeback commentary (highest priority - underdog story!)
    if (comebackHorses.length > 0) {
      const comebackNames = comebackHorses.map(h => h.name).join(' and ');
      comments.push(`${comebackNames} ${comebackHorses.length > 1 ? 'are' : 'is'} charging from the back!`);
      comments.push(`What a comeback attempt by ${comebackNames}!`);
      comments.push(`${comebackNames} ${comebackHorses.length > 1 ? 'are' : 'is'} flying through the field!`);
      comments.push(`The underdog ${comebackNames} ${comebackHorses.length > 1 ? 'are' : 'is'} making a move!`);
    }
    // Breakaway commentary
    else if (breakawayHorses.length > 0) {
      const breakawayNames = breakawayHorses.map(h => h.name).join(' and ');
      comments.push(`${breakawayNames} ${breakawayHorses.length > 1 ? 'are' : 'is'} making a break for it!`);
      comments.push(`${breakawayNames} ${breakawayHorses.length > 1 ? 'are' : 'is'} trying to escape the pack!`);
      comments.push(`Can anyone catch ${breakawayNames}?`);
    }
    // Regular surge commentary
    else if (surgingHorses.length > 0) {
      const surgingNames = surgingHorses.map(h => h.name).join(' and ');
      comments.push(`${surgingNames} ${surgingHorses.length > 1 ? 'are' : 'is'} making a powerful move!`);
      comments.push(`${surgingNames} ${surgingHorses.length > 1 ? 'are' : 'is'} surging forward with incredible speed!`);
      comments.push(`Look at ${surgingNames} go! ${surgingHorses.length > 1 ? 'They\'re' : 'That\'s'} a burst of pure acceleration!`);
      comments.push(`${surgingNames} ${surgingHorses.length > 1 ? 'have' : 'has'} found another gear!`);
      comments.push(`What a surge from ${surgingNames}! ${surgingHorses.length > 1 ? 'They\'re' : 'That\'s'} moving through the field!`);
    }
    
    // Tight race commentary
    if (spread < 0.05) {
      comments.push("The pack is running as one - this is incredibly tight!");
      comments.push("You could throw a blanket over the whole field!");
      comments.push("It's bumper to bumper racing out there!");
    } else if (spread < 0.08) {
      comments.push("The field is staying incredibly tight!");
      comments.push("No one can break away from this pack!");
    }
    
    // Final stretch drama
    if (raceProgress > 0.8) {
      comments.push("They're in the final stretch - anything can happen!");
      comments.push(`${leader.name} leads but the pack is charging hard!`);
    }
    
    // Fatigue-based commentary
    if (exhaustedHorses.length > 0) {
      const exhaustedNames = exhaustedHorses.map(h => h.name).join(' and ');
      comments.push(`${exhaustedNames} ${exhaustedHorses.length > 1 ? 'are' : 'is'} running on empty!`);
      comments.push(`${exhaustedNames} ${exhaustedHorses.length > 1 ? 'look' : 'looks'} completely spent!`);
      comments.push(`${exhaustedNames} ${exhaustedHorses.length > 1 ? 'are' : 'is'} gasping for breath!`);
      comments.push(`The tank is empty for ${exhaustedNames}!`);
      comments.push(`${exhaustedNames} ${exhaustedHorses.length > 1 ? 'are' : 'is'} struggling to maintain pace!`);
    } else if (fatiguedHorses.length > 0) {
      const fatiguedNames = fatiguedHorses.map(h => h.name).join(' and ');
      comments.push(`${fatiguedNames} ${fatiguedHorses.length > 1 ? 'are' : 'is'} starting to tire!`);
      comments.push(`I can see ${fatiguedNames} ${fatiguedHorses.length > 1 ? 'are' : 'is'} beginning to labor!`);
      comments.push(`${fatiguedNames} ${fatiguedHorses.length > 1 ? 'are' : 'is'} showing signs of fatigue!`);
      comments.push(`The pace is taking its toll on ${fatiguedNames}!`);
      comments.push(`${fatiguedNames} ${fatiguedHorses.length > 1 ? 'need' : 'needs'} to dig deep now!`);
    }
    
    // Fresh horse commentary (especially in late race)
    if (raceProgress > 0.6 && freshHorses.length > 0) {
      const freshNames = freshHorses.map(h => h.name).join(' and ');
      comments.push(`${freshNames} ${freshHorses.length > 1 ? 'are' : 'is'} still full of running!`);
      comments.push(`${freshNames} saved energy for the finish!`);
    }
    
    // Leader commentary
    if (raceProgress < 0.7) {
      if (leader.isFatigued) {
        comments.push(`${leader.name} leads but is showing signs of fatigue!`);
      } else {
        comments.push(`${leader.name} has the lead but it's anyone's race!`);
      }
    }
    
    // Individual horse surge/fatigue spotlights (occasional specific callouts)
    if (Math.random() < 0.3) { // 30% chance for individual spotlights
      const allHorses = [...this.horses];
      
      // Find individual horses worth mentioning
      const surgingHorse = allHorses.find(h => h.surgeIntensity > 0.7);
      const veryTiredHorse = allHorses.find(h => h.energy / h.maxEnergy < 0.3);
      const freshHorse = allHorses.find(h => h.energy / h.maxEnergy > 0.9 && raceProgress > 0.5);
      
      if (surgingHorse) {
        comments.push(`${surgingHorse.name} is putting in a massive surge right now!`);
        comments.push(`Watch ${surgingHorse.name} fly! What acceleration!`);
        comments.push(`${surgingHorse.name} has hit the turbo boost!`);
      }
      
      if (veryTiredHorse && !surgingHorse) {
        comments.push(`${veryTiredHorse.name} is really struggling out there!`);
        comments.push(`${veryTiredHorse.name} looks to be running on fumes!`);
        comments.push(`The early pace has caught up with ${veryTiredHorse.name}!`);
      }
      
      if (freshHorse && !surgingHorse && !veryTiredHorse) {
        comments.push(`${freshHorse.name} still looks fresh as a daisy!`);
        comments.push(`${freshHorse.name} has plenty left in the tank!`);
        comments.push(`${freshHorse.name} saved energy for this moment!`);
      }
    }
    
    // Default exciting commentary
    comments.push("The pace is blistering and positions keep changing!");
    comments.push("What an exciting race - no one wants to give an inch!");
    
    return comments[Math.floor(Math.random() * comments.length)];
  }

  // Start the exciting race
  startRace(settings = {}) {
    this.settings = settings;
    this.raceState = 'countdown';
    this.raceTime = 0;
    this.lastSurgeTime = 0;
    this.lastBreakawayTime = 0;
    this.breakawayActive = false;
    this.lastComebackTime = 0;
    this.comebackActive = false;
    this.surgeTargetBias = Math.random() < 0.5 ? 0 : 1; // Random starting bias
    
    // Reset all horses to starting positions
    this.horses.forEach(horse => {
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
      horse.energy = horse.maxEnergy; // Reset to full energy
      horse.isFatigued = false;
      horse.isExhausted = false;
      horse.recentPositionHistory = [0];
    });
    
    // Start countdown
    setTimeout(() => {
      this.raceState = 'racing';
    }, 3000);
  }

  // Get race data for UI
  getRaceData() {
    return {
      positions: this.horses.map(horse => horse.position),
      horses: this.horses,
      raceState: this.raceState,
      raceTime: this.raceTime,
      leader: this.horses.reduce((leader, horse) => 
        horse.position > leader.position ? horse : leader
      ),
      surgingHorses: this.horses.map(horse => horse.surgeIntensity > 0.3), // Only show as surging when intensity > 30%
      fatiguedHorses: this.horses.map(horse => horse.isFatigued), // Show fatigued horses
      exhaustedHorses: this.horses.map(horse => horse.isExhausted), // Show exhausted horses
      energyLevels: this.horses.map(horse => horse.energy / horse.maxEnergy), // Energy as percentage
      packSpread: Math.max(...this.horses.map(h => h.position)) - Math.min(...this.horses.map(h => h.position))
    };
  }

  // Reset the race
  reset() {
    this.raceState = 'waiting';
    this.raceTime = 0;
  }
}

// Export singleton instance
export const excitingRaceEngine = new ExcitingRaceEngine();