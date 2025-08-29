import React from 'react';
import ArenaIntegratedGame from './ArenaIntegratedGame';

const EnhancedDressageGame = ({ selectedHorse, onBack }) => {
  return (
    <ArenaIntegratedGame 
      selectedHorse={selectedHorse}
      onBack={onBack}
    />
  );
};

export default EnhancedDressageGame;