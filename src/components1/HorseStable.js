import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FadeInImage from "./FadeInImage";
import HorseDetailsModal from "./HorseDetailsModal";

const HorseStable = ({
  horseAvatars,
  horseNames,
  horsePersonalities,
  unlockedHorses,
  coins,
  onBack,
  onPlayMinigame,
  onShowLockedHorses,
  onSendToLabyrinth,
}) => {
  const [stableHorses, setStableHorses] = useState([]);
  const [stableLoaded, setStableLoaded] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [availableHorses, setAvailableHorses] = useState([]);
  const [selectedHorseIds, setSelectedHorseIds] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  
  // Pan/drag state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastMoveTime, setLastMoveTime] = useState(0);

  // Calculate viewport bounds for panning
  const getViewportBounds = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const stableWidth = 800;
    const stableHeight = 600;
    
    // Allow generous panning - stable can move up to half its size in any direction
    const maxPanX = stableWidth / 2;
    const maxPanY = stableHeight / 2;
    
    return { maxPanX, maxPanY };
  };

  // Pan/drag handlers
  const handlePanStart = (event) => {
    setIsDragging(true);
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    setDragStart({ x: clientX, y: clientY });
    setLastPanOffset(panOffset);
    setVelocity({ x: 0, y: 0 }); // Reset velocity
    setLastMoveTime(Date.now());
  };

  const handlePanMove = (event) => {
    if (!isDragging) return;
    
    event.preventDefault();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    const newPanX = lastPanOffset.x + deltaX;
    const newPanY = lastPanOffset.y + deltaY;
    
    // Calculate velocity for momentum with dampening
    const currentTime = Date.now();
    const timeDelta = currentTime - lastMoveTime;
    if (timeDelta > 0 && timeDelta < 100) { // Only calculate for reasonable time deltas
      const velX = (deltaX / timeDelta) * 0.1; // Scale down velocity significantly
      const velY = (deltaY / timeDelta) * 0.1;
      setVelocity({ x: velX, y: velY });
    }
    setLastMoveTime(currentTime);
    
    // Apply bounds
    const { maxPanX, maxPanY } = getViewportBounds();
    const boundedPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
    const boundedPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));
    
    setPanOffset({ x: boundedPanX, y: boundedPanY });
  };

  const handlePanEnd = () => {
    setIsDragging(false);
    
    // Apply momentum when drag ends with much lower threshold
    if (Math.abs(velocity.x) > 0.05 || Math.abs(velocity.y) > 0.05) {
      applyMomentum();
    }
  };

  const applyMomentum = () => {
    const friction = 0.85; // Higher friction for faster stopping
    const minVelocity = 0.005; // Lower minimum for more control
    const velocityScale = 0.3; // Scale down velocity significantly
    
    const animate = () => {
      setVelocity(currentVel => {
        const newVelX = currentVel.x * friction;
        const newVelY = currentVel.y * friction;
        
        // Stop if velocity is too small
        if (Math.abs(newVelX) < minVelocity && Math.abs(newVelY) < minVelocity) {
          return { x: 0, y: 0 };
        }
        
        // Apply momentum to pan offset with much gentler scaling
        setPanOffset(currentPan => {
          const { maxPanX, maxPanY } = getViewportBounds();
          const newPanX = Math.max(-maxPanX, Math.min(maxPanX, currentPan.x + newVelX * velocityScale * 16));
          const newPanY = Math.max(-maxPanY, Math.min(maxPanY, currentPan.y + newVelY * velocityScale * 16));
          return { x: newPanX, y: newPanY };
        });
        
        // Continue animation
        requestAnimationFrame(animate);
        return { x: newVelX, y: newVelY };
      });
    };
    
    requestAnimationFrame(animate);
  };

  const createHorseData = (horse) => ({
    ...horse,
    x: Math.random() * 70 + 10,
    y: Math.random() * 60 + 20,
    targetX: Math.random() * 70 + 10,
    targetY: Math.random() * 60 + 20,
    speed: 0.3 + Math.random() * 0.4,
    direction: Math.random() * 360,
    restTime: 0,
    isResting: false,
    lastMoveTime: Date.now(),
  });

  const handleRename = (id, newName) => {
    setStableHorses((prev) =>
      prev.map((horse) =>
        horse.id === id ? { ...horse, name: newName } : horse
      )
    );
    setAvailableHorses((prev) =>
      prev.map((horse) =>
        horse.id === id ? { ...horse, name: newName } : horse
      )
    );
  };

  const toggleHorseRoaming = (id) => {
    if (selectedHorseIds.includes(id)) {
      setSelectedHorseIds((prev) => prev.filter((hid) => hid !== id));
      setStableHorses((prev) => prev.filter((horse) => horse.id !== id));
    } else {
      setSelectedHorseIds((prev) => [...prev, id]);
      const horseData = availableHorses.find((h) => h.id === id);
      if (horseData) {
        setStableHorses((prev) => [...prev, createHorseData(horseData)]);
      }
    }
  };

  // Initialize available and roaming horses based on unlocked list
  useEffect(() => {
      const available = horseAvatars
      .map((avatar, index) => ({ avatar, index }))
      .filter((_, index) => unlockedHorses[index])
      .map(({ avatar, index }) => ({
        id: index,
        avatar,
        name: horseNames[index],
        personality: horsePersonalities[index],
      }));

    setAvailableHorses(available);
    setSelectedHorseIds(available.map((h) => h.id));
    setStableHorses(available.map((h) => createHorseData(h)));

    setTimeout(() => setStableLoaded(true), 1000);
    }, [horseAvatars, horseNames, horsePersonalities, unlockedHorses]);

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
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom right, #fef3c7, #fefce8, #fed7aa)',
        overflow: 'hidden',
        zIndex: '1000'
      }}
    >
      {/* Stable Header */}
      <div 
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          backgroundColor: 'rgba(120, 53, 15, 0.9)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          zIndex: '20'
        }}
      >
        <div 
          style={{
            display: 'flex',
            flexDirection: window.innerWidth < 640 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: window.innerWidth < 640 ? 'stretch' : 'center',
            gap: window.innerWidth < 640 ? '8px' : '16px'
          }}
        >
          {/* Title Row */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: window.innerWidth < 640 ? '6px' : '12px'
              }}
            >
              <motion.span
                style={{ fontSize: window.innerWidth < 640 ? '20px' : '32px' }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏇
              </motion.span>
              <div>
                <h1 
                  style={{
                    fontSize: window.innerWidth < 640 ? '14px' : '24px',
                    fontWeight: 'bold',
                    color: '#fef3c7',
                    margin: '0',
                    lineHeight: '1.2'
                  }}
                >
                  🏠 Horse Stable
                </h1>
                {window.innerWidth >= 640 && (
                  <p 
                    style={{
                      color: '#fed7aa',
                      fontSize: '14px',
                      margin: '0'
                    }}
                  >
                    Watch your horses roam freely in their home
                  </p>
                )}
              </div>
            </div>
            <div 
              style={{
                color: '#fef3c7',
                fontWeight: 'bold',
                fontSize: window.innerWidth < 640 ? '12px' : '16px'
              }}
            >
              💰 {coins}
            </div>
          </div>
          
          {/* Button Row */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: window.innerWidth < 640 ? '4px' : '12px',
              flexWrap: 'wrap'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="btn-retro btn-retro-yellow"
              style={{
                padding: window.innerWidth < 640 ? '6px 8px' : '8px 16px',
                fontSize: window.innerWidth < 640 ? '8px' : '10px',
                flex: window.innerWidth < 640 ? '1' : 'none',
                minWidth: window.innerWidth < 640 ? '0' : 'auto',
                letterSpacing: window.innerWidth < 640 ? '0.5px' : '1px'
              }}
            >
              ← Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSelector(true)}
              className="btn-retro btn-retro-purple"
              style={{
                padding: window.innerWidth < 640 ? '6px 8px' : '8px 16px',
                fontSize: window.innerWidth < 640 ? '8px' : '10px',
                flex: window.innerWidth < 640 ? '1' : 'none',
                minWidth: window.innerWidth < 640 ? '0' : 'auto',
                letterSpacing: window.innerWidth < 640 ? '0.5px' : '1px'
              }}
            >
              {window.innerWidth < 640 ? 'Manage' : 'Manage Horses'}
            </motion.button>
            {onPlayMinigame && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPlayMinigame}
                className="btn-retro btn-retro-blue"
                style={{
                  padding: window.innerWidth < 640 ? '6px 8px' : '8px 16px',
                  fontSize: window.innerWidth < 640 ? '8px' : '10px',
                  flex: window.innerWidth < 640 ? '1' : 'none',
                  minWidth: window.innerWidth < 640 ? '0' : 'auto',
                  letterSpacing: window.innerWidth < 640 ? '0.5px' : '1px'
                }}
              >
                Game
              </motion.button>
            )}
            {onShowLockedHorses && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onShowLockedHorses}
                className="btn-retro btn-retro-green"
                style={{
                  padding: window.innerWidth < 640 ? '6px 8px' : '8px 16px',
                  fontSize: window.innerWidth < 640 ? '8px' : '10px',
                  flex: window.innerWidth < 640 ? '1' : 'none',
                  minWidth: window.innerWidth < 640 ? '0' : 'auto',
                  letterSpacing: window.innerWidth < 640 ? '0.5px' : '1px'
                }}
              >
                Unlock
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
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px))`,
          width: '800px',
          height: '600px',
          maxWidth: 'none',
          maxHeight: 'none',
          minWidth: '800px',
          minHeight: '600px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onTouchStart={handlePanStart}
        onTouchMove={handlePanMove}
        onTouchEnd={handlePanEnd}
      >
        <div 
          style={{
            position: 'relative',
            width: '800px',
            height: '600px',
            backgroundColor: 'rgba(187, 247, 208, 0.4)',
            borderRadius: '24px',
            border: '4px solid rgba(217, 119, 6, 0.5)',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            transformOrigin: 'center center',
            transform: 'scale(1)',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          {/* Grass texture overlay */}
          <div 
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'linear-gradient(to bottom right, #86efac, #bbf7d0, #fef08a)',
              opacity: '0.3'
            }}
          ></div>
          
          {/* Decorative Assets */}
          {/* Farm Building */}
          <div 
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              width: '96px',
              height: '80px',
              backgroundColor: '#b91c1c',
              borderRadius: '12px 12px 0 0',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: '10'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                left: '0',
                right: '0',
                top: '0',
                height: '16px',
                backgroundColor: '#991b1b',
                borderRadius: '12px 12px 0 0'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                top: '24px',
                left: '8px',
                width: '16px',
                height: '24px',
                backgroundColor: '#d97706',
                borderRadius: '4px'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                top: '24px',
                right: '8px',
                width: '24px',
                height: '32px',
                backgroundColor: '#60a5fa',
                borderRadius: '4px',
                opacity: '0.8'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                top: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '32px'
              }}
            >🏚️</div>
          </div>
          
          {/* Car */}
          <div 
            style={{
              position: 'absolute',
              bottom: '32px',
              right: '32px',
              width: '80px',
              height: '48px',
              backgroundColor: '#2563eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: '10'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: '4px',
                left: '8px',
                width: '48px',
                height: '24px',
                backgroundColor: '#3b82f6',
                borderRadius: '4px'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                bottom: '4px',
                left: '4px',
                width: '16px',
                height: '16px',
                backgroundColor: '#1f2937',
                borderRadius: '50%'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '16px',
                height: '16px',
                backgroundColor: '#1f2937',
                borderRadius: '50%'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '24px'
              }}
            >🚗</div>
          </div>
          
          {/* Record Player */}
          <div 
            style={{
              position: 'absolute',
              top: '200px',
              right: '48px',
              width: '64px',
              height: '64px',
              backgroundColor: '#d97706',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: '10'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '48px',
                height: '48px',
                backgroundColor: '#111827',
                borderRadius: '50%'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '24px'
              }}
            >🎵</div>
          </div>
          
          {/* Pond */}
          <div 
            style={{
              position: 'absolute',
              bottom: '150px',
              left: '200px',
              width: '128px',
              height: '80px',
              backgroundColor: '#60a5fa',
              borderRadius: '50%',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              opacity: '0.8',
              zIndex: '10'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                right: '8px',
                bottom: '8px',
                backgroundColor: '#93c5fd',
                borderRadius: '50%'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '12px',
                height: '12px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                opacity: '0.6'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                width: '8px',
                height: '8px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                opacity: '0.6'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '24px'
              }}
            >💧</div>
          </div>

          {/* Roaming Horses */}
          {stableHorses.map((horse) => (
            <motion.div
              key={horse.id}
              className="absolute z-20 cursor-pointer"
              style={{ left: `${horse.x}%`, top: `${horse.y}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
              onClick={(e) => {
                // Only open horse details if not dragging
                if (!isDragging) {
                  e.stopPropagation();
                  setSelectedHorse(horse);
                }
              }}
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
        {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Select Grazing Horses</h2>
            <div className="space-y-2">
              {availableHorses.map((horse) => (
                <label key={horse.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedHorseIds.includes(horse.id)}
                    onChange={() => toggleHorseRoaming(horse.id)}
                  />
                  <span>{horse.name}</span>
                </label>
              ))}
            </div>
            <div className="text-right mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSelector(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-lg"
              >
                Done
              </motion.button>
            </div>
          </div>
        </div>
      )}
      {selectedHorse && (
        <HorseDetailsModal
          horse={selectedHorse}
          onClose={() => setSelectedHorse(null)}
          onRename={handleRename}
          onSendToLabyrinth={() => {
            setSelectedHorse(null);
            onSendToLabyrinth();
          }}
        />
      )}
    </div>
  );
};

export default HorseStable;
