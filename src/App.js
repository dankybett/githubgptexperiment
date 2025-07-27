import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";

export default function RandomPicker() {
  const [showTitle, setShowTitle] = useState(true);
  const [showRaceScreen, setShowRaceScreen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [items, setItems] = useState([]);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [commentary, setCommentary] = useState("");
  const [history, setHistory] = useState([]);
  const [positions, setPositions] = useState([]);
  const [muted, setMuted] = useState(false);
  const raceSoundRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [raceTime, setRaceTime] = useState(0);
  const [fastestTime, setFastestTime] = useState(null);
  const [nameCategory, setNameCategory] = useState("Default");
  const [raceDistance, setRaceDistance] = useState("medium"); // short, medium, long
  const [currentWeather, setCurrentWeather] = useState(null);

  // Horse avatars can now be custom images located in the `public` folder.
  // Simply add your images (e.g. horse1.png, horse2.png...) and list the file
  // names here. They will be displayed instead of the previous emoji icons.
  const horseAvatars = [
    "/horses/horse1.png",
    "/horses/horse2.png",
    "/horses/horse3.png",
    "/horses/horse4.png",
    "/horses/horse5.png",
    "/horses/horse6.png",
    "/horses/horse7.png",
    "/horses/horse8.png",
    "/horses/horse9.png",
    "/horses/horse10.png",
  ];

  // Preload horse images so they don't pop in when the race starts
  useEffect(() => {
    horseAvatars.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Weather effects configuration
  const weatherEffects = {
    sunny: {
      name: "Sunny",
      emoji: "☀️",
      description: "Perfect racing conditions",
      background: "from-yellow-200 via-orange-200 to-yellow-300",
      trackColor: "from-green-400 to-green-600",
      speedMultiplier: 1.0,
      particles: "☀️",
      particleCount: 3,
    },
    rainy: {
      name: "Rainy",
      emoji: "🌧️",
      description: "Slippery track conditions",
      background: "from-gray-300 via-blue-200 to-gray-400",
      trackColor: "from-green-600 to-green-800",
      speedMultiplier: 0.85,
      particles: "💧",
      particleCount: 8,
    },
    muddy: {
      name: "Muddy",
      emoji: "🟤",
      description: "Heavy going, tough conditions",
      background: "from-amber-200 via-yellow-300 to-amber-300",
      trackColor: "from-amber-600 to-amber-800",
      speedMultiplier: 0.75,
      particles: "💨",
      particleCount: 5,
    },
    snowy: {
      name: "Snowy",
      emoji: "❄️",
      description: "Winter wonderland racing",
      background: "from-blue-100 via-white to-blue-200",
      trackColor: "from-blue-300 to-blue-500",
      speedMultiplier: 0.8,
      particles: "❄️",
      particleCount: 12,
    },
    night: {
      name: "Night",
      emoji: "🌙",
      description: "Racing under the stars",
      background: "from-purple-900 via-blue-900 to-black",
      trackColor: "from-gray-600 to-gray-800",
      speedMultiplier: 0.95,
      particles: "⭐",
      particleCount: 6,
    },
    windy: {
      name: "Windy",
      emoji: "🍃",
      description: "Autumn leaves swirling",
      background: "from-orange-200 via-red-200 to-yellow-200",
      trackColor: "from-green-500 to-green-700",
      speedMultiplier: 0.9,
      particles: "🍂",
      particleCount: 10,
    },
  };

  const commentaryIntervalRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const raceStartTime = useRef(null);
  const trackContainerRef = useRef(null);
  const racePhaseRef = useRef(0); // Track race progress for dramatic events
  const lastLeaderRef = useRef(-1);
  const dramaMomentRef = useRef(0);
  const bellSoundRef = useRef(null);
  const cheerSoundRef = useRef(null);
  const usedCommentaryRef = useRef(new Set()); // Track used commentary
  const lastCommentaryRef = useRef(""); // Track last commentary to prevent immediate repeats

  const [trackLength, setTrackLength] = useState(window.innerWidth * 2);

  useEffect(() => {
    const updateTrackLength = () => {
      // Updated track lengths: classic same as marathon, marathon twice as long
      const baseLength =
        raceDistance === "short" ? 1.8 : raceDistance === "long" ? 9 : 4.5; // marathon now 9x instead of 4.5x
      setTrackLength(Math.max(window.innerWidth * baseLength, 1000));
    };

    window.addEventListener("resize", updateTrackLength);
    updateTrackLength();

    return () => window.removeEventListener("resize", updateTrackLength);
  }, [raceDistance]);

  const maxItems = 20;

  const commentaryPhrases = {
    start: [
      "And they're off!",
      "The race begins!",
      "They're out of the gate!",
      "Here we go!",
      "The starting flag drops!",
      "They're away!",
    ],
    early: [
      "Early positions forming!",
      "It's still anyone's race!",
      "The pack is tight!",
      "No clear leader yet!",
      "They're bunched together at the start!",
      "Still settling into rhythm!",
      "The field is wide open!",
    ],
    middle: [
      "Neck and neck!",
      "What a battle!",
      "The pace is heating up!",
      "They're bunched together!",
      "It's getting intense!",
      "Look at that surge!",
      "A new challenger emerges!",
      "The field is tightening!",
      "What an exciting race!",
      "They're matching each other stride for stride!",
      "The competition is fierce!",
      "No one wants to give an inch!",
    ],
    dramatic: [
      "Unbelievable comeback!",
      "From last to first!",
      "What a charge!",
      "They're making their move!",
      "This is incredible!",
      "The dark horse is rising!",
      "A stunning turnaround!",
      "Cleared that hurdle beautifully!",
      "Oh no! A stumble at the hurdle!",
      "What a recovery!",
      "The marathon is taking its toll!",
      "Incredible endurance on display!",
      "That's a phenomenal burst of speed!",
      "They're overtaking on the outside!",
      "What heart! What determination!",
    ],
    final: [
      "Coming down to the wire!",
      "Photo finish incoming!",
      "The crowd is on their feet!",
      "This is too close to call!",
      "What a finish!",
      "They're flying to the line!",
      "One final push to victory!",
      "The finish line approaches!",
      "Who will take it?",
      "It's anyone's race!",
    ],
    winner: [
      "We have a winner!",
      "What a race!",
      "Incredible finish!",
      "Victory is decided!",
      "They've done it!",
      "What a champion!",
    ],
    weather: {
      rainy: ["The rain is making this treacherous!", "Slipping and sliding!"],
      muddy: ["The mud is slowing them down!", "Heavy going out there!"],
      snowy: ["Fighting through the snow!", "Winter conditions are tough!"],
      windy: ["The wind is picking up!", "Leaves swirling everywhere!"],
      night: ["Racing under the stars!", "What a beautiful night race!"],
    },
  };

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

  // Generate random weather for each race
  const generateRandomWeather = () => {
    const weatherTypes = Object.keys(weatherEffects);
    const randomWeather =
      weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    setCurrentWeather(weatherEffects[randomWeather]);
  };

  useEffect(() => {
    raceSoundRef.current = new Audio("/run.mp3");
    bellSoundRef.current = new Audio("/startingpistol.mp3");
    cheerSoundRef.current = new Audio("/cheer.mp3");

    raceSoundRef.current.loop = true;
    raceSoundRef.current.volume = muted ? 0 : 1;

    bellSoundRef.current.volume = muted ? 0 : 1;
    cheerSoundRef.current.volume = muted ? 0 : 1;
  }, []);

  useEffect(() => {
    const vol = muted ? 0 : 1;
    if (raceSoundRef.current) raceSoundRef.current.volume = vol;
    if (bellSoundRef.current) bellSoundRef.current.volume = vol;
    if (cheerSoundRef.current) cheerSoundRef.current.volume = vol;
  }, [muted]);

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

  const goToRaceScreen = () => {
    generateRandomWeather();
    setShowRaceScreen(true);
    setWinner(null);
    setWinnerIndex(null);
    setIsRacing(false);
    setCommentary("");
    setPositions(Array(itemCount).fill(0));
    setRaceTime(0);
    setCountdown(null);
    racePhaseRef.current = 0;
    lastLeaderRef.current = -1;
    dramaMomentRef.current = 0;
    usedCommentaryRef.current.clear(); // Reset commentary tracking
    lastCommentaryRef.current = ""; // Reset last commentary
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    const countdownInterval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        startRace();
      } else {
        if (bellSoundRef.current) {
          bellSoundRef.current.currentTime = 0;
          bellSoundRef.current
            .play()
            .catch((e) => console.warn("Bell sound failed:", e));
        }
        setCountdown(count);
      }
    }, 1000);
  };

  const getRaceSettings = (distance) => {
    const settings = {
      short: {
        baseSpeed: 0.004,
        speedVariation: 0.003, // Reduced variation for tighter races
        surgeIntensity: 0.005, // Reduced surge intensity
        surgeFrequency: 0.35,
        comebackChance: 0.15,
        dramaMoments: 2,
        hurdles: [],
        staminaFactor: 0.1,
        packTightness: 0.85, // New factor for keeping horses together
      },
      medium: {
        baseSpeed: 0.002,
        speedVariation: 0.002, // Much tighter speed variation
        surgeIntensity: 0.003, // Smaller surges
        surgeFrequency: 0.28,
        comebackChance: 0.25,
        dramaMoments: 3,
        hurdles: [0.3, 0.65],
        staminaFactor: 0.2,
        packTightness: 0.9,
      },
      long: {
        baseSpeed: 0.0008, // Slower for longer race (was 0.0015)
        speedVariation: 0.0015, // Even tighter for marathon
        surgeIntensity: 0.002,
        surgeFrequency: 0.22,
        comebackChance: 0.4,
        dramaMoments: 5,
        hurdles: [0.15, 0.35, 0.55, 0.75, 0.9],
        staminaFactor: 0.35,
        packTightness: 0.95, // Very tight pack for marathon
      },
    };
    // Apply weather speed multiplier
    if (currentWeather) {
      const weatherSettings = { ...settings[distance] };
      weatherSettings.baseSpeed *= currentWeather.speedMultiplier;
      return weatherSettings;
    }
    return settings[distance];
  };

  const getCommentaryForPhase = (phase) => {
    let phrases = commentaryPhrases[phase] || commentaryPhrases.middle;

    // Inject weather-related commentary occasionally
    if (
      currentWeather &&
      commentaryPhrases.weather[currentWeather.name.toLowerCase()]
    ) {
      if (Math.random() < 0.3) {
        phrases = [
          ...phrases,
          ...commentaryPhrases.weather[currentWeather.name.toLowerCase()],
        ];
      }
    }
    const availablePhrases = phrases.filter(
      (phrase) =>
        !usedCommentaryRef.current.has(phrase) &&
        phrase !== lastCommentaryRef.current
    );

    // If we've used all phrases or only the last one remains, reset the used set
    if (availablePhrases.length === 0) {
      usedCommentaryRef.current.clear();
      const resetPhrases = phrases.filter(
        (phrase) => phrase !== lastCommentaryRef.current
      );
      availablePhrases.push(
        ...(resetPhrases.length > 0 ? resetPhrases : phrases)
      );
    }

    const selectedPhrase =
      availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
    usedCommentaryRef.current.add(selectedPhrase);
    lastCommentaryRef.current = selectedPhrase;

    return selectedPhrase;
  };

  const startRace = () => {
    setIsRacing(true);
    if (raceSoundRef.current) {
      raceSoundRef.current.currentTime = 0;
      raceSoundRef.current
        .play()
        .catch((e) => console.warn("Race sound playback failed:", e));
    }
    setWinner(null);
    setWinnerIndex(null);

    // Immediate start commentary
    const startPhrases = commentaryPhrases.start;
    setCommentary(
      startPhrases[Math.floor(Math.random() * startPhrases.length)]
    );

    setPositions(Array(itemCount).fill(0));
    setRaceTime(0);
    raceStartTime.current = Date.now();
    racePhaseRef.current = 0;
    lastLeaderRef.current = -1;
    dramaMomentRef.current = 0;
    usedCommentaryRef.current.clear(); // Reset commentary tracking

    const settings = getRaceSettings(raceDistance);

    const timerInterval = setInterval(() => {
      if (raceStartTime.current) {
        setRaceTime((Date.now() - raceStartTime.current) / 1000);
      }
    }, 100);

    // More frequent dynamic commentary
    let commentaryCounter = 0;
    commentaryIntervalRef.current = setInterval(() => {
      const progress = Math.max(...positions);
      let phase = "middle";
      commentaryCounter++;

      if (progress < 0.15) phase = "early";
      else if (progress > 0.85) phase = "final";
      else if (dramaMomentRef.current > 0) {
        phase = "dramatic";
        dramaMomentRef.current--;
      }

      // Add some variety - occasionally use middle phase commentary even in other phases
      if (commentaryCounter % 3 === 0 && phase !== "dramatic") {
        phase = "middle";
      }

      const next = getCommentaryForPhase(phase);
      setCommentary(next);
    }, 1800);

    let finished = false;

    if (trackContainerRef.current) {
      trackContainerRef.current.scrollLeft = 0;
    }

    // Initialize horses with varied starting potential
    const horseProfiles = Array(itemCount)
      .fill(0)
      .map((_, idx) => ({
        baseSpeed:
          settings.baseSpeed + (Math.random() - 0.5) * settings.speedVariation,
        stamina: 0.6 + Math.random() * 0.7, // How well they maintain speed
        comebackPotential: Math.random(), // Chance for dramatic comeback
        hurdleSkill: 0.3 + Math.random() * 0.7, // How well they handle hurdles
        surgeCount: 0,
        lastSurge: 0,
        isComingBack: false,
        hurdlesCrossed: [],
        isStunned: false,
        stunnedUntil: 0,
      }));

    const updatePositions = () => {
      let updatedPositions = [];
      setPositions((prevPositions) => {
        if (finished) {
          updatedPositions = prevPositions;
          return prevPositions;
        }

        const currentProgress = Math.max(...prevPositions);
        const currentLeader = prevPositions.indexOf(Math.max(...prevPositions));

        // Check for leader changes to trigger dramatic commentary
        if (currentLeader !== lastLeaderRef.current && currentProgress > 0.1) {
          lastLeaderRef.current = currentLeader;
          dramaMomentRef.current = 2; // Trigger dramatic commentary
        }

        updatedPositions = prevPositions.map((pos, idx) => {
          const profile = horseProfiles[idx];
          let speed = profile.baseSpeed;

          // Check if horse is stunned from a hurdle
          const currentTime = Date.now();
          if (profile.isStunned && currentTime < profile.stunnedUntil) {
            return pos; // Horse is stunned, no movement
          } else if (profile.isStunned) {
            profile.isStunned = false; // Recovery from stun
          }

          // Apply stamina effect (more pronounced in longer races)
          const fatigueEffect =
            1 - pos * (1 - profile.stamina) * settings.staminaFactor;
          speed *= Math.max(fatigueEffect, 0.3); // Don't let horses stop completely

          // Pack tightness effect - keep horses closer together
          const averageProgress =
            prevPositions.reduce((a, b) => a + b, 0) / prevPositions.length;
          const deviation = pos - averageProgress;
          const packEffect =
            1 - Math.abs(deviation) * (1 - settings.packTightness);
          speed *= Math.max(packEffect, 0.7); // Minimum speed multiplier

          // Check for hurdles
          for (const hurdlePos of settings.hurdles) {
            const hurdleRange = 0.02; // Small range around hurdle position
            if (
              pos >= hurdlePos - hurdleRange &&
              pos <= hurdlePos + hurdleRange &&
              !profile.hurdlesCrossed.includes(hurdlePos)
            ) {
              profile.hurdlesCrossed.push(hurdlePos);

              // Hurdle jump mechanics based on skill
              const jumpSuccess = Math.random() < profile.hurdleSkill;

              if (jumpSuccess) {
                // Good jump - slight boost
                speed += settings.surgeIntensity * 0.4;
                dramaMomentRef.current = Math.max(dramaMomentRef.current, 1);
              } else {
                // Failed jump - horse stumbles
                const stunDuration = 400 + Math.random() * 600; // 0.4-1.0 seconds
                profile.isStunned = true;
                profile.stunnedUntil = currentTime + stunDuration;
                speed = 0; // Immediate stop
                dramaMomentRef.current = 3; // Major dramatic moment
              }
            }
          }

          // Random surge system (less frequent in longer races)
          const shouldSurge =
            Math.random() < settings.surgeFrequency &&
            pos - profile.lastSurge > 0.12 &&
            !profile.isStunned;
          if (shouldSurge) {
            const surgeStrength = 0.6 + Math.random() * 1.2;
            speed += settings.surgeIntensity * surgeStrength;
            profile.surgeCount++;
            profile.lastSurge = pos;
          }

          // Enhanced comeback mechanic for horses falling behind
          const isLagging = pos < averageProgress - 0.05; // Much smaller threshold for tighter races
          const shouldComeback =
            isLagging &&
            Math.random() <
              settings.comebackChance * profile.comebackPotential &&
            !profile.isStunned;

          if (shouldComeback && !profile.isComingBack) {
            profile.isComingBack = true;
            speed += settings.surgeIntensity * 1.2; // Smaller comeback boost for tighter races
            dramaMomentRef.current = 4; // Major dramatic moment
          }

          // Maintain comeback boost for a longer period in marathons
          if (profile.isComingBack) {
            const comebackBoost = raceDistance === "long" ? 0.3 : 0.2; // Smaller boost
            speed += settings.surgeIntensity * comebackBoost;
            if (pos > averageProgress + 0.03) {
              // Much smaller threshold
              profile.isComingBack = false;
            }
          }

          // Add controlled randomness (minimal for very tight racing)
          const randomFactor = 1 + (Math.random() - 0.5) * 0.08; // Much reduced from 0.15
          speed *= randomFactor;

          // Final calculation
          let nextPos = Math.max(0, pos + speed);
          if (nextPos > 1) nextPos = 1;
          return nextPos;
        });

        const winnerIdx = updatedPositions.findIndex((p) => p >= 1);
        if (winnerIdx !== -1) {
          finished = true;
          if (raceSoundRef.current) {
            raceSoundRef.current.pause();
          }
          clearInterval(timerInterval);
          const finalTime = parseFloat(
            ((Date.now() - raceStartTime.current) / 1000).toFixed(1)
          );

          const winnerName = getHorseName(items[winnerIdx], winnerIdx);
          setWinner(winnerName);
          setWinnerIndex(winnerIdx);
          setIsRacing(false);
          setCommentary(`🏆 ${winnerName} wins in a thrilling finish!`);
          if (cheerSoundRef.current) {
            cheerSoundRef.current.currentTime = 0;
            cheerSoundRef.current
              .play()
              .catch((e) => console.warn("Cheer sound failed:", e));
          }

          setRaceTime(finalTime);

          if (!fastestTime || finalTime < fastestTime) {
            setFastestTime(finalTime);
          }

          setHistory((prev) => [
            {
              winner: winnerName,
              time: `${finalTime}s`,
              distance: raceDistance,
              weather: currentWeather?.name || "Clear",
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev.slice(0, 9),
          ]);
          clearInterval(commentaryIntervalRef.current);
        }

        if (trackContainerRef.current) {
          const container = trackContainerRef.current;
          const lead = Math.max(...updatedPositions);
          const minPos = Math.min(...updatedPositions);
          const spread = lead - minPos;

          // Dynamic camera following - focus on the action
          let focusPoint;
          if (spread < 0.15) {
            // Tight pack - follow the middle of the pack
            focusPoint = (lead + minPos) / 2;
          } else {
            // Spread out - follow slightly behind the leader to show more action
            focusPoint = lead - 0.1;
          }

          const newLeft = Math.max(
            0,
            focusPoint * (trackLength - container.clientWidth)
          );
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
    setShowRaceScreen(false);
    setCommentary("");
    setPositions([]);
    setRaceTime(0);
    setCurrentWeather(null);
    clearInterval(commentaryIntervalRef.current);
    cancelAnimationFrame(animationFrameIdRef.current);

    // 🔇 Stop cheer sound if playing
    if (cheerSoundRef.current) {
      cheerSoundRef.current.pause();
      cheerSoundRef.current.currentTime = 0;
    }

    // 🔇 Stop race sound too, just in case
    if (raceSoundRef.current) {
      raceSoundRef.current.pause();
      raceSoundRef.current.currentTime = 0;
    }
  };

  const backToSetup = () => {
    setShowRaceScreen(false);
    setWinner(null);
    setWinnerIndex(null);
    setIsRacing(false);
    setCommentary("");
    setPositions(Array(itemCount).fill(0));
    setRaceTime(0);
    setCountdown(null);
    setCurrentWeather(null);
    clearInterval(commentaryIntervalRef.current);
    cancelAnimationFrame(animationFrameIdRef.current);
    // 🔇 Stop cheer sound
    if (cheerSoundRef.current) {
      cheerSoundRef.current.pause();
      cheerSoundRef.current.currentTime = 0;
    }

    // 🔇 Stop race sound
    if (raceSoundRef.current) {
      raceSoundRef.current.pause();
      raceSoundRef.current.currentTime = 0;
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setFastestTime(null);
  };

  // Updated function to randomize horse names for selected theme
  const randomizeHorseNames = () => {
    const categoryList =
      horseNameCategories[nameCategory] || horseNameCategories["Default"];
    const shuffledNames = shuffleArray(categoryList);
    setShuffledHorseNames((prev) => ({
      ...prev,
      [nameCategory]: shuffledNames,
    }));

    // Update items with new randomized names (only for empty items)
    const newItems = items.map(
      (item, index) => (item.trim() === "" ? "" : item) // Keep existing custom names
    );
    setItems(newItems);
  };

  const toggleMute = () => setMuted(!muted);

  const isStartDisabled = itemCount === 0;

  const getRaceDistanceInfo = (distance) => {
    const info = {
      short: { emoji: "⚡", name: "Sprint", description: "Quick & intense" },
      medium: {
        emoji: "🏃",
        name: "Classic",
        description: "Epic distance race",
      }, // Updated description
      long: {
        emoji: "🏔️",
        name: "Marathon",
        description: "Ultimate endurance test",
      }, // Updated description
    };
    return info[distance];
  };

  // Weather Particles Component
  const WeatherParticles = () => {
    if (!currentWeather) return null;

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: currentWeather.particleCount }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-70"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50,
            }}
            animate={{
              y: window.innerHeight + 50,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear",
            }}
          >
            {currentWeather.particles}
          </motion.div>
        ))}
      </div>
    );
  };

  // TITLE SCREEN
  if (showTitle) {
    return (
      <div className="h-screen w-full flex flex-col justify-between bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20"
            animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-32 right-16 w-24 h-24 bg-pink-400 rounded-full opacity-20"
            animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 0.8, 1] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="absolute inset-0 bg-black opacity-30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-4"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-4"
          >
            🏇
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
            Horse Race Picker
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg sm:text-xl text-yellow-200 mb-8 max-w-md"
          >
            The ultimate way to make decisions! Add your options and watch them
            race to victory!
          </motion.p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTitle(false)}
          className="relative z-10 self-center mb-8 mx-4 px-8 py-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white rounded-2xl font-bold shadow-2xl text-lg"
        >
          🚀 Start Racing!
        </motion.button>
      </div>
    );
  }

  // RACE SCREEN
  if (showRaceScreen) {
    const distanceInfo = getRaceDistanceInfo(raceDistance);

    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${
          currentWeather
            ? currentWeather.background
            : "from-green-100 via-blue-100 to-purple-100"
        } w-full overflow-hidden flex flex-col relative`}
      >
        {/* Weather Particles */}
        <WeatherParticles />
        {/* Race Header */}
        <div className="bg-white bg-opacity-90 backdrop-blur-md shadow-lg p-3 sm:p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏇
              </motion.span>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {distanceInfo.emoji} {distanceInfo.name} Race
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{distanceInfo.description}</span>
                  {currentWeather && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span>{currentWeather.emoji}</span>
                        <span>{currentWeather.name}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {fastestTime && (
                <div className="text-xs bg-yellow-200 px-2 py-1 rounded-full">
                  🏆 {fastestTime}s
                </div>
              )}
              {isRacing && (
                <div className="text-sm font-bold text-blue-600">
                  {raceTime.toFixed(1)}s
                </div>
              )}
              <button
                onClick={backToSetup}
                className="text-sm px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={isRacing}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Pre-Race or Countdown */}
        {!isRacing && !winner && (
          <div className="flex-1 flex flex-col justify-center items-center p-4">
            {countdown ? (
              <motion.div
                className="text-center"
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <motion.div
                  className="text-8xl sm:text-9xl font-bold text-red-500 mb-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {countdown}
                </motion.div>
                <p className="text-2xl font-bold text-gray-700">Get Ready!</p>
                {currentWeather && (
                  <p className="text-lg text-gray-600 mt-2">
                    {currentWeather.emoji} {currentWeather.description}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                className="text-center w-full max-w-2xl"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
                  🏁 {distanceInfo.name} Race Ready!
                </h2>
                {currentWeather && (
                  <div className="mb-4 p-3 bg-white bg-opacity-80 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                      <span className="text-2xl">{currentWeather.emoji}</span>
                      <span>Weather: {currentWeather.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentWeather.description}
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-8">
                  {items.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between bg-white bg-opacity-80 p-4 rounded-xl shadow-md"
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={horseAvatars[index % horseAvatars.length]}
                          alt="Horse avatar"
                          className="w-16 h-16 object-contain"
                        />
                        <div>
                          <div className="font-bold text-gray-800">
                            {getHorseName(item, index)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Lane #{index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl">🏃‍♂️</div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startCountdown}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg"
                >
                  🚀 Start {distanceInfo.name} Race!
                </motion.button>
              </motion.div>
            )}
          </div>
        )}

        {/* Race Track */}
        {(isRacing || winner) && (
          <div className="flex-1 p-3 sm:p-4 relative">
            {/* Commentary Box - Moved to center top */}
            {(isRacing || countdown) && (
              <motion.div
                className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white rounded-2xl backdrop-blur-sm shadow-2xl border-2 border-white/20 max-w-md mx-4"
                animate={{
                  scale: [1, 1.02, 1],
                  boxShadow: [
                    "0 10px 25px rgba(0,0,0,0.3)",
                    "0 15px 35px rgba(0,0,0,0.4)",
                    "0 10px 25px rgba(0,0,0,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                initial={{ y: -50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center gap-3">
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

            <div className="overflow-x-auto h-full" ref={trackContainerRef}>
              <div
                className={`p-3 rounded-2xl shadow-inner bg-gradient-to-r ${
                  currentWeather
                    ? currentWeather.trackColor
                    : "from-green-400 to-green-600"
                } relative h-full min-h-96`}
                style={{ width: `${trackLength}px`, backgroundSize: "cover" }}
              >
                <div className="space-y-2 relative z-10 py-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="relative w-full h-16 bg-green-100 bg-opacity-60 border-2 border-green-700 rounded-xl overflow-hidden shadow-md"
                    >
                      <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-green-800 opacity-20" />

                      {/* Hurdles */}
                      {getRaceSettings(raceDistance).hurdles.map(
                        (hurdlePos, hIdx) => (
                          <div
                            key={hIdx}
                            className="absolute top-2 bottom-2 w-2 bg-gradient-to-b from-amber-600 to-amber-800 opacity-80 rounded-sm shadow-md z-10"
                            style={{
                              left: `${hurdlePos * (trackLength - 80)}px`,
                            }}
                            title="Hurdle"
                          >
                            <div className="absolute -top-1 -left-1 w-4 h-4 text-xs flex items-center justify-center">
                              🚧
                            </div>
                          </div>
                        )
                      )}

                      {/* Finish line */}
                      <div className="absolute right-1 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-yellow-500 opacity-80"></div>

                      {/* Horse Emoji with Name Following */}
                      <motion.div
                        className="absolute top-0 h-full flex items-center z-30"
                        animate={{
                          x: positions[index]
                            ? `${Math.min(
                                positions[index] * (trackLength - 80),
                                trackLength - 80
                              )}px`
                            : "0px",
                        }}
                        transition={{ duration: 0.1 }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.img
                            src={horseAvatars[index % horseAvatars.length]}
                            alt="Horse avatar"
                            animate={
                              isRacing
                                ? {
                                    rotateZ: [0, -5, 5, -5, 5, 0],
                                    y: [0, -4, 4, -3, 3, 0],
                                    scale: [1, 1.1, 0.9, 1.1, 0.9, 1],
                                  }
                                : { rotateZ: 0, y: 0, scale: 1 }
                            }
                            transition={{
                              duration: 0.3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="w-12 h-12 sm:w-16 sm:h-16"
                            style={{
                              filter:
                                winnerIndex === index
                                  ? "drop-shadow(0 0 8px gold)"
                                  : "none",
                            }}
                          />
                          {/* Horse name following behind */}
                          <div className="bg-white bg-opacity-90 px-2 py-1 rounded-md shadow-sm border border-gray-200">
                            <span className="text-xs font-bold text-gray-800 whitespace-nowrap">
                              {getHorseName(item, index)}
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Name Trail */}
                      <motion.div
                        className={`absolute left-0 top-0 h-full flex items-center px-3 text-sm font-semibold z-20 rounded-xl shadow-md ${
                          winnerIndex === index
                            ? "bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 shadow-lg border-2 border-yellow-500"
                            : "bg-white bg-opacity-95 border border-gray-200"
                        }`}
                        animate={{
                          width: positions[index]
                            ? `${Math.max(
                                Math.min(
                                  positions[index] * (trackLength - 80),
                                  trackLength - 80
                                ),
                                120
                              )}px`
                            : "120px",
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <img
                            src={horseAvatars[index % horseAvatars.length]}
                            alt="Horse avatar"
                            className="w-12 h-12 sm:w-16 sm:h-16 opacity-0 flex-shrink-0"
                          />
                          <span className="text-xs sm:text-sm font-bold truncate flex-1">
                            {getHorseName(item, index)}
                          </span>
                          {winnerIndex === index && (
                            <motion.span
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="text-yellow-600 ml-1"
                            >
                              👑
                            </motion.span>
                          )}
                        </div>
                      </motion.div>

                      <div className="absolute right-4 top-0.5 text-xs font-bold text-gray-500">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Winner Display - Centered */}
                {winner && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                      className="text-center p-6 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 rounded-2xl shadow-2xl max-w-sm w-full mx-auto"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-4xl mb-2">🏆</div>
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
                          onClick={() => {
                            setWinner(null);
                            setWinnerIndex(null);
                            setPositions(Array(itemCount).fill(0));
                            setRaceTime(0);
                            setCommentary("");
                            racePhaseRef.current = 0;
                            lastLeaderRef.current = -1;
                            dramaMomentRef.current = 0;
                            usedCommentaryRef.current.clear();
                            lastCommentaryRef.current = "";
                            generateRandomWeather();
                            setTimeout(startCountdown, 500);
                          }}
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
                              // Create a temporary element for the winner result
                              const winnerElement =
                                document.createElement("div");
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
                                  <div style="font-size: 12px; color: #9ca3af; margin-top: 16px; border-top: 1px solid #d1d5db; padding-top: 16px;">
                                    Horse Race Picker
                                  </div>
                                </div>
                              `;

                              document.body.appendChild(winnerElement);

                              // Use html2canvas to create an image
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
                                    const file = new File(
                                      [blob],
                                      "race-result.png",
                                      {
                                        type: "image/png",
                                      }
                                    );
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
                                alert(
                                  "Unable to share result. Please try again."
                                );
                              }
                            } catch (error) {
                              console.error("Error sharing result:", error);
                              alert(
                                "Unable to share result. Please try again."
                              );
                              document.body.removeChild(winnerElement);
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold shadow-lg text-sm"
                        >
                          📤 Share Result
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SETUP SCREEN
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 w-full overflow-x-hidden">
      <div className="w-full max-w-none bg-white bg-opacity-95 backdrop-blur-md shadow-2xl min-h-screen">
        <div className="p-3 sm:p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.span
                className="text-2xl sm:text-3xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏇
              </motion.span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Horse Race Picker
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {fastestTime && (
                <div className="text-xs sm:text-sm bg-gradient-to-r from-yellow-200 to-yellow-300 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap shadow-md">
                  🏆 Record: {fastestTime}s
                </div>
              )}
              <button
                onClick={toggleMute}
                className="text-lg sm:text-xl hover:scale-110 transition-transform p-2 rounded-full hover:bg-gray-100"
              >
                {muted ? "🔇" : "🔊"}
              </button>
            </div>
          </div>

          {/* Number Input */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Number of Contestants (1-{maxItems})
            </label>
            <input
              type="number"
              min="1"
              max={maxItems}
              className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-all focus:shadow-lg"
              onChange={handleCountChange}
              value={itemCount || ""}
              placeholder="Enter number..."
            />
          </div>

          {/* Theme Selection and Randomize Button */}
          {items.length > 0 && (
            <div className="mb-4">
              <label className="block font-semibold text-gray-700 text-sm mb-2">
                Theme
              </label>
              <div className="flex gap-2">
                <select
                  value={nameCategory}
                  onChange={(e) => setNameCategory(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-sm bg-white shadow-md"
                >
                  {Object.keys(horseNameCategories).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={randomizeHorseNames}
                  className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all text-lg shadow-lg"
                  title="Randomize horse names for selected theme"
                >
                  🎲
                </motion.button>
              </div>
            </div>
          )}

          {/* Race Length Selector */}
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 text-sm mb-2">
              Race Length
            </label>
            <div className="flex gap-2">
              {["short", "medium", "long"].map((dist) => {
                const info = getRaceDistanceInfo(dist);
                const isSelected = raceDistance === dist;
                return (
                  <button
                    key={dist}
                    onClick={() => setRaceDistance(dist)}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold shadow-md transition-all border-2 ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{info.emoji}</span>
                      <span>{info.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {info.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contestant Inputs */}
          {items.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                Contestants:
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <input
                      type="text"
                      placeholder={`Or use: ${
                        shuffledHorseNames[nameCategory][
                          index % shuffledHorseNames[nameCategory].length
                        ]
                      }`}
                      value={item}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-all pl-16 pr-12 focus:shadow-lg"
                    />
                    <img
                      src={horseAvatars[index % horseAvatars.length]}
                      alt="Horse avatar"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-12 h-12"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-400">
                      #{index + 1}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: isStartDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isStartDisabled ? 1 : 0.98 }}
                onClick={goToRaceScreen}
                className={`w-full sm:w-auto text-white p-4 rounded-xl font-semibold transition-all transform text-sm ${
                  isStartDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                }`}
                disabled={isStartDisabled}
              >
                🚀 Start Race!
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetRace}
                className="w-full sm:w-auto px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg font-semibold py-4 text-sm"
              >
                🔄 Reset
              </motion.button>
            </div>
          )}

          {/* Race History */}
          {history.length > 0 && (
            <motion.div
              className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  🏁 Race History
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearHistory}
                  className="text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-all shadow-sm"
                >
                  Clear History
                </motion.button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.map((race, idx) => (
                  <motion.div
                    key={idx}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs bg-white p-3 rounded-lg gap-1 sm:gap-0 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">🏆</span>
                      <span className="font-semibold truncate max-w-full sm:max-w-48">
                        {race.winner}
                      </span>
                    </div>
                    <div className="text-gray-600 flex gap-3 text-xs">
                      <span className="font-mono bg-blue-50 px-2 py-1 rounded">
                        {race.time}
                      </span>
                      <span className="text-gray-500">{race.timestamp}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
