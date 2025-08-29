import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
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

export default function RaceTrack({
  items,
  positions,
  trackLength,
  trackContainerRef,
  raceDistance,
  currentWeather,
  isRacing,
  countdown,
  commentary,
  winner,
  winnerIndex,
  raceTime,
  fastestTime,
  shuffledAvatars,
  surgingHorses,
  fatiguedHorses,
  getHorseName,
  getRaceSettings,
  getRaceDistanceInfo,
  onRaceAgain,
  backToSetup,
  betEnabled,
  betAmount,
  betHorse,
}) {
  // State for position snapshots (updated every 5 seconds)
  const [positionSnapshot, setPositionSnapshot] = useState(positions);
  const lastUpdateTime = useRef(0);
  
  // Leader stability system - prevents chaotic color changes
  const [stableLeaderIndex, setStableLeaderIndex] = useState(-1);
  const leaderChangeTimeRef = useRef(0);
  const LEADER_STABILITY_DELAY = 1500; // 1.5 seconds

  // Update position snapshot every 5 seconds during racing
  useEffect(() => {
    if (isRacing && positions.length > 0) {
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime.current >= 5000) { // 5 seconds
        setPositionSnapshot([...positions]);
        lastUpdateTime.current = currentTime;
      }
    } else if (!isRacing) {
      // Reset for new race
      lastUpdateTime.current = 0;
      setPositionSnapshot(positions);
    }
  }, [isRacing, positions]);

  // Leader stability effect - updates stable leader with delay
  useEffect(() => {
    if (!isRacing || positions.length === 0) {
      setStableLeaderIndex(-1);
      leaderChangeTimeRef.current = 0;
      return;
    }

    const currentLeaderIndex = positions.indexOf(Math.max(...positions));
    const currentTime = Date.now();

    // If leader has changed
    if (currentLeaderIndex !== stableLeaderIndex) {
      // First leader change or enough time has passed
      if (leaderChangeTimeRef.current === 0) {
        leaderChangeTimeRef.current = currentTime;
      } else if (currentTime - leaderChangeTimeRef.current >= LEADER_STABILITY_DELAY) {
        // Update stable leader after delay
        setStableLeaderIndex(currentLeaderIndex);
        leaderChangeTimeRef.current = 0;
      }
    } else {
      // Same leader, reset timer
      leaderChangeTimeRef.current = 0;
    }
  }, [isRacing, positions, stableLeaderIndex]);

  // Use snapshot positions for live positions display, but real positions for everything else
  const displayPositions = isRacing ? positionSnapshot : positions;
  // Use stable leader for visual styling to prevent chaotic color changes
  const isCurrentLeader = (index) => stableLeaderIndex === index && isRacing && winnerIndex === null;
  
  // Cache track width calculation
  const trackWidth = useMemo(() => trackLength - 200, [trackLength]);
  
  // Memoize camera calculations to reduce per-frame computation
  const cameraOffset = useMemo(() => {
    const leadPosition = Math.max(...positions);
    const leadPixelPos = leadPosition * trackWidth;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
    // Reduce offset to keep horses more centered (smaller value = more centered)
    return Math.max(0, Math.min(leadPixelPos - viewportWidth * 0.1, trackLength - viewportWidth));
  }, [positions, trackWidth, trackLength]);

  return (
    <div className="flex-1 relative flex flex-col">
      {/* Viewport container with fixed dimensions */}
      <div 
        className="relative h-full min-h-96 overflow-hidden"
        ref={trackContainerRef}
      >
        {/* Track container that moves smoothly */}
        <motion.div
          className="shadow-inner relative h-full min-h-96"
          style={{ 
            width: `${trackLength}px`, 
            backgroundImage: 'url(/racetrack/grass.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto'
          }}
          animate={{ x: -cameraOffset }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* Crowd Section */}
          <div 
            className="absolute -top-64 left-0 right-0 h-64 z-5 overflow-hidden"
            style={{
              backgroundImage: 'url(/racetrack/crowd.png)',
              backgroundRepeat: 'repeat-x',
              backgroundSize: 'auto 100%',
              backgroundPosition: 'center bottom'
            }}
          ></div>

          {/* Distance Signs in front of crowd */}
          {[
            { percent: 0.25, image: '750.png', distance: '750m' },
            { percent: 0.5, image: '500.png', distance: '500m' },
            { percent: 0.75, image: '250.png', distance: '250m' }
          ].map((sign, sIdx) => {
            const signPixelPos = sign.percent * (trackLength - 200);
            return (
              <div
                key={sIdx}
                className="absolute z-10"
                style={{ 
                  left: `${signPixelPos}px`,
                  top: '0px', // Right at the top edge of the race track
                  transform: 'translateX(-50%) translateY(-100%)' // Center horizontally and position from bottom
                }}
                title={`${sign.distance} remaining`}
              >
                <img 
                  src={`/racetrack/${sign.image}`}
                  alt={`${sign.distance} distance marker`}
                  className="h-28 w-auto object-contain" // Slightly bigger: h-24 (96px) to h-28 (112px) = ~17% increase
                  style={{ 
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                  }}
                />
              </div>
            );
          })}

          {/* Finish Line at 90% - positioned for horse avatar, not banner */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-red-600 opacity-80 z-20 shadow-lg"
            style={{ 
              left: `${8 + (0.9 * (trackLength - 200)) + 208 + 12 + 32}px`, // padding + 90% + banner width + gap + half horse width
              backgroundImage: 'repeating-linear-gradient(0deg, #dc2626 0px, #dc2626 10px, #ffffff 10px, #ffffff 20px)'
            }}
          >
            {/* Finish Line Flag */}
            <div 
              className="absolute -top-8 -left-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg"
              style={{ transform: 'rotate(-5deg)' }}
            >
              🏁 FINISH
            </div>
          </div>

          <div className="space-y-2 relative z-10 py-2 px-2" style={{ marginTop: "80px" }}>
            {Array.from({ length: 5 }).map((_, index) => {
              const item = items[index];
              const hasHorse = index < items.length;
              return (
              <div
                key={index}
                className="relative w-full border-2 border-white overflow-hidden shadow-md"
                style={{
                  height: "64px",
                  backgroundImage: 'url(/racetrack/grass.png)',
                  backgroundRepeat: 'repeat',
                  backgroundSize: 'auto'
                }}
              >
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white opacity-10" />
                {hasHorse ? (
                <motion.div
                  className="absolute top-0 h-full flex items-center z-30"
                  animate={{
                    x: positions[index]
                      ? `${Math.min(positions[index], 1.1) * trackWidth}px`
                      : "0px",
                  }}
                  transition={{ 
                    duration: 0.1,
                    ease: "linear"
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Always render banner but fade out non-winners */}
                    <motion.div
                      className={`px-2 py-1 rounded-lg shadow-lg border-2 whitespace-nowrap w-52 flex items-center justify-center ${
                        winnerIndex === index
                          ? "bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 border-yellow-500"
                          : isCurrentLeader(index)
                          ? "bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 border-yellow-500 ring-2 ring-yellow-400"
                          : fatiguedHorses[index]
                          ? "bg-gradient-to-r from-gray-400 to-gray-600 text-gray-200 border-gray-700"
                          : "bg-white bg-opacity-95 text-gray-800 border-gray-200"
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: isCurrentLeader(index) ? [1, 1.05, 1] : 1, 
                        opacity: winnerIndex !== null && winnerIndex !== index ? 0 : 1,
                        boxShadow: isCurrentLeader(index)
                          ? ["0 0 0px rgba(34,197,94,0)", "0 0 25px rgba(34,197,94,0.9)", "0 0 0px rgba(34,197,94,0)"]
                          : "0 4px 6px rgba(0,0,0,0.1)"
                      }}
                      transition={{ 
                        delay: 0.2,
                        scale: { 
                          duration: 0.3, 
                          repeat: isCurrentLeader(index) ? Infinity : 0 
                        },
                        boxShadow: { 
                          duration: 0.8, 
                          repeat: isCurrentLeader(index) ? Infinity : 0 
                        },
                        opacity: { 
                          duration: winnerIndex !== null && winnerIndex !== index ? 3.0 : 0.3,
                          delay: winnerIndex !== null && winnerIndex !== index ? index * 0.2 : 0,
                          ease: "easeOut"
                        },
                        backgroundColor: { 
                          duration: 0.5, 
                          ease: "easeOut" 
                        },
                        borderColor: { 
                          duration: 0.5, 
                          ease: "easeOut" 
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {isCurrentLeader(index) && (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-yellow-200"
                          >
                            👑
                          </motion.span>
                        )}
                        <span className="text-sm font-bold">
                          {getHorseName(item, index)}
                        </span>
                        {winnerIndex === index && (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-yellow-600"
                          >
                            👑
                          </motion.span>
                        )}
                        {fatiguedHorses[index] && winnerIndex !== index && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 0.8, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-gray-400"
                          >
                            😮‍💨
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                    <MotionFadeInImage
                      src={shuffledAvatars[index % shuffledAvatars.length]}
                      alt="Horse avatar"
                      animate={
                        isRacing && positions[index] < 1.1
                          ? {
                              // Full racing animation with character - optimized timing
                              rotateZ: [0, -5, 5, -5, 5, 0],
                              y: [0, -4, 4, -3, 3, 0],
                              scale: [1, 1.1, 0.9, 1.1, 0.9, 1],
                            }
                          : { rotateZ: 0, y: 0, scale: 1 } // Stopped when race ends
                      }
                      transition={{
                        duration: isRacing ? 0.4 : 0.5,
                        repeat: isRacing ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                      className="object-contain rounded-lg flex-shrink-0"
                      style={{
                        width: "64px",
                        height: "64px",
                        filter:
                          winnerIndex === index
                            ? "drop-shadow(0 0 8px gold)"
                            : isCurrentLeader(index)
                            ? "drop-shadow(0 0 15px #22c55e) brightness(1.1)"
                            : fatiguedHorses[index]
                            ? "brightness(0.6) saturate(0.5)"
                            : "none",
                      }}
                    />
                  </div>
                </motion.div>
                ) : (
                  <div className="absolute top-0 h-full flex items-center justify-center z-30 w-full">
                    <span className="text-gray-400 text-sm font-semibold">Empty Lane</span>
                  </div>
                )}
                <div className="absolute right-4 top-0.5 text-xs font-bold text-gray-500">
                  #{index + 1}
                </div>
              </div>
              );
            })}
          </div>

        </motion.div>
      </div>
      
      {/* Live Commentary Panel */}
      {(isRacing || countdown) && (
        <motion.div
          className="mt-4 mx-3 bg-white bg-opacity-95 rounded-2xl shadow-lg border-2 border-gray-200 p-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0, duration: 0.3 }}
        >
          <h3 className="font-bold text-gray-800 mb-3 text-center flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              📢
            </motion.span>
            <span>Live Commentary</span>
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
            <div className="text-center">
              {commentary ? (
                <motion.p
                  key={commentary}
                  className="text-sm font-medium text-gray-800 leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {commentary}
                </motion.p>
              ) : countdown ? (
                <motion.p
                  className="text-lg font-bold text-blue-600"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  Get ready... {countdown}!
                </motion.p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Commentary will appear here during the race...
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Winner modal - positioned outside the track container */}
      {winner && !isRacing && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div
            className="text-center p-6 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 rounded-2xl shadow-2xl max-w-sm w-full mx-auto relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
                <div className="relative mb-2 flex justify-center">
                  <MotionFadeInImage
                    src={
                      winnerIndex !== null
                        ? shuffledAvatars[winnerIndex % shuffledAvatars.length]
                        : ""
                    }
                    alt="Winning horse"
                    className="w-24 h-24 mx-auto object-contain rounded-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <Confetti />
                </div>
                <p className="text-lg font-bold text-gray-800">WINNER!</p>
                <p className="text-xl font-bold text-yellow-800 mb-2">
                  {winner}
                </p>
                <p className="text-base text-gray-700">
                  Finish Time: {raceTime.toFixed(1)}s
                </p>
                <p className="text-sm text-gray-600">
                  {getRaceDistanceInfo(raceDistance).name} Race
                </p>
                {currentWeather && (
                  <p className="flex items-center justify-center gap-1 mt-1 text-sm text-gray-600">
                    <span>{currentWeather.emoji}</span>
                    <span>{currentWeather.name} conditions</span>
                  </p>
                )}
                {raceTime === fastestTime && (
                  <p className="text-sm font-bold text-red-600 mt-1">
                    🔥 NEW RECORD! 🔥
                  </p>
                )}

                <div className="flex gap-2 mt-4 justify-center flex-wrap">
                  <button
                    onClick={onRaceAgain}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold shadow-lg text-sm"
                  >
                    🔁 Race Again
                  </button>
                  <button
                    onClick={backToSetup}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg text-sm"
                  >
                    🏠 New Race
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const winnerElement = document.createElement("div");
                        winnerElement.innerHTML = `
                          <div style="
                            padding: 40px;
                            background: linear-gradient(135deg, #fef3c7, #fcd34d, #fef3c7);
                            border-radius: 16px;
                            text-align: center;
                            font-family: system-ui, -apple-system, sans-serif;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                            width: 400px;
                          ">
                            <div style="font-size: 60px; margin-bottom: 10px;">🏆</div>
                            <div style="font-size: 24px; font-weight: bold; color: #7c2d12; margin-bottom: 8px;">WINNER!</div>
                            <div style="font-size: 28px; font-weight: bold; color: #b45309; margin-bottom: 16px;">${winner}</div>
                            <div style="font-size: 18px; color: #374151; margin-bottom: 8px;">Finish Time: ${raceTime.toFixed(1)}s</div>
                            <div style="font-size: 14px; color: #6b7280;">${
                              getRaceDistanceInfo(raceDistance).name
                            } Race</div>
                            ${
                              raceTime === fastestTime
                                ? '<div style="font-size: 14px; font-weight: bold; color: #dc2626; margin-top: 8px;">🔥 NEW RECORD! 🔥</div>'
                                : ""
                            }
                            <div style="font-size: 12px; color: #9ca3af; margin-top: 16px; border-top: 1px solid #d1d5db; padding-top: 16px;">Horse Race Picker</div>
                          </div>`;

                        document.body.appendChild(winnerElement);

                        try {
                          const canvas = await html2canvas(
                            winnerElement.firstElementChild,
                            {
                              backgroundColor: null,
                              scale: 2,
                            }
                          );

                          document.body.removeChild(winnerElement);

                          canvas.toBlob(async (blob) => {
                            if (
                              navigator.share &&
                              navigator.canShare &&
                              navigator.canShare({
                                files: [
                                  new File([blob], "race-result.png", {
                                    type: "image/png",
                                  }),
                                ],
                              })
                            ) {
                              const file = new File([blob], "race-result.png", {
                                type: "image/png",
                              });
                              await navigator.share({
                                title: "Horse Race Result",
                                text: `${winner} won the ${
                                  getRaceDistanceInfo(raceDistance).name
                                } race in ${raceTime.toFixed(1)}s!`,
                                files: [file],
                              });
                            } else {
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${winner.replace(
                                /[^a-zA-Z0-9]/g,
                                "_"
                              )}_race_result.png`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }
                          }, "image/png");
                        } catch (error) {
                          console.error("Error sharing result:", error);
                          alert("Unable to share result. Please try again.");
                        }
                      } catch (error) {
                        console.error("Error sharing result:", error);
                        alert("Unable to share result. Please try again.");
                        document.body.removeChild(winnerElement);
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold shadow-lg text-sm"
                  >
                    📤 Share Result
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
    </div>
  );
}