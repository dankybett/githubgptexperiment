import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeInImage from "./FadeInImage";
import HorseDetailsModal from "./HorseDetailsModal";
import ThemedTarotGame from "./ThemedTarotGame";
import { themeUtils } from "../utils/themes";
import { tarotCardUtils, TAROT_CARDS } from "../utils/tarotCards";

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

// EmojiSprite component for emoji tilesheet (4x4 grid)
const EmojiSprite = ({ tileX, tileY, size = 24, className = "" }) => {
  const tilesPerRow = 4; // 4x4 grid
  
  // Calculate percentage positions for the 4x4 grid
  const positionX = (tileX / (tilesPerRow - 1)) * 100;
  const positionY = (tileY / (tilesPerRow - 1)) * 100;
  
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: 'url(/emojis.png)',
    backgroundPosition: `${positionX}% ${positionY}%`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${tilesPerRow * 100}% ${tilesPerRow * 100}%`,
    imageRendering: 'pixelated',
    display: 'inline-block',
    filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
  };
  
  return <div className={`emoji-sprite ${className}`} style={style} />;
};

// Emoji tilesheet mapping (4x4 grid)
// Row 0: happy, sad, angry, sick
// Row 1: heart, broken heart, apple, carrot  
// Row 2: plaster, content, sleep zzz, music note
// Row 3: lightning bolt, sponge, sparkle, sparkle
const EMOJI_MAP = {
  happy: { x: 0, y: 0 },
  sad: { x: 1, y: 0 },
  angry: { x: 2, y: 0 },
  sick: { x: 3, y: 0 },
  heart: { x: 0, y: 1 },
  brokenHeart: { x: 1, y: 1 },
  apple: { x: 2, y: 1 },
  carrot: { x: 3, y: 1 },
  plaster: { x: 0, y: 2 },
  content: { x: 1, y: 2 },
  sleep: { x: 2, y: 2 },
  music: { x: 3, y: 2 },
  lightning: { x: 0, y: 3 },
  sponge: { x: 1, y: 3 },
  sparkle1: { x: 2, y: 3 },
  sparkle2: { x: 3, y: 3 }
};

// Tile mappings for record items
const TILE_MAP = {
  RECORD_WILD_MANE: { x: 8, y: 9 },
  RECORD_WILD_UNBRIDLED: { x: 9, y: 9 },
  RECORD_CLOVER: { x: 7, y: 9 },
  RECORD_HORSE_POWER_CEREAL: { x: 8, y: 8 },
  RECORD_HORSE_BROS: { x: 7, y: 8 },
  RECORD_PARTNERS_IN_HOOF: { x: 9, y: 8 }
};

// Helper function to get tile key from record name
const getRecordTileKey = (recordName) => {
  switch(recordName) {
    case 'Wild Mane Record': return 'RECORD_WILD_MANE';
    case 'Wild and Unbridled Record': return 'RECORD_WILD_UNBRIDLED';
    case 'Clover Record': return 'RECORD_CLOVER';
    case 'Horse Power Cereal Record': return 'RECORD_HORSE_POWER_CEREAL';
    case 'Horse Bros Record': return 'RECORD_HORSE_BROS';
    case 'Partners in Hoof Record': return 'RECORD_PARTNERS_IN_HOOF';
    default: return null;
  }
};

const HorseStable = ({
  horseAvatars,
  horseNames,
  horsePersonalities,
  unlockedHorses,
  coins,
  horseInventories,
  horseSkills,
  horseSkillPoints,
  customHorseNames,
  horseCareStats,
  onUpdateHorseCareStats,
  onBack,
  onShowLockedHorses,
  onSendToLabyrinth,
  onUpdateCoins,
  onHorseRename,
  dayCount,
  onUpdateDayCount,
  stableGameTime,
  onUpdateStableGameTime,
  currentTheme = 'retro', // Add currentTheme prop
  unlockedSongs = {},
  onUnlockSong,
  onRemoveItemFromHorseInventory,
  onRemoveItemFromHorseInventoryByIndex,
  onAddItemToHorseInventory,
  nestEgg,
  onUpdateNestEgg,
  selectedGrazingHorses,
  onUpdateSelectedGrazingHorses,
  onSpecialProgressUpdate,
  unlockedTarotCards = [],
  onUnlockTarotCard,
}) => {
  const [stableHorses, setStableHorses] = useState([]);
  const [stableLoaded, setStableLoaded] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [availableHorses, setAvailableHorses] = useState([]);
  // selectedHorseIds now comes from props as selectedGrazingHorses
  const [showSelector, setShowSelector] = useState(false);
  const [showNameTags, setShowNameTags] = useState(false);
  const [horseSortOrder, setHorseSortOrder] = useState('default'); // 'default' or 'alphabetical'
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [showLabyrinthEntrance, setShowLabyrinthEntrance] = useState(false);
  const [horseBeingSent, setHorseBeingSent] = useState(null);
  const [showTvModal, setShowTvModal] = useState(false);
  const [currentTvVideo, setCurrentTvVideo] = useState(0);
  const [showSongUnlockModal, setShowSongUnlockModal] = useState(false);
  const [unlockedSongData, setUnlockedSongData] = useState(null);
  const [showDragonNestModal, setShowDragonNestModal] = useState(false);
  
  // Dragon egg hatching system (nestEgg comes from props)
  const [showHatchingModal, setShowHatchingModal] = useState(false);
  
  // Pan/drag state - Start at top-left corner
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  // Day tracking for dragon egg hatching (dayCount comes from props)
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [potentialDrag, setPotentialDrag] = useState(false);
  
  // Zoom/pinch state - Start zoomed out for better overview
  const [zoom, setZoom] = useState(0.7);
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(0.7);
  const [isPinching, setIsPinching] = useState(false);
  
  // Stable dimensions - much larger world to explore
  const STABLE_WIDTH = 1600;  // 2x larger than original 800
  const STABLE_HEIGHT = 1800; // 3x larger than original 600
  
  // TV videos list
  const tvVideos = [
    {
      src: "/TV/One day we'll run.mp4",
      title: "One Day We'll Run"
    },
    {
      src: "/TV/partners in hoof.mp4",
      title: "Partners in Hoof"
    }
  ];
  
  // Zoom limits
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2.0;
  
  // Stable care resources state
  const [stableResources, setStableResources] = useState({
    feed: 85,
    water: 92,
    pasture: 88,
    cleanliness: 78
  });
  const [lastCareTime, setLastCareTime] = useState(Date.now());
  const [careActionFeedback, setCareActionFeedback] = useState(null);

  // Day/Night cycle state - initialize with persistent time
  const [gameTime, setGameTime] = useState(stableGameTime || 0); // 0-24 hours
  const [lastDailyIncome, setLastDailyIncome] = useState(0);
  const [newDayNotification, setNewDayNotification] = useState(null);

  // Happiness reward system state
  const [happinessRewardModal, setHappinessRewardModal] = useState(null);
  const [lastHappinessCheck, setLastHappinessCheck] = useState({});

  // Simple cycling state
  const [cyclingIndex, setCyclingIndex] = useState({});


  // Library system state
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showStableStatsModal, setShowStableStatsModal] = useState(false);
  const [showTarotModal, setShowTarotModal] = useState(false);
  const [showLockedTarotCards, setShowLockedTarotCards] = useState(false);
  const [showTarotGame, setShowTarotGame] = useState(false);
  const [unlockedBooks, setUnlockedBooks] = useState({
    stable: true,
    labyrinth: true
  });

  // Book content data
  const bookLibrary = {
    stable: {
      title: "Stable",
      description: "Guide to Horse Care & Stable Management",
      content: `Welcome to the Stable Guide!

🏠 STABLE OVERVIEW
Your stable is home to up to 5 horses. Each horse has individual care needs that affect their performance and happiness.

🐎 HORSE CARE STATS
• Health: Affects performance and injury resistance
• Happiness: Unlocks rare rewards when high (80+)
• Cleanliness: Dirty horses perform poorly
• Energy: Low energy horses rest more frequently

🌾 CARE RESOURCES
• Feed: Keeps horses healthy and energetic
• Water: Maintains health and happiness
• Pasture: Increases happiness and energy
• Cleanliness: Keeps the stable environment clean

COIN CARE ACTIONS
• Global Care: Affects all horses (Feed, Water, Pasture, Clean)
• Individual Care: Target specific horses (Groom, Apple, Carrot, Heal)

⏰ DAY/NIGHT CYCLE
• Time passes automatically in the stable
• Daily income: 10 coins per day
• Care stats decay slowly over time

🎵 MUSIC SYSTEM
• Play records to boost horse happiness
• Happy horses perform better in races and adventures

💎 HAPPINESS REWARDS
• Very happy horses (80+ happiness) may find:
  - Coins (3-7 coins, 70% chance)
  - Keys for the labyrinth (30% chance)
• Rewards are rare (1% chance per hour per horse)`
    },
    labyrinth: {
      title: "Labyrinth",
      description: "Maze Navigation & Treasure Hunting Guide",
      content: `Welcome to the Labyrinth Guide!

🌟 LABYRINTH OVERVIEW
The labyrinth is a dangerous maze filled with treasures, vaults, and the fearsome Minotaur. Send your best horses on adventures to collect valuable rewards!

🗝️ KEYS & VAULTS
• Keys: Found scattered throughout the maze
• Vaults: Locked containers requiring keys to open
• Vault rewards: Rare treasures worth significant coins
• Keys are consumed when opening vaults

👹 THE MINOTAUR
• Dangerous creature roaming the maze
• Getting caught results in injury and lost items
• Injured horses cannot adventure until healed

🏃‍♂️ MOVEMENT & EXPLORATION
• Horses move themselves in the maze

COIN TREASURES & REWARDS
• Regular treasures: Scattered throughout the maze
• Vault treasures: Higher value, require keys
• Lost horses: Rare finds that unlock new horses
• Dragon eggs: Legendary items with massive value

🎒 INVENTORY MANAGEMENT
• Limited inventory slots (4 + saddlebags skill)
• Choose items wisely when inventory is full
• Items can be discarded or kept when returning
• Keys in horse inventory can be used in labyrinth

⚡ SKILLS & UPGRADES
• Saddlebags: Increases inventory slots
• Speed: Faster movement in the maze
• Stamina: More energy for exploration
• Luck: Better chance of finding rare items

🏥 INJURY SYSTEM
• Minotaur encounters cause injury
• Injured horses cannot enter labyrinth
• Heal injured horses in stable before next adventure
• Health affects injury resistance`
    }
  };

  // Care action costs
  const careCosts = {
    feed: 10,
    water: 8,
    pasture: 15,
    cleanliness: 12
  };

  // Individual horse care action costs
  const individualCareCosts = {
    groom: 5,
    apple: 3,
    carrot: 2,
    heal: 15 // Medical care for injured horses
  };

  // Get resource status color based on level
  const getResourceColor = (level) => {
    if (level >= 70) return '#22c55e'; // Green
    if (level >= 40) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  // Get resource status text
  const getResourceStatus = (level) => {
    if (level >= 70) return 'GOOD';
    if (level >= 40) return 'NEEDS ATTENTION';
    return 'URGENT';
  };

  // Get horse mood indicator based on care stats
  const getHorseMoodIndicator = (horse) => {
    const avgCare = (horse.happiness + horse.health + horse.cleanliness + horse.energy) / 4;
    if (avgCare >= 80) return '😊'; // Happy
    if (avgCare >= 60) return '😐'; // Neutral
    if (avgCare >= 40) return '😟'; // Concerned
    return '😢'; // Sad
  };

  // Get horse health visual effects
  const getHorseHealthEffects = (horse) => {
    const effects = {
      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
      opacity: 1
    };
    
    // Injured horses have special visual effects
    if (horse.isInjured) {
      effects.opacity = 0.6; // Injured horses look very faded
      effects.filter += " sepia(0.5) saturate(0.7)"; // More sepia and desaturated
    }
    // Health affects overall appearance
    else if (horse.health < 30) {
      effects.opacity = 0.7; // Sick horses look faded
      effects.filter += " sepia(0.3)"; // Slight sepia for sickness
    }
    
    // Cleanliness affects visual state
    if (horse.cleanliness < 40) {
      effects.filter += " brightness(0.8) contrast(0.9)"; // Dirty/muddy look
    }
    
    // Energy affects posture (handled in animation)
    return effects;
  };

  // Get horse status indicators (for floating icons)
  const getHorseStatusIndicators = (horse) => {
    const indicators = [];
    
    if (horse.isInjured) indicators.push('plaster');        // Using plaster for injured
    if (horse.health < 40) indicators.push('sick');         // Using sick emoji
    if (horse.cleanliness < 30) indicators.push('sponge');  // Using sponge for dirty
    if (horse.energy < 25) indicators.push('sleep');        // Using sleep zzz for tired
    if (horse.happiness < 30) indicators.push('sad');       // Using sad for unhappy
    
    return indicators;
  };


  // Remove all the complex logic for now

  // Handle care actions
  const handleCareAction = (resourceType) => {
    const cost = careCosts[resourceType];
    if (coins < cost) {
      // Show insufficient funds feedback
      setCareActionFeedback({ type: 'error', message: 'NOT ENOUGH COINS!' });
      setTimeout(() => setCareActionFeedback(null), 2000);
      return;
    }
    
    // Update coins if callback provided
    if (onUpdateCoins) {
      onUpdateCoins(coins - cost);
    }
    
    // Update resource
    setStableResources(prev => ({
      ...prev,
      [resourceType]: Math.min(100, prev[resourceType] + 25)
    }));
    
    // Also improve all horses' stats based on the resource type
    setStableHorses(prevHorses => 
      prevHorses.map(horse => {
        let updates = {};
        switch (resourceType) {
          case 'feed':
            updates.health = Math.min(100, horse.health + 5);
            updates.energy = Math.min(100, horse.energy + 8);
            break;
          case 'water':
            updates.health = Math.min(100, horse.health + 6);
            updates.happiness = Math.min(100, horse.happiness + 4);
            break;
          case 'pasture':
            updates.happiness = Math.min(100, horse.happiness + 8);
            updates.energy = Math.min(100, horse.energy + 6);
            break;
          case 'cleanliness':
            updates.cleanliness = Math.min(100, horse.cleanliness + 10);
            updates.health = Math.min(100, horse.health + 3);
            break;
        }
        return { ...horse, ...updates };
      })
    );
    
    // Show success feedback
    const actionNames = {
      feed: 'FED HORSES',
      water: 'REFILLED WATER',
      pasture: 'MAINTAINED PASTURE',
      cleanliness: 'CLEANED STABLE'
    };
    
    setCareActionFeedback({ type: 'success', message: actionNames[resourceType] });
    setTimeout(() => setCareActionFeedback(null), 2000);
  };

  // Handle individual horse care actions
  const handleIndividualCareAction = (horseId, actionType) => {
    const cost = individualCareCosts[actionType];
    if (coins < cost) {
      setCareActionFeedback({ type: 'error', message: 'NOT ENOUGH COINS!' });
      setTimeout(() => setCareActionFeedback(null), 2000);
      return;
    }

    // Update coins if callback provided
    if (onUpdateCoins) {
      onUpdateCoins(coins - cost);
    }

    // Find the horse to get its name for the feedback message
    const targetHorse = stableHorses.find(horse => horse.id === horseId);
    const horseName = targetHorse ? targetHorse.name.toUpperCase() : 'HORSE';

    // Show success feedback with horse name
    let feedbackMessage = '';
    switch (actionType) {
      case 'groom':
        feedbackMessage = `GROOMED ${horseName}`;
        break;
      case 'apple':
        feedbackMessage = `FED ${horseName} AN APPLE`;
        break;
      case 'carrot':
        feedbackMessage = `FED ${horseName} A CARROT`;
        break;
      case 'heal':
        feedbackMessage = `HEALED ${horseName}`;
        break;
    }
    setCareActionFeedback({ type: 'success', message: feedbackMessage });
    setTimeout(() => setCareActionFeedback(null), 2000);

    // Track progress for special unlocks
    if (onSpecialProgressUpdate) {
      onSpecialProgressUpdate('care_action');
    }

    // SIMPLEST POSSIBLE APPROACH - Just update the horse directly
    setStableHorses(prevHorses => {
      const updatedHorses = prevHorses.map(horse => {
        if (horse.id !== horseId) {
          return horse; // Return exact same reference for unchanged horses
        }

        // Only update the target horse
        const now = Date.now();
        let updates = {};

        switch (actionType) {
          case 'groom':
            updates.cleanliness = Math.min(100, horse.cleanliness + 20);
            updates.happiness = Math.min(100, horse.happiness + 10);
            updates.isBeingGroomed = true;
            updates.careAnimationEnd = now + 3000;
            break;
          case 'apple':
            updates.health = Math.min(100, horse.health + 15);
            updates.happiness = Math.min(100, horse.happiness + 15);
            updates.energy = Math.min(100, horse.energy + 10);
            updates.isEatingApple = true;
            updates.careAnimationEnd = now + 3000;
            break;
          case 'carrot':
            updates.health = Math.min(100, horse.health + 10);
            updates.happiness = Math.min(100, horse.happiness + 8);
            updates.energy = Math.min(100, horse.energy + 12);
            updates.isEatingCarrot = true;
            updates.careAnimationEnd = now + 3000;
            break;
          case 'heal':
            updates.health = Math.min(100, horse.health + 30); // Major health boost
            updates.happiness = Math.min(100, horse.happiness + 20); // Feel better
            updates.energy = Math.min(100, horse.energy + 15); // More energetic
            updates.isInjured = false; // Heal the injury!
            updates.isBeingHealed = true;
            updates.careAnimationEnd = now + 4000; // Longer healing animation
            break;
          default:
            return horse;
        }

        return { ...horse, ...updates };
      });
      
      // Save the updated care stats after individual care actions
      saveHorseCareStats(updatedHorses);
      return updatedHorses;
    });
  };

  // Handle song unlock process
  const handleSongUnlock = () => {
    if (!unlockedSongData || !onUnlockSong) return;
    
    // Unlock the song
    onUnlockSong(unlockedSongData.songName);
    
    // Remove record from horse inventory
    if (onRemoveItemFromHorseInventory) {
      onRemoveItemFromHorseInventory(unlockedSongData.horseId, unlockedSongData.recordName);
      console.log('🎵 Song unlocked:', unlockedSongData.songName);
      console.log('🗑️ Record removed from inventory:', unlockedSongData.recordName);
    }
    
    // Close the modal
    setShowSongUnlockModal(false);
    setUnlockedSongData(null);
  };

  // Calculate distance between two touch points
  const getTouchDistance = (touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const deltaX = touch2.clientX - touch1.clientX;
    const deltaY = touch2.clientY - touch1.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  };

  // Calculate viewport bounds for panning - constrain to stable edges only
  const getViewportBounds = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 80; // Account for header height
    
    // Calculate how much the stable extends beyond the viewport at current zoom
    const scaledStableWidth = STABLE_WIDTH * zoom;
    const scaledStableHeight = STABLE_HEIGHT * zoom;
    
    // Maximum pan distance = (scaled stable size - viewport size) / 2
    // This ensures we never pan beyond the stable boundaries
    const maxPanX = Math.max(0, (scaledStableWidth - viewportWidth) / 2);
    const maxPanY = Math.max(0, (scaledStableHeight - viewportHeight) / 2);
    
    return { maxPanX, maxPanY };
  };

  // Pan/drag handlers with delay for horse clicks
  const handlePanStart = (event) => {
    const target = event.target;
    const isHorseElement = target.closest('[data-horse-clickable]') !== null;
    
    if (isHorseElement) {
      // Don't interfere with horse clicks
      return;
    }

    // Handle multi-touch for pinch zoom
    if (event.touches && event.touches.length === 2) {
      const distance = getTouchDistance(event.touches);
      setInitialDistance(distance);
      setInitialZoom(zoom);
      setIsPinching(true);
      setPotentialDrag(false);
      setIsDragging(false);
      return;
    }
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const startTime = Date.now();
    
    // Reset pinch state for single touch
    setIsPinching(false);
    
    // Start potential drag - but don't actually drag yet
    setPotentialDrag(true);
    setDragStart({ x: clientX, y: clientY });
    setDragStartTime(startTime);
    setLastPanOffset(panOffset);
    setVelocity({ x: 0, y: 0 });
    setLastMoveTime(startTime);
    
    // If user holds for 150ms without moving much, start dragging
    setTimeout(() => {
      if (potentialDrag && dragStartTime === startTime) {
        setIsDragging(true);
        setPotentialDrag(false);
      }
    }, 150);
  };

  const handlePanMove = (event) => {
    // Handle pinch zoom for multi-touch
    if (isPinching && event.touches && event.touches.length === 2) {
      event.preventDefault();
      const currentDistance = getTouchDistance(event.touches);
      const scale = currentDistance / initialDistance;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, initialZoom * scale));
      setZoom(newZoom);
      return;
    }

    if (!isDragging && !potentialDrag) return;
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    // If we're in potential drag mode, check if user moved significantly
    if (potentialDrag && !isDragging) {
      const deltaX = Math.abs(clientX - dragStart.x);
      const deltaY = Math.abs(clientY - dragStart.y);
      
      // If moved more than 5 pixels, start dragging immediately
      if (deltaX > 5 || deltaY > 5) {
        setIsDragging(true);
        setPotentialDrag(false);
      } else {
        return; // Still in potential drag, don't move yet
      }
    }
    
    if (!isDragging) return;
    
    event.preventDefault();
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    const newPanX = lastPanOffset.x + deltaX;
    const newPanY = lastPanOffset.y + deltaY;
    
    // Calculate velocity for momentum with dampening
    const currentTime = Date.now();
    const timeDelta = currentTime - lastMoveTime;
    if (timeDelta > 0 && timeDelta < 100) { // Only calculate for reasonable time deltas
      const velX = (deltaX / timeDelta) * 0.1; // Scale down velocity significantly
      const velY = (deltaY / timeDelta) * 0.1;
      setVelocity({ x: velX, y: velY });
    }
    setLastMoveTime(currentTime);
    
    // Apply bounds
    const { maxPanX, maxPanY } = getViewportBounds();
    const boundedPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
    const boundedPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));
    
    setPanOffset({ x: boundedPanX, y: boundedPanY });
  };

  const handlePanEnd = () => {
    setIsDragging(false);
    setPotentialDrag(false);
    setIsPinching(false);
    
    // Apply momentum when drag ends with much lower threshold
    if (Math.abs(velocity.x) > 0.05 || Math.abs(velocity.y) > 0.05) {
      applyMomentum();
    }
  };

  // Handle wheel zoom for desktop
  const handleWheel = (event) => {
    event.preventDefault();
    const delta = event.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1; // Zoom out or in
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * zoomFactor));
    setZoom(newZoom);
  };

  const applyMomentum = () => {
    const friction = 0.85; // Higher friction for faster stopping
    const minVelocity = 0.005; // Lower minimum for more control
    const velocityScale = 0.3; // Scale down velocity significantly
    
    const animate = () => {
      setVelocity(currentVel => {
        const newVelX = currentVel.x * friction;
        const newVelY = currentVel.y * friction;
        
        // Stop if velocity is too small
        if (Math.abs(newVelX) < minVelocity && Math.abs(newVelY) < minVelocity) {
          return { x: 0, y: 0 };
        }
        
        // Apply momentum to pan offset with much gentler scaling
        setPanOffset(currentPan => {
          const { maxPanX, maxPanY } = getViewportBounds();
          const newPanX = Math.max(-maxPanX, Math.min(maxPanX, currentPan.x + newVelX * velocityScale * 16));
          const newPanY = Math.max(-maxPanY, Math.min(maxPanY, currentPan.y + newVelY * velocityScale * 16));
          return { x: newPanX, y: newPanY };
        });
        
        // Continue animation
        requestAnimationFrame(animate);
        return { x: newVelX, y: newVelY };
      });
    };
    
    requestAnimationFrame(animate);
  };

  const createHorseData = (horse) => {
    const inventory = horseInventories?.[horse.id] || horse.inventory || [];
    const skills = horseSkills?.[horse.id] || horse.skills || {};
    const skillPoints = horseSkillPoints?.[horse.id] || horse.skillPoints || 0;
    const customName = customHorseNames?.[horse.id] || horse.name;
    const savedCareStats = horseCareStats?.[horse.id];
    
    console.log(`🏠 Stable - createHorseData for horse ${horse.id} (${customName}):`);
    console.log('  - savedCareStats:', savedCareStats);
    
    return {
      ...horse,
      name: customName, // Use custom name if available
      skills, // Include horse skills
      skillPoints, // Include skill points
      x: Math.random() * 80 + 10, // 10-90% of stable width
      y: Math.random() * 70 + 15, // 15-85% of stable height  
      targetX: Math.random() * 80 + 10,
      targetY: Math.random() * 70 + 15,
      speed: 0.3 + Math.random() * 0.4,
      direction: Math.random() * 360,
      restTime: 0,
      isResting: false,
      lastMoveTime: Date.now(),
      inventory, // Use global inventory or fallback
      // Individual care stats - use saved values or defaults
      happiness: savedCareStats?.happiness ?? (80 + Math.random() * 20), // 80-100
      health: savedCareStats?.health ?? (75 + Math.random() * 25),    // 75-100
      cleanliness: savedCareStats?.cleanliness ?? (70 + Math.random() * 30), // 70-100
      energy: savedCareStats?.energy ?? (85 + Math.random() * 15),    // 85-100
      lastCareUpdate: savedCareStats?.lastCareUpdate ?? Date.now(),
      // Care animations
      isBeingGroomed: false,
      isEatingApple: false,
      isEatingCarrot: false,
      isEatingGoldenApple: false,
      isEatingEnergyDrink: false,
      isEatingHorsePowerCereal: false,
      isBeingHealed: false,
      careAnimationEnd: 0,
      // Injury status - use saved value or default from horse data
      isInjured: savedCareStats?.isInjured ?? horse.isInjured ?? false,
    };
  };

  const handleRename = (id, newName) => {
    // Update the global custom names
    if (onHorseRename) {
      onHorseRename(id, newName);
    }
    
    // Update local state
    setStableHorses((prev) =>
      prev.map((horse) =>
        horse.id === id ? { ...horse, name: newName } : horse
      )
    );
    setAvailableHorses((prev) =>
      prev.map((horse) =>
        horse.id === id ? { ...horse, name: newName } : horse
      )
    );
  };

  const handleSellItem = (horseId, itemIndex) => {
    // Find the horse from the main horse inventories prop (source of truth)
    const horseInventory = horseInventories[horseId];
    if (!horseInventory || !horseInventory[itemIndex]) return;

    const item = horseInventory[itemIndex];
    
    // Calculate item value based on type
    let itemValue = 5; // Base value
    if (item.name.includes('Golden')) itemValue = 25;
    else if (item.name.includes('Silver')) itemValue = 15;
    else if (item.name.includes('Crystal') || item.name.includes('Gem')) itemValue = 20;
    else if (item.name.includes('Magic')) itemValue = 18;
    else if (item.name === 'Energy Drink') itemValue = 20;
    else if (item.name === 'Horse Power Cereal') itemValue = 22;
    else if (item.name.includes('Ancient') || item.name.includes('Dragon') || item.name.includes('Sacred')) itemValue = 30;
    
    // Update coins
    if (onUpdateCoins) {
      onUpdateCoins(coins + itemValue);
    }

    // Remove item from parent's horse inventory using the proper callback
    if (onRemoveItemFromHorseInventoryByIndex) {
      onRemoveItemFromHorseInventoryByIndex(horseId, itemIndex);
      console.log('🛒 Selling item:', item.name, 'from horse:', horseId, 'for', itemValue, 'coins');
    }
  };

  // Function to find horses with dragon eggs
  const findHorsesWithDragonEggs = () => {
    const horsesWithEggs = [];
    
    // Check all horses and their inventories for dragon eggs
    Object.entries(horseInventories).forEach(([horseId, inventory]) => {
      if (inventory && inventory.length > 0) {
        inventory.forEach((item, itemIndex) => {
          if (item && item.name === 'Dragon Egg') {
            const horse = [...stableHorses, ...availableHorses].find(h => h.id == horseId);
            if (horse) {
              horsesWithEggs.push({
                horse,
                itemIndex,
                item
              });
            }
          }
        });
      }
    });
    
    return horsesWithEggs;
  };

  const handleFeedItem = (horseId, itemIndex, item) => {
    // Only allow feeding Golden Apples, Energy Drinks, and Horse Power Cereal
    if (item.name !== 'Golden Apple' && item.name !== 'Energy Drink' && item.name !== 'Horse Power Cereal') {
      console.log('❌ Can only feed Golden Apples, Energy Drinks, and Horse Power Cereal');
      return;
    }

    // Find the horse and feed the item
    const horseToFeed = stableHorses.find(h => h.id === horseId);
    if (!horseToFeed) {
      console.log('❌ Horse not found in stable');
      return;
    }

    console.log(`🍎 Feeding ${item.name} to ${horseToFeed.name}`);

    // Enhanced care stat recovery
    setStableHorses(prevHorses => {
      const updatedHorses = prevHorses.map(horse => {
        if (horse.id === horseId) {
          let recoveryStats;
          let animationType;
          
          if (item.name === 'Golden Apple') {
            // Golden apple provides balanced recovery
            recoveryStats = {
              health: Math.min(100, horse.health + 30),      // +30 health
              happiness: Math.min(100, horse.happiness + 25), // +25 happiness
              energy: Math.min(100, horse.energy + 20),       // +20 energy
              cleanliness: Math.min(100, horse.cleanliness + 15), // +15 cleanliness
              isInjured: false // Clear injury if present
            };
            animationType = 'isEatingGoldenApple';
          } else if (item.name === 'Energy Drink') {
            // Energy drink focuses on energy restoration
            recoveryStats = {
              health: Math.min(100, horse.health + 10),      // +10 health (less than apple)
              happiness: Math.min(100, horse.happiness + 15), // +15 happiness  
              energy: Math.min(100, horse.energy + 40),       // +40 energy (more than apple)
              cleanliness: horse.cleanliness, // No cleanliness boost
              isInjured: horse.isInjured // No injury healing
            };
            animationType = 'isEatingEnergyDrink';
          } else if (item.name === 'Horse Power Cereal') {
            // Horse Power Cereal focuses on health and happiness
            recoveryStats = {
              health: Math.min(100, horse.health + 35),      // +35 health (more than apple)
              happiness: Math.min(100, horse.happiness + 30), // +30 happiness (more than apple)
              energy: Math.min(100, horse.energy + 15),       // +15 energy (less than apple)
              cleanliness: horse.cleanliness, // No cleanliness boost
              isInjured: horse.isInjured // No injury healing
            };
            animationType = 'isEatingHorsePowerCereal';
          }
          
          return {
            ...horse,
            ...recoveryStats,
            // Add feeding animation
            [animationType]: true,
            careAnimationEnd: Date.now() + 4000 // 4 seconds animation
          };
        }
        return horse;
      });
      
      // Save the updated care stats
      saveHorseCareStats(updatedHorses);
      return updatedHorses;
    });

    // Remove the golden apple from inventory
    if (onRemoveItemFromHorseInventoryByIndex) {
      onRemoveItemFromHorseInventoryByIndex(horseId, itemIndex);
    }

    // Show feedback message
    setCareActionFeedback({
      message: `✨ ${horseToFeed.name} enjoyed the Golden Apple! Care stats significantly boosted!`,
      type: 'success'
    });

    setTimeout(() => setCareActionFeedback(null), 4000);
    
    // Close the modal to show the feeding animation
    setSelectedHorse(null);
  };

  // Function to add egg to nest (remove from horse inventory)
  const handleAddEggToNest = () => {
    const horsesWithEggs = findHorsesWithDragonEggs();
    if (horsesWithEggs.length > 0 && !nestEgg) { // Only allow if no egg is already in nest
      const firstEgg = horsesWithEggs[0];
      
      // Remove the dragon egg from the horse's inventory
      if (onRemoveItemFromHorseInventoryByIndex) {
        onRemoveItemFromHorseInventoryByIndex(firstEgg.horse.id, firstEgg.itemIndex);
        console.log('🥚 Dragon egg added to nest from horse:', firstEgg.horse.name);
        
        // Place egg in nest with 5 day countdown
        if (onUpdateNestEgg) {
          onUpdateNestEgg({
            placedOn: Date.now(),
            daysRemaining: 5
          });
        }
        
        // Close the modal
        setShowDragonNestModal(false);
      }
    }
  };

  const toggleHorseRoaming = (id) => {
    if (selectedGrazingHorses.includes(id)) {
      if (onUpdateSelectedGrazingHorses) {
        onUpdateSelectedGrazingHorses((prev) => prev.filter((hid) => hid !== id));
      }
      setStableHorses((prev) => prev.filter((horse) => horse.id !== id));
    } else {
      // Check if we're at the limit of 5 horses
      if (selectedGrazingHorses.length >= 5) {
        return; // Don't allow more than 5 horses to graze
      }
      if (onUpdateSelectedGrazingHorses) {
        onUpdateSelectedGrazingHorses((prev) => [...prev, id]);
      }
      const horseData = availableHorses.find((h) => h.id === id);
      if (horseData) {
        setStableHorses((prev) => [...prev, createHorseData(horseData)]);
      }
    }
  };


  // Initialize available and roaming horses based on unlocked list - RUN ONLY ONCE
  useEffect(() => {
    console.log('🏠 Stable - useEffect initializing horses');
    console.log('  - horseInventories prop:', horseInventories);
    
    const available = horseAvatars
      .map((avatar, index) => ({ avatar, index }))
      .filter((_, index) => unlockedHorses[index])
      .map(({ avatar, index }) => ({
        id: index,
        avatar,
        name: customHorseNames?.[index] || horseNames[index],
        personality: horsePersonalities[index],
      }));

    setAvailableHorses(available);
    
    // Use saved grazing horses or auto-select first 5 if none saved
    let horsesToGraze;
    if (selectedGrazingHorses && selectedGrazingHorses.length > 0) {
      // Use saved selection, but filter out any horses that are no longer available
      const validSavedHorses = selectedGrazingHorses.filter(id => 
        available.some(horse => horse.id === id)
      );
      horsesToGraze = available.filter(h => validSavedHorses.includes(h.id));
      console.log('🐴 Using saved grazing horses:', validSavedHorses);
    } else {
      // Auto-select first 5 horses if no saved selection
      horsesToGraze = available.slice(0, 5);
      const autoSelectedIds = horsesToGraze.map(h => h.id);
      if (onUpdateSelectedGrazingHorses) {
        onUpdateSelectedGrazingHorses(autoSelectedIds);
      }
      console.log('🐴 Auto-selecting first 5 horses for grazing:', autoSelectedIds);
    }
    
    setStableHorses(horsesToGraze.map((h) => createHorseData(h)));

    setTimeout(() => setStableLoaded(true), 1000);
  }, [selectedGrazingHorses, onUpdateSelectedGrazingHorses]); // Include props for saved grazing horses

  // Update horse names when customHorseNames changes
  useEffect(() => {
    if (!stableLoaded) return;
    
    // Update available horses with new custom names
    setAvailableHorses(prev => 
      prev.map(horse => ({
        ...horse,
        name: customHorseNames?.[horse.id] || horseNames[horse.id]
      }))
    );
    
    // Update stable horses with new custom names
    setStableHorses(prev => 
      prev.map(horse => ({
        ...horse,
        name: customHorseNames?.[horse.id] || horseNames[horse.id]
      }))
    );
  }, [customHorseNames, stableLoaded, horseNames]);

  // Update horse inventories when horseInventories prop changes
  useEffect(() => {
    if (!stableLoaded || !horseInventories) return;
    
    console.log('🏠 Stable - horseInventories updated, refreshing stable horses');
    console.log('  - New horseInventories:', horseInventories);
    
    // Check for records in any horse inventory and trigger unlock modal
    const recordMapping = {
      'Wild Mane Record': 'WILD MANE',
      'Wild and Unbridled Record': 'WILD AND UNBRIDLED', 
      'Clover Record': 'CLOVER',
      'Horse Power Cereal Record': 'HORSE POWER CEREAL',
      'Horse Bros Record': 'HORSE BROS',
      'Partners in Hoof Record': 'PARTNERS IN HOOF'
    };
    
    // Check all horses for records
    Object.entries(horseInventories).forEach(([horseId, inventory]) => {
      if (inventory && Array.isArray(inventory)) {
        inventory.forEach(item => {
          const songName = recordMapping[item.name];
          if (songName && !unlockedSongs[songName] && onUnlockSong) {
            console.log('🎵 Stable - Found record to unlock:', item.name, 'for song:', songName);
            
            // Set up unlock modal data
            setUnlockedSongData({
              recordName: item.name,
              songName: songName,
              horseId: parseInt(horseId),
              horseName: customHorseNames?.[horseId] || horseNames[horseId]
            });
            setShowSongUnlockModal(true);
          }
        });
      }
    });
    
    setStableHorses(prevHorses => 
      prevHorses.map(horse => ({
        ...horse,
        inventory: horseInventories[horse.id] || horse.inventory || []
      }))
    );
  }, [horseInventories, stableLoaded, unlockedSongs, onUnlockSong, customHorseNames, horseNames]);

  // Save horse care stats to parent whenever they change
  const saveHorseCareStats = (horses) => {
    if (onUpdateHorseCareStats && horses.length > 0) {
      const careStatsToSave = {};
      horses.forEach(horse => {
        careStatsToSave[horse.id] = {
          happiness: horse.happiness,
          health: horse.health,
          cleanliness: horse.cleanliness,
          energy: horse.energy,
          isInjured: horse.isInjured,
          lastCareUpdate: horse.lastCareUpdate
        };
      });
      onUpdateHorseCareStats(prev => ({ ...prev, ...careStatsToSave }));
    }
  };

  // Happiness reward check function
  const checkHappinessRewards = (horses) => {
    const now = Date.now();
    
    horses.forEach(horse => {
      // Only check happy horses (happiness >= 80)
      if (horse.happiness < 80) return;
      
      // Only check once per hour per horse to prevent spam
      const lastCheck = lastHappinessCheck[horse.id] || 0;
      if (now - lastCheck < 3600000) return; // 1 hour cooldown
      
      // Very rare chance - only 1% per check
      if (Math.random() < 0.01) {
        const rewardType = Math.random() < 0.3 ? 'key' : 'coins'; // 30% chance for key, 70% for coins
        const reward = {
          type: rewardType,
          horseName: horse.name,
          horseId: horse.id
        };
        
        if (rewardType === 'coins') {
          const coinAmount = 3 + Math.floor(Math.random() * 5); // 3-7 coins
          reward.amount = coinAmount;
          
          // Give coins immediately
          if (onUpdateCoins) {
            onUpdateCoins(coins + coinAmount);
          }
        } else {
          // Try to add key to horse inventory
          const currentInventory = horseInventories[horse.id] || [];
          const maxSlots = 4 + (horseSkills[horse.id]?.saddlebags || 0);
          
          if (currentInventory.length < maxSlots) {
            // Add key to inventory
            const keyItem = { id: 'key', name: 'Key', description: 'Opens locked doors and vaults', image: '/maze/key.png', category: 'tool', stackable: false, quantity: 1 };
            
            if (onAddItemToHorseInventory) {
              onAddItemToHorseInventory(horse.id, keyItem);
            }
          } else {
            // No space - convert to coins instead
            reward.type = 'coins';
            reward.amount = 5;
            if (onUpdateCoins) {
              onUpdateCoins(coins + 5);
            }
            reward.noSpace = true;
          }
        }
        
        // Show reward modal
        setHappinessRewardModal(reward);
        
        // Update last check time
        setLastHappinessCheck(prev => ({
          ...prev,
          [horse.id]: now
        }));
      }
    });
  };

  // Care stats decay system
  useEffect(() => {
    if (!stableLoaded || stableHorses.length === 0) return;
    
    const decayInterval = setInterval(() => {
      setStableHorses(prevHorses => {
        const updatedHorses = prevHorses.map(horse => {
          // Small gradual decay over time
          const decayAmount = 1 + Math.random() * 2; // 1-3 points decay
          
          // Music happiness boost - small bonus for healthy horses
          let musicBonus = 0;
          if (isPlaying && !horse.isInjured && !horse.isResting) {
            musicBonus = 0.3 + Math.random() * 0.4; // 0.3-0.7 happiness boost from music
          }
          
          return {
            ...horse,
            happiness: Math.max(10, Math.min(100, horse.happiness - decayAmount * 0.8 + musicBonus)),
            health: Math.max(10, horse.health - decayAmount * 0.6),
            cleanliness: Math.max(10, horse.cleanliness - decayAmount * 1.2), // Gets dirty fastest
            energy: Math.max(10, horse.energy - decayAmount * 1.0),
            lastCareUpdate: Date.now()
          };
        });

        // Check for happiness rewards
        checkHappinessRewards(updatedHorses);
        
        // Save the updated care stats
        saveHorseCareStats(updatedHorses);
        return updatedHorses;
      });
      
      // Also decay stable resources slightly
      setStableResources(prev => ({
        feed: Math.max(0, prev.feed - 0.5 - Math.random() * 1),
        water: Math.max(0, prev.water - 0.3 - Math.random() * 0.7),
        pasture: Math.max(0, prev.pasture - 0.2 - Math.random() * 0.5),
        cleanliness: Math.max(0, prev.cleanliness - 0.4 - Math.random() * 0.8)
      }));
      
    }, 60000); // Every 60 seconds
    
    return () => clearInterval(decayInterval);
  }, [stableLoaded, stableHorses.length]);

  // Day/Night cycle and daily income system
  useEffect(() => {
    if (!stableLoaded) return;
    
    const timeInterval = setInterval(() => {
      setGameTime(prevTime => {
        const newTime = (prevTime + 0.08) % 24; // 1 game day = 5 minutes (0.08 hours every second)
        
        // Save the time to persistence
        if (onUpdateStableGameTime) {
          onUpdateStableGameTime(newTime);
        }
        
        // Check if we've crossed into a new day (from 23.5+ back to 0-0.5)
        if (prevTime > 23 && newTime < 1) {
          const newDay = dayCount + 1;
          if (onUpdateDayCount) {
            onUpdateDayCount(newDay);
          }
          
          // Give daily income
          if (onUpdateCoins) {
            onUpdateCoins(coins + 10);
          }
          
          // Handle dragon egg countdown
          if (nestEgg && nestEgg.daysRemaining > 0) {
            const newDaysRemaining = nestEgg.daysRemaining - 1;
            if (newDaysRemaining <= 0) {
              // Egg has hatched!
              if (onUpdateNestEgg) {
                onUpdateNestEgg(null);
              }
              
              // Track progress for dragon horse unlocks
              if (onSpecialProgressUpdate) {
                onSpecialProgressUpdate('dragon_hatch');
              }
              
              setShowHatchingModal(true);
              setNewDayNotification(`Day ${newDay} - Dragon egg has hatched! 🐉`);
            } else {
              // Update countdown
              if (onUpdateNestEgg) {
                onUpdateNestEgg({ ...nestEgg, daysRemaining: newDaysRemaining });
              }
              setNewDayNotification(`Day ${newDay} - Earned 10 coins! | Egg hatches in ${newDaysRemaining} days`);
            }
          } else {
            // Show normal new day notification
            setNewDayNotification(`Day ${newDay} - Earned 10 coins!`);
          }
          
          // Remove auto-dismiss - now requires user to click continue
        }
        
        return newTime;
      });
    }, 1000); // Update every second
    
    return () => clearInterval(timeInterval);
  }, [stableLoaded, dayCount, coins, onUpdateCoins, onUpdateDayCount, onUpdateStableGameTime, nestEgg]);

  // Simple status cycling effect
  useEffect(() => {
    if (!stableLoaded) return;
    
    const interval = setInterval(() => {
      setCyclingIndex(prev => {
        const next = { ...prev };
        stableHorses.forEach(horse => {
          const indicators = getHorseStatusIndicators(horse);
          if (indicators.length > 1) {
            const currentIndex = next[horse.id] || 0;
            next[horse.id] = (currentIndex + 1) % indicators.length;
          }
        });
        return next;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [stableLoaded, stableHorses]);

  // Helper functions for day/night cycle
  const getTimeOfDayPhase = () => {
    if (gameTime >= 6 && gameTime < 12) return 'morning';
    if (gameTime >= 12 && gameTime < 18) return 'afternoon';
    if (gameTime >= 18 && gameTime < 22) return 'evening';
    return 'night';
  };

  const getStableBackgroundStyle = () => {
    const phase = getTimeOfDayPhase();
    const baseFilter = 'saturate(1.1) contrast(1.05)';
    
    switch (phase) {
      case 'morning':
        return {
          filter: `${baseFilter} brightness(1.1) sepia(0.1) hue-rotate(10deg)`,
          backgroundColor: 'rgba(255, 248, 220, 0.3)' // Light morning tint
        };
      case 'afternoon':
        return {
          filter: `${baseFilter} brightness(1.2)`,
          backgroundColor: 'rgba(255, 255, 255, 0.1)' // Bright day
        };
      case 'evening':
        return {
          filter: `${baseFilter} brightness(0.9) sepia(0.2) hue-rotate(30deg)`,
          backgroundColor: 'rgba(255, 140, 0, 0.2)' // Golden hour
        };
      case 'night':
        return {
          filter: `${baseFilter} brightness(0.6) contrast(1.2) saturate(0.8)`,
          backgroundColor: 'rgba(25, 25, 112, 0.4)' // Night blue tint
        };
      default:
        return { filter: baseFilter };
    }
  };

  // Remove all complex logic

  // Animation loop for horse movement
  useEffect(() => {
    if (!stableLoaded) return;

    const animationInterval = setInterval(() => {
      setStableHorses((prevHorses) =>
        prevHorses.map((horse) => {
          const now = Date.now();
          const deltaTime = (now - horse.lastMoveTime) / 1000;

          // Clear care animations if expired
          let careAnimationUpdates = {};
          if (horse.careAnimationEnd && now > horse.careAnimationEnd) {
            careAnimationUpdates = {
              isBeingGroomed: false,
              isEatingApple: false,
              isEatingCarrot: false,
              isEatingGoldenApple: false,
              isEatingEnergyDrink: false,
              isEatingHorsePowerCereal: false,
              isBeingHealed: false,
              careAnimationEnd: 0
            };
          }

          // Calculate behavior modifiers based on care stats
          const energyModifier = horse.energy / 100; // 0-1 multiplier
          const healthModifier = horse.health / 100; // 0-1 multiplier
          const happinessModifier = horse.happiness / 100; // 0-1 multiplier
          
          // Tired/sick horses rest more frequently and for longer
          const restChance = horse.energy < 30 ? 0.7 : horse.energy < 60 ? 0.4 : 0.3;
          const restDuration = horse.energy < 30 ? (6 + Math.random() * 6) : (2 + Math.random() * 4);
          
          // If horse is resting, decrease rest time (affected by energy)
          if (horse.isResting) {
            const newRestTime = horse.restTime - (deltaTime * energyModifier);
            if (newRestTime <= 0) {
              return {
                ...horse,
                ...careAnimationUpdates,
                isResting: false,
                restTime: 0,
                targetX: Math.random() * 80 + 10,
                targetY: Math.random() * 70 + 15,
                lastMoveTime: now,
              };
            }
            return { ...horse, ...careAnimationUpdates, restTime: newRestTime, lastMoveTime: now };
          }

          // Calculate distance to target
          const dx = horse.targetX - horse.x;
          const dy = horse.targetY - horse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If close to target, start resting or pick new target
          if (distance < 2) {
            if (Math.random() < restChance) {
              return {
                ...horse,
                ...careAnimationUpdates,
                isResting: true,
                restTime: restDuration,
                lastMoveTime: now,
              };
            } else {
              // Unhappy horses move less, happy horses explore more
              const movementRange = happinessModifier * 70 + 10; // 10-80 based on happiness
              return {
                ...horse,
                ...careAnimationUpdates,
                targetX: Math.random() * movementRange + (90 - movementRange) / 2,
                targetY: Math.random() * (movementRange * 0.8) + 15,
                lastMoveTime: now,
              };
            }
          }

          // Speed affected by energy and health
          const effectiveSpeed = horse.speed * energyModifier * healthModifier;
          const moveX = (dx / distance) * effectiveSpeed * deltaTime * 10;
          const moveY = (dy / distance) * effectiveSpeed * deltaTime * 10;

          return {
            ...horse,
            ...careAnimationUpdates,
            x: Math.max(5, Math.min(95, horse.x + moveX)),
            y: Math.max(10, Math.min(90, horse.y + moveY)),
            direction: Math.atan2(dy, dx) * (180 / Math.PI),
            lastMoveTime: now,
          };
        })
      );
    }, 100);

    return () => clearInterval(animationInterval);
  }, [stableLoaded]);

  if (!stableLoaded) {
    const stableStyles = themeUtils.getScreenStyles(currentTheme, 'stable');
    
    return (
      <div className={`min-h-screen bg-gradient-to-br ${stableStyles.background} flex flex-col justify-center items-center p-4`}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4 flex justify-center"
          >
            <img 
              src={horseAvatars[Math.floor(Math.random() * horseAvatars.length)]}
              alt="Loading Horse"
              className="w-24 h-24 object-contain rounded-lg shadow-lg"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            />
          </motion.div>
          <p className="text-2xl font-bold text-amber-800 mb-2">
            Preparing the stable...
          </p>
          <div className="w-48 h-2 bg-amber-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  const stableStyles = themeUtils.getScreenStyles(currentTheme, 'stable');
  const labyrinthStyles = themeUtils.getScreenStyles(currentTheme, 'labyrinth');
  
  return (
    <div 
      className={`bg-gradient-to-br ${stableStyles.background}`}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: '1000'
      }}
    >

      {/* Stable Header */}
      <div 
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          backgroundColor: stableStyles.header,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: window.innerWidth < 640 ? '8px' : '16px',
          zIndex: '20'
        }}
      >
        {/* Header with Title and Back Button */}
        <div className="flex items-center justify-between mb-3">
          <h1 className={`screen-header ${currentTheme === 'saturday' ? 'saturday-title' : ''}`} style={{ color: labyrinthStyles.reward }}>
            Horse Stable
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
                  fontSize: window.innerWidth < 640 ? '7px' : '10px',
                  backgroundColor: '#fef3c7',
                  padding: window.innerWidth < 640 ? '2px 3px' : '2px 6px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1px',
                  color: '#000'
                }}
              >
                <img src="/horsecoins.png" alt="coins" className="w-4 h-4" />
                <span>{coins}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={themeUtils.getComponentStyles(currentTheme, 'button', 'warning')}
                style={{
                  padding: window.innerWidth < 640 ? '4px 16px' : '8px 20px',
                  fontSize: window.innerWidth < 640 ? '7px' : '10px',
                  flex: 'none',
                  minWidth: window.innerWidth < 640 ? '0' : 'auto',
                  letterSpacing: window.innerWidth < 640 ? '0.5px' : '1px'
                }}
              >
                Back
              </motion.button>
            </div>
        </div>
      </div>


      {/* Floating particles (hay dust) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-40"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Stable Area */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${zoom})`,
          width: `${STABLE_WIDTH}px`,
          height: `${STABLE_HEIGHT}px`,
          maxWidth: 'none',
          maxHeight: 'none',
          minWidth: `${STABLE_WIDTH}px`,
          minHeight: `${STABLE_HEIGHT}px`,
          cursor: isDragging ? 'grabbing' : isPinching ? 'zoom-in' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
          transformOrigin: 'center center'
        }}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onWheel={handleWheel}
        onTouchStart={handlePanStart}
        onTouchMove={handlePanMove}
        onTouchEnd={handlePanEnd}
      >
        <div 
          style={{
            position: 'relative',
            width: `${STABLE_WIDTH}px`,
            height: `${STABLE_HEIGHT}px`,
            backgroundImage: 'url(/stable/newbackgroundpasture.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden',
            transformOrigin: 'center center',
            transform: 'scale(1)',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
            borderLeft: '4px solid #8B4513',
            borderRight: '4px solid #8B4513',
            ...getStableBackgroundStyle()
          }}
          onClick={(e) => {
            console.log('🏠 Stable - Background clicked!', e.target);
          }}
        >
          
          {/* Fence along top and bottom */}
          {/* Top fence */}
          <div style={{
            position: 'absolute',
            top: '-18px',
            left: '0px',
            width: '100%',
            height: '64px',
            backgroundImage: 'url(/stable/fence.png)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 64px',
            zIndex: '5'
          }}></div>
          
     
          {/* Decorative Assets - Distributed across larger stable */}
          {/* Dragon Horse Egg Nest - Top left corner */}
          <motion.div 
            style={{
              position: 'absolute',
              top: '1325px',
              left: '1025px',
              width: '120px',
              height: '120px',
              backgroundImage: `url(/stable/${nestEgg ? 'fullnest' : 'dragoneggnest'}.png)`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              zIndex: '12',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDragonNestModal(true)}
          />

          {/* Stables Decorative Asset - Horse Stable with roaming modal */}
          <motion.div
            style={{
              position: 'absolute',
              top: '625px',
              left: '-25px',
              width: '450px',
              height: '400px',
              zIndex: '10',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSelector(true)}
            title="Click to manage horses"
          >
            <img 
              src="/stable/stables.png" 
              alt="Stables" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>
          
          {/* Farm Building - Top left area */}
          <motion.div 
            style={{
              position: 'absolute',
              top: '175px',
              left: '1200px',
              width: '350px',
              height: '320  px',
              zIndex: '10',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              if (!isDragging) {
                e.stopPropagation();
                setShowStableStatsModal(true);
              }
            }}
            title="View Stable Resources"
          >
            <img 
              src="/stable/house.png" 
              alt="Stable House" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))',
                transition: 'filter 0.2s ease',
                transform: 'scaleX(-1)'
              }}
            />
          </motion.div>
          
          {/* Truck - Bottom right */}
          <div 
            style={{
              position: 'absolute',
              bottom: '1400px',
              right: '300px',
              width: '320px',
              height: '192px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/truck.png" 
              alt="Truck" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))'
              }}
            />
          </div>
          
          
          
          {/* Turntable - Center left */}
          <div 
            style={{
              position: 'absolute',
              top: '750px',
              left: '1450px',
              width: '64px',
              height: '64px',
              zIndex: '10',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              if (!isDragging) {
                e.stopPropagation();
                setShowMusicLibrary(true);
              }
            }}
          >
            <motion.img 
              src="/stable/turntable.png" 
              alt="Turntable" 
              animate={isPlaying ? {
                scale: [1, 1.05, 1, 1.03, 1],
                rotate: [0, 2, -2, 1, 0]
              } : {}}
              transition={{
                duration: isPlaying ? 2 : 0,
                repeat: isPlaying ? Infinity : 0,
                ease: "easeInOut"
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))'
              }}
            />
            
            {/* Musical notes around turntable when playing */}
            {isPlaying && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-3xl"
                    style={{
                      color: '#3B82F6',
                      textShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
                      zIndex: 25
                    }}
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0,
                      opacity: 0
                    }}
                    animate={{
                      x: [
                        `${50 + 60 * Math.cos(i * Math.PI / 2)}%`,
                        `${50 + 60 * Math.cos(i * Math.PI / 2 + Math.PI / 2)}%`,
                        `${50 + 60 * Math.cos(i * Math.PI / 2 + Math.PI)}%`,
                        `${50 + 60 * Math.cos(i * Math.PI / 2 + 3 * Math.PI / 2)}%`,
                        `${50 + 60 * Math.cos(i * Math.PI / 2 + 2 * Math.PI)}%`
                      ],
                      y: [
                        `${50 + 60 * Math.sin(i * Math.PI / 2)}%`,
                        `${50 + 60 * Math.sin(i * Math.PI / 2 + Math.PI / 2)}%`,
                        `${50 + 60 * Math.sin(i * Math.PI / 2 + Math.PI)}%`,
                        `${50 + 60 * Math.sin(i * Math.PI / 2 + 3 * Math.PI / 2)}%`,
                        `${50 + 60 * Math.sin(i * Math.PI / 2 + 2 * Math.PI)}%`
                      ],
                      scale: [0, 1, 0.8, 1, 0],
                      opacity: [0, 1, 0.7, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeInOut"
                    }}
                  >
                    {i % 2 === 0 ? '♪' : '♫'}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          {/* Main Pond - Center */}
          <div 
            style={{
              position: 'absolute',
              top: '900px',
              left: '300px',
              width: '400px',
              height: '250px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/pond.png" 
              alt="Main Pond" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))',
                opacity: '0.9'
              }}
            />
          </div>

                            
          {/* Haybale - bottom right area */}
          <motion.div
            style={{
              position: 'absolute',
              top: '1600px',
              right: '50px',
              width: '120px',
              height: '120px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/haybale.png" 
              alt="Hay Bale" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>

                    {/* Haybale - bottom left area */}
          <motion.div
            style={{
              position: 'absolute',
              top: '1300px',
              right: '1300px',
              width: '120px',
              height: '120px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/haybale.png" 
              alt="Hay Bale" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>

         

          {/* Scarecrow - Center field area */}
          <motion.div
            style={{
              position: 'absolute',
              top: '1400px',
              left: '500px',
              width: '100px',
              height: '140px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/scarecrow.png" 
              alt="Scarecrow" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>

          {/* Shrub - Bottom left corner */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: '570px',
              left: '1400px',
              width: '80px',
              height: '80px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/shrub.png" 
              alt="Shrub" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>

          {/* Tractor - Right side */}
          <motion.div
            style={{
              position: 'absolute',
              top: '1400px',
              right: '150px',
              width: '280px',
              height: '220px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/tractor.png" 
              alt="Tractor" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>

          {/* Tree1 - right side background */}
          <motion.div
            style={{
              position: 'absolute',
              top: '450px',
              left: '1300px',
              width: '300px',
              height: '350px',
              zIndex: '5'
            }}
          >
            <img 
              src="/stable/tree1.png" 
              alt="Tree" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>

          {/* Apple Tree - Right side */}
          <motion.div
            style={{
              position: 'absolute',
              top: '400px',
              right: '1350px',
              width: '300px',
              height: '220px',
              zIndex: '5'
            }}
          >
            <img 
              src="/stable/appletree.png" 
              alt="Apple Tree" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>

           {/* Apple Tree 2 - Right side */}
          <motion.div
            style={{
              position: 'absolute',
              top: '225px',
              right: '1150px',
              width: '300x',
              height: '220px',
              zIndex: '5'
            }}
          >
            <img 
              src="/stable/appletree.png" 
              alt="Apple Tree" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>

          {/* Central Field Fence 1- Full width horizontal */}
          <motion.div
            style={{
              position: 'absolute',
              top: '1042px',
              right: '-570px',
              width: '1600px',
              height: '300px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/single fence.png" 
              alt="Central Field Fence" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
                                
              }}
            />
          </motion.div>

           {/* Central Field Fence 2- Full width horizontal */}
          <motion.div
            style={{
              position: 'absolute',
              top: '1042px',
              right: '590px',
              width: '1600px',
              height: '300px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/single fence.png" 
              alt="Central Field Fence" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'scaleX(-1)'
              }}
            />
          </motion.div>

          {/* TV - Decorative Asset */}
          <motion.div
            style={{
              position: 'absolute',
              top: '800px',
              left: '1200px',
              width: '150px',
              height: '120px',
              zIndex: '10',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowTvModal(true);
            }}
            title="Click to watch TV"
          >
            <img 
              src="/TV/TV.png" 
              alt="TV" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>

          
         
          {/* Roaming Horses */}
          {stableHorses.map((horse) => (
            <motion.div
              key={horse.id}
              className="absolute z-20 cursor-pointer"
              style={{ left: `${horse.x}%`, top: `${horse.y}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
              data-horse-clickable="true"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`🐴 Stable - Horse ${horse.name} clicked:`);
                console.log('  - Horse object:', horse);
                console.log('  - Horse inventory:', horse.inventory);
                setSelectedHorse(horse);
              }}
            >
              <motion.div
                className="relative"
                animate={
                  horse.isResting
                    ? { scale: [1, 1.02, 1], rotate: [0, 1, -1, 0] }
                    : horse.isInjured
                    ? { y: [0, -0.5, 0], rotate: [0, 0.5, -0.5, 0] } // Injured horses barely move
                    : isPlaying && !horse.isInjured // Dancing to music (only if not injured)
                    ? { 
                        y: [0, -8, -4, -8, 0], // Enhanced bouncing pattern
                        rotate: [0, 5, -5, 3, 0], // Head bobbing side to side
                        scale: [1, 1.05, 0.98, 1.02, 1] // Slight pulsing to the beat
                      }
                    : horse.energy < 30
                    ? { y: [0, -1, 0], rotate: [0, 1, -1, 0] } // Tired animation
                    : horse.happiness > 80
                    ? { y: [0, -3, 0], rotate: [0, 3, -3, 0] } // Happy animation
                    : { y: [0, -2, 0], rotate: [0, 2, -2, 0] } // Normal animation
                }
                transition={{
                  duration: horse.isResting 
                    ? 3 
                    : horse.isInjured
                    ? 4 // Injured horses move very slowly
                    : isPlaying && !horse.isInjured
                    ? 1.2 // Rhythmic tempo for dancing
                    : horse.energy < 30 
                    ? 2 
                    : horse.happiness > 80 
                    ? 0.8 
                    : 1,
                  repeat: Infinity,
                  ease: horse.isInjured ? "easeOut" : isPlaying ? "easeInOut" : "easeInOut",
                  delay: isPlaying && !horse.isInjured ? (horse.id * 0.1) : 0, // Slight delay offset for each horse when dancing
                }}
              >
                <FadeInImage
                  src={horse.avatar}
                  alt={horse.name}
                  className="w-40 h-40 object-contain rounded-lg"
                  style={{
                    transform:
                      horse.direction > -90 && horse.direction < 90
                        ? "none"
                        : "scaleX(-1)",
                    ...getHorseHealthEffects(horse),
                  }}
                />
                
                
                {/* Care Action Visual Effects */}
                {horse.isBeingGroomed && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Grooming sparkles */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-yellow-400"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      >
                        ✨
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                
                {horse.isEatingApple && (
                  <motion.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [1, 1, 0],
                      y: [0, -10, -20],
                      scale: [1, 1.2, 0.8]
                    }}
                    transition={{ duration: 2, repeat: 1 }}
                  >
                    🍎
                  </motion.div>
                )}
                
                {horse.isEatingCarrot && (
                  <motion.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [1, 1, 0],
                      y: [0, -10, -20],
                      scale: [1, 1.2, 0.8]
                    }}
                    transition={{ duration: 2, repeat: 1 }}
                  >
                    🥕
                  </motion.div>
                )}
                
                {horse.isEatingGoldenApple && (
                  <motion.div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [1, 1, 1, 0],
                      y: [0, -15, -25, -30],
                      scale: [1, 1.3, 1.1, 0.9],
                      rotate: [0, 15, -15, 0]
                    }}
                    transition={{ duration: 3, repeat: 1 }}
                    style={{ 
                      filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 15px rgba(255, 165, 0, 0.6))'
                    }}
                  >
                    <div 
                      className="w-16 h-16"
                      style={{ 
                        filter: 'drop-shadow(0 0 5px rgba(255, 215, 0, 0.9))'
                      }}
                    >
                      <TileSprite 
                        tileX={7} 
                        tileY={0}
                      />
                    </div>
                  </motion.div>
                )}
                
                {horse.isEatingEnergyDrink && (
                  <motion.div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [1, 1, 1, 0],
                      y: [0, -15, -25, -30],
                      scale: [1, 1.2, 1.1, 0.9],
                      rotate: [0, -10, 10, 0]
                    }}
                    transition={{ duration: 3, repeat: 1 }}
                    style={{ 
                      filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 15px rgba(0, 200, 255, 0.6))'
                    }}
                  >
                    <div 
                      className="w-16 h-16"
                      style={{ 
                        filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.9))'
                      }}
                    >
                      <TileSprite 
                        tileX={9} 
                        tileY={4}
                      />
                    </div>
                  </motion.div>
                )}
                
                {horse.isEatingHorsePowerCereal && (
                  <motion.div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [1, 1, 1, 0],
                      y: [0, -15, -25, -30],
                      scale: [1, 1.3, 1.15, 0.9],
                      rotate: [0, 8, -8, 0]
                    }}
                    transition={{ duration: 3, repeat: 1 }}
                    style={{ 
                      filter: 'drop-shadow(0 0 8px rgba(255, 165, 0, 0.8)) drop-shadow(0 0 15px rgba(255, 140, 0, 0.6))'
                    }}
                  >
                    <div 
                      className="w-16 h-16"
                      style={{ 
                        filter: 'drop-shadow(0 0 5px rgba(255, 165, 0, 0.9))'
                      }}
                    >
                      <TileSprite 
                        tileX={9} 
                        tileY={5}
                      />
                    </div>
                  </motion.div>
                )}
                
                {horse.isBeingHealed && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Healing aura */}
                    <motion.div
                      className="absolute inset-0 bg-green-400 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    {/* Healing crosses */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-green-500 text-xl"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.2, 0.5],
                          y: [0, -30],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      >
                        ✚
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                
                {/* Musical notes for dancing horses */}
                {isPlaying && !horse.isResting && (
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-blue-400"
                        style={{
                          left: `${40 + i * 20}%`,
                          top: `${30 + i * 15}%`,
                          fontSize: '14px'
                        }}
                        animate={{
                          opacity: [0, 0.8, 0],
                          y: [0, -15],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 1 + (horse.id * 0.5), // Longer offset per horse
                          ease: "easeInOut"
                        }}
                      >
                        {i % 2 === 0 ? '🎵' : '🎶'}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Horse Status Indicators - Cycling */}
                {(() => {
                  const indicators = getHorseStatusIndicators(horse);
                  if (indicators.length === 0) return null;
                  
                  const currentIndex = cyclingIndex[horse.id] || 0;
                  const indicator = indicators[currentIndex];
                  const emojiTile = EMOJI_MAP[indicator];
                  
                  return (
                    <motion.div
                      key={`${horse.id}-${indicator}`}
                      className="absolute"
                      style={{
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: [0.8, 1, 0.8], 
                        y: [0, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    >
                      <EmojiSprite 
                        tileX={emojiTile.x} 
                        tileY={emojiTile.y} 
                        size={24} 
                      />
                    </motion.div>
                  );
                })()}
                {showNameTags && (
                  <motion.div
                    className="absolute bg-amber-800 text-amber-100 px-2 py-1 border border-amber-600 text-xs whitespace-nowrap"
                    style={{
                      top: '50px',
                      left: '0%',
                      transform: 'translateX(-50%)',
                      fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                      fontWeight: 'bold',
                      fontSize: '10px',
                      letterSpacing: '0.5px'
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: horse.id * 0.2 }}
                  >
                    {horse.name.toUpperCase()}
                  </motion.div>
                )}
                {horse.isResting && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    💤
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ))}



          {/* Library Decorative Asset */}
          <motion.div
            style={{
              position: 'absolute',
              top: '400px',
              right: '1100px',
              width: '260px',
              height: '260px',
              zIndex: '10',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLibraryModal(true)}
            title="Horse Box Library"
          >
            <img 
              src="/stable/library.png" 
              alt="Library" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </motion.div>

          {/* Fortune Teller Decorative Asset */}
          <motion.div
            style={{
              position: 'absolute',
              top: '55px',
              right: '750px',
              width: '160px',
              height: '190px',
              zIndex: '12',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              if (!isDragging) {
                e.stopPropagation();
                setShowTarotModal(true);
              }
            }}
            title="Get Your Fortune Read"
          >
            <img 
              src="/stable/fortuneteller.png" 
              alt="Fortune Teller" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))',
                transition: 'filter 0.2s ease'
              }}
            />
          </motion.div>

          {/* Care Action Feedback */}
          {careActionFeedback && (
            <motion.div
              className="absolute top-4 right-4"
              style={{
                backgroundColor: careActionFeedback.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                borderColor: careActionFeedback.type === 'success' ? '#16a34a' : '#dc2626',
                border: '2px solid',
                color: '#ffffff',
                padding: '8px 12px',
                fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
                fontSize: '8px',
                letterSpacing: '1px',
                zIndex: '25',
                transform: 'translateY(-80px)'
              }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
            >
              {careActionFeedback.message}
            </motion.div>
          )}

          {/* New Day Notification Modal */}
          {newDayNotification && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                className="bg-amber-100 border-4 border-amber-600 rounded-lg p-8 w-96 shadow-2xl text-center"
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                style={{
                  fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
                  fontSize: '12px',
                  letterSpacing: '1px'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '16px' }}>🌅 ✨</div>
                
                <div className="text-amber-900 mb-4 leading-relaxed">
                  {newDayNotification}
                </div>
                
                <div className="text-amber-700 text-xs mb-6 opacity-80">
                  <span className="inline-flex items-center gap-1"><img src="/horsecoins.png" alt="coins" className="w-3 h-3" /> Daily Income Received!</span>
                </div>
                
                <button
                  onClick={() => setNewDayNotification(null)}
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-bold"
                  style={{ fontSize: '12px' }}
                >
                  Continue
                </button>
              </motion.div>
            </div>
          )}

        </div>
        </div>
        {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Select Grazing Horses</h2>
            <p className="text-sm text-gray-600 mb-3">Maximum 5 horses can graze at once ({selectedGrazingHorses.length}/5)</p>
            
            {/* Sort Filter */}
            {availableHorses.length > 5 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort horses by:
                </label>
                <select 
                  value={horseSortOrder} 
                  onChange={(e) => setHorseSortOrder(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="default">Default Order</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              {(() => {
                // Sort horses based on selected order
                const sortedHorses = [...availableHorses];
                if (horseSortOrder === 'alphabetical') {
                  sortedHorses.sort((a, b) => {
                    const nameA = (customHorseNames?.[a.id] || a.name || '').toLowerCase();
                    const nameB = (customHorseNames?.[b.id] || b.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                  });
                }
                
                return sortedHorses.map((horse) => {
                  const isChecked = selectedGrazingHorses.includes(horse.id);
                  const isDisabled = !isChecked && selectedGrazingHorses.length >= 5;
                  const displayName = customHorseNames?.[horse.id] || horse.name;
                  
                  return (
                    <label key={horse.id} className={`flex items-center gap-2 ${isDisabled ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleHorseRoaming(horse.id)}
                        disabled={isDisabled}
                      />
                      <span>{displayName}</span>
                      {isDisabled && <span className="text-xs text-gray-500">(limit reached)</span>}
                    </label>
                  );
                });
              })()}
            </div>
            <div className="flex justify-between items-center gap-4 mt-4">
              {onShowLockedHorses && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowSelector(false);
                    onShowLockedHorses();
                  }}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
                >
                  Unlock Horses
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSelector(false)}
                className="px-8 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-lg min-w-[100px]"
              >
                Done
              </motion.button>
            </div>
          </div>
        </div>
      )}
      {selectedHorse && (
        <HorseDetailsModal
          horse={{
            ...selectedHorse,
            inventory: horseInventories[selectedHorse.id] || []
          }}
          onClose={() => setSelectedHorse(null)}
          onRename={handleRename}
          onSendToLabyrinth={() => {
            // Get the fresh horse data with updated inventory from parent state
            const freshHorse = {
              ...selectedHorse,
              inventory: horseInventories[selectedHorse.id] || []
            };
            console.log('🏠 Stable - onSendToLabyrinth called with fresh horse:', freshHorse);
            console.log('🎒 Stable - fresh horse inventory:', freshHorse?.inventory);
            setHorseBeingSent(freshHorse);
            setShowLabyrinthEntrance(true);
            setSelectedHorse(null);
          }}
          onCareAction={(horseId, actionType) => {
            handleIndividualCareAction(horseId, actionType);
            setSelectedHorse(null); // Close modal to see animation effects
          }}
          onSellItem={handleSellItem}
          onFeedItem={handleFeedItem}
          coins={coins}
          careCosts={individualCareCosts}
        />
      )}
      {showMusicLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-amber-800 border-2 border-amber-600 p-6 w-80 max-h-[80vh] overflow-y-auto"
            style={{
              fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
              fontSize: '12px',
              letterSpacing: '1px'
            }}>
            <h2 className="text-xl font-bold mb-4 text-amber-100 text-center"
              style={{
                fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                letterSpacing: '2px'
              }}>
              MUSIC LIBRARY
            </h2>
            <div className="space-y-2">
              <div 
                className="bg-amber-700 border border-amber-500 px-3 py-2 cursor-pointer hover:bg-amber-600 transition-colors"
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (isPlaying) {
                    return; // Don't start playing if already playing
                  }
                  
                  // Stop any currently playing audio
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Gallop to Glory.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'THEME SONG',
                    image: '/record collection/theme song.png'
                  });
                  
                  // Set up event listeners
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                  });
                  
                  audio.addEventListener('error', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed');
                  });
                  
                  audio.play().catch(err => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed:', err);
                  });
                }}
              >
                <span className="text-amber-100">♪ THEME SONG</span>
              </div>
              
              <div 
                className={`border px-3 py-2 transition-colors ${
                  unlockedSongs['WILD MANE'] 
                    ? 'bg-amber-700 border-amber-500 cursor-pointer hover:bg-amber-600' 
                    : 'bg-gray-500 border-gray-400 cursor-not-allowed opacity-60'
                }`}
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (!unlockedSongs['WILD MANE']) return; // Don't play if locked
                  
                  if (isPlaying) {
                    return; // Don't start playing if already playing
                  }
                  
                  // Stop any currently playing audio
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Wild Mane.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'WILD MANE',
                    image: '/record collection/Wild Mane.png'
                  });
                  
                  // Set up event listeners
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                  });
                  
                  audio.addEventListener('error', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed');
                  });
                  
                  audio.play().catch(err => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed:', err);
                  });
                }}
              >
                <span className={unlockedSongs['WILD MANE'] ? "text-amber-100" : "text-gray-300"}>
                  {unlockedSongs['WILD MANE'] ? '♪ WILD MANE' : '🔒 WILD MANE'}
                </span>
              </div>
              
              <div 
                className={`border px-3 py-2 transition-colors ${
                  unlockedSongs['WILD AND UNBRIDLED'] 
                    ? 'bg-amber-700 border-amber-500 cursor-pointer hover:bg-amber-600' 
                    : 'bg-gray-500 border-gray-400 cursor-not-allowed opacity-60'
                }`}
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (!unlockedSongs['WILD AND UNBRIDLED']) return; // Don't play if locked
                  
                  if (isPlaying) {
                    return; // Don't start playing if already playing
                  }
                  
                  // Stop any currently playing audio
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Wild and Unbridled.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'WILD AND UNBRIDLED',
                    image: '/record collection/Wild and Unbridled.png'
                  });
                  
                  // Set up event listeners
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                  });
                  
                  audio.addEventListener('error', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed');
                  });
                  
                  audio.play().catch(err => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed:', err);
                  });
                }}
              >
                <span className={unlockedSongs['WILD AND UNBRIDLED'] ? "text-amber-100" : "text-gray-300"}>
                  {unlockedSongs['WILD AND UNBRIDLED'] ? '♪ WILD AND UNBRIDLED' : '🔒 WILD AND UNBRIDLED'}
                </span>
              </div>
              
              <div 
                className={`border px-3 py-2 transition-colors ${
                  unlockedSongs['CLOVER'] 
                    ? 'bg-amber-700 border-amber-500 cursor-pointer hover:bg-amber-600' 
                    : 'bg-gray-500 border-gray-400 cursor-not-allowed opacity-60'
                }`}
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (!unlockedSongs['CLOVER']) return; // Don't play if locked
                  
                  if (isPlaying) {
                    return; // Don't start playing if already playing
                  }
                  
                  // Stop any currently playing audio
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Clover.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'CLOVER',
                    image: '/record collection/Clover.png'
                  });
                  
                  // Set up event listeners
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                  });
                  
                  audio.addEventListener('error', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed');
                  });
                  
                  audio.play().catch(err => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed:', err);
                  });
                }}
              >
                <span className={unlockedSongs['CLOVER'] ? "text-amber-100" : "text-gray-300"}>
                  {unlockedSongs['CLOVER'] ? '♪ CLOVER' : '🔒 CLOVER'}
                </span>
              </div>
              
              {/* Horse Power Cereal */}
              <div 
                className={`border px-3 py-2 transition-colors ${
                  unlockedSongs['HORSE POWER CEREAL'] 
                    ? 'bg-amber-700 border-amber-500 cursor-pointer hover:bg-amber-600' 
                    : 'bg-gray-500 border-gray-400 cursor-not-allowed opacity-60'
                }`}
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '8px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (!unlockedSongs['HORSE POWER CEREAL']) return;
                  
                  if (isPlaying) {
                    return;
                  }
                  
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Horse Power Cereal.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'HORSE POWER CEREAL',
                    image: '/record collection/Horse Power Cereal.png'
                  });
                  
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentSong(null);
                    setCurrentAudio(null);
                  });
                  
                  audio.play().catch(error => {
                    console.error('Error playing Horse Power Cereal audio:', error);
                    setIsPlaying(false);
                    setCurrentSong(null);
                    setCurrentAudio(null);
                  });
                }}
              >
                <span className={unlockedSongs['HORSE POWER CEREAL'] ? "text-amber-100" : "text-gray-300"}>
                  {unlockedSongs['HORSE POWER CEREAL'] ? '♪ HORSE POWER CEREAL' : '🔒 HORSE POWER CEREAL'}
                </span>
              </div>
              
              {/* Horse Bros */}
              <div 
                className={`border px-3 py-2 transition-colors ${
                  unlockedSongs['HORSE BROS'] 
                    ? 'bg-amber-700 border-amber-500 cursor-pointer hover:bg-amber-600' 
                    : 'bg-gray-500 border-gray-400 cursor-not-allowed opacity-60'
                }`}
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '8px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (!unlockedSongs['HORSE BROS']) return;
                  
                  if (isPlaying) {
                    return;
                  }
                  
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Horse Bros.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'HORSE BROS',
                    image: '/record collection/Horse Bros.png'
                  });
                  
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentSong(null);
                    setCurrentAudio(null);
                  });
                  
                  audio.play().catch(error => {
                    console.error('Error playing Horse Bros audio:', error);
                    setIsPlaying(false);
                    setCurrentSong(null);
                    setCurrentAudio(null);
                  });
                }}
              >
                <span className={unlockedSongs['HORSE BROS'] ? "text-amber-100" : "text-gray-300"}>
                  {unlockedSongs['HORSE BROS'] ? '♪ HORSE BROS' : '🔒 HORSE BROS'}
                </span>
              </div>
              
              {/* Partners in Hoof */}
              <div 
                className={`border px-3 py-2 transition-colors ${
                  unlockedSongs['PARTNERS IN HOOF'] 
                    ? 'bg-amber-700 border-amber-500 cursor-pointer hover:bg-amber-600' 
                    : 'bg-gray-500 border-gray-400 cursor-not-allowed opacity-60'
                }`}
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '8px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (!unlockedSongs['PARTNERS IN HOOF']) return;
                  
                  if (isPlaying) {
                    return;
                  }
                  
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Partners in Hoof.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'PARTNERS IN HOOF',
                    image: '/record collection/Partners in Hoof.png'
                  });
                  
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentSong(null);
                    setCurrentAudio(null);
                  });
                  
                  audio.play().catch(error => {
                    console.error('Error playing Partners in Hoof audio:', error);
                    setIsPlaying(false);
                    setCurrentSong(null);
                    setCurrentAudio(null);
                  });
                }}
              >
                <span className={unlockedSongs['PARTNERS IN HOOF'] ? "text-amber-100" : "text-gray-300"}>
                  {unlockedSongs['PARTNERS IN HOOF'] ? '♪ PARTNERS IN HOOF' : '🔒 PARTNERS IN HOOF'}
                </span>
              </div>
            </div>
            <div className="text-right mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMusicLibrary(false)}
                className="px-4 py-2 bg-amber-600 border-2 border-amber-500 text-amber-100 hover:bg-amber-700 transition-colors font-bold"
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
              >
                CLOSE
              </motion.button>
            </div>
          </div>
        </div>
      )}

    {/* Now Playing indicator - Mobile-safe positioning */}
    {isPlaying && currentSong && (
      <div 
        style={{
          position: 'absolute',
          bottom: '150px', // Bottom of screen
          left: '20px',
          color: '#92400e',
          backgroundColor: 'rgba(251, 191, 36, 0.98)',
          padding: window.innerWidth < 640 ? '8px 10px' : '10px 14px',
          border: '3px solid #a16207',
          borderRadius: '8px',
          fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
          fontSize: window.innerWidth < 640 ? '8px' : '10px',
          letterSpacing: '1px',
          zIndex: '1001',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
          width: window.innerWidth < 640 ? '280px' : '320px',
          minWidth: window.innerWidth < 640 ? '280px' : '320px',
          maxWidth: window.innerWidth < 640 ? '280px' : '320px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: window.innerWidth < 640 ? '6px' : '10px'
        }}>
          <img 
            src={currentSong.image}
            alt={`${currentSong.name} Album Cover`}
            style={{
              width: window.innerWidth < 640 ? '45px' : '60px',
              height: window.innerWidth < 640 ? '45px' : '60px',
              objectFit: 'cover',
              border: '2px solid #92400e',
              borderRadius: '4px',
              flexShrink: 0
            }}
          />
          <motion.div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              flexShrink: 0
            }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <div style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <motion.div
              style={{ 
                fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              }}
              animate={{
                x: ['0%', '-50%']
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {`Now Playing: ${currentSong.name}  •  Now Playing: ${currentSong.name}  •  `}
            </motion.div>
          </div>
          <button
            style={{
              padding: window.innerWidth < 640 ? '4px 8px' : '6px 10px',
              backgroundColor: '#b45309',
              border: '2px solid #a16207',
              borderRadius: '4px',
              color: '#fef3c7',
              fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
              fontSize: window.innerWidth < 640 ? '7px' : '8px',
              letterSpacing: '1px',
              cursor: 'pointer',
              flexShrink: 0,
              fontWeight: 'bold'
            }}
            onClick={() => {
              if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                setIsPlaying(false);
                setCurrentAudio(null);
                setCurrentSong(null);
              }
            }}
          >
            STOP
          </button>
        </div>
      </div>
    )}

    {/* Labyrinth Entrance Interstitial */}
    {showLabyrinthEntrance && (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          {/* Main image container */}
          <div className="flex-1 flex items-center justify-center w-full">
            <img 
              src="/maze/Labyrinthentrance.png" 
              alt="Labyrinth Entrance" 
              className="max-w-full max-h-full object-contain"
              style={{
                maxHeight: '80vh',
                maxWidth: '90vw'
              }}
              onLoad={() => {
                console.log('Labyrinth entrance image loaded successfully');
              }}
              onError={(e) => {
                console.warn('Failed to load /maze/Labyrinthentrance.png');
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Continue button - always visible */}
          <div className="w-full flex justify-center pb-8">
            <button
              onClick={() => {
                onSendToLabyrinth(horseBeingSent);
                setShowLabyrinthEntrance(false);
                setHorseBeingSent(null);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg border-2 border-amber-400 transition-colors text-lg"
              style={{
                fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace',
                fontSize: '12px',
                letterSpacing: '1px'
              }}
            >
              ENTER LABYRINTH
            </button>
          </div>
          
          {/* Backup click area for mobile */}
          <div 
            className="absolute inset-0 cursor-pointer md:hidden"
            onClick={() => {
              onSendToLabyrinth(horseBeingSent);
              setShowLabyrinthEntrance(false);
              setHorseBeingSent(null);
            }}
          />
        </div>
      </div>
    )}

    {/* Song Unlock Modal */}
    {showSongUnlockModal && unlockedSongData && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
          <div className="text-center space-y-4">
            <div className="mb-4 flex justify-center">
              {(() => {
                const tileKey = getRecordTileKey(unlockedSongData.recordName);
                if (tileKey && TILE_MAP[tileKey]) {
                  return (
                    <div style={{ width: '64px', height: '64px' }}>
                      <TileSprite 
                        tileX={TILE_MAP[tileKey].x} 
                        tileY={TILE_MAP[tileKey].y}
                      />
                    </div>
                  );
                } else {
                  return <div className="text-6xl">🎵</div>;
                }
              })()}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              New Song Unlocked!
            </h2>
            
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
              <div className="text-lg font-bold text-purple-800 mb-2">
                {unlockedSongData.songName}
              </div>
              <div className="text-sm text-purple-700">
                Found by {unlockedSongData.horseName}
              </div>
            </div>
            
            <p className="text-gray-600">
              {unlockedSongData.horseName} discovered a rare record! This song is now available in your music library.
            </p>
            
            <button
              onClick={handleSongUnlock}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Add to Music Library
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Dragon Nest Modal */}
    {showDragonNestModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          className="bg-amber-900 border-4 border-amber-600 rounded-lg p-6 w-96 shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
            fontSize: '12px',
            letterSpacing: '1px'
          }}
        >
          <div className="text-center">
            <h2 className="text-amber-100 text-lg mb-4">🥚 Dragon Nest</h2>
            
            {/* Nest/Egg Image */}
            <div 
              className="w-32 h-32 mx-auto mb-4 relative"
              style={{
                backgroundImage: `url(/stable/${nestEgg ? 'fullnest' : 'dragoneggnest'}.png)`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            >
              {/* Show egg in nest if there is one */}
              {nestEgg && (
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    backgroundImage: 'url(/maze/tilesheetdan.png)',
                    backgroundPosition: '88.89% 44.44%', // Dragon egg tile coordinates
                    backgroundSize: '1000% 1000%',
                    backgroundRepeat: 'no-repeat',
                    width: '48px',
                    height: '48px',
                    margin: 'auto',
                    imageRendering: 'pixelated'
                  }}
                />
              )}
            </div>
            
            {nestEgg ? (
              <>
                <p className="text-amber-200 mb-4 leading-relaxed">
                  A dragon egg is in the nest
                </p>
                <div className="mb-6 p-3 bg-purple-900 border border-purple-600 rounded">
                  <p className="text-purple-200 text-sm font-bold">
                    Days till egg hatches: {nestEgg.daysRemaining}
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowDragonNestModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    style={{ fontSize: '10px' }}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-amber-200 mb-6 leading-relaxed">
                  It looks like a nest for an egg?
                </p>
                
                {(() => {
                  const horsesWithEggs = findHorsesWithDragonEggs();
                  const hasEgg = horsesWithEggs.length > 0;
                  
                  return (
                    <>
                      {hasEgg && (
                        <div className="mb-4 p-3 bg-amber-800 border border-amber-600 rounded">
                          <p className="text-amber-100 text-sm mb-2">
                            Dragon Egg found in {horsesWithEggs[0].horse.name}'s inventory!
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setShowDragonNestModal(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          style={{ fontSize: '10px' }}
                        >
                          Close
                        </button>
                        
                        <button
                          onClick={handleAddEggToNest}
                          disabled={!hasEgg}
                          className={`px-4 py-2 rounded transition-colors ${
                            hasEgg
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          }`}
                          style={{ fontSize: '10px' }}
                        >
                          Add Egg
                        </button>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </motion.div>
      </div>
    )}

    {/* Dragon Hatching Modal */}
    {showHatchingModal && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <motion.div
          className="bg-purple-900 border-4 border-purple-600 rounded-lg p-8 w-96 shadow-2xl text-center"
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          style={{
            fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
            fontSize: '12px',
            letterSpacing: '1px'
          }}
        >
          <h2 className="text-purple-100 text-xl mb-6">🐉 DRAGON EGG HAS HATCHED! 🐉</h2>
          
          {/* Hatched dragon visualization */}
          <div className="mb-6">
            <div className="text-6xl mb-4">🐲</div>
            <p className="text-purple-200 leading-relaxed">
              A magnificent dragon has emerged from the egg!
            </p>
          </div>
          
          <button
            onClick={() => setShowHatchingModal(false)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold"
            style={{ fontSize: '12px' }}
          >
            Amazing!
          </button>
        </motion.div>
      </div>
    )}

    {/* Happiness Reward Modal */}
    {happinessRewardModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-yellow-100 to-orange-100 border-3 border-yellow-400 rounded-xl p-6 max-w-md mx-4 shadow-2xl"
        >
          <div className="text-center space-y-4">
            <div className="text-4xl mb-2">
              {happinessRewardModal.type === 'coins' ? <img src="/horsecoins.png" alt="coins" className="w-12 h-12 mx-auto" /> : '🗝️'}
            </div>
            
            <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '14px' }}>
              Happy Horse Reward!
            </h3>
            
            <div className="text-gray-700" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '11px', lineHeight: '1.6' }}>
              <p className="mb-2">
                <span className="font-bold text-purple-600">{happinessRewardModal.horseName}</span> has been happy lately and found you:
              </p>
              
              {happinessRewardModal.type === 'coins' ? (
                <p className="text-yellow-600 font-bold">
                  <span className="inline-flex items-center gap-1"><img src="/horsecoins.png" alt="coins" className="w-4 h-4" /> {happinessRewardModal.amount} coins!</span>
                  {happinessRewardModal.noSpace && (
                    <span className="block text-orange-600 text-xs mt-1">
                      (Inventory was full - converted key to coins)
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-blue-600 font-bold">
                  🗝️ A magical key!
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setHappinessRewardModal(null)}
            className="w-full mt-6 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition-colors"
            style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '11px' }}
          >
            Wonderful!
          </button>
        </motion.div>
      </div>
    )}

    {/* Horse Box Library Modal */}
    {showLibraryModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-amber-100 to-orange-100 border-3 border-amber-600 rounded-xl p-6 max-w-4xl mx-4 shadow-2xl"
          style={{ height: '70vh' }}
        >
          {!selectedBook ? (
            // Library main view
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-800" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '18px' }}>
                  📚 Horse Box Library
                </h2>
                <button
                  onClick={() => setShowLibraryModal(false)}
                  className="text-amber-600 hover:text-amber-800 text-2xl font-bold"
                  style={{ fontFamily: 'Press Start 2P, monospace' }}
                >
                  ✕
                </button>
              </div>
              
              <p className="text-amber-700 mb-6" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px', lineHeight: '1.6' }}>
                Expand your knowledge with these helpful guides. Click on any book to read its contents.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(bookLibrary).map(([bookId, book]) => (
                  unlockedBooks[bookId] && (
                    <motion.div
                      key={bookId}
                      className="bg-white border-2 border-amber-400 rounded-lg p-4 cursor-pointer shadow-lg"
                      whileHover={{ scale: 1.02, backgroundColor: '#fef3c7' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBook(bookId)}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-2xl">
                          {bookId === 'stable' ? '🏠' : bookId === 'labyrinth' ? '🌟' : '📖'}
                        </div>
                        <h3 className="text-lg font-bold text-amber-800" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '14px' }}>
                          {book.title}
                        </h3>
                      </div>
                      <p className="text-amber-600 text-sm" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px', lineHeight: '1.4' }}>
                        {book.description}
                      </p>
                    </motion.div>
                  )
                ))}
              </div>
            </div>
          ) : (
            // Book reading view
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setSelectedBook(null)}
                  className="text-amber-600 hover:text-amber-800 font-bold flex items-center space-x-2"
                  style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px' }}
                >
                  <span>←</span>
                  <span>Back to Library</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedBook(null);
                    setShowLibraryModal(false);
                  }}
                  className="text-amber-600 hover:text-amber-800 text-xl font-bold"
                  style={{ fontFamily: 'Press Start 2P, monospace' }}
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">
                  {selectedBook === 'stable' ? '🏠' : selectedBook === 'labyrinth' ? '🌟' : '📖'}
                </div>
                <h2 className="text-xl font-bold text-amber-800" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '16px' }}>
                  {bookLibrary[selectedBook]?.title}
                </h2>
              </div>
              
              <div 
                className="overflow-y-auto bg-white border-2 border-amber-400 rounded-lg p-4"
                style={{
                  height: '450px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d97706 #f3f4f6'
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    width: 12px;
                  }
                  div::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 6px;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: #d97706;
                    border-radius: 6px;
                    border: 2px solid #f3f4f6;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: #b45309;
                  }
                `}</style>
                <div 
                  className="text-amber-800" 
                  style={{ 
                    fontFamily: 'Press Start 2P, monospace', 
                    fontSize: '10px', 
                    lineHeight: '1.8',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {bookLibrary[selectedBook]?.content}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )}

    {/* Stable Stats Modal */}
    {showStableStatsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-amber-100 to-orange-100 border-3 border-amber-600 rounded-xl p-6 max-w-lg mx-4 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-amber-800" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '18px' }}>
              🏠 Stable Resources
            </h2>
            <button
              onClick={() => setShowStableStatsModal(false)}
              className="text-amber-600 hover:text-amber-800 text-2xl font-bold"
              style={{ fontFamily: 'Press Start 2P, monospace' }}
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-amber-700 mb-4" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '11px', lineHeight: '1.6' }}>
              Monitor your stable's essential resources. Click to spend coins and care for your horses.
            </p>
            
            {/* Feed Status */}
            <div 
              className="bg-white bg-opacity-50 rounded-lg p-4 border border-amber-300 hover:bg-opacity-70 transition-all cursor-pointer"
              onClick={() => {
                if (coins >= careCosts.feed) {
                  handleCareAction('feed');
                }
              }}
              style={{ opacity: coins >= careCosts.feed ? 1 : 0.6 }}
              title={`Feed horses (${careCosts.feed} coins)`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌾</span>
                  <div>
                    <h3 className="font-bold text-amber-800" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px' }}>
                      FEED
                    </h3>
                    <p className="text-amber-600" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}>
                      Keeps horses healthy and energetic
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="font-bold text-lg"
                    style={{ 
                      fontFamily: 'Press Start 2P, monospace', 
                      fontSize: '14px',
                      color: getResourceColor(stableResources.feed)
                    }}
                  >
                    {Math.round(stableResources.feed)}%
                  </div>
                  <div className="text-amber-600" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '8px' }}>
                    {careCosts.feed} coins
                  </div>
                </div>
              </div>
            </div>

            {/* Water Status */}
            <div 
              className="bg-white bg-opacity-50 rounded-lg p-4 border border-amber-300 hover:bg-opacity-70 transition-all cursor-pointer"
              onClick={() => {
                if (coins >= careCosts.water) {
                  handleCareAction('water');
                }
              }}
              style={{ opacity: coins >= careCosts.water ? 1 : 0.6 }}
              title={`Refill water (${careCosts.water} coins)`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💧</span>
                  <div>
                    <h3 className="font-bold text-amber-800" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px' }}>
                      WATER
                    </h3>
                    <p className="text-amber-600" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}>
                      Maintains health and happiness
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="font-bold text-lg"
                    style={{ 
                      fontFamily: 'Press Start 2P, monospace', 
                      fontSize: '14px',
                      color: getResourceColor(stableResources.water)
                    }}
                  >
                    {Math.round(stableResources.water)}%
                  </div>
                  <div className="text-amber-600" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '8px' }}>
                    {careCosts.water} coins
                  </div>
                </div>
              </div>
            </div>

            {/* Pasture Status */}
            <div 
              className="bg-white bg-opacity-50 rounded-lg p-4 border border-amber-300 hover:bg-opacity-70 transition-all cursor-pointer"
              onClick={() => {
                if (coins >= careCosts.pasture) {
                  handleCareAction('pasture');
                }
              }}
              style={{ opacity: coins >= careCosts.pasture ? 1 : 0.6 }}
              title={`Maintain pasture (${careCosts.pasture} coins)`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <h3 className="font-bold text-amber-800" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px' }}>
                      PASTURE
                    </h3>
                    <p className="text-amber-600" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}>
                      Increases happiness and energy
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="font-bold text-lg"
                    style={{ 
                      fontFamily: 'Press Start 2P, monospace', 
                      fontSize: '14px',
                      color: getResourceColor(stableResources.pasture)
                    }}
                  >
                    {Math.round(stableResources.pasture)}%
                  </div>
                  <div className="text-amber-600" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '8px' }}>
                    {careCosts.pasture} coins
                  </div>
                </div>
              </div>
            </div>

            {/* Cleanliness Status */}
            <div 
              className="bg-white bg-opacity-50 rounded-lg p-4 border border-amber-300 hover:bg-opacity-70 transition-all cursor-pointer"
              onClick={() => {
                if (coins >= careCosts.cleanliness) {
                  handleCareAction('cleanliness');
                }
              }}
              style={{ opacity: coins >= careCosts.cleanliness ? 1 : 0.6 }}
              title={`Clean stable (${careCosts.cleanliness} coins)`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧼</span>
                  <div>
                    <h3 className="font-bold text-amber-800" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px' }}>
                      CLEAN
                    </h3>
                    <p className="text-amber-600" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}>
                      Keeps the stable environment clean
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="font-bold text-lg"
                    style={{ 
                      fontFamily: 'Press Start 2P, monospace', 
                      fontSize: '14px',
                      color: getResourceColor(stableResources.cleanliness)
                    }}
                  >
                    {Math.round(stableResources.cleanliness)}%
                  </div>
                  <div className="text-amber-600" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '8px' }}>
                    {careCosts.cleanliness} coins
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}

    {/* Fortune Teller Modal */}
    {showTarotModal && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-purple-900 to-indigo-900 border-4 border-purple-400 rounded-xl p-6 max-w-2xl max-h-[90vh] mx-4 shadow-2xl overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-200" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '16px' }}>
              🔮 Fortune Teller
            </h2>
            <button
              onClick={() => setShowTarotModal(false)}
              className="text-purple-300 hover:text-purple-100 text-2xl font-bold"
              style={{ fontFamily: 'Press Start 2P, monospace' }}
            >
              ✕
            </button>
          </div>
          
          <div className="text-center space-y-6">
            {/* Fortune Teller Image */}
            <div className="mb-4">
              <img 
                src="/stable/fortuneteller.png" 
                alt="Fortune Teller" 
                className="w-32 h-32 mx-auto object-contain filter drop-shadow-lg"
              />
            </div>
            
            {/* Fortune Teller Message */}
            <div className="text-purple-100 space-y-4" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px', lineHeight: '1.6' }}>
              <p>"A fortune teller has visited the stable."</p>
              <p>"I would tell the fortunes of your horses, however I have lost my cards."</p>
              <p>"If you find them in the labyrinth, please return them to me."</p>
              
              {/* Progress indicator */}
              <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4 mt-6">
                <p className="text-purple-300 mb-2">Cards Found: {unlockedTarotCards.length} / {TAROT_CARDS.length}</p>
                <div className="w-full bg-purple-950 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(unlockedTarotCards.length / TAROT_CARDS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => setShowLockedTarotCards(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors"
                style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}
              >
                🂮 Show Tarot Cards
              </button>
              
              <button
                onClick={() => {
                  setShowTarotModal(false);
                  setShowTarotGame(true);
                }}
                className={`px-6 py-3 font-bold transition-colors rounded-lg ${
                  unlockedTarotCards.length >= 3 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}
                disabled={unlockedTarotCards.length < 3}
              >
                {unlockedTarotCards.length >= 3 ? '✨ Tell My Fortune ✨' : '🔒 Find More Cards 🔒'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}

    {/* Locked Tarot Cards Modal */}
    {showLockedTarotCards && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-purple-900 to-indigo-900 border-4 border-purple-400 rounded-xl p-6 max-w-6xl max-h-[90vh] mx-4 shadow-2xl overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-200" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '16px' }}>
              🂮 Tarot Card Collection
            </h2>
            <button
              onClick={() => setShowLockedTarotCards(false)}
              className="text-purple-300 hover:text-purple-100 text-2xl font-bold"
              style={{ fontFamily: 'Press Start 2P, monospace' }}
            >
              ✕
            </button>
          </div>
          
          {/* Progress */}
          <div className="text-center mb-6">
            <p className="text-purple-200 mb-2" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px' }}>
              Cards Found: {unlockedTarotCards.length} / {TAROT_CARDS.length}
            </p>
            <div className="w-full bg-purple-950 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(unlockedTarotCards.length / TAROT_CARDS.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Tarot Cards Grid */}
          <div className="grid grid-cols-6 gap-4">
            {TAROT_CARDS.map((card) => {
              const isUnlocked = unlockedTarotCards.includes(card.id);
              
              return (
                <div key={card.id} className="flex flex-col items-center">
                  <div className="relative w-20 h-32 mb-2">
                    <img 
                      src={`/Tarot cards/${card.fileName}`}
                      alt={card.name}
                      className={`w-full h-full object-cover rounded-lg border-2 transition-all duration-300 ${
                        isUnlocked 
                          ? 'border-purple-400 filter-none' 
                          : 'border-gray-600 filter grayscale brightness-30'
                      }`}
                      style={{
                        filter: isUnlocked ? 'none' : 'grayscale(100%) brightness(0.3)'
                      }}
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl opacity-60">🔒</div>
                      </div>
                    )}
                  </div>
                  <p 
                    className={`text-xs text-center ${
                      isUnlocked ? 'text-purple-200' : 'text-gray-500'
                    }`}
                    style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '8px', lineHeight: '1.3' }}
                  >
                    {card.name}
                  </p>
                </div>
              );
            })}
          </div>
          
          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-purple-300 text-xs" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px', lineHeight: '1.5' }}>
              Find tarot chests in the labyrinth to unlock cards!
            </p>
            {unlockedTarotCards.length >= TAROT_CARDS.length && (
              <p className="text-yellow-300 text-xs mt-2" style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}>
                ✨ All cards found! The fortune teller can now read your horses' fortunes! ✨
              </p>
            )}
          </div>
        </motion.div>
      </div>
    )}

    {/* TV Modal */}
    {showTvModal && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4"
          style={{ maxHeight: '90vh' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '16px' }}
            >
              📺 TV - Now Playing
            </h2>
            <button
              onClick={() => setShowTvModal(false)}
              className="text-white hover:text-gray-300 text-2xl font-bold"
              style={{ fontFamily: 'Press Start 2P, monospace' }}
            >
              ×
            </button>
          </div>
          
          {/* Video Selection Buttons */}
          <div className="flex justify-center gap-4 mb-4">
            {tvVideos.map((video, index) => (
              <button
                key={index}
                onClick={() => setCurrentTvVideo(index)}
                className={`px-4 py-2 rounded font-bold text-sm ${
                  currentTvVideo === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '10px' }}
              >
                {video.title}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <video
              key={currentTvVideo} // Force re-render when video changes
              width="800"
              height="450"
              controls
              autoPlay
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px'
              }}
            >
              <source src={tvVideos[currentTvVideo].src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="text-center mt-4">
            <p 
              className="text-gray-300"
              style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '12px' }}
            >
              "{tvVideos[currentTvVideo].title}"
            </p>
          </div>
        </motion.div>
      </div>
    )}

    {/* Tarot Game Modal */}
    {showTarotGame && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-6 max-w-6xl w-full mx-4"
          style={{ maxHeight: '95vh', overflow: 'auto' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 
              className="text-xl font-bold text-purple-200"
              style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '16px' }}
            >
              🔮 Mystic Tarot Reading 🔮
            </h2>
            <button
              onClick={() => setShowTarotGame(false)}
              className="text-purple-300 hover:text-purple-100 text-2xl font-bold"
              style={{ fontFamily: 'Press Start 2P, monospace' }}
            >
              ×
            </button>
          </div>
          
          <ThemedTarotGame 
            onClose={() => setShowTarotGame(false)}
            currentTheme={currentTheme}
            unlockedTarotCards={unlockedTarotCards}
          />
        </motion.div>
      </div>
    )}
    </div>
  );
};

export default HorseStable;
