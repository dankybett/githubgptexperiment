import React, { useState, useEffect, useCallback, useRef } from "react";
import { INVENTORY_ITEMS, inventoryUtils } from "../utils/inventoryItems";
import ItemSelectionModal from "./ItemSelectionModal";
import { themeUtils } from "../utils/themes";
import { tarotCardUtils, TAROT_CARDS } from "../utils/tarotCards";

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
const CELL_TAROT_CHEST = 16;
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
  [CELL_TAROT_CHEST]: { x: 5, y: 6}, // Tarot Chest
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
  REWARD_ENERGY_DRINK: { x: 9, y: 4 },   // Energy Drink tile
  REWARD_HORSE_POWER_CEREAL: { x: 9, y: 5 },     // Horse Power Cereal tile
  
  // Legendary reward tiles
  LEGENDARY_ANCIENT_TREASURE: { x: 8, y: 3 },   // Ancient Treasure tile
  LEGENDARY_DRAGON_EGG: { x: 8, y: 4 },         // Dragon Egg tile  
  LEGENDARY_SACRED_RELIC: { x: 9, y: 2 },       // Sacred Relic tile
  
  // Record tiles for music unlocks
  RECORD_WILD_MANE: { x: 8, y: 9 },            // Wild Mane record
  RECORD_WILD_UNBRIDLED: { x: 9, y: 9 },       // Wild and Unbridled record
  RECORD_CLOVER: { x: 7, y: 9 }                // Clover record
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
  CELL_TAROT_CHEST,
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
  'REWARD_ENERGY_DRINK', 
  'REWARD_HORSE_POWER_CEREAL',
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
  { name: 'Energy Drink', emoji: '🥤', rarity: 0.4, tileKey: 'REWARD_ENERGY_DRINK' },
  { name: 'Horse Power Cereal', emoji: '🥣', rarity: 0.3, tileKey: 'REWARD_HORSE_POWER_CEREAL' }
];

const TRAPS = [
  { name: 'Pit Trap', emoji: '🕳️' },
  { name: 'Spike Trap', emoji: '⚡' },
  { name: 'Bear Trap', emoji: '🪤' },
  { name: 'Poison Dart', emoji: '💉' }
];

const POWERUPS = [
  { name: 'Speed Boost Potion', emoji: '⚡', rarity: 0.3, effect: 'speed', duration: 5, tileX: 8, tileY: 6 },
  { name: 'Invisibility Crown', emoji: '👑', rarity: 0.2, effect: 'invisibility', duration: 8, tileX: 8, tileY: 3 },
  { name: 'Teleport Scroll', emoji: '🌀', rarity: 0.15, effect: 'teleport', duration: 1, tileX: 9, tileY: 2 },
  { name: 'Minotaur Stun Bomb', emoji: '💣', rarity: 0.15, effect: 'stun', duration: 6, tileX: 9, tileY: 6 },
  { name: 'Treasure Magnet', emoji: '🧲', rarity: 0.25, effect: 'magnet', duration: 4, tileX: 8, tileY: 5 }
];

const MAZE_TYPES = {
  standard: {
    name: 'Standard Maze',
    description: 'Classic maze with all basic features',
    difficulty: 1,
    unlocked: true,
    mechanics: ['Static walls', 'Portals', 'Dark zones', 'Vaults & keys']
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

function HorseMazeGame({ onBack, selectedHorse, onHorseReturn, coins, onUpdateCoins, horseAvatars, horseNames, unlockedHorses, onUnlockHorse, currentTheme = 'retro', unlockedSongs = {}, unlockedTarotCards = [] }) {
  const [maze, setMaze] = useState([]);
  const [horsePos, setHorsePos] = useState({ x: 1, y: 1 });
  const [horseDirection, setHorseDirection] = useState('right'); // 'left' or 'right'
  const [prevHorsePos, setPrevHorsePos] = useState({ x: 1, y: 1 });
  const [minotaurPos, setMinotaurPos] = useState({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
  const [minotaurDirection, setMinotaurDirection] = useState('right'); // 'left' or 'right'
  const [prevMinotaurPos, setPrevMinotaurPos] = useState({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
  const [inventory, setInventory] = useState([]);
  const [horseInventory, setHorseInventory] = useState(selectedHorse?.inventory || []);
  
  const [startingInventory, setStartingInventory] = useState(selectedHorse?.inventory || []); // Track what horse started with
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [isMidRunInventoryManagement, setIsMidRunInventoryManagement] = useState(false);
  // Calculate available keys dynamically from inventory
  const availableKeys = inventoryUtils.getItemCount(horseInventory, 'key');

  // Lost horse feature states
  const [lostHorse, setLostHorse] = useState(null); // { id, avatar, name, pos: {x, y}, direction }
  const [showLostHorseAnnouncement, setShowLostHorseAnnouncement] = useState(false);
  const [showLostHorseFound, setShowLostHorseFound] = useState(false);
  const [foundHorse, setFoundHorse] = useState(null);
  
  // Initialize inventory from selectedHorse only once when component mounts
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && selectedHorse) {
      setHorseInventory(selectedHorse.inventory || []);
      initializedRef.current = true;
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
  const [powerupPositions, setPowerupPositions] = useState([]); // Array of {x, y, powerupType}
  const isMovingRef = useRef(false); // Movement lock to prevent multiple moves per frame (use ref to survive re-renders)
  const collectedPositionsRef = useRef(new Set()); // Track collected reward positions to prevent duplicates
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
  const [pendingTrapCheck, setPendingTrapCheck] = useState(null);
  const pendingTrapCheckRef = useRef(null);
  
  // Inventory item activations
  const [activeSpeedBoost, setActiveSpeedBoost] = useState(0); // Remaining time in ms
  const [canUseGoldenApple, setCanUseGoldenApple] = useState(false);
  const [activePowerBoost, setActivePowerBoost] = useState(0); // Horsepower cereal boost
  const [currentTrapPosition, setCurrentTrapPosition] = useState(null); // Position of trap being healed
  
  // Track if horse got injured during current labyrinth session
  const [horseInjuredThisSession, setHorseInjuredThisSession] = useState(false);
  
  // Teleportation effect state
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [teleportStage, setTeleportStage] = useState('none');
 // 'dematerializing', 'materializing', 'none'
  
  // Visual feedback states
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [horseFlash, setHorseFlash] = useState(null);
  
  // Vault interaction states
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showTreasureReveal, setShowTreasureReveal] = useState(false);
  const [currentVault, setCurrentVault] = useState(null);
  
  // Tarot chest interaction states
  const [showTarotChestModal, setShowTarotChestModal] = useState(false);
  const [showTarotReveal, setShowTarotReveal] = useState(false);
  const [currentTarotChest, setCurrentTarotChest] = useState(null);
  
  // Performance info modal
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  
  // Visual feedback functions
  const addFloatingText = useCallback((text, color = '#10b981') => {
    const id = Math.random().toString(36).substr(2, 9);
    setFloatingTexts(prev => {
      const newText = { id, text, color, timestamp: Date.now(), duration: 2000 };
      return [...prev, newText];
    });
  }, []);
  
  const flashHorse = useCallback((color = '#3b82f6') => {
    setHorseFlash(color);
    setTimeout(() => setHorseFlash(null), 500);
  }, []);

  // Generate maze based on selected type
  const generateMaze = useCallback(() => {
    // Reset collected positions for new maze
    collectedPositionsRef.current.clear();
    
    const newMaze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(CELL_WALL));
    const rewardPositionsTemp = []; // Track reward positions and types during generation
    const powerupPositionsTemp = []; // Track power-up positions and types during generation
    
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
    
    // Add standard maze features
    let keysPlaced = 0;
    let vaultPlaced = false;
    let tarotChestPlaced = false;
    
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
          
          // Standard maze features
          if (rand < 0.15) {
            // Select a random reward type
            const selectedReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
            newMaze[y][x] = CELL_REWARD;
            // Store the reward position and type for rendering
            rewardPositionsTemp.push({ x, y, rewardType: selectedReward });
          } else if (rand < 0.25) {
            newMaze[y][x] = CELL_TRAP;
          } else if (rand < 0.32) {
            // Select a random power-up type
            const selectedPowerup = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
            newMaze[y][x] = CELL_POWERUP;
            // Store the power-up position and type for rendering
            powerupPositionsTemp.push({ x, y, powerupType: selectedPowerup });
          } else if (rand < 0.38 && keysPlaced < 2) {
            newMaze[y][x] = CELL_KEY;
            newVaultKeys.push({ x, y, id: Math.random().toString(36).substr(2, 9) });
            keysPlaced++;
          } else if (rand < 0.42 && !vaultPlaced && newVaultKeys.length > 0) {
            newMaze[y][x] = CELL_VAULT;
            vaultPlaced = true;
          } else if (rand < 0.45 && !tarotChestPlaced) {
            newMaze[y][x] = CELL_TAROT_CHEST;
            tarotChestPlaced = true;
          } else if (rand < 0.50) {
            newMaze[y][x] = CELL_WALL;
          } else if (rand < 0.52 && !portalA) {
            newMaze[y][x] = CELL_PORTAL_A;
            portalA = { x, y };
          } else if (rand < 0.54 && portalA && !portalB) {
            newMaze[y][x] = CELL_PORTAL_B;
            portalB = { x, y };
          } else if (rand < 0.56) {
            newMaze[y][x] = CELL_DARK_ZONE;
            newDarkZones.push({ x, y });
          }
        }
      }
    }
    
    // Update state for standard maze features only
    setMovingWalls([]);
    setPortals({ A: portalA, B: portalB });
    setDarkZones(newDarkZones);
    setVaultKeys(newVaultKeys);
    setWaterCells([]);
    setRotatingGears([]);
    setTimeZones([]);
    setPhasingWalls([]);
    
    // Set to single level for standard maze
    setMaxLevel(1);
    setCurrentLevel(1);
    
    // Guarantee that exactly 1 tarot chest is placed
    if (!tarotChestPlaced) {
      // Find a suitable empty location for the tarot chest
      const emptyCells = [];
      for (let y = 1; y < MAZE_SIZE - 1; y++) {
        for (let x = 1; x < MAZE_SIZE - 1; x++) {
          if (newMaze[y][x] === CELL_EMPTY && 
              !(x === 1 && y === 1) && // Avoid horse spawn
              !(x === MAZE_SIZE - 2 && y === MAZE_SIZE - 2)) { // Avoid minotaur spawn
            emptyCells.push({ x, y });
          }
        }
      }
      
      if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        newMaze[randomCell.y][randomCell.x] = CELL_TAROT_CHEST;
        tarotChestPlaced = true;
      }
    }
    
    // Set the reward positions state
    setRewardPositions(rewardPositionsTemp);
    // Set the power-up positions state  
    setPowerupPositions(powerupPositionsTemp);
    
    return newMaze;
  }, []);

  // Initialize maze
  useEffect(() => {
    setMaze(generateMaze());
  }, [generateMaze]);

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
      // Cancel teleportation if trap is being processed
      if (pendingTrapCheckRef.current) {
        console.log('🌀 Canceling teleportation due to trap processing at:', pendingTrapCheckRef.current.position);
        setTeleportStage('none');
        setIsTeleporting(false);
        return;
      }
      
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

  // Add item to horse inventory - single persistent inventory system
  const addItemToInventory = useCallback((item) => {
    const maxSlots = 4 + getSkillLevel('saddlebags');
    
    setHorseInventory(prev => {
      if (prev.length < maxSlots) {
        // Space available - add item directly
        return [...prev, item];
      } else {
        // Inventory full - add item temporarily and show management modal
        setIsMidRunInventoryManagement(true);
        setShowItemSelection(true);
        return [...prev, item]; // Add over capacity temporarily
      }
    });
  }, [getSkillLevel, horseInventory]);

  // Collect nearby treasures with magnet
  const collectWithMagnet = useCallback(() => {
    const baseMagnetRange = hasPowerup('magnet') ? 2 : 0;
    const powerupMagnetLevel = getSkillLevel('powerupMagnet');
    const totalRange = baseMagnetRange + (powerupMagnetLevel > 0 ? 1 : 0);
    
    if (totalRange === 0) return;
    
    const { x: hx, y: hy } = horsePos;
    const itemsToCollect = [];
    
    // First, identify all items to collect (excluding horse's current position)
    for (let dy = -totalRange; dy <= totalRange; dy++) {
      for (let dx = -totalRange; dx <= totalRange; dx++) {
        const nx = hx + dx;
        const ny = hy + dy;
        
        // Skip the horse's current position - that's handled by normal collection
        if (dx === 0 && dy === 0) continue;
        
        if (nx > 0 && nx < MAZE_SIZE - 1 && ny > 0 && ny < MAZE_SIZE - 1 && 
            maze[ny] && maze[ny][nx] === CELL_REWARD) {
          
          // Get the specific reward at this position for magnet collection
          const rewardAtPosition = rewardPositions.find(r => r.x === nx && r.y === ny);
          const reward = rewardAtPosition ? rewardAtPosition.rewardType : REWARDS[0];
          
          itemsToCollect.push({
            reward,
            x: nx,
            y: ny
          });
        }
      }
    }
    
    if (itemsToCollect.length === 0) return;
    
    // Handle batch collection with inventory management
    const maxSlots = 4 + getSkillLevel('saddlebags');
    const currentCount = horseInventory.length;
    const availableSpace = maxSlots - currentCount;
    
    if (itemsToCollect.length <= availableSpace) {
      // Add items to persistent inventory (no visual feedback for magnet)
      itemsToCollect.forEach(({ reward, x, y }) => {
        addItemToInventory(reward);
        
        // Remove from positions and maze
        setRewardPositions(prev => prev.filter(r => !(r.x === x && r.y === y)));
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          newMaze[y][x] = CELL_EMPTY;
          return newMaze;
        });
      });
    } else {
      // Not all items fit - show selection modal
      const itemsToAdd = itemsToCollect.slice(0, availableSpace);
      const itemsForModal = itemsToCollect.slice(availableSpace);
      
      // Add what fits to persistent inventory
      itemsToAdd.forEach(({ reward, x, y }) => {
        addItemToInventory(reward);
        
        // Remove from positions and maze
        setRewardPositions(prev => prev.filter(r => !(r.x === x && r.y === y)));
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          newMaze[y][x] = CELL_EMPTY;
          return newMaze;
        });
      });
      
      // Show modal for remaining items
      if (itemsForModal.length > 0) {
        // Add the remaining items to persistent inventory (triggers modal)
        itemsForModal.forEach(({ reward }) => {
          addItemToInventory(reward);
        });
        
        // Remove remaining items from maze regardless (they're now in modal)
        itemsForModal.forEach(({ x, y }) => {
          setRewardPositions(prev => prev.filter(r => !(r.x === x && r.y === y)));
          setMaze(prevMaze => {
            const newMaze = prevMaze.map(row => [...row]);
            newMaze[y][x] = CELL_EMPTY;
            return newMaze;
          });
        });
      }
    }
  }, [hasPowerup, getSkillLevel, horsePos, maze, horseInventory, rewardPositions, addItemToInventory]);

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
        // Items are now immediately added to inventory, no need to transfer
        
        // INJURY CALCULATION - Apply immediately when caught by minotaur
        const injuryChance = 0.7; // INCREASED FOR TESTING
        const difficultyMultiplier = 1;
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
            duration: 4000,
            timestamp: Date.now()
          }]);
        }
        
        // Award points based on performance and maze difficulty
        const itemsCollected = horseInventory.length - (selectedHorse?.inventory?.length || 0);
        const basePoints = Math.floor(itemsCollected / 2) + 1;
        const skillPointsEarned = Math.max(0, Math.floor(itemsCollected / 4));
        setSkillPoints(prev => prev + skillPointsEarned);
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
          // Items are now immediately added to inventory, no need to transfer
          
          // INJURY CALCULATION - Apply immediately when caught by minotaur (second case)
          const injuryChance = 0.7; // INCREASED FOR TESTING
          const difficultyMultiplier = 1;
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
          
          const itemsCollected = horseInventory.length - (selectedHorse?.inventory?.length || 0);
          const basePoints = Math.floor(itemsCollected / 2) + 1;
          const difficultyBonus = 1;
          const skillPointsEarned = Math.max(0, Math.floor(itemsCollected / 4));
          setSkillPoints(prev => prev + skillPointsEarned);
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
    if (pendingTrapCheck) {
      return;
    }
    if (isMovingRef.current) {
      return; // Prevent multiple moves in the same frame
    }
    
    isMovingRef.current = true;

    setHorseMoveCount(prev => prev + 1);
    updatePowerups();
    updateMovingWalls();
    
    // Skip movement if currently teleporting
    if (isTeleporting) return;

    const performanceModifiers = getHorsePerformanceModifiers();

    setHorsePos(prevPos => {
      const { x, y } = prevPos;
      
      // Debug logging for position changes
      if (pendingTrapCheck) {
        console.log('🚨 UNEXPECTED: Horse trying to move while trap pending! From:', prevPos, 'Pending trap at:', pendingTrapCheck.position);
        console.log('🚨 ABORTING MOVEMENT - returning current position');
        return prevPos; // Abort movement completely
      }
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
        // Move onto portal tile immediately before starting teleportation
        setHorsePos({ x: nextMove.x, y: nextMove.y });
        triggerTeleportation(portals.B.x, portals.B.y);
        return { x: nextMove.x, y: nextMove.y };
      } else if (cell === CELL_PORTAL_B && portals.A) {
        // Move onto portal tile immediately before starting teleportation  
        setHorsePos({ x: nextMove.x, y: nextMove.y });
        triggerTeleportation(portals.A.x, portals.A.y);
        return { x: nextMove.x, y: nextMove.y };
      }

      // Handle cell interactions
      if (cell === CELL_REWARD) {
        const positionKey = `${nextMove.x},${nextMove.y}`;
        
        // Check if we've already collected from this position
        if (collectedPositionsRef.current.has(positionKey)) {
          return { x: nextMove.x, y: nextMove.y };
        }
        
        // Check if this reward actually exists at this position to prevent double collection
        const rewardAtPosition = rewardPositions.find(r => r.x === nextMove.x && r.y === nextMove.y);
        
        if (!rewardAtPosition) {
          // Still update the maze cell to empty since we're on it
          setMaze(prevMaze => {
            const newMaze = prevMaze.map(row => [...row]);
            newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
            return newMaze;
          });
          return { x: nextMove.x, y: nextMove.y };
        }
        
        const lucky = getSkillLevel('lucky');
        const treasureHunter = getSkillLevel('treasureHunter');
        const treasureMultiplier = performanceModifiers.treasureBonus;
        
        const reward = rewardAtPosition.rewardType;
        
        // Mark this position as collected IMMEDIATELY to prevent duplicates
        collectedPositionsRef.current.add(positionKey);
        
        // Remove this reward from the positions array
        setRewardPositions(prev => prev.filter(r => !(r.x === nextMove.x && r.y === nextMove.y)));
        
        // Flash effect for treasure collection
        flashHorse('#fbbf24');
        
        // Add reward to persistent inventory
        addItemToInventory(reward);
        
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
          return newMaze;
        });
      } else if (cell === CELL_POWERUP) {
        // Find the specific power-up at this position
        const powerupAtPosition = powerupPositions.find(p => p.x === nextMove.x && p.y === nextMove.y);
        const powerup = powerupAtPosition ? powerupAtPosition.powerupType : POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
        
        // Only flash effect for power-up collection - text will be shown by usePowerup()
        flashHorse('#a855f7');
        
        usePowerup(powerup);
        
        // Powerups are consumed immediately, not collected into inventory
        
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
          return newMaze;
        });
        
        // Remove the collected power-up from positions tracking
        setPowerupPositions(prev => prev.filter(p => !(p.x === nextMove.x && p.y === nextMove.y)));
      } else if (cell === CELL_KEY) {
        const key = vaultKeys.find(k => k.x === nextMove.x && k.y === nextMove.y);
        
        if (key && !collectedKeys.includes(key.id)) {
          // Add visual feedback for key collection (only if not already collected)
          addFloatingText('🗝️ Key Found!', '#eab308');
          flashHorse('#eab308');
          
          setCollectedKeys(prev => [...prev, key.id]);
          // Add key to persistent inventory
          addItemToInventory(INVENTORY_ITEMS.key);
          // Keys now calculated dynamically from inventory
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
        
        // Add locked record items if their songs aren't unlocked yet
        const lockedRecords = [
          { songName: 'WILD MANE', recordName: 'Wild Mane Record', emoji: '💿', tileKey: 'RECORD_WILD_MANE', type: 'record' },
          { songName: 'WILD AND UNBRIDLED', recordName: 'Wild and Unbridled Record', emoji: '💿', tileKey: 'RECORD_WILD_UNBRIDLED', type: 'record' },
          { songName: 'CLOVER', recordName: 'Clover Record', emoji: '💿', tileKey: 'RECORD_CLOVER', type: 'record' }
        ].filter(record => !unlockedSongs[record.songName]);
        
        // Combine treasures and locked records
        const allPossibleRewards = [...legendaryRewards, ...lockedRecords.map(record => ({
          name: record.recordName,
          emoji: record.emoji,
          tileKey: record.tileKey,
          type: record.type,
          songName: record.songName
        }))];
        const potentialReward = allPossibleRewards[Math.floor(Math.random() * allPossibleRewards.length)];
        
        setCurrentVault({
          position: { x: nextMove.x, y: nextMove.y },
          reward: potentialReward
        });
        setShowVaultModal(true);
        // Game will be paused while modal is open
        return prevPos; // Don't move onto vault yet
      } else if (cell === CELL_TAROT_CHEST) {
        // Pause game and show tarot chest interaction modal
        console.log('🔮 Tarot chest interaction - availableKeys state:', availableKeys);
        
        // Get a random locked tarot card
        const randomLockedCard = tarotCardUtils.getRandomLockedCard(unlockedTarotCards);
        
        if (!randomLockedCard) {
          // All cards are already unlocked, give a generic reward instead
          console.log('🔮 All tarot cards already unlocked, giving generic reward');
          const genericReward = { 
            name: 'Mystical Energy', 
            emoji: '✨', 
            tileKey: 'REWARD_MYSTICAL_ENERGY',
            ...INVENTORY_ITEMS.treasure 
          };
          
          setCurrentTarotChest({
            position: { x: nextMove.x, y: nextMove.y },
            reward: genericReward
          });
        } else {
          // Create a proper tarot card reward with the specific card data
          const tarotCardReward = {
            id: `tarot_card_${randomLockedCard.id}`,
            name: randomLockedCard.name,
            description: randomLockedCard.description,
            image: `/Tarot cards/${randomLockedCard.fileName}`,
            category: 'tarot_card',
            stackable: false,
            cardId: randomLockedCard.id, // Store the card ID for unlocking
            emoji: '🔮',
            tileKey: 'CELL_TAROT_CHEST'
          };
          
          console.log('🔮 Selected tarot card:', randomLockedCard.name, 'ID:', randomLockedCard.id);
          
          setCurrentTarotChest({
            position: { x: nextMove.x, y: nextMove.y },
            reward: tarotCardReward
          });
        }
        
        setShowTarotChestModal(true);
        // Game will be paused while modal is open
        return prevPos; // Don't move onto tarot chest yet
      } else if (cell === CELL_TRAP) {
        // Check if there's already a pending trap check
        if (pendingTrapCheck) {
          console.log('⚠️ Already processing trap at:', pendingTrapCheck.position, '- ignoring new trap at:', nextMove.x, nextMove.y);
          return prevPos; // Don't move, stay where we are
        }
        
        // Schedule trap processing WITHOUT moving onto trap visually
        console.log('🔥 Horse detected trap at:', nextMove.x, nextMove.y, '- staying in place for trap check');
        setPendingTrapCheck({
          position: { x: nextMove.x, y: nextMove.y },
          trapSense: getSkillLevel('trapSense'),
          thickSkin: getSkillLevel('thickSkin'),
          performanceModifiers,
          currentRewards: [...currentRewards],
          trapHits
        });
        
        // Stay at current position until trap is processed
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
    
    // Collect nearby items with magnet AFTER position is updated
    collectWithMagnet();
    
    // Reset movement lock after all movement logic is complete
    setTimeout(() => {
      isMovingRef.current = false;
    }, 0);
  }, [gameState, maze, currentRewards, hasPowerup, updatePowerups, updateMovingWalls, collectWithMagnet, usePowerup, getSkillLevel, minotaurPos, trapHits, isCellPassable, portals, vaultKeys, collectedKeys, isTeleporting, triggerTeleportation, rewardPositions, lostHorse, pendingTrapCheck]);

  // Vault interaction functions
  const handleVaultUnlock = useCallback(() => {
    if (!currentVault || !availableKeys) return;
    
    // Remove key from inventory first
    setHorseInventory(prev => inventoryUtils.removeItem(prev, 'key'));
    
    // Add reward using the persistent inventory system
    addItemToInventory(currentVault.reward);
    
    // Close vault modal and show treasure reveal
    setShowVaultModal(false);
    setShowTreasureReveal(true);
  }, [currentVault, availableKeys, addItemToInventory]);

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
  
  // Tarot chest interaction functions
  const handleTarotChestUnlock = useCallback(() => {
    if (!currentTarotChest || availableKeys < 2) return;
    
    // Remove 2 keys from inventory first
    setHorseInventory(prev => {
      let newInventory = prev;
      for (let i = 0; i < 2; i++) {
        newInventory = inventoryUtils.removeItem(newInventory, 'key');
      }
      return newInventory;
    });
    
    // Add reward using the persistent inventory system
    addItemToInventory(currentTarotChest.reward);
    
    // Close tarot chest modal and show tarot reveal
    setShowTarotChestModal(false);
    setShowTarotReveal(true);
  }, [currentTarotChest, availableKeys, addItemToInventory]);
  
  const handleTarotRevealContinue = useCallback(() => {
    if (!currentTarotChest) return;
    
    // Remove tarot chest from maze
    setMaze(prevMaze => {
      const newMaze = prevMaze.map(row => [...row]);
      newMaze[currentTarotChest.position.y][currentTarotChest.position.x] = CELL_EMPTY;
      return newMaze;
    });
    
    // Move horse to tarot chest position
    setHorsePos({ x: currentTarotChest.position.x, y: currentTarotChest.position.y });
    
    // Close reveal modal and resume game
    setShowTarotReveal(false);
    setCurrentTarotChest(null);
    
    // Visual feedback
    addFloatingText(`${selectedHorse?.name} found ${currentTarotChest.reward.name}!`, '#7c3aed');
    flashHorse('#7c3aed');
  }, [currentTarotChest, addFloatingText, flashHorse]);
  
  const handleTarotChestLeave = useCallback(() => {
    // Close modal and remove tarot chest from maze so horse can continue
    setShowTarotChestModal(false);
    
    // Remove tarot chest from maze (same as unlock but without rewards)
    if (currentTarotChest) {
      setMaze(prevMaze => {
        const newMaze = prevMaze.map(row => [...row]);
        newMaze[currentTarotChest.position.y][currentTarotChest.position.x] = CELL_EMPTY;
        return newMaze;
      });
    }
    
    setCurrentTarotChest(null);
  }, [currentTarotChest]);

  // Game loop
  useEffect(() => {
    if (gameState === 'exploring' && !showVaultModal && !showTreasureReveal && !showTarotChestModal && !showTarotReveal && !pendingTrapCheck && !showItemSelection) {
      const performanceModifiers = getHorsePerformanceModifiers();
      const speedBoostMultiplier = activeSpeedBoost > 0 ? 1.8 : 1; // 80% faster when boost is active
      const adjustedGameSpeed = gameSpeed / performanceModifiers.speed / speedBoostMultiplier;
      
      const timer = setTimeout(() => {
        moveHorse();
        
        if (hasPowerup('speed') && horseMoveCount % 2 === 0 && !pendingTrapCheck) {
          setTimeout(moveHorse, adjustedGameSpeed / 4);
        }
        
        const swiftness = getSkillLevel('swiftness');
        if (swiftness > 0 && Math.random() < swiftness * 0.1 && !pendingTrapCheck) {
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
  }, [gameState, moveHorse, moveMinotaur, gameSpeed, horsePos, minotaurPos, hasPowerup, horseMoveCount, getSkillLevel, getHorsePerformanceModifiers, lostHorse, moveLostHorse, activeSpeedBoost > 0, pendingTrapCheck, showItemSelection, showVaultModal, showTreasureReveal, showTarotChestModal, showTarotReveal]);

  // Process pending trap checks with a delay to allow visual movement
  useEffect(() => {
    if (pendingTrapCheck && gameState === 'exploring') {
      const timer = setTimeout(() => {
        console.log('⏱️ Processing trap check for position:', pendingTrapCheck.position, 'Current horse pos:', horsePos);
        const { trapSense, thickSkin, performanceModifiers, currentRewards, trapHits: currentTrapHits } = pendingTrapCheck;
        
        // Horse condition affects trap avoidance
        const conditionTrapAvoidance = performanceModifiers.trapAvoidance / 100;
        const powerBoostAvoidance = activePowerBoost > 0 ? 0.25 : 0; // 25% bonus from horsepower cereal
        const totalTrapAvoidance = (trapSense * 0.15) + conditionTrapAvoidance + powerBoostAvoidance;
        
        if (Math.random() < totalTrapAvoidance) {
          // Trap avoided - continue game
          console.log('🏃‍♂️ Trap avoided! Horse continues running.');
          setPendingTrapCheck(null);
          return;
        }
        
        if (thickSkin > 0 && currentTrapHits < thickSkin) {
          // Survive with thick skin
          setTrapHits(prev => prev + 1);
          const trap = TRAPS[Math.floor(Math.random() * TRAPS.length)];
          setLastTrap(trap);
          console.log('🛡️ Trap hit but survived with thick skin!');
          setPendingTrapCheck(null);
          return;
        }
        
        // Check if horse has golden apple for healing
        const hasGoldenApple = horseInventory.some(item => item.name === 'Golden Apple');
        
        if (hasGoldenApple) {
          // Move horse onto trap tile and pause for decision
          setHorsePos({ x: pendingTrapCheck.position.x, y: pendingTrapCheck.position.y });
          
          // Store trap position for potential removal
          setCurrentTrapPosition({ x: pendingTrapCheck.position.x, y: pendingTrapCheck.position.y });
          
          // Enable golden apple usage and PAUSE the game for player to decide
          const trap = TRAPS[Math.floor(Math.random() * TRAPS.length)];
          setLastTrap(trap);
          setCanUseGoldenApple(true);
          setGameState('paused'); // Pause the game
          
          setFloatingTexts(prev => [...prev, {
            id: Date.now() + Math.random(),
            text: '💥 Trapped! Use Golden Apple to heal?',
            color: '#dc2626',
            fontSize: '16px',
            duration: 5000,
            timestamp: Date.now()
          }]);
          
          // Auto-end run after 5 seconds if no golden apple is used
          setTimeout(() => {
            if (canUseGoldenApple) {
              setEndReason('trap');
              setGameState('ended');
              // Items are now immediately added to inventory, no need to transfer
              setCanUseGoldenApple(false);
            }
          }, 5000);
          
          setPendingTrapCheck(null);
          return;
        }
        
        // Move horse onto trap tile and end the run (no golden apple available)
        setHorsePos({ x: pendingTrapCheck.position.x, y: pendingTrapCheck.position.y });
        
        // Trap hits and ends the run
        const trap = TRAPS[Math.floor(Math.random() * TRAPS.length)];
        setLastTrap(trap);
        
        
        setEndReason('trap');
        setGameState('ended');
        // Items are now immediately added to inventory, no need to transfer
        
        // INJURY CALCULATION
        const injuryChance = 0.8;
        const difficultyMultiplier = 1;
        const injuryRoll = Math.random();
        const finalInjuryChance = injuryChance * difficultyMultiplier;
        
        console.log('🩹 TRAP INJURY DEBUG - Rolling for injury:');
        console.log('  - Random roll:', injuryRoll);
        console.log('  - Required threshold:', finalInjuryChance);
        console.log('  - Will injury occur?', injuryRoll < finalInjuryChance);
        
        if (injuryRoll < finalInjuryChance) {
          console.log('🏥 HORSE INJURED BY TRAP!');
          setHorseInjuredThisSession(true);
          
          const injuryMessages = ['🩹 Injured by trap!', '💔 Trap wounds sustained!', '⚡ Badly hurt by trap!'];
          const injuryMessage = injuryMessages[Math.floor(Math.random() * injuryMessages.length)];
          
          setFloatingTexts(prev => [...prev, {
            id: Date.now() + Math.random(),
            text: injuryMessage,
            color: '#ef4444',
            fontSize: '16px',
            duration: 4000,
            timestamp: Date.now()
          }]);
        }
        
        // Award points
        const itemsCollected = horseInventory.length - (selectedHorse?.inventory?.length || 0);
        const basePoints = Math.floor(itemsCollected / 2) + 1;
        const skillPointsEarned = Math.max(0, Math.floor(itemsCollected / 4));
        setSkillPoints(prev => prev + skillPointsEarned);
        
        setPendingTrapCheck(null);
      }, 300); // 300ms delay to allow visual movement
      
      return () => clearTimeout(timer);
    }
  }, [pendingTrapCheck, gameState, setTrapHits, setLastTrap, setEndReason, setGameState, setInventory, setHorseInjuredThisSession, setFloatingTexts, setSkillPoints, activePowerBoost > 0, horseInventory, canUseGoldenApple]);

  // Handle inventory item usage
  const useInventoryItem = useCallback((itemName, itemIndex) => {
    if (gameState !== 'exploring' && gameState !== 'paused') {
      console.log('❌ Cannot use item - gameState is not exploring or paused:', gameState);
      return;
    }
    
    // Golden Apple can only be used during trap-related pause, not during normal exploring
    if (itemName === 'Golden Apple' && gameState === 'exploring') {
      console.log('❌ Golden Apple can only be used when trapped, not during normal gameplay');
      return;
    }
    
    // Special case: during trap-related pause, only allow golden apple if available
    if (gameState === 'paused' && canUseGoldenApple && itemName !== 'Golden Apple') {
      console.log('❌ Cannot use items other than Golden Apple during trap pause');
      return;
    }
    
    if (gameState === 'paused' && itemName === 'Golden Apple' && !canUseGoldenApple) {
      console.log('❌ Golden Apple not available for trap healing');
      return;
    }
    
    console.log('🎒 Using inventory item:', itemName, 'at index:', itemIndex);
    console.log('🎒 Current horseInventory:', horseInventory);
    
    switch (itemName) {
      case 'Energy Drink':
        // Give speed boost for 10 seconds
        setActiveSpeedBoost(10000);
        setFloatingTexts(prev => [...prev, {
          id: Date.now() + Math.random(),
          text: '⚡ Speed Boost Active!',
          color: '#22c55e',
          fontSize: '16px',
          duration: 3000,
          timestamp: Date.now()
        }]);
        break;
        
      case 'Golden Apple':
        if (canUseGoldenApple) {
          // Heal from trap and continue run
          console.log('🍎 Golden apple used for trap healing');
          setCanUseGoldenApple(false);
          setLastTrap(null); // Clear the trap
          
          // Remove the trap tile from the maze
          if (currentTrapPosition) {
            setMaze(prevMaze => {
              const newMaze = prevMaze.map(row => [...row]);
              newMaze[currentTrapPosition.y][currentTrapPosition.x] = CELL_EMPTY;
              console.log('🍎 Trap tile removed at:', currentTrapPosition);
              return newMaze;
            });
            setCurrentTrapPosition(null); // Clear trap position
          }
          
          setGameState('exploring'); // Resume the game
          setFloatingTexts(prev => [...prev, {
            id: Date.now() + Math.random(),
            text: '🍎 Healed by Golden Apple! Trap disarmed!',
            color: '#f59e0b',
            fontSize: '16px',
            duration: 4000,
            timestamp: Date.now()
          }]);
          // Continue the run - don't end game
        } else {
          // Heal current injuries or boost health during normal gameplay
          setFloatingTexts(prev => [...prev, {
            id: Date.now() + Math.random(),
            text: '🍎 Golden Apple consumed!',
            color: '#f59e0b',
            fontSize: '16px',
            duration: 3000,
            timestamp: Date.now()
          }]);
        }
        break;
        
      case 'Horse Power Cereal':
        // Temporary trap avoidance and strength boost for 15 seconds
        setActivePowerBoost(15000);
        setFloatingTexts(prev => [...prev, {
          id: Date.now() + Math.random(),
          text: '💪 Horsepower Boost! +25% Trap Avoid!',
          color: '#8b5cf6',
          fontSize: '16px',
          duration: 3000,
          timestamp: Date.now()
        }]);
        break;
        
      default:
        console.log('🤷 Unknown item type:', itemName);
        return;
    }
    
    // Remove item from horse inventory
    setHorseInventory(prev => {
      const newInventory = [...prev];
      newInventory.splice(itemIndex, 1);
      return newInventory;
    });
    
  }, [gameState, canUseGoldenApple, setFloatingTexts]);

  // Speed boost countdown effect
  useEffect(() => {
    if (activeSpeedBoost > 0) {
      const timer = setTimeout(() => {
        setActiveSpeedBoost(prev => Math.max(0, prev - 100));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeSpeedBoost]);

  // Power boost countdown effect
  useEffect(() => {
    if (activePowerBoost > 0) {
      const timer = setTimeout(() => {
        setActivePowerBoost(prev => Math.max(0, prev - 100));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activePowerBoost]);

  // Keep ref in sync with state
  useEffect(() => {
    pendingTrapCheckRef.current = pendingTrapCheck;
  }, [pendingTrapCheck]);

  // Cleanup floating texts based on their duration
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setFloatingTexts(prev => prev.filter(ft => {
        const age = Date.now() - ft.timestamp;
        const maxDuration = ft.duration || 2000; // Use custom duration or default 2 seconds
        return age < maxDuration;
      }));
    }, 100); // Check every 100ms

    return () => clearInterval(cleanupInterval);
  }, []);

  const startGame = useCallback(() => {
    // Prevent rapid multiple calls
    if (gameState === 'exploring') {
      console.log('🚀 StartGame - Already exploring, ignoring duplicate call');
      return;
    }
    
    console.log('🚀 StartGame - Debug info:');
    console.log('  - gameState:', gameState);
    console.log('  - currentRewards.length:', currentRewards.length);
    console.log('  - current working inventory:', horseInventory.length, 'items');
    
    // Check if we have items in working inventory that need to be saved
    if (gameState === 'ended' && horseInventory.length > 0) {
      console.log('🚀 StartGame - Found working inventory, checking if it matches persistent inventory');
      
      const persistentInventoryLength = selectedHorse?.inventory?.length || 0;
      
      // If working inventory is different from persistent, we need to save it
      if (horseInventory.length !== persistentInventoryLength) {
        console.log('🚀 StartGame - Working inventory differs from persistent, saving changes');
        
        // Auto-save the working inventory to persistent storage
        if (selectedHorse && onHorseReturn) {
          const updatedHorse = {
            ...selectedHorse,
            inventory: [...horseInventory] // Transfer working inventory to persistent
          };
          onHorseReturn(updatedHorse);
        }
        
        // Reset for new run
        setStartingInventory([...horseInventory]);
      }
    }
    
    console.log('🚀 StartGame - Starting new game directly');
    
    // Regenerate maze if starting a new adventure after a completed/active run
    const shouldRegenerateMaze = 
      gameState === 'ended' || 
      gameState === 'exploring' ||
      gameState === 'paused';
      
    if (shouldRegenerateMaze) {
      console.log('🚀 StartGame - Regenerating maze (new adventure)');
      const newMaze = generateMaze();
      setMaze(newMaze);
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
  }, [gameState, horseInventory, selectedHorse, onHorseReturn]);
  
  const startGameAfterAnnouncement = (keepLostHorse = false) => {
    // Reset positions
    setHorsePos({ x: 1, y: 1 });
    setMinotaurPos({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
    setGameState('exploring');
    setTotalRuns(prev => prev + 1);
    setLastTrap(null);
    setEndReason('');
    setActivePowerups([]);
    setMinotaurStunned(0);
    setPendingTrapCheck(null);
    setMinotaurLostTrack(0);
    setHorseMoveCount(0);
    setTrapHits(0);
    setCollectedKeys([]);
    setActiveSpeedBoost(0);
    setCanUseGoldenApple(false);
    setCurrentTrapPosition(null);
    setActivePowerBoost(0);
    setCurrentLevel(1);
    
    // Reset tarot chest states
    setShowTarotChestModal(false);
    setShowTarotReveal(false);
    setCurrentTarotChest(null);
    // Set starting inventory snapshot for this run
    setStartingInventory([...horseInventory]);
    // Reset session injury flag for new runs
    setHorseInjuredThisSession(false);
    // Reset trap healing state
    setCanUseGoldenApple(false);
    setCurrentTrapPosition(null);
    // Keys now calculated dynamically from inventory
    
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
    
    console.log('🎒 ExitLabyrinth - Inventory check:');
    console.log('  - Current working inventory:', horseInventory.length, 'items');
    
    // With proper mid-run inventory management, horseInventory should never exceed capacity
    // Simply transfer the current inventory to persistent storage
    console.log('🎒 ExitLabyrinth - Transferring inventory directly');
    returnHorseWithItems(horseInventory);
  };


  const returnHorseWithItems = (itemsToKeep, discardedIndices = []) => {
    console.log('🔍 RETURN HORSE DEBUG - Function called');
    console.log('  - horseInjuredThisSession:', horseInjuredThisSession);
    console.log('  - selectedHorse.isInjured:', selectedHorse?.isInjured);
    console.log('  - endReason:', endReason);
    
    if (selectedHorse && onHorseReturn) {
      // The items to keep should be the complete new inventory (selected from modal)
      const dynamicMaxSlots = 4 + (selectedHorse.skills?.saddlebags || 0);
      console.log('🎒 ReturnHorseWithItems - Setting inventory:');
      console.log('  - Items to keep:', itemsToKeep);
      console.log('  - Dynamic max slots:', dynamicMaxSlots);
      
      // Use the selected items as the complete new inventory
      let updatedInventory = [];
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
      const difficultyMultiplier = 1;
      
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
    console.log('🎒 ITEM SELECTION DEBUG - Confirm called');
    console.log('  - isMidRunInventoryManagement:', isMidRunInventoryManagement);
    console.log('  - selectionResult:', selectionResult);
    
    setShowItemSelection(false);
    
    if (isMidRunInventoryManagement) {
      // Mid-run inventory management - reconstruct the complete inventory from user's choices
      console.log('🎒 MID-RUN SELECTION DEBUG:');
      console.log('  - horseInventory before:', horseInventory);
      console.log('  - startingInventory:', startingInventory);
      
      if (Array.isArray(selectionResult)) {
        console.log('  - Setting inventory to array:', selectionResult);
        setHorseInventory(selectionResult);
      } else {
        const { selectedItems, discardedItems } = selectionResult;
        console.log('  - selectedItems:', selectedItems);
        console.log('  - discardedItems:', discardedItems);
        
        // FIXED: Reconstruct the complete inventory from user's selections
        const maxSlots = 4 + getSkillLevel('saddlebags');
        const originalFirst4 = horseInventory.slice(0, maxSlots);
        const overflowItems = horseInventory.slice(maxSlots);
        
        console.log('  - maxSlots:', maxSlots);
        console.log('  - originalFirst4 (shown as horse.inventory):', originalFirst4);
        console.log('  - overflowItems (shown as collectedItems):', overflowItems);
        console.log('  - selectedItems (what user chose):', selectedItems);
        console.log('  - discardedItems (indices user discarded):', discardedItems);
        
        // Reconstruct the final inventory:
        // 1. Start with all items that were shown to the user
        const allItemsShown = [...originalFirst4, ...overflowItems];
        console.log('  - allItemsShown:', allItemsShown);
        
        // 2. Remove items the user discarded (discardedItems contains indices)
        let finalInventory = allItemsShown.filter((item, index) => {
          const isDiscarded = discardedItems.includes(index);
          console.log(`  - Item ${index} (${item.name}): ${isDiscarded ? 'DISCARDED' : 'KEPT'}`);
          return !isDiscarded;
        });
        
        console.log('  - Final inventory after applying discards:', finalInventory);
        setHorseInventory(finalInventory);
      }
      setIsMidRunInventoryManagement(false);
      return;
    }
    
    // End-of-run inventory management - user selected which items to keep in persistent storage
    if (Array.isArray(selectionResult)) {
      // Old format - just selected items
      returnHorseWithItems(selectionResult);
    } else {
      // New format - user selected which items to keep
      const { selectedItems } = selectionResult;
      returnHorseWithItems(selectedItems);
    }
  };

  const handleItemSelectionCancel = () => {
    setShowItemSelection(false);
    
    if (isMidRunInventoryManagement) {
      // Mid-run cancellation - remove ALL overflow items that were temporarily added
      const maxSlots = 4 + getSkillLevel('saddlebags');
      
      if (horseInventory.length > maxSlots) {
        // Remove all items beyond capacity (handles both single item and batch overflow)
        setHorseInventory(prev => prev.slice(0, maxSlots));
      }
      setIsMidRunInventoryManagement(false);
      return;
    }
    
    // End-of-run cancellation - return with no new items
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
          {/* Render the actual tile the horse is standing on */}
          {(() => {
            try {
              const cell = maze[y] && maze[y][x] !== undefined ? maze[y][x] : CELL_EMPTY;
              const tileMapping = TILE_MAP[cell];
              const emptyTileMapping = TILE_MAP[CELL_EMPTY];
              
              if (tileMapping && TILES_WITH_TRANSPARENT_BACKGROUND.has(cell) && emptyTileMapping) {
                return (
                  <LayeredTile 
                    backgroundTile={emptyTileMapping} 
                    foregroundTile={tileMapping} 
                  />
                );
              } else if (tileMapping) {
                return <TileSprite tileX={tileMapping.x} tileY={tileMapping.y} />;
              } else {
                // Fallback to empty tile for unmapped cells
                const emptyTile = getRandomEmptyTile(x, y);
                return <TileSprite tileX={emptyTile.x} tileY={emptyTile.y} />;
              }
            } catch (error) {
              console.error('Error rendering horse tile:', error);
              const emptyTile = getRandomEmptyTile(x, y);
              return <TileSprite tileX={emptyTile.x} tileY={emptyTile.y} />;
            }
          })()}
          <img 
            src={selectedHorse?.avatar || "/maze/horse_player.png"} 
            alt="Horse" 
            className=""
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
              transform: `${horseDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)'} ${
                teleportStage === 'dematerializing' ? 'scale(0.9)' : 
                teleportStage === 'materializing' ? 'scale(1.1)' : 'scale(1)'
              }`,
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
          {/* Render the actual tile the lost horse is standing on */}
          {(() => {
            try {
              const cell = maze[y] && maze[y][x] !== undefined ? maze[y][x] : CELL_EMPTY;
              const tileMapping = TILE_MAP[cell];
              const emptyTileMapping = TILE_MAP[CELL_EMPTY];
              
              if (tileMapping && TILES_WITH_TRANSPARENT_BACKGROUND.has(cell) && emptyTileMapping) {
                return (
                  <LayeredTile 
                    backgroundTile={emptyTileMapping} 
                    foregroundTile={tileMapping} 
                  />
                );
              } else if (tileMapping) {
                return <TileSprite tileX={tileMapping.x} tileY={tileMapping.y} />;
              } else {
                // Fallback to empty tile for unmapped cells
                const emptyTile = getRandomEmptyTile(x, y);
                return <TileSprite tileX={emptyTile.x} tileY={emptyTile.y} />;
              }
            } catch (error) {
              console.error('Error rendering lost horse tile:', error);
              const emptyTile = getRandomEmptyTile(x, y);
              return <TileSprite tileX={emptyTile.x} tileY={emptyTile.y} />;
            }
          })()}
          <img 
            src={lostHorse.avatar} 
            alt="Lost Horse" 
            className=""
            style={{
              ...baseStyle,
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 1,
              backgroundColor: 'transparent',
              transform: lostHorse.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
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
    
    // Special handling for CELL_POWERUP to use specific power-up tile
    if (cell === CELL_POWERUP) {
      const powerupAtPosition = powerupPositions.find(p => p.x === x && p.y === y);
      if (powerupAtPosition) {
        const powerup = powerupAtPosition.powerupType;
        if (TILES_WITH_TRANSPARENT_BACKGROUND.has(cell)) {
          return (
            <LayeredTile 
              backgroundTile={getRandomEmptyTile(x, y)} 
              foregroundTile={{ x: powerup.tileX, y: powerup.tileY }} 
            />
          );
        }
        return <TileSprite tileX={powerup.tileX} tileY={powerup.tileY} />;
      }
      // Fallback to generic power-up tile if position not found
      const fallbackTile = TILE_MAP[CELL_POWERUP];
      if (TILES_WITH_TRANSPARENT_BACKGROUND.has(cell)) {
        return (
          <LayeredTile 
            backgroundTile={getRandomEmptyTile(x, y)} 
            foregroundTile={fallbackTile} 
          />
        );
      }
      return <TileSprite tileX={fallbackTile.x} tileY={fallbackTile.y} />;
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

  // For end-of-run, we just transfer whatever is in horseInventory to persistent storage
  // No need for complex "collected items" calculation

  // Helper function to get tile coordinates for inventory items
  const getItemTileCoords = (item) => {
    // Handle reward items
    if (item.name === 'Golden Apple') return TILE_MAP.REWARD_GOLDEN_APPLE;
    if (item.name === 'Energy Drink') return TILE_MAP.REWARD_ENERGY_DRINK;
    if (item.name === 'Horse Power Cereal') return TILE_MAP.REWARD_HORSE_POWER_CEREAL;
    
    // Handle legendary reward items
    if (item.name === 'Ancient Treasure') return TILE_MAP.LEGENDARY_ANCIENT_TREASURE;
    if (item.name === 'Dragon Egg') return TILE_MAP.LEGENDARY_DRAGON_EGG;
    if (item.name === 'Sacred Relic') return TILE_MAP.LEGENDARY_SACRED_RELIC;
    
    // Handle record items
    if (item.name === 'Wild Mane Record') return TILE_MAP.RECORD_WILD_MANE;
    if (item.name === 'Wild and Unbridled Record') return TILE_MAP.RECORD_WILD_UNBRIDLED;
    if (item.name === 'Clover Record') return TILE_MAP.RECORD_CLOVER;
    
    // Handle other labyrinth items
    if (item.id === 'key' || item.name === 'Key') return TILE_MAP[CELL_KEY];
    if (item.id === 'vault_treasure' || item.name === 'Vault Treasure') return TILE_MAP[CELL_VAULT];
    if (item.id === 'tarot_card' || item.name === 'Tarot Card') return TILE_MAP[CELL_TAROT_CHEST];
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
              <img src="/horsecoins.png" alt="coins" className="w-4 h-4" />
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

        {/* Maze Grid */}
        <div className={`${themeUtils.getComponentStyles(currentTheme, 'card')} rounded-xl p-4 shadow-lg mb-3`}>
          <div 
            className={`border-2 border-gray-800 w-full rounded-lg overflow-hidden shadow-inner relative`}
            style={{ 
              backgroundColor: labyrinthStyles.wall,
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 0,
              aspectRatio: '1/1'
            }}
          >
            {/* CSS for character flipping and teleportation */}
            <style>{`
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
                  const maxDuration = ft.duration || 2000; // Use custom duration or default 2 seconds
                  const opacity = Math.max(0, 1 - (age / maxDuration));
                  
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
            {pendingTrapCheck && (
              <div className="text-center p-2 bg-red-50 border border-red-300 rounded-lg">
                <p className="text-red-700 text-xs">⚠️ Checking for trap...</p>
              </div>
            )}
            {gameState === 'paused' && canUseGoldenApple && (
              <div className="text-center p-3 bg-yellow-50 border border-yellow-300 rounded-lg animate-pulse">
                <p className="text-yellow-800 font-semibold text-sm">⏸️ GAME PAUSED</p>
                <p className="text-yellow-700 text-xs mt-1">Horse trapped! Click Golden Apple to heal or wait to end run.</p>
              </div>
            )}
            {gameState === 'ended' && (
              <div className="text-sm">
                {endReason === 'trap' && lastTrap && (
                  <p className="text-red-600">💥 Hit Bear Trap 🪤!</p>
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

        </div>

        {/* 2. Horse Display with Inventory */}
        {selectedHorse && (
          <div className={`${themeUtils.getComponentStyles(currentTheme, 'card')} rounded-xl p-4 shadow-lg mb-3`}>
            <div className="mb-3">
              {/* Horse Info Row */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    {selectedHorse.name} 
                    <button 
                      onClick={() => setShowPerformanceModal(true)}
                      className={`ml-1 font-normal hover:underline cursor-pointer ${(() => {
                        const avgCondition = (selectedHorse.happiness + selectedHorse.health + selectedHorse.energy) / 3;
                        if (selectedHorse.isInjured) {
                          return 'text-red-600';
                        } else if (avgCondition >= 80) {
                          return 'text-green-600';
                        } else if (avgCondition >= 65) {
                          return 'text-green-600';
                        } else if (avgCondition >= 50) {
                          return 'text-yellow-600';
                        } else if (avgCondition >= 35) {
                          return 'text-orange-600';
                        } else {
                          return 'text-red-600';
                        }
                      })()}`}
                    >
                      ({(() => {
                        const avgCondition = (selectedHorse.happiness + selectedHorse.health + selectedHorse.energy) / 3;
                        if (selectedHorse.isInjured) {
                          return 'Injured';
                        } else if (avgCondition >= 80) {
                          return 'Excellent';
                        } else if (avgCondition >= 65) {
                          return 'Good';
                        } else if (avgCondition >= 50) {
                          return 'Fair';
                        } else if (avgCondition >= 35) {
                          return 'Tired';
                        } else {
                          return 'Weak';
                        }
                      })()})
                    </button>
                  </h2>
                  <div className="text-sm text-gray-600">
                    {(() => {
                      const modifiers = getHorsePerformanceModifiers();
                      const speedBoostMultiplier = activeSpeedBoost > 0 ? 1.8 : 1; // 80% faster when boost is active
                      const baseSpeedPercent = Math.round(modifiers.speed * 100);
                      const totalSpeedPercent = Math.round(modifiers.speed * speedBoostMultiplier * 100);
                      const speedBoostPercent = totalSpeedPercent - baseSpeedPercent;
                      
                      const powerBoostAvoidance = activePowerBoost > 0 ? 25 : 0; // 25% bonus from horsepower cereal
                      const totalTrapAvoidance = modifiers.trapAvoidance + powerBoostAvoidance;
                      return (
                        <div>
                          <div>
                            Speed: {totalSpeedPercent}%
                            {activeSpeedBoost > 0 && <span className="text-green-600 font-semibold"> (+{speedBoostPercent}%)</span>}
                            {' | '}
                            Trap Avoid: {totalTrapAvoidance}%
                            {activePowerBoost > 0 && <span className="text-purple-600 font-semibold"> (+{powerBoostAvoidance}%)</span>}
                          </div>
                          {(trapHits > 0 || getSkillLevel('pathfinding') > 0) && (
                            <div className="text-xs mt-1 space-x-2">
                              {trapHits > 0 && <span>❤️ Trap Hits: {trapHits}/{getSkillLevel('thickSkin')}</span>}
                              {getSkillLevel('pathfinding') > 0 && <span>🧭 Smart Movement</span>}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {activeSpeedBoost > 0 && (
                    <span className="text-green-600 font-semibold animate-pulse">⚡ Speed {Math.ceil(activeSpeedBoost/1000)}s</span>
                  )}
                  {activePowerBoost > 0 && (
                    <span className="text-purple-600 font-semibold animate-pulse">💪 Power {Math.ceil(activePowerBoost/1000)}s</span>
                  )}
                </div>
              </div>
              
              {/* Inventory Grid */}
              <div className="grid grid-cols-4 gap-1 mt-2 mb-3">
                {Array.from({ length: 4 + getSkillLevel('saddlebags') }).map((_, index) => {
                  const item = horseInventory?.[index]; // Use horseInventory state instead of selectedHorse.inventory
                  const canUseItem = (gameState === 'exploring' || gameState === 'paused') && item && item.name !== 'Key' && item.name !== 'Golden Apple'; // Keys and Golden Apples are handled separately
                  const isGoldenAppleUsable = item?.name === 'Golden Apple' && canUseGoldenApple && gameState === 'paused'; // Golden Apple only usable when paused due to trap
                  const isSpeedBoostActive = activeSpeedBoost > 0 && item?.name === 'Energy Drink';
                  
                  return (
                    <button
                      key={index}
                      onClick={() => (canUseItem || isGoldenAppleUsable) && useInventoryItem(item.name, index)}
                      disabled={!canUseItem && !isGoldenAppleUsable}
                      className={`w-16 h-16 border-2 border-dashed rounded-md flex items-center justify-center transition-all ${
                        item ? 'bg-white border-solid border-purple-300' : 'bg-gray-50 border-gray-300'
                      } ${
                        canUseItem || isGoldenAppleUsable ? 'hover:bg-green-50 hover:border-green-300 cursor-pointer hover:scale-105' : ''
                      } ${
                        isGoldenAppleUsable ? 'ring-2 ring-yellow-400 animate-pulse' : ''
                      } ${
                        isSpeedBoostActive ? 'ring-2 ring-green-400' : ''
                      }`}
                      title={
                        item ? (
                          canUseItem || isGoldenAppleUsable ? 
                          `Click to use ${item.name}` : 
                          item.name === 'Key' ? 
                          'Keys used automatically' : 
                          item.name
                        ) : 'Empty'
                      }
                    >
                      {item ? (
                        (() => {
                          const tileCoords = getItemTileCoords(item);
                          if (tileCoords) {
                            return (
                              <div className="w-full h-full flex items-center justify-center" title={item.name}>
                                <TileSprite tileX={tileCoords.x} tileY={tileCoords.y} />
                              </div>
                            );
                          } else {
                            return (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-10 h-10 object-contain"
                                title={item.name}
                              />
                            );
                          }
                        })()
                      ) : (
                        <div className="text-gray-400 text-xs">Empty</div>
                      )}
                    </button>
                  );
                })}
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
            
            {/* Game Controls */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-gray-600 font-medium">Game Controls</div>
                <div className="flex items-center gap-2">
                  {/* Speed Toggle */}
                  <button
                    onClick={() => {
                      const speeds = [800, 400, 200]; // 1X, 2X, 3X
                      const currentIndex = speeds.indexOf(gameSpeed);
                      const nextIndex = (currentIndex + 1) % speeds.length;
                      setGameSpeed(speeds[nextIndex]);
                    }}
                    disabled={gameState === 'exploring'}
                    className={`px-2 py-1 text-xs font-bold rounded border-2 min-w-[32px] ${
                      gameState === 'exploring' 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'border-blue-500 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {gameSpeed === 800 ? '1X' : gameSpeed === 400 ? '2X' : '3X'}
                  </button>
                  
                  {/* Action Buttons */}
                  {gameState === 'exploring' ? (
                    <button
                      onClick={() => {
                        setEndReason('early_exit');
                        setGameState('ended');
                        // Items are now immediately added to inventory, no need to transfer
                        const itemsCollected = horseInventory.length - (selectedHorse?.inventory?.length || 0);
                        const basePoints = Math.floor(itemsCollected / 3) + 1;
                        const skillPointsEarned = Math.max(0, Math.floor(itemsCollected / 6));
                        setSkillPoints(prev => prev + skillPointsEarned);
                      }}
                      className={`px-3 py-1 text-xs ${themeUtils.getComponentStyles(currentTheme, 'button', 'warning')} font-medium rounded`}
                    >
                      End Run
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={startGame}
                        disabled={selectedHorse.isInjured || horseInjuredThisSession}
                        className={`px-3 py-1 text-xs ${themeUtils.getComponentStyles(currentTheme, 'button', 'success')} font-medium rounded`}
                      >
                        {gameState === 'waiting' ? 'Start' : 'New Run'}
                      </button>
                      <button
                        onClick={() => setShowSkillTree(!showSkillTree)}
                        className={`px-2 py-1 text-xs ${themeUtils.getComponentStyles(currentTheme, 'button', 'secondary')} font-medium rounded`}
                      >
                        Skills ({skillPoints})
                      </button>
                    </>
                  )}
                </div>
              </div>
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


        {/* Items are now shown directly in the active inventory below */}
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
      
      {/* Tarot Chest Interaction Modal */}
      {showTarotChestModal && currentTarotChest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div style={{ width: '80px', height: '80px' }}>
                  <TileSprite 
                    tileX={TILE_MAP[CELL_TAROT_CHEST].x} 
                    tileY={TILE_MAP[CELL_TAROT_CHEST].y}
                  />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-800">
                {selectedHorse?.name} has found a mystical tarot chest!
              </h2>
              
              <p className="text-sm text-gray-600">
                This ancient chest contains powerful tarot cards but requires 2 keys to unlock.
              </p>
              
              <button
                onClick={handleTarotChestUnlock}
                disabled={availableKeys < 2}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  availableKeys >= 2 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                🗝️🗝️ Unlock {availableKeys >= 2 ? `(${availableKeys} keys)` : `(Need 2 keys, have ${availableKeys})`}
              </button>
              
              <button
                onClick={handleTarotChestLeave}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Leave Chest
              </button>
              
              {availableKeys < 2 && (
                <p className="text-xs text-red-600 mt-2">
                  You need 2 keys to unlock this tarot chest. Find more keys scattered throughout the maze!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Tarot Card Reveal Modal */}
      {showTarotReveal && currentTarotChest && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🔮</div>
              <h2 className="text-2xl font-bold text-purple-800">
                Tarot Card Discovered!
              </h2>
              
              {/* Show the tarot card */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <div className="mb-2 flex justify-center">
                  <div style={{ width: '64px', height: '64px' }}>
                    <TileSprite 
                      tileX={TILE_MAP[CELL_TAROT_CHEST].x} 
                      tileY={TILE_MAP[CELL_TAROT_CHEST].y}
                    />
                  </div>
                </div>
                <div className="text-lg font-bold text-purple-800">
                  {currentTarotChest.reward.name}
                </div>
                <div className="text-sm text-purple-700 mt-1">
                  A mystical tarot card!
                </div>
              </div>
              
              <p className="text-gray-600">
                {selectedHorse?.name} has unlocked the tarot chest and discovered this mystical card!
              </p>
              
              <button
                onClick={handleTarotRevealContinue}
                className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Continue Adventure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Info Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">🐴 Horse Performance</h2>
                <button
                  onClick={() => setShowPerformanceModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">📊 Condition</h3>
                  <p className="text-gray-600">
                    Based on the average of your horse's <strong>Happiness</strong>, <strong>Health</strong>, and <strong>Energy</strong> levels:
                  </p>
                  <ul className="mt-1 ml-4 text-xs text-gray-500">
                    <li>• <span className="text-green-600">Excellent</span>: 80+ average</li>
                    <li>• <span className="text-green-600">Good</span>: 65-79 average</li>
                    <li>• <span className="text-yellow-600">Fair</span>: 50-64 average</li>
                    <li>• <span className="text-orange-600">Tired</span>: 35-49 average</li>
                    <li>• <span className="text-red-600">Weak</span>: Below 35 average</li>
                    <li>• <span className="text-red-600">Injured</span>: Cannot enter maze</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">🏃‍♂️ Speed</h3>
                  <p className="text-gray-600">
                    How fast your horse moves through the maze. Range: <strong>50% - 120%</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Better conditioned horses (high happiness, health, energy) move faster and get more turns.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">🛡️ Trap Avoid</h3>
                  <p className="text-gray-600">
                    Chance to completely avoid trap damage. Range: <strong>0% - 25%</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Well-conditioned horses can dodge traps entirely. Stacks with Trap Sense skill for even higher avoidance.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Tip:</strong> Keep your horse well-fed, watered, clean, and happy in the stable for optimal maze performance!
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowPerformanceModal(false)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Got it!
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
        horse={{ ...selectedHorse, inventory: isMidRunInventoryManagement ? (() => {
          const maxSlots = 4 + getSkillLevel('saddlebags');
          return horseInventory.slice(0, maxSlots);
        })() : [] }}
        collectedItems={isMidRunInventoryManagement ? (() => {
          const saddlebagsLevel = getSkillLevel('saddlebags');
          const maxSlots = 4 + saddlebagsLevel;
          const overflowItems = horseInventory.slice(maxSlots);
          
          
          return overflowItems;
        })() : horseInventory}
        onConfirm={handleItemSelectionConfirm}
        onCancel={handleItemSelectionCancel}
      />
    </div>
  );
}

export default HorseMazeGame;
