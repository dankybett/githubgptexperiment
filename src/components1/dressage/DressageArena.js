import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import JudgesPanel from './JudgesPanel';
import HorsePerformance from './HorsePerformance';

const DressageArena = ({ 
  selectedHorse, 
  currentScore = 0, 
  stamina = 3, 
  flowMeter = 0, 
  comboLength = 0,
  currentTurn = 1,
  maxTurns = 8,
  lastPlayedCard = null,
  isPerforming = false,
  flowBroke = false,
  competitionLevel = 'Training',
  children 
}) => {
  // Arena dimensions and styling
  const arenaStyle = {
    background: 'linear-gradient(135deg, #8FBC8F 0%, #228B22 100%)',
    border: '4px solid #8B4513',
    borderRadius: '8px'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Arena Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 bg-white rounded-lg p-4 shadow-lg"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            🏆 Dressage Competition Arena
          </h1>
          
          {selectedHorse && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src={selectedHorse.avatar} 
                alt={selectedHorse.name}
                className="w-16 h-16 rounded-lg shadow-md border-2 border-yellow-400"
              />
              <div className="text-left">
                <h2 className="text-xl font-bold text-blue-600">{selectedHorse.name}</h2>
                <p className="text-sm text-gray-600">Competing in Dressage</p>
                <p className="text-xs text-gray-500">Turn {currentTurn}/{maxTurns}</p>
              </div>
            </div>
          )}

          {/* Score Header */}
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">Score: {currentScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="font-bold">Stamina: {stamina}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Flow:</div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full ${
                      i < flowMeter ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">Chain: {comboLength}</span>
            </div>
          </div>
        </motion.div>

        {/* Main Arena */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          {/* Horse Performance Arena */}
          <div 
            className="relative h-64 mb-4 flex items-center justify-center overflow-hidden shadow-lg"
            style={arenaStyle}
          >
            {/* Arena Markings - Standard Dressage Letters */}
            <div className="absolute inset-6 border-2 border-white border-dashed opacity-40 rounded" />
            
            {/* Dressage Arena Letters */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-70">
              <span className="text-xs font-bold text-gray-800">A</span>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-70">
              <span className="text-xs font-bold text-gray-800">C</span>
            </div>
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-70">
              <span className="text-xs font-bold text-gray-800">M</span>
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-70">
              <span className="text-xs font-bold text-gray-800">H</span>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full opacity-80" />
            
            {/* Dynamic Horse Performance */}
            <HorsePerformance
              selectedHorse={selectedHorse}
              lastPlayedCard={lastPlayedCard}
              isPerforming={isPerforming}
              comboLength={comboLength}
              flowBroke={flowBroke}
            />

            {/* Arena Atmosphere Effects */}
            <div className="absolute top-2 left-2 text-xs text-white opacity-70 bg-black bg-opacity-30 px-2 py-1 rounded">
              🌤️ Fair Weather
            </div>
            <div className="absolute top-2 right-2 text-xs text-white opacity-70 bg-black bg-opacity-30 px-2 py-1 rounded">
              🏟️ Standard Arena
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-white opacity-70 bg-black bg-opacity-30 px-2 py-1 rounded">
              🎯 Competition Ready
            </div>
          </div>

          {/* Dynamic Judges Panel */}
          <JudgesPanel
            lastPlayedCard={lastPlayedCard}
            currentScore={currentScore}
            comboLength={comboLength}
            flowBroke={flowBroke}
            competitionLevel={competitionLevel}
          />
        </motion.div>

        {/* Game Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default DressageArena;