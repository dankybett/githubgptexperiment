import React, { useState, useEffect, useCallback } from "react";
import { INVENTORY_ITEMS, inventoryUtils } from "../utils/inventoryItems";
import ItemSelectionModal from "./ItemSelectionModal";
import { themeUtils } from "../utils/themes";

const MAZE_SIZE = 12;
const VIEWPORT_SIZE = 6; // 6x6 visible area
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

// TileSprite component for tileset rendering
const TileSprite = ({ tileX, tileY, className = "" }) => {
  const tilesPerRow = 10; // 10x10 grid
  
  // Calculate percentage positions for the 10x10 grid
  const positionX = (tileX / (tilesPerRow - 1)) * 100;
  const positionY = (tileY / (tilesPerRow - 1)) * 100;
  
  const style = {
    width: '100%',
    height: '100%',
    backgroundImage: 'url(/maze/tilesheetdan.png)',
    backgroundPosition: `${positionX}% ${positionY}%`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${tilesPerRow * 100}% ${tilesPerRow * 100}%`, // Scale so each tile = 100% of cell
    imageRendering: 'pixelated', // Keep sharp pixels for pixel art
    display: 'block',
    lineHeight: 0,
    verticalAlign: 'top',
    minWidth: 0,
    minHeight: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'cover'
  };
  
  return <div className={`tile ${className}`} style={style} />;
};

// Layered tile component for tiles with transparent backgrounds
const LayeredTile = ({ backgroundTile, foregroundTile, className = "" }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Background layer (CELL_EMPTY) */}
      <TileSprite tileX={backgroundTile.x} tileY={backgroundTile.y} />
      {/* Foreground layer (transparent tile on top) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <TileSprite tileX={foregroundTile.x} tileY={foregroundTile.y} className={className} />
      </div>
    </div>
  );
};

// Tile mapping for your 10x10 grid (adjust coordinates based on your tileset layout)
const TILE_MAP = {
  [CELL_WALL]: { x: 1, y: 0 },        // Top-left tile
  [CELL_EMPTY]: { x: 0, y: 0 },       // Second tile, first row
  [CELL_START]: { x: 0, y: 0 },       // Third tile, first row
  [CELL_REWARD]: { x: 0, y: 0 },      // Fourth tile, first row
  [CELL_TRAP]: { x: 1, y: 1 },        // Fifth tile, first row
  [CELL_POWERUP]: { x: 8, y: 1 },     // First tile, second row
  [CELL_ONEWAY_N]: { x: 0, y: 0  },    // Arrow up
  [CELL_ONEWAY_S]: { x: 0, y: 0  },    // Arrow down
  [CELL_ONEWAY_E]: { x: 0, y: 0  },    // Arrow right
  [CELL_ONEWAY_W]: { x: 0, y: 0  },    // Arrow left
  [CELL_PORTAL_A]: { x: 2, y: 1 },    // Portal A
  [CELL_PORTAL_B]: { x: 2, y: 1 },    // Portal B (could be same or different)
  [CELL_DARK_ZONE]: { x: 0, y: 1},   // Dark zone
  [CELL_VAULT]: { x: 3, y: 1},       // Vault
  [CELL_KEY]: { x: 8, y: 0},         // Key
  [CELL_MOVING_WALL]: { x: 0, y: 0}, // Moving wall
  
  // Special tiles for dynamic elements (add more as needed)
  DOOR_CLOSED: { x: 0, y: 0 },
  DOOR_OPEN: { x: 0, y: 0 },
  GEAR: { x: 0, y: 0 },
  TIME_SLOW: { x: 0, y: 0 },
  TIME_FAST: { x: 0, y: 0 },
  PHASE_SOLID: { x: 0, y: 0 },
  PHASE_ETHEREAL: { x: 0, y: 0 },
  WATER: { x: 0, y: 0 },
  MINOTAUR: { x: 0, y: 6},
  MINOTAUR_STUNNED: { x: 0, y: 6},
  MINOTAUR_LOST: { x: 0, y: 6},
  
  // Reward tiles
  REWARD_GOLDEN_APPLE: { x: 7, y: 0 },   // Golden Apple tile
  REWARD_MAGIC_CARROT: { x: 6, y: 0 },   // Magic Carrot tile
  REWARD_HAY_BUNDLE: { x: 9, y: 1 },     // Hay Bundle tile
  
  // Legendary reward tiles
  LEGENDARY_ANCIENT_TREASURE: { x: 8, y: 3 },   // Ancient Treasure tile
  LEGENDARY_DRAGON_EGG: { x: 8, y: 4 },         // Dragon Egg tile  
  LEGENDARY_SACRED_RELIC: { x: 9, y: 2 },       // Sacred Relic tile
};

// Multiple empty tile variants for visual variety
const EMPTY_TILE_VARIANTS = [
  { x: 0, y: 2 }, // Empty tile variant 1
  { x: 0, y: 3 }, // Empty tile variant 2  
  { x: 0, y: 5 }, // Empty tile variant 3
  { x: 3, y: 5 }  // Empty tile variant 4
];

// Create a seeded random number generator for consistent tile placement
const createSeededRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
};

// Wall tile variants for different positions
const WALL_TILE_VARIANTS = {
  // Corner tiles
  TOP_LEFT_CORNER: { x: 7, y: 5 },     // Top-left corner
  TOP_RIGHT_CORNER: { x: 7, y: 6 },    // Top-right corner  
  BOTTOM_LEFT_CORNER: { x: 1, y: 0 },  // Bottom-left corner
  BOTTOM_RIGHT_CORNER: { x: 1, y: 0 }, // Bottom-right corner
  
  // Edge tiles
  TOP_EDGE: { x: 1, y: 0 },            // Top edge (horizontal)
  BOTTOM_EDGE: { x: 1, y: 0 },         // Bottom edge (horizontal)
  LEFT_EDGE: { x: 5, y: 5 },           // Left edge (vertical)
  RIGHT_EDGE: { x: 6, y: 5 },          // Right edge (vertical)
  
  // Interior wall (fallback)
  INTERIOR: { x: 3, y: 0 }             // Interior wall tile
};

// Function to get appropriate wall tile based on position
const getWallTile = (x, y, maze) => {
  const mazeSize = maze.length;
  
  // Corner detection
  if (x === 0 && y === 0) return WALL_TILE_VARIANTS.TOP_LEFT_CORNER;
  if (x === mazeSize - 1 && y === 0) return WALL_TILE_VARIANTS.TOP_RIGHT_CORNER;
  if (x === 0 && y === mazeSize - 1) return WALL_TILE_VARIANTS.BOTTOM_LEFT_CORNER;
  if (x === mazeSize - 1 && y === mazeSize - 1) return WALL_TILE_VARIANTS.BOTTOM_RIGHT_CORNER;
  
  // Edge detection
  if (y === 0) return WALL_TILE_VARIANTS.TOP_EDGE;           // Top edge
  if (y === mazeSize - 1) return WALL_TILE_VARIANTS.BOTTOM_EDGE;  // Bottom edge
  if (x === 0) return WALL_TILE_VARIANTS.LEFT_EDGE;          // Left edge
  if (x === mazeSize - 1) return WALL_TILE_VARIANTS.RIGHT_EDGE;   // Right edge
  
  // Interior wall
  return WALL_TILE_VARIANTS.INTERIOR;
};

// Function to get a random empty tile variant based on position
const getRandomEmptyTile = (x, y) => {
  // Use position as seed for consistent results
  const seed = x * 1000 + y;
  const random = createSeededRandom(seed);
  const index = Math.floor(random() * EMPTY_TILE_VARIANTS.length);
  return EMPTY_TILE_VARIANTS[index];
};

// Define which tiles have transparent backgrounds and need CELL_EMPTY behind them
const TILES_WITH_TRANSPARENT_BACKGROUND = new Set([
  CELL_REWARD,
  CELL_TRAP, 
  CELL_POWERUP,
  CELL_KEY,
  CELL_PORTAL_A,
  CELL_PORTAL_B,
  CELL_VAULT,
  // Add more cell types that have transparent backgrounds
]);

// Define which special/dynamic tiles have transparent backgrounds
const SPECIAL_TILES_WITH_TRANSPARENT_BACKGROUND = new Set([
  'GEAR',
  'TIME_SLOW', 
  'TIME_FAST',
  'PHASE_ETHEREAL',
  'DOOR_OPEN',
  'DOOR_CLOSED',
  'MINOTAUR',
  'MINOTAUR_STUNNED',
  'MINOTAUR_LOST',
  // Reward tiles
  'REWARD_GOLDEN_APPLE',
  'REWARD_MAGIC_CARROT', 
  'REWARD_HAY_BUNDLE',
  // Legendary reward tiles
  'LEGENDARY_ANCIENT_TREASURE',
  'LEGENDARY_DRAGON_EGG',
  'LEGENDARY_SACRED_RELIC',
  // Add more special tile keys as needed
]);

// Helper function to render special tiles with optional transparent background
const renderSpecialTile = (tileKey, x, y, direction = null) => {
  const tileMapping = TILE_MAP[tileKey];
  const isMinotaurTile = tileKey.includes('MINOTAUR');
  const shouldFlip = isMinotaurTile && direction === 'left';
  
  if (SPECIAL_TILES_WITH_TRANSPARENT_BACKGROUND.has(tileKey)) {
    return (
      <LayeredTile 
        backgroundTile={getRandomEmptyTile(x, y)} 
        foregroundTile={tileMapping} 
        className={shouldFlip ? 'minotaur-flipped' : ''}
      />
    );
  }
  return <TileSprite tileX={tileMapping.x} tileY={tileMapping.y} className={shouldFlip ? 'minotaur-flipped' : ''} />;
};

const REWARDS = [
  { name: 'Golden Apple', emoji: '🍎', rarity: 0.3, tileKey: 'REWARD_GOLDEN_APPLE' },
  { name: 'Magic Carrot', emoji: '🥕', rarity: 0.4, tileKey: 'REWARD_MAGIC_CARROT' },
  { name: 'Hay Bundle', emoji: '🌾', rarity: 0.3, tileKey: 'REWARD_HAY_BUNDLE' }
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
  { name: 'Minotaur Stun Bomb', emoji: '💣', rarity: 0.15, effect: 'stun', duration: 6 },
  { name: 'Treasure Magnet', emoji: '🧲', rarity: 0.25, effect: 'magnet', duration: 4 }
];

const MAZE_TYPES = {
  standard: {
    name: 'Standard Maze',
    description: 'Classic maze with all basic features',
    difficulty: 1,
    unlocked: true,
    mechanics: ['Static walls', 'Portals', 'Dark zones', 'Vaults & keys']
  },
  pyramid: {
    name: 'Pyramid Maze',
    description: 'Multi-level maze with ramps connecting floors',
    difficulty: 2,
    unlocked: false,
    researchCost: 25,
    researchCategory: 'architectural',
    mechanics: ['Moving walls', 'One-way doors', '3D movement', 'Ramps up/down']
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

const STABLE_UPGRADES = {
  automaticFeeder: {
    name: 'Automatic Feeder',
    description: 'Feed reduces 50% slower',
    researchCost: 50,
    unlockedBy: 'pyramid',
    category: 'architectural'
  },
  springWell: {
    name: 'Natural Spring Well',
    description: 'Water reduces 60% slower',
    researchCost: 40,
    unlockedBy: 'cave',
    category: 'environmental'
  },
  selfCleaningStalls: {
    name: 'Self-Cleaning Stalls',
    description: 'Cleanliness reduces 70% slower',
    researchCost: 60,
    unlockedBy: 'gear',
    category: 'architectural'
  },
  healingPonds: {
    name: 'Healing Ponds',
    description: 'Horses slowly recover health in stable',
    researchCost: 80,
    unlockedBy: 'flooded',
    category: 'environmental'
  },
  timeAccelerator: {
    name: 'Time Acceleration Chamber',
    description: 'Horses recover from fatigue 3x faster',
    researchCost: 100,
    unlockedBy: 'temporal',
    category: 'temporal'
  },
  chaosFeeder: {
    name: 'Chaos Energy Feeder',
    description: 'Randomly provides free stable resources',
    researchCost: 75,
    unlockedBy: 'random',
    category: 'chaos'
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
      pathfinding: { name: 'Pathfinding', emoji: '🧭', maxLevel: 3, cost: (level) => level * 4, description: 'Smarter movement: avoids danger, seeks nearby treasures (starts at level 1)' },
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
  },
  inventory: {
    name: 'Inventory',
    color: 'amber',
    skills: {
      saddlebags: { name: 'Saddlebags', emoji: '👜', maxLevel: 2, cost: (level) => level * 8, description: '+1 inventory slot per level' },
      organization: { name: 'Organization', emoji: '📦', maxLevel: 3, cost: (level) => level * 6, description: 'Better item stacking and management' },
      treasureHunter: { name: 'Treasure Hunter', emoji: '🔍', maxLevel: 3, cost: (level) => level * 4, description: 'Find higher quality items' }
    }
  }
};

// Helper function to calculate viewport bounds based on horse position
const getViewportBounds = (horseX, horseY) => {
  const halfViewport = Math.floor(VIEWPORT_SIZE / 2);
  
  // Calculate ideal start position centered on horse
  let startX = horseX - halfViewport;
  let startY = horseY - halfViewport;
  
  // Clamp to valid ranges that allow full viewport
  startX = Math.max(0, Math.min(startX, MAZE_SIZE - VIEWPORT_SIZE));
  startY = Math.max(0, Math.min(startY, MAZE_SIZE - VIEWPORT_SIZE));
  
  return { startX, startY };
};

function HorseMazeGame({ onBack, selectedHorse, onHorseReturn, researchPoints, onUpdateResearchPoints, coins, onUpdateCoins, unlockedMazes, onUpdateUnlockedMazes, horseAvatars, horseNames, unlockedHorses, onUnlockHorse, currentTheme = 'retro' }) {
  const [maze, setMaze] = useState([]);
  const [horsePos, setHorsePos] = useState({ x: 1, y: 1 });
  const [horseDirection, setHorseDirection] = useState('right'); // 'left' or 'right'
  const [prevHorsePos, setPrevHorsePos] = useState({ x: 1, y: 1 });
  const [minotaurPos, setMinotaurPos] = useState({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
  const [minotaurDirection, setMinotaurDirection] = useState('right'); // 'left' or 'right'
  const [prevMinotaurPos, setPrevMinotaurPos] = useState({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
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

  // Lost horse feature states
  const [lostHorse, setLostHorse] = useState(null); // { id, avatar, name, pos: {x, y}, direction }
  const [showLostHorseAnnouncement, setShowLostHorseAnnouncement] = useState(false);
  const [showLostHorseFound, setShowLostHorseFound] = useState(false);
  const [foundHorse, setFoundHorse] = useState(null);


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

  // Track minotaur direction based on position changes
  useEffect(() => {
    if (minotaurPos.x !== prevMinotaurPos.x) {
      if (minotaurPos.x < prevMinotaurPos.x) {
        setMinotaurDirection('left');
      } else if (minotaurPos.x > prevMinotaurPos.x) {
        setMinotaurDirection('right');
      }
    }
    setPrevMinotaurPos(minotaurPos);
  }, [minotaurPos, prevMinotaurPos]);

  // Track horse direction based on position changes
  useEffect(() => {
    if (horsePos.x !== prevHorsePos.x) {
      if (horsePos.x < prevHorsePos.x) {
        setHorseDirection('left');
      } else if (horsePos.x > prevHorsePos.x) {
        setHorseDirection('right');
      }
    }
    setPrevHorsePos(horsePos);
  }, [horsePos, prevHorsePos]);

  const [gameState, setGameState] = useState('waiting');
  const [currentRewards, setCurrentRewards] = useState([]);
  const [rewardPositions, setRewardPositions] = useState([]); // Array of {x, y, rewardType}
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
  const [selectedMazeType, setSelectedMazeType] = useState('standard');
  const [lastGeneratedMazeType, setLastGeneratedMazeType] = useState('standard');
  const [showResearchTree, setShowResearchTree] = useState(false);
  
  // Get theme styles
  const labyrinthStyles = themeUtils.getScreenStyles(currentTheme, 'labyrinth');

  // Lost horse spawn logic
  const checkForLostHorseSpawn = useCallback(() => {
    // Very rare chance (2% per adventure)
    const spawnChance = 0.02; // 2% chance per adventure
    
    if (Math.random() < spawnChance) {
      // Find locked horses
      const lockedHorseIndices = unlockedHorses
        .map((unlocked, index) => !unlocked ? index : -1)
        .filter(index => index !== -1);
      
      console.log('🐴 Checking for locked horses:', { 
        unlockedHorses, 
        lockedHorseIndices, 
        availableCount: lockedHorseIndices.length 
      });
      
      if (lockedHorseIndices.length > 0) {
        // Select a random locked horse
        const randomIndex = lockedHorseIndices[Math.floor(Math.random() * lockedHorseIndices.length)];
        const avatar = horseAvatars[randomIndex];
        const name = horseNames[randomIndex];
        
        // Find random empty position in maze outside initial viewport
        const findRandomEmptyPosition = () => {
          
          let attempts = 0;
          // Try to place outside the initial viewport (which is 0-5, 0-5) to encourage exploration
          const explorationPositions = [
            {x: 7, y: 3}, {x: 8, y: 4}, {x: 9, y: 2}, {x: 6, y: 7}, {x: 8, y: 8}, // Far right/bottom areas
            {x: 3, y: 8}, {x: 4, y: 9}, {x: 2, y: 7}, {x: 7, y: 6}, {x: 9, y: 5}, // Bottom areas
            {x: 6, y: 2}, {x: 7, y: 1}, {x: 8, y: 3}, {x: 9, y: 4}, {x: 7, y: 5}  // Right areas
          ];
          
          for (const pos of explorationPositions) {
            if (maze[pos.y] && maze[pos.y][pos.x] === CELL_EMPTY) {
              console.log('🐴 Lost horse placed in exploration area at:', pos);
              return pos;
            }
          }
          
          // If exploration positions don't work, try anywhere in the maze
          while (attempts < 50) {
            const x = Math.floor(Math.random() * (MAZE_SIZE - 4)) + 2; // x: 2-9 
            const y = Math.floor(Math.random() * (MAZE_SIZE - 4)) + 2; // y: 2-9
            console.log(`🔍 Fallback attempt ${attempts}: trying position (${x}, ${y}), cell value:`, maze[y]?.[x]);
            if (maze[y] && maze[y][x] === CELL_EMPTY && !(x === 1 && y === 1)) {
              console.log('🐴 Lost horse placed at fallback position:', { x, y });
              return { x, y };
            }
            attempts++;
          }
          // Fallback: try anywhere in maze  
          while (attempts < 100) {
            const x = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1;
            const y = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1;
            console.log(`🔍 Fallback attempt ${attempts}: trying position (${x}, ${y}), cell value:`, maze[y]?.[x]);
            if (maze[y] && maze[y][x] === CELL_EMPTY && !(x === 1 && y === 1)) {
              console.log('🐴 Lost horse placed at fallback position:', { x, y });
              return { x, y };
            }
            attempts++;
          }
          console.log('🐴 Lost horse placed at emergency fallback position (2,2)');
          return { x: 2, y: 2 }; // Emergency fallback - close to player start
        };
        
        const position = findRandomEmptyPosition();
        
        const lostHorseData = {
          id: randomIndex,
          avatar,
          name,
          pos: position,
          direction: 'right'
        };
        
        setLostHorse(lostHorseData);
        setShowLostHorseAnnouncement(true);
        console.log('🐴 Lost horse created:', lostHorseData);
        return true;
      }
    }
    return false;
  }, [unlockedHorses, horseAvatars, horseNames, maze]);

  // Lost horse movement logic
  const moveLostHorse = useCallback(() => {
    if (!lostHorse || gameState !== 'exploring') return;

    setLostHorse(prev => {
      if (!prev) return prev;
      
      console.log('🐴 Lost horse moving from:', prev.pos);

      const { x, y } = prev.pos;
      const possibleMoves = [
        { x: x - 1, y, dir: 'left' },
        { x: x + 1, y, dir: 'right' },
        { x, y: y - 1, dir: prev.direction },
        { x, y: y + 1, dir: prev.direction }
      ].filter(move => {
        return move.x > 0 && move.x < MAZE_SIZE - 1 && 
               move.y > 0 && move.y < MAZE_SIZE - 1 && 
               maze[move.y] && maze[move.y][move.x] === CELL_EMPTY;
      });

      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        console.log('🐴 Lost horse moving to:', { x: randomMove.x, y: randomMove.y });
        return {
          ...prev,
          pos: { x: randomMove.x, y: randomMove.y },
          direction: randomMove.dir
        };
      }

      console.log('🐴 Lost horse has no valid moves, staying at:', prev.pos);
      return prev; // No valid moves, stay in place
    });
  }, [lostHorse, gameState, maze]);
  
  // Stable upgrades system
  const [stableUpgrades, setStableUpgrades] = useState({});
  
  // Maze-specific features
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(1);
  const [waterCells, setWaterCells] = useState([]);
  const [rotatingGears, setRotatingGears] = useState([]);
  const [timeZones, setTimeZones] = useState([]);
  const [phasingWalls, setPhasingWalls] = useState([]);
  
  // Skill system (now per-horse)
  const [skillPoints, setSkillPoints] = useState(0);
  const [horseSkills, setHorseSkills] = useState({
    trapSense: 0, thickSkin: 0, lucky: 0,
    swiftness: 0, pathfinding: 1, swimming: 0, climbing: 0,
    powerupMagnet: 0, enhancement: 0, teleportMastery: 0, timeResistance: 0,
    sneaking: 0, distraction: 0, ghostForm: 0,
    saddlebags: 0, organization: 0, treasureHunter: 0
  });
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [trapHits, setTrapHits] = useState(0);
  
  // Track if horse got injured during current labyrinth session
  const [horseInjuredThisSession, setHorseInjuredThisSession] = useState(false);
  
  // Teleportation effect state
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [teleportStage, setTeleportStage] = useState('none'); // 'dematerializing', 'materializing', 'none'
  
  // Visual feedback states
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [horseFlash, setHorseFlash] = useState(null);
  
  // Vault interaction states
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showTreasureReveal, setShowTreasureReveal] = useState(false);
  const [currentVault, setCurrentVault] = useState(null);
  
  // Visual feedback functions
  const addFloatingText = useCallback((text, color = '#10b981') => {
    const id = Math.random().toString(36).substr(2, 9);
    setFloatingTexts(prev => {
      const newText = { id, text, color, timestamp: Date.now() };
      return [...prev, newText];
    });
    // Remove after 2 seconds
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 2000);
  }, []);
  
  const flashHorse = useCallback((color = '#3b82f6') => {
    setHorseFlash(color);
    setTimeout(() => setHorseFlash(null), 500);
  }, []);

  // Generate maze based on selected type
  const generateMaze = useCallback(() => {
    const newMaze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(CELL_WALL));
    const rewardPositionsTemp = []; // Track reward positions and types during generation
    
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
    let keysPlaced = 0;
    let vaultPlaced = false;
    
    for (let y = 1; y < MAZE_SIZE - 1; y++) {
      for (let x = 1; x < MAZE_SIZE - 1; x++) {
        if (newMaze[y][x] === CELL_EMPTY) {
          // Skip spawn areas to prevent trapping horse or minotaur
          const isHorseSpawnArea = Math.abs(x - 1) <= 1 && Math.abs(y - 1) <= 1;
          const isMinotaurSpawnArea = Math.abs(x - (MAZE_SIZE - 2)) <= 1 && Math.abs(y - (MAZE_SIZE - 2)) <= 1;
          
          if (isHorseSpawnArea || isMinotaurSpawnArea) {
            continue; // Keep these areas clear of special features
          }
          
          const rand = Math.random();
          
          // Base features (all maze types) - these take priority
          if (rand < 0.15) {
            // Select a random reward type
            const selectedReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
            newMaze[y][x] = CELL_REWARD;
            // Store the reward position and type for rendering
            rewardPositionsTemp.push({ x, y, rewardType: selectedReward });
          } else if (rand < 0.25) {
            newMaze[y][x] = CELL_TRAP;
          } else if (rand < 0.32) {
            newMaze[y][x] = CELL_POWERUP;
          } else if (rand < 0.38 && keysPlaced < 2) {
            newMaze[y][x] = CELL_KEY;
            newVaultKeys.push({ x, y, id: Math.random().toString(36).substr(2, 9) });
            keysPlaced++;
          } else if (rand < 0.42 && !vaultPlaced && newVaultKeys.length > 0) {
            newMaze[y][x] = CELL_VAULT;
            vaultPlaced = true;
          } else {
            // Only add maze-specific features if no base feature was placed
            // Maze-type specific features
            if (selectedMazeType === 'standard') {
              // Standard maze: static internal walls only, no moving mechanics
              if (rand < 0.35) {
                newMaze[y][x] = CELL_WALL;
              } else if (rand < 0.37 && !portalA) {
                newMaze[y][x] = CELL_PORTAL_A;
                portalA = { x, y };
              } else if (rand < 0.39 && portalA && !portalB) {
                newMaze[y][x] = CELL_PORTAL_B;
                portalB = { x, y };
              } else if (rand < 0.41) {
                newMaze[y][x] = CELL_DARK_ZONE;
                newDarkZones.push({ x, y });
              }
            } else if (selectedMazeType === 'pyramid' || selectedMazeType === 'cave') {
              // Pyramid and cave mazes: keep original distribution with one-way tiles
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
    
    // Set the reward positions state
    setRewardPositions(rewardPositionsTemp);
    
    return newMaze;
  }, [selectedMazeType]);

  // Initialize maze
  useEffect(() => {
    setMaze(generateMaze());
    setLastGeneratedMazeType(selectedMazeType);
  }, [generateMaze, selectedMazeType]);

  // Initialize horse skills when selectedHorse changes
  useEffect(() => {
    if (selectedHorse) {
      // Load horse's existing skills or initialize to defaults
      const horseExistingSkills = selectedHorse.skills || {
        trapSense: 0, thickSkin: 0, lucky: 0,
        swiftness: 0, pathfinding: 1, swimming: 0, climbing: 0,
        powerupMagnet: 0, enhancement: 0, teleportMastery: 0, timeResistance: 0,
        sneaking: 0, distraction: 0, ghostForm: 0,
        saddlebags: 0, organization: 0, treasureHunter: 0
      };
      
      setHorseSkills(horseExistingSkills);
      
      // Initialize skill points from horse data or default
      setSkillPoints(selectedHorse.skillPoints || 0);
      
      console.log('🎓 Labyrinth - Initialized horse skills:', horseExistingSkills);
      console.log('🎓 Labyrinth - Horse skill points:', selectedHorse.skillPoints || 0);
    }
  }, [selectedHorse]);

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
    onUpdateResearchPoints(prev => prev - maze.researchCost);
    onUpdateUnlockedMazes(prev => ({ ...prev, [mazeKey]: true }));
  }, [canResearchMaze, onUpdateResearchPoints, onUpdateUnlockedMazes]);

  // Stable upgrade functions
  const canResearchStableUpgrade = useCallback((upgradeKey) => {
    const upgrade = STABLE_UPGRADES[upgradeKey];
    const mazeUnlocked = unlockedMazes[upgrade.unlockedBy];
    return mazeUnlocked && !stableUpgrades[upgradeKey] && researchPoints >= upgrade.researchCost;
  }, [researchPoints, stableUpgrades, unlockedMazes]);
  
  const researchStableUpgrade = useCallback((upgradeKey) => {
    if (!canResearchStableUpgrade(upgradeKey)) return;
    
    const upgrade = STABLE_UPGRADES[upgradeKey];
    onUpdateResearchPoints(prev => prev - upgrade.researchCost);
    setStableUpgrades(prev => ({ ...prev, [upgradeKey]: true }));
    
    // Pass upgrade info to parent for stable integration
    if (onHorseReturn) {
      // Create a temporary object to communicate the upgrade
      onHorseReturn(selectedHorse, { stableUpgrade: { key: upgradeKey, ...upgrade } });
    }
  }, [canResearchStableUpgrade, selectedHorse, onHorseReturn, onUpdateResearchPoints]);

  // Check if cell is visible (always visible now - no fog of war)
  const isCellVisible = useCallback(() => {
    return true; // Always visible for more exciting gameplay
  }, []);

  // Skill system functions (now per-horse)
  const getSkillLevel = useCallback((skillName) => horseSkills[skillName] || 0, [horseSkills]);

  // Teleportation effect handler
  const triggerTeleportation = useCallback((newX, newY) => {
    setIsTeleporting(true);
    setTeleportStage('dematerializing');
    
    // Dematerialization phase (300ms)
    setTimeout(() => {
      setHorsePos({ x: newX, y: newY });
      setTeleportStage('materializing');
      
      // Materialization phase (400ms)
      setTimeout(() => {
        setTeleportStage('none');
        setIsTeleporting(false);
      }, 400);
    }, 300);
  }, []);
  
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
    
    setHorseSkills(prev => ({ ...prev, [skillKey]: currentLevel + 1 }));
    setSkillPoints(prev => prev - cost);
    
    console.log(`🎓 Upgraded ${skillKey} to level ${currentLevel + 1} for horse ${selectedHorse?.name}`);
  }, [canUpgradeSkill, getSkillLevel, selectedHorse]);

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
    // Add visual feedback for all power-ups
    const powerupMessages = {
      'teleport': { text: 'TELEPORT!', color: '#8b5cf6' },
      'invisibility': { text: 'INVISIBLE!', color: '#6b7280' },
      'stun': { text: 'STUN BOMB!', color: '#f59e0b' },
      'speed': { text: 'SPEED BOOST!', color: '#3b82f6' },
      'magnet': { text: 'MAGNET!', color: '#10b981' }
    };
    
    const feedback = powerupMessages[powerup.effect];
    if (feedback) {
      addFloatingText(feedback.text, feedback.color);
      flashHorse(feedback.color);
    }
    
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
          triggerTeleportation(newPos.x, newPos.y);
        }
        break;
      
      case 'invisibility':
        setMinotaurLostTrack(powerup.duration);
        break;
      
      case 'stun':
        setMinotaurStunned(powerup.duration);
        break;
      
      case 'speed':
      case 'magnet':
        setActivePowerups(prev => [...prev, { ...powerup }]);
        break;
    }
  }, [maze, minotaurPos, getSkillLevel, addFloatingText, flashHorse]);

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
            maze[ny] && maze[ny][nx] === CELL_REWARD) {
          
          // Get the specific reward at this position for magnet collection
          const rewardAtPosition = rewardPositions.find(r => r.x === nx && r.y === ny);
          const reward = rewardAtPosition ? rewardAtPosition.rewardType : REWARDS[0]; // Fallback to first reward
          setCurrentRewards(prev => [...prev, reward]);
          
          // Add specific reward to collected items for magnet collection
          setCollectedItemsThisRun(prev => [...prev, reward]);
          
          // Remove this reward from the positions array
          setRewardPositions(prev => prev.filter(r => !(r.x === nx && r.y === ny)));
          // No floating text for magnet treasure collection
          
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
        
        // INJURY CALCULATION - Apply immediately when caught by minotaur
        const injuryChance = 0.7; // INCREASED FOR TESTING
        const difficultyMultiplier = MAZE_TYPES[selectedMazeType].difficulty;
        const injuryRoll = Math.random();
        const finalInjuryChance = injuryChance * difficultyMultiplier;
        
        console.log('🩹 MINOTAUR INJURY DEBUG - Rolling for injury:');
        console.log('  - Random roll:', injuryRoll);
        console.log('  - Required threshold:', finalInjuryChance);
        console.log('  - Will injury occur?', injuryRoll < finalInjuryChance);
        
        if (injuryRoll < finalInjuryChance) {
          console.log('🏥 HORSE INJURED BY MINOTAUR!');
          setHorseInjuredThisSession(true);
          
          const injuryMessages = ['🩹 Injured by minotaur!', '👹 Minotaur inflicted wounds!', '💔 Hurt in minotaur encounter!'];
          const injuryMessage = injuryMessages[Math.floor(Math.random() * injuryMessages.length)];
          
          // Show injury notification
          setFloatingTexts(prev => [...prev, {
            id: Date.now() + Math.random(),
            text: injuryMessage,
            color: '#ef4444',
            fontSize: '16px',
            duration: 4000
          }]);
        }
        
        // Award points based on performance and maze difficulty
        const basePoints = Math.floor(currentRewards.length / 2) + 1;
        const difficultyBonus = MAZE_TYPES[selectedMazeType].difficulty;
        const skillPointsEarned = Math.max(0, Math.floor(currentRewards.length / 4));
        const researchPointsEarned = Math.floor(basePoints * difficultyBonus * 0.2);
        setSkillPoints(prev => prev + skillPointsEarned);
        onUpdateResearchPoints(prev => prev + researchPointsEarned);
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
          
          // INJURY CALCULATION - Apply immediately when caught by minotaur (second case)
          const injuryChance = 0.7; // INCREASED FOR TESTING
          const difficultyMultiplier = MAZE_TYPES[selectedMazeType].difficulty;
          const injuryRoll = Math.random();
          const finalInjuryChance = injuryChance * difficultyMultiplier;
          
          console.log('🩹 MINOTAUR INJURY DEBUG (Path) - Rolling for injury:');
          console.log('  - Random roll:', injuryRoll);
          console.log('  - Required threshold:', finalInjuryChance);
          console.log('  - Will injury occur?', injuryRoll < finalInjuryChance);
          
          if (injuryRoll < finalInjuryChance) {
            console.log('🏥 HORSE INJURED BY MINOTAUR (Path)!');
            setHorseInjuredThisSession(true);
            
            const injuryMessages = ['🩹 Injured by minotaur!', '👹 Minotaur inflicted wounds!', '💔 Hurt in minotaur encounter!'];
            const injuryMessage = injuryMessages[Math.floor(Math.random() * injuryMessages.length)];
            
            // Show injury notification
            setFloatingTexts(prev => [...prev, {
              id: Date.now() + Math.random(),
              text: injuryMessage,
              color: '#ef4444',
              fontSize: '16px',
              duration: 4000
            }]);
          }
          
          const basePoints = Math.floor(currentRewards.length / 2) + 1;
          const difficultyBonus = MAZE_TYPES[selectedMazeType].difficulty;
          const skillPointsEarned = Math.max(0, Math.floor(currentRewards.length / 4));
          const researchPointsEarned = Math.floor(basePoints * difficultyBonus * 0.2);
          setSkillPoints(prev => prev + skillPointsEarned);
          onUpdateResearchPoints(prev => prev + researchPointsEarned);
          return { x: nextStep.x, y: nextStep.y };
        }
        
        return { x: nextStep.x, y: nextStep.y };
      }
      
      return prevPos;
    });
  }, [gameState, horsePos, findPathToHorse, currentRewards, minotaurStunned, getSkillLevel]);

  // Calculate horse performance modifiers based on stable condition
  const getHorsePerformanceModifiers = useCallback(() => {
    if (!selectedHorse) return { speed: 1, trapAvoidance: 0, treasureBonus: 1, energy: 1 };
    
    const avgCondition = (selectedHorse.happiness + selectedHorse.health + selectedHorse.energy) / 300;
    const cleanlinessBonus = selectedHorse.cleanliness / 100;
    
    return {
      speed: 0.5 + (avgCondition * 0.7), // 0.5x to 1.2x speed based on condition
      trapAvoidance: Math.floor(avgCondition * 25), // 0-25% trap avoidance
      treasureBonus: 0.8 + (cleanlinessBonus * 0.4), // 0.8x to 1.2x treasure find rate
      energy: 0.6 + (selectedHorse.energy / 100 * 0.6) // 0.6x to 1.2x energy efficiency
    };
  }, [selectedHorse]);

  // Horse movement logic
  const moveHorse = useCallback(() => {
    if (gameState !== 'exploring') return;

    setHorseMoveCount(prev => prev + 1);
    updatePowerups();
    updateMovingWalls();
    collectWithMagnet();
    
    // Skip movement if currently teleporting
    if (isTeleporting) return;

    const performanceModifiers = getHorsePerformanceModifiers();

    setHorsePos(prevPos => {
      const { x, y } = prevPos;
      let possibleMoves = [
        { x: x - 1, y, dir: 'left' },
        { x: x + 1, y, dir: 'right' },
        { x, y: y - 1, dir: 'up' },
        { x, y: y + 1, dir: 'down' }
      ];

      possibleMoves = possibleMoves.filter(move => 
        isCellPassable(move.x, move.y, x, y, maze)
      );

      const pathfinding = getSkillLevel('pathfinding');
      if (pathfinding > 0 && possibleMoves.length > 1) {
        // Find nearest treasure for treasure-seeking behavior
        let nearestTreasure = null;
        let minTreasureDist = Infinity;
        
        for (const reward of rewardPositions) {
          const treasureDist = Math.abs(x - reward.x) + Math.abs(y - reward.y);
          if (treasureDist < minTreasureDist) {
            minTreasureDist = treasureDist;
            nearestTreasure = reward;
          }
        }
        
        possibleMoves.sort((a, b) => {
          // Primary factor: Minotaur avoidance (stronger)
          const minotaurDistA = Math.abs(a.x - minotaurPos.x) + Math.abs(a.y - minotaurPos.y);
          const minotaurDistB = Math.abs(b.x - minotaurPos.x) + Math.abs(b.y - minotaurPos.y);
          const minotaurScore = (minotaurDistB - minotaurDistA) * 2; // Weight: 2x
          
          // Secondary factor: Treasure attraction (weaker, only if treasure exists)
          let treasureScore = 0;
          if (nearestTreasure && minTreasureDist <= 6) { // Only consider nearby treasures
            const treasureDistA = Math.abs(a.x - nearestTreasure.x) + Math.abs(a.y - nearestTreasure.y);
            const treasureDistB = Math.abs(b.x - nearestTreasure.x) + Math.abs(b.y - nearestTreasure.y);
            treasureScore = (treasureDistA - treasureDistB) * 0.8; // Weight: 0.8x
          }
          
          return minotaurScore + treasureScore;
        });
        
        if (Math.random() < pathfinding * 0.2) {
          possibleMoves = possibleMoves.slice(0, Math.min(2, possibleMoves.length));
        }
      }

      if (possibleMoves.length === 0) return prevPos;

      const nextMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const cell = maze[nextMove.y] ? maze[nextMove.y][nextMove.x] : CELL_EMPTY;

      // Handle portal teleportation
      if (cell === CELL_PORTAL_A && portals.B) {
        triggerTeleportation(portals.B.x, portals.B.y);
        return prevPos;
      } else if (cell === CELL_PORTAL_B && portals.A) {
        triggerTeleportation(portals.A.x, portals.A.y);
        return prevPos;
      }

      // Handle cell interactions
      if (cell === CELL_REWARD) {
        const lucky = getSkillLevel('lucky');
        const treasureHunter = getSkillLevel('treasureHunter');
        const treasureMultiplier = performanceModifiers.treasureBonus;
        
        // Get the specific reward at this position
        const rewardAtPosition = rewardPositions.find(r => r.x === nextMove.x && r.y === nextMove.y);
        const reward = rewardAtPosition ? rewardAtPosition.rewardType : REWARDS[0]; // Fallback to first reward
        setCurrentRewards(prev => [...prev, reward]);
        
        // Remove this reward from the positions array
        setRewardPositions(prev => prev.filter(r => !(r.x === nextMove.x && r.y === nextMove.y)));
        
        // Flash effect for treasure collection (no text)
        flashHorse('#fbbf24');
        
        // Add specific reward to collected items (not generic treasure)
        setCollectedItemsThisRun(prev => [...prev, reward]);
        
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
          return newMaze;
        });
      } else if (cell === CELL_POWERUP) {
        const powerup = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
        
        // Only flash effect for power-up collection - text will be shown by usePowerup()
        flashHorse('#a855f7');
        
        usePowerup(powerup);
        
        // Powerups are consumed immediately, not collected into inventory
        
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
          return newMaze;
        });
      } else if (cell === CELL_KEY) {
        const key = vaultKeys.find(k => k.x === nextMove.x && k.y === nextMove.y);
        if (key && !collectedKeys.includes(key.id)) {
          // Add visual feedback for key collection (only if not already collected)
          addFloatingText('🗝️ Key Found!', '#eab308');
          flashHorse('#eab308');
          
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
        // Pause game and show vault interaction modal
        const legendaryRewards = [
          { name: 'Ancient Treasure', emoji: '👑', tileKey: 'LEGENDARY_ANCIENT_TREASURE' },
          { name: 'Dragon Egg', emoji: '🥚', tileKey: 'LEGENDARY_DRAGON_EGG' },
          { name: 'Sacred Relic', emoji: '🏺', tileKey: 'LEGENDARY_SACRED_RELIC' }
        ];
        const potentialReward = legendaryRewards[Math.floor(Math.random() * legendaryRewards.length)];
        
        setCurrentVault({
          position: { x: nextMove.x, y: nextMove.y },
          reward: potentialReward
        });
        setShowVaultModal(true);
        // Game will be paused while modal is open
        return prevPos; // Don't move onto vault yet
      } else if (cell === CELL_TRAP) {
        const trapSense = getSkillLevel('trapSense');
        const thickSkin = getSkillLevel('thickSkin');
        
        // Horse condition affects trap avoidance
        const conditionTrapAvoidance = performanceModifiers.trapAvoidance / 100;
        const totalTrapAvoidance = (trapSense * 0.15) + conditionTrapAvoidance;
        
        if (Math.random() < totalTrapAvoidance) {
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
        
        // INJURY CALCULATION - Apply immediately when trapped
        const injuryChance = 0.8; // INCREASED FOR TESTING
        const difficultyMultiplier = MAZE_TYPES[selectedMazeType].difficulty;
        const injuryRoll = Math.random();
        const finalInjuryChance = injuryChance * difficultyMultiplier;
        
        console.log('🩹 TRAP INJURY DEBUG - Rolling for injury:');
        console.log('  - Random roll:', injuryRoll);
        console.log('  - Required threshold:', finalInjuryChance);
        console.log('  - Will injury occur?', injuryRoll < finalInjuryChance);
        
        if (injuryRoll < finalInjuryChance) {
          console.log('🏥 HORSE INJURED BY TRAP!');
          console.log('🏥 Setting horseInjuredThisSession to TRUE');
          setHorseInjuredThisSession(true);
          
          const injuryMessages = ['🩹 Injured by trap!', '💔 Trap wounds sustained!', '⚡ Badly hurt by trap!'];
          const injuryMessage = injuryMessages[Math.floor(Math.random() * injuryMessages.length)];
          
          // Show injury notification
          setFloatingTexts(prev => [...prev, {
            id: Date.now() + Math.random(),
            text: injuryMessage,
            color: '#ef4444',
            fontSize: '16px',
            duration: 4000
          }]);
        } else {
          console.log('🏥 Horse avoided trap injury');
        }
        
        // Award points based on performance and maze difficulty
        const basePoints = Math.floor(currentRewards.length / 2) + 1;
        const difficultyBonus = MAZE_TYPES[selectedMazeType].difficulty;
        const skillPointsEarned = Math.max(0, Math.floor(currentRewards.length / 4));
        const researchPointsEarned = Math.floor(basePoints * difficultyBonus * 0.2);
        setSkillPoints(prev => prev + skillPointsEarned);
        onUpdateResearchPoints(prev => prev + researchPointsEarned);
        return prevPos;
      }

      // Check for collision with lost horse
      if (lostHorse && nextMove.x === lostHorse.pos.x && nextMove.y === lostHorse.pos.y) {
        // Found the lost horse! Unlock it and pause game
        setFoundHorse(lostHorse);
        setShowLostHorseFound(true);
        setGameState('paused');
        return prevPos; // Don't move, stay in current position
      }

      return { x: nextMove.x, y: nextMove.y };
    });
  }, [gameState, maze, currentRewards, hasPowerup, updatePowerups, updateMovingWalls, collectWithMagnet, usePowerup, getSkillLevel, minotaurPos, trapHits, isCellPassable, portals, vaultKeys, collectedKeys, isTeleporting, triggerTeleportation, rewardPositions, lostHorse]);

  // Vault interaction functions
  const handleVaultUnlock = useCallback(() => {
    if (!currentVault || !availableKeys) return;
    
    // Add reward and consume key
    setCurrentRewards(prev => [...prev, currentVault.reward]);
    setCollectedKeys(prev => prev.slice(1));
    setAvailableKeys(prev => prev - 1);
    
    // Remove key from appropriate source
    const keysCollectedThisRun = collectedItemsThisRun.filter(item => item.id === 'key').length;
    if (keysCollectedThisRun > 0) {
      setCollectedItemsThisRun(prev => {
        const keyIndex = prev.findIndex(item => item.id === 'key');
        if (keyIndex !== -1) {
          return prev.filter((_, index) => index !== keyIndex);
        }
        return prev;
      });
    } else {
      setHorseInventory(prev => inventoryUtils.removeItem(prev, 'key'));
    }
    
    // Add the actual legendary reward to collected items
    setCollectedItemsThisRun(prev => [...prev, currentVault.reward]);
    
    // Close vault modal and show treasure reveal
    setShowVaultModal(false);
    setShowTreasureReveal(true);
  }, [currentVault, availableKeys, collectedItemsThisRun]);

  const handleTreasureRevealContinue = useCallback(() => {
    if (!currentVault) return;
    
    // Remove vault from maze
    setMaze(prevMaze => {
      const newMaze = prevMaze.map(row => [...row]);
      newMaze[currentVault.position.y][currentVault.position.x] = CELL_EMPTY;
      return newMaze;
    });
    
    // Move horse to vault position
    setHorsePos({ x: currentVault.position.x, y: currentVault.position.y });
    
    // Close reveal modal and resume game
    setShowTreasureReveal(false);
    setCurrentVault(null);
    
    // Visual feedback
    addFloatingText(`${selectedHorse?.name} found ${currentVault.reward.name}!`, '#dc2626');
    flashHorse('#dc2626');
  }, [currentVault, addFloatingText, flashHorse]);
  
  const handleVaultLeave = useCallback(() => {
    // Close modal and remove vault from maze so horse can continue
    setShowVaultModal(false);
    
    // Remove vault from maze (same as unlock but without rewards)
    if (currentVault) {
      setMaze(prevMaze => {
        const newMaze = prevMaze.map(row => [...row]);
        newMaze[currentVault.position.y][currentVault.position.x] = CELL_EMPTY;
        return newMaze;
      });
    }
    
    setCurrentVault(null);
  }, [currentVault]);

  // Game loop
  useEffect(() => {
    if (gameState === 'exploring' && !showVaultModal && !showTreasureReveal) {
      const performanceModifiers = getHorsePerformanceModifiers();
      const adjustedGameSpeed = gameSpeed / performanceModifiers.speed;
      
      const timer = setTimeout(() => {
        moveHorse();
        
        if (hasPowerup('speed') && horseMoveCount % 2 === 0) {
          setTimeout(moveHorse, adjustedGameSpeed / 4);
        }
        
        const swiftness = getSkillLevel('swiftness');
        if (swiftness > 0 && Math.random() < swiftness * 0.1) {
          setTimeout(moveHorse, adjustedGameSpeed / 3);
        }
        
        // Minotaur moves at regular speed
        if (Math.random() < 0.7) {
          moveMinotaur();
        }
        
        // Lost horse moves occasionally (slower than minotaur)
        if (lostHorse && Math.random() < 0.3) {
          moveLostHorse();
        }
      }, adjustedGameSpeed);
      return () => clearTimeout(timer);
    }
  }, [gameState, moveHorse, moveMinotaur, gameSpeed, horsePos, minotaurPos, hasPowerup, horseMoveCount, getSkillLevel, getHorsePerformanceModifiers, lostHorse, moveLostHorse]);

  const startGame = () => {
    console.log('🚀 StartGame - Debug info:');
    console.log('  - gameState:', gameState);
    console.log('  - currentRewards.length:', currentRewards.length);
    console.log('  - collectedItemsThisRun.length:', collectedItemsThisRun.length);
    console.log('  - currentRewards:', currentRewards);
    console.log('  - collectedItemsThisRun:', collectedItemsThisRun);
    
    // Check if there are unreturned rewards from previous run
    if (gameState === 'ended' && (currentRewards.length > 0 || collectedItemsThisRun.length > 0)) {
      console.log('🚀 StartGame - Found unreturned items, checking what to do...');
      
      if (collectedItemsThisRun.length > 0) {
        // Check if we have inventory space to auto-add items and continue
        const currentInventoryCount = selectedHorse?.inventory?.length || 0;
        const baseSlotsCount = 4;
        const saddlebagsLevel = getSkillLevel('saddlebags');
        const maxSlots = baseSlotsCount + saddlebagsLevel;
        const availableSlots = maxSlots - currentInventoryCount;
        
        console.log('🚀 StartGame - Inventory check:');
        console.log('  - Current inventory:', currentInventoryCount);
        console.log('  - Max slots:', maxSlots);
        console.log('  - Available slots:', availableSlots);
        console.log('  - Items to add:', collectedItemsThisRun.length);
        
        if (collectedItemsThisRun.length <= availableSlots) {
          // We have space - add items to inventory and continue with new run
          console.log('🚀 StartGame - Auto-adding items and starting new run');
          
          // Process items silently without exiting to stable
          let updatedInventory = [...(selectedHorse.inventory || [])];
          const dynamicMaxSlots = 4 + (selectedHorse.skills?.saddlebags || 0);
          
          collectedItemsThisRun.forEach(item => {
            const result = inventoryUtils.addItem(updatedInventory, item, dynamicMaxSlots);
            if (result.success) {
              updatedInventory = result.inventory;
            }
          });
          
          // Update horse inventory in parent component
          if (selectedHorse && onHorseReturn) {
            const updatedHorse = {
              ...selectedHorse,
              inventory: updatedInventory
            };
            onHorseReturn(updatedHorse);
          }
          
          // Clear collected items and continue to new run
          setCollectedItemsThisRun([]);
          setCurrentRewards([]);
        } else {
          // Inventory full - use existing flow with modal
          console.log('🚀 StartGame - Inventory full, showing management modal');
          exitLabyrinth();
          return;
        }
      } else {
        // If only currentRewards (which are just display rewards), clear them and continue to new game
        console.log('🚀 StartGame - Only display rewards, clearing and continuing to new game');
        setCurrentRewards([]);
      }
    }
    
    console.log('🚀 StartGame - Starting new game directly');
    
    // Regenerate maze if: type changed OR starting a new adventure after a completed/active run
    const shouldRegenerateMaze = 
      selectedMazeType !== lastGeneratedMazeType || 
      gameState === 'ended' || 
      gameState === 'exploring';
      
    if (shouldRegenerateMaze) {
      console.log('🚀 StartGame - Regenerating maze (type change or new adventure)');
      const newMaze = generateMaze();
      setMaze(newMaze);
      setLastGeneratedMazeType(selectedMazeType);
    }
    
    // Always check for lost horse spawn on every game start
    setTimeout(() => {
      const hasLostHorse = checkForLostHorseSpawn();
      if (hasLostHorse) {
        console.log('🐴 Lost horse spawned in maze!');
        return; // Don't start game yet, wait for announcement modal
      }
      // Continue with normal game start if no lost horse
      startGameAfterAnnouncement();
    }, 100);
  };
  
  const startGameAfterAnnouncement = (keepLostHorse = false) => {
    // Reset positions
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
    // Reset session injury flag for new runs
    setHorseInjuredThisSession(false);
    // Reset available keys to horse's starting inventory keys
    setAvailableKeys(inventoryUtils.getItemCount(selectedHorse?.inventory || [], 'key'));
    
    // Only reset lost horse state if not keeping it
    if (!keepLostHorse) {
      setLostHorse(null);
      setShowLostHorseAnnouncement(false);
      setShowLostHorseFound(false);
      setFoundHorse(null);
    } else {
      // Just close the announcement modal but keep the lost horse
      setShowLostHorseAnnouncement(false);
    }
  };

  const exitLabyrinth = () => {
    console.log('🚪 EXIT LABYRINTH DEBUG - Function called');
    console.log('  - horseInjuredThisSession:', horseInjuredThisSession);
    console.log('  - gameState:', gameState);
    
    const currentInventoryCount = selectedHorse?.inventory?.length || 0;
    const baseSlotsCount = 4;
    const saddlebagsLevel = getSkillLevel('saddlebags');
    const maxSlots = baseSlotsCount + saddlebagsLevel;
    const availableSlots = maxSlots - currentInventoryCount;
    
    console.log('🎒 ExitLabyrinth - Inventory check:');
    console.log('  - Current inventory count:', currentInventoryCount);
    console.log('  - Base slots:', baseSlotsCount);
    console.log('  - Saddlebags level:', saddlebagsLevel);
    console.log('  - Max slots:', maxSlots);
    console.log('  - Available slots:', availableSlots);
    console.log('  - Collected items this run:', collectedItemsThisRun.length);
    console.log('  - Need modal?', collectedItemsThisRun.length > availableSlots);
    
    // If we collected more items than we can carry, show selection modal
    if (collectedItemsThisRun.length > availableSlots) {
      console.log('🎒 ExitLabyrinth - Showing item selection modal');
      setShowItemSelection(true);
      return;
    }
    
    console.log('🎒 ExitLabyrinth - Adding all items directly');
    // If we can carry all items, add them directly
    returnHorseWithItems(collectedItemsThisRun);
  };


  const returnHorseWithItems = (itemsToKeep, discardedIndices = []) => {
    console.log('🔍 RETURN HORSE DEBUG - Function called');
    console.log('  - horseInjuredThisSession:', horseInjuredThisSession);
    console.log('  - selectedHorse.isInjured:', selectedHorse?.isInjured);
    console.log('  - endReason:', endReason);
    
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
      
      // Add selected items with dynamic slot calculation
      const dynamicMaxSlots = 4 + (selectedHorse.skills?.saddlebags || 0);
      console.log('🎒 ReturnHorseWithItems - Adding items:');
      console.log('  - Items to keep:', itemsToKeep);
      console.log('  - Dynamic max slots:', dynamicMaxSlots);
      console.log('  - Starting inventory:', updatedInventory);
      
      itemsToKeep.forEach((item, index) => {
        console.log(`  - Processing item ${index + 1}:`, item);
        const result = inventoryUtils.addItem(updatedInventory, item, dynamicMaxSlots);
        console.log(`  - Add result:`, result);
        if (result.success) {
          updatedInventory = result.inventory;
          console.log(`  - Updated inventory:`, updatedInventory);
        } else {
          console.log(`  - Failed to add item:`, result.reason);
        }
      });
      
      console.log('🎒 ReturnHorseWithItems - Final inventory:', updatedInventory);
      
      // Apply fatigue and potential injury from labyrinth run
      const fatigueFromRun = Math.min(20, horseMoveCount * 0.5); // More movement = more fatigue
      const injuryChance = (endReason === 'trap') ? 0.8 : (endReason === 'minotaur') ? 0.7 : 0.5; // INCREASED FOR TESTING
      const difficultyMultiplier = MAZE_TYPES[selectedMazeType].difficulty;
      
      console.log('🩹 INJURY DEBUG - Calculating injury chance:');
      console.log('  - End reason:', endReason);
      console.log('  - Base injury chance:', injuryChance);
      console.log('  - Difficulty multiplier:', difficultyMultiplier);
      console.log('  - Final injury chance:', injuryChance * difficultyMultiplier);
      
      let healthReduction = 0;
      let energyReduction = fatigueFromRun;
      let happinessChange = 0;
      
      // Check if horse was injured during this session or roll for new injury
      let isInjured = horseInjuredThisSession; // Use session injury status
      let injuryMessage = '';
      
      console.log('🩹 INJURY DEBUG - Checking injury status:');
      console.log('  - Horse injured this session?', horseInjuredThisSession);
      console.log('  - Horse already injured?', selectedHorse.isInjured);
      
      if (horseInjuredThisSession && !selectedHorse.isInjured) {
        // Apply injury damage since horse got injured this session
        healthReduction = Math.random() * 25 + 10; // 10-35 health loss
        happinessChange = -15; // Injury makes horses unhappy
        energyReduction += 20; // Extra fatigue from injury
        console.log('🩹 APPLYING SESSION INJURY - Health reduction:', healthReduction);
      } else if (!horseInjuredThisSession && !selectedHorse.isInjured) {
        // Fallback: roll for injury if somehow wasn't calculated during game
        const injuryRoll = Math.random();
        const finalInjuryChance = injuryChance * difficultyMultiplier;
        
        console.log('🩹 FALLBACK INJURY ROLL:');
        console.log('  - Random roll:', injuryRoll);
        console.log('  - Required threshold:', finalInjuryChance);
        
        if (injuryRoll < finalInjuryChance) {
          healthReduction = Math.random() * 25 + 10; // 10-35 health loss
          happinessChange = -15; // Injury makes horses unhappy
          energyReduction += 20; // Extra fatigue from injury
          isInjured = true; // Mark horse as injured
          console.log('🩹 FALLBACK INJURY APPLIED - Health reduction:', healthReduction);
        }
      }
      
      // Apply success bonus if not injured
      if (endReason === 'success' && !isInjured) {
        happinessChange = 10; // Successful runs make horses happy
      }
      
      const updatedHorse = {
        ...selectedHorse,
        inventory: updatedInventory,
        health: Math.max(0, selectedHorse.health - healthReduction),
        energy: Math.max(0, selectedHorse.energy - energyReduction),
        happiness: Math.max(0, Math.min(100, selectedHorse.happiness + happinessChange)),
        isInjured: isInjured || selectedHorse.isInjured || false, // Keep existing injury status or add new one
        cleanliness: Math.max(0, selectedHorse.cleanliness - (fatigueFromRun * 0.3)), // Gets dirty from adventure
        lastLabyrinthRun: Date.now(),
        runsSinceRest: (selectedHorse.runsSinceRest || 0) + 1,
        // Save horse's skills and skill points
        skills: horseSkills,
        skillPoints: skillPoints
      };
      
      console.log('🎒 Labyrinth - Returning horse with updated stats:');
      console.log('  - Health change:', -healthReduction);
      console.log('  - Energy change:', -energyReduction);
      console.log('  - Happiness change:', happinessChange);
      console.log('  - Injury sustained:', isInjured ? 'YES' : 'No');
      console.log('  - Final inventory:', updatedInventory);
      console.log('  - Skills being saved:', horseSkills);
      console.log('  - Skill points being saved:', skillPoints);
      console.log('  - Updated horse object:', updatedHorse);
      
      console.log('🔥 CRITICAL DEBUG - Horse being returned to stable:');
      console.log('  - updatedHorse.isInjured:', updatedHorse.isInjured);
      console.log('  - updatedHorse.health:', updatedHorse.health);
      console.log('  - updatedHorse.happiness:', updatedHorse.happiness);
      console.log('  - About to call onHorseReturn with:', updatedHorse);
      
      // Update the session injury flag to prevent new adventures
      if (isInjured && !selectedHorse.isInjured) {
        console.log('🏥 Horse got injured in labyrinth - marking session as injured to prevent new adventures');
        setHorseInjuredThisSession(true);
      }
      
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
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <TileSprite tileX={getRandomEmptyTile(x, y).x} tileY={getRandomEmptyTile(x, y).y} />
          <img 
            src={selectedHorse?.avatar || "/maze/horse_player.png"} 
            alt="Horse" 
            className={horseDirection === 'left' ? 'horse-flipped' : ''}
            style={{
              ...baseStyle,
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: teleportStage === 'dematerializing' ? 0.2 : 
                       teleportStage === 'materializing' ? 0.8 : 1,
              backgroundColor: 'transparent',
              filter: teleportStage === 'dematerializing' ? 'blur(2px) brightness(1.5)' :
                      teleportStage === 'materializing' ? 'drop-shadow(0 0 12px #8b5cf6) brightness(1.3)' :
                      horseFlash ? `drop-shadow(0 0 8px ${horseFlash})` : 'none',
              transition: teleportStage !== 'none' ? 'opacity 0.3s ease-out, filter 0.3s ease-out' : 'filter 0.1s ease-out',
              transform: teleportStage === 'dematerializing' ? 'scale(0.9)' : 
                        teleportStage === 'materializing' ? 'scale(1.1)' : 'scale(1)',
              transitionProperty: teleportStage !== 'none' ? 'opacity, filter, transform' : 'filter'
            }} 
          />
          {/* Sparkle effects during materialization */}
          {teleportStage === 'materializing' && (
            <div className="teleport-sparkles" />
          )}
        </div>
      );
    }
    if (lostHorse && lostHorse.pos.x === x && lostHorse.pos.y === y) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <TileSprite tileX={getRandomEmptyTile(x, y).x} tileY={getRandomEmptyTile(x, y).y} />
          <img 
            src={lostHorse.avatar} 
            alt="Lost Horse" 
            className={lostHorse.direction === 'left' ? 'horse-flipped' : ''}
            style={{
              ...baseStyle,
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 1,
              backgroundColor: 'transparent'
            }}
          />
          {/* Small indicator to show it's a lost horse */}
          <div style={{ 
            position: 'absolute', 
            top: '8px', 
            right: '4px', 
            color: 'gold', 
            fontSize: '12px', 
            fontWeight: 'bold',
            textShadow: '1px 1px 2px black',
            lineHeight: '1'
          }}>
            ?
          </div>
        </div>
      );
    }
    if (minotaurPos.x === x && minotaurPos.y === y) {
      if (minotaurStunned > 0) {
        return renderSpecialTile('MINOTAUR_STUNNED', x, y, minotaurDirection);
      }
      if (minotaurLostTrack > 0) {
        return renderSpecialTile('MINOTAUR_LOST', x, y, minotaurDirection);
      }
      return renderSpecialTile('MINOTAUR', x, y, minotaurDirection);
    }
    
    // Check water cells (flooded maze)
    const isWater = waterCells.some(w => w.x === x && w.y === y);
    if (isWater) {
      return renderSpecialTile('WATER', x, y);
    }
    
    // Check time zones (temporal maze)
    const timeZone = timeZones.find(t => t.x === x && t.y === y);
    if (timeZone) {
      const tileKey = timeZone.type === 'slow' ? 'TIME_SLOW' : 'TIME_FAST';
      return renderSpecialTile(tileKey, x, y);
    }
    
    // Check phasing walls
    const phasingWall = phasingWalls.find(p => p.x === x && p.y === y);
    if (phasingWall) {
      const tileKey = phasingWall.solid ? 'PHASE_SOLID' : 'PHASE_ETHEREAL';
      return renderSpecialTile(tileKey, x, y);
    }
    
    // Check rotating gears
    const gear = rotatingGears.find(g => g.x === x && g.y === y);
    if (gear) {
      return renderSpecialTile('GEAR', x, y);
    }
    
    // Check moving walls
    const movingWall = movingWalls.find(w => w.x === x && w.y === y);
    if (movingWall) {
      const tileKey = movingWall.closed ? 'DOOR_CLOSED' : 'DOOR_OPEN';
      return renderSpecialTile(tileKey, x, y);
    }
    
    // Special handling for CELL_EMPTY to use random variants
    if (cell === CELL_EMPTY) {
      const emptyTile = getRandomEmptyTile(x, y);
      return <TileSprite tileX={emptyTile.x} tileY={emptyTile.y} />;
    }
    
    // Special handling for CELL_WALL to use position-specific variants
    if (cell === CELL_WALL) {
      const wallTile = getWallTile(x, y, maze);
      return <TileSprite tileX={wallTile.x} tileY={wallTile.y} />;
    }
    
    // Special handling for CELL_REWARD to use specific reward tile
    if (cell === CELL_REWARD) {
      const rewardAtPosition = rewardPositions.find(r => r.x === x && r.y === y);
      if (rewardAtPosition) {
        return renderSpecialTile(rewardAtPosition.rewardType.tileKey, x, y);
      }
      // Fallback to generic reward tile if position not found
      return renderSpecialTile('REWARD_GOLDEN_APPLE', x, y);
    }
    
    // Use tileset for all basic cell types
    const tileMapping = TILE_MAP[cell];
    if (tileMapping) {
      // Check if this tile has transparent background
      if (TILES_WITH_TRANSPARENT_BACKGROUND.has(cell)) {
        return (
          <LayeredTile 
            backgroundTile={getRandomEmptyTile(x, y)} 
            foregroundTile={tileMapping} 
          />
        );
      }
      // Regular tile without transparent background
      return <TileSprite tileX={tileMapping.x} tileY={tileMapping.y} />;
    }
    
    // Fallback for any unmapped cells (use random empty path tile)
    const emptyTile = getRandomEmptyTile(x, y);
    return <TileSprite tileX={emptyTile.x} tileY={emptyTile.y} />;
  };

  const getInventoryCount = (itemName) => {
    return inventory.filter(item => item.name === itemName).length;
  };

  // Helper function to get tile coordinates for inventory items
  const getItemTileCoords = (item) => {
    // Handle reward items
    if (item.name === 'Golden Apple') return TILE_MAP.REWARD_GOLDEN_APPLE;
    if (item.name === 'Magic Carrot') return TILE_MAP.REWARD_MAGIC_CARROT;
    if (item.name === 'Hay Bundle') return TILE_MAP.REWARD_HAY_BUNDLE;
    
    // Handle other labyrinth items
    if (item.id === 'key' || item.name === 'Key') return TILE_MAP[CELL_KEY];
    if (item.id === 'vault_treasure' || item.name === 'Vault Treasure') return TILE_MAP[CELL_VAULT];
    // Note: powerups are not included since they're consumed immediately, never stored in inventory
    
    // Fallback to null if no tile mapping exists
    return null;
  };

  const uniqueInventoryItems = [...new Set(inventory.map(item => item.name))]
    .map(name => {
      const item = inventory.find(i => i.name === name);
      return { ...item, count: getInventoryCount(name) };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${labyrinthStyles.background} flex flex-col`}>
      <div className="flex-1 flex flex-col w-full" style={{ padding: window.innerWidth < 640 ? '12px' : '16px' }}>
        
        {/* Header with Title and Back Button */}
        <div className="flex items-center justify-between mb-3">
          <h1 className={`screen-header ${currentTheme === 'saturday' ? 'saturday-title' : ''}`} style={{ color: labyrinthStyles.reward }}>
            Labyrinth
          </h1>
          
          {/* Coins and Back Button */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: window.innerWidth < 640 ? '4px' : '12px',
              flexWrap: 'wrap'
            }}
          >
            <div 
              style={{
                fontSize: window.innerWidth < 640 ? '8px' : '10px',
                backgroundColor: '#fef3c7',
                padding: window.innerWidth < 640 ? '2px 4px' : '2px 6px',
                borderRadius: '10px',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                color: '#000'
              }}
            >
              <span>💰</span>
              <span>{coins}</span>
            </div>
            {onBack && (
              <button
                onClick={exitLabyrinth}
                className={themeUtils.getComponentStyles(currentTheme, 'button', 'warning')}
                style={{
                  padding: window.innerWidth < 640 ? '6px 12px' : '8px 20px',
                  fontSize: window.innerWidth < 640 ? '8px' : '10px',
                  flex: 'none',
                  minWidth: window.innerWidth < 640 ? '0' : 'auto',
                  letterSpacing: window.innerWidth < 640 ? '0.5px' : '1px'
                }}
              >
                Back
              </button>
            )}
          </div>
        </div>

        {/* 1. Mobile-optimized Maze Display */}
        <div className={`${themeUtils.getComponentStyles(currentTheme, 'card')} rounded-xl p-4 shadow-lg mb-3`}>
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
            className={`border-2 border-gray-800 w-full rounded-lg overflow-hidden shadow-inner relative`}
            style={{ backgroundColor: labyrinthStyles.wall }}
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 0,
              aspectRatio: '1/1'
            }}
          >
            {/* CSS for character flipping and teleportation */}
            <style jsx>{`
              .minotaur-flipped {
                transform: scaleX(-1);
              }
              .horse-flipped {
                transform: scaleX(-1);
              }
              @keyframes sparkle {
                0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
                50% { opacity: 1; transform: scale(1) rotate(180deg); }
              }
              .teleport-sparkles {
                position: absolute;
                width: 100%;
                height: 100%;
                pointer-events: none;
              }
              .teleport-sparkles::before {
                content: '✨';
                position: absolute;
                top: 10%;
                left: 20%;
                animation: sparkle 0.6s ease-in-out;
              }
              .teleport-sparkles::after {
                content: '⭐';
                position: absolute;
                bottom: 20%;
                right: 15%;
                animation: sparkle 0.8s ease-in-out 0.2s;
              }
            `}</style>
              {(() => {
                // Calculate viewport bounds based on horse position
                const viewport = getViewportBounds(horsePos.x, horsePos.y);
                
                // Debug viewport and lost horse position (only log once per position change)
                if (lostHorse) {
                  const isInViewport = lostHorse.pos.x >= viewport.startX && lostHorse.pos.x < viewport.startX + VIEWPORT_SIZE &&
                                      lostHorse.pos.y >= viewport.startY && lostHorse.pos.y < viewport.startY + VIEWPORT_SIZE;
                  if (isInViewport) {
                    console.log('🔍 LOST HORSE IS IN VIEWPORT:', {
                      viewport: `(${viewport.startX}-${viewport.startX + VIEWPORT_SIZE - 1}, ${viewport.startY}-${viewport.startY + VIEWPORT_SIZE - 1})`,
                      playerPos: `(${horsePos.x}, ${horsePos.y})`,
                      lostHorsePos: `(${lostHorse.pos.x}, ${lostHorse.pos.y})`,
                      isInViewport: isInViewport
                    });
                  }
                }
                
                // Always create exactly 6x6 grid, padding with walls where needed
                const visibleRows = [];
                for (let viewY = 0; viewY < VIEWPORT_SIZE; viewY++) {
                  const mazeY = viewport.startY + viewY;
                  const visibleRow = [];
                  
                  for (let viewX = 0; viewX < VIEWPORT_SIZE; viewX++) {
                    const mazeX = viewport.startX + viewX;
                    
                    // Use maze cell if within bounds, otherwise use wall
                    if (mazeY >= 0 && mazeY < maze.length && mazeX >= 0 && mazeX < maze[mazeY].length) {
                      visibleRow.push({ cell: maze[mazeY][mazeX], x: mazeX, y: mazeY });
                    } else {
                      visibleRow.push({ cell: CELL_WALL, x: mazeX, y: mazeY });
                    }
                  }
                  
                  visibleRows.push({ row: visibleRow, y: mazeY });
                }
                
                return visibleRows.map((rowData, rowIndex) => (
                  <div 
                    key={rowData.y}
                    style={{ 
                      display: 'flex',
                      lineHeight: 0,
                      flex: '1',
                      width: '100%'
                    }}
                  >
                    {rowData.row.map((cellData, cellIndex) => (
                      <div
                        key={`${cellData.x}-${cellData.y}`}
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
                        {getCellDisplay(cellData.cell, cellData.x, cellData.y)}
                      </div>
                    ))}
                </div>
                ));
              })()}
              
              {/* Floating Text Overlay */}
              {floatingTexts
                .slice()
                .sort((a, b) => a.timestamp - b.timestamp) // Sort by oldest first for stable stacking
                .map((ft, stackIndex) => {
                  // Calculate horse position within the 6x6 viewport
                  const viewport = getViewportBounds(horsePos.x, horsePos.y);
                  const viewportHorseX = horsePos.x - viewport.startX;
                  const viewportHorseY = horsePos.y - viewport.startY;
                  
                  const cellSize = 100 / VIEWPORT_SIZE;
                  const horseX = (viewportHorseX * cellSize) + (cellSize / 2);
                  const horseY = (viewportHorseY * cellSize) + (cellSize / 2);
                  const age = Date.now() - ft.timestamp;
                  const opacity = Math.max(0, 1 - (age / 2000));
                  
                  // Smoother float animation with easing
                  const floatDistance = Math.min(age * 0.03, 60); // Cap max float distance
                  const baseOffset = stackIndex * 18; // Slightly more spacing
                  const totalOffset = -(baseOffset + floatDistance);
                  
                  return (
                    <div
                      key={ft.id}
                      style={{
                        position: 'absolute',
                        left: `${horseX}%`,
                        top: `${horseY}%`,
                        transform: `translate(-50%, -50%) translateY(${totalOffset}px)`,
                        color: ft.color,
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
                        opacity: opacity,
                        pointerEvents: 'none',
                        zIndex: 20 + stackIndex,
                        whiteSpace: 'nowrap',
                        transition: 'opacity 0.1s ease-out'
                      }}
                    >
                      {ft.text}
                    </div>
                  );
                })}
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
                {endReason === 'early_exit' && (
                  <p className="text-orange-600">🚪 Exited early with collected treasures!</p>
                )}
              </div>
            )}
          </div>

          {/* Mobile-optimized Controls */}
          <div className="space-y-3">
            {/* Primary Action Buttons */}
            {gameState === 'exploring' ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setEndReason('early_exit');
                    setGameState('ended');
                    setInventory(prev => [...prev, ...currentRewards]);
                    // Award partial points for early exit
                    const basePoints = Math.floor(currentRewards.length / 3) + 1;
                    const difficultyBonus = MAZE_TYPES[selectedMazeType].difficulty;
                    const skillPointsEarned = Math.max(0, Math.floor(currentRewards.length / 6));
                    const researchPointsEarned = Math.floor(basePoints * difficultyBonus * 0.1);
                    setSkillPoints(prev => prev + skillPointsEarned);
                    onUpdateResearchPoints(prev => prev + researchPointsEarned);
                  }}
                  className={`py-3 ${themeUtils.getComponentStyles(currentTheme, 'button', 'warning')} font-medium text-base shadow-md`}
                >
                  🚪 End Run
                </button>
                <button
                  onClick={startGame}
                  disabled={true}
                  className={`py-3 ${themeUtils.getComponentStyles(currentTheme, 'button', 'muted')} cursor-not-allowed font-medium text-base shadow-md`}
                >
                  🔄 New Adventure
                </button>
              </div>
            ) : (
              <button
                onClick={startGame}
                disabled={gameState === 'exploring' || selectedHorse.isInjured || horseInjuredThisSession}
                className={`w-full py-3 ${themeUtils.getComponentStyles(currentTheme, 'button', 'success')} font-medium shadow-md`}
                style={{ fontSize: currentTheme === 'saturday' ? '12px' : undefined }}
              >
                {(selectedHorse.isInjured || horseInjuredThisSession) ? 'Horse is Injured - Cannot Enter' : gameState === 'waiting' ? 'Start Adventure' : '🔄 New Adventure'}
              </button>
            )}
            
            {/* Settings Row */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedMazeType}
                onChange={(e) => setSelectedMazeType(e.target.value)}
                className={`px-3 py-2 text-sm ${themeUtils.getComponentStyles(currentTheme, 'input')}`}
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
                className={`px-3 py-2 text-sm ${themeUtils.getComponentStyles(currentTheme, 'input')}`}
                disabled={gameState === 'exploring'}
              >
                <option value={1200}>Slow</option>
                <option value={800}>Normal</option>
                <option value={400}>Fast</option>
                <option value={200}>Very Fast</option>
              </select>
            </div>
            
            {/* Secondary Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowSkillTree(!showSkillTree)}
                className={`px-3 py-2 ${themeUtils.getComponentStyles(currentTheme, 'button', 'secondary')} font-medium`}
                style={{ fontSize: currentTheme === 'saturday' ? '10px' : '14px' }}
              >
                Skills ({skillPoints})
              </button>
              
              <button
                onClick={() => setShowResearchTree(!showResearchTree)}
                className={`px-3 py-2 ${themeUtils.getComponentStyles(currentTheme, 'button', 'primary')} font-medium shadow-md`}
                style={{ fontSize: currentTheme === 'saturday' ? '10px' : '14px' }}
              >
                Research ({researchPoints})
              </button>
            </div>
          </div>
        </div>

        {/* 2. Horse Display with Inventory */}
        {selectedHorse && (
          <div className={`${themeUtils.getComponentStyles(currentTheme, 'card')} rounded-xl p-4 shadow-lg mb-3`}>
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
                
                {/* Horse Condition Display */}
                <div className="grid grid-cols-4 gap-1 mt-2 text-xs">
                  <div className="text-center">
                    <div className={`text-xs font-bold ${selectedHorse.happiness >= 80 ? 'text-green-600' : selectedHorse.happiness >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      😊 {Math.round(selectedHorse.happiness)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-bold ${selectedHorse.health >= 80 ? 'text-green-600' : selectedHorse.health >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      ❤️ {Math.round(selectedHorse.health)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-bold ${selectedHorse.energy >= 80 ? 'text-green-600' : selectedHorse.energy >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      ⚡ {Math.round(selectedHorse.energy)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-bold ${selectedHorse.cleanliness >= 80 ? 'text-green-600' : selectedHorse.cleanliness >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      🧼 {Math.round(selectedHorse.cleanliness)}
                    </div>
                  </div>
                </div>
                
                {/* Performance Indicators */}
                <div className="mt-1 text-xs text-gray-500">
                  {(() => {
                    const modifiers = getHorsePerformanceModifiers();
                    return `Speed: ${Math.round(modifiers.speed * 100)}% | Treasure: ${Math.round(modifiers.treasureBonus * 100)}% | Trap Avoid: ${modifiers.trapAvoidance}%`;
                  })()}
                </div>
                
                {/* Condition Warnings */}
                {(selectedHorse.health < 50 || selectedHorse.energy < 30 || selectedHorse.isInjured) && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-xs text-red-700 font-semibold flex items-center gap-1">
                      ⚠️ WARNING
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      {selectedHorse.isInjured && "This horse is INJURED and cannot enter the labyrinth! Return to stable for healing. "}
                      {selectedHorse.health < 50 && "This horse is injured and needs medical care! "}
                      {selectedHorse.energy < 30 && "This horse is exhausted and needs rest! "}
                      Sending weak horses on adventures increases injury risk.
                    </div>
                  </div>
                )}
                
                {(selectedHorse.runsSinceRest || 0) >= 3 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-xs text-yellow-700 font-semibold flex items-center gap-1">
                      😴 TIRED
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      This horse has been on {selectedHorse.runsSinceRest} recent adventures. Consider letting them rest in the stable.
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Inventory Grid */}
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 + getSkillLevel('saddlebags') }).map((_, index) => {
                const item = selectedHorse.inventory?.[index];
                return (
                  <div
                    key={index}
                    className={`aspect-square border-2 border-dashed rounded-lg flex items-center justify-center ${
                      item ? 'bg-white border-solid border-purple-300' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    {item ? (
                      (() => {
                        const tileCoords = getItemTileCoords(item);
                        if (tileCoords) {
                          return (
                            <div className="w-12 h-12 flex items-center justify-center" title={item.name}>
                              <TileSprite tileX={tileCoords.x} tileY={tileCoords.y} />
                            </div>
                          );
                        } else {
                          return (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-contain"
                              title={item.name}
                            />
                          );
                        }
                      })()
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
        {(trapHits > 0 || Object.values(horseSkills).some(level => level > 0) || collectedKeys.length > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 shadow-sm">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              🐎 Horse Status
            </h4>
            <div className="text-sm space-y-1">
              {trapHits > 0 && <div>❤️ Trap Hits: {trapHits}/{getSkillLevel('thickSkin')}</div>}
              {collectedKeys.length > 0 && <div>🗝️ Keys Collected: {collectedKeys.length}</div>}
              {getSkillLevel('pathfinding') > 0 && <div>🧭 Smart Movement Active</div>}
            </div>
          </div>
        )}

        {/* Current Run Rewards */}
        {currentRewards.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-yellow-800">🏆 Current Run Rewards</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentRewards.map((reward, idx) => (
                <span key={idx} className="bg-yellow-200 px-3 py-1 rounded-full text-xs font-medium">
                  {reward.emoji} {reward.name}
                </span>
              ))}
            </div>
            <div className="text-xs text-yellow-700 mt-2">
              💡 Sell treasures to earn coins and stable resources!
            </div>
          </div>
        )}
      </div>

      {/* Mobile Skill Tree Modal */}
      {showSkillTree && (
        <div className={`${themeUtils.getComponentStyles(currentTheme, 'modal')} z-50`}>
          <div className={`${themeUtils.getComponentStyles(currentTheme, 'modalContent')} rounded-xl w-full max-h-[85vh] overflow-hidden shadow-2xl`}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  💎 {selectedHorse?.name}'s Skills
                </h2>
                <p className="text-sm text-gray-600">
                  {skillPoints} skill points available
                </p>
              </div>
              <button
                onClick={() => setShowSkillTree(false)}
                className={`${themeUtils.getComponentStyles(currentTheme, 'button', 'muted')} text-xl`}
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
        <div className={`${themeUtils.getComponentStyles(currentTheme, 'modal')} z-50`}>
          <div className={`${themeUtils.getComponentStyles(currentTheme, 'modalContent')} rounded-xl w-full max-h-[85vh] overflow-hidden shadow-2xl`}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                🔬 Research ({researchPoints} points)
              </h2>
              <button
                onClick={() => setShowResearchTree(false)}
                className={`${themeUtils.getComponentStyles(currentTheme, 'button', 'muted')} text-xl`}
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
                    
                    {/* Mazes */}
                    <div className="space-y-2 mb-3">
                      <h4 className="text-sm font-medium text-gray-700">🏰 Maze Types</h4>
                      {category.mazes.map(mazeKey => {
                        const maze = MAZE_TYPES[mazeKey];
                        const isUnlocked = maze.unlocked || unlockedMazes[mazeKey];
                        const canResearch = canResearchMaze(mazeKey);
                        const hasEnoughPoints = researchPoints >= maze.researchCost;
                        
                        return (
                          <div key={mazeKey} className={`flex items-center justify-between p-2 rounded ${
                            isUnlocked ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                          }`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium text-sm ${isUnlocked ? 'text-green-800' : 'text-gray-800'}`}>
                                  {maze.name}
                                </span>
                                <span className="text-yellow-600">{'⭐'.repeat(maze.difficulty)}</span>
                                {isUnlocked && <span className="text-green-600">✓</span>}
                                {!isUnlocked && !hasEnoughPoints && <span className="text-red-500">💰</span>}
                              </div>
                              <div className="text-xs text-gray-600">{maze.description}</div>
                              <div className="text-xs text-blue-600 mt-1">
                                Features: {maze.mechanics.join(', ')}
                              </div>
                              {!isUnlocked && (
                                <div className={`text-xs mt-1 flex items-center gap-2 ${
                                  hasEnoughPoints ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  <span>Cost: {maze.researchCost} 🔬</span>
                                  <span>|</span>
                                  <span>Available: {researchPoints} 🔬</span>
                                  {hasEnoughPoints ? 
                                    <span className="text-green-600">✓ Ready to unlock!</span> : 
                                    <span className="text-red-600">Need {maze.researchCost - researchPoints} more</span>
                                  }
                                </div>
                              )}
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
                                title={canResearch ? 
                                  `Unlock ${maze.name} for ${maze.researchCost} research points` : 
                                  `Need ${maze.researchCost - researchPoints} more research points`
                                }
                              >
                                {hasEnoughPoints ? 'Unlock' : `${maze.researchCost} 🔬`}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Stable Upgrades */}
                    <div className="space-y-2 border-t border-gray-200 pt-3">
                      <h4 className="text-sm font-medium text-gray-700">🏠 Stable Upgrades</h4>
                      {Object.entries(STABLE_UPGRADES)
                        .filter(([_, upgrade]) => upgrade.category === categoryKey)
                        .map(([upgradeKey, upgrade]) => {
                          const isUnlocked = stableUpgrades[upgradeKey];
                          const canResearch = canResearchStableUpgrade(upgradeKey);
                          const requiredMazeUnlocked = unlockedMazes[upgrade.unlockedBy];
                          const hasEnoughPoints = researchPoints >= upgrade.researchCost;
                          
                          return (
                            <div key={upgradeKey} className={`flex items-center justify-between p-2 rounded ${
                              isUnlocked ? 'bg-green-100 border border-green-300' : 
                              !requiredMazeUnlocked ? 'bg-gray-100' : 'bg-green-50'
                            }`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium text-sm ${
                                    isUnlocked ? 'text-green-800' : 
                                    !requiredMazeUnlocked ? 'text-gray-500' : 'text-gray-800'
                                  }`}>
                                    {upgrade.name}
                                  </span>
                                  {isUnlocked && <span className="text-green-600">✓</span>}
                                  {!requiredMazeUnlocked && <span className="text-gray-400">🔒</span>}
                                  {!isUnlocked && requiredMazeUnlocked && !hasEnoughPoints && <span className="text-red-500">💰</span>}
                                </div>
                                <div className={`text-xs ${!requiredMazeUnlocked ? 'text-gray-500' : 'text-gray-600'}`}>
                                  {upgrade.description}
                                </div>
                                <div className={`text-xs mt-1 ${!requiredMazeUnlocked ? 'text-gray-400' : 'text-purple-600'}`}>
                                  Requires: {MAZE_TYPES[upgrade.unlockedBy].name}
                                  {!requiredMazeUnlocked && ' (locked)'}
                                </div>
                                {!isUnlocked && requiredMazeUnlocked && (
                                  <div className={`text-xs mt-1 flex items-center gap-2 ${
                                    hasEnoughPoints ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    <span>Cost: {upgrade.researchCost} 🔬</span>
                                    <span>|</span>
                                    <span>Available: {researchPoints} 🔬</span>
                                    {hasEnoughPoints ? 
                                      <span className="text-green-600">✓ Ready!</span> : 
                                      <span className="text-red-600">Need {upgrade.researchCost - researchPoints} more</span>
                                    }
                                  </div>
                                )}
                              </div>
                              {!isUnlocked && requiredMazeUnlocked && (
                                <button
                                  onClick={() => researchStableUpgrade(upgradeKey)}
                                  disabled={!canResearch}
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    canResearch 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  }`}
                                  title={canResearch ? 
                                    `Unlock ${upgrade.name} for ${upgrade.researchCost} research points` : 
                                    `Need ${upgrade.researchCost - researchPoints} more research points`
                                  }
                                >
                                  {hasEnoughPoints ? 'Unlock' : `${upgrade.researchCost} 🔬`}
                                </button>
                              )}
                              {!isUnlocked && !requiredMazeUnlocked && (
                                <div className="text-xs text-gray-400 px-2">
                                  Unlock maze first
                                </div>
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

      {/* Vault Interaction Modal */}
      {showVaultModal && currentVault && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div style={{ width: '80px', height: '80px' }}>
                  <TileSprite 
                    tileX={TILE_MAP[CELL_VAULT].x} 
                    tileY={TILE_MAP[CELL_VAULT].y}
                  />
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                {selectedHorse?.name} has found a treasure chest!
              </h2>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleVaultUnlock}
                  disabled={availableKeys <= 0}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    availableKeys > 0 
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🗝️ Unlock {availableKeys > 0 ? `(${availableKeys} keys)` : '(No keys)'}
                </button>
                <button
                  onClick={handleVaultLeave}
                  className={`flex-1 py-2 px-4 ${themeUtils.getComponentStyles(currentTheme, 'button', 'muted')} font-semibold transition-colors`}
                >
                  🚶 Leave
                </button>
              </div>
              
              {availableKeys <= 0 && (
                <p className="text-xs text-red-600 mt-2">
                  You need a key to unlock this vault. Find keys scattered throughout the maze!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Treasure Reveal Modal */}
      {showTreasureReveal && currentVault && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800">
                Treasure Found!
              </h2>
              
              {/* Show the actual legendary treasure */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <div className="mb-2 flex justify-center">
                  <div style={{ width: '64px', height: '64px' }}>
                    <TileSprite 
                      tileX={TILE_MAP[currentVault.reward.tileKey].x} 
                      tileY={TILE_MAP[currentVault.reward.tileKey].y}
                    />
                  </div>
                </div>
                <div className="text-lg font-bold text-yellow-800">
                  {currentVault.reward.name}
                </div>
                <div className="text-sm text-yellow-700 mt-1">
                  A legendary treasure!
                </div>
              </div>
              
              <p className="text-gray-600">
                {selectedHorse?.name} has unlocked the vault and discovered this rare treasure!
              </p>
              
              <button
                onClick={handleTreasureRevealContinue}
                className="w-full py-3 px-4 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
              >
                Continue Adventure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lost Horse Announcement Modal */}
      {showLostHorseAnnouncement && lostHorse && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🐴 A Lost Horse is Roaming the Maze!
              </h2>
              
              {/* Horse silhouette */}
              <div className="mb-4">
                <img 
                  src={lostHorse.avatar} 
                  alt={lostHorse.name}
                  className="w-32 h-32 mx-auto object-contain rounded-lg"
                  style={{ 
                    filter: 'brightness(0) saturate(100%)',
                    opacity: 0.6
                  }}
                />
              </div>
              
              <p className="text-gray-600 mb-6">
                A mysterious horse has wandered into the labyrinth. If you can find them, they might join your stable!
              </p>
              
              <button
                onClick={() => {
                  startGameAfterAnnouncement(true); // Keep the lost horse
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Continue to Adventure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lost Horse Found Modal */}
      {showLostHorseFound && foundHorse && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                🎉 You Found {foundHorse.name}!
              </h2>
              
              {/* Horse image (not silhouette this time) */}
              <div className="mb-4">
                <img 
                  src={foundHorse.avatar} 
                  alt={foundHorse.name}
                  className="w-32 h-32 mx-auto object-contain rounded-lg border-4 border-green-200"
                />
              </div>
              
              <p className="text-gray-600 mb-6">
                {foundHorse.name} is grateful to be rescued and will now be available in your stable!
              </p>
              
              <button
                onClick={() => {
                  // Unlock the horse
                  if (onUnlockHorse) {
                    onUnlockHorse(foundHorse.id);
                  }
                  
                  // Clear lost horse state
                  setLostHorse(null);
                  setFoundHorse(null);
                  setShowLostHorseFound(false);
                  
                  // Resume game
                  setGameState('exploring');
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Welcome to the Stable!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ItemSelectionModal */}
      <ItemSelectionModal
        isOpen={showItemSelection}
        horse={selectedHorse}
        collectedItems={collectedItemsThisRun}
        onConfirm={handleItemSelectionConfirm}
        onCancel={handleItemSelectionCancel}
      />
    </div>
  );
}

export default HorseMazeGame;
