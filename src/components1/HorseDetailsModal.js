import React, { useState } from "react";
import { motion } from "framer-motion";

export default function HorseDetailsModal({ horse, onClose, onRename, onSendToLabyrinth, onCareAction, coins, careCosts }) {
  const [name, setName] = useState(horse.name);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'status', 'actions', or 'inventory'

  const handleSave = () => {
    onRename(horse.id, name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-xl p-6 w-96 shadow-2xl relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        
        {/* Tab Navigation */}
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-l-lg transition-colors ${
              activeTab === 'details'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 px-2 text-xs font-semibold transition-colors ${
              activeTab === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Care Status
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-2 px-2 text-xs font-semibold transition-colors ${
              activeTab === 'actions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Actions
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-r-lg transition-colors ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Inventory
          </button>
        </div>

        {/* Horse Avatar */}
        <img
          src={horse.avatar}
          alt={horse.name}
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />

        {/* Tab Content - Reduced Height Container */}
        <div className="min-h-[200px] flex flex-col">
          {activeTab === 'details' && (
            /* Details Tab */
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={20}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <p className="text-sm">Personality: {horse.personality}</p>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    console.log('🏁 Modal - Send to Labyrinth clicked for horse:', horse);
                    console.log('📦 Modal - Horse inventory:', horse?.inventory);
                    onSendToLabyrinth();
                  }}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Send to Labyrinth
                </button>
                <div className="flex justify-end gap-2">
                  <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            /* Care Status Tab */
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                {horse.happiness !== undefined && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 text-center">Care Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between px-2">
                        <span className="flex items-center gap-1">
                          <span>😊</span>
                          <span>Happiness:</span>
                        </span>
                        <span 
                          className="font-bold min-w-[50px] text-right"
                          style={{ 
                            color: horse.happiness >= 70 ? '#10b981' : horse.happiness >= 40 ? '#f59e0b' : '#ef4444'
                          }}
                        >
                          {Math.round(horse.happiness)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <span className="flex items-center gap-1">
                          <span>❤️</span>
                          <span>Health:</span>
                        </span>
                        <span 
                          className="font-bold min-w-[50px] text-right"
                          style={{ 
                            color: horse.health >= 70 ? '#10b981' : horse.health >= 40 ? '#f59e0b' : '#ef4444'
                          }}
                        >
                          {Math.round(horse.health)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <span className="flex items-center gap-1">
                          <span>⚡</span>
                          <span>Energy:</span>
                        </span>
                        <span 
                          className="font-bold min-w-[50px] text-right"
                          style={{ 
                            color: horse.energy >= 70 ? '#10b981' : horse.energy >= 40 ? '#f59e0b' : '#ef4444'
                          }}
                        >
                          {Math.round(horse.energy)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-2">
                        <span className="flex items-center gap-1">
                          <span>🧼</span>
                          <span>Clean:</span>
                        </span>
                        <span 
                          className="font-bold min-w-[50px] text-right"
                          style={{ 
                            color: horse.cleanliness >= 70 ? '#10b981' : horse.cleanliness >= 40 ? '#f59e0b' : '#ef4444'
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
              
              <div className="text-center">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                  Close
                </button>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            /* Care Actions Tab */
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                {horse.happiness !== undefined && onCareAction && careCosts && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-semibold mb-3 text-center">Care Actions</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => onCareAction(horse.id, 'groom')}
                        disabled={coins < careCosts.groom}
                        className={`px-2 py-2 rounded text-xs font-semibold transition-colors ${
                          coins >= careCosts.groom
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-lg mb-1">🧼</div>
                        <div>Groom</div>
                        <div className="text-xs opacity-75">{careCosts.groom} 💰</div>
                      </button>
                      
                      <button
                        onClick={() => onCareAction(horse.id, 'apple')}
                        disabled={coins < careCosts.apple}
                        className={`px-2 py-2 rounded text-xs font-semibold transition-colors ${
                          coins >= careCosts.apple
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-lg mb-1">🍎</div>
                        <div>Apple</div>
                        <div className="text-xs opacity-75">{careCosts.apple} 💰</div>
                      </button>
                      
                      <button
                        onClick={() => onCareAction(horse.id, 'carrot')}
                        disabled={coins < careCosts.carrot}
                        className={`px-2 py-2 rounded text-xs font-semibold transition-colors ${
                          coins >= careCosts.carrot
                            ? 'bg-orange-600 text-white hover:bg-orange-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-lg mb-1">🥕</div>
                        <div>Carrot</div>
                        <div className="text-xs opacity-75">{careCosts.carrot} 💰</div>
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-center text-gray-600">
                      💰 Available: {coins} coins
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                  Close
                </button>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            /* Inventory Tab */
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 text-center">🎒 Inventory</h3>
                  
                  {/* Inventory Grid - 4 slots in 2x2 */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {Array.from({ length: 4 }).map((_, index) => {
                      const item = horse.inventory?.[index];
                      return (
                        <div
                          key={index}
                          className={`w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${
                            item ? 'bg-white border-solid border-purple-300' : 'bg-gray-50'
                          }`}
                        >
                          {item ? (
                            <div className="text-center">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-10 h-10 object-contain mx-auto"
                                title={item.name}
                              />
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs text-center">
                              Empty
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Item Details */}
                  {horse.inventory && horse.inventory.length > 0 ? (
                    <div className="text-xs">
                      <div className="font-semibold mb-1">Items carried:</div>
                      <div className="space-y-1">
                        {horse.inventory.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-white px-2 py-1 rounded">
                            <span className="flex items-center gap-1">
                              <img src={item.image} alt={item.name} className="w-4 h-4" />
                              <span>{item.name}</span>
                            </span>
                            <span className="text-gray-500 text-xs">
                              {item.description || 'Maze item'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-center text-gray-500">
                      This horse hasn't collected any items yet.<br/>
                      Send them to the labyrinth to find treasures!
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
