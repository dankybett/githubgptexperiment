/**
 * App Theme System
 * 
 * Defines different visual themes for the entire application.
 * Each theme includes colors, fonts, button styles, and component styling.
 */

export const THEMES = {
  retro: {
    name: 'Retro Racing',
    description: 'Classic colorful racing theme with gradients',
    
    // Global styles
    fonts: {
      primary: 'system-ui, -apple-system, sans-serif',
      heading: 'system-ui, -apple-system, sans-serif',
    },
    
    // Color palette
    colors: {
      primary: 'blue',
      secondary: 'purple',
      accent: 'yellow',
      success: 'green',
      warning: 'orange',
      danger: 'red',
      
      // Background gradients
      mainBg: 'from-blue-400 via-purple-400 to-pink-400',
      cardBg: 'bg-white bg-opacity-95',
      headerBg: 'bg-gradient-to-r from-blue-400 to-purple-400',
    },
    
    // Component styles
    components: {
      button: {
        primary: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600',
        secondary: 'bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold shadow-lg hover:from-green-600 hover:to-blue-600',
        danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:from-red-600 hover:to-pink-600',
        muted: 'bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300',
      },
      
      card: 'bg-white bg-opacity-95 rounded-2xl shadow-lg border-2 border-gray-200',
      
      input: 'w-full p-3 border-2 border-gray-300 rounded-xl bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-opacity-100',
      
      modal: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
      modalContent: 'bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto',
      
      // Race track specific
      raceTrack: {
        background: 'from-green-400 to-green-600',
        lane: 'bg-green-100 bg-opacity-60 border-2 border-green-700 rounded-xl',
        finishLine: 'bg-red-600',
      },
      
      // Winner modal
      winner: {
        background: 'bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200',
        text: 'text-yellow-800',
      },
    },
  },
  
  arcade: {
    name: 'Arcade Rush',
    description: 'High-energy arcade vibes with bold colors and electric gradients',
    
    // Global styles
    fonts: {
      primary: '"Segoe UI", system-ui, -apple-system, sans-serif',
      heading: '"Segoe UI", system-ui, -apple-system, sans-serif',
      weight: 'font-bold', // Make everything bold for arcade feel
    },
    
    // Color palette - bright saturated primaries with purple-pink gradient
    colors: {
      primary: 'blue',
      secondary: 'purple',
      accent: 'yellow',
      success: 'green',
      warning: 'orange', 
      danger: 'red',
      
      // Arcade-inspired background gradients
      mainBg: 'from-purple-600 via-pink-500 to-purple-700',
      cardBg: 'bg-gray-900 bg-opacity-95',
      headerBg: 'bg-gradient-to-r from-purple-600 to-pink-500',
    },
    
    // Component styles - high energy arcade aesthetic
    components: {
      button: {
        primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-black shadow-xl hover:from-blue-400 hover:to-blue-500 border-2 border-blue-300 transform hover:scale-105 transition-all',
        secondary: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg font-black shadow-xl hover:from-yellow-300 hover:to-yellow-400 border-2 border-yellow-300 transform hover:scale-105 transition-all',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-black shadow-xl hover:from-red-400 hover:to-red-500 border-2 border-red-300 transform hover:scale-105 transition-all',
        muted: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-black shadow-xl hover:from-gray-500 hover:to-gray-600 border-2 border-gray-400 transform hover:scale-105 transition-all',
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-black shadow-xl hover:from-green-400 hover:to-green-500 border-2 border-green-300 transform hover:scale-105 transition-all',
        warning: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-black shadow-xl hover:from-orange-400 hover:to-orange-500 border-2 border-orange-300 transform hover:scale-105 transition-all',
      },
      
      card: 'bg-gray-900 bg-opacity-95 rounded-xl shadow-2xl border-2 border-purple-400 backdrop-blur-sm',
      
      input: 'w-full p-3 border-3 border-purple-400 rounded-xl bg-gray-900 bg-opacity-90 text-white placeholder-gray-300 focus:outline-none focus:border-pink-400 focus:bg-opacity-100 focus:shadow-lg focus:shadow-purple-500/50 font-bold',
      
      modal: 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm',
      modalContent: 'bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-purple-400',
      
      // Race track specific - electric gaming vibe
      raceTrack: {
        background: 'from-gray-800 to-gray-900',
        lane: 'bg-gray-800 bg-opacity-80 border-2 border-purple-400 rounded-xl shadow-lg shadow-purple-500/30',
        finishLine: 'bg-gradient-to-r from-pink-500 to-purple-500',
      },
      
      // Winner modal - celebration explosion
      winner: {
        background: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600',
        text: 'text-white',
        border: 'border-4 border-white shadow-2xl',
      },
      
      // Leader styling - electric glow
      leader: {
        background: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
        text: 'text-gray-900',
        glow: 'shadow-lg shadow-yellow-400/50 ring-2 ring-yellow-300',
      },
    },
  },
};

// Default theme
export const DEFAULT_THEME = 'retro';

// Theme utilities
export const themeUtils = {
  // Get current theme object
  getCurrentTheme: (themeName = DEFAULT_THEME) => {
    return THEMES[themeName] || THEMES[DEFAULT_THEME];
  },
  
  // Get available theme names
  getThemeNames: () => {
    return Object.keys(THEMES);
  },
  
  // Get theme list for UI
  getThemeList: () => {
    return Object.entries(THEMES).map(([key, theme]) => ({
      key,
      name: theme.name,
      description: theme.description,
    }));
  },
  
  // Apply theme classes helper
  applyTheme: (theme, componentType, variant = 'primary') => {
    const currentTheme = themeUtils.getCurrentTheme(theme);
    
    if (componentType === 'button') {
      return currentTheme.components.button[variant] || currentTheme.components.button.primary;
    }
    
    if (componentType === 'card') {
      return currentTheme.components.card;
    }
    
    if (componentType === 'input') {
      return currentTheme.components.input;
    }
    
    // Add more component types as needed
    return '';
  },
};