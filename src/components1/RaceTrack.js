import React from "react";
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
}) {
  // Calculate camera position based on leading horse
  const leadPosition = Math.max(...positions);
  const leadPixelPos = leadPosition * (trackLength - 200);
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth - 100 : 800;
  const cameraOffset = Math.max(0, Math.min(leadPixelPos - viewportWidth * 0.3, trackLength - viewportWidth));

  return (
    <div className="flex-1 p-3 sm:p-4 relative flex flex-col">
      {/* Viewport container with fixed dimensions */}
      <div 
        className="relative h-full min-h-96 overflow-hidden rounded-2xl"
        ref={trackContainerRef}
      >
        {/* Track container that moves smoothly */}
        <motion.div
          className={`p-3 rounded-2xl shadow-inner bg-gradient-to-r ${
            currentWeather
              ? currentWeather.trackColor
              : "from-green-400 to-green-600"
          } relative h-full min-h-96`}
          style={{ width: `${trackLength}px`, backgroundSize: "cover" }}
          animate={{ x: -cameraOffset }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="space-y-2 relative z-10 py-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="relative w-full h-16 bg-green-100 bg-opacity-60 border-2 border-green-700 rounded-xl overflow-hidden shadow-md"
              >
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-green-800 opacity-10" />
                {getRaceSettings(raceDistance).hurdlePixels.map(
                  (hurdlePixelPos, hIdx) => (
                    <div
                      key={hIdx}
                      className="absolute top-2 bottom-2 w-2 bg-gradient-to-b from-amber-600 to-amber-800 opacity-80 rounded-sm shadow-md z-10"
                      style={{ left: `${hurdlePixelPos}px` }}
                      title="Hurdle"
                    >
                      <div className="absolute -top-1 -left-1 w-4 h-4 text-xs flex items-center justify-center">
                        🚧
                      </div>
                    </div>
                  )
                )}
                {/* FINISH LINE - Winner determined here */}
                <div className="absolute top-0 h-full w-4 bg-gradient-to-b from-white via-black to-white opacity-100 shadow-2xl border-2 border-black z-20" style={{ left: `${trackLength - 200}px` }}>
                  <div className="absolute -top-3 -left-3 text-lg font-bold text-black bg-white px-1 rounded shadow-lg">🏁</div>
                  <div className="absolute top-1/2 -left-8 -translate-y-1/2 text-xs font-bold text-black bg-white px-1 rounded shadow transform -rotate-90 whitespace-nowrap">FINISH</div>
                </div>
                <motion.div
                  className="absolute top-0 h-full flex items-center z-30"
                  animate={{
                    x: positions[index]
                      ? `${Math.min(positions[index], 1.1) * (trackLength - 200 - 150)}px`
                      : "0px",
                  }}
                  transition={{ 
                    duration: 0.1,
                    ease: "linear"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`px-3 py-1 rounded-lg shadow-lg border-2 whitespace-nowrap ${
                        winnerIndex === index
                          ? "bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 border-yellow-500"
                          : surgingHorses[index]
                          ? "bg-gradient-to-r from-orange-400 to-red-500 text-white border-orange-600"
                          : fatiguedHorses[index]
                          ? "bg-gradient-to-r from-gray-400 to-gray-600 text-gray-200 border-gray-700"
                          : "bg-white bg-opacity-95 text-gray-800 border-gray-200"
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: surgingHorses[index] ? [1, 1.1, 1] : 1, 
                        opacity: 1,
                        boxShadow: surgingHorses[index] 
                          ? ["0 0 0px rgba(255,165,0,0)", "0 0 20px rgba(255,165,0,0.8)", "0 0 0px rgba(255,165,0,0)"]
                          : "0 4px 6px rgba(0,0,0,0.1)"
                      }}
                      transition={{ 
                        delay: 0.2,
                        scale: { duration: 0.3, repeat: surgingHorses[index] ? Infinity : 0 },
                        boxShadow: { duration: 0.5, repeat: surgingHorses[index] ? Infinity : 0 }
                      }}
                    >
                      <div className="flex items-center gap-2">
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
                        {surgingHorses[index] && winnerIndex !== index && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.3, repeat: Infinity }}
                            className="text-orange-200"
                          >
                            ⚡
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
                              // Racing animation - continues even past finish line until race stops
                              rotateZ: [0, -5, 5, -5, 5, 0],
                              y: [0, -4, 4, -3, 3, 0],
                              scale: [1, 1.1, 0.9, 1.1, 0.9, 1],
                            }
                          : { rotateZ: 0, y: 0, scale: 1 } // Stopped when race ends
                      }
                      transition={{
                        duration: isRacing ? 0.3 : 0.5,
                        repeat: isRacing ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                      className="w-16 h-16 object-contain rounded-lg flex-shrink-0"
                      style={{
                        filter:
                          winnerIndex === index
                            ? "drop-shadow(0 0 8px gold)"
                            : surgingHorses[index]
                            ? "drop-shadow(0 0 12px orange) brightness(1.2)"
                            : fatiguedHorses[index]
                            ? "brightness(0.6) saturate(0.5)"
                            : "none",
                      }}
                    />
                  </div>
                </motion.div>
                <div className="absolute right-4 top-0.5 text-xs font-bold text-gray-500">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>

        </motion.div>
      </div>
      
      {/* Winner modal - positioned outside the track container */}
      {winner && !isRacing && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <motion.div
            className="text-center p-6 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 rounded-2xl shadow-2xl max-w-sm w-full mx-auto relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
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
                  Finish Time: {raceTime}s
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
                            <div style="font-size: 18px; color: #374151; margin-bottom: 8px;">Finish Time: ${raceTime}s</div>
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
                                } race in ${raceTime}s!`,
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
      
      {/* Commentary below race track */}
      {(isRacing || countdown) && (
        <motion.div
          key={commentary || countdown} 
          className="mt-4 p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white rounded-2xl backdrop-blur-sm shadow-2xl border-2 border-white/20 max-w-md mx-auto"
          animate={{
            scale: [1, 1.02, 1],
            boxShadow: [
              "0 10px 25px rgba(0,0,0,0.3)",
              "0 15px 35px rgba(0,0,0,0.4)",
              "0 10px 25px rgba(0,0,0,0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <div className="flex items-center gap-3 justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl"
            >
              📢
            </motion.div>
            <p className="text-sm sm:text-base font-bold text-center flex-1 leading-tight">
              {commentary || `Get ready... ${countdown}!`}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}