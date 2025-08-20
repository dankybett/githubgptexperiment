import React, { useState } from "react";
import { motion } from "framer-motion";

// TileSprite component for tileset rendering
const TileSprite = ({ tileX, tileY, className = "" }) => {
  const tilesPerRow = 10; // 10x10 grid
  
  // Calculate percentage positions for the 10x10 grid
  const positionX = (tileX / (tilesPerRow - 1)) * 100;
  const positionY = (tileY / (tilesPerRow - 1)) * 100;
  
  const style = {
    width: '48px',
    height: '48px',
    backgroundImage: 'url(/maze/tilesheetdan.png)',
    backgroundPosition: `${positionX}% ${positionY}%`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${tilesPerRow * 100}% ${tilesPerRow * 100}%`,
    imageRendering: 'pixelated',
    display: 'block',
    margin: '0 auto'
  };
  
  return <div className={`tile ${className}`} style={style} />;
};

// Tile mappings
const TILE_MAP = {
  REWARD_GOLDEN_APPLE: { x: 7, y: 0 },   
  REWARD_MAGIC_CARROT: { x: 6, y: 0 },   
  REWARD_HAY_BUNDLE: { x: 9, y: 1 },     
  KEY: { x: 8, y: 0 },                  
  POWERUP: { x: 6, y: 0 },              
  VAULT: { x: 3, y: 1 },
  
  // Legendary reward tiles
  LEGENDARY_ANCIENT_TREASURE: { x: 8, y: 3 },
  LEGENDARY_DRAGON_EGG: { x: 8, y: 4 },
  LEGENDARY_SACRED_RELIC: { x: 9, y: 2 },
  
  // Record tiles for music unlocks
  RECORD_WILD_MANE: { x: 4, y: 2 },
  RECORD_WILD_UNBRIDLED: { x: 5, y: 2 },
  RECORD_CLOVER: { x: 6, y: 2 }
};

// Helper function to get tile coordinates for inventory items
const getItemTileCoords = (item) => {
  // Handle reward items
  if (item.name === 'Golden Apple') return TILE_MAP.REWARD_GOLDEN_APPLE;
  if (item.name === 'Magic Carrot') return TILE_MAP.REWARD_MAGIC_CARROT;
  if (item.name === 'Hay Bundle') return TILE_MAP.REWARD_HAY_BUNDLE;
  
  // Handle legendary reward items
  if (item.name === 'Ancient Treasure') return TILE_MAP.LEGENDARY_ANCIENT_TREASURE;
  if (item.name === 'Dragon Egg') return TILE_MAP.LEGENDARY_DRAGON_EGG;
  if (item.name === 'Sacred Relic') return TILE_MAP.LEGENDARY_SACRED_RELIC;
  
  // Handle record items
  if (item.name === 'Wild Mane Record') return TILE_MAP.RECORD_WILD_MANE;
  if (item.name === 'Wild and Unbridled Record') return TILE_MAP.RECORD_WILD_UNBRIDLED;
  if (item.name === 'Clover Record') return TILE_MAP.RECORD_CLOVER;
  
  // Handle other labyrinth items
  if (item.id === 'key' || item.name === 'Key') return TILE_MAP.KEY;
  if (item.id === 'powerup' || item.name === 'Power-up') return TILE_MAP.POWERUP;
  if (item.id === 'vault_treasure' || item.name === 'Vault Treasure') return TILE_MAP.VAULT;
  
  // Fallback to null if no tile mapping exists
  return null;
};

// Skill tree data (matching labyrinth.js)
const SKILL_TREE = {
  survival: {
    name: 'Survival',
    color: 'green',
    skills: {
      trapSense: { name: 'Trap Sense', emoji: '👁️', maxLevel: 5, description: 'Chance to avoid traps' },
      thickSkin: { name: 'Thick Skin', emoji: '🛡️', maxLevel: 3, description: 'Survive one extra trap hit' },
      lucky: { name: 'Lucky', emoji: '🍀', maxLevel: 5, description: 'Better reward quality' }
    }
  },
  mobility: {
    name: 'Mobility',
    color: 'blue',
    skills: {
      swiftness: { name: 'Swiftness', emoji: '💨', maxLevel: 5, description: 'Increased movement speed' },
      pathfinding: { name: 'Pathfinding', emoji: '🧭', maxLevel: 3, description: 'Smarter movement choices' },
      wallWalking: { name: 'Wall Walking', emoji: '🕷️', maxLevel: 1, description: 'Permanent wall breaking' },
      swimming: { name: 'Swimming', emoji: '🏊', maxLevel: 3, description: 'Move faster through water' },
      climbing: { name: 'Climbing', emoji: '🧗', maxLevel: 3, description: 'Navigate ramps and levels easier' }
    }
  },
  magic: {
    name: 'Magic',
    color: 'purple',
    skills: {
      powerupMagnet: { name: 'Power-up Magnet', emoji: '🔮', maxLevel: 3, description: 'Attract power-ups from distance' },
      enhancement: { name: 'Enhancement', emoji: '✨', maxLevel: 5, description: 'Power-up effects last longer' },
      teleportMastery: { name: 'Teleport Mastery', emoji: '🌟', maxLevel: 3, description: 'Control teleport destination' },
      timeResistance: { name: 'Time Resistance', emoji: '⏰', maxLevel: 3, description: 'Resist temporal effects' }
    }
  },
  stealth: {
    name: 'Stealth',
    color: 'gray',
    skills: {
      sneaking: { name: 'Sneaking', emoji: '🤫', maxLevel: 5, description: 'Minotaur moves slower' },
      distraction: { name: 'Distraction', emoji: '🎭', maxLevel: 3, description: 'Confuse minotaur occasionally' },
      ghostForm: { name: 'Ghost Form', emoji: '👻', maxLevel: 1, description: 'Rare chance to phase through minotaur' }
    }
  },
  inventory: {
    name: 'Inventory',
    color: 'amber',
    skills: {
      saddlebags: { name: 'Saddlebags', emoji: '👜', maxLevel: 2, description: '+1 inventory slot per level' },
      organization: { name: 'Organization', emoji: '📦', maxLevel: 3, description: 'Better item stacking and management' },
      treasureHunter: { name: 'Treasure Hunter', emoji: '🔍', maxLevel: 3, description: 'Find higher quality items' }
    }
  }
};

export default function HorseDetailsModal({ horse, onClose, onRename, onSendToLabyrinth, onCareAction, onSellItem, onFeedItem, coins, careCosts }) {
  const [name, setName] = useState(horse.name);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'status', 'skills', or 'inventory'


  const handleSave = () => {
    onRename(horse.id, name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-xl p-6 w-[500px] max-h-[90vh] shadow-2xl relative flex flex-col"
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
            Care
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 py-2 px-2 text-xs font-semibold transition-colors ${
              activeTab === 'skills'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            💎 Skills
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-r-lg transition-colors ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Items
          </button>
        </div>

        {/* Horse Avatar and Send to Labyrinth Button */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <img
            src={horse.avatar}
            alt={horse.name}
            className="w-24 h-24 object-contain"
          />
          <button
            onClick={() => {
              console.log('🏁 Modal - Send to Labyrinth clicked for horse:', horse);
              console.log('📦 Modal - Horse inventory:', horse?.inventory);
              onSendToLabyrinth();
            }}
            className="px-2 py-2 rounded text-xs font-semibold transition-colors bg-purple-600 text-white hover:bg-purple-700"
          >
            Send to Labyrinth
          </button>
        </div>

        {/* Tab Content - Fixed Height Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'details' && (
            /* Details Tab */
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={20}
                      className="flex-1 border rounded px-2 py-1"
                    />
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <p className="text-sm">Personality: {horse.personality}</p>
                
                {/* Care Actions */}
                {horse.happiness !== undefined && onCareAction && careCosts && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-semibold mb-3 text-center">Care Actions</h3>
                    <div className="grid grid-cols-4 gap-2">
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
                        <div className="text-xs opacity-75">{careCosts.groom} <img src="/horsecoins.png" alt="coins" className="inline w-3 h-3" /></div>
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
                        <div className="text-xs opacity-75">{careCosts.apple} <img src="/horsecoins.png" alt="coins" className="inline w-3 h-3" /></div>
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
                        <div className="text-xs opacity-75">{careCosts.carrot} <img src="/horsecoins.png" alt="coins" className="inline w-3 h-3" /></div>
                      </button>
                      
                      {/* Heal button - always show, but only enabled if horse is injured */}
                      {careCosts.heal && (
                        <button
                          onClick={() => onCareAction(horse.id, 'heal')}
                          disabled={coins < careCosts.heal || (!horse.isInjured && horse.health >= 50)}
                          className={`px-2 py-2 rounded text-xs font-semibold transition-colors ${
                            (coins >= careCosts.heal && (horse.isInjured || horse.health < 50))
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-lg mb-1">🏥</div>
                          <div>Heal</div>
                          <div className="text-xs opacity-75">{careCosts.heal} <img src="/horsecoins.png" alt="coins" className="inline w-3 h-3" /></div>
                        </button>
                      )}
                    </div>
                    
                    {/* Injury Warning */}
                    {horse.isInjured && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-xs text-red-700 font-semibold text-center">
                          🚨 This horse is INJURED!
                        </div>
                        <div className="text-xs text-red-600 text-center mt-1">
                          Cannot enter labyrinth until healed.
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-center text-gray-600">
                      <img src="/horsecoins.png" alt="coins" className="inline w-3 h-3" /> Available: {coins} coins
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

          {activeTab === 'skills' && (
            /* Skills Tab */
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto max-h-[250px] min-h-[200px] pr-2" style={{ scrollbarWidth: 'thin' }}>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 text-center">💎 {horse.name}'s Skills</h3>
                  
                  {horse.skills && Object.values(horse.skills).some(level => level > 0) ? (
                    <div className="space-y-3">
                      {Object.entries(SKILL_TREE).map(([categoryKey, category]) => {
                        // Check if this category has any learned skills
                        const categorySkills = Object.entries(category.skills).filter(([skillKey, _]) => 
                          (horse.skills[skillKey] || 0) > 0
                        );
                        
                        if (categorySkills.length === 0) return null;
                        
                        return (
                          <div key={categoryKey} className="bg-white rounded-lg p-2">
                            <h4 className={`text-xs font-semibold mb-2 text-${category.color}-700`}>
                              {category.name}
                            </h4>
                            <div className="space-y-1">
                              {categorySkills.map(([skillKey, skill]) => {
                                const currentLevel = horse.skills[skillKey] || 0;
                                return (
                                  <div key={skillKey} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                                    <div className="flex items-center gap-2">
                                      <span>{skill.emoji}</span>
                                      <span className="font-medium">{skill.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="text-right">
                                        <span className="font-bold text-purple-600">
                                          {currentLevel}/{skill.maxLevel}
                                        </span>
                                      </div>
                                      {/* Progress bar */}
                                      <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-purple-600 transition-all"
                                          style={{ width: `${(currentLevel / skill.maxLevel) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Skill Points Available */}
                      {(horse.skillPoints || 0) > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                          <div className="text-sm font-semibold text-yellow-800">
                            💎 {horse.skillPoints} Skill Points Available
                          </div>
                          <div className="text-xs text-yellow-600 mt-1">
                            Send to labyrinth to spend points on new skills!
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400 text-lg mb-2">🌟</div>
                      <div className="text-xs text-gray-500">
                        This horse hasn't learned any skills yet.<br/>
                        Send them to the labyrinth to earn skill points<br/>
                        and unlock powerful abilities!
                      </div>
                      <div className="mt-2 text-xs text-purple-600">
                        {(horse.skillPoints || 0) > 0 ? 
                          `${horse.skillPoints} skill points ready to spend!` : 
                          'Earn skill points by completing labyrinth runs.'
                        }
                      </div>
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

          {activeTab === 'inventory' && (
            /* Inventory Tab */
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto max-h-64">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 text-center">🎒 Inventory</h3>
                  
                  {/* Inventory Grid - Dynamic slots based on saddlebags skill */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {Array.from({ length: 4 + (horse.skills?.saddlebags || 0) }).map((_, index) => {
                      const item = horse.inventory?.[index];
                      
                      // Calculate item value for display
                      let itemValue = 5;
                      if (item) {
                        if (item.name.includes('Golden')) itemValue = 25;
                        else if (item.name.includes('Silver')) itemValue = 15;
                        else if (item.name.includes('Crystal') || item.name.includes('Gem')) itemValue = 20;
                        else if (item.name.includes('Magic')) itemValue = 18;
                        else if (item.name.includes('Ancient') || item.name.includes('Dragon') || item.name.includes('Sacred')) itemValue = 30;
                      }

                      return (
                        <div
                          key={index}
                          className={`border-2 border-dashed border-gray-300 rounded-lg p-2 ${
                            item ? 'bg-white border-solid border-purple-300 min-h-[100px]' : 'bg-gray-50 h-16 flex items-center justify-center'
                          }`}
                        >
                          {item ? (
                            <div className="text-center space-y-2">
                              {(() => {
                                const tileCoords = getItemTileCoords(item);
                                if (tileCoords) {
                                  return <TileSprite tileX={tileCoords.x} tileY={tileCoords.y} />;
                                } else {
                                  return (
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      className="w-12 h-12 object-contain mx-auto"
                                    />
                                  );
                                }
                              })()}
                              <div className="text-xs font-medium text-gray-800 leading-tight">
                                {item.name}
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-600 text-center">
                                  {itemValue} <img src="/horsecoins.png" alt="coins" className="inline w-3 h-3" />
                                </div>
                                <div className="flex gap-1">
                                  {/* Feed button for Golden Apple */}
                                  {item.name === 'Golden Apple' && onFeedItem && (
                                    <button
                                      onClick={() => onFeedItem(horse.id, index, item)}
                                      className="flex-1 px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
                                      title="Feed to boost care stats significantly"
                                    >
                                      Feed
                                    </button>
                                  )}
                                  {onSellItem && (
                                    <button
                                      onClick={() => onSellItem(horse.id, index)}
                                      className={`px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors ${
                                        item.name === 'Golden Apple' ? 'flex-1' : ''
                                      }`}
                                    >
                                      Sell
                                    </button>
                                  )}
                                </div>
                              </div>
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

                  {/* Show message only if completely empty inventory */}
                  {(!horse.inventory || horse.inventory.length === 0) && (
                    <div className="text-xs text-center text-gray-500">
                      This horse hasn't collected any items yet.<br/>
                      Send them to the labyrinth to find treasures!
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center mt-3 flex-shrink-0">
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
