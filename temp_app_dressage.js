              return newCareStats;
            });
            
            // Note: Tarot card checking and removal is now handled by HorseStable.js
            // Just save the inventory as-is so HorseStable can process tarot cards
          }
        }}
        onSpecialProgressUpdate={updateSpecialProgress}
      />
    );
  }


  if (showBattleship) {
    return <BattleshipGame onBack={() => setShowBattleship(false)} />;
  }

  if (showDressage) {
    return (
      <ArenaIntegratedGame 
        selectedHorse={selectedHorseForDressage}
        onBack={() => {
          setShowDressage(false);
          setSelectedHorseForDressage(null);
          setShowStable(true);
        }}
      />
    );
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
