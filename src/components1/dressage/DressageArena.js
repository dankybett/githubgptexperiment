import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, RotateCcw } from 'lucide-react';
import JudgesPanel from './JudgesPanel';
import HorsePerformance from './HorsePerformance';

const DressageArena = ({ 
  selectedHorse, 
  currentScore = 0, 
  stamina = 3, 
  flowMeter = 0, 
  flowLength = 0,
  currentTurn = 1,
  maxTurns = 8,
  lastPlayedCard = null,
  isPerforming = false,
  flowBroke = false,
  competitionLevel = 'Training',
  onBack,
  onShowTutorial,
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
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-end items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Dressage
              </h1>
              <div className="flex gap-2">
              {onShowTutorial && (
                <button 
                  onClick={onShowTutorial}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  Tutorial
                </button>
              )}
              {onBack && (
                <button 
                  onClick={onBack}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Back
                </button>
              )}
              </div>
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
              flowLength={flowLength}
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
            flowLength={flowLength}
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