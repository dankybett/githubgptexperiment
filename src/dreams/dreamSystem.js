import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CUSTOM_DREAM_SETTINGS, TAROT_BACKGROUNDS } from './dreamAssets';

// Tarot card list - corresponds to files in public/Tarot cards/
const TAROT_CARDS = [
  '0.thefool.png',
  '1. themagician.png',
  '2.thehighpriestess.png',
  '3.theempress.png',
  '4.theemperor.png',
  '5.thehierophant.png',
  '6.thelovers.png',
  '7.thechariot.png',
  '8.strength.png',
  '9.thehermit.png',
  '10.wheeloffortune.png',
  '11.justice.png',
  '12.thehangedman.png',
  '13.death.png',
  '14.temperance.png',
  '15.thedevil.png',
  '16.thetower.png',
  '17.thestar.png',
  '18.themoon.png',
  '19.thesun.png',
  '20.judgement.png',
  '21.theworld.png'
];

/**
 * Modular Dream System for Horses
 * A component-based approach where dreams are built from interchangeable parts
 */

// Dream component types
export const DREAM_SUBJECTS = {
  // Horses from the game - will be populated from the existing horse assets
  HORSES: 'horses'
};

export const DREAM_SETTINGS = {
  BEACH: 'beach',
  FOREST: 'forest', 
  MEADOW: 'meadow',
  MOUNTAINS: 'mountains',
  SUNSET: 'sunset'
};

export const DREAM_ACTIONS = {
  RUNNING: 'running',
  GALLOPING: 'galloping',
  PLAYING: 'playing',
  FLYING: 'flying',
  DANCING: 'dancing'
};

export const DREAM_MOODS = {
  HAPPY: 'happy',
  PEACEFUL: 'peaceful',
  ADVENTUROUS: 'adventurous',
  MAGICAL: 'magical',
  NOSTALGIC: 'nostalgic'
};

// Dream Categories - define the types of dreams
export const DREAM_CATEGORIES = {
  RACE: 'race',
  MINOTAUR: 'minotaur', 
  TAROT: 'tarot',
  SCARECROW: 'scarecrow',
  HORSE_SPECIFIC: 'horse_specific',
  FLOATING: 'floating'
};

// Category-specific configurations
export const CATEGORY_CONFIGS = {
  [DREAM_CATEGORIES.RACE]: {
    name: 'Race Dreams',
    description: 'Dreams of competition and speed',
    preferredActions: [DREAM_ACTIONS.RUNNING, DREAM_ACTIONS.GALLOPING],
    preferredMoods: [DREAM_MOODS.ADVENTUROUS, DREAM_MOODS.HAPPY],
    animations: {
      horse_positioning: 'racing_line', // horses positioned in racing formation
      camera_movement: 'track_follow', // camera follows racing action
      speed_multiplier: 1.5 // faster animations
    },
    backgrounds: ['racetrack'], // race-specific background
    specialEffects: [] // Removed effects for cleaner race presentation
  },
  [DREAM_CATEGORIES.MINOTAUR]: {
    name: 'Minotaur Dreams',
    description: 'Dreams of mythology and labyrinthine adventures',
    preferredActions: [DREAM_ACTIONS.RUNNING, DREAM_ACTIONS.GALLOPING],
    preferredMoods: [DREAM_MOODS.ADVENTUROUS],
    animations: {
      horse_positioning: 'chase_scene', // horse being chased
      camera_movement: 'chase_follow', // camera follows the chase
      speed_multiplier: 1.2 // faster than normal for chase scene
    },
    backgrounds: ['labyrinth'], // minotaur-specific backgrounds
    specialEffects: []
  },
  [DREAM_CATEGORIES.TAROT]: {
    name: 'Tarot Dreams',
    description: 'Dreams of mysticism and fortune',
    preferredActions: [DREAM_ACTIONS.DANCING, DREAM_ACTIONS.FLYING],
    preferredMoods: [DREAM_MOODS.MAGICAL, DREAM_MOODS.NOSTALGIC],
    animations: {
      horse_positioning: 'tarot_spread', // horses positioned like tarot cards
      camera_movement: 'mystic_float', // ethereal floating camera movement
      speed_multiplier: 0.6 // slow, mystical animations
    },
    backgrounds: ['mysticalenergy', 'mirrorland', 'chessboard', 'celestialgarden'], // tarot-specific backgrounds
    specialEffects: ['floating_cards', 'crystal_sparkles', 'cosmic_swirls']
  },
  [DREAM_CATEGORIES.SCARECROW]: {
    name: 'Scarecrow Dreams',
    description: 'Dreams of pastoral guardians and countryside mystique',
    preferredActions: [DREAM_ACTIONS.RUNNING, DREAM_ACTIONS.GALLOPING],
    preferredMoods: [DREAM_MOODS.ADVENTUROUS, DREAM_MOODS.MAGICAL],
    animations: {
      horse_positioning: 'circling_scene', // horses circle around scarecrow
      camera_movement: 'static_watch', // camera observes the circling
      speed_multiplier: 1.0 // normal speed for circling
    },
    backgrounds: ['cornfield'], // scarecrow-specific backgrounds
    specialEffects: []
  },
  [DREAM_CATEGORIES.HORSE_SPECIFIC]: {
    name: 'Horse Specific Dreams',
    description: 'Dreams unique to specific horse characters',
    preferredActions: [DREAM_ACTIONS.PLAYING],
    preferredMoods: [DREAM_MOODS.NOSTALGIC, DREAM_MOODS.HAPPY],
    animations: {
      horse_positioning: 'center_stage', // single horse in center
      camera_movement: 'static', // stationary camera
      speed_multiplier: 0.8 // slower, contemplative animations
    },
    backgrounds: ['office', 'street'], // variant-specific backgrounds
    specialEffects: []
  },
  [DREAM_CATEGORIES.FLOATING]: {
    name: 'Floating Dreams',
    description: 'Dreams of weightless, airborne adventures',
    preferredActions: [DREAM_ACTIONS.FLYING],
    preferredMoods: [DREAM_MOODS.MAGICAL, DREAM_MOODS.PEACEFUL],
    animations: {
      horse_positioning: 'floating_formation', // horses positioned at different heights
      camera_movement: 'gentle_drift', // slow, dreamy camera movement
      speed_multiplier: 0.7 // slow, floating animations
    },
    backgrounds: ['horseballoons', 'toyland', 'spaghetti'], // floating-specific backgrounds
    specialEffects: ['floating_particles', 'gentle_breeze']
  }
};

// Dream composition generator
export class DreamComposer {
  constructor() {
    this.availableHorses = [];
    this.availableSettings = [];
    this.loadAssets();
  }

  async loadAssets() {
    // Horse assets will be provided when generating dreams
    this.availableHorses = [];

    // Use imported dream settings
    this.availableSettings = CUSTOM_DREAM_SETTINGS;
    console.log('🎨 Loaded dream settings:', this.availableSettings);
  }

  // Generate a random dream composition with category
  generateDream(sleepingHorse = null, allHorses = [], requestedCategory = null) {
    console.log('🐎 Generating dream for:', sleepingHorse?.name, 'with allHorses:', allHorses.length, 'category:', requestedCategory);
    
    // Select dream category
    const category = requestedCategory || this.getRandomCategory();
    const categoryConfig = CATEGORY_CONFIGS[category];
    
    // Get variants early to use in companion selection
    const raceVariant = category === DREAM_CATEGORIES.RACE ? this.getRaceVariant() : null;
    const tarotVariant = category === DREAM_CATEGORIES.TAROT ? this.getTarotVariant() : null;
    const minotaurVariant = category === DREAM_CATEGORIES.MINOTAUR ? this.getMinotaurVariant() : null;
    const scarecrowVariant = category === DREAM_CATEGORIES.SCARECROW ? this.getScarecrowVariant() : null;
    const horseSpecificVariant = category === DREAM_CATEGORIES.HORSE_SPECIFIC ? this.getHorseSpecificVariant() : null;
    const floatingVariant = category === DREAM_CATEGORIES.FLOATING ? this.getFloatingVariant() : null;
    
    // Use the sleeping horse as the main subject, and optionally add other horses from the stable
    const subjects = sleepingHorse ? [this.formatHorseForDream(sleepingHorse)] : [];
    
    // Add companion horses based on category
    if (allHorses.length > 1) {
      const otherHorses = allHorses.filter(h => h.id !== sleepingHorse?.id);
      let companionCount;
      
      // Race dreams always need exactly 3 horses total
      if (category === DREAM_CATEGORIES.RACE) {
        companionCount = Math.min(2, otherHorses.length); // Always 2 companions for racing
      } else if (category === DREAM_CATEGORIES.TAROT) {
        companionCount = 0; // Tarot dreams use only the dreaming horse
      } else if (category === DREAM_CATEGORIES.MINOTAUR) {
        if (minotaurVariant === 3) {
          companionCount = Math.min(2, otherHorses.length); // Variant 3 uses 2 companions for circling
        } else {
          companionCount = 0; // Variants 1 and 2 use only the dreaming horse
        }
      } else if (category === DREAM_CATEGORIES.SCARECROW) {
        companionCount = Math.min(2, otherHorses.length); // Scarecrow dreams always use 2 companions for circling
      } else if (category === DREAM_CATEGORIES.HORSE_SPECIFIC) {
        companionCount = 0; // Horse specific dreams feature only the specific character horse
      } else if (category === DREAM_CATEGORIES.FLOATING) {
        companionCount = Math.min(3, Math.floor(Math.random() * 3) + 2); // 2-4 companions for floating dreams
      } else {
        companionCount = Math.min(2, Math.floor(Math.random() * 2) + 1); // 1-2 companions for other dreams
      }
      
      const shuffled = otherHorses.sort(() => 0.5 - Math.random());
      const companions = shuffled.slice(0, companionCount).map(h => this.formatHorseForDream(h));
      subjects.push(...companions);
    }
    
    // Use category-aware selection for setting, action, and mood
    const setting = this.getCategorySetting(category, minotaurVariant, horseSpecificVariant);
    const action = this.getCategoryAction(category);
    const mood = this.getCategoryMood(category);

    const dream = {
      id: `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category,
      categoryConfig,
      subjects,
      setting,
      action,
      mood,
      duration: this.getCategoryDuration(category),
      timestamp: Date.now(),
      // Add race variant for race dreams
      raceVariant,
      // Add tarot variant for tarot dreams
      tarotVariant,
      // Add tarot card for tarot dreams
      tarotCard: category === DREAM_CATEGORIES.TAROT ? this.getRandomTarotCard() : null,
      // Add minotaur variant for minotaur dreams
      minotaurVariant,
      // Add scarecrow variant for scarecrow dreams
      scarecrowVariant,
      // Add horse specific variant for horse specific dreams
      horseSpecificVariant,
      // Add floating variant for floating dreams
      floatingVariant
    };
    
    console.log('🐎 Generated categorized dream:', dream);
    if (dream.category === 'race') {
      console.log('🏁 Race dream variant:', dream.raceVariant);
    }
    if (dream.category === 'tarot') {
      console.log('🔮 Tarot dream variant:', dream.tarotVariant);
    }
    return dream;
  }

  // Generate a dream for a specific category
  generateCategoryDream(category, sleepingHorse = null, allHorses = []) {
    return this.generateDream(sleepingHorse, allHorses, category);
  }

  // Get random category
  getRandomCategory() {
    const categories = Object.values(DREAM_CATEGORIES);
    return categories[Math.floor(Math.random() * categories.length)];
  }

  // Get category-appropriate setting
  getCategorySetting(category, minotaurVariant = null, horseSpecificVariant = null) {
    const categoryConfig = CATEGORY_CONFIGS[category];
    
    // Special handling for minotaur variant 3 - use spookywoods background
    if (category === DREAM_CATEGORIES.MINOTAUR && minotaurVariant === 3) {
      const spookyWoodsBackground = this.availableSettings.find(setting => setting.name === 'spookywoods');
      if (spookyWoodsBackground) {
        return spookyWoodsBackground;
      }
      // Fallback to creating a manual background reference if not found in availableSettings
      return {
        name: 'spookywoods',
        path: '/spookywoods.png'
      };
    }
    
    // Special handling for tarot dreams - use exclusive backgrounds
    if (category === DREAM_CATEGORIES.TAROT) {
      const tarotBackgrounds = TAROT_BACKGROUNDS;
      const selectedBackground = tarotBackgrounds[Math.floor(Math.random() * tarotBackgrounds.length)];
      return selectedBackground;
    }
    
    // Special handling for horse specific dreams - variant-specific backgrounds
    if (category === DREAM_CATEGORIES.HORSE_SPECIFIC) {
      let backgroundName;
      if (horseSpecificVariant === 1) {
        backgroundName = 'office'; // Business horse dream
      } else if (horseSpecificVariant === 2) {
        backgroundName = 'street'; // Traffic dream
      } else if (horseSpecificVariant === 3) {
        backgroundName = 'mooncheeseplain'; // Alien reunion dream
      } else {
        backgroundName = 'office'; // Default fallback
      }
      
      const foundSetting = this.availableSettings.find(setting => setting.name === backgroundName);
      if (foundSetting) {
        return foundSetting;
      }
    }
    
    // If category has specific backgrounds, use those
    if (categoryConfig.backgrounds.length > 0) {
      const backgroundName = categoryConfig.backgrounds[Math.floor(Math.random() * categoryConfig.backgrounds.length)];
      
      // Find the background in our available settings
      const foundSetting = this.availableSettings.find(setting => setting.name === backgroundName);
      if (foundSetting) {
        return foundSetting;
      }
    }
    
    // Otherwise, fall back to general setting selection
    return this.getRandomSetting();
  }

  // Get category-appropriate action
  getCategoryAction(category) {
    const categoryConfig = CATEGORY_CONFIGS[category];
    const preferredActions = categoryConfig.preferredActions;
    
    // 70% chance to use preferred actions, 30% chance for any action
    if (Math.random() < 0.7 && preferredActions.length > 0) {
      return preferredActions[Math.floor(Math.random() * preferredActions.length)];
    }
    
    return this.getRandomAction();
  }

  // Get category-appropriate mood
  getCategoryMood(category) {
    const categoryConfig = CATEGORY_CONFIGS[category];
    const preferredMoods = categoryConfig.preferredMoods;
    
    // 70% chance to use preferred moods, 30% chance for any mood
    if (Math.random() < 0.7 && preferredMoods.length > 0) {
      return preferredMoods[Math.floor(Math.random() * preferredMoods.length)];
    }
    
    return this.getRandomMood();
  }

  // Get category-appropriate duration
  getCategoryDuration(category) {
    const baseRange = [3000, 8000]; // 3-8 seconds base
    const categoryConfig = CATEGORY_CONFIGS[category];
    const multiplier = categoryConfig.animations.speed_multiplier;
    
    // Adjust duration based on category speed multiplier
    const adjustedMin = baseRange[0] / multiplier;
    const adjustedMax = baseRange[1] / multiplier;
    
    return Math.floor(Math.random() * (adjustedMax - adjustedMin)) + adjustedMin;
  }

  // Get race dream variant
  getRaceVariant() {
    const variants = [1, 2, 3, 4]; // Race Dream 1, 2, 3, and 4
    return variants[Math.floor(Math.random() * variants.length)];
  }

  // Get tarot dream variant
  getTarotVariant() {
    return 1; // Only Tarot Dream 1 exists for now
  }

  // Get minotaur dream variant
  getMinotaurVariant() {
    const variants = [1, 2, 3]; // Minotaur Dream 1, 2, and 3
    return variants[Math.floor(Math.random() * variants.length)];
  }

  // Get scarecrow dream variant
  getScarecrowVariant() {
    return 1; // Only Scarecrow Dream 1 exists for now
  }

  // Get horse specific dream variant
  getHorseSpecificVariant() {
    const variants = [1, 2, 3]; // Business Horse Dream 1, Traffic Dream 2, and Alien Reunion Dream 3
    return variants[Math.floor(Math.random() * variants.length)];
  }

  // Get floating dream variant
  getFloatingVariant() {
    return 1; // Only Floating Dream 1 exists for now
  }

  // Get random tarot card
  getRandomTarotCard() {
    const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    return `/Tarot cards/${randomCard}`;
  }

  // Format horse data for dream use
  formatHorseForDream(horse) {
    return {
      name: horse.name,
      path: horse.avatar, // Use the existing avatar path
      id: horse.id
    };
  }

  // This method is no longer used since we get horses from the stable directly
  getRandomHorses(min = 1, max = 2) {
    return [];
  }

  getRandomSetting() {
    console.log('🎨 Available settings:', this.availableSettings.length, this.availableSettings);
    if (this.availableSettings.length > 0) {
      const selectedSetting = this.availableSettings[Math.floor(Math.random() * this.availableSettings.length)];
      console.log('🎨 Selected custom setting:', selectedSetting);
      return selectedSetting;
    }
    
    // Fallback to procedural settings if no images are available
    const settings = Object.values(DREAM_SETTINGS);
    const fallbackSetting = {
      name: settings[Math.floor(Math.random() * settings.length)],
      path: null // Will use CSS background or procedural generation
    };
    console.log('🎨 Using fallback setting:', fallbackSetting);
    return fallbackSetting;
  }

  getRandomAction() {
    const actions = Object.values(DREAM_ACTIONS);
    return actions[Math.floor(Math.random() * actions.length)];
  }

  getRandomMood() {
    const moods = Object.values(DREAM_MOODS);
    return moods[Math.floor(Math.random() * moods.length)];
  }

  getRandomDuration() {
    // Dreams last between 3-8 seconds
    return Math.floor(Math.random() * 5000) + 3000;
  }
}

// Dream Bubble Component
export const DreamBubble = ({ horse, onDreamClick, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dreamActive, setDreamActive] = useState(false);

  useEffect(() => {
    console.log('🐎 DreamBubble useEffect - horse:', horse?.name, 'energy:', horse?.energy);
    // Only show dream bubble if horse is sleeping (low energy)
    if (horse && horse.energy < 25) {
      console.log('🐎 Horse is tired! Setting up dream bubble timer for', horse.name);
      const showDelay = Math.random() * 1000 + 500; // Random delay 0.5-1.5 seconds for testing
      const showTimer = setTimeout(() => {
        console.log('🐎 Showing dream bubble for', horse.name);
        setIsVisible(true);
      }, showDelay);
      
      return () => {
        console.log('🐎 Cleaning up dream bubble timer for', horse.name);
        clearTimeout(showTimer);
      };
    } else {
      console.log('🐎 Horse not tired or missing, hiding bubble');
      setIsVisible(false);
    }
  }, [horse?.energy, horse?.name]); // More specific dependencies

  useEffect(() => {
    if (isVisible) {
      // Dream bubble pulses and occasionally shows dream activity
      const dreamInterval = setInterval(() => {
        setDreamActive(prev => !prev);
      }, 2000 + Math.random() * 2000); // Random pulse every 2-4 seconds

      return () => clearInterval(dreamInterval);
    }
  }, [isVisible]);

  if (!isVisible || !horse) {
    console.log('🐎 DreamBubble not rendering - isVisible:', isVisible, 'horse:', horse?.name);
    return null;
  }

  console.log('🐎 DreamBubble RENDERING for', horse.name);
  return (
    <motion.div
      className={`absolute cursor-pointer ${className}`}
      style={{
        left: '50%',
        top: '-35px',
        transform: 'translateX(-50%)',
        zIndex: 100, // Higher z-index to ensure visibility
        pointerEvents: 'auto'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.9 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={(e) => {
        e.stopPropagation();
        onDreamClick && onDreamClick(horse);
      }}
    >
      {/* Dream bubble image */}
      <motion.img
        src="/stable/dreambubble.png"
        alt="Dream Bubble"
        className="w-20 h-20 object-contain"
        animate={{
          scale: dreamActive ? 1.1 : 1,
          filter: dreamActive 
            ? 'drop-shadow(0 0 20px rgba(147, 197, 253, 0.6))' 
            : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
        }}
        transition={{ duration: 1 }}
        style={{
          filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.4)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))'
        }}
      />
    </motion.div>
  );
};


// Dream Modal Component
export const DreamModal = ({ isOpen, onClose, dream, horse }) => {
  const [currentPhase, setCurrentPhaseState] = useState('intro');
  console.log('🏁 Current phase state:', currentPhase);
  
  const setCurrentPhase = (newPhase) => {
    console.log('🏁 PHASE CHANGE:', currentPhase, '->', newPhase);
    setCurrentPhaseState(newPhase);
  };
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const dreamComposer = useRef(new DreamComposer()).current;
  const timeoutsRef = useRef([]);
  const raceSequenceStarted = useRef(false);

  useEffect(() => {
    console.log('🏁 useEffect triggered - isOpen:', isOpen, 'dream category:', dream?.category, 'raceStarted:', raceSequenceStarted.current);
    
    if (isOpen && dream && dream.category === 'race') {
      if (raceSequenceStarted.current) {
        console.log('🏁 Race sequence already started, skipping');
        return;
      }
      console.log('🏁 Starting race sequence useEffect');
      raceSequenceStarted.current = true;
      
      // Clear any existing timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      
      // Dream playback sequence
      setCurrentPhase('intro');
      setPlaybackProgress(0);
      setCountdownNumber(3);

      // Race sequence with immediate execution
      const timeout1 = setTimeout(() => {
        console.log('🏁 TIMEOUT: Setting phase to countdown');
        setCurrentPhase('countdown');
        setCountdownNumber(3);
      }, 1000);
      
      const timeout2 = setTimeout(() => {
        console.log('🏁 TIMEOUT: Setting countdown to 2');
        setCountdownNumber(2);
      }, 2000);
      
      const timeout3 = setTimeout(() => {
        console.log('🏁 TIMEOUT: Setting countdown to 1');
        setCountdownNumber(1);
      }, 3000);
      
      const timeout4 = setTimeout(() => {
        console.log('🏁 TIMEOUT: Setting phase to racing');
        setCurrentPhase('racing');
      }, 4000);
      
      const timeout5 = setTimeout(() => {
        console.log('🏁 TIMEOUT: Setting phase to finish');
        setCurrentPhase('finish');
      }, 8000);
      
      const timeout6 = setTimeout(() => {
        console.log('🏁 TIMEOUT: Setting phase to winner');
        setCurrentPhase('winner');
      }, 9000);
      
      const timeout7 = setTimeout(() => {
        onClose();
      }, 11000);
      
      timeoutsRef.current = [timeout1, timeout2, timeout3, timeout4, timeout5, timeout6, timeout7];
      
      // Cleanup function
      return () => {
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        timeoutsRef.current = [];
        raceSequenceStarted.current = false;
      };
    } else if (isOpen && dream) {
      // Regular dream phases for other categories
      setCurrentPhase('intro');
      setPlaybackProgress(0);
      
      const phases = ['intro', 'action', 'climax', 'outro'];
      const phaseDuration = dream.duration / phases.length;
      
      let phaseIndex = 0;
      const phaseTimer = setInterval(() => {
        phaseIndex++;
        if (phaseIndex < phases.length) {
          setCurrentPhase(phases[phaseIndex]);
          setPlaybackProgress((phaseIndex / phases.length) * 100);
        } else {
          clearInterval(phaseTimer);
          // Auto close after dream ends
          setTimeout(() => onClose(), 1000);
        }
      }, phaseDuration);

      return () => clearInterval(phaseTimer);
    }
    
    // Reset race sequence flag when modal is closed
    if (!isOpen) {
      raceSequenceStarted.current = false;
    }
  }, [isOpen, dream?.id, dream?.category]);


  if (!isOpen || !dream) return null;

  const getMoodFilter = () => {
    switch (dream.mood) {
      case DREAM_MOODS.HAPPY:
        return 'brightness(1.2) saturate(1.3) contrast(1.1)';
      case DREAM_MOODS.PEACEFUL:
        return 'brightness(1.1) saturate(0.8) blur(0.5px)';
      case DREAM_MOODS.MAGICAL:
        return 'hue-rotate(30deg) saturate(1.4) brightness(1.2)';
      case DREAM_MOODS.ADVENTUROUS:
        return 'contrast(1.2) saturate(1.2) brightness(1.1)';
      case DREAM_MOODS.NOSTALGIC:
        return 'sepia(0.3) contrast(0.9) brightness(0.9)';
      default:
        return 'none';
    }
  };

  const getActionAnimation = () => {
    const baseAnimation = getBaseActionAnimation();
    const categoryAnimation = getCategorySpecificAnimation();
    
    // Merge base animation with category-specific modifications
    return {
      ...baseAnimation,
      transition: {
        ...baseAnimation.transition,
        duration: (baseAnimation.transition?.duration || 1) * (dream.categoryConfig?.animations.speed_multiplier || 1)
      }
    };
  };

  const getBaseActionAnimation = () => {
    switch (dream.action) {
      case DREAM_ACTIONS.RUNNING:
      case DREAM_ACTIONS.GALLOPING:
        return { 
          y: ['-5px', '5px', '-5px'],
          rotate: [0, 1, -1, 0],
          scale: [1, 1.02, 1],
          transition: { 
            duration: dream.action === DREAM_ACTIONS.GALLOPING ? 0.4 : 0.6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }
        };
      case DREAM_ACTIONS.FLYING:
        return { y: ['-10px', '10px', '-10px'], transition: { duration: 1.5, repeat: Infinity } };
      case DREAM_ACTIONS.DANCING:
        return { rotate: [-5, 5, -5], scale: [1, 1.05, 1], transition: { duration: 1, repeat: Infinity } };
      default:
        return {};
    }
  };

  const getCategorySpecificAnimation = () => {
    if (!dream.category) return {};
    
    switch (dream.category) {
      case 'race':
        return getRaceAnimation();
      case 'minotaur':
        return getMinotaurAnimation();
      case 'tarot':
        return this.getTarotAnimation();
      default:
        return {};
    }
  };

  const getRaceHorseAnimation = () => {
    const isBackwards = dream.raceVariant === 4;
    
    return {
      // Always include galloping motion
      y: ['-5px', '5px', '-5px'],
      // Racing movement - start immediately after countdown
      x: [0, 0, 0, window.innerWidth + 200], // Stay put for 4s, then race
      // Add flip transform for backwards racing
      scaleX: isBackwards ? -1 : 1,
      transition: {
        y: { duration: 0.4, repeat: Infinity, ease: "easeInOut" },
        x: { 
          times: [0, 0.36, 0.45, 1], // Stay at 0 until 4s (4/11), then move
          duration: 11, // Total dream duration
          ease: "linear" 
        },
        scaleX: { duration: 0 } // No transition for flip
      }
    };
  };

  const getRaceAnimation = () => {
    if (dream.category !== 'race') return {};
    
    console.log('🏁 getRaceAnimation called with phase:', currentPhase);
    
    switch (currentPhase) {
      case 'intro':
      case 'countdown':
        // Horses are stationary, just subtle movement
        console.log('🏁 Applying stationary animation');
        return {
          y: ['-2px', '2px', '-2px'],
          transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        };
      case 'racing':
        // Horses race across the screen
        console.log('🏁 Applying racing animation');
        return {
          x: [0, window.innerWidth + 200], // Move from current position to beyond screen width
          y: ['-5px', '5px', '-5px'], // Galloping motion
          transition: { 
            x: { duration: 4, ease: "linear" },
            y: { duration: 0.4, repeat: Infinity, ease: "easeInOut" }
          }
        };
      case 'finish':
      case 'winner':
        // Horses have finished, stay off-screen
        console.log('🏁 Applying finish animation');
        return {
          x: window.innerWidth + 200,
          y: ['-5px', '5px', '-5px'], // Keep galloping motion
          transition: { 
            x: { duration: 0 },
            y: { duration: 0.4, repeat: Infinity, ease: "easeInOut" }
          }
        };
      default:
        console.log('🏁 No animation for phase:', currentPhase);
        return {};
    }
  };

  const getCategoryPositioningClass = () => {
    if (!dream.category) return 'flex items-center justify-center';
    
    switch (dream.category) {
      case 'race':
        return 'flex items-end justify-center'; // Line them up at bottom like a race start
      case 'minotaur':
        return 'flex items-end justify-center'; // Same as race positioning for chase scene
      case 'tarot':
        return 'flex items-center justify-center'; // Centered for mystical card-like arrangement
      case 'floating':
        return 'flex items-center justify-center'; // Centered for floating formation
      default:
        return 'flex items-center justify-center';
    }
  };

  const getCategoryHorsePosition = (index, totalHorses) => {
    if (!dream.category) {
      return {
        containerClass: '',
        sizeClass: 'w-32 h-32 sm:w-40 sm:h-40 mx-4',
        style: {},
        animation: {}
      };
    }

    switch (dream.category) {
      case 'race':
        // Racing line formation - horses start on left side
        const raceOffset = index * 15; // Stagger horses slightly
        const isMainHorse = index === 0; // First horse is the dreaming horse
        const isRaceVariant2 = dream.raceVariant === 2;
        
        // Different sizes based on race variant
        let sizeClass;
        if (isMainHorse && dream.raceVariant === 2) {
          sizeClass = 'w-64 h-64 sm:w-80 sm:h-80'; // Double size for main horse in variant 2
        } else if (isMainHorse && dream.raceVariant === 3) {
          sizeClass = 'w-16 h-16 sm:w-20 sm:h-20'; // Half size for main horse in variant 3
        } else {
          sizeClass = 'w-32 h-32 sm:w-40 sm:h-40'; // Normal size
        }
        
        // Adjust positioning for Race Dream 3 - tiny main horse goes to front
        let topPosition, zIndex;
        if (dream.raceVariant === 3) {
          if (isMainHorse) {
            // Main tiny horse goes to the front (bottom)
            topPosition = '70%';
            zIndex = 3; // Highest z-index (front)
          } else {
            // Other horses move up
            topPosition = `${40 + (index - 1) * 15}%`;
            zIndex = index; // Lower z-index (behind tiny horse)
          }
        } else {
          // Normal positioning for variants 1 and 2
          topPosition = `${40 + index * 15}%`;
          zIndex = index + 1;
        }

        return {
          containerClass: 'absolute',
          sizeClass,
          style: {
            left: '-15%', // Start further off-screen to the left
            top: topPosition,
            zIndex
          },
          animation: {} // Race animation will be handled in the component
        };
      
      case 'minotaur':
        // Chase scene formation - different based on variant
        const chaseOffset = index * 15; // Stagger horses slightly
        let minotaurSizeClass, minotaurTopPosition;
        
        if (dream.minotaurVariant === 3) {
          // Minotaur Dream 3: Normal size horses circling stationary minotaur
          minotaurSizeClass = 'w-32 h-32 sm:w-40 sm:h-40';
          minotaurTopPosition = '50%'; // Center position for circling
        } else if (dream.minotaurVariant === 2) {
          // Minotaur Dream 2: Horse is double size and chasing
          minotaurSizeClass = 'w-64 h-64 sm:w-80 sm:h-80'; // Double size
          minotaurTopPosition = `${45 + index * 15}%`; // Higher position for larger horse, separated from minotaur
        } else {
          // Minotaur Dream 1: Normal size horse being chased
          minotaurSizeClass = 'w-32 h-32 sm:w-40 sm:h-40';
          minotaurTopPosition = `${65 + index * 15}%`; // Lower position
        }
        
        return {
          containerClass: 'absolute',
          sizeClass: minotaurSizeClass,
          style: dream.minotaurVariant === 3 ? {
            left: '50%', // Center position for circling
            top: minotaurTopPosition,
            transform: 'translate(-50%, -50%)', // Center the horse
            zIndex: index + 1
          } : {
            left: dream.minotaurVariant === 2 ? '-25%' : '-15%', // Variant 2: horse starts further back
            top: minotaurTopPosition,
            zIndex: index + 1
          },
          animation: {} // Chase animation will be handled separately
        };
      
      case 'tarot':
        // Tarot Dream 1: Single horse appears left, trots to just left of center
        return {
          containerClass: 'absolute',
          sizeClass: 'w-32 h-32 sm:w-40 sm:h-40',
          style: {
            left: '-20%', // Start off-screen to the left
            top: '65%',
            transform: 'translateY(-50%)',
            zIndex: 10
          },
          animation: {} // Animation will be handled separately
        };
      
      case 'floating':
        // Floating Dream 1: Horses positioned at different heights for floating formation
        const floatingPositions = [
          { left: '20%', top: '30%' },  // Top left
          { left: '60%', top: '20%' },  // Top right  
          { left: '80%', top: '50%' },  // Middle right
          { left: '40%', top: '70%' },  // Bottom center
          { left: '10%', top: '60%' }   // Middle left
        ];
        
        const position = floatingPositions[index] || { left: '50%', top: '50%' };
        
        return {
          containerClass: 'absolute',
          sizeClass: 'w-28 h-28 sm:w-36 sm:h-36', // Slightly smaller for floating effect
          style: {
            left: position.left,
            top: position.top,
            transform: 'translate(-50%, -50%)',
            zIndex: 10 + index
          },
          animation: {} // Animation will be handled separately
        };
      
      default:
        return {
          containerClass: '',
          sizeClass: 'w-32 h-32 sm:w-40 sm:h-40 mx-4',
          style: {},
          animation: {}
        };
    }
  };

  const getTarotAnimation = () => {
    if (dream.category !== 'tarot') return {};
    
    // Tarot Dream 1: Trotting animation from left to just left of center
    // On mobile, horse needs to travel further to get closer to centered card
    const isMobile = window.innerWidth < 640; // sm breakpoint
    const targetPosition = isMobile ? window.innerWidth * 0.65 : window.innerWidth * 0.19;
    
    return {
      x: [0, targetPosition], // Move to position based on screen size
      y: ['-3px', '3px', '-3px'], // Subtle trotting motion
      transition: {
        x: { duration: 3, ease: "easeInOut", delay: 1 }, // 1 second delay, then 3 second trot
        y: { duration: 0.6, repeat: Infinity, ease: "easeInOut" } // Continuous trotting motion
      }
    };
  };

  const getMinotaurAnimation = () => {
    if (dream.category !== 'minotaur') return {};
    
    if (dream.minotaurVariant === 3) {
      // Minotaur Dream 3: Horses circle around stationary minotaur - return empty for horses, they use circling animation
      return {};
    } else if (dream.minotaurVariant === 2) {
      // Minotaur Dream 2: Horse chases minotaur (horse is double size and behind)
      return {
        x: [-300, window.innerWidth + 100], // Start much further back, chase the minotaur
        y: ['-5px', '5px', '-5px'], // Galloping motion
        transition: {
          x: { duration: 4.2, ease: "linear", repeat: Infinity, repeatDelay: 0 }, // Slightly slower than minotaur being chased
          y: { duration: 0.3, repeat: Infinity, ease: "easeInOut" } // Fast galloping motion
        }
      };
    } else {
      // Minotaur Dream 1: Horse being chased by minotaur
      return {
        x: [-200, window.innerWidth + 200], // Start from off-screen left, race to off-screen right
        y: ['-5px', '5px', '-5px'], // Galloping motion
        transition: {
          x: { duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 0 }, // Continuous looping
          y: { duration: 0.3, repeat: Infinity, ease: "easeInOut" } // Fast galloping motion
        }
      };
    }
  };

  const getFloatingAnimation = (index) => {
    if (dream.category !== 'floating') return {};
    
    // Test mode: use specific pattern if testPatternIndex is set
    const patternIndex = dream.testMode ? dream.testPatternIndex : index;
    
    // Each horse has unique floating patterns for variety
    const floatingPatterns = [
      // Pattern 0: Gentle up-down with slight drift
      {
        y: ['-20px', '20px', '-20px'],
        x: ['-5px', '5px', '-5px'],
        rotate: [0, 2, -2, 0],
        transition: {
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }
      },
      // Pattern 1: Figure-8 floating motion
      {
        y: ['-15px', '0px', '15px', '0px', '-15px'],
        x: ['-10px', '10px', '-10px', '10px', '-10px'],
        rotate: [0, 3, 0, -3, 0],
        transition: {
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
      },
      // Pattern 2: Circular floating motion
      {
        y: ['-10px', '-5px', '10px', '5px', '-10px'],
        x: ['0px', '8px', '0px', '-8px', '0px'],
        scale: [1, 1.05, 1, 0.95, 1],
        transition: {
          y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
      },
      // Pattern 3: Lazy drift with rotation
      {
        y: ['-25px', '15px', '-25px'],
        x: ['-8px', '0px', '8px', '0px', '-8px'],
        rotate: [0, 5, 0, -5, 0],
        transition: {
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }
      },
      // Pattern 4: Bouncy floating
      {
        y: ['-18px', '18px', '-18px'],
        scale: [0.95, 1.1, 0.95],
        rotate: [0, 1, -1, 0],
        transition: {
          y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
      }
    ];
    
    // Use pattern based on patternIndex, cycling through available patterns
    const pattern = floatingPatterns[patternIndex % floatingPatterns.length];
    return pattern;
  };

  const getCirclingAnimation = (index, totalHorses) => {
    // Elliptical orbit parameters for 3D perspective effect - larger to avoid minotaur overlap
    const isMobile = window.innerWidth < 640;
    const radiusX = isMobile ? 140 : 200; // Horizontal radius (wider) - increased from 100/140
    const radiusY = isMobile ? 70 : 100;   // Vertical radius (compressed for perspective) - increased from 40/60
    
    // Fixed positions: 3 horses at 0°, 120°, 240° (equal spacing)
    const startAngle = index * 120; // 0°, 120°, 240°
    
    const animationDuration = 8; // Complete orbit in 8 seconds
    const points = 60; // Smooth animation with many keyframes
    
    // Calculate elliptical path points
    const pathPoints = [];
    const scaleValues = [];
    const flipValues = [];
    
    for (let i = 0; i < points; i++) {
      const progress = i / points;
      const angle = startAngle + (progress * 360); // Current angle in degrees
      const radians = (angle * Math.PI) / 180;
      
      // Elliptical position
      const x = Math.cos(radians) * radiusX;
      const y = Math.sin(radians) * radiusY;
      
      // Perspective scaling based on y-position
      // Front (bottom) = larger scale, Back (top) = smaller scale
      const perspectiveScale = 0.7 + (0.6 * ((y + radiusY) / (radiusY * 2))); // Scale from 0.7 to 1.3
      
      // Sprite flipping based on movement direction
      // Calculate tangent direction to determine if moving left or right
      const nextAngle = angle + 6; // Look ahead 6 degrees
      const nextRadians = (nextAngle * Math.PI) / 180;
      const nextX = Math.cos(nextRadians) * radiusX;
      
      // If next X position is less than current, horse is moving left (flip sprite)
      const shouldFlip = nextX < x;
      
      pathPoints.push({ x, y });
      scaleValues.push(perspectiveScale);
      flipValues.push(shouldFlip ? -1 : 1);
    }
    
    return {
      // Elliptical orbit path
      x: pathPoints.map(p => p.x),
      y: pathPoints.map(p => p.y),
      
      // Perspective scaling (smaller when behind, larger when in front)
      scale: scaleValues,
      
      // Sprite flipping based on movement direction
      scaleX: flipValues.map(flip => flip * scaleValues[flipValues.indexOf(flip)]),
      
      // Walking bounce (subtle vertical bob)
      scaleY: [1, 1.03, 1, 0.97, 1],
      
      transition: {
        x: { 
          duration: animationDuration, 
          ease: "linear", 
          repeat: Infinity,
          times: Array.from({length: points}, (_, i) => i / (points - 1))
        },
        y: { 
          duration: animationDuration, 
          ease: "linear", 
          repeat: Infinity,
          times: Array.from({length: points}, (_, i) => i / (points - 1))
        },
        scale: { 
          duration: animationDuration, 
          ease: "linear", 
          repeat: Infinity,
          times: Array.from({length: points}, (_, i) => i / (points - 1))
        },
        scaleX: { 
          duration: animationDuration, 
          ease: "linear", 
          repeat: Infinity,
          times: Array.from({length: points}, (_, i) => i / (points - 1))
        },
        scaleY: { 
          duration: 1.2, 
          ease: "easeInOut", 
          repeat: Infinity // Walking bounce independent of orbit
        }
      }
    };
  };

  const getCategorySpecialEffects = () => {
    if (!dream.category || !dream.categoryConfig) return null;

    const effects = dream.categoryConfig.specialEffects;
    
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        {/* Special dust clouds for Minotaur Variant 3 */}
        {dream.category === 'minotaur' && dream.minotaurVariant === 3 && (
          <div className="absolute inset-0">
            {/* Dust clouds around the circling path */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * 360) / 8;
              const radius = 140; // Slightly larger than horse circle
              const x = 50 + (Math.cos((angle * Math.PI) / 180) * radius * 0.3); // Convert to percentage
              const y = 50 + (Math.sin((angle * Math.PI) / 180) * radius * 0.3); // Convert to percentage
              
              return (
                <motion.div
                  key={`dust-${i}`}
                  className="absolute w-6 h-6 bg-amber-100 bg-opacity-40 rounded-full"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    scale: [0.5, 1.2, 0.5],
                    opacity: [0.2, 0.6, 0.2],
                    x: [0, Math.random() * 20 - 10, 0],
                    y: [0, Math.random() * 20 - 10, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              );
            })}
            
            {/* Central mystical aura around minotaur */}
            <motion.div
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px'
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div 
                className="w-full h-full rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(139, 69, 19, 0.3) 0%, rgba(160, 82, 45, 0.2) 50%, transparent 70%)'
                }}
              />
            </motion.div>
          </div>
        )}
        
        {effects.map((effect, index) => (
          <div key={effect}>
            {effect === 'speed_lines' && (
              <motion.div
                className="absolute inset-0"
                animate={{
                  backgroundImage: [
                    'repeating-linear-gradient(90deg, transparent 0px, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 7px)',
                    'repeating-linear-gradient(90deg, transparent 0px, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 7px)'
                  ]
                }}
                transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
              />
            )}
            
            {effect === 'floating_cards' && (
              [...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-12 bg-purple-200 bg-opacity-60 rounded-lg border border-purple-400"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${10 + i * 15}%`
                  }}
                  animate={{
                    y: ['-10px', '10px', '-10px'],
                    rotate: [0, 5, -5, 0],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
              ))
            )}
            
            {effect === 'crystal_sparkles' && (
              [...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-sm"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    color: `hsl(${Math.random() * 360}, 70%, 80%)`
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 360],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4
                  }}
                >
                  ✦
                </motion.div>
              ))
            )}
          </div>
        ))}
      </div>
    );
  };



  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 shadow-2xl max-w-5xl w-full mx-4"
          style={{ 
            maxHeight: '96vh', // 20% bigger than 80vh
            aspectRatio: '16/10',
            filter: getMoodFilter(),
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', // Organic cloud-like shape
            boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.3), 0 0 30px rgba(147, 197, 253, 0.4)'
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            borderRadius: [
              '60% 40% 30% 70% / 60% 30% 70% 40%',
              '40% 60% 70% 30% / 40% 70% 30% 60%',
              '60% 40% 30% 70% / 60% 30% 70% 40%'
            ]
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ 
            scale: { duration: 0.5 },
            opacity: { duration: 0.5 },
            borderRadius: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Floating cloud particles around the dream - skip for race dreams */}
          {dream.category !== 'race' && [...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white bg-opacity-40 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                zIndex: -1
              }}
              animate={{
                x: [0, Math.random() * 20 - 10, 0],
                y: [0, Math.random() * 15 - 7.5, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Dream content area */}
          <div 
            className="relative w-full h-full overflow-hidden"
            style={{ borderRadius: 'inherit' }}
          >
            {/* Background setting */}
            {dream.setting.path ? (
              <motion.img
                src={dream.setting.path}
                alt={dream.setting.name}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: currentPhase === 'climax' ? 1.2 : 1.1 }}
                transition={{ duration: 2 }}
                style={{ zIndex: 0 }}
              />
            ) : (
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${getSettingGradient(dream.setting.name)}`}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: currentPhase === 'climax' ? 1 : 0.8 }}
                transition={{ duration: 2 }}
                style={{ zIndex: 0 }}
              />
            )}


            {/* Category-specific special effects */}
            {getCategorySpecialEffects()}

            {/* Race-specific countdown and winner display */}
            {dream.category === 'race' && (
              <>
                {/* Countdown display */}
                {currentPhase === 'countdown' && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 15 }}>
                    <motion.div
                      className="text-8xl font-bold text-white text-shadow-lg"
                      style={{ 
                        textShadow: '4px 4px 8px rgba(0,0,0,0.8)',
                        filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))'
                      }}
                      key={currentPhase}
                      animate={{
                        scale: [2, 1],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        times: [0, 0.1, 0.8, 1],
                        ease: "easeOut"
                      }}
                    >
                      {countdownNumber}
                    </motion.div>
                  </div>
                )}

                {/* Winner display */}
                {currentPhase === 'winner' && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 15 }}>
                    <motion.div
                      className="text-6xl font-bold text-yellow-300"
                      style={{ 
                        textShadow: '4px 4px 8px rgba(0,0,0,0.8)',
                        filter: 'drop-shadow(0 0 30px rgba(255,255,0,0.8))'
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.2, 1],
                        opacity: [0, 1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 1,
                        ease: "easeOut"
                      }}
                    >
                      {dream.raceVariant === 2 ? 'Winner!' : dream.raceVariant === 3 ? 'Loser!' : dream.raceVariant === 4 ? '???' : 'Winner?'}
                    </motion.div>
                  </div>
                )}
              </>
            )}

            {/* Tarot card for tarot dreams */}
            {dream.category === 'tarot' && dream.tarotCard && (
              <div className="absolute" style={{ left: '50%', top: '55%', transform: 'translate(-50%, -50%)', zIndex: 15 }}>
                <motion.img
                  src={dream.tarotCard}
                  alt="Tarot Card"
                  className="w-48 h-80 sm:w-64 sm:h-104 object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.8))',
                  }}
                  initial={{ opacity: 0, scale: 0.5, y: -20 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: ['-10px', '10px', '-10px'], // Floating motion
                    rotate: [0, 2, -2, 0] // Gentle sway
                  }}
                  transition={{
                    opacity: { duration: 1, delay: 2 }, // Appear after 2 seconds
                    scale: { duration: 1, delay: 2 },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  onError={(e) => {
                    console.error('🔮 Failed to load tarot card:', dream.tarotCard, e);
                  }}
                />
              </div>
            )}

            {/* Subjects (horses) */}
            <div className={`absolute inset-0 ${getCategoryPositioningClass()}`} style={{ zIndex: 10 }}>
              {(dream.category === 'minotaur' && dream.minotaurVariant === 3) || dream.category === 'scarecrow' ? (
                // Special rendering for circling dreams (minotaur variant 3 and scarecrow)
                dream.subjects.map((subject, index) => {
                  console.log('🐎 Rendering circling horse:', subject.name, 'at position:', index);
                  const circlingAnimation = getCirclingAnimation(index, dream.subjects.length);
                  
                  return (
                    <motion.div
                      key={`${subject.name}_${index}`}
                      className="absolute"
                      style={{
                        left: '50%',
                        top: '65%',
                        transform: 'translate(-50%, -50%)'
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.3, duration: 1 }}
                    >
                      <motion.img
                        src={subject.path}
                        alt={subject.name}
                        className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                        animate={circlingAnimation}
                        style={{
                          // Simple: all circling horses stay behind the minotaur
                          zIndex: 3
                        }}
                        onError={(e) => {
                          console.error('🐎 Failed to load horse image:', subject.path, e);
                        }}
                        onLoad={() => {
                          console.log('🐎 Successfully loaded horse image:', subject.path);
                        }}
                      />
                    </motion.div>
                  );
                })
              ) : dream.category === 'horse_specific' ? (
                // Special rendering for horse specific dreams
                dream.horseSpecificVariant === 1 ? (
                  // Variant 1: Business Horse
                  <motion.div
                    key="business_horse"
                    className="absolute"
                    style={{
                      left: '40%',
                      top: '45%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                  >
                    <motion.img
                      src="/horses/businesshorse.png"
                      alt="Business Horse"
                      className="w-80 h-80 sm:w-107 sm:h-107 object-contain"
                      animate={{
                        // Subtle idle animation
                        y: ['-2px', '2px', '-2px'],
                        rotate: [0, 1, -1, 0],
                        transition: {
                          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                          rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }
                      }}
                      onError={(e) => {
                        console.error('🐎 Failed to load business horse image:', e);
                      }}
                      onLoad={() => {
                        console.log('🐎 Successfully loaded business horse image');
                      }}
                    />
                  </motion.div>
                ) : dream.horseSpecificVariant === 2 ? (
                  // Variant 2: Traffic Dream with horsecar and motohorse
                  <>
                    {/* HorseCar */}
                    <motion.div
                      key="horsecar"
                      className="absolute"
                      style={{
                        left: '0%', // Start at screen edge (moved even further right)
                        top: '60%',
                        transform: 'translateY(-50%)',
                        zIndex: 8
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        x: [0, window.innerWidth * 0.3, window.innerWidth * 0.3, window.innerWidth + 200], // Drive to center, stop, then continue
                      }}
                      transition={{
                        opacity: { duration: 0.5 },
                        x: { 
                          times: [0, 0.3, 0.7, 1], // 30% to center, 40% pause, 30% continue
                          duration: 8, 
                          ease: "linear" 
                        }
                      }}
                    >
                      <motion.img
                        src="/horses/horsecar.png"
                        alt="Horse Car"
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                        animate={{
                          // Subtle engine idle vibration
                          y: ['-1px', '1px', '-1px'],
                        }}
                        transition={{
                          y: { duration: 0.3, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    </motion.div>

                    {/* MotoHorse */}
                    <motion.div
                      key="motohorse"
                      className="absolute"
                      style={{
                        left: '-5%', // Start further back (moved even further right)
                        top: '60%',
                        transform: 'translateY(-50%)',
                        zIndex: 7
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        x: [0, window.innerWidth * 0.15], // Drive up behind horsecar
                      }}
                      transition={{
                        opacity: { duration: 0.5, delay: 1 }, // Appear 1 second later
                        x: { 
                          duration: 3, 
                          delay: 1.5, // Start moving 1.5 seconds after appearing
                          ease: "easeOut" 
                        }
                      }}
                    >
                      <motion.img
                        src="/horses/motohorse.png"
                        alt="Moto Horse"
                        className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                        animate={{
                          // Engine vibration
                          y: ['-1px', '1px', '-1px'],
                        }}
                        transition={{
                          y: { duration: 0.2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    </motion.div>
                  </>
                ) : (
                  // Variant 3: Alien Reunion Dream with horse5.png aliens
                  <>
                    {/* Main alien (horse5) jumping from left */}
                    <motion.div
                      key="main_alien"
                      className="absolute"
                      style={{
                        left: '-10%',
                        top: '60%',
                        transform: 'translateY(-50%)',
                        zIndex: 10
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        x: [0, window.innerWidth * 0.4], // Jump to center-left and stop
                      }}
                      transition={{
                        opacity: { duration: 0.5 },
                        x: { 
                          duration: 2,
                          ease: "easeOut"
                        }
                      }}
                    >
                      <motion.img
                        src="/horses/horse5.png"
                        alt="Alien Horse"
                        className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                        animate={{
                          // Excited bouncing motion
                          y: ['-10px', '5px', '-10px'],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          y: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
                          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    </motion.div>

                    {/* Group of 6 aliens rushing from right */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={`alien_${i}`}
                        className="absolute"
                        style={{
                          left: `${70 + i * 5}%`, // Start much closer to screen, tightly grouped
                          top: `${55 + (i % 2) * 6}%`, // Only 2 rows instead of 3, smaller vertical spread
                          transform: 'translateY(-50%)',
                          zIndex: 8 // All crowd aliens have the same z-index
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: 1,
                          x: [0, -window.innerWidth * 0.5], // All rush the same distance toward center
                        }}
                        transition={{
                          opacity: { duration: 0.3, delay: 1.5 + i * 0.1 },
                          x: { 
                            duration: 1.5,
                            delay: 1.5 + i * 0.1,
                            ease: "easeInOut"
                          }
                        }}
                      >
                        <motion.img
                          src="/horses/horse5.png"
                          alt={`Alien Horse ${i}`}
                          className="w-38 h-38 sm:w-46 sm:h-46 object-contain"
                          animate={{
                            // Running motion
                            y: ['-3px', '3px', '-3px'],
                            scaleX: [-1, -1, -1], // Flipped to face left (toward main alien)
                            scale: [1, 1, 1], // Ensure consistent scale
                          }}
                          transition={{
                            y: { duration: 0.4, repeat: Infinity, ease: "easeInOut" },
                            scaleX: { duration: 0 }
                          }}
                        />
                      </motion.div>
                    ))}
                  </>
                )
              ) : (
                // Regular rendering for all other dream types
                dream.subjects.map((subject, index) => {
                  console.log('🐎 Rendering dream horse:', subject.name, 'path:', subject.path);
                  const horsePosition = getCategoryHorsePosition(index, dream.subjects.length);
                  return (
                    <motion.div
                      key={`${subject.name}_${index}`}
                      className={horsePosition.containerClass}
                      style={horsePosition.style}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0 }}
                    >
                      <motion.img
                        src={subject.path}
                        alt={subject.name}
                        className={`${horsePosition.sizeClass} object-contain`}
                        animate={
                          dream.category === 'race' ? getRaceHorseAnimation() : 
                          dream.category === 'tarot' ? getTarotAnimation() : 
                          dream.category === 'minotaur' ? getMinotaurAnimation() :
                          dream.category === 'floating' ? getFloatingAnimation(index) :
                          getActionAnimation()
                        }
                        onError={(e) => {
                          console.error('🐎 Failed to load horse image:', subject.path, e);
                        }}
                        onLoad={() => {
                          console.log('🐎 Successfully loaded horse image:', subject.path);
                        }}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Minotaur in minotaur dreams */}
            {dream.category === 'minotaur' && (
              <div className="absolute inset-0" style={{ zIndex: dream.minotaurVariant === 3 ? 6 : dream.minotaurVariant === 2 ? 8 : 9 }}>
                <motion.div
                  className="absolute"
                  style={{
                    left: dream.minotaurVariant === 3 ? '50%' : dream.minotaurVariant === 2 ? '-10%' : '-25%', // Variant 3: center, others as before
                    top: dream.minotaurVariant === 3 ? '65%' : dream.minotaurVariant === 2 ? '60%' : '60%',
                    transform: dream.minotaurVariant === 3 ? 'translate(-50%, -50%)' : 'none', // Center for variant 3
                    zIndex: dream.minotaurVariant === 2 ? 8 : 9
                  }}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.img
                    src="/maze/minotaur.png"
                    alt="Minotaur"
                    className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                    animate={
                      dream.minotaurVariant === 3 ? {
                        // Variant 3: Stationary minotaur with enhanced presence and idle animation
                        y: ['-3px', '3px', '-3px'], // Deeper breathing motion
                        rotate: [0, 3, -3, 0], // More pronounced head movement  
                        scale: [1, 1.02, 1, 0.98, 1], // Subtle size pulsing for intimidation
                        // Add shoulder sway for more dynamic presence
                        skewX: [0, 1, 0, -1, 0],
                        // Slight color tinting to emphasize the minotaur's power
                        filter: [
                          'hue-rotate(0deg) saturate(1) brightness(1)',
                          'hue-rotate(5deg) saturate(1.1) brightness(1.05)',
                          'hue-rotate(0deg) saturate(1) brightness(1)',
                          'hue-rotate(-5deg) saturate(1.1) brightness(0.95)',
                          'hue-rotate(0deg) saturate(1) brightness(1)'
                        ],
                        transition: {
                          y: { 
                            duration: 2.5, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          },
                          rotate: { 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          },
                          scale: { 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0.5 
                          },
                          skewX: { 
                            duration: 5, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 1 
                          },
                          filter: {
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }
                      } : dream.minotaurVariant === 2 ? {
                        // Variant 2: Minotaur being chased (runs faster)
                        x: [-100, window.innerWidth + 200], // Starts much closer to screen, ahead of horse
                        y: ['-3px', '3px', '-3px'], // Running motion
                        transition: {
                          x: { duration: 3.8, ease: "linear", repeat: Infinity, repeatDelay: 0 }, // Slightly faster than chasing horse
                          y: { duration: 0.4, repeat: Infinity, ease: "easeInOut" } // Running motion
                        }
                      } : {
                        // Variant 1: Minotaur chasing (slower)
                        x: [-250, window.innerWidth + 150], // Start further back, chase across screen
                        y: ['-3px', '3px', '-3px'], // Running motion
                        transition: {
                          x: { duration: 4.5, ease: "linear", repeat: Infinity, repeatDelay: 0 }, // Continuous looping, slightly slower than horse
                          y: { duration: 0.4, repeat: Infinity, ease: "easeInOut" } // Running motion
                        }
                      }
                    }
                    onError={(e) => {
                      console.error('🐎 Failed to load minotaur image:', e);
                    }}
                    onLoad={() => {
                      console.log('🐎 Successfully loaded minotaur image');
                    }}
                  />
                </motion.div>
              </div>
            )}

            {/* Scarecrow in scarecrow dreams */}
            {dream.category === 'scarecrow' && (
              <div className="absolute inset-0" style={{ zIndex: 6 }}>
                <motion.div
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '70%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 6
                  }}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.img
                    src="/stable/scarecrow.png"
                    alt="Scarecrow"
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                    animate={{
                      // Scarecrow idle animation - gentle swaying in the breeze
                      rotate: [0, 2, -2, 0], // Gentle swaying
                      y: ['-2px', '2px', '-2px'], // Subtle vertical movement
                      scale: [1, 1.01, 1], // Very subtle breathing
                      transition: {
                        rotate: { 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        },
                        y: { 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        },
                        scale: { 
                          duration: 5, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: 0.5 
                        }
                      }
                    }}
                    onError={(e) => {
                      console.error('🐎 Failed to load scarecrow image:', e);
                    }}
                    onLoad={() => {
                      console.log('🐎 Successfully loaded scarecrow image');
                    }}
                  />
                </motion.div>
              </div>
            )}

            {/* Text overlay for horse specific dreams */}
            {dream.category === 'horse_specific' && dream.horseSpecificVariant === 1 && (
              <div className="absolute inset-0 flex items-start justify-center pt-48" style={{ zIndex: 15 }}>
                <motion.div
                  className="bg-black bg-opacity-70 px-8 py-4 rounded-lg"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 1 }}
                >
                  <motion.p
                    className="text-white text-xl sm:text-2xl font-semibold text-center"
                    style={{ 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontFamily: 'serif'
                    }}
                    animate={{
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    "I had the weirdest dream I was a race horse..."
                  </motion.p>
                </motion.div>
              </div>
            )}
            
            {/* BEEP BEEP text for traffic dream */}
            {dream.category === 'horse_specific' && dream.horseSpecificVariant === 2 && (
              <motion.div
                className="absolute"
                style={{
                  left: '15%', // Position over motohorse
                  top: '45%',
                  zIndex: 20
                }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 0, 1, 1, 0], // Stay invisible, then appear, then fade
                  y: [0, 0, -60] // Float upward
                }}
                transition={{
                  opacity: { 
                    times: [0, 0.6, 0.65, 0.85, 1], // Wait 60% of time, then appear and fade
                    duration: 8 
                  },
                  y: { 
                    times: [0, 0.6, 1], // Start floating at 60% of time
                    duration: 8,
                    ease: "easeOut" 
                  }
                }}
              >
                <motion.div
                  className="text-3xl sm:text-4xl font-bold text-yellow-400"
                  style={{ 
                    textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                    filter: 'drop-shadow(0 0 10px rgba(255,255,0,0.6))'
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [-2, 2, -2]
                  }}
                  transition={{
                    scale: { duration: 0.5, repeat: 3 }, // Pulse 3 times while visible
                    rotate: { duration: 0.3, repeat: 6 } // Wobble while visible
                  }}
                >
                  BEEP BEEP
                </motion.div>
              </motion.div>
            )}
            
            {/* Heart emojis for alien reunion dream */}
            {dream.category === 'horse_specific' && dream.horseSpecificVariant === 3 && (
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`heart_${i}`}
                    className="absolute text-4xl"
                    style={{
                      left: `${45 + Math.random() * 20}%`, // Around the center where aliens meet
                      top: `${65 + Math.random() * 10}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 0, 1, 1, 0], // Wait for aliens to meet, then appear
                      scale: [0, 0, 1.2, 1, 0.8],
                      y: [0, 0, -80, -120], // Float upward
                      rotate: [0, 0, Math.random() * 30 - 15] // Slight random rotation
                    }}
                    transition={{
                      opacity: { 
                        times: [0, 0.6, 0.65, 0.85, 1], // Wait 60% of time for aliens to meet
                        duration: 8,
                        delay: i * 0.2 // Stagger the hearts
                      },
                      scale: { 
                        times: [0, 0.6, 0.7, 0.8, 1],
                        duration: 8,
                        delay: i * 0.2
                      },
                      y: { 
                        times: [0, 0.6, 0.8, 1],
                        duration: 8,
                        delay: i * 0.2,
                        ease: "easeOut" 
                      },
                      rotate: {
                        times: [0, 0.6, 1],
                        duration: 8,
                        delay: i * 0.2
                      }
                    }}
                  >
                    💖
                  </motion.div>
                ))}
              </div>
            )}

            {/* Mood effects overlay - skip for race dreams */}
            {dream.category !== 'race' && dream.mood === DREAM_MOODS.MAGICAL && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-full h-full bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-30"></div>
              </motion.div>
            )}

            {/* Sparkles for happy dreams - skip for race dreams */}
            {dream.category !== 'race' && dream.mood === DREAM_MOODS.HAPPY && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl text-yellow-400"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white bg-opacity-30 rounded-full h-2">
                <motion.div
                  className="bg-white h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${playbackProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-all text-lg"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper function for setting gradients
const getSettingGradient = (settingName) => {
  switch (settingName) {
    case DREAM_SETTINGS.BEACH:
      return 'from-blue-400 via-blue-300 to-yellow-200';
    case DREAM_SETTINGS.FOREST:
      return 'from-green-600 via-green-400 to-green-200';
    case DREAM_SETTINGS.MEADOW:
      return 'from-green-300 via-green-200 to-yellow-100';
    case DREAM_SETTINGS.MOUNTAINS:
      return 'from-gray-600 via-gray-400 to-blue-200';
    case DREAM_SETTINGS.SUNSET:
      return 'from-orange-500 via-pink-400 to-purple-300';
    default:
      return 'from-blue-200 via-purple-200 to-pink-200';
  }
};

// Main Dream System Component  
export const DreamSystem = forwardRef(({ horses, onDreamGenerated }, ref) => {
  const [activeDream, setActiveDream] = useState(null);
  const [dreamModalOpen, setDreamModalOpen] = useState(false);
  const [dreamingHorse, setDreamingHorse] = useState(null);
  const dreamComposer = useRef(new DreamComposer()).current;

  const handleDreamBubbleClick = (horse) => {
    const dream = dreamComposer.generateDream(horse, horses);
    setActiveDream(dream);
    setDreamingHorse(horse);
    setDreamModalOpen(true);
    
    if (onDreamGenerated) {
      onDreamGenerated(dream, horse);
    }
  };

  // Method to generate a specific category dream (can be called externally)
  const generateCategoryDream = (category, horse = null) => {
    const targetHorse = horse || horses.find(h => h.energy < 25);
    if (!targetHorse) return null;
    
    const dream = dreamComposer.generateCategoryDream(category, targetHorse, horses);
    setActiveDream(dream);
    setDreamingHorse(targetHorse);
    setDreamModalOpen(true);
    
    if (onDreamGenerated) {
      onDreamGenerated(dream, targetHorse);
    }
    
    return dream;
  };

  // Test mode for floating animations
  const generateFloatingTestDream = (patternIndex) => {
    const targetHorse = horses.find(h => h.energy < 25) || horses[0];
    if (!targetHorse) return null;
    
    // Create a test dream with specific pattern
    const testDream = {
      id: `test_dream_${Date.now()}`,
      category: DREAM_CATEGORIES.FLOATING,
      categoryConfig: CATEGORY_CONFIGS[DREAM_CATEGORIES.FLOATING],
      subjects: [dreamComposer.formatHorseForDream(targetHorse)], // Single horse for testing
      setting: dreamComposer.getCategorySetting(DREAM_CATEGORIES.FLOATING),
      action: DREAM_ACTIONS.FLYING,
      mood: DREAM_MOODS.MAGICAL,
      duration: 10000, // Longer duration for testing
      timestamp: Date.now(),
      floatingVariant: 1,
      testMode: true,
      testPatternIndex: patternIndex // Force specific pattern
    };
    
    setActiveDream(testDream);
    setDreamingHorse(targetHorse);
    setDreamModalOpen(true);
    
    return testDream;
  };

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    generateCategoryDream,
    generateRandomDream: (horse) => handleDreamBubbleClick(horse),
    getCurrentDream: () => activeDream,
    closeDream: handleCloseDream,
    testFloatingAnimation: generateFloatingTestDream
  }));

  const handleCloseDream = () => {
    setDreamModalOpen(false);
    setActiveDream(null);
    setDreamingHorse(null);
  };

  return (
    <>
      {/* Dream bubbles for sleeping horses */}
      {horses && horses.map((horse, index) => (
        horse.energy < 25 && (
          <DreamBubble
            key={`dream_bubble_${horse.id || index}`}
            horse={horse}
            onDreamClick={handleDreamBubbleClick}
            className="dream-bubble"
          />
        )
      ))}

      {/* Dream modal */}
      <DreamModal
        isOpen={dreamModalOpen}
        onClose={handleCloseDream}
        dream={activeDream}
        horse={dreamingHorse}
      />
    </>
  );
});

DreamSystem.displayName = 'DreamSystem';

export default DreamSystem;