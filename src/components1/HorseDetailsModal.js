import React, { useState } from "react";
import { motion } from "framer-motion";

export default function HorseDetailsModal({ horse, onClose, onRename, onSendToLabyrinth }) {
  const [name, setName] = useState(horse.name);

  const handleSave = () => {
    onRename(horse.id, name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-xl p-6 w-80 shadow-2xl relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <button
          className="absolute top-2 right-2 text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Horse Details</h2>
        <img
          src={horse.avatar}
          alt={horse.name}
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <p className="text-sm">Personality: {horse.personality}</p>
          
          {/* Care Stats Section */}
          {horse.happiness !== undefined && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold mb-2 text-center">Care Status</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>😊 Happiness:</span>
                  <span 
                    style={{ 
                      color: horse.happiness >= 70 ? '#10b981' : horse.happiness >= 40 ? '#f59e0b' : '#ef4444',
                      fontWeight: 'bold'
                    }}
                  >
                    {Math.round(horse.happiness)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>❤️ Health:</span>
                  <span 
                    style={{ 
                      color: horse.health >= 70 ? '#10b981' : horse.health >= 40 ? '#f59e0b' : '#ef4444',
                      fontWeight: 'bold'
                    }}
                  >
                    {Math.round(horse.health)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>⚡ Energy:</span>
                  <span 
                    style={{ 
                      color: horse.energy >= 70 ? '#10b981' : horse.energy >= 40 ? '#f59e0b' : '#ef4444',
                      fontWeight: 'bold'
                    }}
                  >
                    {Math.round(horse.energy)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🧼 Clean:</span>
                  <span 
                    style={{ 
                      color: horse.cleanliness >= 70 ? '#10b981' : horse.cleanliness >= 40 ? '#f59e0b' : '#ef4444',
                      fontWeight: 'bold'
                    }}
                  >
                    {Math.round(horse.cleanliness)}%
                  </span>
                </div>
              </div>
              
              {/* Overall Status */}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs">Overall Status:</span>
                  <span className="text-lg">
                    {(() => {
                      const avgCare = (horse.happiness + horse.health + horse.cleanliness + horse.energy) / 4;
                      if (avgCare >= 80) return '😊';
                      if (avgCare >= 60) return '😐';
                      if (avgCare >= 40) return '😟';
                      return '😢';
                    })()}
                  </span>
                  <span 
                    className="text-xs font-semibold"
                    style={{ 
                      color: (() => {
                        const avgCare = (horse.happiness + horse.health + horse.cleanliness + horse.energy) / 4;
                        if (avgCare >= 80) return '#10b981';
                        if (avgCare >= 60) return '#3b82f6';
                        if (avgCare >= 40) return '#f59e0b';
                        return '#ef4444';
                      })()
                    }}
                  >
                    {(() => {
                      const avgCare = (horse.happiness + horse.health + horse.cleanliness + horse.energy) / 4;
                      if (avgCare >= 80) return 'Excellent';
                      if (avgCare >= 60) return 'Good';
                      if (avgCare >= 40) return 'Needs Care';
                      return 'Poor';
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 space-y-2">
          <button
          onClick={onSendToLabyrinth}
          className="w-full px-3 py-1 bg-purple-600 text-white rounded"
          >
          Send to Labyrinth
          </button>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
