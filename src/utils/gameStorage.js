const STORAGE_KEY = 'horseRaceGame';
const STORAGE_VERSION = '1.0';

const defaultGameState = {
  coins: 1000,
  unlockedHorses: null, // Will be initialized in App.js
  fastestTime: null,
  history: [],
  horseInventories: {},
  horseSkills: {},
  horseSkillPoints: {},
  researchPoints: 0,
  customHorseNames: {}, // Store custom names by horse index
  version: STORAGE_VERSION
};

export const gameStorage = {
  save: (gameState) => {
    try {
      const dataToSave = {
        ...gameState,
        version: STORAGE_VERSION,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.warn('Failed to save game state:', error);
      return false;
    }
  },

  load: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return defaultGameState;
      }

      const parsed = JSON.parse(saved);
      
      // Version compatibility check
      if (parsed.version !== STORAGE_VERSION) {
        console.log('Game data version mismatch, using defaults');
        return defaultGameState;
      }

      // Validate required fields
      const loadedState = {
        coins: typeof parsed.coins === 'number' ? parsed.coins : defaultGameState.coins,
        unlockedHorses: Array.isArray(parsed.unlockedHorses) ? parsed.unlockedHorses : null,
        fastestTime: typeof parsed.fastestTime === 'number' ? parsed.fastestTime : null,
        history: Array.isArray(parsed.history) ? parsed.history : [],
        horseInventories: typeof parsed.horseInventories === 'object' && parsed.horseInventories !== null ? parsed.horseInventories : {},
        horseSkills: typeof parsed.horseSkills === 'object' && parsed.horseSkills !== null ? parsed.horseSkills : {},
        horseSkillPoints: typeof parsed.horseSkillPoints === 'object' && parsed.horseSkillPoints !== null ? parsed.horseSkillPoints : {},
        researchPoints: typeof parsed.researchPoints === 'number' ? parsed.researchPoints : defaultGameState.researchPoints,
        customHorseNames: typeof parsed.customHorseNames === 'object' && parsed.customHorseNames !== null ? parsed.customHorseNames : {},
        version: STORAGE_VERSION
      };

      return loadedState;
    } catch (error) {
      console.warn('Failed to load game state:', error);
      return defaultGameState;
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn('Failed to clear game state:', error);
      return false;
    }
  },

  // Check if localStorage is available
  isAvailable: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get save info without loading full state
  getSaveInfo: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      return {
        version: parsed.version,
        timestamp: parsed.timestamp,
        coins: parsed.coins,
        unlockedHorsesCount: Array.isArray(parsed.unlockedHorses) 
          ? parsed.unlockedHorses.filter(Boolean).length 
          : 0,
        raceHistoryCount: Array.isArray(parsed.history) ? parsed.history.length : 0,
        inventoryItemCount: parsed.horseInventories 
          ? Object.values(parsed.horseInventories).reduce((total, inventory) => total + (inventory?.length || 0), 0)
          : 0
      };
    } catch (error) {
      return null;
    }
  }
};