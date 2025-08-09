/**
 * EXPERIMENTAL RACING ENGINE
 * 
 * This is a completely redesigned racing logic system that can be easily
 * swapped with the original racing logic for experimentation.
 * 
 * Key features to experiment with:
 * - Physics-based movement
 * - Dynamic difficulty adjustment
 * - Enhanced horse characteristics
 * - New racing mechanics
 */

export class ExperimentalRaceEngine {
  constructor() {
    this.horses = [];
    this.raceState = 'waiting'; // waiting, countdown, racing, finished
    this.raceTime = 0;
    this.settings = {};
    this.physics = {
      gravity: 0.98,
      friction: 0.95,
      speedLimit: 0.08
    };
  }

  // Initialize horses - all equal, no differentiating stats
  initializeHorses(horseData) {
    this.horses = horseData.map((horse, index) => ({
      id: index,
      name: horse.name || `Horse ${index + 1}`,
      
      // All horses have identical base capabilities
      speed: 80,
      stamina: 80, 
      acceleration: 80,
      intelligence: 80,
      
      // Dynamic properties
      position: 0,
      velocity: 0,
      energy: 100,
      momentum: 0,
      
      // State tracking
      isCharged: false,
      isTired: false,
      lastBurst: 0,
      strategy: 'equal' // All horses use same strategy
    }));
  }

  // Assign racing strategies to horses
  assignStrategy() {
    const strategies = [
      'frontrunner',    // Fast start, consistent pace
      'closer',         // Slow start, strong finish
      'stalker',        // Mid-pack, tactical moves
      'sprinter',       // Burst speed at random times
      'endurance'       // Consistent pace, doesn't tire
    ];
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  // New physics-based position update system
  updatePositions(deltaTime) {
    if (this.raceState !== 'racing') return;

    this.raceTime += deltaTime;

    this.horses.forEach(horse => {
      // Strategy-based behavior
      const strategyForce = this.calculateStrategyForce(horse);
      
      // Physics calculations
      const acceleration = this.calculateAcceleration(horse, strategyForce);
      
      // Update velocity with physics
      horse.velocity += acceleration * deltaTime;
      horse.velocity *= this.physics.friction; // Apply friction
      horse.velocity = Math.min(horse.velocity, this.physics.speedLimit);
      
      // Update position
      horse.position += horse.velocity * deltaTime;
      
      // Update energy and momentum
      this.updateHorseState(horse, deltaTime);
    });

    // Check for race completion
    const winner = this.horses.find(horse => horse.position >= 1);
    if (winner && this.raceState === 'racing') {
      this.raceState = 'finished';
    }
  }

  // Calculate strategy-based force for each horse - all equal
  calculateStrategyForce(horse) {
    // All horses have equal force with small random variations for natural racing dynamics
    return 1.0 + (Math.random() - 0.5) * 0.1; // Random variation of ±5%
  }

  // Calculate acceleration based on horse stats and current state
  calculateAcceleration(horse, strategyForce) {
    const baseAccel = horse.acceleration / 1000;
    const speedFactor = (horse.speed / 100) * strategyForce;
    const energyFactor = horse.energy / 100;
    const crowdFactor = this.calculateCrowdEffect(horse);
    
    return baseAccel * speedFactor * energyFactor * crowdFactor;
  }

  // Calculate effect of being in a crowd (drafting/blocking)
  calculateCrowdEffect(horse) {
    const nearbyHorses = this.horses.filter(other => 
      other.id !== horse.id && 
      Math.abs(other.position - horse.position) < 0.1
    );

    if (nearbyHorses.length === 0) return 1.0;
    
    // Drafting effect: slight boost when behind others
    const horsesAhead = nearbyHorses.filter(other => other.position > horse.position);
    if (horsesAhead.length > 0) return 1.05; // 5% boost from drafting
    
    // Crowding effect: slight penalty when blocked
    return 0.98;
  }

  // Update horse energy, momentum, and special states
  updateHorseState(horse, deltaTime) {
    // Energy consumption based on effort
    const effort = Math.abs(horse.velocity) / this.physics.speedLimit;
    const energyDrain = effort * (100 - horse.stamina) / 100 * deltaTime * 2;
    horse.energy = Math.max(0, horse.energy - energyDrain);
    
    // Momentum building
    if (horse.velocity > horse.momentum) {
      horse.momentum += 0.1 * deltaTime;
    } else {
      horse.momentum *= 0.99;
    }
    
    // Special state updates
    horse.isCharged = horse.momentum > 0.5 && horse.energy > 70;
    horse.isTired = horse.energy < 30;
  }

  // Get current race data for UI
  getRaceData() {
    return {
      positions: this.horses.map(horse => horse.position),
      horses: this.horses,
      raceState: this.raceState,
      raceTime: this.raceTime,
      leader: this.horses.reduce((leader, horse) => 
        horse.position > leader.position ? horse : leader
      ),
      // New data for enhanced UI
      energyLevels: this.horses.map(horse => horse.energy),
      specialStates: this.horses.map(horse => ({
        isCharged: horse.isCharged,
        isTired: horse.isTired,
        strategy: horse.strategy
      }))
    };
  }

  // Start the experimental race
  startRace(settings = {}) {
    this.settings = {
      distance: settings.distance || 'medium',
      weather: settings.weather || null,
      ...settings
    };
    
    this.raceState = 'countdown';
    this.raceTime = 0;
    
    // Reset all horses
    this.horses.forEach(horse => {
      horse.position = 0;
      horse.velocity = 0;
      horse.energy = 100;
      horse.momentum = 0;
      horse.lastBurst = 0;
    });
    
    // Start countdown
    setTimeout(() => {
      this.raceState = 'racing';
    }, 3000);
  }

  // Utility function
  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Get detailed commentary based on equal racing mechanics
  generateCommentary() {
    if (this.raceState !== 'racing') return null;
    
    const leader = this.horses.reduce((leader, horse) => 
      horse.position > leader.position ? horse : leader
    );
    
    const chargedHorses = this.horses.filter(horse => horse.isCharged);
    const tiredHorses = this.horses.filter(horse => horse.isTired);
    
    // Calculate race tightness
    const positions = this.horses.map(h => h.position);
    const maxPos = Math.max(...positions);
    const minPos = Math.min(...positions);
    const gap = maxPos - minPos;
    
    const comments = [];
    
    if (gap < 0.1) {
      comments.push("It's an incredibly tight race with all horses neck and neck!");
      comments.push("The pack is running as one - anyone could win this!");
    }
    
    if (chargedHorses.length > 0) {
      comments.push(`${chargedHorses[0].name} is building tremendous momentum!`);
    }
    
    if (tiredHorses.length > 0) {
      comments.push(`${tiredHorses[0].name} is showing signs of fatigue...`);
    }
    
    comments.push(`${leader.name} has a slight edge in this equal field!`);
    comments.push("With all horses equally matched, it's pure determination that counts!");
    
    return comments[Math.floor(Math.random() * comments.length)];
  }
}

// Export singleton instance
export const experimentalRaceEngine = new ExperimentalRaceEngine();