import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FadeInImage from "./FadeInImage";
import HorseDetailsModal from "./HorseDetailsModal";

const HorseStable = ({
  horseAvatars,
  unlockedHorses,
  coins,
  onBack,
  onPlayMinigame,
  onShowLockedHorses,
}) => {
  const [stableHorses, setStableHorses] = useState([]);
  const [stableLoaded, setStableLoaded] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);

  const handleRename = (id, newName) => {
    setStableHorses((prev) =>
      prev.map((horse) =>
        horse.id === id ? { ...horse, name: newName } : horse
      )
    );
  };
 // Initialize roaming horses based on unlocked list
  useEffect(() => {
     const available = horseAvatars.filter((_, index) => unlockedHorses[index]);

    const horsesWithData = available.map((avatar, index) => ({
      id: index,
      avatar,
      name: `Stable Horse ${index + 1}`,
      x: Math.random() * 70 + 10,
      y: Math.random() * 60 + 20,
      targetX: Math.random() * 70 + 10,
      targetY: Math.random() * 60 + 20,
      speed: 0.3 + Math.random() * 0.4,
      direction: Math.random() * 360,
      restTime: 0,
      isResting: false,
      lastMoveTime: Date.now(),
    }));

    setStableHorses(horsesWithData);

    setTimeout(() => setStableLoaded(true), 1000);
    }, [horseAvatars, unlockedHorses]);

  // Animation loop for horse movement
  useEffect(() => {
    if (!stableLoaded) return;

    const animationInterval = setInterval(() => {
      setStableHorses((prevHorses) =>
        prevHorses.map((horse) => {
          const now = Date.now();
          const deltaTime = (now - horse.lastMoveTime) / 1000;

          // If horse is resting, decrease rest time
          if (horse.isResting) {
            const newRestTime = horse.restTime - deltaTime;
            if (newRestTime <= 0) {
              return {
                ...horse,
                isResting: false,
                restTime: 0,
                targetX: Math.random() * 70 + 10,
                targetY: Math.random() * 60 + 20,
                lastMoveTime: now,
              };
            }
            return { ...horse, restTime: newRestTime, lastMoveTime: now };
          }

          // Calculate distance to target
          const dx = horse.targetX - horse.x;
          const dy = horse.targetY - horse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If close to target, start resting or pick new target
          if (distance < 2) {
            if (Math.random() < 0.3) {
              return {
                ...horse,
                isResting: true,
                restTime: 2 + Math.random() * 4,
                lastMoveTime: now,
              };
            } else {
              return {
                ...horse,
                targetX: Math.random() * 70 + 10,
                targetY: Math.random() * 60 + 20,
                lastMoveTime: now,
              };
            }
          }

          const moveX = (dx / distance) * horse.speed * deltaTime * 10;
          const moveY = (dy / distance) * horse.speed * deltaTime * 10;

          return {
            ...horse,
            x: Math.max(5, Math.min(85, horse.x + moveX)),
            y: Math.max(15, Math.min(75, horse.y + moveY)),
            direction: Math.atan2(dy, dx) * (180 / Math.PI),
            lastMoveTime: now,
          };
        })
      );
    }, 100);

    return () => clearInterval(animationInterval);
  }, [stableLoaded]);

  if (!stableLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 flex flex-col justify-center items-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏇
          </motion.div>
          <p className="text-2xl font-bold text-amber-800 mb-2">
            Preparing the stable...
          </p>
          <div className="w-48 h-2 bg-amber-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 relative overflow-hidden">
      {/* Stable Header */}
      <div className="bg-amber-900 bg-opacity-90 backdrop-blur-md shadow-lg p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🏇
            </motion.span>
            <div>
              <h1 className="text-2xl font-bold text-amber-100">
                🏠 Horse Stable
              </h1>
              <p className="text-amber-200 text-sm">
                Watch your horses roam freely in their home
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-amber-100 font-semibold">
              💰 {coins}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-4 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-lg"
            >
              ← Back to Race Setup
            </motion.button>
            {onPlayMinigame && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPlayMinigame}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
              >
                Play Minigame
              </motion.button>
            )}
            {onShowLockedHorses && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onShowLockedHorses}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
              >
                Unlock Horses
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Stable Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Hay bales */}
        <div className="absolute bottom-10 left-10 w-16 h-12 bg-yellow-600 rounded-lg opacity-60"></div>
        <div className="absolute bottom-8 right-20 w-20 h-14 bg-yellow-700 rounded-lg opacity-50"></div>
        <div className="absolute top-32 left-1/4 w-12 h-10 bg-yellow-600 rounded-lg opacity-40"></div>
        {/* Fence posts */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-amber-800 opacity-30"></div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 w-2 h-20 bg-amber-700 opacity-50"
            style={{ left: `${i * 12.5}%` }}
          ></div>
        ))}
        {/* Water trough */}
        <div className="absolute bottom-16 right-10 w-24 h-8 bg-blue-400 rounded-full opacity-60 shadow-lg"></div>
        {/* Stable doors in background */}
        <div className="absolute top-20 left-5 w-16 h-32 bg-amber-800 rounded-t-lg opacity-30"></div>
        <div className="absolute top-20 right-5 w-16 h-32 bg-amber-800 rounded-t-lg opacity-30"></div>
      </div>

      {/* Floating particles (hay dust) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-40"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Stable Area */}
      <div className="p-8 h-screen relative">
        <div className="relative h-full bg-green-200 bg-opacity-40 rounded-3xl border-4 border-amber-600 border-opacity-50 overflow-hidden shadow-inner">
          {/* Grass texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-300 via-green-200 to-yellow-200 opacity-30"></div>

          {/* Roaming Horses */}
          {stableHorses.map((horse) => (
            <motion.div
              key={horse.id}
              className="absolute z-20"
              style={{ left: `${horse.x}%`, top: `${horse.y}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            >
              <motion.div
                className="relative"
                animate={
                  horse.isResting
                    ? { scale: [1, 1.02, 1], rotate: [0, 1, -1, 0] }
                    : { y: [0, -2, 0], rotate: [0, 2, -2, 0] }
                }
                transition={{
                  duration: horse.isResting ? 3 : 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FadeInImage
                  src={horse.avatar}
                  alt={horse.name}
                  className="w-20 h-20 object-contain rounded-lg"
                  style={{
                    transform:
                      horse.direction > -90 && horse.direction < 90
                        ? "none"
                        : "scaleX(-1)",
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                  }}
                />
                <motion.div
                  className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-amber-800 text-amber-100 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: horse.id * 0.2 }}
                >
                  {horse.name}
                </motion.div>
                {horse.isResting && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    💤
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ))}

          {/* Stable Info Panel */}
          <motion.div
            className="absolute top-4 right-4 bg-amber-800 bg-opacity-90 text-amber-100 p-4 rounded-xl shadow-lg"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span>🏠</span>
              Stable Status
            </h3>
            <div className="text-sm space-y-1">
              <p>🐎 Horses: {stableHorses.length}</p>
              <p>🌱 Pasture: Healthy</p>
              <p>💧 Water: Fresh</p>
              <p>🌾 Feed: Stocked</p>
            </div>
          </motion.div>

          {/* Activity indicator */}
          <div className="absolute bottom-4 left-4 text-sm text-amber-800 bg-amber-100 bg-opacity-80 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>Horses are roaming peacefully</span>
            </div>
          </div>
        </div>
        </div>
      {selectedHorse && (
        <HorseDetailsModal
          horse={selectedHorse}
          onClose={() => setSelectedHorse(null)}
          onRename={handleRename}
        />
      )}
    </div>
  );
};

export default HorseStable;
