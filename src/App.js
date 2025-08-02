import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import FadeInImage from "./components1/FadeInImage";
import HorseStable from "./components1/HorseStable";
import RaceTrack from "./components1/RaceTrack";
import BattleshipGame from "./components1/BattleshipGame";
import LockedHorses from "./components1/LockedHorses";
import HorseMazeGame from "./components1/labyrinth";
import { createSeededRng } from "./utils/prng";

const MotionFadeInImage = motion(FadeInImage);

export default function RandomPicker() {
  const [showTitle, setShowTitle] = useState(true);
  const [showRaceScreen, setShowRaceScreen] = useState(false);
  const [showStable, setShowStable] = useState(false);
  const [showBattleship, setShowBattleship] = useState(false);
  const [showLabyrinth, setShowLabyrinth] = useState(false);
  const [showLockedHorses, setShowLockedHorses] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [items, setItems] = useState([]);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [commentary, setCommentary] = useState("");
  const [history, setHistory] = useState([]);
  const [positions, setPositionsState] = useState([]);
  const positionsRef = useRef(positions);
  const setPositions = (value) => {
    if (typeof value === "function") {
      setPositionsState((prev) => {
        const next = value(prev);
        positionsRef.current = next;
        return next;
      });
    } else {
      positionsRef.current = value;
      setPositionsState(value);
    }
  };
  const [muted, setMuted] = useState(false);
  const raceSoundRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [raceTime, setRaceTime] = useState(0);
  const [fastestTime, setFastestTime] = useState(null);
  const [nameCategory, setNameCategory] = useState("Default");
  const [raceDistance, setRaceDistance] = useState("medium");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [raceSeed, setRaceSeed] = useState(null);
  const rngRef = useRef(Math.random);
  const [surgingHorses, setSurgingHorses] = useState([]);

  // Currency and betting state
  const [coins, setCoins] = useState(100);
  const [betAmount, setBetAmount] = useState(0);
  const [betHorse, setBetHorse] = useState(null);
  const [betEnabled, setBetEnabled] = useState(false);

  // Horse avatars can now be custom images located in the `public` folder.
  const horseAvatars = [
    "/horses/horse1.png",
    "/horses/horse2.png",
    "/horses/robohorse.png",
    "/horses/horse4.png",
    "/horses/horse5.png",
    "/horses/luffyhorse.png",
    "/horses/humpyhorse.png",
    "/horses/narutohorse.png",
    "/horses/unicorn.png",
    "/horses/xenohorse.png",
    "/horses/2horse.png",
    "/horses/trojanhorse.png",
    "/horses/tallhorse.png",
    "/horses/motohorse.png",
    "/horses/ghosthorse.png",
    "/horses/centaurhorse.png",
    "/horses/burgerhorse.png",
    "/horses/businesshorse.png",
    "/horses/biblicallyaccuratehorse.png",
    "/horses/horsecar.png",
    "/horses/Picassohorse.png",
    "/horses/pinatahorse.png",
  ];

const horseNames = [
    "Shadowfax",
    "Seabiscuit",
    "Silver Blaze",
    "Comet",
    "Blaze",
    "Spirit",
    "Eclipse",
    "Whisper",
    "Storm",
    "Phantom",
    "Flash",
    "Bolt",
    "Majesty",
    "Thunder",
    "Lightning",
    "Mystic",
    "Blizzard",
    "Tornado",
    "Hurricane",
    "Inferno",
    "Mirage",
    "Nebula",
];

const horsePersonalities = [
  "Wise mentor of the herd.",
  "Underdog with a big heart.",
  "Mystery-loving sleuth.",
  "Fast and curious traveler.",
  "Fiery spirit with boundless energy.",
  "Free soul who roams the plains.",
  "Quiet but always observant.",
  "Shy friend who trusts few.",
  "Thrives in wild weather.",
  "Appears and vanishes without a sound.",
  "Always first out of the gate.",
  "Quick thinker and quicker runner.",
  "Regal and dignified presence.",
  "Loud, powerful, and brave.",
  "Strikes with sudden bursts.",
  "Seeker of hidden paths.",
  "Cool-headed in any race.",
  "Whirlwind of excitement.",
  "Relentless force on the track.",
  "Burns with competitive drive.",
  "Hard to catch and harder to predict.",
  "Dreamy star-gazer.",
];

  const [unlockedHorses, setUnlockedHorses] = useState(
    horseAvatars.map((_, index) => index < 5)
  );
  const [shuffledAvatars, setShuffledAvatars] = useState(() =>
    horseAvatars.filter((_, index) => index < 5)
  );

  const handleUnlockHorse = (index, cost) => {
    if (unlockedHorses[index] || coins < cost) return;
    setCoins((prev) => prev - cost);
    setUnlockedHorses((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  useEffect(() => {
    const available = horseAvatars.filter((_, index) => unlockedHorses[index]);
    setShuffledAvatars(available);
  }, [unlockedHorses]);

  // Enhanced preloading with loading state
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = horseAvatars.length;

    const preloadPromises = horseAvatars.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          resolve(src);
        };
        img.onerror = () => {
          loadedCount++;
          resolve(src); // Still resolve to not block loading
        };
        img.src = src;
      });
    });

    Promise.all(preloadPromises).then(() => {
      setImagesLoaded(true);
    });

    // Also add preload links for browser optimization
    const preloadLinks = [];
    horseAvatars.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      link.dataset.horse = "true";
      document.head.appendChild(link);
      preloadLinks.push(link);
    });

    return () => {
      preloadLinks.forEach((link) => link.remove());
    };
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
  const racePhaseRef = useRef(0);
  const lastLeaderRef = useRef(-1);
  const dramaMomentRef = useRef(0);
  const bellSoundRef = useRef(null);
  const cheerSoundRef = useRef(null);
  const usedCommentaryRef = useRef(new Set());
  const lastCommentaryRef = useRef("");

  const [trackLength, setTrackLength] = useState(window.innerWidth * 2);

  useEffect(() => {
    const updateTrackLength = () => {
      const baseLength =
        raceDistance === "short" ? 1.8 : raceDistance === "long" ? 9 : 4.5;
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

  const generateRandomWeather = () => {
    const weatherTypes = Object.keys(weatherEffects);
    const randomWeather =
    weatherTypes[Math.floor(rngRef.current() * weatherTypes.length)];
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
    setBetHorse(null);
    setBetAmount(0);
    setBetEnabled(false);
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
    usedCommentaryRef.current.clear();
    lastCommentaryRef.current = "";
  };

   const startCountdown = (seed = Date.now()) => {
    let count = 3;
    setCountdown(count);
    const countdownInterval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        startRace(seed);
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
        speedVariation: 0.001, // Reduced from 0.003 for closer racing
        surgeIntensity: 0.005,
        surgeFrequency: 0.45, // Increased from 0.35 for more action
        comebackChance: 0.35, // Increased from 0.15 for more lead changes
        dramaMoments: 2,
        hurdles: [],
        staminaFactor: 0.1,
        packTightness: 0.95,
      },
      medium: {
        baseSpeed: 0.002,
        speedVariation: 0.0008, // Reduced from 0.002 for closer racing
        surgeIntensity: 0.003,
        surgeFrequency: 0.38, // Increased from 0.28 for more action
        comebackChance: 0.4, // Increased from 0.25 for more lead changes
        dramaMoments: 3,
        hurdles: [0.3, 0.65],
        staminaFactor: 0.2,
        packTightness: 0.97,
      },
      long: {
        baseSpeed: 0.0008,
        speedVariation: 0.0006, // Reduced from 0.0015 for closer racing
        surgeIntensity: 0.004, // Doubled from 0.002 for bigger surges
        surgeFrequency: 0.55, // Increased from 0.32 for constant action
        comebackChance: 0.7, // Increased from 0.5 for frequent lead changes
        dramaMoments: 8, // Increased from 5 for more excitement
        hurdles: [0.15, 0.35, 0.55, 0.75, 0.9],
        staminaFactor: 0.25, // Reduced from 0.35 to reduce fatigue effects
        packTightness: 0.98,
      },
    };
    if (currentWeather) {
      const weatherSettings = { ...settings[distance] };
      weatherSettings.baseSpeed *= currentWeather.speedMultiplier;
      return weatherSettings;
    }
    return settings[distance];
  };

  const getCommentaryForPhase = (phase) => {
    let phrases = commentaryPhrases[phase] || commentaryPhrases.middle;

    // Add weather-specific commentary if applicable
    if (
      currentWeather &&
      commentaryPhrases.weather[currentWeather.name.toLowerCase()]
    ) {
       if (rngRef.current() < 0.3) {
        phrases = [
          ...phrases,
          ...commentaryPhrases.weather[currentWeather.name.toLowerCase()],
        ];
      }
    }
    
    // Filter out already used phrases - never repeat during same race
    const availablePhrases = phrases.filter(
      (phrase) =>
        !usedCommentaryRef.current.has(phrase) &&
        phrase !== lastCommentaryRef.current
    );

    // If we've exhausted all phrases in this category, try other categories
    if (availablePhrases.length === 0) {
      // Get phrases from all other categories that haven't been used
      const allCategories = ['early', 'middle', 'dramatic', 'final'];
      const alternativePhases = allCategories
        .filter(cat => cat !== phase)
        .flatMap(cat => commentaryPhrases[cat] || [])
        .filter(phrase => !usedCommentaryRef.current.has(phrase) && phrase !== lastCommentaryRef.current);
      
      if (alternativePhases.length > 0) {
        const selectedPhrase = alternativePhases[Math.floor(rngRef.current() * alternativePhases.length)];
        usedCommentaryRef.current.add(selectedPhrase);
        lastCommentaryRef.current = selectedPhrase;
        return selectedPhrase;
      }
      
      // If absolutely no phrases left, create a dynamic one
      const dynamicPhrases = [
        "What an incredible race!",
        "The excitement continues!",
        "This is pure racing magic!",
        "Unbelievable action on the track!",
        "The competition is fierce out there!"
      ];
      const unusedDynamic = dynamicPhrases.filter(phrase => 
        !usedCommentaryRef.current.has(phrase) && phrase !== lastCommentaryRef.current
      );
      if (unusedDynamic.length > 0) {
        const selectedPhrase = unusedDynamic[Math.floor(rngRef.current() * unusedDynamic.length)];
        usedCommentaryRef.current.add(selectedPhrase);
        lastCommentaryRef.current = selectedPhrase;
        return selectedPhrase;
      }
      
      // Absolute fallback - should rarely happen
      return "Racing continues...";
    }

    const selectedPhrase =
      availablePhrases[Math.floor(rngRef.current() * availablePhrases.length)];
    usedCommentaryRef.current.add(selectedPhrase);
    lastCommentaryRef.current = selectedPhrase;

    return selectedPhrase;
  };

  const startRace = (seed) => {
    rngRef.current = createSeededRng(seed);
    setIsRacing(true);
    if (raceSoundRef.current) {
      raceSoundRef.current.currentTime = 0;
      raceSoundRef.current
        .play()
        .catch((e) => console.warn("Race sound playback failed:", e));
    }
    setWinner(null);
    setWinnerIndex(null);

    const startPhrases = commentaryPhrases.start;
    setCommentary(
      startPhrases[Math.floor(rngRef.current() * startPhrases.length)]
    );

    setPositions(Array(itemCount).fill(0));
    setRaceTime(0);
    raceStartTime.current = Date.now();
    racePhaseRef.current = 0;
    lastLeaderRef.current = -1;
    dramaMomentRef.current = 0;
    usedCommentaryRef.current.clear();

    const settings = getRaceSettings(raceDistance);

    const timerInterval = setInterval(() => {
      if (raceStartTime.current) {
        setRaceTime((Date.now() - raceStartTime.current) / 1000);
      }
    }, 100);

    let commentaryCounter = 0;
    commentaryIntervalRef.current = setInterval(() => {
      const progress = Math.max(...positionsRef.current);
      let phase = "middle";
      commentaryCounter++;

      if (progress < 0.15) phase = "early";
      else if (progress > 0.85) phase = "final";
      else if (dramaMomentRef.current > 0) {
        phase = "dramatic";
        dramaMomentRef.current--;
      }

      if (commentaryCounter % 3 === 0 && phase !== "dramatic") {
        phase = "middle";
      }

      const next = getCommentaryForPhase(phase);
      setCommentary(next);
    }, 1800);

    let winnerDeclared = false;
    let finished = false;

    if (trackContainerRef.current) {
      trackContainerRef.current.scrollLeft = 0;
    }

    const horseProfiles = Array(itemCount)
      .fill(0)
      .map(() => ({
        baseSpeed:
          settings.baseSpeed + (rngRef.current() - 0.5) * settings.speedVariation,
        stamina: 0.6 + rngRef.current() * 0.7,
        comebackPotential: rngRef.current(),
        hurdleSkill: 0.3 + rngRef.current() * 0.7,
        surgeCount: 0,
        lastSurge: 0,
        isComingBack: false,
        hurdlesCrossed: [],
        isStunned: false,
        stunnedUntil: 0,
        isSurging: false,
        surgeEndTime: 0,
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

        if (currentLeader !== lastLeaderRef.current && currentProgress > 0.1) {
          lastLeaderRef.current = currentLeader;
          dramaMomentRef.current = 2;
        }

        updatedPositions = prevPositions.map((pos, idx) => {
          const profile = horseProfiles[idx];
          let speed = profile.baseSpeed;

          const currentTime = Date.now();
          if (profile.isStunned && currentTime < profile.stunnedUntil) {
            return pos;
          } else if (profile.isStunned) {
            profile.isStunned = false;
          }

          const fatigueEffect =
            1 - pos * (1 - profile.stamina) * settings.staminaFactor;
          speed *= Math.max(fatigueEffect, 0.3);

          const averageProgress =
            prevPositions.reduce((a, b) => a + b, 0) / prevPositions.length;
          const deviation = pos - averageProgress;
          const packEffect =
            1 - Math.abs(deviation) * (1 - settings.packTightness);
          speed *= Math.max(packEffect, 0.8);
          
          // Aggressive rubber band effect for competitive racing
          const progressDiff = pos - averageProgress;
          
          // Marathon gets extra swing effects for maximum drama
          const isMarathon = raceDistance === "long";
          const marathonMultiplier = isMarathon ? 1.3 : 1.0;
          
          // Strong boost for horses behind
          if (progressDiff < -0.05) {
            speed *= (1.2 * marathonMultiplier); // Extra strong boost in marathons
          } else if (progressDiff < -0.02) {
            speed *= (1.1 * marathonMultiplier); // Enhanced boost for marathons
          }
          
          // Strong slowdown for early leaders
          if (progressDiff > 0.05) {
            speed *= (0.85 / marathonMultiplier); // Extra penalty for marathon leaders
          } else if (progressDiff > 0.02) {
            speed *= (0.92 / marathonMultiplier); // Enhanced penalty for marathon leaders
          }

          for (const hurdlePos of settings.hurdles) {
            // Convert to pixel positions to match visual rendering
            const horsePixelPos = pos * (trackLength - 225);
            const hurdlePixelPos = hurdlePos * (trackLength - 225);
            const horseImageWidth = 64; // Horse image is w-16 h-16 (64px)
            const hurdleWidth = 10; // Hurdle width in pixels
            
            // Trigger collision when horse approaches hurdle (before visual contact)
            const approachDistance = 80; // Trigger much earlier before visual contact
            const horseFrontPixel = horsePixelPos + horseImageWidth;
            const hurdleStartPixel = hurdlePixelPos - approachDistance;
            const hurdleEndPixel = hurdlePixelPos + hurdleWidth;
            
            if (
              horseFrontPixel >= hurdleStartPixel &&
              horsePixelPos <= hurdleEndPixel &&
              !profile.hurdlesCrossed.some(
                (stored) => Math.abs(stored - hurdlePos) < 1e-4
              )
            ) {
              profile.hurdlesCrossed.push(hurdlePos);

               const jumpSuccess = rngRef.current() < profile.hurdleSkill;

              if (jumpSuccess) {
                speed += settings.surgeIntensity * 0.4;
                dramaMomentRef.current = Math.max(dramaMomentRef.current, 1);
              } else {
                const stunDuration = 400 + rngRef.current() * 600;
                profile.isStunned = true;
                profile.stunnedUntil = currentTime + stunDuration;
                speed = 0;
                dramaMomentRef.current = 3;
              }
            }
          }

          const shouldSurge =
            rngRef.current() < settings.surgeFrequency &&
            pos - profile.lastSurge > 0.12 &&
            !profile.isStunned;
          if (shouldSurge) {
            const surgeStrength = 0.6 + rngRef.current() * 1.2;
            speed += settings.surgeIntensity * surgeStrength;
            profile.surgeCount++;
            profile.lastSurge = pos;
            profile.isSurging = true;
            profile.surgeEndTime = Date.now() + 1500; // Surge effect lasts 1.5 seconds
          }
          
          // Clear surge state if time has passed
          if (profile.isSurging && Date.now() > profile.surgeEndTime) {
            profile.isSurging = false;
          }

          const isLagging = pos < averageProgress - 0.05;
          const shouldComeback =
            isLagging &&
           rngRef.current() <
              settings.comebackChance * profile.comebackPotential &&
            !profile.isStunned;

          if (shouldComeback && !profile.isComingBack) {
            profile.isComingBack = true;
            speed += settings.surgeIntensity * 1.2;
            dramaMomentRef.current = 4;
          }

          if (profile.isComingBack) {
            const comebackBoost = raceDistance === "long" ? 0.6 : 0.2; // Double marathon comeback boost
            speed += settings.surgeIntensity * comebackBoost;
            if (pos > averageProgress + 0.02) { // End comeback sooner for more frequent lead changes
              profile.isComingBack = false;
            }
          }

          const randomFactor = 1 + (rngRef.current() - 0.5) * 0.08;
          speed *= randomFactor;

          let nextPos = Math.max(0, pos + speed);
          if (nextPos > 1) nextPos = 1;
          return nextPos;
        });

        // Limit how far the leader can get ahead to keep the pack tighter
        const sortedPositions = [...updatedPositions].sort((a, b) => b - a);
        const leader = sortedPositions[0];
        const second = sortedPositions[1] ?? sortedPositions[0];
        const maxLead = 0.05; // 5% of track length for ultra-tight racing
        if (leader - second > maxLead) {
          const leaderIndex = updatedPositions.indexOf(leader);
          updatedPositions[leaderIndex] = second + maxLead;
        }

        const winnerIdx = updatedPositions.findIndex((p) => p >= 1);
        if (winnerIdx !== -1 && !winnerDeclared) {
          winnerDeclared = true;
          clearInterval(timerInterval);
          const finalTime = parseFloat(
            ((Date.now() - raceStartTime.current) / 1000).toFixed(1)
          );

          const winnerName = getHorseName(items[winnerIdx], winnerIdx);
          setWinner(winnerName);
          setWinnerIndex(winnerIdx);
          setCommentary(`🏆 ${winnerName} wins in a thrilling finish!`);
          setRaceTime(finalTime);

          if (cheerSoundRef.current) {
            cheerSoundRef.current.currentTime = 0;
            cheerSoundRef.current
              .play()
              .catch((e) => console.warn("Cheer sound failed:", e));
          }

          
          if (!fastestTime || finalTime < fastestTime) {
            setFastestTime(finalTime);
          }

          setHistory((prev) => [
            {
              winner: winnerName,
              time: `${finalTime}s`,
              distance: raceDistance,
              weather: currentWeather?.name || "Clear",
               seed,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev.slice(0, 9),
          ]);

          if (betHorse !== null && betAmount > 0) {
            if (winnerIdx === betHorse) {
              setCoins((c) => c + betAmount * itemCount);
            } else {
              setCoins((c) => Math.max(0, c - betAmount));
            }
          }

          clearInterval(commentaryIntervalRef.current);
          
          // Scroll to finish line to show winner at the end
          setTimeout(() => {
            if (trackContainerRef.current) {
              const container = trackContainerRef.current;
              const finishLinePosition = trackLength - container.clientWidth;
              container.scrollLeft = Math.max(0, finishLinePosition);
            }
          }, 500);
        }
 
        if (updatedPositions.every((p) => p >= 1)) {
          finished = true;
          setIsRacing(false);
          if (raceSoundRef.current) {
            raceSoundRef.current.pause();
          }
        }

        if (trackContainerRef.current) {
          const container = trackContainerRef.current;

          // Sort positions in descending order (lead is first)
          const sorted = [...updatedPositions].sort((a, b) => b - a);
          const lead = sorted[0];
          const second = sorted[1] ?? sorted[0]; // Fallback in case only one horse exists

          // Calculate dynamic focus based on race situation
          const gap = lead - second;
          const maxGap = trackLength * 0.1; // 10% of track length for reference

          // If horses are close, focus exactly between them
          // If gap is large, bias slightly toward the leader for better viewing
          const focusWeight = Math.min(gap / maxGap, 1);
          let focusPoint = second + (lead - second) * (0.5 + focusWeight * 0.2);

          // Convert focus point to pixel position
          let targetLeft = focusPoint * (trackLength - container.clientWidth);

          // Ensure leader always remains in view
          const leaderPixelPos = lead * trackLength;
          const viewportStart = targetLeft;
          const viewportEnd = targetLeft + container.clientWidth;

          // If leader is outside the right edge of viewport, adjust
          if (leaderPixelPos > viewportEnd) {
            targetLeft = leaderPixelPos - container.clientWidth;
          }
          // If leader is outside the left edge of viewport, adjust
          else if (leaderPixelPos < viewportStart) {
            targetLeft = leaderPixelPos;
          }

          // Apply final boundaries
          targetLeft = Math.max(
            0,
            Math.min(targetLeft, trackLength - container.clientWidth)
          );

          // Smooth camera movement with damping
          // Adjust smoothingFactor (0.05-0.2) for different camera responsiveness
          // Lower values = smoother but slower, Higher values = more responsive
          const smoothingFactor = 0.1;
          const currentLeft = container.scrollLeft;
          const newLeft =
            currentLeft + (targetLeft - currentLeft) * smoothingFactor;

          container.scrollLeft = newLeft;
        }

        // Update surging horses state for visual effects
        const currentlySurging = horseProfiles.map((profile, index) => profile.isSurging);
        setSurgingHorses(currentlySurging);

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
    setBetHorse(null);
    setBetAmount(0);
    setBetEnabled(false);
    clearInterval(commentaryIntervalRef.current);
    cancelAnimationFrame(animationFrameIdRef.current);

    if (cheerSoundRef.current) {
      cheerSoundRef.current.pause();
      cheerSoundRef.current.currentTime = 0;
    }

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
    setBetHorse(null);
    setBetAmount(0);
    setBetEnabled(false);
    clearInterval(commentaryIntervalRef.current);
    cancelAnimationFrame(animationFrameIdRef.current);
    if (cheerSoundRef.current) {
      cheerSoundRef.current.pause();
      cheerSoundRef.current.currentTime = 0;
    }

    if (raceSoundRef.current) {
      raceSoundRef.current.pause();
      raceSoundRef.current.currentTime = 0;
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setFastestTime(null);
  };

  const randomizeHorseNames = () => {
    const categoryList =
      horseNameCategories[nameCategory] || horseNameCategories["Default"];
    const shuffledNames = shuffleArray(categoryList);
    setShuffledHorseNames((prev) => ({
      ...prev,
      [nameCategory]: shuffledNames,
    }));

    const newItems = items.map((item, index) =>
      item.trim() === "" ? "" : item
    );
    setItems(newItems);
    setShuffledAvatars(shuffleArray(shuffledAvatars));
  };

  const handleRaceAgain = () => {
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
    setBetHorse(null);
    setBetAmount(0);
    setTimeout(() => startCountdown(), 500);
  };

  const toggleMute = () => setMuted(!muted);

  const isStartDisabled =
  itemCount === 0 ||
    (betEnabled && (!betAmount || betAmount > coins || betHorse === null));

  const getRaceDistanceInfo = (distance) => {
    const info = {
      short: {name: "Sprint", description: "Quick & intense" },
      medium: {
        name: "Classic",
        description: "Epic distance race",
      },
      long: {
        name: "Marathon",
        description: "Ultimate endurance test",
      },
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

  // Confetti animation for winner screen
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
          className="relative z-10 self-center mb-8 mx-4 px-8 py-4 btn-retro btn-retro-green font-bold text-lg"
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
              <div className="text-xs bg-yellow-100 px-2 py-1 rounded-full flex items-center gap-1">
                <span>💰</span>
                <span>{coins}</span>
              </div>
              {isRacing && (
                <div className="text-sm font-bold text-blue-600">
                  {raceTime.toFixed(1)}s
                </div>
              )}
              <button
                onClick={backToSetup}
                className="text-sm px-3 py-1 btn-retro btn-retro-gray"
                disabled={isRacing}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Loading Screen */}
        {!imagesLoaded && (
          <div className="flex-1 flex flex-col justify-center items-center p-4">
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🏇
              </motion.div>
              <p className="text-xl font-bold text-gray-700 mb-2">
                Loading horses...
              </p>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* Pre-Race or Countdown */}
        {imagesLoaded && !isRacing && !winner && (
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
                        <FadeInImage
                          src={shuffledAvatars[index % shuffledAvatars.length]}
                          alt="Horse avatar"
                          className="w-24 h-24 object-contain rounded-lg"
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
                  onClick={() => startCountdown()}
                  className="px-8 py-4 btn-retro btn-retro-green text-white font-bold text-lg"
                >
                  🚀 Start {distanceInfo.name} Race!
                </motion.button>
              </motion.div>
            )}
          </div>
        )}

        {/* Race Track */}
        {imagesLoaded && (isRacing || winner) && (
          <RaceTrack
            items={items}
            positions={positions}
            trackLength={trackLength}
            trackContainerRef={trackContainerRef}
            raceDistance={raceDistance}
            currentWeather={currentWeather}
            isRacing={isRacing}
            countdown={countdown}
            commentary={commentary}
            winner={winner}
            winnerIndex={winnerIndex}
            raceTime={raceTime}
            fastestTime={fastestTime}
            shuffledAvatars={shuffledAvatars}
            surgingHorses={surgingHorses}
            getHorseName={getHorseName}
            getRaceSettings={getRaceSettings}
            getRaceDistanceInfo={getRaceDistanceInfo}
            onRaceAgain={handleRaceAgain}
            backToSetup={backToSetup}
          />
        )}
      </div>
    );
  }

  if (showStable) {
    return (
      <HorseStable
        horseAvatars={horseAvatars}
        horseNames={horseNames}
        horsePersonalities={horsePersonalities}
        unlockedHorses={unlockedHorses}
        coins={coins} 
        onBack={() => setShowStable(false)}
        onPlayMinigame={() => {
          setShowStable(false);
          setShowBattleship(true);
        }}
        onShowLockedHorses={() => {
          setShowStable(false);
          setShowLockedHorses(true);
        }}
         onSendToLabyrinth={() => {
          setShowStable(false);
          setShowLabyrinth(true);
        }}
      />
    );
  }

  if (showLockedHorses) {
    return (
      <LockedHorses
        horseAvatars={horseAvatars}
        horseNames={horseNames}
        horsePersonalities={horsePersonalities}
        unlockedHorses={unlockedHorses}
        coins={coins}
        onUnlockHorse={handleUnlockHorse}
        onBack={() => {
          setShowLockedHorses(false);
          setShowStable(true);
        }}
      />
    );
  }

  if (showLabyrinth) {
    return (
      <HorseMazeGame
        onBack={() => {
          setShowLabyrinth(false);
          setShowStable(true);
        }}
      />
    );
  }


  if (showBattleship) {
    return <BattleshipGame onBack={() => setShowBattleship(false)} />;
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
              <div className="text-xs sm:text-sm bg-yellow-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap shadow-md flex items-center gap-1">
                <span>💰</span>
                <span>{coins}</span>
              </div>
              <button
                onClick={toggleMute}
                className="text-lg sm:text-xl hover:scale-110 transition-transform p-2 rounded-full hover:bg-gray-100"
              >
                {muted ? "🔇" : "🔊"}
              </button>
              <button
                onClick={() => setShowStable(true)}
                className="text-lg sm:text-sm px-3 py-2 btn-retro btn-retro-yellow text-white"
              >
                🏠 Stable
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
                  className="px-3 py-2 btn-retro btn-retro-purple text-white text-lg"
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
                    className={`flex-1 px-4 py-3 text-sm font-semibold ${
                      isSelected
                        ? "btn-retro btn-retro-blue text-white"
                        : "btn-retro bg-white text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{info.emoji}</span>
                      <span>{info.name}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
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
                      className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-all pl-16 pr-12 focus:shadow-lg contestant-input"
                    />
                    <FadeInImage
                      src={shuffledAvatars[index % shuffledAvatars.length]}
                      alt="Horse avatar"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 object-contain rounded-md"
                      style={{ width: "2.5rem", height: "2.5rem" }}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-400">
                      #{index + 1}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Betting Section */}
          {items.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-gray-700 text-sm">
                  Place Your Bet (Coins: {coins})
                </label>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={betEnabled}
                    onChange={() => {
                      const next = !betEnabled;
                      setBetEnabled(next);
                      if (!next) {
                        setBetAmount(0);
                        setBetHorse(null);
                      }
                    }}
                  />
                  Enable
                </label>
              </div>
               {betEnabled && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    min="1"
                    className="flex-1 p-3 border-2 border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none shadow-md"
                    value={betAmount || ""}
                    onChange={(e) =>
                      setBetAmount(parseInt(e.target.value, 10) || 0)
                    }
                    placeholder="Bet amount"
                  />
                  <select
                    value={betHorse !== null ? betHorse : ""}
                    onChange={(e) =>
                      setBetHorse(
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10)
                      )
                    }
                    className="flex-1 p-3 border-2 border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none shadow-md"
                  >
                    <option value="" disabled>
                      Select horse
                    </option>
                    {items.map((item, index) => (
                      <option key={index} value={index}>
                        {getHorseName(item, index)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: isStartDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isStartDisabled ? 1 : 0.98 }}
                onClick={goToRaceScreen}
                className={`w-full sm:w-auto text-white p-4 font-semibold text-sm ${
                  isStartDisabled
                    ? "btn-retro btn-retro-gray"
                    : "btn-retro btn-retro-green"
                }`}
                disabled={isStartDisabled}
              >
                🚀 Start Race!
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetRace}
                className="w-full sm:w-auto px-6 btn-retro btn-retro-red text-white font-semibold py-4 text-sm"
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
                  className="text-xs btn-retro btn-retro-red font-medium px-3 py-1"
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