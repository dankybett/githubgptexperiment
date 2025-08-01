import React, { useState } from "react";
import { motion } from "framer-motion";
import FadeInImage from "./FadeInImage";

const MotionFadeInImage = motion(FadeInImage);

const Confetti = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-sm"
        style={{
          backgroundColor: [
            "#FFC700",
            "#FF0000",
            "#2E3191",
            "#41BBC7",
            "#FFFFFF",
          ][i % 5],
        }}
        initial={{
          x: Math.random() * window.innerWidth,
          y: -20,
          rotate: 0,
          opacity: 1,
        }}
        animate={{
          y: window.innerHeight + 20,
          x: Math.random() * window.innerWidth,
          rotate: Math.random() * 360,
          opacity: 0,
        }}
        transition={{ duration: 2 + Math.random() * 2, delay: Math.random() }}
      />
    ))}
  </div>
);


const UNLOCK_COST = 20;

const buttonClass =
  "px-4 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-lg";

const modalClass =
  "text-center p-6 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 rounded-2xl shadow-2xl max-w-sm w-full mx-auto relative";


const LockedHorses = ({
  horseAvatars,
  horseNames,
  horsePersonalities,
  unlockedHorses,
  coins,
  onUnlockHorse,
  onBack,
}) => {
    const [recentlyUnlocked, setRecentlyUnlocked] = useState(null);

  const handleUnlock = (index) => {
    onUnlockHorse(index, UNLOCK_COST);
    setRecentlyUnlocked({
      avatar: horseAvatars[index],
      name: horseNames[index],
      personality: horsePersonalities[index],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-amber-800">Locked Horses</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
           className={buttonClass}
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
               <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-800">
                  {horseNames[index]}
                </span>
                <button
                  onClick={() => handleUnlock(index)}
                  disabled={coins < UNLOCK_COST}
                  className={`px-3 py-1 text-xs rounded ${
                    coins < UNLOCK_COST
                      ? "bg-gray-400 text-gray-200"
                      : "bg-green-600 text-white"
                  }`}
                >
                  Unlock ({UNLOCK_COST})
                </button>
              </div>
            </div>
          )
        )}
      </div>
      {recentlyUnlocked && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className={modalClass}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-2 flex justify-center">
              <MotionFadeInImage
                src={recentlyUnlocked.avatar}
                alt={recentlyUnlocked.name}
                className="w-24 h-24 mx-auto object-contain rounded-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <Confetti />
            </div>
            <p className="text-lg font-bold text-gray-800">HORSE UNLOCKED!</p>
            <p className="text-xl font-bold text-yellow-800 mb-2">
              {recentlyUnlocked.name}
            </p>
            <p className="text-base text-gray-700 mb-4">
              Personality: {recentlyUnlocked.personality}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRecentlyUnlocked(null)}
              className={buttonClass}
            >
              Close
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LockedHorses;