import React from "react";
import { motion } from "framer-motion";
import FadeInImage from "./FadeInImage";

const UNLOCK_COST = 20;

const LockedHorses = ({
  horseAvatars,
  unlockedHorses,
  coins,
  onUnlockHorse,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-amber-800">Locked Horses</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="px-4 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-lg"
        >
          ← Back to Stable
        </motion.button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {horseAvatars.map((avatar, index) =>
          unlockedHorses[index] ? null : (
            <div
              key={index}
              className="flex flex-col items-center bg-amber-100 bg-opacity-60 p-4 rounded-lg"
            >
              <FadeInImage
                src={avatar}
                alt="Locked horse"
                className="w-20 h-20 object-contain opacity-50 silhouette"
              />
              <button
                onClick={() => onUnlockHorse(index, UNLOCK_COST)}
                disabled={coins < UNLOCK_COST}
                className={`mt-2 px-3 py-1 text-xs rounded ${
                  coins < UNLOCK_COST
                    ? "bg-gray-400 text-gray-200"
                    : "bg-green-600 text-white"
                }`}
              >
                Unlock ({UNLOCK_COST})
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default LockedHorses;