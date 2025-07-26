import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function RandomPicker() {
  const [showTitle, setShowTitle] = useState(true);
  const [itemCount, setItemCount] = useState(0);
  const [items, setItems] = useState([]);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [commentary, setCommentary] = useState("");
  const [history, setHistory] = useState([]);
  const [positions, setPositions] = useState([]);
  const [muted, setMuted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [raceTime, setRaceTime] = useState(0);
  const [fastestTime, setFastestTime] = useState(null);
  const [nameCategory, setNameCategory] = useState("Default");
  const horseAvatars = [
    "🐎",
    "🦄",
    "🐫",
    "🐘",
    "🐢",
    "🐕",
    "🐇",
    "🐖",
    "🦓",
    "🦌",
  ];

  const commentaryIntervalRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const raceStartTime = useRef(null);
  const runSoundRef = useRef(null);

  const trackContainerRef = useRef(null);

  // Increase the track length so the horses can run beyond the initial
  // viewport width. This gives the scrolling effect more room to work.
  const TRACK_LENGTH_PX = 2400;

  const maxItems = 20;

  // Ensure mobile devices render the layout correctly
  useEffect(() => {
    const existing = document.querySelector("meta[name='viewport']");
    if (!existing) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1";
      document.head.appendChild(meta);
    }
  }, []);

  // Enhanced commentary with more variety
  const commentaryPhrases = [
    "And they're off!",
    "Neck and neck!",
    "Pushing ahead!",
    "What a surge!",
    "It's too close to call!",
    "A stunning pace!",
    "They're flying down the track!",
    "Incredible speed!",
    "Look at that acceleration!",
    "The crowd is going wild!",
    "What an amazing race!",
    "Coming down to the wire!",
    "Photo finish incoming!",
    "The tension is palpable!",
  ];

  // Fun horse names for empty inputs
  const horseNameCategories = {
    Default: [
      "Lightning Bolt",
      "Thunder Strike",
      "Midnight Runner",
      "Golden Gallop",
      "Storm Chaser",
      "Fire Spirit",
      "Wind Walker",
      "Star Dancer",
      "Thunder Hooves",
      "Silver Arrow",
      "Blazing Trail",
      "Dream Catcher",
      "Wild Thunder",
      "Mystic Wind",
      "Flash Gordon",
      "Spirit Runner",
      "Comet Tail",
      "Moon Walker",
      "Sky Dancer",
      "Speed Demon",
    ],
    Takeaways: [
      "Fish & Chips",
      "Chinese",
      "Indian Curry",
      "Sushi",
      "Pizza",
      "Burgers",
      "Kebabs",
      "Thai Food",
      "Fried Chicken",
      "Mexican",
      "Noodles",
      "Doner",
      "Pho",
      "Dim Sum",
      "Wings",
      "BBQ Ribs",
      "Tandoori",
      "Gyros",
      "Falafel",
      "Ramen",
    ],
    Films: [
      "The Godfather",
      "Inception",
      "Shawshank",
      "The Matrix",
      "Pulp Fiction",
      "Fight Club",
      "The Dark Knight",
      "Forrest Gump",
      "Interstellar",
      "Parasite",
      "Gladiator",
      "Titanic",
      "The Departed",
      "La La Land",
      "Goodfellas",
      "Whiplash",
      "Casablanca",
      "Joker",
      "Amélie",
      "No Country for Old Men",
    ],
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [shuffledHorseNames, setShuffledHorseNames] =
    useState(horseNameCategories);

  useEffect(() => {
    const shuffled = Object.fromEntries(
      Object.entries(horseNameCategories).map(([key, names]) => [
        key,
        shuffleArray(names),
      ])
    );
    setShuffledHorseNames(shuffled);
  }, []);

  // Play running sound when the race is active and not muted
  useEffect(() => {
    const audio = runSoundRef.current;
    if (!audio) return;
    if (isRacing && !muted) {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isRacing, muted]);

  const handleCountChange = (e) => {
    const count = Math.min(
      maxItems,
      Math.max(0, parseInt(e.target.value, 10) || 0)
    );
    setItemCount(count);
    setItems(Array(count).fill(""));
    setWinner(null);
    setWinnerIndex(null);
    setIsRacing(false);
    setCommentary("");
    setPositions(Array(count).fill(0));
    setRaceTime(0);
    cancelAnimationFrame(animationFrameIdRef.current);
    clearInterval(commentaryIntervalRef.current);
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const getHorseName = (item, index) => {
    const categoryList =
      shuffledHorseNames[nameCategory] || horseNameCategories["Default"];
    return item.trim() || categoryList[index % categoryList.length];
  };

  const beginCountdown = () => {
    let count = 3;
    setCountdown(count);
    const countdownInterval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        startRace();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const startRace = () => {
    setIsRacing(true);
    setWinner(null);
    setWinnerIndex(null);
    setCommentary("And they're off!");
    setPositions(Array(itemCount).fill(0));
    setRaceTime(0);
    raceStartTime.current = Date.now();

    // Timer for race duration
    const timerInterval = setInterval(() => {
      if (raceStartTime.current) {
        setRaceTime((Date.now() - raceStartTime.current) / 1000);
      }
    }, 100);

    commentaryIntervalRef.current = setInterval(() => {
      const next =
        commentaryPhrases[Math.floor(Math.random() * commentaryPhrases.length)];
      setCommentary(next);
    }, 1500);

    const trackWidth = TRACK_LENGTH_PX;
    let finished = false;

    if (trackContainerRef.current) {
      trackContainerRef.current.scrollLeft = 0;
    }

    // More realistic speed distribution
    const speeds = Array(itemCount)
      .fill(0)
      .map(() => Math.random() * 0.003 + 0.002);

    const updatePositions = () => {
      let updatedPositions = [];
      setPositions((prevPositions) => {
        if (finished) {
          updatedPositions = prevPositions;
          return prevPositions;
        }
        updatedPositions = prevPositions.map((pos, idx) => {
          // Add more dramatic speed variations
          const surge = Math.random() * 0.008 - 0.003;
          const delta = speeds[idx] + surge;
          let nextPos = pos + delta;
          if (nextPos > 1) nextPos = 1;
          return Math.max(0, nextPos);
        });

        const winnerIdx = updatedPositions.findIndex((p) => p >= 1);
        if (winnerIdx !== -1) {
          finished = true;
          clearInterval(timerInterval);
          const finalTime = parseFloat(
            ((Date.now() - raceStartTime.current) / 1000).toFixed(1)
          );

          const winnerName = getHorseName(items[winnerIdx], winnerIdx);
          setWinner(winnerName);
          setWinnerIndex(winnerIdx);
          setIsRacing(false);
          setCommentary(`🏆 ${winnerName} wins!`);
          setRaceTime(finalTime);

          // Update fastest time
          if (!fastestTime || finalTime < fastestTime) {
            setFastestTime(finalTime);
          }

          // Enhanced confetti
          const colors = [
            "#ff0000",
            "#00ff00",
            "#0000ff",
            "#ffff00",
            "#ff00ff",
            "#00ffff",
          ];
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              if (typeof window !== "undefined") {
                // Simulated confetti effect
                console.log("🎉 Confetti burst!");
              }
            }, i * 300);
          }

          setHistory((prev) => [
            {
              winner: winnerName,
              time: `${finalTime}s`,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev.slice(0, 9), // Keep only last 10 races
          ]);
          clearInterval(commentaryIntervalRef.current);
        }

        if (trackContainerRef.current) {
          const container = trackContainerRef.current;
          const lead = Math.max(...updatedPositions);
          const newLeft = lead * (trackWidth - container.clientWidth);
          container.scrollLeft = newLeft;
        }

        return updatedPositions;
      });

      if (!finished) {
        animationFrameIdRef.current = requestAnimationFrame(updatePositions);
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(updatePositions);
  };

  const resetRace = () => {
    setItemCount(0);
    setItems([]);
    setWinner(null);
    setWinnerIndex(null);
    setIsRacing(false);
    setCommentary("");
    setPositions([]);
    setRaceTime(0);
    clearInterval(commentaryIntervalRef.current);
    cancelAnimationFrame(animationFrameIdRef.current);
  };

  const clearHistory = () => {
    setHistory([]);
    setFastestTime(null);
  };

  const quickFill = () => {
    const categoryList =
      shuffledHorseNames[nameCategory] || horseNameCategories["Default"];
    const newItems = Array(itemCount)
      .fill("")
      .map((_, index) => categoryList[index % categoryList.length]);
    setItems(newItems);
  };

  const toggleMute = () => setMuted(!muted);

  const isStartDisabled = itemCount === 0 || isRacing || countdown;

  if (showTitle) {
    return (
      <div
        className="min-h-screen relative flex items-center justify-center text-center bg-cover bg-center"
        style={{ backgroundImage: "url('/startscreen.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Horse Race Picker
          </h1>
          <p className="text-lg sm:text-xl text-yellow-200 mb-8">
            Ready... Set... Race!
          </p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTitle(false)}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-bold shadow-xl"
          >
            Start
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6f4f1] flex flex-col items-center justify-start p-2 sm:p-4 sm:justify-center overflow-x-hidden">
      <audio ref={runSoundRef} src="/run.mp3" loop className="hidden" />
      <div className="bg-white bg-opacity-95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 w-full max-w-4xl mt-2 sm:mt-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-3xl sm:text-4xl">🏇</span>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Horse Race Picker
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {fastestTime && (
              <div className="text-xs sm:text-sm bg-yellow-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                🏆 Record: {fastestTime}s
              </div>
            )}
            <button
              onClick={toggleMute}
              className="text-xl sm:text-2xl hover:scale-110 transition-transform p-2 rounded-full hover:bg-gray-100"
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm sm:text-base">
              Number of Contestants (1-{maxItems})
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={maxItems}
                className="flex-1 p-3 border-2 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors"
                onChange={handleCountChange}
                value={itemCount || ""}
                disabled={isRacing || countdown}
                placeholder="Enter number..."
              />
              {itemCount > 0 && (
                <button
                  onClick={quickFill}
                  className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 text-lg"
                  disabled={isRacing || countdown}
                  title="Fill with random horse names"
                >
                  🎲
                </button>
              )}
            </div>
          </div>

          {isRacing && (
            <div className="flex flex-col justify-center">
              <div className="text-center bg-blue-50 p-3 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {raceTime.toFixed(1)}s
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Race Time
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="mb-4 sm:mb-6">
              <label className="block font-semibold text-gray-700 text-sm sm:text-base mb-2">
                Theme
              </label>
              <select
                value={nameCategory}
                onChange={(e) => setNameCategory(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-base"
                disabled={isRacing || countdown}
              >
                {Object.keys(horseNameCategories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">
              Contestants:
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {items.map((item, index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    placeholder={`Or use: ${
                      shuffledHorseNames[nameCategory][
                        index % shuffledHorseNames[nameCategory].length
                      ]
                    }`}
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors pl-10 pr-12"
                    disabled={isRacing || countdown}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
                    {horseAvatars[index % horseAvatars.length]}
                  </span>

                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-400">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
            <button
              onClick={beginCountdown}
              className={`flex-1 text-white p-4 rounded-xl font-semibold transition-all transform text-base sm:text-lg ${
                isStartDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 active:scale-95 shadow-lg"
              }`}
              disabled={isStartDisabled}
            >
              {countdown
                ? `🏁 Starting in ${countdown}...`
                : isRacing
                ? "🏃‍♂️ Racing..."
                : "🚀 Start Race!"}
            </button>
            <button
              onClick={resetRace}
              className="w-full sm:w-auto px-6 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all transform active:scale-95 shadow-lg font-semibold py-4 text-base sm:text-lg"
              disabled={isRacing || countdown}
            >
              🔄 Reset
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="overflow-x-auto" ref={trackContainerRef}>
            <div
              className="p-3 sm:p-6 rounded-2xl shadow-inner bg-no-repeat bg-cover bg-center"
              style={{
                backgroundImage: "url('/racetrack1.jpg')",
                backgroundColor: "#e6f4f1", // fallback if image fails
                width: `${TRACK_LENGTH_PX}px`,
              }}
            >
              <div className="space-y-2 sm:space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="relative w-full h-12 sm:h-16 bg-white bg-opacity-80 border-2 border-gray-300 rounded-xl overflow-hidden shadow-md"
                  >
                    {/* Track lines */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-30"></div>

                    {/* Progress trail */}
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-60"
                      animate={{
                        width: positions[index]
                          ? `${positions[index] * 100}%`
                          : "0%",
                      }}
                      transition={{ duration: 0.1 }}
                    />

                    {/* Finish line */}
                    <div className="absolute right-1 sm:right-2 top-0 h-full w-0.5 sm:w-1 bg-red-500 opacity-80"></div>

                    {/* Horse */}
                    <motion.div
                      className={`absolute left-0 top-0 h-full flex items-center px-2 sm:px-3 text-sm sm:text-lg font-semibold z-10 min-w-0 ${
                        winnerIndex === index
                          ? "bg-yellow-300 text-yellow-800 shadow-lg"
                          : "bg-white bg-opacity-90"
                      }`}
                      animate={{
                        // Move the horse across the full width of the track.
                        x: positions[index]
                          ? `${Math.min(positions[index] * 100, 100)}%`
                          : "0%",
                      }}
                      transition={{ duration: 0.1 }}
                    >
                      <motion.div
                        animate={
                          isRacing
                            ? {
                                rotateZ: [0, -2, 2, -2, 2, 0],
                                y: [0, -2, 2, -1, 1, 0],
                              }
                            : { rotateZ: 0, y: 0 }
                        }
                        transition={{
                          duration: 0.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="flex items-center gap-1 sm:gap-2 min-w-0"
                      >
                        <span className="text-base sm:text-xl flex-shrink-0">
                          {horseAvatars[index % horseAvatars.length]}
                        </span>

                        <span className="text-xs sm:text-sm font-bold truncate max-w-20 sm:max-w-32">
                          {getHorseName(item, index)}
                        </span>
                      </motion.div>
                    </motion.div>

                    {/* Lane number */}
                    <div className="absolute right-2 sm:right-6 top-0.5 sm:top-1 text-xs font-bold text-gray-500">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {(isRacing || countdown) && (
                <motion.div
                  className="text-center mt-3 sm:mt-4 p-2 sm:p-3 bg-white bg-opacity-70 rounded-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-base sm:text-lg font-bold text-gray-800">
                    📢 {commentary || `Get ready... ${countdown}!`}
                  </p>
                </motion.div>
              )}

              {winner && (
                <motion.div
                  className="mt-4 sm:mt-6 text-center p-4 sm:p-6 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-xl shadow-lg"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-4xl sm:text-6xl mb-2">🏆</div>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">
                    WINNER!
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-800 mb-2 break-words">
                    {winner}
                  </p>
                  <p className="text-base sm:text-lg text-gray-700">
                    Finish Time: {raceTime}s
                  </p>
                  {raceTime === fastestTime && (
                    <p className="text-xs sm:text-sm font-bold text-red-600 mt-1">
                      🔥 NEW RECORD! 🔥
                    </p>
                  )}
                </motion.div>
              )}

              {winner && !isRacing && !countdown && (
                <div className="text-center mt-2">
                  <button
                    onClick={beginCountdown}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg transition-all active:scale-95"
                  >
                    🔁 Race Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-gray-50 p-3 sm:p-4 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                🏁 Race History
              </h3>
              <button
                onClick={clearHistory}
                className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
              >
                Clear History
              </button>
            </div>
            <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
              {history.map((race, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm bg-white p-2 rounded gap-1 sm:gap-0"
                >
                  <span className="font-semibold truncate max-w-full sm:max-w-48">
                    {race.winner}
                  </span>
                  <div className="text-gray-600 flex gap-2 sm:gap-3 text-xs">
                    <span className="font-mono">{race.time}</span>
                    <span>{race.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
