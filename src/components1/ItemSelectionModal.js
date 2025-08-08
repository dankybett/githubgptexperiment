import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ItemSelectionModal = ({ 
  isOpen, 
  horse, 
  collectedItems, 
  onConfirm, 
  onCancel 
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [discardedItems, setDiscardedItems] = useState([]);
  
  const currentInventoryCount = horse?.inventory?.length || 0;
  const keptInventoryCount = currentInventoryCount - discardedItems.length;
  const dynamicMaxSlots = 4 + (horse?.skills?.saddlebags || 0);
  const availableSlots = dynamicMaxSlots - keptInventoryCount;
  const totalCollected = collectedItems.length;
  
  const toggleItemSelection = (item, index) => {
    const itemWithIndex = { ...item, originalIndex: index };
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.originalIndex === index);
      
      if (isSelected) {
        // Remove item
        return prev.filter(selected => selected.originalIndex !== index);
      } else {
        // Add item if under limit
        if (prev.length < availableSlots) {
          return [...prev, itemWithIndex];
        }
        return prev;
      }
    });
  };

  const toggleInventoryDiscard = (inventoryIndex) => {
    setDiscardedItems(prev => {
      const isDiscarded = prev.includes(inventoryIndex);
      
      if (isDiscarded) {
        // Remove from discarded list
        return prev.filter(index => index !== inventoryIndex);
      } else {
        // Add to discarded list
        return [...prev, inventoryIndex];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm({ selectedItems, discardedItems });
    setSelectedItems([]);
    setDiscardedItems([]);
  };

  const handleCancel = () => {
    onCancel();
    setSelectedItems([]);
    setDiscardedItems([]);
  };

  if (!isOpen) {
    console.log('🎒 ItemSelectionModal - Modal not open, isOpen:', isOpen);
    return null;
  }
  
  console.log('🎒 ItemSelectionModal - Modal opening with:');
  console.log('  - isOpen:', isOpen);
  console.log('  - horse:', horse);
  console.log('  - collectedItems:', collectedItems);
  console.log('  - dynamicMaxSlots:', dynamicMaxSlots);
  console.log('  - availableSlots:', availableSlots);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🎒 Inventory Full!
            </h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <img 
                src={horse?.avatar} 
                alt={horse?.name} 
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <div className="font-semibold text-lg">{horse?.name}</div>
                <div className="text-sm text-gray-600">
                  returned from the labyrinth
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <div className="font-semibold text-amber-800 mb-1">
                Manage your inventory:
              </div>
              <div className="text-amber-700">
                • Found <span className="font-bold">{totalCollected}</span> items in the labyrinth
              </div>
              <div className="text-amber-700">
                • Current inventory: <span className="font-bold">{currentInventoryCount}</span> items ({discardedItems.length} marked for discard)
              </div>
              <div className="text-amber-700">
                • Available slots: <span className="font-bold">{availableSlots}</span> 
                • Selected new items: <span className="font-bold">{selectedItems.length}</span>/{availableSlots}
              </div>
            </div>
          </div>

          {/* Current Inventory */}
          {currentInventoryCount > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">
                📦 Current Inventory ({currentInventoryCount}/{dynamicMaxSlots}) - Click to discard:
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: dynamicMaxSlots }).map((_, index) => {
                  const item = horse.inventory?.[index];
                  const isDiscarded = discardedItems.includes(index);
                  
                  return (
                    <motion.div
                      key={index}
                      className={`border-2 rounded-lg p-2 transition-all ${
                        item 
                          ? `cursor-pointer ${isDiscarded
                              ? 'border-red-500 bg-red-50 opacity-60'
                              : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-25'
                            }`
                          : 'border-dashed border-gray-300 bg-gray-50'
                      }`}
                      onClick={() => item && toggleInventoryDiscard(index)}
                      whileHover={item ? { scale: 1.05 } : {}}
                      whileTap={item ? { scale: 0.95 } : {}}
                    >
                      {item ? (
                        <>
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 mx-auto object-contain"
                          />
                          <div className="text-xs text-center mt-1 font-medium">
                            {item.name}
                          </div>
                          {isDiscarded && (
                            <div className="text-center mt-1">
                              <span className="text-red-500 text-sm">🗑️</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center mx-auto">
                          <div className="text-gray-400 text-xs">Empty</div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Click items to discard them and make room for new ones
              </div>
            </div>
          )}

          {/* Items to Select */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">
              ✨ Items Found in Labyrinth (select {availableSlots}):
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {collectedItems.map((item, index) => {
                const isSelected = selectedItems.some(selected => selected.originalIndex === index);
                const canSelect = selectedItems.length < availableSlots || isSelected;
                
                return (
                  <motion.div
                    key={index}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : canSelect
                        ? 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-25'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canSelect && toggleItemSelection(item, index)}
                    whileHover={canSelect ? { scale: 1.05 } : {}}
                    whileTap={canSelect ? { scale: 0.95 } : {}}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 mx-auto object-contain"
                    />
                    <div className="text-xs text-center mt-1 font-medium">
                      {item.name}
                    </div>
                    {isSelected && (
                      <div className="text-center mt-1">
                        <span className="text-blue-500 text-sm">✓</span>
                      </div>
                    )}
                    {item.quantity > 1 && (
                      <div className="text-xs text-center text-gray-500">
                        x{item.quantity}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={selectedItems.length !== availableSlots}
              className={`px-6 py-2 rounded-lg transition-colors ${
                selectedItems.length === availableSlots
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Take Selected Items ({selectedItems.length}/{availableSlots})
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ItemSelectionModal;