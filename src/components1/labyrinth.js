import React, { useState, useEffect, useCallback } from "react";

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
      wallWalking: { name: 'Wall Walking', emoji: '🕷️', maxLevel: 1, cost: () => 10, description: 'Permanent wall breaking' }
    }
  },
  magic: {
    name: 'Magic',
    color: 'purple',
    skills: {
      powerupMagnet: { name: 'Power-up Magnet', emoji: '🔮', maxLevel: 3, cost: (level) => level * 3, description: 'Attract power-ups from distance' },
      enhancement: { name: 'Enhancement', emoji: '✨', maxLevel: 5, cost: (level) => level * 2, description: 'Power-up effects last longer' },
      teleportMastery: { name: 'Teleport Mastery', emoji: '🌟', maxLevel: 3, cost: (level) => level * 4, description: 'Control teleport destination' }
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

function HorseMazeGame({ onBack }) {
  const [maze, setMaze] = useState([]);
  const [horsePos, setHorsePos] = useState({ x: 1, y: 1 });
  const [minotaurPos, setMinotaurPos] = useState({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
  const [inventory, setInventory] = useState([]);
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
  
  // Skill system
  const [skillPoints, setSkillPoints] = useState(0);
  const [skills, setSkills] = useState({
    trapSense: 0, thickSkin: 0, lucky: 0,
    swiftness: 0, pathfinding: 0, wallWalking: 0,
    powerupMagnet: 0, enhancement: 0, teleportMastery: 0,
    sneaking: 0, distraction: 0, ghostForm: 0
  });
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [trapHits, setTrapHits] = useState(0);

  // Generate a random maze using recursive backtracking
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
    
    // Track special features for state
    const newMovingWalls = [];
    const newDarkZones = [];
    const newVaultKeys = [];
    let portalA = null;
    let portalB = null;
    
    // Add advanced maze features and regular items
    for (let y = 1; y < MAZE_SIZE - 1; y++) {
      for (let x = 1; x < MAZE_SIZE - 1; x++) {
        if (newMaze[y][x] === CELL_EMPTY) {
          const rand = Math.random();
          
          if (rand < 0.08) {
            newMaze[y][x] = CELL_REWARD;
          } else if (rand < 0.16) {
            newMaze[y][x] = CELL_TRAP;
          } else if (rand < 0.22) {
            newMaze[y][x] = CELL_POWERUP;
          } else if (rand < 0.24) {
            newMaze[y][x] = CELL_MOVING_WALL;
            newMovingWalls.push({ x, y, closed: true, timer: Math.floor(Math.random() * 6) + 2 });
          } else if (rand < 0.26) {
            const directions = [CELL_ONEWAY_N, CELL_ONEWAY_S, CELL_ONEWAY_E, CELL_ONEWAY_W];
            newMaze[y][x] = directions[Math.floor(Math.random() * directions.length)];
          } else if (rand < 0.265 && !portalA) {
            newMaze[y][x] = CELL_PORTAL_A;
            portalA = { x, y };
          } else if (rand < 0.27 && portalA && !portalB) {
            newMaze[y][x] = CELL_PORTAL_B;
            portalB = { x, y };
          } else if (rand < 0.28) {
            newMaze[y][x] = CELL_DARK_ZONE;
            newDarkZones.push({ x, y });
          } else if (rand < 0.285) {
            newMaze[y][x] = CELL_KEY;
            newVaultKeys.push({ x, y, id: Math.random().toString(36).substr(2, 9) });
          } else if (rand < 0.29 && newVaultKeys.length > 0) {
            newMaze[y][x] = CELL_VAULT;
          }
        }
      }
    }
    
    setMovingWalls(newMovingWalls);
    setPortals({ A: portalA, B: portalB });
    setDarkZones(newDarkZones);
    setVaultKeys(newVaultKeys);
    
    return newMaze;
  }, []);

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
        const points = Math.floor(currentRewards.length / 2) + 1;
        setSkillPoints(prev => prev + points);
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
          const points = Math.floor(currentRewards.length / 2) + 1;
          setSkillPoints(prev => prev + points);
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
        
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
          return newMaze;
        });
      } else if (cell === CELL_POWERUP) {
        const powerup = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
        usePowerup(powerup);
        
        setMaze(prevMaze => {
          const newMaze = prevMaze.map(row => [...row]);
          newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
          return newMaze;
        });
      } else if (cell === CELL_KEY) {
        const key = vaultKeys.find(k => k.x === nextMove.x && k.y === nextMove.y);
        if (key) {
          setCollectedKeys(prev => [...prev, key.id]);
          setMaze(prevMaze => {
            const newMaze = prevMaze.map(row => [...row]);
            newMaze[nextMove.y][nextMove.x] = CELL_EMPTY;
            return newMaze;
          });
        }
      } else if (cell === CELL_VAULT) {
        if (collectedKeys.length > 0) {
          const legendaryRewards = [
            { name: 'Ancient Treasure', emoji: '👑', rarity: 0.05 },
            { name: 'Dragon Egg', emoji: '🥚', rarity: 0.03 },
            { name: 'Sacred Relic', emoji: '🏺', rarity: 0.04 }
          ];
          const reward = legendaryRewards[Math.floor(Math.random() * legendaryRewards.length)];
          setCurrentRewards(prev => [...prev, reward]);
          setCollectedKeys(prev => prev.slice(1));
          
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
        const points = Math.floor(currentRewards.length / 2) + 1;
        setSkillPoints(prev => prev + points);
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
  };

  const getCellDisplay = (cell, x, y) => {
    if (horsePos.x === x && horsePos.y === y && minotaurPos.x === x && minotaurPos.y === y) {
      return '💥';
    }
    if (horsePos.x === x && horsePos.y === y) return '🐎';
    if (minotaurPos.x === x && minotaurPos.y === y) {
      if (minotaurStunned > 0) return '😵';
      if (minotaurLostTrack > 0) return '❓';
      return '👹';
    }
    
    // Check moving walls
    const movingWall = movingWalls.find(w => w.x === x && w.y === y);
    if (movingWall) {
      return movingWall.closed ? '🚪' : '🔓';
    }
    
    switch (cell) {
      case CELL_WALL: return '⬛';
      case CELL_EMPTY: return '⬜';
      case CELL_START: return '🏠';
      case CELL_REWARD: return '✨';
      case CELL_TRAP: return '❌';
      case CELL_POWERUP: return '🔮';
      case CELL_ONEWAY_N: return '⬆️';
      case CELL_ONEWAY_S: return '⬇️';
      case CELL_ONEWAY_E: return '➡️';
      case CELL_ONEWAY_W: return '⬅️';
      case CELL_PORTAL_A: return '🌀';
      case CELL_PORTAL_B: return '🌀';
      case CELL_DARK_ZONE: return '🌑';
      case CELL_VAULT: return '🏛️';
      case CELL_KEY: return '🗝️';
      default: return '⬜';
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
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              ← Back
            </button>
          )}
          <h1 className="text-4xl font-bold text-center flex-1 text-green-800">
            🐎 Horse Maze Explorer
          </h1>
          <div className="w-20" />
        </div>
        <p className="text-center text-green-700 mb-6">
          Watch your brave horse explore mysterious mazes and collect treasures!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Maze Explorer</h2>
              <div className="text-sm text-gray-600 space-x-4">
                <span>Run #{totalRuns}</span>
                <span className="text-purple-600">💎 {skillPoints} Skill Points</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-0 mb-4 border-2 border-gray-400 inline-block">
              {maze.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className="w-6 h-6 flex items-center justify-center text-xs"
                  >
                    {getCellDisplay(cell, x, y)}
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={startGame}
                  disabled={gameState === 'exploring'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {gameState === 'waiting' ? 'Start Adventure' : 'New Adventure'}
                </button>
                
                <button
                  onClick={() => setShowSkillTree(!showSkillTree)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Skills ({skillPoints} 💎)
                </button>
                
                <select
                  value={gameSpeed}
                  onChange={(e) => setGameSpeed(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={gameState === 'exploring'}
                >
                  <option value={1200}>Slow</option>
                  <option value={800}>Normal</option>
                  <option value={400}>Fast</option>
                  <option value={200}>Very Fast</option>
                </select>
              </div>

              <div className="text-sm space-y-2">
                {gameState === 'waiting' && (
                  <p className="text-gray-600">Click "Start Adventure" to begin!</p>
                )}
                {gameState === 'exploring' && (
                  <div className="space-y-1">
                    <p className="text-blue-600 animate-pulse">🐎 Your horse is exploring the maze...</p>
                    {minotaurStunned > 0 && (
                      <p className="text-yellow-600">😵 Minotaur is stunned for {minotaurStunned} more turns!</p>
                    )}
                    {minotaurLostTrack > 0 && (
                      <p className="text-purple-600">❓ Minotaur lost track for {minotaurLostTrack} more turns!</p>
                    )}
                    {!minotaurStunned && !minotaurLostTrack && (
                      <p className="text-red-600 animate-pulse">👹 The minotaur is hunting your horse!</p>
                    )}
                  </div>
                )}
                {gameState === 'ended' && (
                  <div>
                    {endReason === 'trap' && lastTrap && (
                      <p className="text-red-600">💥 Your horse hit a {lastTrap.name} {lastTrap.emoji}!</p>
                    )}
                    {endReason === 'minotaur' && (
                      <p className="text-red-600">👹 The minotaur caught your horse!</p>
                    )}
                  </div>
                )}

                {activePowerups.length > 0 && (
                  <div className="bg-blue-50 p-2 rounded">
                    <h4 className="text-xs font-semibold text-blue-800 mb-1">Active Power-ups:</h4>
                    <div className="flex flex-wrap gap-1">
                      {activePowerups.map((powerup, idx) => (
                        <span key={idx} className="bg-blue-200 px-2 py-1 rounded text-xs">
                          {powerup.emoji} {powerup.name} ({powerup.duration})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(trapHits > 0 || Object.values(skills).some(level => level > 0) || collectedKeys.length > 0) && (
                <div className="bg-blue-50 p-2 rounded">
                  <h4 className="text-xs font-semibold text-blue-800 mb-1">Horse Status:</h4>
                  <div className="text-xs space-y-1">
                    {trapHits > 0 && <div>❤️ Trap Hits: {trapHits}/{getSkillLevel('thickSkin')}</div>}
                    {collectedKeys.length > 0 && <div>🗝️ Keys: {collectedKeys.length}</div>}
                    {getSkillLevel('wallWalking') > 0 && <div>🕷️ Wall Walking Active</div>}
                    {getSkillLevel('pathfinding') > 0 && <div>🧭 Smart Movement Active</div>}
                  </div>
                </div>
              )}

              {(movingWalls.length > 0 || Object.values(portals).some(p => p !== null) || darkZones.length > 0) && (
                <div className="bg-indigo-50 p-2 rounded">
                  <h4 className="text-xs font-semibold text-indigo-800 mb-1">Maze Features:</h4>
                  <div className="text-xs space-y-1">
                    {movingWalls.length > 0 && <div>🚪 Moving Walls: {movingWalls.filter(w => !w.closed).length}/{movingWalls.length} open</div>}
                    {portals.A && portals.B && <div>🌀 Portal Network Active</div>}
                    {darkZones.length > 0 && <div>🌑 Dark Zones: {darkZones.length}</div>}
                  </div>
                </div>
              )}

              {currentRewards.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Current Run Rewards:</h4>
                  <div className="flex flex-wrap gap-1">
                    {currentRewards.map((reward, idx) => (
                      <span key={idx} className="bg-yellow-200 px-2 py-1 rounded text-xs">
                        {reward.emoji} {reward.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {showSkillTree && (
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Skill Tree (💎 {skillPoints} points available)
              </h2>
              
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
          )}

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Treasure Inventory ({inventory.length} items)
            </h2>
            
            {inventory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No treasures collected yet. Send your horse on an adventure!
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uniqueInventoryItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {inventory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Total Adventures: {totalRuns}</div>
                  <div>Success Rate: {totalRuns > 0 ? Math.round((inventory.length / totalRuns) * 100) : 0}% items per run</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg p-4 shadow-lg">
          <h3 className="font-semibold mb-2">Legend:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
            <div>🐎 Your Horse</div>
            <div>👹 Minotaur</div>
            <div>🏠 Start</div>
            <div>✨ Treasure</div>
            <div>❌ Trap</div>
            <div>🔮 Power-up</div>
            <div>🗝️ Key</div>
            <div>🏛️ Vault</div>
          </div>
          
          <div className="border-t pt-3 mb-3">
            <h4 className="font-semibold mb-2">Advanced Features:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>🚪 Moving Wall (Closed)</div>
              <div>🔓 Moving Wall (Open)</div>
              <div>⬆️⬇️➡️⬅️ One-way Doors</div>
              <div>🌀 Portal</div>
              <div>🌑 Dark Zone</div>
              <div>🌫️ Fog of War</div>
              <div>⬜ Path</div>
              <div>⬛ Wall</div>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <h4 className="font-semibold mb-2">Power-ups:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-semibold">⚡ Speed Boost</div>
                <div>Horse moves twice per turn</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-semibold">👻 Invisibility</div>
                <div>Minotaur wanders randomly</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-semibold">🌀 Teleport</div>
                <div>Jump to random safe location</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-semibold">🔨 Wall Breaker</div>
                <div>Move through walls</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-semibold">💣 Stun Bomb</div>
                <div>Freeze minotaur in place</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-semibold">🧲 Magnet</div>
                <div>Auto-collect nearby treasures</div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 mt-2">
            Navigate advanced maze features! Moving walls open/close periodically, one-way doors restrict movement direction, portals teleport you instantly, dark zones add atmospheric challenge, and vaults require keys for legendary treasures!
          </p>
        </div>
      </div>
    </div>
  );
}

export default HorseMazeGame;
