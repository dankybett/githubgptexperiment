import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import FadeInImage from "./components1/FadeInImage";
import HorseStable from "./components1/HorseStable";
import RaceTrack from "./components1/RaceTrack";
import BattleshipGame from "./components1/BattleshipGame";
import LockedHorses from "./components1/LockedHorses";
import HorseMazeGame from "./components1/labyrinth";
import SettingsModal from "./components1/SettingsModal";
import { raceEngineAdapter } from "./racing/RaceEngineAdapter";
import { createSeededRng } from "./utils/prng";
import { gameStorage } from "./utils/gameStorage";
import { themeUtils, DEFAULT_THEME } from "./utils/themes";

const MotionFadeInImage = motion(FadeInImage);

export default function RandomPicker() {
  const [showTitle, setShowTitle] = useState(true);
  const [showRaceScreen, setShowRaceScreen] = useState(false);
  const [showStable, setShowStable] = useState(false);
  const [showBattleship, setShowBattleship] = useState(false);
  const [showLabyrinth, setShowLabyrinth] = useState(false);
  const [showLockedHorses, setShowLockedHorses] = useState(false);
  const [itemCount, setItemCount] = useState(5);
  const [items, setItems] = useState(Array(5).fill(""));
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [commentary, setCommentary] = useState("");
  const [history, setHistory] = useState([]);
  const [positions, setPositionsState] = useState(Array(5).fill(0));
  const positionsRef = useRef(positions);
  const setPositions = (value) => {
    if (typeof value === "function") {
      setPositionsState((prev) => {
        const next = value(prev);
        positionsRef.current = next;
        return next;
      });
    } else {
      positionsRef.current = value;
      setPositionsState(value);
    }
  };
  const [muted, setMuted] = useState(false);
  const raceSoundRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [raceTime, setRaceTime] = useState(0);
  const [fastestTime, setFastestTime] = useState(null);
  const [nameCategory, setNameCategory] = useState("Default");
  const [raceDistance, setRaceDistance] = useState("long");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [raceSeed, setRaceSeed] = useState(null);
  const rngRef = useRef(Math.random);
  const [surgingHorses, setSurgingHorses] = useState([]);
  const [fatiguedHorses, setFatiguedHorses] = useState([]);

  // Currency and betting state
  const [coins, setCoins] = useState(1000);
  const [betAmount, setBetAmount] = useState(0);
  const [betHorse, setBetHorse] = useState(null);
  const [betEnabled, setBetEnabled] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedHorseForLabyrinth, setSelectedHorseForLabyrinth] = useState(null);
  const [recentlyUnlockedSpecialHorse, setRecentlyUnlockedSpecialHorse] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);

  // Apply theme fonts using CSS classes
  useEffect(() => {
    const rootElement = document.getElementById('root');
    const bodyElement = document.body;
    
    // Remove all theme font classes
    ['theme-retro', 'theme-arcade', 'theme-alternative', 'theme-saturday'].forEach(className => {
      rootElement?.classList.remove(className);
      bodyElement.classList.remove(className);
    });
    
    // Add the current theme's font class
    const themeClass = `theme-${currentTheme}`;
    rootElement?.classList.add(themeClass);
    bodyElement.classList.add(themeClass);
    
    console.log('Applied theme class:', themeClass, 'to theme:', currentTheme);
  }, [currentTheme]);
  const [horseInventories, setHorseInventories] = useState({});
  const [horseSkills, setHorseSkills] = useState({});
  const [horseSkillPoints, setHorseSkillPoints] = useState({});
  const [researchPoints, setResearchPoints] = useState(0);
  const [customHorseNames, setCustomHorseNames] = useState({});
  const [horseCareStats, setHorseCareStats] = useState({}); // Store care stats by horse index
  const [unlockedMazes, setUnlockedMazes] = useState({ standard: true });
  const [dayCount, setDayCount] = useState(1);
  const [stableGameTime, setStableGameTime] = useState(0);
  const [unlockedSongs, setUnlockedSongs] = useState({ 'THEME SONG': true }); // Theme song is unlocked by default
  const [nestEgg, setNestEgg] = useState(null); // Dragon egg in nest: { placedOn: timestamp, daysRemaining: number }
  const [selectedGrazingHorses, setSelectedGrazingHorses] = useState([]); // Array of horse IDs selected for grazing

  // Progress tracking for special unlocks
  const [specialUnlockProgress, setSpecialUnlockProgress] = useState({
    win_streak: 0,
    current_win_streak: 0,
    perfect_bet: 0,
    current_bet_streak: 0,
    best_time: null,
    care_count: 0,
    labyrinth_completions: 0,
    unlocked_songs_count: 0,
    dragon_hatches: 0
  });

  // Horse avatars can now be custom images located in the `public` folder.
  const horseAvatars = [
    "/horses/horse1.png",
    "/horses/horse2.png",
    "/horses/horse3.png",
    "/horses/robohorse.png",
    "/horses/horse4.png",
    "/horses/horse5.png",
    "/horses/luffyhorse.png",
    "/horses/humpyhorse.png",
    "/horses/narutohorse.png",
    "/horses/unicorn.png",
    "/horses/xenohorse.png",
    "/horses/2horse.png",
    "/horses/trojanhorse.png",
    "/horses/tallhorse.png",
    "/horses/motohorse.png",
    "/horses/ghosthorse.png",
    "/horses/centaurhorse.png",
    "/horses/burgerhorse.png",
    "/horses/businesshorse.png",
    "/horses/biblicallyaccuratehorse.png",
    "/horses/horsecar.png",
    "/horses/Picassohorse.png",
    "/horses/pinatahorse.png",
    "/horses/astrohorse.png",
    "/horses/barthorse.png",
    "/horses/beehorse.png",
    "/horses/cathorse.png",
    "/horses/clownhorse.png",
    "/horses/cthuluhorse.png",
    "/horses/donkeyhorse.png",
    "/horses/duckyhorse.png",
    "/horses/medusahorse.png",
    "/horses/minotaurhorse.png",
    "/horses/ponyhorse.png",
    "/horses/predatorhorse.png",
    "/horses/sharkhorse.png",
    "/horses/skellyhorse.png",
    "/horses/Chainsawhorse.png",
    "/horses/Clockhorse.png",
    "/horses/Crocohorse.png",
    "/horses/Noodlehorse.png",
    "/horses/Shadowhorse.png",
    "/horses/cutedragonhorse.png",
    "/horses/fairyhorse.png",
    "/horses/fiercedragonhorse.png",
    "/horses/magicalgirlhorse.png",
    "/horses/scarecrowhorse.png",
  ];

  const [unlockedHorses, setUnlockedHorses] = useState(
    horseAvatars.map((_, index) => index < 5)
  );

  const [shuffledAvatars, setShuffledAvatars] = useState(() => {
    const initialUnlocked = horseAvatars.filter((_, index) => index < 5);
    // Inline shuffle since shuffleArray isn't defined yet at this point
    const shuffled = [...initialUnlocked];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  // Check if special unlock criteria are met
  const checkSpecialUnlock = (type, progress, requirement = null) => {
    switch(type) {
      case 'win_streak':
        return progress.current_win_streak >= 3;
      case 'perfect_bet':
        return progress.current_bet_streak >= 5;
      case 'speed_demon':
        return progress.best_time && progress.best_time <= 25;
      case 'caretaker':
        return progress.care_count >= 50;
      case 'labyrinth_explorer':
        return progress.labyrinth_completions >= 10;
      case 'music_lover':
        return progress.unlocked_songs_count >= 6;
      case 'dragon_hatch':
        return (Number(progress.dragon_hatches) || 0) >= (requirement || 1);
      default:
        return false;
    }
  };

  // Update progress and check for unlocks
  const updateSpecialProgress = (type, value = 1) => {
    setSpecialUnlockProgress((prev) => {
      const updated = { ...prev };
      
      switch(type) {
        case 'race_win':
          updated.current_win_streak += value;
          updated.win_streak = Math.max(updated.win_streak, updated.current_win_streak);
          break;
        case 'race_lose':
          updated.current_win_streak = 0;
          break;
        case 'bet_win':
          updated.current_bet_streak += value;
          updated.perfect_bet = Math.max(updated.perfect_bet, updated.current_bet_streak);
          break;
        case 'bet_lose':
          updated.current_bet_streak = 0;
          break;
        case 'race_time':
          if (!updated.best_time || value < updated.best_time) {
            updated.best_time = value;
          }
          break;
        case 'care_action':
          updated.care_count += value;
          break;
        case 'labyrinth_completion':
          updated.labyrinth_completions += value;
          break;
        case 'song_unlock':
          updated.unlocked_songs_count = Object.keys(unlockedSongs).length;
          break;
        case 'dragon_hatch':
          updated.dragon_hatches = (Number(updated.dragon_hatches) || 0) + value;
          break;
      }

      // Unlock checking is now handled by useEffect hooks that watch specialUnlockProgress
      return updated;
    });
  };

  const handleUnlockHorse = (index, cost) => {
    if (unlockedHorses[index] || (Number(coins) || 0) < cost) return;
    setCoins((prev) => (Number(prev) || 0) - cost);
    setUnlockedHorses((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  const handleUnlockSong = (songName) => {
    setUnlockedSongs((prev) => ({
      ...prev,
      [songName]: true
    }));
    updateSpecialProgress('song_unlock');
  };

  const handleRemoveItemFromHorseInventory = (horseId, itemName) => {
    setHorseInventories((prev) => ({
      ...prev,
      [horseId]: (prev[horseId] || []).filter((item) => item.name !== itemName)
    }));
  };

  const handleRemoveItemFromHorseInventoryByIndex = (horseId, itemIndex) => {
    setHorseInventories((prev) => {
      const currentItems = prev[horseId] || [];
      if (itemIndex < 0 || itemIndex >= currentItems.length) {
        console.warn('Invalid item index:', itemIndex);
        return prev;
      }
      
      const newItems = currentItems.filter((_, index) => index !== itemIndex);
      return {
        ...prev,
        [horseId]: newItems
      };
    });
  };

  const handleRemoveItemFromHorseInventoryById = (horseId, itemId) => {
    setHorseInventories((prev) => {
      const currentItems = prev[horseId] || [];
      const newItems = currentItems.filter((item) => item.id !== itemId);
      return {
        ...prev,
        [horseId]: newItems
      };
    });
  };

  const handleAddItemToHorseInventory = (horseId, item) => {
    setHorseInventories((prev) => {
      const existingItems = prev[horseId] || [];
      return {
        ...prev,
        [horseId]: [...existingItems, { 
          ...item, 
          id: Date.now() + Math.random(), // Simple unique ID
          addedAt: Date.now() 
        }]
      };
    });
  };

  // Update shuffled avatars when unlocked horses change
  useEffect(() => {
    const available = horseAvatars.filter((_, index) => unlockedHorses[index]);
    setShuffledAvatars(available);
  }, [unlockedHorses]);


  // Check for special unlocks when entering stable screen or when progress changes
  useEffect(() => {
    if (showStable && !recentlyUnlockedSpecialHorse) {
      Object.keys(specialUnlockCriteria).forEach(horseIndex => {
        const index = parseInt(horseIndex);
        const criteria = specialUnlockCriteria[index];
        
        if (!unlockedHorses[index] && checkSpecialUnlock(criteria.type, specialUnlockProgress, criteria.requirement)) {
          setUnlockedHorses((prev) => {
            const newUnlocked = [...prev];
            newUnlocked[index] = true;
            return newUnlocked;
          });
          
          const unlockData = {
            index: index,
            avatar: horseAvatars[index],
            name: horseNames[index],
            personality: horsePersonalities[index],
            criteria: criteria
          };
          setRecentlyUnlockedSpecialHorse(unlockData);
          
          // Only unlock one horse at a time
          return;
        }
      });
    }
  }, [showStable, specialUnlockProgress, unlockedHorses, recentlyUnlockedSpecialHorse]);

  // Also check for unlocks whenever specialUnlockProgress changes, regardless of screen
  useEffect(() => {
    if (!recentlyUnlockedSpecialHorse) {
      Object.keys(specialUnlockCriteria).forEach(horseIndex => {
        const index = parseInt(horseIndex);
        const criteria = specialUnlockCriteria[index];
        
        if (!unlockedHorses[index] && checkSpecialUnlock(criteria.type, specialUnlockProgress, criteria.requirement)) {
          setUnlockedHorses((prev) => {
            const newUnlocked = [...prev];
            newUnlocked[index] = true;
            return newUnlocked;
          });
          
          const unlockData = {
            index: index,
            avatar: horseAvatars[index],
            name: horseNames[index],
            personality: horsePersonalities[index],
            criteria: criteria
          };
          setRecentlyUnlockedSpecialHorse(unlockData);
          
          // Only unlock one horse at a time
          return;
        }
      });
    }
  }, [specialUnlockProgress]);


const horseNames = [
    "Shadowfax",
    "Seabiscuit",
    "Silver Blaze",
    "Comet",
    "Blaze",
    "Spirit",
    "Eclipse",
    "Whisper",
    "Storm",
    "Phantom",
    "Flash",
    "Bolt",
    "Majesty",
    "Thunder",
    "Lightning",
    "Mystic",
    "Blizzard",
    "Tornado",
    "Hurricane",
    "Inferno",
    "Mirage",
    "Nebula",
    "Stardust",
    "Cosmic",
    "Bart",
    "Buzzer",
    "Whiskers",
    "Jester",
    "Tentacles",
    "Donkey",
    "Rubber",
    "Gorgon",
    "Labyrinth",
    "Pony",
    "Hunter",
    "Jaws",
    "Bones",
    "Chainsaw",
    "Clockwork",
    "Crocs",
    "Noodles",
    "Shadow",
    "Cuddles",
    "Fairy",
    "Fierce",
    "Magical Girl",
    "Scarecrow",
];

const horsePersonalities = [
  "Wise mentor of the herd.",
  "Underdog with a big heart.",
  "Mystery-loving sleuth.",
  "Fast and curious traveler.",
  "Fiery spirit with boundless energy.",
  "Free soul who roams the plains.",
  "Quiet but always observant.",
  "Shy friend who trusts few.",
  "Thrives in wild weather.",
  "Appears and vanishes without a sound.",
  "Always first out of the gate.",
  "Quick thinker and quicker runner.",
  "Regal and dignified presence.",
  "Loud, powerful, and brave.",
  "Strikes with sudden bursts.",
  "Seeker of hidden paths.",
  "Cool-headed in any race.",
  "Whirlwind of excitement.",
  "Relentless force on the track.",
  "Burns with competitive drive.",
  "Hard to catch and harder to predict.",
  "Dreamy star-gazer.",
  "Explorer of cosmic distances.",
  "Space traveler with stellar speed.",
  "Yellow speedster with a donut obsession.",
  "Buzzes around with honey-powered energy.",
  "Purrs through races with feline grace.",
  "Brings laughter to every competition.",
  "Ancient terror with tentacled might.",
  "Stubborn but surprisingly fast.",
  "Squeaks through tight spots.",
  "Stone-cold stare freezes competition.",
  "Maze-master with horn expertise.",
  "Small but mighty competitor.",
  "Hunts victory with predatory instinct.",
  "Fin-ished opponents with aquatic speed.",
  "Rattles bones on the racetrack.",
  "Cuts through competition with mechanical precision.",
  "Ticks towards victory with perfect timing.",
  "Snaps at the finish line with reptilian power.",
  "Slurps through races with flexible form.",
  "Lurks in darkness, striking at the perfect moment.",
  "Adorably fierce with dragon-like determination.",
  "Sprinkles magic dust on every stride.",
  "Breathes fire and dominates the track.",
  "Transforms racing into pure enchantment.",
  "Guards the finish line with rustic charm.",
];

// Special unlock criteria for horses
// Each horse can have either a coin cost OR special criteria (but not both)
const specialUnlockCriteria = {
  5: { // First special horse (index 5)
    type: 'win_streak',
    requirement: 3,
    name: 'Win Streak Champion',
    description: 'Win 3 races in a row',
    icon: '🏆'
  },
  6: { // Second special horse (index 6)
    type: 'perfect_bet',
    requirement: 5,
    name: 'Master Gambler',
    description: 'Win 5 bets in a row',
    icon: '🎯'
  },
  7: { // Third special horse (index 7)
    type: 'speed_demon',
    requirement: 8.0,
    name: 'Speed Demon',
    description: 'Complete a race in under 8 seconds',
    icon: '⚡'
  },
  8: { // Fourth special horse (index 8)
    type: 'caretaker',
    requirement: 50,
    name: 'Master Caretaker',
    description: 'Care for horses 50 times',
    icon: '🍎'
  },
  9: { // Fifth special horse (index 9)
    type: 'labyrinth_explorer',
    requirement: 10,
    name: 'Labyrinth Explorer',
    description: 'Complete labyrinth 10 times',
    icon: '🏰'
  },
  10: { // Sixth special horse (index 10)
    type: 'music_lover',
    requirement: 6,
    name: 'Music Lover',
    description: 'Unlock all 6 songs',
    icon: '🎵'
  },
  42: { // Cuddles - Dragon Horse (index 42)
    type: 'dragon_hatch',
    requirement: 1,
    name: 'Hatchling',
    description: 'This horse hatches from an egg?',
    icon: '🥚'
  },
  44: { // Fierce - Dragon Horse (index 44)
    type: 'dragon_hatch',
    requirement: 2,
    name: 'Hatchling',
    description: 'This horse hatches from an egg?',
    icon: '🥚'
  }
};

  // Load saved game data on startup
  useEffect(() => {
    if (gameStorage.isAvailable()) {
      const savedData = gameStorage.load();
      
      console.log('🏠 App - Raw savedData from localStorage:', savedData);
      console.log('🏠 App - savedData.horseSkills:', savedData?.horseSkills);
      console.log('🏠 App - savedData.horseSkillPoints:', savedData?.horseSkillPoints);
      
      if (savedData.coins !== undefined) {
        setCoins(Number(savedData.coins) || 1000);
      }
      
      if (savedData.fastestTime !== null) {
        setFastestTime(savedData.fastestTime);
      }
      
      if (savedData.history && savedData.history.length > 0) {
        setHistory(savedData.history);
      }
      
      if (savedData.unlockedHorses && Array.isArray(savedData.unlockedHorses)) {
        setUnlockedHorses(savedData.unlockedHorses);
      }
      
      if (savedData.horseInventories && typeof savedData.horseInventories === 'object') {
        setHorseInventories(savedData.horseInventories);
      }
      
      if (savedData.horseSkills && typeof savedData.horseSkills === 'object') {
        console.log('🏠 App - Loading horseSkills from save:', savedData.horseSkills);
        setHorseSkills(savedData.horseSkills);
      }
      
      if (savedData.horseSkillPoints && typeof savedData.horseSkillPoints === 'object') {
        console.log('🏠 App - Loading horseSkillPoints from save:', savedData.horseSkillPoints);
        setHorseSkillPoints(savedData.horseSkillPoints);
      }
      
      if (savedData.horseCareStats && typeof savedData.horseCareStats === 'object') {
        console.log('🏠 App - Loading horseCareStats from save:', savedData.horseCareStats);
        setHorseCareStats(savedData.horseCareStats);
      }
      
      if (typeof savedData.researchPoints === 'number') {
        setResearchPoints(savedData.researchPoints);
      }
      
      if (savedData.customHorseNames && typeof savedData.customHorseNames === 'object') {
        setCustomHorseNames(savedData.customHorseNames);
      }
      
      if (savedData.unlockedMazes && typeof savedData.unlockedMazes === 'object') {
        setUnlockedMazes(savedData.unlockedMazes);
      }
      
      if (typeof savedData.dayCount === 'number' && savedData.dayCount >= 1) {
        setDayCount(savedData.dayCount);
      }
      
      if (typeof savedData.stableGameTime === 'number' && savedData.stableGameTime >= 0) {
        setStableGameTime(savedData.stableGameTime);
      }
      
      if (savedData.currentTheme && themeUtils.getThemeNames().includes(savedData.currentTheme)) {
        setCurrentTheme(savedData.currentTheme);
      }
      
      if (savedData.unlockedSongs && typeof savedData.unlockedSongs === 'object') {
        // Ensure Theme Song is always unlocked and only keep legitimately unlocked songs
        const cleanedSongs = {
          'THEME SONG': true,
          ...Object.fromEntries(
            Object.entries(savedData.unlockedSongs).filter(([song]) => 
              song === 'THEME SONG' || ['WILD MANE', 'WILD AND UNBRIDLED', 'CLOVER'].includes(song)
            )
          )
        };
        console.log('🎵 Loading saved songs:', cleanedSongs);
        setUnlockedSongs(cleanedSongs);
      } else {
        console.log('🎵 No saved songs found, starting with Theme Song only');
      }

      // Load nest egg data
      if (savedData.nestEgg && typeof savedData.nestEgg === 'object') {
        console.log('🥚 Loading saved nest egg:', savedData.nestEgg);
        setNestEgg(savedData.nestEgg);
      } else {
        console.log('🥚 No saved nest egg found');
      }

      // Load selected grazing horses
      if (savedData.selectedGrazingHorses && Array.isArray(savedData.selectedGrazingHorses)) {
        console.log('🐴 Loading saved grazing horses:', savedData.selectedGrazingHorses);
        setSelectedGrazingHorses(savedData.selectedGrazingHorses);
      } else {
        console.log('🐴 No saved grazing horses found');
      }
      
      // Load special unlock progress
      if (savedData.specialUnlockProgress && typeof savedData.specialUnlockProgress === 'object') {
        // Merge with defaults to ensure all fields exist
        const defaultProgress = {
          win_streak: 0,
          current_win_streak: 0,
          perfect_bet: 0,
          current_bet_streak: 0,
          best_time: null,
          care_count: 0,
          labyrinth_completions: 0,
          unlocked_songs_count: 0,
          dragon_hatches: 0
        };
        
        const mergedProgress = {
          ...defaultProgress,
          ...savedData.specialUnlockProgress,
          // Ensure numeric fields are properly converted
          dragon_hatches: Number(savedData.specialUnlockProgress.dragon_hatches) || 0,
          care_count: Number(savedData.specialUnlockProgress.care_count) || 0,
          labyrinth_completions: Number(savedData.specialUnlockProgress.labyrinth_completions) || 0,
          unlocked_songs_count: Number(savedData.specialUnlockProgress.unlocked_songs_count) || 0
        };
        
        setSpecialUnlockProgress(mergedProgress);
      }
      
      console.log('Game data loaded successfully');
    } else {
      console.warn('localStorage not available, game progress will not be saved');
    }
    
    setGameLoaded(true);
    // Add a small delay to ensure state updates from loading are complete before enabling saves
    setTimeout(() => setInitialLoadComplete(true), 100);
  }, []);

  // Auto-save game state when key values change (but not on initial load)
  useEffect(() => {
    console.log(`💾 Save useEffect triggered. gameLoaded: ${gameLoaded}, initialLoadComplete: ${initialLoadComplete}`);
    if (gameLoaded && initialLoadComplete && gameStorage.isAvailable()) {
      const gameState = {
        coins,
        unlockedHorses,
        fastestTime,
        history,
        horseInventories,
        horseSkills,
        horseSkillPoints,
        researchPoints,
        customHorseNames,
        horseCareStats,
        unlockedMazes,
        dayCount,
        stableGameTime,
        currentTheme,
        unlockedSongs,
        nestEgg,
        selectedGrazingHorses,
        specialUnlockProgress
      };
      
      console.log('🏠 App - Saving game state:', gameState);
      console.log('🏠 App - horseSkills being saved:', horseSkills);
      console.log('🏠 App - horseSkillPoints being saved:', horseSkillPoints);
      console.log('🏆 App - specialUnlockProgress being saved:', specialUnlockProgress);
      console.log('🏆 App - care_count being saved:', specialUnlockProgress?.care_count);
      
      gameStorage.save(gameState);
      
      // Verify what was actually saved
      const savedCheck = gameStorage.load();
      console.log('🏆 Verification - what was actually saved to localStorage:', savedCheck?.specialUnlockProgress);
      console.log('🏆 Verification - care_count in localStorage:', savedCheck?.specialUnlockProgress?.care_count);
    }
  }, [coins, unlockedHorses, fastestTime, history, horseInventories, horseSkills, horseSkillPoints, researchPoints, customHorseNames, horseCareStats, unlockedMazes, dayCount, stableGameTime, currentTheme, unlockedSongs, nestEgg, selectedGrazingHorses, specialUnlockProgress, gameLoaded, initialLoadComplete]);

  // Handle betting logic when a winner is declared
  useEffect(() => {
    if (winnerIndex !== null && betHorse !== null && betAmount > 0) {
      console.log('🎰 Betting logic triggered:', { winnerIndex, betHorse, betAmount, coins });
      
      if (winnerIndex === betHorse) {
        // Player won the bet
        const multiplier = Math.min(3, Math.max(1.5, itemCount * 0.5));
        const payout = Math.floor(betAmount * multiplier);
        console.log('🎉 Player won bet! Payout:', payout);
        setCoins((c) => (Number(c) || 0) + payout);
        updateSpecialProgress('bet_win');
      } else {
        // Player lost the bet
        console.log('😔 Player lost bet, losing:', betAmount);
        setCoins((c) => Math.max(0, (Number(c) || 0) - betAmount));
        updateSpecialProgress('bet_lose');
      }
    }
  }, [winnerIndex, betHorse, betAmount, itemCount]);

  // Track race wins/losses and race times for special unlocks
  useEffect(() => {
    if (winner && winnerIndex !== null) {
      // Check if any of the player's horses won (assuming first 5 horses are player's)
      const playerWon = winnerIndex < 5; // Adjust this logic based on your game rules
      
      if (playerWon) {
        updateSpecialProgress('race_win');
      } else {
        updateSpecialProgress('race_lose');
      }
      
      // Track best race time
      if (raceTime > 0) {
        updateSpecialProgress('race_time', raceTime);
      }
    }
  }, [winner, winnerIndex, raceTime]);

  // Enhanced preloading with loading state
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = horseAvatars.length;

    const preloadPromises = horseAvatars.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          resolve(src);
        };
        img.onerror = () => {
          loadedCount++;
          resolve(src); // Still resolve to not block loading
        };
        img.src = src;
      });
    });

    Promise.all(preloadPromises).then(() => {
      setImagesLoaded(true);
    });

    // Also add preload links for browser optimization
    const preloadLinks = [];
    horseAvatars.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      link.dataset.horse = "true";
      document.head.appendChild(link);
      preloadLinks.push(link);
    });

    return () => {
      preloadLinks.forEach((link) => link.remove());
    };
  }, []);

  // Weather effects configuration
  const weatherEffects = {
    sunny: {
      name: "Sunny",
      emoji: "☀️",
      description: "Perfect racing conditions",
      background: "from-yellow-200 via-orange-200 to-yellow-300",
      trackColor: "from-green-400 to-green-600",
      speedMultiplier: 1.0,
      particles: "☀️",
      particleCount: 3,
    },
    rainy: {
      name: "Rainy",
      emoji: "🌧️",
      description: "Slippery track conditions",
      background: "from-gray-300 via-blue-200 to-gray-400",
      trackColor: "from-green-600 to-green-800",
      speedMultiplier: 0.85,
      particles: "💧",
      particleCount: 8,
    },
    muddy: {
      name: "Muddy",
      emoji: "🟤",
      description: "Heavy going, tough conditions",
      background: "from-amber-200 via-yellow-300 to-amber-300",
      trackColor: "from-amber-600 to-amber-800",
      speedMultiplier: 0.75,
      particles: "💨",
      particleCount: 5,
    },
    snowy: {
      name: "Snowy",
      emoji: "❄️",
      description: "Winter wonderland racing",
      background: "from-blue-100 via-white to-blue-200",
      trackColor: "from-blue-300 to-blue-500",
      speedMultiplier: 0.8,
      particles: "❄️",
      particleCount: 12,
    },
    night: {
      name: "Night",
      emoji: "🌙",
      description: "Racing under the stars",
      background: "from-purple-900 via-blue-900 to-black",
      trackColor: "from-gray-600 to-gray-800",
      speedMultiplier: 0.95,
      particles: "⭐",
      particleCount: 6,
    },
    windy: {
      name: "Windy",
      emoji: "🍃",
      description: "Autumn leaves swirling",
      background: "from-orange-200 via-red-200 to-yellow-200",
      trackColor: "from-green-500 to-green-700",
      speedMultiplier: 0.9,
      particles: "🍂",
      particleCount: 10,
    },
  };

  const commentaryIntervalRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const raceStartTime = useRef(null);
  const trackContainerRef = useRef(null);
  const racePhaseRef = useRef(0);
  const lastLeaderRef = useRef(-1);
  const dramaMomentRef = useRef(0);
  const bellSoundRef = useRef(null);
  const cheerSoundRef = useRef(null);
  const usedCommentaryRef = useRef(new Set());
  const lastCommentaryRef = useRef("");

  const getFixedTrackLength = (distance) => {
    // Always return Classic race length (formerly marathon)
    return 4800;
  };

  const [trackLength, setTrackLength] = useState(getFixedTrackLength("long"));

  useEffect(() => {
    setTrackLength(getFixedTrackLength(raceDistance));
  }, [raceDistance]);

  const maxItems = 6;

  const commentaryPhrases = {
    start: [
      "And they're off!",
      "The race begins!",
      "They're out of the gate!",
      "Here we go!",
      "The starting flag drops!",
      "They're away!",
    ],
    early: [
      "Early positions forming!",
      "It's still anyone's race!",
      "The pack is tight!",
      "No clear leader yet!",
      "They're bunched together at the start!",
      "Still settling into rhythm!",
      "The field is wide open!",
    ],
    middle: [
      "Neck and neck!",
      "What a battle!",
      "The pace is heating up!",
      "They're bunched together!",
      "It's getting intense!",
      "Look at that surge!",
      "A new challenger emerges!",
      "The field is tightening!",
      "What an exciting race!",
      "They're matching each other stride for stride!",
      "The competition is fierce!",
      "No one wants to give an inch!",
    ],
    dramatic: [
      "Unbelievable comeback!",
      "From last to first!",
      "What a charge!",
      "They're making their move!",
      "This is incredible!",
      "The dark horse is rising!",
      "A stunning turnaround!",
      "Cleared that hurdle beautifully!",
      "Oh no! A stumble at the hurdle!",
      "What a recovery!",
      "The marathon is taking its toll!",
      "Incredible endurance on display!",
      "That's a phenomenal burst of speed!",
      "They're overtaking on the outside!",
      "What heart! What determination!",
    ],
    final: [
      "Coming down to the wire!",
      "Photo finish incoming!",
      "The crowd is on their feet!",
      "This is too close to call!",
      "What a finish!",
      "They're flying to the line!",
      "One final push to victory!",
      "The finish line approaches!",
      "Who will take it?",
      "It's anyone's race!",
    ],
    winner: [
      "We have a winner!",
      "What a race!",
      "Incredible finish!",
      "Victory is decided!",
      "They've done it!",
      "What a champion!",
    ],
    weather: {
      rainy: ["The rain is making this treacherous!", "Slipping and sliding!"],
      muddy: ["The mud is slowing them down!", "Heavy going out there!"],
      snowy: ["Fighting through the snow!", "Winter conditions are tough!"],
      windy: ["The wind is picking up!", "Leaves swirling everywhere!"],
      night: ["Racing under the stars!", "What a beautiful night race!"],
    },
  };

  const horseNameCategories = {
    Default: horseNames,
    Takeaways: [
      "Fish & Chips",
      "Chinese",
      "Indian Curry",
      "Sushi",
      "Pizza",
      "Burgers",
      "Kebabs",
      "Thai Food",
      "Fried Chicken",
      "Mexican",
      "Noodles",
      "Doner",
      "Pho",
      "Dim Sum",
      "Wings",
      "BBQ Ribs",
      "Tandoori",
      "Gyros",
      "Falafel",
      "Ramen",
    ],
    Films: [
      "The Godfather",
      "Inception",
      "Shawshank",
      "The Matrix",
      "Pulp Fiction",
      "Fight Club",
      "The Dark Knight",
      "Forrest Gump",
      "Interstellar",
      "Parasite",
      "Gladiator",
      "Titanic",
      "The Departed",
      "La La Land",
      "Goodfellas",
      "Whiplash",
      "Casablanca",
      "Joker",
      "Amélie",
      "No Country for Old Men",
    ],
    "Yes or No": [
      "Yes",
      "No",
    ],
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateRandomWeather = () => {
    const weatherTypes = Object.keys(weatherEffects);
    const randomWeather =
    weatherTypes[Math.floor(rngRef.current() * weatherTypes.length)];
    setCurrentWeather(weatherEffects[randomWeather]);
  };

  useEffect(() => {
    raceSoundRef.current = new Audio("/run.mp3");
    bellSoundRef.current = new Audio("/startingpistol.mp3");
    cheerSoundRef.current = new Audio("/cheer.mp3");

    raceSoundRef.current.loop = true;
    raceSoundRef.current.volume = muted ? 0 : 1;

    bellSoundRef.current.volume = muted ? 0 : 1;
    cheerSoundRef.current.volume = muted ? 0 : 1;
  }, []);

  useEffect(() => {
    const vol = muted ? 0 : 1;
    if (raceSoundRef.current) raceSoundRef.current.volume = vol;
    if (bellSoundRef.current) bellSoundRef.current.volume = vol;
    if (cheerSoundRef.current) cheerSoundRef.current.volume = vol;
  }, [muted]);

  const [shuffledHorseNames, setShuffledHorseNames] =
    useState(horseNameCategories);

  useEffect(() => {
    const shuffled = Object.fromEntries(
      Object.entries(horseNameCategories).map(([key, names]) => [
        key,
        key === "Default" ? names : shuffleArray(names), // Don't shuffle Default theme
      ])
    );
    setShuffledHorseNames(shuffled);
  }, []);

  const handleCountChange = (e) => {
    const count = Math.min(
      maxItems,
      Math.max(0, parseInt(e.target.value, 10) || 0)
    );
    setItemCount(count);
    setItems(Array(count).fill(""));
    setWinner(null);
    setWinnerIndex(null);
    setIsRacing(false);
    setCommentary("");
    setPositions(Array(count).fill(0));
    setRaceTime(0);
    setBetHorse(null);
    setBetAmount(0);
    setBetEnabled(false);
    cancelAnimationFrame(animationFrameIdRef.current);
    clearInterval(commentaryIntervalRef.current);
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const getHorseName = (item, index) => {
    // If user has entered a custom name in the input field, use that
    if (item.trim()) {
      return item.trim();
    }
    
    // Check if there's a saved custom name for this horse avatar
    const currentAvatar = shuffledAvatars[index % shuffledAvatars.length];
    const avatarIndex = horseAvatars.findIndex(avatar => avatar === currentAvatar);
    if (customHorseNames[avatarIndex]) {
      return customHorseNames[avatarIndex];
    }
    
    // For Default theme, map avatar to its specific name
    if (nameCategory === "Default") {
      return horseNames[avatarIndex] || horseNames[index % horseNames.length];
    }
    
    // For other themes, use shuffled names
    const categoryList = shuffledHorseNames[nameCategory] || horseNameCategories["Default"];
    return categoryList[index % categoryList.length];
  };

  const goToRaceScreen = () => {
    setShowRaceScreen(true);
    setWinner(null);
    setWinnerIndex(null);
    setIsRacing(false);
    setCommentary("");
    setPositions(Array(itemCount).fill(0));
    setRaceTime(0);
    setCountdown(null);
    racePhaseRef.current = 0;
    lastLeaderRef.current = -1;
    dramaMomentRef.current = 0;
    usedCommentaryRef.current.clear();
    lastCommentaryRef.current = "";
  };

   const startCountdown = (seed = Date.now()) => {
    let count = 3;
    setCountdown(count);
    const countdownInterval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        startRace(seed);
      } else {
        if (bellSoundRef.current) {
          bellSoundRef.current.currentTime = 0;
          bellSoundRef.current
            .play()
            .catch((e) => console.warn("Bell sound failed:", e));
        }
        setCountdown(count);
      }
    }, 1000);
  };

  const getRaceSettings = (distance) => {
    // Only one race type now - always return Classic (formerly "long") settings
    const settings = {
      baseSpeed: 0.0008,
      speedVariation: 0.0006, // Reduced from 0.0015 for closer racing
      surgeIntensity: 0.004, // Keep surge strength high when it happens
      surgeFrequency: 0.22, // Reduced dramatically for more selective surging
      comebackChance: 0.7, // Keep high for exciting lead changes
      dramaMoments: 8, // Keep high for excitement
      staminaFactor: 0.35, // Increased to show more fatigue in long races
      packTightness: 0.98,
    };
    
    if (currentWeather) {
      const weatherSettings = { ...settings };
      weatherSettings.baseSpeed *= currentWeather.speedMultiplier;
      return weatherSettings;
    }
    return settings;
  };

  const getCommentaryForPhase = (phase) => {
    let phrases = commentaryPhrases[phase] || commentaryPhrases.middle;

    // Add weather-specific commentary if applicable
    if (
      currentWeather &&
      commentaryPhrases.weather[currentWeather.name.toLowerCase()]
    ) {
       if (rngRef.current() < 0.3) {
        phrases = [
          ...phrases,
          ...commentaryPhrases.weather[currentWeather.name.toLowerCase()],
        ];
      }
    }
    
    // Filter out already used phrases - never repeat during same race
    const availablePhrases = phrases.filter(
      (phrase) =>
        !usedCommentaryRef.current.has(phrase) &&
        phrase !== lastCommentaryRef.current
    );

    // If we've exhausted all phrases in this category, try other categories
    if (availablePhrases.length === 0) {
      // Get phrases from all other categories that haven't been used
      const allCategories = ['early', 'middle', 'dramatic', 'final'];
      const alternativePhases = allCategories
        .filter(cat => cat !== phase)
        .flatMap(cat => commentaryPhrases[cat] || [])
        .filter(phrase => !usedCommentaryRef.current.has(phrase) && phrase !== lastCommentaryRef.current);
      
      if (alternativePhases.length > 0) {
        const selectedPhrase = alternativePhases[Math.floor(rngRef.current() * alternativePhases.length)];
        usedCommentaryRef.current.add(selectedPhrase);
        lastCommentaryRef.current = selectedPhrase;
        return selectedPhrase;
      }
      
      // If absolutely no phrases left, create a dynamic one
      const dynamicPhrases = [
        "What an incredible race!",
        "The excitement continues!",
        "This is pure racing magic!",
        "Unbelievable action on the track!",
        "The competition is fierce out there!"
      ];
      const unusedDynamic = dynamicPhrases.filter(phrase => 
        !usedCommentaryRef.current.has(phrase) && phrase !== lastCommentaryRef.current
      );
      if (unusedDynamic.length > 0) {
        const selectedPhrase = unusedDynamic[Math.floor(rngRef.current() * unusedDynamic.length)];
        usedCommentaryRef.current.add(selectedPhrase);
        lastCommentaryRef.current = selectedPhrase;
        return selectedPhrase;
      }
      
      // Absolute fallback - should rarely happen
      return "Racing continues...";
    }

    const selectedPhrase =
      availablePhrases[Math.floor(rngRef.current() * availablePhrases.length)];
    usedCommentaryRef.current.add(selectedPhrase);
    lastCommentaryRef.current = selectedPhrase;

    return selectedPhrase;
  };

  const originalStartRace = (seed) => {
    rngRef.current = createSeededRng(seed);
    setIsRacing(true);
    if (raceSoundRef.current) {
      raceSoundRef.current.currentTime = 0;
      raceSoundRef.current
        .play()
        .catch((e) => console.warn("Race sound playback failed:", e));
    }
    setWinner(null);
    setWinnerIndex(null);

    const startPhrases = commentaryPhrases.start;
    setCommentary(
      startPhrases[Math.floor(rngRef.current() * startPhrases.length)]
    );

    setPositions(Array(itemCount).fill(0));
    setRaceTime(0);
    raceStartTime.current = Date.now();
    racePhaseRef.current = 0;
    lastLeaderRef.current = -1;
    dramaMomentRef.current = 0;
    usedCommentaryRef.current.clear();

    const settings = getRaceSettings(raceDistance);

    const timerInterval = setInterval(() => {
      if (raceStartTime.current) {
        setRaceTime((Date.now() - raceStartTime.current) / 1000);
      }
    }, 100);

    let commentaryCounter = 0;
    commentaryIntervalRef.current = setInterval(() => {
      const progress = Math.max(...positionsRef.current);
      let phase = "middle";
      commentaryCounter++;

      if (progress < 0.15) phase = "early";
      else if (progress > 0.85) phase = "final";
      else if (dramaMomentRef.current > 0) {
        phase = "dramatic";
        dramaMomentRef.current--;
      }

      if (commentaryCounter % 3 === 0 && phase !== "dramatic") {
        phase = "middle";
      }

      const next = getCommentaryForPhase(phase);
      setCommentary(next);
    }, 1800);

    let winnerDeclared = false;
    let finished = false;


    const horseProfiles = Array(itemCount)
      .fill(0)
      .map(() => {
        const baseSpeed = settings.baseSpeed + (rngRef.current() - 0.5) * settings.speedVariation;
        return {
          baseSpeed,
          currentSpeed: baseSpeed, // Track current speed for deceleration
          stamina: 0.6 + rngRef.current() * 0.7,
          comebackPotential: rngRef.current(),
          hurdleSkill: 0.3 + rngRef.current() * 0.7,
          surgeCount: 0,
          lastSurge: 0,
          lastSurgeTime: 0, // Track surge timing for cooldown
          isComingBack: false,
          hurdlesCrossed: [],
          isStunned: false,
          stunnedUntil: 0,
          stunnedAtPosition: 0,
          stoppedUntil: 0,
          isSurging: false,
          surgeEndTime: 0,
          isFatigued: false,
          lastHurdleDistance: undefined, // Track distance to current hurdle for mobile collision detection
        };
      });

    const updatePositions = () => {
      let updatedPositions = [];
      setPositions((prevPositions) => {
        if (finished) {
          updatedPositions = prevPositions;
          return prevPositions;
        }

        // Add frame rate protection for mobile devices
        const currentTime = Date.now();
        const deltaTime = currentTime - (updatePositions.lastUpdate || currentTime);
        updatePositions.lastUpdate = currentTime;
        
        // Prevent huge time gaps that could cause collision skipping on mobile
        const cappedDeltaTime = Math.min(deltaTime, 33); // Cap at ~30fps equivalent
        const timeScale = cappedDeltaTime / 16.67; // Normalize to 60fps baseline

        const currentProgress = Math.max(...prevPositions);
        const currentLeader = prevPositions.indexOf(Math.max(...prevPositions));

        if (currentLeader !== lastLeaderRef.current && currentProgress > 0.1) {
          lastLeaderRef.current = currentLeader;
          dramaMomentRef.current = 2;
        }

        updatedPositions = prevPositions.map((pos, idx) => {
          const profile = horseProfiles[idx];
          let speed = profile.baseSpeed; // Back to using base speed for racing

          const currentTime = Date.now();
          
          // Check if horse should be stopped at a hurdle
          if (profile.stoppedUntil && currentTime < profile.stoppedUntil) {
            return pos; // Stay at current position
          } else if (profile.stoppedUntil) {
            profile.stoppedUntil = 0; // Clear stop
          }

          const fatigueEffect =
            1 - pos * (1 - profile.stamina) * settings.staminaFactor;
          speed *= Math.max(fatigueEffect, 0.3);
          
          // Track if horse is heavily fatigued - adjusted threshold for more visible fatigue
          profile.isFatigued = fatigueEffect < 0.85;

          const averageProgress =
            prevPositions.reduce((a, b) => a + b, 0) / prevPositions.length;
          const deviation = pos - averageProgress;
          const packEffect =
            1 - Math.abs(deviation) * (1 - settings.packTightness);
          speed *= Math.max(packEffect, 0.8);
          
          // Aggressive rubber band effect for competitive racing
          const progressDiff = pos - averageProgress;
          
          // Marathon gets extra swing effects for maximum drama
          const isMarathon = raceDistance === "long";
          const marathonMultiplier = isMarathon ? 1.3 : 1.0;
          
          // Strong boost for horses behind
          if (progressDiff < -0.05) {
            speed *= (1.2 * marathonMultiplier); // Extra strong boost in marathons
          } else if (progressDiff < -0.02) {
            speed *= (1.1 * marathonMultiplier); // Enhanced boost for marathons
          }
          
          // Strong slowdown for early leaders
          if (progressDiff > 0.05) {
            speed *= (0.85 / marathonMultiplier); // Extra penalty for marathon leaders
          } else if (progressDiff > 0.02) {
            speed *= (0.92 / marathonMultiplier); // Enhanced penalty for marathon leaders
          }


          const shouldSurge =
            rngRef.current() < settings.surgeFrequency &&
            pos - profile.lastSurge > 0.15 && // Increased distance requirement
            !profile.isStunned &&
            (!profile.lastSurgeTime || Date.now() - profile.lastSurgeTime > 3000); // 3 second cooldown between surges
          if (shouldSurge) {
            const surgeStrength = 0.6 + rngRef.current() * 1.2;
            speed += settings.surgeIntensity * surgeStrength;
            profile.surgeCount++;
            profile.lastSurge = pos;
            profile.lastSurgeTime = Date.now(); // Track when surge happened for cooldown
            profile.isSurging = true;
            profile.surgeEndTime = Date.now() + 800; // Surge effect lasts 0.8 seconds - shorter and more impactful
          }
          
          // Clear surge state if time has passed
          if (profile.isSurging && Date.now() > profile.surgeEndTime) {
            profile.isSurging = false;
          }

          const isLagging = pos < averageProgress - 0.05;
          const shouldComeback =
            isLagging &&
           rngRef.current() <
              settings.comebackChance * profile.comebackPotential &&
            !profile.isStunned;

          if (shouldComeback && !profile.isComingBack) {
            profile.isComingBack = true;
            speed += settings.surgeIntensity * 1.2;
            dramaMomentRef.current = 4;
          }

          if (profile.isComingBack) {
            const comebackBoost = raceDistance === "long" ? 0.6 : 0.2; // Double marathon comeback boost
            speed += settings.surgeIntensity * comebackBoost;
            if (pos > averageProgress + 0.02) { // End comeback sooner for more frequent lead changes
              profile.isComingBack = false;
            }
          }

          const randomFactor = 1 + (rngRef.current() - 0.5) * 0.08;
          speed *= randomFactor;

          let nextPos = Math.max(0, pos + speed);
          if (nextPos > 1) nextPos = 1;
          
          // Simple hurdle check - just stop at hurdle position
          for (const hurdlePercent of settings.hurdles) {
            const hasNotCrossedThisHurdle = !profile.hurdlesCrossed.includes(hurdlePercent);
            
            // Check if horse would reach hurdle area (accounting for horse position in container)
            const offsetToHorse = 200; // Distance from container left edge to horse image (fine-tuned for w-52 name tags)  
            const adjustment = offsetToHorse / (trackLength - 200);
            const horseImagePos = nextPos + adjustment; // Where the horse image actually is
            
            if (horseImagePos >= hurdlePercent && hasNotCrossedThisHurdle) {
              profile.hurdlesCrossed.push(hurdlePercent);
              
              const jumpSuccess = rngRef.current() < profile.hurdleSkill;
              
              if (jumpSuccess) {
                // Successful jump - small speed boost
                speed += settings.surgeIntensity * 0.2;
                dramaMomentRef.current = Math.max(dramaMomentRef.current, 1);
              } else {
                // Failed jump - stop at hurdle
                nextPos = hurdlePercent - adjustment;
                profile.stoppedUntil = currentTime + 400; // Stop for 0.4 seconds
                dramaMomentRef.current = 3;
              }
              break;
            }
          }
          
          return nextPos;
        });

        // Limit how far the leader can get ahead to keep the pack tighter
        const sortedPositions = [...updatedPositions].sort((a, b) => b - a);
        const leader = sortedPositions[0];
        const second = sortedPositions[1] ?? sortedPositions[0];
        const maxLead = 0.05; // 5% of track length for ultra-tight racing
        if (leader - second > maxLead) {
          const leaderIndex = updatedPositions.indexOf(leader);
          updatedPositions[leaderIndex] = second + maxLead;
        }

        const winnerIdx = updatedPositions.findIndex((p) => p >= 0.98);
        console.log('Max position:', Math.max(...updatedPositions), 'Winner found at 98%:', winnerIdx !== -1);
        if (winnerIdx !== -1 && !winnerDeclared) {
          winnerDeclared = true;
          
          // Let horses continue for a short time at normal speed, then stop
          setTimeout(() => {
            clearInterval(timerInterval);
            setIsRacing(false);
          }, 800); // Just 0.8 seconds of continued racing after winner declared

          const finalTime = parseFloat(
            ((Date.now() - raceStartTime.current) / 1000).toFixed(1)
          );

          const winnerName = getHorseName(items[winnerIdx], winnerIdx);
          setWinner(winnerName);
          setWinnerIndex(winnerIdx);
          setCommentary(`🏆 ${winnerName} wins in a thrilling finish!`);
          setRaceTime(finalTime);

          if (cheerSoundRef.current) {
            cheerSoundRef.current.currentTime = 0;
            cheerSoundRef.current
              .play()
              .catch((e) => console.warn("Cheer sound failed:", e));
          }

          
          if (!fastestTime || finalTime < fastestTime) {
            setFastestTime(finalTime);
          }

          setHistory((prev) => [
            {
              winner: winnerName,
              time: `${finalTime}s`,
              distance: raceDistance,
              weather: currentWeather?.name || "Clear",
               seed,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev.slice(0, 9),
          ]);

          // Betting logic moved to useEffect that watches winnerIndex

          clearInterval(commentaryIntervalRef.current);
          
        }
 
        // Let the timeout from winner declaration handle race ending
        // Removed automatic race ending when all horses finish


        // Update surging and fatigued horses state for visual effects
        const currentlySurging = horseProfiles.map((profile, index) => profile.isSurging);
        const currentlyFatigued = horseProfiles.map((profile, index) => profile.isFatigued);
        setSurgingHorses(currentlySurging);
        setFatiguedHorses(currentlyFatigued);

        return updatedPositions;

      });

      if (!finished) {
        animationFrameIdRef.current = requestAnimationFrame(updatePositions);
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(updatePositions);
  };

  // New startRace function that uses the adapter
  const startRace = (seed) => {
    // Prepare horse data for the adapter
    const horseData = items.map((item, index) => ({
      name: getHorseName(item, index),
      id: index,
      item: item
    }));

    // Prepare settings
    const settings = {
      distance: raceDistance,
      weather: currentWeather,
      seed: seed
    };

    // Prepare callbacks for the adapter
    const callbacks = {
      originalStartRace,
      setPositions,
      setRaceTime,
      setCommentary,
      setWinner,
      setWinnerIndex,
      setIsRacing,
      setCountdown,
      setSurgingHorses,
      setFatiguedHorses
    };

    // Use the race engine adapter
    raceEngineAdapter.initializeRace(horseData, settings, callbacks);
  };

  const resetRace = () => {
    setItemCount(0);
    setItems([]);
    setWinner(null);
    setWinnerIndex(null);
    setIsRacing(false);
    setShowRaceScreen(false);
    setCommentary("");
    setPositions([]);
    setRaceTime(0);
    setCurrentWeather(null);
    setBetHorse(null);
    setBetAmount(0);
    setBetEnabled(false);
    clearInterval(commentaryIntervalRef.current);
    cancelAnimationFrame(animationFrameIdRef.current);
    raceEngineAdapter.reset();

    if (cheerSoundRef.current) {
      cheerSoundRef.current.pause();
      cheerSoundRef.current.currentTime = 0;
    }

    if (raceSoundRef.current) {
      raceSoundRef.current.pause();
      raceSoundRef.current.currentTime = 0;
    }
  };

  const backToSetup = () => {
    setShowRaceScreen(false);
    setWinner(null);
    setWinnerIndex(null);
    setIsRacing(false);
    setCommentary("");
    setPositions(Array(itemCount).fill(0));
    setRaceTime(0);
    setCountdown(null);
    setCurrentWeather(null);
    setBetHorse(null);
    setBetAmount(0);
    setBetEnabled(false);
    clearInterval(commentaryIntervalRef.current);
    cancelAnimationFrame(animationFrameIdRef.current);
    
    // Randomize horse avatars when returning to setup screen
    const availableHorses = horseAvatars.filter((_, index) => unlockedHorses[index]);
    setShuffledAvatars(shuffleArray(availableHorses));
    
    if (cheerSoundRef.current) {
      cheerSoundRef.current.pause();
      cheerSoundRef.current.currentTime = 0;
    }

    if (raceSoundRef.current) {
      raceSoundRef.current.pause();
      raceSoundRef.current.currentTime = 0;
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setFastestTime(null);
  };

  const clearAllSaveData = () => {
    if (confirm('Are you sure you want to clear all saved progress? This cannot be undone.')) {
      gameStorage.clear();
      setCoins(1000);
      setUnlockedHorses(horseAvatars.map((_, index) => index < 5));
      setFastestTime(null);
      setHistory([]);
      setHorseInventories({});
      setHorseSkills({});
      setHorseSkillPoints({});
      setResearchPoints(0);
      setCustomHorseNames({});
      setHorseCareStats({});
      setDayCount(1);
      setStableGameTime(0);
      setCurrentTheme(DEFAULT_THEME);
      setUnlockedMazes({ standard: true });
      setUnlockedSongs({ 'THEME SONG': true });
      setNestEgg(null);
      setSelectedGrazingHorses([]);
      setSpecialUnlockProgress({
        win_streak: 0,
        current_win_streak: 0,
        perfect_bet: 0,
        current_bet_streak: 0,
        best_time: null,
        care_count: 0,
        labyrinth_completions: 0,
        unlocked_songs_count: 0
      });
      console.log('All save data cleared');
    }
  };

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  const getSaveInfo = () => {
    return gameStorage.getSaveInfo();
  };

  const handleHorseRename = (horseId, newName) => {
    setCustomHorseNames(prev => ({
      ...prev,
      [horseId]: newName
    }));
  };

  const randomizeHorseNames = () => {
    const categoryList =
      horseNameCategories[nameCategory] || horseNameCategories["Default"];
    
    // Don't shuffle Default theme names
    if (nameCategory !== "Default") {
      const shuffledNames = shuffleArray(categoryList);
      setShuffledHorseNames((prev) => ({
        ...prev,
        [nameCategory]: shuffledNames,
      }));
    }

    const newItems = items.map((item, index) =>
      item.trim() === "" ? "" : item
    );
    setItems(newItems);
    setShuffledAvatars(shuffleArray(shuffledAvatars));
  };

  const handleRaceAgain = () => {
    setWinner(null);
    setWinnerIndex(null);
    setPositions(Array(itemCount).fill(0));
    setRaceTime(0);
    setCommentary("");
    racePhaseRef.current = 0;
    lastLeaderRef.current = -1;
    dramaMomentRef.current = 0;
    usedCommentaryRef.current.clear();
    lastCommentaryRef.current = "";
    // Don't reset betting state - user should keep their bet for the next race
    setTimeout(() => startRace(), 500);
  };

  const toggleMute = () => setMuted(!muted);

  const isStartDisabled =
  itemCount === 0 ||
    (betEnabled && (!betAmount || betAmount > (Number(coins) || 0) || betHorse === null));

  const getRaceDistanceInfo = (distance) => {
    // Only one race type now - always return "Classic"
    return {
      name: "Classic",
      description: "Epic distance race",
    };
  };

  // Weather Particles Component
  const WeatherParticles = () => {
    if (!currentWeather) return null;

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: currentWeather.particleCount }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-70"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50,
            }}
            animate={{
              y: window.innerHeight + 50,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear",
            }}
          >
            {currentWeather.particles}
          </motion.div>
        ))}
      </div>
    );
  };

  // Confetti animation for winner screen
  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: [
              "#FFC700",
              "#FF0000",
              "#2E3191",
              "#41BBC7",
              "#FFFFFF",
            ][i % 5],
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 20,
            x: Math.random() * window.innerWidth,
            rotate: Math.random() * 360,
            opacity: 0,
          }}
          transition={{ duration: 2 + Math.random() * 2, delay: Math.random() }}
        />
      ))}
    </div>
  );

  // TITLE SCREEN
  if (showTitle) {
    const titleStyles = themeUtils.getScreenStyles(currentTheme, 'title');
    
    return (
      <div className={`h-screen w-full flex flex-col justify-between bg-gradient-to-br ${titleStyles.background} relative overflow-hidden`}>
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20"
            animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-32 right-16 w-24 h-24 bg-pink-400 rounded-full opacity-20"
            animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 0.8, 1] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="absolute inset-0 bg-black opacity-30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center justify-start flex-1 text-center px-4 pt-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-2"
          >
            <img 
              src="/logo.png" 
              alt="Winner Decides Logo" 
              style={{
                width: '400px',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
              }}
            />
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4"
          >
            <img 
              src={horseAvatars[Math.floor(Math.random() * horseAvatars.length)]}
              alt="Random Horse"
              className="w-48 h-48 object-contain rounded-lg shadow-lg"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className={`text-lg sm:text-xl ${titleStyles.subtitle} mb-16 max-w-md mt-16`}
          >
            The ultimate way to make decisions! Add your options and watch them
            race to victory!
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowTitle(false);
              // Randomize horse avatars when entering from title screen
              const availableHorses = horseAvatars.filter((_, index) => unlockedHorses[index]);
              setShuffledAvatars(shuffleArray(availableHorses));
            }}
            className={`px-8 py-4 ${themeUtils.getComponentStyles(currentTheme, 'button', 'success')} font-bold text-lg`}
          >
            Start Racing!
          </motion.button>
        </motion.div>

        <div className="h-8"></div>
      </div>
    );
  }

  // RACE SCREEN
  if (showRaceScreen) {
    const distanceInfo = getRaceDistanceInfo(raceDistance);
    const theme = themeUtils.getCurrentTheme(currentTheme);
    const raceStyles = themeUtils.getScreenStyles(currentTheme, 'race');

    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${
          currentWeather
            ? currentWeather.background
            : raceStyles.setup?.background || theme.colors.mainBg
        } w-full overflow-hidden flex flex-col relative`}
      >
        {/* Weather Particles */}
        <WeatherParticles />
        {/* Race Header */}
        <div className="bg-white bg-opacity-90 backdrop-blur-md shadow-lg p-3 sm:p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                
              </motion.span>
              <div>
                <h1 className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${theme.colors.headerBg.replace('bg-gradient-to-r ', '')} bg-clip-text text-transparent`}>
                  {distanceInfo.name} Race
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{distanceInfo.description}</span>
                  {currentWeather && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span>{currentWeather.emoji}</span>
                        <span>{currentWeather.name}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {fastestTime && (
                <div className="text-xs bg-yellow-200 px-2 py-1 rounded-full">
                  🏆 {fastestTime}s
                </div>
              )}
              <div className="text-xs bg-yellow-100 px-2 py-1 rounded-full flex items-center gap-1">
                <img src="/horsecoins.png" alt="coins" className="w-4 h-4" />
                <span>{Number(coins) || 0}</span>
              </div>
              {isRacing && (
                <div className="text-sm font-bold text-blue-600">
                  {raceTime.toFixed(1)}s
                </div>
              )}
              <button
                onClick={backToSetup}
                className={`text-sm px-3 py-1 ${themeUtils.getComponentStyles(currentTheme, 'button', 'muted')}`}
                disabled={isRacing}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Loading Screen */}
        {!imagesLoaded && (
          <div className="flex-1 flex flex-col justify-center items-center p-4">
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🏇
              </motion.div>
              <p className="text-xl font-bold text-gray-700 mb-2">
                Loading horses...
              </p>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* Pre-Race or Countdown */}
        {imagesLoaded && !isRacing && !winner && (
          <div className="flex-1 flex flex-col justify-center items-center p-4">
            {countdown ? (
              <motion.div
                className="text-center"
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <motion.div
                  className="text-8xl sm:text-9xl font-bold text-red-500 mb-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {countdown}
                </motion.div>
                <p className="text-2xl font-bold text-gray-700">Get Ready!</p>
                {currentWeather && (
                  <p className="text-lg text-gray-600 mt-2">
                    {currentWeather.emoji} {currentWeather.description}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                className="text-center w-full max-w-2xl"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                  {distanceInfo.name} Race Ready!
                </h2>
                {currentWeather && (
                  <div className="mb-4 p-3 bg-white bg-opacity-80 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                      <span className="text-2xl">{currentWeather.emoji}</span>
                      <span>Weather: {currentWeather.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentWeather.description}
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-8">
                  {items.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between bg-white bg-opacity-80 p-4 rounded-xl shadow-md"
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <FadeInImage
                          src={shuffledAvatars[index % shuffledAvatars.length]}
                          alt="Horse avatar"
                          className="w-24 h-24 object-contain rounded-lg"
                        />
                        <div>
                          <div className="font-bold text-gray-800">
                            {getHorseName(item, index)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Lane #{index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl"></div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startRace()}
                  className={`px-8 py-4 ${themeUtils.getComponentStyles(currentTheme, 'button', 'success')} text-white font-bold text-lg`}
                >
                  Start {distanceInfo.name} Race!
                </motion.button>
              </motion.div>
            )}
          </div>
        )}

        {/* Race Track */}
        {imagesLoaded && (isRacing || winner) && (
          <RaceTrack
            items={items}
            positions={positions}
            trackLength={trackLength}
            trackContainerRef={trackContainerRef}
            raceDistance={raceDistance}
            currentWeather={currentWeather}
            isRacing={isRacing}
            countdown={countdown}
            commentary={commentary}
            winner={winner}
            winnerIndex={winnerIndex}
            raceTime={raceTime}
            fastestTime={fastestTime}
            shuffledAvatars={shuffledAvatars}
            surgingHorses={surgingHorses}
            fatiguedHorses={fatiguedHorses}
            getHorseName={getHorseName}
            getRaceSettings={getRaceSettings}
            getRaceDistanceInfo={getRaceDistanceInfo}
            onRaceAgain={handleRaceAgain}
            backToSetup={backToSetup}
            betEnabled={betEnabled}
            betAmount={betAmount}
            betHorse={betHorse}
          />
        )}
      </div>
    );
  }

  if (showStable) {
    return (
      <HorseStable
        horseAvatars={horseAvatars}
        horseNames={horseNames}
        horsePersonalities={horsePersonalities}
        unlockedHorses={unlockedHorses}
        coins={coins}
        horseInventories={horseInventories}
        horseSkills={horseSkills}
        horseSkillPoints={horseSkillPoints}
        customHorseNames={customHorseNames}
        horseCareStats={horseCareStats}
        onUpdateHorseCareStats={setHorseCareStats}
        onBack={() => {
          setShowStable(false);
          // Randomize horse avatars when returning from stable
          const availableHorses = horseAvatars.filter((_, index) => unlockedHorses[index]);
          setShuffledAvatars(shuffleArray(availableHorses));
        }}
        onShowLockedHorses={() => {
          setShowStable(false);
          setShowLockedHorses(true);
        }}
         onSendToLabyrinth={(horse) => {
          console.log('🚀 App - Horse being sent to labyrinth:', horse);
          console.log('🎒 App - Horse inventory at send time:', horse?.inventory);
          setSelectedHorseForLabyrinth(horse);
          setShowStable(false);
          setShowLabyrinth(true);
        }}
        onUpdateCoins={setCoins}
        onHorseRename={handleHorseRename}
        dayCount={dayCount}
        onUpdateDayCount={setDayCount}
        stableGameTime={stableGameTime}
        onUpdateStableGameTime={setStableGameTime}
        currentTheme={currentTheme}
        unlockedSongs={unlockedSongs}
        onUnlockSong={handleUnlockSong}
        onRemoveItemFromHorseInventory={handleRemoveItemFromHorseInventory}
        onRemoveItemFromHorseInventoryByIndex={handleRemoveItemFromHorseInventoryByIndex}
        onRemoveItemFromHorseInventoryById={handleRemoveItemFromHorseInventoryById}
        onAddItemToHorseInventory={handleAddItemToHorseInventory}
        nestEgg={nestEgg}
        onUpdateNestEgg={setNestEgg}
        selectedGrazingHorses={selectedGrazingHorses}
        onUpdateSelectedGrazingHorses={setSelectedGrazingHorses}
        onSpecialProgressUpdate={updateSpecialProgress}
      />
    );
  }

  if (showLockedHorses) {
    return (
      <LockedHorses
        horseAvatars={horseAvatars}
        horseNames={horseNames}
        horsePersonalities={horsePersonalities}
        unlockedHorses={unlockedHorses}
        coins={coins}
        onUnlockHorse={handleUnlockHorse}
        onBack={() => {
          setShowLockedHorses(false);
          setShowStable(true);
        }}
        specialUnlockCriteria={specialUnlockCriteria}
        specialUnlockProgress={specialUnlockProgress}
      />
    );
  }

  if (showLabyrinth) {
    return (
      <HorseMazeGame
        selectedHorse={selectedHorseForLabyrinth}
        researchPoints={researchPoints}
        onUpdateResearchPoints={setResearchPoints}
        coins={coins}
        onUpdateCoins={setCoins}
        unlockedMazes={unlockedMazes}
        onUpdateUnlockedMazes={setUnlockedMazes}
        horseAvatars={horseAvatars}
        horseNames={horseNames}
        unlockedHorses={unlockedHorses}
        onUnlockHorse={handleUnlockHorse}
        currentTheme={currentTheme}
        unlockedSongs={unlockedSongs}
        onBack={() => {
          console.log('🏠 App - Horse returning from labyrinth:', selectedHorseForLabyrinth);
          setShowLabyrinth(false);
          setShowStable(true);
          setSelectedHorseForLabyrinth(null);
        }}
        onHorseReturn={(updatedHorse) => {
          // Update horse inventories, skills, and skill points
          console.log('🏠 App - onHorseReturn received horse:', updatedHorse);
          console.log('🎒 App - Horse inventory being saved:', updatedHorse?.inventory);
          console.log('🎒 App - Horse inventory length:', updatedHorse?.inventory?.length);
          if (updatedHorse && updatedHorse.id) {
            setHorseInventories(prev => ({
              ...prev,
              [updatedHorse.id]: updatedHorse.inventory || []
            }));
            
            if (updatedHorse.skills) {
              console.log('🏠 App - Saving skills for horse', updatedHorse.id, ':', updatedHorse.skills);
              setHorseSkills(prev => {
                const newState = {
                  ...prev,
                  [updatedHorse.id]: updatedHorse.skills
                };
                console.log('🏠 App - Updated horseSkills state:', newState);
                return newState;
              });
            }
            
            if (updatedHorse.skillPoints !== undefined) {
              console.log('🏠 App - Saving skill points for horse', updatedHorse.id, ':', updatedHorse.skillPoints);
              setHorseSkillPoints(prev => {
                const newState = {
                  ...prev,
                  [updatedHorse.id]: updatedHorse.skillPoints
                };
                console.log('🏠 App - Updated horseSkillPoints state:', newState);
                return newState;
              });
            }
            
            // CRITICAL: Save horse care stats (including injury status)
            console.log('🏥 App - Saving care stats for horse', updatedHorse.id);
            console.log('🏥 App - Horse injury status:', updatedHorse.isInjured);
            console.log('🏥 App - Horse health:', updatedHorse.health);
            setHorseCareStats(prev => {
              const newCareStats = {
                ...prev,
                [updatedHorse.id]: {
                  happiness: updatedHorse.happiness,
                  health: updatedHorse.health,
                  cleanliness: updatedHorse.cleanliness,
                  energy: updatedHorse.energy,
                  isInjured: updatedHorse.isInjured,
                  lastCareUpdate: updatedHorse.lastCareUpdate || Date.now()
                }
              };
              console.log('🏥 App - Updated horseCareStats:', newCareStats);
              return newCareStats;
            });
          }
        }}
        onSpecialProgressUpdate={updateSpecialProgress}
      />
    );
  }


  if (showBattleship) {
    return <BattleshipGame onBack={() => setShowBattleship(false)} />;
  }

  // Get current theme for styling
  const theme = themeUtils.getCurrentTheme(currentTheme);
  const setupStyles = themeUtils.getScreenStyles(currentTheme, 'race');
  const labyrinthStyles = themeUtils.getScreenStyles(currentTheme, 'labyrinth');
  
  // Debug theme
  console.log('Current theme:', currentTheme, 'is saturday?', currentTheme === 'saturday');

  // SETUP SCREEN
  return (
    <div className={`min-h-screen bg-gradient-to-br ${setupStyles.setup?.background || theme.colors.mainBg} w-full overflow-x-hidden`}>
      <div className="w-full max-w-none backdrop-blur-md shadow-2xl min-h-screen" style={{ backgroundColor: 'transparent' }}>
        {/* Header */}
        <div 
          className="flex items-center justify-between mb-3"
          style={{ 
            padding: window.innerWidth < 640 ? '8px' : '16px',
            paddingTop: window.innerWidth < 640 ? '12px' : '16px'
          }}
        >
            <h1 
              className={`screen-header ${currentTheme === 'saturday' ? 'saturday-title' : ''}`}
              style={{
                color: '#fbbf24',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                fontFamily: '"Press Start 2P", monospace',
                letterSpacing: '0.05em'
              }}
            >
              Winner Decides!
            </h1>
            <div className="flex items-center gap-1 sm:gap-3 sm:pr-0 sm:static sm:right-auto absolute right-0 top-0 sm:top-auto">
              {fastestTime && (
                <div className="text-xs sm:text-sm bg-gradient-to-r from-yellow-200 to-yellow-300 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap shadow-md hidden sm:block">
                  🏆 Record: {fastestTime}s
                </div>
              )}
              <div className="text-xs sm:text-sm bg-yellow-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap shadow-md flex items-center gap-1 hidden sm:flex">
                <img src="/horsecoins.png" alt="coins" className="w-4 h-4" />
                <span>{Number(coins) || 0}</span>
              </div>
              
              <button
                onClick={toggleMute}
                className="text-lg sm:text-xl hover:scale-110 transition-transform p-2 rounded-full hover:bg-gray-100 hidden sm:block"
              >
                {muted ? "🔇" : "🔊"}
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className={`text-xs px-2 py-1 ${themeUtils.getComponentStyles(currentTheme, 'button', 'settings')} text-white`}
                style={{ fontSize: '10px', padding: '4px 8px' }}
                title="Settings"
              >
                ⚙️
              </button>
              <button
                onClick={() => setShowStable(true)}
                className={`text-xs px-2 py-1 ${themeUtils.getComponentStyles(currentTheme, 'button', 'warning')} text-white`}
                style={{ fontSize: '7px', padding: '4px 26px' }}
              >
                Stable
              </button>
            </div>
        </div>
        
        {/* Content */}
        <div style={{ padding: window.innerWidth < 640 ? '8px' : '16px', paddingTop: 0 }}>
          {/* Number Input */}
          <div className="mb-4 mt-16">
            <label 
              className="block mb-2 font-semibold text-sm"
              style={{ color: currentTheme === 'saturday' ? '#FFE4B5' : '#e5e7eb' }}
            >
              Number of Horses (2-{maxItems})
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="2"
                max={maxItems}
                className="flex-1 px-4 py-3 rounded-xl border-2 focus:outline-none text-sm shadow-md"
                style={{
                  borderColor: currentTheme === 'saturday' ? '#FFD93D' : '#d1d5db',
                  border: currentTheme === 'saturday' ? '3px solid #FFD93D' : '2px solid #d1d5db',
                  boxShadow: currentTheme === 'saturday' ? 'inset 0 0 0 1000px #FFE4B5' : 'none',
                }}
                onChange={handleCountChange}
                value={itemCount || ""}
                defaultValue="5"
                placeholder="Enter number..."
              />
            </div>
          </div>

          {/* Theme Selection and Randomize Button */}
          {items.length > 0 && (
            <div className="mb-4">
              <label 
                className="block font-semibold text-sm mb-2"
                style={{ color: currentTheme === 'saturday' ? '#FFE4B5' : '#e5e7eb' }}
              >
                Theme
              </label>
              <div className="flex gap-2">
                <select
                  value={nameCategory}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    setNameCategory(newCategory);
                    // Auto-set contestant count to 2 for Yes or No theme
                    if (newCategory === "Yes or No") {
                      setItemCount(2);
                      setItems(Array(2).fill(""));
                      setPositions(Array(2).fill(0));
                      setWinner(null);
                      setWinnerIndex(null);
                      setIsRacing(false);
                      setCommentary("");
                      setRaceTime(0);
                      setBetHorse(null);
                      setBetAmount(0);
                      setBetEnabled(false);
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border-2 focus:outline-none text-sm shadow-md"
                  style={{
                    borderColor: currentTheme === 'saturday' ? '#FFD93D' : '#d1d5db',
                    boxShadow: currentTheme === 'saturday' ? 'inset 0 0 0 1000px #FFF6E3' : 'none',
                  }}
                >
                  {Object.keys(horseNameCategories).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={randomizeHorseNames}
                  className={`${themeUtils.getComponentStyles(currentTheme, 'button', 'secondary')} text-white`}
                  style={{ padding: '4px 12px', fontSize: '16px', minWidth: 'auto', width: 'auto' }}
                  title="Randomize horse names for selected theme"
                >
                  🎲
                </motion.button>
              </div>
            </div>
          )}

          {/* Race Length Selector */}

          {/* Contestant Inputs */}
          {items.length > 0 && (
            <div className="mb-4">
              <h3 
                className="font-semibold mb-3 text-sm"
                style={{ color: currentTheme === 'saturday' ? '#FFE4B5' : '#e5e7eb' }}
              >
                Horses:
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <input
                      type="text"
                      placeholder={`Or use: ${
                        nameCategory === "Default" 
                          ? getHorseName("", index) // Use the proper avatar-to-name mapping
                          : shuffledHorseNames[nameCategory][
                              index % shuffledHorseNames[nameCategory].length
                            ]
                      }`}
                      value={item}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      maxLength={20}
                      className="w-full p-3 border-2 rounded-xl text-sm focus:outline-none transition-all pl-24 pr-12 focus:shadow-lg contestant-input"
                      style={{
                        borderColor: currentTheme === 'saturday' ? '#FFD93D' : '#d1d5db',
                        boxShadow: currentTheme === 'saturday' ? 'inset 0 0 0 1000px #FFE4B5' : 'none',
                      }}
                    />
                    <FadeInImage
                      src={shuffledAvatars[index % shuffledAvatars.length]}
                      alt="Horse avatar"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 object-contain rounded-md"
                      style={{ width: "5rem", height: "5rem" }}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-400">
                      #{index + 1}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Betting Section */}
          {items.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label 
                  className="font-semibold text-sm"
                  style={{ color: currentTheme === 'saturday' ? '#FFE4B5' : '#e5e7eb' }}
                >
                  Place Your Bet (Coins: {Number(coins) || 0})
                </label>
                <label 
                  className="flex items-center text-xs"
                  style={{ color: currentTheme === 'saturday' ? '#FFE4B5' : '#d1d5db' }}
                >
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={betEnabled}
                    onChange={() => {
                      const next = !betEnabled;
                      setBetEnabled(next);
                      if (!next) {
                        setBetAmount(0);
                        setBetHorse(null);
                      }
                    }}
                  />
                  Enable
                </label>
              </div>
               {betEnabled && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="number"
                      min="1"
                      className="flex-1 p-3 border-2 rounded-xl text-sm focus:outline-none shadow-md"
                      style={{
                        borderColor: currentTheme === 'saturday' ? '#FFD93D' : '#d1d5db',
                        boxShadow: currentTheme === 'saturday' ? 'inset 0 0 0 1000px #FFE4B5' : 'none',
                      }}
                      value={betAmount || ""}
                      onChange={(e) =>
                        setBetAmount(Math.max(0, parseInt(e.target.value, 10) || 0))
                      }
                      placeholder="Bet amount"
                    />
                    <select
                      value={betHorse !== null ? betHorse : ""}
                      onChange={(e) =>
                        setBetHorse(
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value, 10)
                        )
                      }
                      className="flex-1 p-3 border-2 border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none shadow-md"
                    >
                      <option value="" disabled>
                        Select horse
                      </option>
                      {items.map((item, index) => (
                        <option key={index} value={index}>
                          {getHorseName(item, index)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {betAmount > 0 && betHorse !== null && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Potential payout if <strong>{getHorseName(items[betHorse], betHorse)}</strong> wins:</span>
                        <span className="font-bold text-green-600">
                          {(() => {
                            const multiplier = Math.min(3, Math.max(1.5, itemCount * 0.5));
                            return Math.floor(betAmount * multiplier);
                          })()} coins
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Multiplier: {(() => {
                          const multiplier = Math.min(3, Math.max(1.5, itemCount * 0.5));
                          return multiplier.toFixed(1);
                        })()}x ({itemCount} horses)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: isStartDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isStartDisabled ? 1 : 0.98 }}
                onClick={goToRaceScreen}
                className={`w-full sm:w-auto text-white p-4 font-semibold text-sm ${
                  isStartDisabled
                    ? themeUtils.getComponentStyles(currentTheme, 'button', 'muted')
                    : themeUtils.getComponentStyles(currentTheme, 'button', 'success')
                }`}
                disabled={isStartDisabled}
              >
                Start Race!
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetRace}
                className={`w-full sm:w-auto px-6 ${themeUtils.getComponentStyles(currentTheme, 'button', 'danger')} text-white font-semibold py-4 text-sm`}
              >
                Reset
              </motion.button>
            </div>
          )}

          {/* Race History */}
          {history.length > 0 && (
            <motion.div
              className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  🏁 Race History
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearHistory}
                  className={`text-xs ${themeUtils.getComponentStyles(currentTheme, 'button', 'danger')} font-medium px-3 py-1`}
                >
                  Clear History
                </motion.button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.map((race, idx) => (
                  <motion.div
                    key={idx}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs p-3 rounded-lg gap-1 sm:gap-0 shadow-sm border border-gray-100"
                    style={{
                      borderColor: currentTheme === 'saturday' ? '#FFD93D' : '#f3f4f6',
                      boxShadow: currentTheme === 'saturday' ? 'inset 0 0 0 1000px #FFE4B5' : 'none',
                      backgroundColor: currentTheme === 'saturday' ? 'transparent' : 'white',
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">🏆</span>
                      <span className="font-semibold truncate max-w-full sm:max-w-48">
                        {race.winner}
                      </span>
                    </div>
                    <div className="text-gray-600 flex gap-3 text-xs">
                      <span className="font-mono bg-blue-50 px-2 py-1 rounded">
                        {race.time}
                      </span>
                      <span className="text-gray-500">{race.timestamp}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Settings Modal */}
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            onResetAll={clearAllSaveData}
            getSaveInfo={getSaveInfo}
            onAddTestCoins={(amount) => setCoins(prev => (Number(prev) || 0) + (Number(amount) || 0))}
            gameStorage={gameStorage}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />
        </div>
      </div>
      
      {/* Special Horse Unlock Modal - show when there's a pending unlock */}
      {recentlyUnlockedSpecialHorse && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          style={{ zIndex: 9999 }}
          onClick={() => {
            setRecentlyUnlockedSpecialHorse(null);
          }}
        >
          <motion.div
            className="text-center p-6 bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200 rounded-2xl shadow-2xl max-w-sm w-full mx-auto relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: [
                      "#9333EA",
                      "#A855F7", 
                      "#C084FC",
                      "#DDD6FE",
                      "#FDE047",
                    ][i % 5],
                  }}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    rotate: 0,
                    opacity: 1,
                  }}
                  animate={{
                    y: window.innerHeight + 20,
                    x: Math.random() * window.innerWidth,
                    rotate: Math.random() * 360,
                    opacity: 0,
                  }}
                  transition={{ duration: 3 + Math.random() * 2, delay: Math.random() }}
                />
              ))}
            </div>
            <div className="relative mb-2 flex justify-center">
              <MotionFadeInImage
                src={recentlyUnlockedSpecialHorse.avatar}
                alt={recentlyUnlockedSpecialHorse.name}
                className="w-24 h-24 mx-auto object-contain rounded-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{recentlyUnlockedSpecialHorse.criteria.icon}</span>
              <p className="text-lg font-bold text-purple-800">SPECIAL HORSE UNLOCKED!</p>
            </div>
            <p className="text-xl font-bold text-purple-900 mb-2">
              {recentlyUnlockedSpecialHorse.name}
            </p>
            <div className="bg-purple-100 border-2 border-purple-400 rounded-lg p-3 mb-3">
              <p className="text-sm font-bold text-purple-800 mb-1">
                🏆 {recentlyUnlockedSpecialHorse.criteria.name}
              </p>
              <p className="text-xs text-purple-700">
                {recentlyUnlockedSpecialHorse.criteria.description}
              </p>
            </div>
            <p className="text-base text-gray-700 mb-4">
              Personality: {recentlyUnlockedSpecialHorse.personality}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRecentlyUnlockedSpecialHorse(null)}
              className="px-4 py-2 bg-purple-600 text-purple-100 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg"
            >
              Awesome!
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}