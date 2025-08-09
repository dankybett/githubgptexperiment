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
  
  // Placeholder for future themes - you can add new themes here
  modern: {
    name: 'Modern',
    description: 'Clean modern design (coming soon)',
    // Will be implemented when you create your new theme
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