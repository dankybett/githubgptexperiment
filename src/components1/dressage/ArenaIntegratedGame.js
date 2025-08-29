import React, { useState, useEffect } from 'react';
import DressageArena from './DressageArena';
import FullArenaGame from './FullArenaGame';

const ArenaIntegratedGame = ({ selectedHorse, onBack }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState('arena-intro');
  
  // Arena-specific game state (will be populated by the card game)
  const [arenaGameState, setArenaGameState] = useState({
    currentScore: 0,
    stamina: 3,
    flowMeter: 0,
    comboLength: 0,
    currentTurn: 1,
    maxTurns: 8,
    lastPlayedCard: null,
    isPerforming: false,
    flowBroke: false,
    competitionLevel: 'Training'
  });

  // Show arena intro screen
  if (gameState === 'arena-intro') {
    return (
      <DressageArena 
        selectedHorse={selectedHorse}
        {...arenaGameState}
      >
        {/* Arena Introduction */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              🏆 Welcome to the Competition Arena
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedHorse?.name} has entered the dressage arena! The judges are prepared 
              to evaluate your performance across three key areas:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">👨‍⚖️ Judge Ernst</h3>
                <p className="text-gray-600"><strong>Technique Focus</strong><br/>
                Values precision, proper form, and technical execution</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">👩‍⚖️ Judge Maria</h3>
                <p className="text-gray-600"><strong>Artistry Focus</strong><br/>
                Appreciates grace, elegance, and creative expression</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">🧑‍⚖️ Judge Klaus</h3>
                <p className="text-gray-600"><strong>Boldness Focus</strong><br/>
                Rewards risk-taking, power, and confident moves</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  ← Back to Stable
                </button>
              )}
              <button 
                onClick={() => setGameState('playing')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 text-lg font-semibold"
              >
                🎯 Enter Competition
              </button>
            </div>
          </div>

          {/* Competition Level Info */}
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <h3 className="font-bold mb-2">🎖️ Training Level Competition</h3>
            <p className="text-sm text-gray-600">
              Score 18+ points to pass • Build combos for flow bonuses • Watch your stamina!
            </p>
          </div>
        </div>
      </DressageArena>
    );
  }

  // Show the arena-integrated game
  if (gameState === 'playing') {
    return (
      <FullArenaGame 
        selectedHorse={selectedHorse}
        onBack={() => setGameState('arena-intro')} // Go back to arena instead of stable
      />
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Loading Competition...</h2>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
};

export default ArenaIntegratedGame;