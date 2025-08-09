import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { raceEngineAdapter } from "../racing/RaceEngineAdapter";

const SettingsModal = ({ isOpen, onClose, onViewSaveInfo, onResetAll, getSaveInfo, gameStorage }) => {
  if (!isOpen) return null;

  const handleViewSaveInfo = () => {
    const info = getSaveInfo();
    if (info) {
      alert(`Save Info:\n• ${info.unlockedHorsesCount} horses unlocked\n• ${info.raceHistoryCount} races completed\n• ${info.inventoryItemCount} items in horse inventories\n• ${info.coins} coins\n• Last saved: ${new Date(info.timestamp).toLocaleString()}`);
    } else {
      alert('No save data found');
    }
  };

  const handleResetAll = () => {
    onResetAll();
    onClose();
  };

  const [currentEngine, setCurrentEngine] = React.useState(
    raceEngineAdapter.useExperimentalEngine ? 'experimental' : 'original'
  );

  const handleEngineToggle = () => {
    const newEngine = currentEngine === 'experimental' ? 'original' : 'experimental';
    setCurrentEngine(newEngine);
    raceEngineAdapter.setExperimentalMode(newEngine === 'experimental');
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              ⚙️ Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Save Section */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                💾 Save Data
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleViewSaveInfo}
                  className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <div className="font-medium text-blue-800">View Save Info</div>
                  <div className="text-sm text-blue-600">Check your progress and save status</div>
                </button>
                
                {gameStorage.isAvailable() ? (
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    ✅ Auto-save enabled
                  </div>
                ) : (
                  <div className="text-xs text-red-600 flex items-center gap-1">
                    ❌ Save not available (localStorage disabled)
                  </div>
                )}
              </div>
            </div>

            {/* Racing Engine Section */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                🏁 Racing Engine
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleEngineToggle}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                    currentEngine === 'experimental'
                      ? 'bg-green-50 hover:bg-green-100 border-green-300'
                      : 'bg-blue-50 hover:bg-blue-100 border-blue-300'
                  }`}
                >
                  <div className={`font-medium ${
                    currentEngine === 'experimental' ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    {currentEngine === 'experimental' ? '🔥 Enhanced Racing (Active)' : '🎲 Classic Racing (Active)'}
                  </div>
                  <div className={`text-sm ${
                    currentEngine === 'experimental' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {currentEngine === 'experimental'
                      ? 'Tight pack racing with dramatic overtaking'
                      : 'Traditional racing with weather and obstacles'
                    }
                  </div>
                </button>
                
                <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                  <div className="font-medium mb-2">
                    {currentEngine === 'experimental' ? 'Enhanced Racing Features:' : 'Classic Racing Features:'}
                  </div>
                  <div className="space-y-1">
                    {currentEngine === 'experimental' ? (
                      <>
                        <div>• Physics-based tight pack racing</div>
                        <div>• Dynamic surge and comeback systems</div>
                        <div>• Energy and fatigue mechanics</div>
                        <div>• Rubber band catch-up effects</div>
                        <div>• Any horse can win</div>
                      </>
                    ) : (
                      <>
                        <div>• Weather effects on racing</div>
                        <div>• Classic surge/fatigue system</div>
                        <div>• Random-based outcomes</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Section */}
            <div className="pb-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                🗑️ Reset Data
              </h3>
              <button
                onClick={handleResetAll}
                className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                disabled={!gameStorage.isAvailable()}
              >
                <div className="font-medium text-red-800">Reset All Progress</div>
                <div className="text-sm text-red-600">Clear coins, horses, and race history</div>
              </button>
            </div>

            {/* Info Section */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600">
                <div className="font-medium mb-1">💡 About Save System:</div>
                <div>• Game auto-saves your progress</div>
                <div>• Works on web and mobile devices</div>
                <div>• Data persists between app sessions</div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;