import React, { useState, useEffect, useCallback } from "react";
import { INVENTORY_ITEMS, inventoryUtils } from "../utils/inventoryItems";
import ItemSelectionModal from "./ItemSelectionModal";

const MAZE_SIZE = 12;
const CELL_EMPTY = 0;
const CELL_WALL = 1;
const CELL_REWARD = 2;
const CELL_TRAP = 3;
const CELL_START = 4;
const CELL_POWERUP = 5;
const CELL_MOVING_WALL = 6;
const CELL_ONEWAY_N = 7;
const CELL_ONEWAY_S = 8;
const CELL_ONEWAY_E = 9;
const CELL_ONEWAY_W = 10;
const CELL_PORTAL_A = 11;
const CELL_PORTAL_B = 12;
const CELL_DARK_ZONE = 13;
const CELL_VAULT = 14;
const CELL_KEY = 15;

const REWARDS = [
  { name: 'Golden Apple', emoji: '🍎', rarity: 0.3 },
  { name: 'Silver Coin', emoji: '🪙', rarity: 0.4 },
  { name: 'Magic Carrot', emoji: '🥕', rarity: 0.2 },
  { name: 'Crystal Gem', emoji: '💎', rarity: 0.1 },
  { name: 'Hay Bundle', emoji: '🌾', rarity: 0.5 },
  { name: 'Lucky Horseshoe', emoji: '🍀', rarity: 0.15 }
];

const TRAPS = [
  { name: 'Pit Trap', emoji: '🕳️' },
  { name: 'Spike Trap', emoji: '⚡' },
  { name: 'Bear Trap', emoji: '🪤' },
  { name: 'Poison Dart', emoji: '💉' }
];

const POWERUPS = [
  { name: 'Speed Boost Potion', emoji: '⚡', rarity: 0.3, effect: 'speed', duration: 5 },
  { name: 'Invisibility Cloak', emoji: '👻', rarity: 0.2, effect: 'invisibility', duration: 8 },
  { name: 'Teleport Scroll', emoji: '🌀', rarity: 0.15, effect: 'teleport', duration: 1 },
  { name: 'Wall Breaker Hammer', emoji: '🔨', rarity: 0.1, effect: 'wallbreaker', duration: 3 },
  { name: 'Minotaur Stun Bomb', emoji: '💣', rarity: 0.15, effect: 'stun', duration: 6 },
  { name: 'Treasure Magnet', emoji: '🧲', rarity: 0.25, effect: 'magnet', duration: 4 }
];

const MAZE_TYPES = {
  standard: {
    name: 'Standard Maze',
    description: 'Classic maze with all basic features',
    difficulty: 1,
    unlocked: true,
    mechanics: ['Moving walls', 'One-way doors', 'Portals', 'Dark zones', 'Vaults & keys']
  },
  pyramid: {
    name: 'Pyramid Maze',
    description: 'Multi-level maze with ramps connecting floors',
    difficulty: 2,
    unlocked: false,
    researchCost: 25,
    researchCategory: 'architectural',
    mechanics: ['3D movement', 'Ramps up/down', 'Level-based treasures']
  },
  cave: {
    name: 'Cave Maze',
    description: 'Natural caverns with stalactites and underground rivers',
    difficulty: 2,
    unlocked: false,
    researchCost: 30,
    researchCategory: 'environmental',
    mechanics: ['Natural obstacles', 'Underground streams', 'Crystal formations']
  },
  temporal: {
    name: 'Temporal Maze',
    description: 'Time flows differently in various sections',
    difficulty: 3,
    unlocked: false,
    researchCost: 40,
    researchCategory: 'temporal',
    mechanics: ['Time zones', 'Slow/fast areas', 'Temporal echoes']
  },
  random: {
    name: 'Chaos Maze',
    description: 'Layout shifts and changes unpredictably',
    difficulty: 3,
    unlocked: false,
    researchCost: 35,
    researchCategory: 'chaos',
    mechanics: ['Shifting walls', 'Probability zones', 'Unstable terrain']
  },
  gear: {
    name: 'Clockwork Maze',
    description: 'Mechanical maze with rotating sections',
    difficulty: 4,
    unlocked: false,
    researchCost: 50,
    researchCategory: 'architectural',
    mechanics: ['Rotating sections', 'Gear mechanisms', 'Timed passages']
  },
  flooded: {
    name: 'Flooded Maze',
    description: 'Partially underwater with air pockets',
    difficulty: 4,
    unlocked: false,
    researchCost: 60,
    researchCategory: 'environmental',
    mechanics: ['Water levels', 'Swimming required', 'Air pocket safe zones']
  },
  phase: {
    name: 'Phase Maze',
    description: 'Ethereal walls that phase in and out of reality',
    difficulty: 5,
    unlocked: false,
    researchCost: 100,
    researchCategory: 'architectural',
    mechanics: ['Phasing walls', 'Reality shifts', 'Ethereal passages']
  }
};

const RESEARCH_TREE = {
  architectural: {
    name: 'Architectural Research',
    color: 'blue',
    description: 'Study advanced construction techniques',
    mazes: ['pyramid', 'gear', 'phase']
  },
  environmental: {
    name: 'Environmental Research', 
    color: 'green',
    description: 'Explore natural and elemental mazes',
    mazes: ['cave', 'flooded']
  },
  temporal: {
    name: 'Temporal Research',
    color: 'purple', 
    description: 'Investigate time-based phenomena',
    mazes: ['temporal']
  },
  chaos: {
    name: 'Chaos Research',
    color: 'red',
    description: 'Embrace unpredictability and randomness', 
    mazes: ['random']
  }
};

const SKILL_TREE = {
  survival: {
    name: 'Survival',
    color: 'green',
    skills: {
      trapSense: { name: 'Trap Sense', emoji: '👁️', maxLevel: 5, cost: (level) => level * 2, description: 'Chance to avoid traps' },
      thickSkin: { name: 'Thick Skin', emoji: '🛡️', maxLevel: 3, cost: (level) => level * 3, description: 'Survive one extra trap hit' },
      lucky: { name: 'Lucky', emoji: '🍀', maxLevel: 5, cost: (level) => level * 2, description: 'Better reward quality' }
    }
  },
  mobility: {
    name: 'Mobility',
    color: 'blue',
    skills: {
      swiftness: { name: 'Swiftness', emoji: '💨', maxLevel: 5, cost: (level) => level * 2, description: 'Increased movement speed' },
      pathfinding: { name: 'Pathfinding', emoji: '🧭', maxLevel: 3, cost: (level) => level * 4, description: 'Smarter movement choices' },
      wallWalking: { name: 'Wall Walking', emoji: '🕷️', maxLevel: 1, cost: () => 10, description: 'Permanent wall breaking' },
      swimming: { name: 'Swimming', emoji: '🏊', maxLevel: 3, cost: (level) => level * 3, description: 'Move faster through water' },
      climbing: { name: 'Climbing', emoji: '🧗', maxLevel: 3, cost: (level) => level * 3, description: 'Navigate ramps and levels easier' }
    }
  },
  magic: {
    name: 'Magic',
    color: 'purple',
    skills: {
      powerupMagnet: { name: 'Power-up Magnet', emoji: '🔮', maxLevel: 3, cost: (level) => level * 3, description: 'Attract power-ups from distance' },
      enhancement: { name: 'Enhancement', emoji: '✨', maxLevel: 5, cost: (level) => level * 2, description: 'Power-up effects last longer' },
      teleportMastery: { name: 'Teleport Mastery', emoji: '🌟', maxLevel: 3, cost: (level) => level * 4, description: 'Control teleport destination' },
      timeResistance: { name: 'Time Resistance', emoji: '⏰', maxLevel: 3, cost: (level) => level * 4, description: 'Resist temporal effects' }
    }
  },
  stealth: {
    name: 'Stealth',
    color: 'gray',
    skills: {
      sneaking: { name: 'Sneaking', emoji: '🤫', maxLevel: 5, cost: (level) => level * 2, description: 'Minotaur moves slower' },
      distraction: { name: 'Distraction', emoji: '🎭', maxLevel: 3, cost: (level) => level * 3, description: 'Confuse minotaur occasionally' },
      ghostForm: { name: 'Ghost Form', emoji: '👻', maxLevel: 1, cost: () => 15, description: 'Rare chance to phase through minotaur' }
    }
  }
};

function HorseMazeGame({ onBack, selectedHorse, onHorseReturn }) {
  const [maze, setMaze] = useState([]);
  const [horsePos, setHorsePos] = useState({ x: 1, y: 1 });
  const [minotaurPos, setMinotaurPos] = useState({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
  const [inventory, setInventory] = useState([]);
  const [horseInventory, setHorseInventory] = useState(selectedHorse?.inventory || []);
  const [collectedItemsThisRun, setCollectedItemsThisRun] = useState([]);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [availableKeys, setAvailableKeys] = useState(() => {
    // Initialize with keys from horse's existing inventory
    const initialKeys = inventoryUtils.getItemCount(selectedHorse?.inventory || [], 'key');
    console.log('🔍 Initializing labyrinth with horse keys:', initialKeys, 'from inventory:', selectedHorse?.inventory);
    return initialKeys;
  });

  // Debug when selectedHorse changes
  useEffect(() => {
    console.log('🐎 Labyrinth - selectedHorse prop changed:', selectedHorse);
    console.log('🎒 Labyrinth - Horse inventory from prop:', selectedHorse?.inventory);
    if (selectedHorse?.inventory) {
      const keyCount = inventoryUtils.getItemCount(selectedHorse.inventory, 'key');
      console.log('🗝️ Labyrinth - Keys counted in inventory:', keyCount);
      setAvailableKeys(keyCount);
    }
  }, [selectedHorse]);

  const [gameState, setGameState] = useState('waiting');
  const [currentRewards, setCurrentRewards] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(800);
  const [totalRuns, setTotalRuns] = useState(0);
  const [lastTrap, setLastTrap] = useState(null);
  const [endReason, setEndReason] = useState('');
  
  // Power-up states
  const [activePowerups, setActivePowerups] = useState([]);
  const [minotaurStunned, setMinotaurStunned] = useState(0);
  const [minotaurLostTrack, setMinotaurLostTrack] = useState(0);
  const [horseMoveCount, setHorseMoveCount] = useState(0);
  
  // Advanced maze features
  const [movingWalls, setMovingWalls] = useState([]);
  const [portals, setPortals] = useState({ A: null, B: null });
  const [darkZones, setDarkZones] = useState([]);
  const [vaultKeys, setVaultKeys] = useState([]);
  const [collectedKeys, setCollectedKeys] = useState([]);
  const [visionRange] = useState(2);
  
  // Research system
  const [researchPoints, setResearchPoints] = useState(0);
  const [unlockedMazes, setUnlockedMazes] = useState({ standard: true });
  const [selectedMazeType, setSelectedMazeType] = useState('standard');
  const [showResearchTree, setShowResearchTree] = useState(false);
  
  // Maze-specific features
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(1);
  const [waterCells, setWaterCells] = useState([]);
  const [rotatingGears, setRotatingGears] = useState([]);
  const [timeZones, setTimeZones] = useState([]);
  const [phasingWalls, setPhasingWalls] = useState([]);
  
  // Skill system
  const [skillPoints, setSkillPoints] = useState(0);
  const [skills, setSkills] = useState({
    trapSense: 0, thickSkin: 0, lucky: 0,
    swiftness: 0, pathfinding: 0, wallWalking: 0, swimming: 0, climbing: 0,
    powerupMagnet: 0, enhancement: 0, teleportMastery: 0, timeResistance: 0,
    sneaking: 0, distraction: 0, ghostForm: 0
  });
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [trapHits, setTrapHits] = useState(0);

  // Generate maze based on selected type
  const generateMaze = useCallback(() => {
    const newMaze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(CELL_WALL));
    
    function carvePassage(x, y) {
      newMaze[y][x] = CELL_EMPTY;
      
      const directions = [
        [0, -2], [2, 0], [0, 2], [-2, 0]
      ].sort(() => Math.random() - 0.5);
      
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx > 0 && nx < MAZE_SIZE - 1 && ny > 0 && ny < MAZE_SIZE - 1 && newMaze[ny][nx] === CELL_WALL) {
          newMaze[y + dy/2][x + dx/2] = CELL_EMPTY;
          carvePassage(nx, ny);
        }
      }
    }
    
    carvePassage(1, 1);
    newMaze[1][1] = CELL_START;
    
    // Ensure minotaur starting position is accessible
    carvePassage(MAZE_SIZE - 2, MAZE_SIZE - 2);
    
    // Reset maze-specific features
    const newMovingWalls = [];
    const newDarkZones = [];
    const newVaultKeys = [];
    const newWaterCells = [];
    const newRotatingGears = [];
    const newTimeZones = [];
    const newPhasingWalls = [];
    let portalA = null;
    let portalB = null;
    
    // Add features based on maze type
    const mazeType = MAZE_TYPES[selectedMazeType];
    
    for (let y = 1; y < MAZE_SIZE - 1; y++) {
      for (let x = 1; x < MAZE_SIZE - 1; x++) {
        if (newMaze[y][x] === CELL_EMPTY) {
          const rand = Math.random();
          
          // Base features (all maze types) - these take priority
          if (rand < 0.15) {
            newMaze[y][x] = CELL_REWARD;
          } else if (rand < 0.25) {
            newMaze[y][x] = CELL_TRAP;
          } else if (rand < 0.32) {
            newMaze[y][x] = CELL_POWERUP;
          } else if (rand < 0.38) {
            newMaze[y][x] = CELL_KEY;
            newVaultKeys.push({ x, y, id: Math.random().toString(36).substr(2, 9) });
          } else if (rand < 0.42 && newVaultKeys.length > 0) {
            newMaze[y][x] = CELL_VAULT;
          } else {
            // Only add maze-specific features if no base feature was placed
            // Maze-type specific features
            if (selectedMazeType === 'standard' || selectedMazeType === 'pyramid' || selectedMazeType === 'cave') {
              if (rand < 0.48) {
                newMaze[y][x] = CELL_MOVING_WALL;
                newMovingWalls.push({ x, y, closed: true, timer: Math.floor(Math.random() * 6) + 2 });
              } else if (rand < 0.52) {
                const directions = [CELL_ONEWAY_N, CELL_ONEWAY_S, CELL_ONEWAY_E, CELL_ONEWAY_W];
                newMaze[y][x] = directions[Math.floor(Math.random() * directions.length)];
              } else if (rand < 0.54 && !portalA) {
                newMaze[y][x] = CELL_PORTAL_A;
                portalA = { x, y };
              } else if (rand < 0.56 && portalA && !portalB) {
                newMaze[y][x] = CELL_PORTAL_B;
                portalB = { x, y };
              } else if (rand < 0.58) {
                newMaze[y][x] = CELL_DARK_ZONE;
                newDarkZones.push({ x, y });
              }
            }
            
            // Flooded maze - add water cells
            if (selectedMazeType === 'flooded' && rand < 0.5) {
              newWaterCells.push({ x, y });
            }
            
            // Gear maze - add rotating sections
            if (selectedMazeType === 'gear' && rand < 0.6) {
              newRotatingGears.push({ x, y, rotation: 0, timer: 5 });
            }
            
            // Temporal maze - add time zones
            if (selectedMazeType === 'temporal' && rand < 0.65) {
              newTimeZones.push({ x, y, type: Math.random() < 0.5 ? 'slow' : 'fast' });
            }
            
            // Phase maze - add phasing walls
            if (selectedMazeType === 'phase' && rand < 0.7) {
              newPhasingWalls.push({ x, y, solid: true, timer: Math.floor(Math.random() * 8) + 3 });
            }
          }
        }
      }
    }
    
    // Update state for all maze features
    setMovingWalls(newMovingWalls);
    setPortals({ A: portalA, B: portalB });
    setDarkZones(newDarkZones);
    setVaultKeys(newVaultKeys);
    setWaterCells(newWaterCells);
    setRotatingGears(newRotatingGears);
    setTimeZones(newTimeZones);
    setPhasingWalls(newPhasingWalls);
    
    // Set level limits based on maze type
    if (selectedMazeType === 'pyramid') {
      setMaxLevel(3);
      setCurrentLevel(1);
    } else {
      setMaxLevel(1);
      setCurrentLevel(1);
    }
    
    return newMaze;
  }, [selectedMazeType]);

  // Initialize maze
  useEffect(() => {
    setMaze(generateMaze());
  }, [generateMaze]);

  // Update moving walls
  const updateMovingWalls = useCallback(() => {
    setMovingWalls(prev => prev.map(wall => {
      const newTimer = wall.timer - 1;
      if (newTimer <= 0) {
        return { ...wall, closed: !wall.closed, timer: Math.floor(Math.random() * 4) + 3 };
      }
      return { ...wall, timer: newTimer };
    }));
  }, []);

  // Check if cell is passable
  const isCellPassable = useCallback((x, y, fromX, fromY, maze) => {
    if (x <= 0 || x >= MAZE_SIZE - 1 || y <= 0 || y >= MAZE_SIZE - 1) return false;
    
    const cell = maze[y][x];
    
    const movingWall = movingWalls.find(w => w.x === x && w.y === y);
    if (movingWall && movingWall.closed) return false;
    
    if (cell === CELL_ONEWAY_N && fromY >= y) return false;
    if (cell === CELL_ONEWAY_S && fromY <= y) return false;
    if (cell === CELL_ONEWAY_E && fromX <= x) return false;
    if (cell === CELL_ONEWAY_W && fromX >= x) return false;
    
    if (cell === CELL_WALL) return false;
    
    return true;
  }, [movingWalls]);

  // Research system functions
  const canResearchMaze = useCallback((mazeKey) => {
    const maze = MAZE_TYPES[mazeKey];
    return !maze.unlocked && !unlockedMazes[mazeKey] && researchPoints >= maze.researchCost;
  }, [researchPoints, unlockedMazes]);
  
  const researchMaze = useCallback((mazeKey) => {
    if (!canResearchMaze(mazeKey)) return;
    
    const maze = MAZE_TYPES[mazeKey];
    setResearchPoints(prev => prev - maze.researchCost);
    setUnlockedMazes(prev => ({ ...prev, [mazeKey]: true }));
  }, [canResearchMaze]);

  // Check if cell is visible (always visible now - no fog of war)
  const isCellVisible = useCallback(() => {
    return true; // Always visible for more exciting gameplay
  }, []);

  // Skill system functions
  const getSkillLevel = useCallback((skillName) => skills[skillName] || 0, [skills]);
  
  const canUpgradeSkill = useCallback((categoryKey, skillKey) => {
    const skill = SKILL_TREE[categoryKey].skills[skillKey];
    const currentLevel = getSkillLevel(skillKey);
    const cost = skill.cost(currentLevel + 1);
    return currentLevel < skill.maxLevel && skillPoints >= cost;
  }, [skillPoints, getSkillLevel]);
  
  const upgradeSkill = useCallback((categoryKey, skillKey) => {
    if (!canUpgradeSkill(categoryKey, skillKey)) return;
    
    const skill = SKILL_TREE[categoryKey].skills[skillKey];
    const currentLevel = getSkillLevel(skillKey);
    const cost = skill.cost(currentLevel + 1);
    
    setSkills(prev => ({ ...prev, [skillKey]: currentLevel + 1 }));
    setSkillPoints(prev => prev - cost);
  }, [canUpgradeSkill, getSkillLevel]);

  // Update power-up durations
  const updatePowerups = useCallback(() => {
    const enhancement = getSkillLevel('enhancement');
    const enhancementBonus = enhancement * 0.2;
    
    setActivePowerups(prev => prev.map(p => {
      if (Math.random() < enhancementBonus) return p;
      return { ...p, duration: p.duration - 1 };
    }).filter(p => p.duration > 0));
    
    setMinotaurStunned(prev => Math.max(0, prev - 1));
    setMinotaurLostTrack(prev => Math.max(0, prev - 1));
  }, [getSkillLevel]);

  // Check if horse has a specific power-up active
  const hasPowerup = useCallback((effect) => {
    return activePowerups.some(p => p.effect === effect);
  }, [activePowerups]);

  // Use power-up effects
  const usePowerup = useCallback((powerup) => {
    switch (powerup.effect) {
      case 'teleport':
        const emptyCells = [];
        for (let y = 1; y < MAZE_SIZE - 1; y++) {
          for (let x = 1; x < MAZE_SIZE - 1; x++) {
            if (maze[y] && maze[y][x] !== CELL_WALL && (x !== minotaurPos.x || y !== minotaurPos.y)) {
              emptyCells.push({ x, y });
            }
          }
        }
        if (emptyCells.length > 0) {
          const teleportMastery = getSkillLevel('teleportMastery');
          let newPos;
          
          if (teleportMastery > 0 && Math.random() < teleportMastery * 0.3) {
            const sortedCells = emptyCells.sort((a, b) => {
              const distA = Math.abs(a.x - minotaurPos.x) + Math.abs(a.y - minotaurPos.y);
              const distB = Math.abs(b.x - minotaurPos.x) + Math.abs(b.y - minotaurPos.y);
              return distB - distA;
            });
            newPos = sortedCells[0];
          } else {
            newPos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          }
          setHorsePos(newPos);
        }
        break;
      
      case 'invisibility':
        setMinotaurLostTrack(powerup.duration);
        break;
      
      case 'stun':
        setMinotaurStunned(powerup.duration);
        break;
      
      case 'speed':
      case 'wallbreaker':
      case 'magnet':
        setActivePowerups(prev => [...prev, { ...powerup }]);
        break;
    }
  }, [maze, minotaurPos, getSkillLevel]);

  // Collect nearby treasures with magnet
  const collectWithMagnet = useCallback(() => {
    const baseMagnetRange = hasPowerup('magnet') ? 2 : 0;
    const powerupMagnetLevel = getSkillLevel('powerupMagnet');
    const totalRange = baseMagnetRange + (powerupMagnetLevel > 0 ? 1 : 0);
    
    if (totalRange === 0) return;
    
    const { x: hx, y: hy } = horsePos;
    
    for (let dy = -totalRange; dy <= totalRange; dy++) {
      for (let dx = -totalRange; dx <= totalRange; dx++) {
        const nx = hx + dx;
        const ny = hy + dy;
        
        if (nx > 0 && nx < MAZE_SIZE - 1 && ny > 0 && ny < MAZE_SIZE - 1 && 
            maze[ny] && (maze[ny][nx] === CELL_REWARD || 
            (maze[ny][nx] === CELL_POWERUP && powerupMagnetLevel > 0))) {
          
          if (maze[ny][nx] === CELL_REWARD) {
            const lucky = getSkillLevel('lucky');
            const betterRewards = REWARDS.filter(r => r.rarity <= 0.3 + lucky * 0.1);
            const reward = betterRewards[Math.floor(Math.random() * betterRewards.length)] || REWARDS[0];
            setCurrentRewards(prev => [...prev, reward]);
          } else if (maze[ny][nx] === CELL_POWERUP) {
            const powerup = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
            usePowerup(powerup);
          }
          
          setMaze(prevMaze => {
            const newMaze = prevMaze.map(row => [...row]);
            newMaze[ny][nx] = CELL_EMPTY;
            return newMaze;
          });
        }
      }
    }
  }, [hasPowerup, getSkillLevel, horsePos, maze, usePowerup]);

  // Pathfinding for minotaur
  const findPathToHorse = useCallback((minotaurX, minotaurY, horseX, horseY) => {
    if (minotaurLostTrack > 0) {
      const directions = [
        { x: minotaurX - 1, y: minotaurY },
        { x: minotaurX + 1, y: minotaurY },
        { x: minotaurX, y: minotaurY - 1 },
        { x: minotaurX, y: minotaurY + 1 }
      ];
      
      const validMoves = directions.filter(pos => 
        isCellPassable(pos.x, pos.y, minotaurX, minotaurY, maze)
      );
      
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        return [randomMove];
      }
      return [];
    }
    
    const queue = [{ x: minotaurX, y: minotaurY, path: [] }];
    const visited = new Set();
    visited.add(`${minotaurX},${minotaurY}`);
    
    while (queue.length > 0) {
      const { x, y, path } = queue.shift();
      
      if (x === horseX && y === horseY) {
        return path;
      }
      
      const directions = [
        { x: x - 1, y, dir: 'left' },
        { x: x + 1, y, dir: 'right' },
        { x, y: y - 1, dir: 'up' },
        { x, y: y + 1, dir: 'down' }
      ];
      
      for (const next of directions) {
        const key = `${next.x},${next.y}`;
        if (isCellPassable(next.x, next.y, x, y, maze) && !visited.has(key)) {
          visited.add(key);
          queue.push({
            x: next.x,
            y: next.y,
            path: [...path, { x: next.x, y: next.y }]
          });
        }
      }
    }
    
    return [];
  }, [maze, minotaurLostTrack, isCellPassable]);

  // Move minotaur towards horse
  const moveMinotaur = useCallback(() => {
    if (gameState !== 'exploring' || minotaurStunned > 0) return;
    
    const sneaking = getSkillLevel('sneaking');
    if (sneaking > 0 && Math.random() < sneaking * 0.15) {
      return;
    }
    
    const distraction = getSkillLevel('distraction');
    if (distraction > 0 && Math.random() < distraction * 0.1) {
      setMinotaurLostTrack(3);
    }
    
    setMinotaurPos(prevPos => {
      const { x: mx, y: my } = prevPos;
      const { x: hx, y: hy } = horsePos;
      
      const ghostForm = getSkillLevel('ghostForm');
      if (mx === hx && my === hy && ghostForm > 0 && Math.random() < 0.1) {
        return prevPos;
      }
      
      if (mx === hx && my === hy) {
        setEndReason('minotaur');
        setGameState('ended');
        setInventory(prev => [...prev, ...currentRewards]);
        // Award points based on performance and maze difficulty
        const basePoints = Math.floor(currentRewards.length / 2) + 1;
        const difficultyBonus = MAZE_TYPES[selectedMazeType].difficulty;
        const skillPointsEarned = basePoints;
        const researchPointsEarned = Math.floor(basePoints * difficultyBonus * 0.5);
        setSkillPoints(prev => prev + skillPointsEarned);
        setResearchPoints(prev => prev + researchPointsEarned);
        return prevPos;
      }
      
      const path = findPathToHorse(mx, my, hx, hy);
      if (path.length > 0) {
        const nextStep = path[0];
        
        if (nextStep.x === hx && nextStep.y === hy) {
          if (ghostForm > 0 && Math.random() < 0.1) {
            return prevPos;
          }
          setEndReason('minotaur');
          setGameState('ended');
          setInventory(prev => [...prev, ...currentRewards]);
          const basePoints = Math.floor(currentRewards.length / 2) + 1;
          const difficultyBonus = MAZE_TYPES[selectedMazeType].difficulty;
          const skillPointsEarned = basePoints;
          const researchPointsEarned = Math.floor(basePoints * difficultyBonus * 0.5);
          setSkillPoints(prev => prev + skillPointsEarned);
          setResearchPoints(prev => prev + researchPointsEarned);
          return { x: nextStep.x, y: nextStep.y };
        }
        
        return { x: nextStep.x, y: nextStep.y };
      }
      
      return prevPos;
    });
  }, [gameState, horsePos, findPathToHorse, currentRewards, minotaurStunned, getSkillLevel]);

  // Horse movement logic
  const moveHorse = useCallback(() => {
    if (gameState !== 'exploring') return;

    setHorseMoveCount(prev => prev + 1);
    updatePowerups();
    updateMovingWalls();
    collectWithMagnet();

    setHorsePos(prevPos => {
      const { x, y } = prevPos;
      let possibleMoves = [
        { x: x - 1, y, dir: 'left' },
        { x: x + 1, y, dir: 'right' },
        { x, y: y - 1, dir: 'up' },
        { x, y: y + 1, dir: 'down' }
      ];

      const wallWalking = getSkillLevel('wallWalking');
      if (hasPowerup('wallbreaker') || wallWalking > 0) {
        possibleMoves = possibleMoves.filter(move => 
          move.x > 0 && move.x < MAZE_SIZE - 1 && 
          move.y > 0 && move.y < MAZE_SIZE - 1
        );
      } else {
        possibleMoves = possibleMoves.filter(move => 
          isCellPassable(move.x, move.y, x, y, maze)
        );
      }

      const pathfinding = getSkillLevel('pathfinding');
      if (pathfinding > 0 && possibleMoves.length > 1) {
        possibleMoves.sort((a, b) => {
          const distA = Math.abs(a.x - minotaurPos.x) + Math.abs(a.y - minotaurPos.y);
          const distB = Math.abs(b.x - minotaurPos.x) + Math.abs(b.y - minotaurPos.y);
          return distB - distA;
        });
        
        if (Math.random() < pathfinding * 0.3) {
          possibleMoves = possibleMoves.slice(0, 1);
        }
      }

      if (possibleMoves.length === 0) return prevPos;

      const nextMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const cell = maze[nextMove.y] ? maze[nextMove.y][nextMove.x] : CELL_EMPTY;

      // Handle portal teleportation
      if (cell === CELL_PORTAL_A && portals.B) {
        setHorsePos({ x: portals.B.x, y: portals.B.y });
        return prevPos;
      } else if (cell === CELL_PORTAL_B && portals.A) {
        setHorsePos({ x: portals.A.x, y: portals.A.y });
        return prevPos;
      }

      // Handle cell interactions
      if (cell === CELL_REWARD) {
        const lucky = getSkillLevel('lucky');
        const betterRewards = REWARDS.filter(r => r.rarity <= 0.3 + lucky * 0.1);
        const reward = betterRewards[Math.floor(Math.random() * betterRewards.length)] || REWARDS[0];
        setCurrentRewards(prev => [...prev, reward]);
        
        // Add treasure to collected items
        setCollectedItemsThisRun(prev => [...prev, INVENTORY_ITEMS.treasure]);
        
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
          return newMaze;
        });
      } else if (cell === CELL_POWERUP) {
        const powerup = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
        usePowerup(powerup);
        
        // Add power-up to collected items
        setCollectedItemsThisRun(prev => [...prev, INVENTORY_ITEMS.powerup]);
        
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
          return newMaze;
        });
      } else if (cell === CELL_KEY) {
        const key = vaultKeys.find(k => k.x === nextMove.x && k.y === nextMove.y);
        if (key) {
          setCollectedKeys(prev => [...prev, key.id]);
          // Add key to collected items
          setCollectedItemsThisRun(prev => [...prev, INVENTORY_ITEMS.key]);
          // Increment available keys for vault usage
          setAvailableKeys(prev => prev + 1);
          setMaze(prevMaze => {
            const newMaze = prevMaze.map(row => [...row]);
            newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
            return newMaze;
          });
        }
      } else if (cell === CELL_VAULT) {
        if (collectedKeys.length > 0 && availableKeys > 0) {
          const legendaryRewards = [
            { name: 'Ancient Treasure', emoji: '👑', rarity: 0.05 },
            { name: 'Dragon Egg', emoji: '🥚', rarity: 0.03 },
            { name: 'Sacred Relic', emoji: '🏺', rarity: 0.04 }
          ];
          const reward = legendaryRewards[Math.floor(Math.random() * legendaryRewards.length)];
          setCurrentRewards(prev => [...prev, reward]);
          setCollectedKeys(prev => prev.slice(1));
          
          // Consume a key
          setAvailableKeys(prev => prev - 1);
          
          // Remove key from appropriate source (prefer collected items first)
          const keysCollectedThisRun = collectedItemsThisRun.filter(item => item.id === 'key').length;
          if (keysCollectedThisRun > 0) {
            // Remove one key from collected items
            setCollectedItemsThisRun(prev => {
              const keyIndex = prev.findIndex(item => item.id === 'key');
              if (keyIndex !== -1) {
                return prev.filter((_, index) => index !== keyIndex);
              }
              return prev;
            });
          } else {
            // Remove one key from horse inventory
            setHorseInventory(prev => inventoryUtils.removeItem(prev, 'key'));
          }
          
          // Add vault treasure to collected items
          setCollectedItemsThisRun(prev => [...prev, INVENTORY_ITEMS.vault_treasure]);
          
          setMaze(prevMaze => {
            const newMaze = prevMaze.map(row => [...row]);
            newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
            return newMaze;
          });
        }
      } else if (cell === CELL_TRAP) {
        const trapSense = getSkillLevel('trapSense');
        const thickSkin = getSkillLevel('thickSkin');
        
        if (trapSense > 0 && Math.random() < trapSense * 0.15) {
          return { x: nextMove.x, y: nextMove.y };
        }
        
        if (thickSkin > 0 && trapHits < thickSkin) {
          setTrapHits(prev => prev + 1);
          const trap = TRAPS[Math.floor(Math.random() * TRAPS.length)];
          setLastTrap(trap);
          return { x: nextMove.x, y: nextMove.y };
        }
        
        const trap = TRAPS[Math.floor(Math.random() * TRAPS.length)];
        setLastTrap(trap);
        setEndReason('trap');
        setGameState('ended');
        setInventory(prev => [...prev, ...currentRewards]);
        // Award points based on performance and maze difficulty
        const basePoints = Math.floor(currentRewards.length / 2) + 1;
        const difficultyBonus = MAZE_TYPES[selectedMazeType].difficulty;
        const skillPointsEarned = basePoints;
        const researchPointsEarned = Math.floor(basePoints * difficultyBonus * 0.5);
        setSkillPoints(prev => prev + skillPointsEarned);
        setResearchPoints(prev => prev + researchPointsEarned);
        return prevPos;
      }

      return { x: nextMove.x, y: nextMove.y };
    });
  }, [gameState, maze, currentRewards, hasPowerup, updatePowerups, updateMovingWalls, collectWithMagnet, usePowerup, getSkillLevel, minotaurPos, trapHits, isCellPassable, portals, vaultKeys, collectedKeys]);

  // Game loop
  useEffect(() => {
    if (gameState === 'exploring') {
      const timer = setTimeout(() => {
        moveHorse();
        
        if (hasPowerup('speed') && horseMoveCount % 2 === 0) {
          setTimeout(moveHorse, gameSpeed / 4);
        }
        
        const swiftness = getSkillLevel('swiftness');
        if (swiftness > 0 && Math.random() < swiftness * 0.1) {
          setTimeout(moveHorse, gameSpeed / 3);
        }
        
        if (Math.random() < 0.7) {
          moveMinotaur();
        }
      }, gameSpeed);
      return () => clearTimeout(timer);
    }
  }, [gameState, moveHorse, moveMinotaur, gameSpeed, horsePos, minotaurPos, hasPowerup, horseMoveCount, getSkillLevel]);

  const startGame = () => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setHorsePos({ x: 1, y: 1 });
    setMinotaurPos({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
    setCurrentRewards([]);
    setGameState('exploring');
    setTotalRuns(prev => prev + 1);
    setLastTrap(null);
    setEndReason('');
    setActivePowerups([]);
    setMinotaurStunned(0);
    setMinotaurLostTrack(0);
    setHorseMoveCount(0);
    setTrapHits(0);
    setCollectedKeys([]);
    setCurrentLevel(1);
    setCollectedItemsThisRun([]);
    // Reset available keys to horse's starting inventory keys
    setAvailableKeys(inventoryUtils.getItemCount(selectedHorse?.inventory || [], 'key'));
  };

  const exitLabyrinth = () => {
    const currentInventoryCount = selectedHorse?.inventory?.length || 0;
    const maxSlots = 4;
    const availableSlots = maxSlots - currentInventoryCount;
    
    // If we collected more items than we can carry, show selection modal
    if (collectedItemsThisRun.length > availableSlots) {
      setShowItemSelection(true);
      return;
    }
    
    // If we can carry all items, add them directly
    returnHorseWithItems(collectedItemsThisRun);
  };

  const returnHorseWithItems = (itemsToKeep, discardedIndices = []) => {
    if (selectedHorse && onHorseReturn) {
      // Start with current inventory, removing discarded items
      let updatedInventory = [...(selectedHorse.inventory || [])];
      
      // Remove discarded items (sort indices in descending order to avoid index shifting)
      const sortedDiscardedIndices = [...discardedIndices].sort((a, b) => b - a);
      sortedDiscardedIndices.forEach(index => {
        if (index >= 0 && index < updatedInventory.length) {
          updatedInventory.splice(index, 1);
        }
      });
      
      // Add selected items
      itemsToKeep.forEach(item => {
        const result = inventoryUtils.addItem(updatedInventory, item);
        if (result.success) {
          updatedInventory = result.inventory;
        }
      });
      
      const updatedHorse = {
        ...selectedHorse,
        inventory: updatedInventory
      };
      
      console.log('🎒 Labyrinth - Returning horse with updated inventory:');
      console.log('  - Original inventory:', selectedHorse.inventory);
      console.log('  - Discarded indices:', discardedIndices);
      console.log('  - Items to keep:', itemsToKeep);
      console.log('  - Final inventory:', updatedInventory);
      
      onHorseReturn(updatedHorse);
    }
    onBack();
  };

  const handleItemSelectionConfirm = (selectionResult) => {
    setShowItemSelection(false);
    
    // Handle both old format (array) and new format (object with selectedItems and discardedItems)
    if (Array.isArray(selectionResult)) {
      // Old format - just selected items
      returnHorseWithItems(selectionResult);
    } else {
      // New format - handle discarding and selecting
      const { selectedItems, discardedItems } = selectionResult;
      returnHorseWithItems(selectedItems, discardedItems);
    }
  };

  const handleItemSelectionCancel = () => {
    setShowItemSelection(false);
    // Return with no new items
    returnHorseWithItems([]);
  };

  const getCellDisplay = (cell, x, y) => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      imageRendering: 'pixelated',
      display: 'block',
      lineHeight: 0,
      verticalAlign: 'top',
      minWidth: 0,
      minHeight: 0,
      maxWidth: '100%',
      maxHeight: '100%'
    };

    if (horsePos.x === x && horsePos.y === y && minotaurPos.x === x && minotaurPos.y === y) {
      return <img src="/maze/collision.png" alt="Collision" style={baseStyle} />;
    }
    if (horsePos.x === x && horsePos.y === y) {
      return <img src="/maze/horse_player.png" alt="Horse" style={baseStyle} />;
    }
    if (minotaurPos.x === x && minotaurPos.y === y) {
      if (minotaurStunned > 0) return <img src="/maze/minotaur_stunned.png" alt="Stunned Minotaur" style={baseStyle} />;
      if (minotaurLostTrack > 0) return <img src="/maze/minotaur_lost.png" alt="Lost Minotaur" style={baseStyle} />;
      return <img src="/maze/minotaur.png" alt="Minotaur" style={baseStyle} />;
    }
    
    // Check water cells (flooded maze)
    const isWater = waterCells.some(w => w.x === x && w.y === y);
    if (isWater) return <img src="/maze/water.png" alt="Water" style={baseStyle} />;
    
    // Check time zones (temporal maze)
    const timeZone = timeZones.find(t => t.x === x && t.y === y);
    if (timeZone) return timeZone.type === 'slow' ? 
      <img src="/maze/time_slow.png" alt="Slow Time" style={baseStyle} /> : 
      <img src="/maze/time_fast.png" alt="Fast Time" style={baseStyle} />;
    
    // Check phasing walls
    const phasingWall = phasingWalls.find(p => p.x === x && p.y === y);
    if (phasingWall) return phasingWall.solid ? 
      <img src="/maze/phase_solid.png" alt="Solid Phase" style={baseStyle} /> : 
      <img src="/maze/phase_ethereal.png" alt="Ethereal Phase" style={baseStyle} />;
    
    // Check rotating gears
    const gear = rotatingGears.find(g => g.x === x && g.y === y);
    if (gear) return <img src="/maze/gear.png" alt="Gear" style={baseStyle} />;
    
    // Check moving walls
    const movingWall = movingWalls.find(w => w.x === x && w.y === y);
    if (movingWall) {
      return movingWall.closed ? 
        <img src="/maze/door_closed.png" alt="Closed Door" style={baseStyle} /> : 
        <img src="/maze/door_open.png" alt="Open Door" style={baseStyle} />;
    }
    
    switch (cell) {
      case CELL_WALL: return <img src="/maze/wall.png" alt="Wall" style={baseStyle} />;
      case CELL_EMPTY: return <img src="/maze/path.png" alt="Path" style={baseStyle} />;
      case CELL_START: return <img src="/maze/start.png" alt="Start" style={baseStyle} />;
      case CELL_REWARD: return <img src="/maze/treasure.png" alt="Treasure" style={baseStyle} />;
      case CELL_TRAP: return <img src="/maze/trap.png" alt="Trap" style={baseStyle} />;
      case CELL_POWERUP: return <img src="/maze/powerup.png" alt="Power-up" style={baseStyle} />;
      case CELL_ONEWAY_N: return <img src="/maze/arrow_up.png" alt="One-way Up" style={baseStyle} />;
      case CELL_ONEWAY_S: return <img src="/maze/arrow_down.png" alt="One-way Down" style={baseStyle} />;
      case CELL_ONEWAY_E: return <img src="/maze/arrow_right.png" alt="One-way Right" style={baseStyle} />;
      case CELL_ONEWAY_W: return <img src="/maze/arrow_left.png" alt="One-way Left" style={baseStyle} />;
      case CELL_PORTAL_A: return <img src="/maze/portal.png" alt="Portal A" style={baseStyle} />;
      case CELL_PORTAL_B: return <img src="/maze/portal.png" alt="Portal B" style={baseStyle} />;
      case CELL_DARK_ZONE: return <img src="/maze/darkzone.png" alt="Dark Zone" style={baseStyle} />;
      case CELL_VAULT: return <img src="/maze/vault.png" alt="Vault" style={baseStyle} />;
      case CELL_KEY: return <img src="/maze/key.png" alt="Key" style={baseStyle} />;
      default: return <img src="/maze/path.png" alt="Path" style={baseStyle} />;
    }
  };

  const getInventoryCount = (itemName) => {
    return inventory.filter(item => item.name === itemName).length;
  };

  const uniqueInventoryItems = [...new Set(inventory.map(item => item.name))]
    .map(name => {
      const item = inventory.find(i => i.name === name);
      return { ...item, count: getInventoryCount(name) };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 flex flex-col">
      <div className="flex-1 flex flex-col w-full p-3">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-3">
          {onBack && (
            <button
              onClick={exitLabyrinth}
              className="px-3 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1 shadow-md"
            >
              ← Back
            </button>
          )}
          <h1 className="text-lg font-bold text-green-800 flex items-center gap-2">
            🐎 Labyrinth
          </h1>
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* 1. Mobile-optimized Maze Display */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                {MAZE_TYPES[selectedMazeType].name}
                <span className="text-yellow-600 text-sm">{'⭐'.repeat(MAZE_TYPES[selectedMazeType].difficulty)}</span>
              </h2>
              <div className="text-xs text-gray-600 flex gap-3 mt-1">
                <span>Run #{totalRuns}</span>
                <span className="text-purple-600">💎 {skillPoints} SP</span>
                <span className="text-blue-600">🔬 {researchPoints} RP</span>
              </div>
            </div>
          </div>

          {/* Maze Grid */}
          <div 
            className="border-2 border-gray-800 bg-gray-900 w-full rounded-lg overflow-hidden shadow-inner"
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 0,
              aspectRatio: '1/1'
            }}
          >
              {maze.map((row, y) => (
                <div 
                  key={y}
                  style={{ 
                    display: 'flex',
                    lineHeight: 0,
                    flex: '1',
                    width: '100%'
                  }}
                >
                  {row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      style={{ 
                        flex: '1 1 0',
                        aspectRatio: '1/1',
                        background: 'transparent',
                        border: 'none',
                        display: 'block',
                        lineHeight: 0,
                        padding: 0,
                        margin: 0,
                        minWidth: 0,
                        minHeight: 0,
                        overflow: 'hidden'
                      }}
                    >
                      {getCellDisplay(cell, x, y)}
                    </div>
                  ))}
                </div>
              ))}
          </div>
          
          {/* Horse Status Text */}
          <div className="text-center py-2">
            {gameState === 'waiting' && (
              <p className="text-gray-600 text-sm">Ready to explore!</p>
            )}
            {gameState === 'exploring' && (
              <div className="space-y-1">
                <p className="text-blue-600 animate-pulse text-sm font-medium">🏃‍♂️ Exploring maze...</p>
                {minotaurStunned > 0 && (
                  <p className="text-yellow-600 text-xs">😵 Minotaur stunned ({minotaurStunned} turns)</p>
                )}
                {minotaurLostTrack > 0 && (
                  <p className="text-purple-600 text-xs">❓ Minotaur lost track ({minotaurLostTrack} turns)</p>
                )}
                {!minotaurStunned && !minotaurLostTrack && (
                  <p className="text-red-600 animate-pulse text-xs">👹 Minotaur hunting!</p>
                )}
              </div>
            )}
            {gameState === 'ended' && (
              <div className="text-sm">
                {endReason === 'trap' && lastTrap && (
                  <p className="text-red-600">💥 Hit {lastTrap.name} {lastTrap.emoji}!</p>
                )}
                {endReason === 'minotaur' && (
                  <p className="text-red-600">👹 Caught by minotaur!</p>
                )}
                {endReason === 'success' && (
                  <p className="text-green-600">🎉 Escaped successfully!</p>
                )}
              </div>
            )}
          </div>

          {/* Mobile-optimized Controls */}
          <div className="space-y-3">
            {/* Primary Action Button */}
            <button
              onClick={startGame}
              disabled={gameState === 'exploring'}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-base shadow-md"
            >
              {gameState === 'waiting' ? '🚀 Start Adventure' : '🔄 New Adventure'}
            </button>
            
            {/* Settings Row */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedMazeType}
                onChange={(e) => setSelectedMazeType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                disabled={gameState === 'exploring'}
              >
                {Object.entries(MAZE_TYPES).map(([key, maze]) => (
                  <option key={key} value={key} disabled={!maze.unlocked && !unlockedMazes[key]}>
                    {maze.name} {maze.unlocked || unlockedMazes[key] ? '' : '🔒'}
                  </option>
                ))}
              </select>
              
              <select
                value={gameSpeed}
                onChange={(e) => setGameSpeed(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                disabled={gameState === 'exploring'}
              >
                <option value={1200}>🐌 Slow</option>
                <option value={800}>🚶 Normal</option>
                <option value={400}>🏃 Fast</option>
                <option value={200}>⚡ Very Fast</option>
              </select>
            </div>
            
            {/* Secondary Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowSkillTree(!showSkillTree)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium shadow-md"
              >
                💎 Skills ({skillPoints})
              </button>
              
              <button
                onClick={() => setShowResearchTree(!showResearchTree)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-md"
              >
                🔬 Research ({researchPoints})
              </button>
            </div>
          </div>
        </div>

        {/* 2. Horse Display with Inventory */}
        {selectedHorse && (
          <div className="bg-white rounded-xl p-4 shadow-lg mb-3 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={selectedHorse.avatar} 
                alt={selectedHorse.name}
                className="w-16 h-16 rounded-lg object-contain bg-gray-50 border border-gray-200"
              />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">{selectedHorse.name}</h2>
                <p className="text-sm text-gray-600">{selectedHorse.personality}</p>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  {availableKeys >= 0 && (
                    <span className="text-yellow-700 font-semibold">🗝️ {availableKeys}</span>
                  )}
                  {collectedItemsThisRun.length > 0 && (
                    <span className="text-purple-700 font-semibold">✨ +{collectedItemsThisRun.length}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Inventory Grid */}
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, index) => {
                const item = selectedHorse.inventory?.[index];
                return (
                  <div
                    key={index}
                    className={`aspect-square border-2 border-dashed rounded-lg flex items-center justify-center ${
                      item ? 'bg-white border-solid border-purple-300' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    {item ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-8 h-8 object-contain"
                        title={item.name}
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">Empty</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Status Panels */}
        {activePowerups.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 shadow-sm">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              ⚡ Active Power-ups
            </h4>
            <div className="flex flex-wrap gap-2">
              {activePowerups.map((powerup, idx) => (
                <span key={idx} className="bg-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                  {powerup.emoji} {powerup.name} ({powerup.duration})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mobile-optimized Horse Status */}
        {(trapHits > 0 || Object.values(skills).some(level => level > 0) || collectedKeys.length > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 shadow-sm">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              🐎 Horse Status
            </h4>
            <div className="text-sm space-y-1">
              {trapHits > 0 && <div>❤️ Trap Hits: {trapHits}/{getSkillLevel('thickSkin')}</div>}
              {collectedKeys.length > 0 && <div>🗝️ Keys Collected: {collectedKeys.length}</div>}
              {getSkillLevel('wallWalking') > 0 && <div>🕷️ Wall Walking Active</div>}
              {getSkillLevel('pathfinding') > 0 && <div>🧭 Smart Movement Active</div>}
            </div>
          </div>
        )}

        {/* Current Run Rewards */}
        {currentRewards.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3 shadow-sm">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">🏆 Current Run Rewards</h4>
            <div className="flex flex-wrap gap-2">
              {currentRewards.map((reward, idx) => (
                <span key={idx} className="bg-yellow-200 px-3 py-1 rounded-full text-xs font-medium">
                  {reward.emoji} {reward.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Skill Tree Modal */}
      {showSkillTree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                💎 Skills ({skillPoints} points)
              </h2>
              <button
                onClick={() => setShowSkillTree(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(SKILL_TREE).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="border rounded-lg p-3">
                    <h3 className={`font-semibold mb-2 text-${category.color}-700`}>
                      {category.name}
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(category.skills).map(([skillKey, skill]) => {
                        const currentLevel = getSkillLevel(skillKey);
                        const cost = currentLevel < skill.maxLevel ? skill.cost(currentLevel + 1) : 0;
                        const canUpgrade = canUpgradeSkill(categoryKey, skillKey);
                        
                        return (
                          <div key={skillKey} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span>{skill.emoji}</span>
                                <span className="font-medium text-sm">{skill.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({currentLevel}/{skill.maxLevel})
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">{skill.description}</div>
                            </div>
                            {currentLevel < skill.maxLevel && (
                              <button
                                onClick={() => upgradeSkill(categoryKey, skillKey)}
                                disabled={!canUpgrade}
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  canUpgrade 
                                    ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {cost} 💎
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Research Tree Modal */}
      {showResearchTree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                🔬 Research ({researchPoints} points)
              </h2>
              <button
                onClick={() => setShowResearchTree(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="space-y-4">
                {Object.entries(RESEARCH_TREE).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="border rounded-lg p-3">
                    <h3 className={`font-semibold mb-2 text-${category.color}-700`}>
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">{category.description}</p>
                    <div className="space-y-2">
                      {category.mazes.map(mazeKey => {
                        const maze = MAZE_TYPES[mazeKey];
                        const isUnlocked = maze.unlocked || unlockedMazes[mazeKey];
                        const canResearch = canResearchMaze(mazeKey);
                        
                        return (
                          <div key={mazeKey} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{maze.name}</span>
                                <span className="text-yellow-600">{'⭐'.repeat(maze.difficulty)}</span>
                                {isUnlocked && <span className="text-green-600">✓</span>}
                              </div>
                              <div className="text-xs text-gray-600">{maze.description}</div>
                              <div className="text-xs text-blue-600 mt-1">
                                {maze.mechanics.join(', ')}
                              </div>
                            </div>
                            {!isUnlocked && (
                              <button
                                onClick={() => researchMaze(mazeKey)}
                                disabled={!canResearch}
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  canResearch 
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {maze.researchCost} 🔬
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ItemSelectionModal */}
      <ItemSelectionModal
        isOpen={showItemSelection}
        horse={selectedHorse}
        collectedItems={collectedItemsThisRun}
        maxSlots={4}
        onConfirm={handleItemSelectionConfirm}
        onCancel={handleItemSelectionCancel}
      />
    </div>
  );
}

export default HorseMazeGame;
