/**
 * Comprehensive App Theme System
 * 
 * Defines complete visual themes for all application screens and components.
 * Each theme provides consistent styling across title, race, stable, and labyrinth screens.
 */

export const THEMES = {
  retro: {
    name: 'Retro Racing',
    description: 'Classic colorful racing theme with gradients',
    
    // Global styles
    fonts: {
      primary: 'system-ui, -apple-system, sans-serif',
      heading: 'system-ui, -apple-system, sans-serif',
      display: 'system-ui, -apple-system, sans-serif',
    },
    
    // Color palette
    colors: {
      primary: '#3b82f6', // blue-500
      secondary: '#8b5cf6', // violet-500
      accent: '#fbbf24', // amber-400
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      danger: '#ef4444', // red-500
      
      // Text colors
      textPrimary: '#1f2937', // gray-800
      textSecondary: '#6b7280', // gray-500
      textLight: '#ffffff',
      
      // Background gradients
      mainBg: 'from-blue-400 via-purple-400 to-pink-400',
      cardBg: 'bg-white bg-opacity-95',
      headerBg: 'from-blue-400 to-purple-400',
    },
    
    // Screen-specific styles
    screens: {
      title: {
        background: 'from-blue-900 via-purple-900 to-green-900',
        titleGradient: 'from-yellow-300 via-pink-300 to-cyan-300',
        subtitle: 'text-yellow-200',
      },
      
      race: {
        setup: {
          background: 'from-gray-800 via-gray-900 to-black',
          cardBackground: 'bg-white bg-opacity-20 backdrop-blur-sm',
        },
        track: {
          background: 'from-green-400 to-green-600',
          lane: 'bg-green-100 bg-opacity-60 border-2 border-green-700 rounded-xl',
          finishLine: 'bg-red-600',
        }
      },
      
      stable: {
        background: 'from-gray-800 via-gray-900 to-black',
        header: 'rgba(0, 0, 0, 0.8)',
        panel: 'rgba(146, 64, 14, 0.9)',
        panelBorder: '#d97706',
      },
      
      labyrinth: {
        background: 'from-gray-800 via-gray-900 to-black',
        wall: '#4b5563', // gray-600
        floor: '#6b7280', // gray-500
        reward: '#fbbf24', // amber-400
        trap: '#ef4444', // red-500
      }
    },
    
    // Component styles
    components: {
      button: {
        // Retro button classes map to these colors
        primary: 'btn-retro btn-retro-blue', // Uses CSS classes
        secondary: 'btn-retro btn-retro-purple',
        success: 'btn-retro btn-retro-green',
        warning: 'btn-retro btn-retro-yellow',
        danger: 'btn-retro btn-retro-red',
        muted: 'btn-retro btn-retro-gray',
        settings: 'btn-retro btn-retro-settings',
      },
      
      card: 'bg-white bg-opacity-95 rounded-2xl shadow-lg border-2 border-gray-200',
      
      input: 'w-full p-3 border-2 border-gray-300 rounded-xl bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:bg-opacity-100',
      
      modal: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
      modalContent: 'bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto',
    },
  },
  
  arcade: {
    name: 'Countryside Estate',
    description: 'Natural, earthy tones perfect for horse racing and stable management',
    
    // Global styles
    fonts: {
      primary: '"Trebuchet MS", "Lucida Grande", sans-serif',
      heading: '"Trebuchet MS", "Lucida Grande", sans-serif', 
      display: '"Trebuchet MS", "Lucida Grande", sans-serif',
      weight: 'font-bold', // Make everything bold for arcade feel
    },
    
    // Color palette - refined countryside with premium contrast
    colors: {
      primary: '#047857', // refined emerald-700
      secondary: '#10b981', // emerald-500  
      accent: '#f59e0b', // refined amber-500
      success: '#22c55e', // green-500
      warning: '#f59e0b', // amber-500
      danger: '#ef4444', // red-500
      
      // Text colors - better contrast
      textPrimary: '#111827', // gray-900 for better readability
      textSecondary: '#6b7280', // gray-500
      textLight: '#ffffff',
      textMuted: '#9ca3af', // gray-400
      
      // Background gradients - softer, more refined
      mainBg: 'from-emerald-50 via-green-50 to-teal-50',
      cardBg: 'bg-white',
      headerBg: 'from-emerald-600 to-green-600',
      
      // Premium surface colors
      surface: '#ffffff',
      surfaceSecondary: '#f9fafb', // gray-50
      border: '#e5e7eb', // gray-200
      borderFocus: '#10b981', // emerald-500
    },
    
    // Screen-specific styles - premium refined
    screens: {
      title: {
        background: 'from-emerald-900 via-green-800 to-teal-900',
        titleGradient: 'from-amber-400 via-emerald-400 to-green-400',
        subtitle: 'text-emerald-200',
      },
      
      race: {
        setup: {
          background: 'from-emerald-50 via-green-50 to-teal-50',
          cardBackground: 'bg-white shadow-xl border border-emerald-100',
        },
        track: {
          background: 'from-emerald-100 to-green-100', // Softer grass track
          lane: 'bg-white bg-opacity-90 border border-emerald-200 rounded-xl shadow-md',
          finishLine: 'bg-gradient-to-r from-amber-400 to-yellow-400', // Premium golden finish
        }
      },
      
      stable: {
        background: 'from-emerald-50 via-green-50 to-teal-50',
        header: 'rgba(4, 120, 87, 0.95)', // emerald-700 with opacity
        panel: 'rgba(255, 255, 255, 0.95)', // white panels for premium look
        panelBorder: '#10b981', // emerald-500
      },
      
      labyrinth: {
        background: 'from-slate-100 via-emerald-50 to-gray-100', // Light, premium stone
        wall: '#64748b', // refined slate for walls
        floor: '#f1f5f9', // light slate for floors  
        reward: '#f59e0b', // refined amber for treasures
        trap: '#ef4444', // refined red for traps
      }
    },
    
    // Component styles - high energy arcade aesthetic
    components: {
      button: {
        // Electric glow buttons for futuristic arcade feel
        primary: 'btn-arcade-primary',
        secondary: 'btn-arcade-secondary', 
        success: 'btn-arcade-success',
        warning: 'btn-arcade-warning',
        danger: 'btn-arcade-danger',
        muted: 'btn-arcade-muted',
        settings: 'btn-arcade-settings',
      },
      
      card: 'bg-white rounded-2xl shadow-lg border border-gray-100',
      
      input: 'w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200',
      
      modal: 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50',
      modalContent: 'bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200',
    },
  },
  
  alternative: {
    name: 'Alternative Retro',
    description: 'Pixel-perfect retro theme with bold colors and chunky shadows',
    
    // Global styles
    fonts: {
      primary: '"Nunito", sans-serif',
      heading: '"Press Start 2P", monospace',
      display: '"Press Start 2P", monospace',
    },
    
    // Color palette - from alternativecss.txt
    colors: {
      primary: '#ffd92f', // Custom yellow
      secondary: '#1f7bf0', // Custom blue
      accent: '#e33b3b', // Custom red
      success: '#52d17b', // Custom green
      warning: '#f59e0b', // amber-500
      danger: '#e33b3b', // Custom red
      
      // Text colors
      textPrimary: '#1e1e1e', // Dark text
      textSecondary: '#6b7280', // gray-500
      textLight: '#ffffff',
      
      // Background gradients
      mainBg: 'from-pink-400 via-purple-400 to-blue-400',
      cardBg: 'bg-blue-400 bg-opacity-95',
      headerBg: 'from-pink-400 to-purple-400',
    },
    
    // Screen-specific styles
    screens: {
      title: {
        background: 'from-pink-600 via-purple-600 to-blue-600',
        titleGradient: 'from-yellow-300 via-pink-300 to-blue-300',
        subtitle: 'text-yellow-200',
      },
      
      race: {
        setup: {
          background: 'from-pink-400 via-purple-400 to-blue-400',
          cardBackground: 'bg-blue-400 bg-opacity-95 border-4 border-blue-800',
        },
        track: {
          background: 'from-green-400 to-green-600',
          lane: 'bg-green-100 bg-opacity-60 border-4 border-green-700',
          finishLine: 'bg-red-600',
        }
      },
      
      stable: {
        background: 'from-yellow-100 via-pink-50 to-purple-100',
        header: 'rgba(31, 123, 240, 0.9)', // Custom blue with opacity
        panel: 'rgba(31, 123, 240, 0.8)', // Custom blue with opacity
        panelBorder: '#1f7bf0', // Custom blue
      },
      
      labyrinth: {
        background: 'from-purple-800 via-blue-800 to-pink-800',
        wall: '#1f7bf0', // Custom blue
        floor: '#6b7280', // gray-500
        reward: '#ffd92f', // Custom yellow
        trap: '#e33b3b', // Custom red
      }
    },
    
    // Component styles - pixel-perfect retro aesthetic
    components: {
      button: {
        // Alternative theme uses special pixel-perfect buttons with transforms
        primary: 'bg-yellow-400 text-gray-900 font-black text-xs uppercase px-5 py-3 border-4 border-blue-800 shadow-lg hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl active:transform active:translate-x-1 active:translate-y-1 active:shadow-sm transition-all',
        secondary: 'bg-blue-400 text-white font-black text-xs uppercase px-5 py-3 border-4 border-blue-800 shadow-lg hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl active:transform active:translate-x-1 active:translate-y-1 active:shadow-sm transition-all',
        success: 'bg-green-500 text-white font-black text-xs uppercase px-5 py-3 border-4 border-green-800 shadow-lg hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl active:transform active:translate-x-1 active:translate-y-1 active:shadow-sm transition-all',
        warning: 'bg-yellow-400 text-gray-900 font-black text-xs uppercase px-5 py-3 border-4 border-yellow-800 shadow-lg hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl active:transform active:translate-x-1 active:translate-y-1 active:shadow-sm transition-all',
        danger: 'bg-red-500 text-white font-black text-xs uppercase px-5 py-3 border-4 border-red-800 shadow-lg hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl active:transform active:translate-x-1 active:translate-y-1 active:shadow-sm transition-all',
        muted: 'bg-gray-300 text-gray-900 font-black text-xs uppercase px-5 py-3 border-4 border-gray-600 shadow-lg hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl active:transform active:translate-x-1 active:translate-y-1 active:shadow-sm transition-all',
        settings: 'bg-blue-400 text-white font-black text-xs uppercase px-5 py-3 border-4 border-blue-800 shadow-lg hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl active:transform active:translate-x-1 active:translate-y-1 active:shadow-sm transition-all',
      },
      
      card: 'bg-blue-400 bg-opacity-95 border-4 border-blue-800 shadow-lg',
      
      input: 'w-full p-3 border-4 border-gray-900 bg-white bg-opacity-90 text-gray-900 placeholder-gray-600 focus:outline-none focus:border-blue-400 font-bold',
      
      modal: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
      modalContent: 'bg-blue-400 border-4 border-blue-800 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto',
    },
  },
  
  saturday: {
    name: 'Saturday Morning Arcade',
    description: 'Bright, playful cartoon vibes with bold arcade styling',
    
    // Global styles - based on advice file
    fonts: {
      primary: '"Atkinson Hyperlegible", system-ui, sans-serif',
      heading: '"Press Start 2P", system-ui, sans-serif', 
      display: '"Press Start 2P", system-ui, sans-serif',
      weight: 'font-bold',
    },
    
    // Color palette - from advice file CSS variables
    colors: {
      primary: '#FFD93D', // yellow button
      secondary: '#4D96FF', // blue button  
      accent: '#FF914D', // orange background
      success: '#6BCB77', // green button
      warning: '#FFD93D', // yellow
      danger: '#FF595E', // red button
      
      // Text colors - almost black ink
      textPrimary: '#1B1B1B', // ink
      textSecondary: '#3a3a3a', // ink-soft
      textLight: '#ffffff',
      textMuted: '#6b7280',
      
      // Background gradients - sunny cartoon vibes
      mainBg: 'from-orange-500 via-pink-500 to-red-500', // bg-top to bg-bottom
      cardBg: 'bg-yellow-50', // surface equivalent
      headerBg: 'from-yellow-300 to-orange-400',
      
      // Surface colors
      surface: '#FFF6E3', // light card/panel
      surfaceSecondary: '#FFE7C7', // surface-2
      border: '#000000', // thick arcade outline
      borderFocus: '#4D96FF', // blue focus
    },
    
    // Screen-specific styles - arcade cartoon theme
    screens: {
      title: {
        background: 'from-orange-400 via-pink-400 to-pink-500',
        titleGradient: 'from-yellow-400 via-orange-400 to-pink-400',
        subtitle: 'text-yellow-200',
      },
      
      race: {
        setup: {
          background: 'from-orange-500 via-pink-500 to-red-500',
          cardBackground: 'bg-transparent border-4 border-black shadow-lg',
        },
        track: {
          background: 'from-green-300 to-green-400', // track lanes
          lane: 'bg-green-200 border-2 border-green-700 rounded-xl shadow-md',
          finishLine: 'bg-gradient-to-r from-yellow-400 to-orange-400',
        }
      },
      
      stable: {
        background: 'from-orange-400 to-pink-400',
        header: 'rgba(255, 217, 61, 0.95)', // yellow surface
        panel: 'rgba(255, 246, 227, 0.95)', // light surface
        panelBorder: '#000000', // black outline
      },
      
      labyrinth: {
        background: 'from-orange-400 via-pink-400 to-purple-400',
        wall: '#1B1B1B', // black walls
        floor: '#FFF6E3', // light floor
        reward: '#FFD93D', // yellow rewards
        trap: '#FF595E', // red traps
      }
    },
    
    // Component styles - arcade button style
    components: {
      button: {
        primary: 'btn-saturday-primary',
        secondary: 'btn-saturday-secondary', 
        success: 'btn-saturday-success',
        warning: 'btn-saturday-warning',
        danger: 'btn-saturday-danger',
        muted: 'btn-saturday-muted',
        settings: 'btn-saturday-settings',
      },
      
      card: 'bg-yellow-50 rounded-xl border-4 border-black shadow-lg',
      
      input: 'w-full px-4 py-3 border-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none font-bold shadow-md saturday-input',
      
      modal: 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50',
      modalContent: 'bg-yellow-50 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-4 border-black',
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
  
  // Get screen-specific styles
  getScreenStyles: (themeName, screenName) => {
    const theme = themeUtils.getCurrentTheme(themeName);
    return theme.screens?.[screenName] || {};
  },
  
  // Get component styles
  getComponentStyles: (themeName, componentType, variant = 'primary') => {
    const theme = themeUtils.getCurrentTheme(themeName);
    
    if (componentType === 'button') {
      return theme.components.button[variant] || theme.components.button.primary;
    }
    
    if (componentType === 'card') {
      return theme.components.card;
    }
    
    if (componentType === 'input') {
      return theme.components.input;
    }
    
    if (componentType === 'modal') {
      return theme.components.modal;
    }
    
    if (componentType === 'modalContent') {
      return theme.components.modalContent;
    }
    
    return '';
  },
  
  // Apply theme classes helper (backward compatibility)
  applyTheme: (theme, componentType, variant = 'primary') => {
    return themeUtils.getComponentStyles(theme, componentType, variant);
  },
  
  // Get theme colors
  getColors: (themeName) => {
    const theme = themeUtils.getCurrentTheme(themeName);
    return theme.colors || {};
  },
  
  // Get theme fonts
  getFonts: (themeName) => {
    const theme = themeUtils.getCurrentTheme(themeName);
    return theme.fonts || {};
  },
  
  // Helper to build background gradient classes
  getBgGradient: (themeName, gradientKey = 'mainBg') => {
    const theme = themeUtils.getCurrentTheme(themeName);
    const gradient = theme.colors[gradientKey];
    return gradient ? `bg-gradient-to-br ${gradient}` : '';
  },
  
  // Helper to build text gradient classes
  getTextGradient: (themeName, gradientKey) => {
    const screenStyles = themeUtils.getScreenStyles(themeName, 'title');
    const gradient = screenStyles[gradientKey];
    return gradient ? `bg-gradient-to-r ${gradient} bg-clip-text text-transparent` : '';
  },
};