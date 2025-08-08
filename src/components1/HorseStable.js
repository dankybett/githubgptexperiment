import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import FadeInImage from "./FadeInImage";
import HorseDetailsModal from "./HorseDetailsModal";

const HorseStable = ({
  horseAvatars,
  horseNames,
  horsePersonalities,
  unlockedHorses,
  coins,
  horseInventories,
  horseSkills,
  horseSkillPoints,
  customHorseNames,
  horseCareStats,
  onUpdateHorseCareStats,
  onBack,
  onShowLockedHorses,
  onSendToLabyrinth,
  onUpdateCoins,
  onHorseRename,
  dayCount,
  onUpdateDayCount,
  stableGameTime,
  onUpdateStableGameTime,
}) => {
  const [stableHorses, setStableHorses] = useState([]);
  const [stableLoaded, setStableLoaded] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [availableHorses, setAvailableHorses] = useState([]);
  const [selectedHorseIds, setSelectedHorseIds] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [showNameTags, setShowNameTags] = useState(false);
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  
  // Pan/drag state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [potentialDrag, setPotentialDrag] = useState(false);
  
  // Stable care resources state
  const [stableResources, setStableResources] = useState({
    feed: 85,
    water: 92,
    pasture: 88,
    cleanliness: 78
  });
  const [lastCareTime, setLastCareTime] = useState(Date.now());
  const [careActionFeedback, setCareActionFeedback] = useState(null);

  // Day/Night cycle state - initialize with persistent time
  const [gameTime, setGameTime] = useState(stableGameTime || 0); // 0-24 hours
  const [lastDailyIncome, setLastDailyIncome] = useState(0);
  const [newDayNotification, setNewDayNotification] = useState(null);

  // Care action costs
  const careCosts = {
    feed: 10,
    water: 8,
    pasture: 15,
    cleanliness: 12
  };

  // Individual horse care action costs
  const individualCareCosts = {
    groom: 5,
    apple: 3,
    carrot: 2,
    heal: 15 // Medical care for injured horses
  };

  // Get resource status color based on level
  const getResourceColor = (level) => {
    if (level >= 70) return '#22c55e'; // Green
    if (level >= 40) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  // Get resource status text
  const getResourceStatus = (level) => {
    if (level >= 70) return 'GOOD';
    if (level >= 40) return 'NEEDS ATTENTION';
    return 'URGENT';
  };

  // Get horse mood indicator based on care stats
  const getHorseMoodIndicator = (horse) => {
    const avgCare = (horse.happiness + horse.health + horse.cleanliness + horse.energy) / 4;
    if (avgCare >= 80) return '😊'; // Happy
    if (avgCare >= 60) return '😐'; // Neutral
    if (avgCare >= 40) return '😟'; // Concerned
    return '😢'; // Sad
  };

  // Get horse health visual effects
  const getHorseHealthEffects = (horse) => {
    const effects = {
      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
      opacity: 1
    };
    
    // Injured horses have special visual effects
    if (horse.isInjured) {
      effects.opacity = 0.6; // Injured horses look very faded
      effects.filter += " sepia(0.5) saturate(0.7)"; // More sepia and desaturated
    }
    // Health affects overall appearance
    else if (horse.health < 30) {
      effects.opacity = 0.7; // Sick horses look faded
      effects.filter += " sepia(0.3)"; // Slight sepia for sickness
    }
    
    // Cleanliness affects visual state
    if (horse.cleanliness < 40) {
      effects.filter += " brightness(0.8) contrast(0.9)"; // Dirty/muddy look
    }
    
    // Energy affects posture (handled in animation)
    return effects;
  };

  // Get horse status indicators (for floating icons)
  const getHorseStatusIndicators = (horse) => {
    const indicators = [];
    
    if (horse.isInjured) indicators.push('🏥'); // Injured (highest priority)
    if (horse.health < 40) indicators.push('🤒'); // Sick
    if (horse.cleanliness < 30) indicators.push('💩'); // Dirty
    if (horse.energy < 25) indicators.push('💤'); // Tired
    if (horse.happiness < 30) indicators.push('💔'); // Unhappy
    
    return indicators;
  };

  // Remove all the complex logic for now

  // Handle care actions
  const handleCareAction = (resourceType) => {
    const cost = careCosts[resourceType];
    if (coins < cost) {
      // Show insufficient funds feedback
      setCareActionFeedback({ type: 'error', message: 'NOT ENOUGH COINS!' });
      setTimeout(() => setCareActionFeedback(null), 2000);
      return;
    }
    
    // Update coins if callback provided
    if (onUpdateCoins) {
      onUpdateCoins(coins - cost);
    }
    
    // Update resource
    setStableResources(prev => ({
      ...prev,
      [resourceType]: Math.min(100, prev[resourceType] + 25)
    }));
    
    // Also improve all horses' stats based on the resource type
    setStableHorses(prevHorses => 
      prevHorses.map(horse => {
        let updates = {};
        switch (resourceType) {
          case 'feed':
            updates.health = Math.min(100, horse.health + 5);
            updates.energy = Math.min(100, horse.energy + 8);
            break;
          case 'water':
            updates.health = Math.min(100, horse.health + 6);
            updates.happiness = Math.min(100, horse.happiness + 4);
            break;
          case 'pasture':
            updates.happiness = Math.min(100, horse.happiness + 8);
            updates.energy = Math.min(100, horse.energy + 6);
            break;
          case 'cleanliness':
            updates.cleanliness = Math.min(100, horse.cleanliness + 10);
            updates.health = Math.min(100, horse.health + 3);
            break;
        }
        return { ...horse, ...updates };
      })
    );
    
    // Show success feedback
    const actionNames = {
      feed: 'FED HORSES',
      water: 'REFILLED WATER',
      pasture: 'MAINTAINED PASTURE',
      cleanliness: 'CLEANED STABLE'
    };
    
    setCareActionFeedback({ type: 'success', message: actionNames[resourceType] });
    setTimeout(() => setCareActionFeedback(null), 2000);
  };

  // Handle individual horse care actions
  const handleIndividualCareAction = (horseId, actionType) => {
    const cost = individualCareCosts[actionType];
    if (coins < cost) {
      setCareActionFeedback({ type: 'error', message: 'NOT ENOUGH COINS!' });
      setTimeout(() => setCareActionFeedback(null), 2000);
      return;
    }

    // Update coins if callback provided
    if (onUpdateCoins) {
      onUpdateCoins(coins - cost);
    }

    // Find the horse to get its name for the feedback message
    const targetHorse = stableHorses.find(horse => horse.id === horseId);
    const horseName = targetHorse ? targetHorse.name.toUpperCase() : 'HORSE';

    // Show success feedback with horse name
    let feedbackMessage = '';
    switch (actionType) {
      case 'groom':
        feedbackMessage = `GROOMED ${horseName}`;
        break;
      case 'apple':
        feedbackMessage = `FED ${horseName} AN APPLE`;
        break;
      case 'carrot':
        feedbackMessage = `FED ${horseName} A CARROT`;
        break;
      case 'heal':
        feedbackMessage = `HEALED ${horseName}`;
        break;
    }
    setCareActionFeedback({ type: 'success', message: feedbackMessage });
    setTimeout(() => setCareActionFeedback(null), 2000);

    // SIMPLEST POSSIBLE APPROACH - Just update the horse directly
    setStableHorses(prevHorses => {
      const updatedHorses = prevHorses.map(horse => {
        if (horse.id !== horseId) {
          return horse; // Return exact same reference for unchanged horses
        }

        // Only update the target horse
        const now = Date.now();
        let updates = {};

        switch (actionType) {
          case 'groom':
            updates.cleanliness = Math.min(100, horse.cleanliness + 20);
            updates.happiness = Math.min(100, horse.happiness + 10);
            updates.isBeingGroomed = true;
            updates.careAnimationEnd = now + 3000;
            break;
          case 'apple':
            updates.health = Math.min(100, horse.health + 15);
            updates.happiness = Math.min(100, horse.happiness + 15);
            updates.energy = Math.min(100, horse.energy + 10);
            updates.isEatingApple = true;
            updates.careAnimationEnd = now + 3000;
            break;
          case 'carrot':
            updates.health = Math.min(100, horse.health + 10);
            updates.happiness = Math.min(100, horse.happiness + 8);
            updates.energy = Math.min(100, horse.energy + 12);
            updates.isEatingCarrot = true;
            updates.careAnimationEnd = now + 3000;
            break;
          case 'heal':
            updates.health = Math.min(100, horse.health + 30); // Major health boost
            updates.happiness = Math.min(100, horse.happiness + 20); // Feel better
            updates.energy = Math.min(100, horse.energy + 15); // More energetic
            updates.isInjured = false; // Heal the injury!
            updates.isBeingHealed = true;
            updates.careAnimationEnd = now + 4000; // Longer healing animation
            break;
          default:
            return horse;
        }

        return { ...horse, ...updates };
      });
      
      // Save the updated care stats after individual care actions
      saveHorseCareStats(updatedHorses);
      return updatedHorses;
    });
  };

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

  // Pan/drag handlers with delay for horse clicks
  const handlePanStart = (event) => {
    const target = event.target;
    const isHorseElement = target.closest('[data-horse-clickable]') !== null;
    
    if (isHorseElement) {
      // Don't interfere with horse clicks
      return;
    }
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const startTime = Date.now();
    
    // Start potential drag - but don't actually drag yet
    setPotentialDrag(true);
    setDragStart({ x: clientX, y: clientY });
    setDragStartTime(startTime);
    setLastPanOffset(panOffset);
    setVelocity({ x: 0, y: 0 });
    setLastMoveTime(startTime);
    
    // If user holds for 150ms without moving much, start dragging
    setTimeout(() => {
      if (potentialDrag && dragStartTime === startTime) {
        setIsDragging(true);
        setPotentialDrag(false);
      }
    }, 150);
  };

  const handlePanMove = (event) => {
    if (!isDragging && !potentialDrag) return;
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    // If we're in potential drag mode, check if user moved significantly
    if (potentialDrag && !isDragging) {
      const deltaX = Math.abs(clientX - dragStart.x);
      const deltaY = Math.abs(clientY - dragStart.y);
      
      // If moved more than 5 pixels, start dragging immediately
      if (deltaX > 5 || deltaY > 5) {
        setIsDragging(true);
        setPotentialDrag(false);
      } else {
        return; // Still in potential drag, don't move yet
      }
    }
    
    if (!isDragging) return;
    
    event.preventDefault();
    
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
    setPotentialDrag(false);
    
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

  const createHorseData = (horse) => {
    const inventory = horseInventories?.[horse.id] || horse.inventory || [];
    const skills = horseSkills?.[horse.id] || horse.skills || {};
    const skillPoints = horseSkillPoints?.[horse.id] || horse.skillPoints || 0;
    const customName = customHorseNames?.[horse.id] || horse.name;
    const savedCareStats = horseCareStats?.[horse.id];
    
    console.log(`🏠 Stable - createHorseData for horse ${horse.id} (${customName}):`);
    console.log('  - savedCareStats:', savedCareStats);
    
    return {
      ...horse,
      name: customName, // Use custom name if available
      skills, // Include horse skills
      skillPoints, // Include skill points
      x: Math.random() * 70 + 10,
      y: Math.random() * 60 + 20,
      targetX: Math.random() * 70 + 10,
      targetY: Math.random() * 60 + 20,
      speed: 0.3 + Math.random() * 0.4,
      direction: Math.random() * 360,
      restTime: 0,
      isResting: false,
      lastMoveTime: Date.now(),
      inventory, // Use global inventory or fallback
      // Individual care stats - use saved values or defaults
      happiness: savedCareStats?.happiness ?? (80 + Math.random() * 20), // 80-100
      health: savedCareStats?.health ?? (75 + Math.random() * 25),    // 75-100
      cleanliness: savedCareStats?.cleanliness ?? (70 + Math.random() * 30), // 70-100
      energy: savedCareStats?.energy ?? (85 + Math.random() * 15),    // 85-100
      lastCareUpdate: savedCareStats?.lastCareUpdate ?? Date.now(),
      // Care animations
      isBeingGroomed: false,
      isEatingApple: false,
      isEatingCarrot: false,
      isBeingHealed: false,
      careAnimationEnd: 0,
      // Injury status - use saved value or default from horse data
      isInjured: savedCareStats?.isInjured ?? horse.isInjured ?? false,
    };
  };

  const handleRename = (id, newName) => {
    // Update the global custom names
    if (onHorseRename) {
      onHorseRename(id, newName);
    }
    
    // Update local state
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

  const handleSellItem = (horseId, itemIndex) => {
    // Find the horse
    const horse = stableHorses.find(h => h.id === horseId) || availableHorses.find(h => h.id === horseId);
    if (!horse || !horse.inventory || !horse.inventory[itemIndex]) return;

    const item = horse.inventory[itemIndex];
    
    // Calculate item value based on type
    let itemValue = 5; // Base value
    if (item.name.includes('Golden')) itemValue = 25;
    else if (item.name.includes('Silver')) itemValue = 15;
    else if (item.name.includes('Crystal') || item.name.includes('Gem')) itemValue = 20;
    else if (item.name.includes('Magic')) itemValue = 18;
    else if (item.name.includes('Ancient') || item.name.includes('Dragon') || item.name.includes('Sacred')) itemValue = 30;
    
    // Update coins
    if (onUpdateCoins) {
      onUpdateCoins(coins + itemValue);
    }

    // Remove item from horse inventory
    const updatedInventory = [...horse.inventory];
    updatedInventory.splice(itemIndex, 1);

    // Update the horse in both stable and available horses
    setStableHorses((prev) =>
      prev.map((h) =>
        h.id === horseId ? { ...h, inventory: updatedInventory } : h
      )
    );
    setAvailableHorses((prev) =>
      prev.map((h) =>
        h.id === horseId ? { ...h, inventory: updatedInventory } : h
      )
    );

    // Update selected horse if it's the one being modified
    if (selectedHorse && selectedHorse.id === horseId) {
      setSelectedHorse({ ...selectedHorse, inventory: updatedInventory });
    }
  };

  const toggleHorseRoaming = (id) => {
    if (selectedHorseIds.includes(id)) {
      setSelectedHorseIds((prev) => prev.filter((hid) => hid !== id));
      setStableHorses((prev) => prev.filter((horse) => horse.id !== id));
    } else {
      // Check if we're at the limit of 5 horses
      if (selectedHorseIds.length >= 5) {
        return; // Don't allow more than 5 horses to graze
      }
      setSelectedHorseIds((prev) => [...prev, id]);
      const horseData = availableHorses.find((h) => h.id === id);
      if (horseData) {
        setStableHorses((prev) => [...prev, createHorseData(horseData)]);
      }
    }
  };

  // Initialize available and roaming horses based on unlocked list - RUN ONLY ONCE
  useEffect(() => {
    console.log('🏠 Stable - useEffect initializing horses');
    console.log('  - horseInventories prop:', horseInventories);
    
    const available = horseAvatars
      .map((avatar, index) => ({ avatar, index }))
      .filter((_, index) => unlockedHorses[index])
      .map(({ avatar, index }) => ({
        id: index,
        avatar,
        name: customHorseNames?.[index] || horseNames[index],
        personality: horsePersonalities[index],
      }));

    setAvailableHorses(available);
    // Only auto-select up to 5 horses for grazing
    const horsesToGraze = available.slice(0, 5);
    setSelectedHorseIds(horsesToGraze.map((h) => h.id));
    setStableHorses(horsesToGraze.map((h) => createHorseData(h)));

    setTimeout(() => setStableLoaded(true), 1000);
  }, []); // EMPTY DEPENDENCY ARRAY - RUN ONLY ONCE ON MOUNT

  // Update horse names when customHorseNames changes
  useEffect(() => {
    if (!stableLoaded) return;
    
    // Update available horses with new custom names
    setAvailableHorses(prev => 
      prev.map(horse => ({
        ...horse,
        name: customHorseNames?.[horse.id] || horseNames[horse.id]
      }))
    );
    
    // Update stable horses with new custom names
    setStableHorses(prev => 
      prev.map(horse => ({
        ...horse,
        name: customHorseNames?.[horse.id] || horseNames[horse.id]
      }))
    );
  }, [customHorseNames, stableLoaded, horseNames]);

  // Update horse inventories when horseInventories prop changes
  useEffect(() => {
    if (!stableLoaded || !horseInventories) return;
    
    console.log('🏠 Stable - horseInventories updated, refreshing stable horses');
    console.log('  - New horseInventories:', horseInventories);
    
    setStableHorses(prevHorses => 
      prevHorses.map(horse => ({
        ...horse,
        inventory: horseInventories[horse.id] || horse.inventory || []
      }))
    );
  }, [horseInventories, stableLoaded]);

  // Save horse care stats to parent whenever they change
  const saveHorseCareStats = (horses) => {
    if (onUpdateHorseCareStats && horses.length > 0) {
      const careStatsToSave = {};
      horses.forEach(horse => {
        careStatsToSave[horse.id] = {
          happiness: horse.happiness,
          health: horse.health,
          cleanliness: horse.cleanliness,
          energy: horse.energy,
          isInjured: horse.isInjured,
          lastCareUpdate: horse.lastCareUpdate
        };
      });
      onUpdateHorseCareStats(prev => ({ ...prev, ...careStatsToSave }));
    }
  };

  // Care stats decay system
  useEffect(() => {
    if (!stableLoaded || stableHorses.length === 0) return;
    
    const decayInterval = setInterval(() => {
      setStableHorses(prevHorses => {
        const updatedHorses = prevHorses.map(horse => {
          // Small gradual decay over time
          const decayAmount = 1 + Math.random() * 2; // 1-3 points decay
          
          // Music happiness boost - small bonus for healthy horses
          let musicBonus = 0;
          if (isPlaying && !horse.isInjured && !horse.isResting) {
            musicBonus = 0.3 + Math.random() * 0.4; // 0.3-0.7 happiness boost from music
          }
          
          return {
            ...horse,
            happiness: Math.max(10, Math.min(100, horse.happiness - decayAmount * 0.8 + musicBonus)),
            health: Math.max(10, horse.health - decayAmount * 0.6),
            cleanliness: Math.max(10, horse.cleanliness - decayAmount * 1.2), // Gets dirty fastest
            energy: Math.max(10, horse.energy - decayAmount * 1.0),
            lastCareUpdate: Date.now()
          };
        });
        
        // Save the updated care stats
        saveHorseCareStats(updatedHorses);
        return updatedHorses;
      });
      
      // Also decay stable resources slightly
      setStableResources(prev => ({
        feed: Math.max(0, prev.feed - 0.5 - Math.random() * 1),
        water: Math.max(0, prev.water - 0.3 - Math.random() * 0.7),
        pasture: Math.max(0, prev.pasture - 0.2 - Math.random() * 0.5),
        cleanliness: Math.max(0, prev.cleanliness - 0.4 - Math.random() * 0.8)
      }));
      
    }, 15000); // Every 15 seconds
    
    return () => clearInterval(decayInterval);
  }, [stableLoaded, stableHorses.length]);

  // Day/Night cycle and daily income system
  useEffect(() => {
    if (!stableLoaded) return;
    
    const timeInterval = setInterval(() => {
      setGameTime(prevTime => {
        const newTime = (prevTime + 0.08) % 24; // 1 game day = 5 minutes (0.08 hours every second)
        
        // Save the time to persistence
        if (onUpdateStableGameTime) {
          onUpdateStableGameTime(newTime);
        }
        
        // Check if we've crossed into a new day (from 23.5+ back to 0-0.5)
        if (prevTime > 23 && newTime < 1) {
          const newDay = dayCount + 1;
          if (onUpdateDayCount) {
            onUpdateDayCount(newDay);
          }
          
          // Give daily income
          if (onUpdateCoins) {
            onUpdateCoins(coins + 10);
          }
          
          // Show new day notification
          setNewDayNotification(`Day ${newDay} - Earned 10 coins!`);
          setTimeout(() => setNewDayNotification(null), 3000);
        }
        
        return newTime;
      });
    }, 1000); // Update every second
    
    return () => clearInterval(timeInterval);
  }, [stableLoaded, dayCount, coins, onUpdateCoins, onUpdateDayCount, onUpdateStableGameTime]);

  // Helper functions for day/night cycle
  const getTimeOfDayPhase = () => {
    if (gameTime >= 6 && gameTime < 12) return 'morning';
    if (gameTime >= 12 && gameTime < 18) return 'afternoon';
    if (gameTime >= 18 && gameTime < 22) return 'evening';
    return 'night';
  };

  const getStableBackgroundStyle = () => {
    const phase = getTimeOfDayPhase();
    const baseFilter = 'saturate(1.1) contrast(1.05)';
    
    switch (phase) {
      case 'morning':
        return {
          filter: `${baseFilter} brightness(1.1) sepia(0.1) hue-rotate(10deg)`,
          backgroundColor: 'rgba(255, 248, 220, 0.3)' // Light morning tint
        };
      case 'afternoon':
        return {
          filter: `${baseFilter} brightness(1.2)`,
          backgroundColor: 'rgba(255, 255, 255, 0.1)' // Bright day
        };
      case 'evening':
        return {
          filter: `${baseFilter} brightness(0.9) sepia(0.2) hue-rotate(30deg)`,
          backgroundColor: 'rgba(255, 140, 0, 0.2)' // Golden hour
        };
      case 'night':
        return {
          filter: `${baseFilter} brightness(0.6) contrast(1.2) saturate(0.8)`,
          backgroundColor: 'rgba(25, 25, 112, 0.4)' // Night blue tint
        };
      default:
        return { filter: baseFilter };
    }
  };

  // Remove all complex logic

  // Animation loop for horse movement
  useEffect(() => {
    if (!stableLoaded) return;

    const animationInterval = setInterval(() => {
      setStableHorses((prevHorses) =>
        prevHorses.map((horse) => {
          const now = Date.now();
          const deltaTime = (now - horse.lastMoveTime) / 1000;

          // Clear care animations if expired
          let careAnimationUpdates = {};
          if (horse.careAnimationEnd && now > horse.careAnimationEnd) {
            careAnimationUpdates = {
              isBeingGroomed: false,
              isEatingApple: false,
              isEatingCarrot: false,
              isBeingHealed: false,
              careAnimationEnd: 0
            };
          }

          // Calculate behavior modifiers based on care stats
          const energyModifier = horse.energy / 100; // 0-1 multiplier
          const healthModifier = horse.health / 100; // 0-1 multiplier
          const happinessModifier = horse.happiness / 100; // 0-1 multiplier
          
          // Tired/sick horses rest more frequently and for longer
          const restChance = horse.energy < 30 ? 0.7 : horse.energy < 60 ? 0.4 : 0.3;
          const restDuration = horse.energy < 30 ? (6 + Math.random() * 6) : (2 + Math.random() * 4);
          
          // If horse is resting, decrease rest time (affected by energy)
          if (horse.isResting) {
            const newRestTime = horse.restTime - (deltaTime * energyModifier);
            if (newRestTime <= 0) {
              return {
                ...horse,
                ...careAnimationUpdates,
                isResting: false,
                restTime: 0,
                targetX: Math.random() * 70 + 10,
                targetY: Math.random() * 60 + 20,
                lastMoveTime: now,
              };
            }
            return { ...horse, ...careAnimationUpdates, restTime: newRestTime, lastMoveTime: now };
          }

          // Calculate distance to target
          const dx = horse.targetX - horse.x;
          const dy = horse.targetY - horse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If close to target, start resting or pick new target
          if (distance < 2) {
            if (Math.random() < restChance) {
              return {
                ...horse,
                ...careAnimationUpdates,
                isResting: true,
                restTime: restDuration,
                lastMoveTime: now,
              };
            } else {
              // Unhappy horses move less, happy horses explore more
              const movementRange = happinessModifier * 60 + 10; // 10-70 based on happiness
              return {
                ...horse,
                ...careAnimationUpdates,
                targetX: Math.random() * movementRange + (85 - movementRange) / 2,
                targetY: Math.random() * (movementRange * 0.8) + 20,
                lastMoveTime: now,
              };
            }
          }

          // Speed affected by energy and health
          const effectiveSpeed = horse.speed * energyModifier * healthModifier;
          const moveX = (dx / distance) * effectiveSpeed * deltaTime * 10;
          const moveY = (dy / distance) * effectiveSpeed * deltaTime * 10;

          return {
            ...horse,
            ...careAnimationUpdates,
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
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4 flex justify-center"
          >
            <img 
              src={horseAvatars[Math.floor(Math.random() * horseAvatars.length)]}
              alt="Loading Horse"
              className="w-24 h-24 object-contain rounded-lg shadow-lg"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            />
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
                
              </motion.span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      Horse Stable
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
                  
                  {/* Day/Night Phase Display */}
                  <div style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    minWidth: '100px'
                  }}>
                    <div style={{ 
                      color: '#fef3c7',
                      fontSize: window.innerWidth < 640 ? '10px' : '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'center'
                    }}>
                      <span>
                        {getTimeOfDayPhase() === 'morning' && '🌅'}
                        {getTimeOfDayPhase() === 'afternoon' && '☀️'}
                        {getTimeOfDayPhase() === 'evening' && '🌇'}
                        {getTimeOfDayPhase() === 'night' && '🌙'}
                      </span>
                      <span style={{ textTransform: 'capitalize' }}>
                        {getTimeOfDayPhase()}
                      </span>
                    </div>
                    <div style={{ 
                      color: '#fed7aa',
                      fontSize: window.innerWidth < 640 ? '8px' : '10px'
                    }}>
                      Day {dayCount}
                    </div>
                  </div>
                </div>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNameTags(!showNameTags)}
              className={`btn-retro ${showNameTags ? 'btn-retro-orange' : 'btn-retro-gray'}`}
              style={{
                padding: window.innerWidth < 640 ? '6px 8px' : '8px 16px',
                fontSize: window.innerWidth < 640 ? '8px' : '10px',
                flex: window.innerWidth < 640 ? '1' : 'none',
                minWidth: window.innerWidth < 640 ? '0' : 'auto',
                letterSpacing: window.innerWidth < 640 ? '0.5px' : '1px'
              }}
            >
              {window.innerWidth < 640 ? 'Tags' : showNameTags ? 'Hide Names' : 'Show Names'}
            </motion.button>
          </div>
        </div>
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
            backgroundImage: 'url(/stable/backgroundpasture.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto',
            overflow: 'hidden',
            transformOrigin: 'center center',
            transform: 'scale(1)',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
            borderLeft: '4px solid #8B4513',
            borderRight: '4px solid #8B4513',
            ...getStableBackgroundStyle()
          }}
          onClick={(e) => {
            console.log('🏠 Stable - Background clicked!', e.target);
          }}
        >
          
          {/* Fence along top and bottom */}
          {/* Top fence */}
          <div style={{
            position: 'absolute',
            top: '-18px',
            left: '0px',
            width: '100%',
            height: '64px',
            backgroundImage: 'url(/stable/fence.png)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 64px',
            zIndex: '5'
          }}></div>
          
          {/* Bottom fence */}
          <div style={{
            position: 'absolute',
            bottom: '-18px',
            left: '0px',
            width: '100%',
            height: '64px',
            backgroundImage: 'url(/stable/fence.png)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 64px',
            zIndex: '15'
          }}></div>

          {/* Decorative Assets */}
          {/* Farm Building */}
          <div 
            style={{
              position: 'absolute',
              top: '-100px',
              left: '-50px',
              width: '480px',
              height: '400px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/house.png" 
              alt="Stable House" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))'
              }}
            />
          </div>
          
          {/* Truck */}
          <div 
            style={{
              position: 'absolute',
              bottom: '32px',
              right: '32px',
              width: '320px',
              height: '192px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/truck.png" 
              alt="Truck" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))'
              }}
            />
          </div>
          
          {/* Turntable */}
          <div 
            style={{
              position: 'absolute',
              top: '150px',
              right: '348px',
              width: '64px',
              height: '64px',
              zIndex: '10',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              if (!isDragging) {
                e.stopPropagation();
                setShowMusicLibrary(true);
              }
            }}
          >
            <img 
              src="/stable/turntable.png" 
              alt="Turntable" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))'
              }}
            />
          </div>
          
          {/* Pond */}
          <div 
            style={{
              position: 'absolute',
              bottom: '100px',
              left: '150px',
              width: '320px',
              height: '200px',
              zIndex: '10'
            }}
          >
            <img 
              src="/stable/pond.png" 
              alt="Pond" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))',
                opacity: '0.9'
              }}
            />
          </div>

          {/* Roaming Horses */}
          {stableHorses.map((horse) => (
            <motion.div
              key={horse.id}
              className="absolute z-20 cursor-pointer"
              style={{ left: `${horse.x}%`, top: `${horse.y}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
              data-horse-clickable="true"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`🐴 Stable - Horse ${horse.name} clicked:`);
                console.log('  - Horse object:', horse);
                console.log('  - Horse inventory:', horse.inventory);
                setSelectedHorse(horse);
              }}
            >
              <motion.div
                className="relative"
                animate={
                  horse.isResting
                    ? { scale: [1, 1.02, 1], rotate: [0, 1, -1, 0] }
                    : horse.isInjured
                    ? { y: [0, -0.5, 0], rotate: [0, 0.5, -0.5, 0] } // Injured horses barely move
                    : isPlaying && !horse.isInjured // Dancing to music (only if not injured)
                    ? { 
                        y: [0, -8, -4, -8, 0], // Enhanced bouncing pattern
                        rotate: [0, 5, -5, 3, 0], // Head bobbing side to side
                        scale: [1, 1.05, 0.98, 1.02, 1] // Slight pulsing to the beat
                      }
                    : horse.energy < 30
                    ? { y: [0, -1, 0], rotate: [0, 1, -1, 0] } // Tired animation
                    : horse.happiness > 80
                    ? { y: [0, -3, 0], rotate: [0, 3, -3, 0] } // Happy animation
                    : { y: [0, -2, 0], rotate: [0, 2, -2, 0] } // Normal animation
                }
                transition={{
                  duration: horse.isResting 
                    ? 3 
                    : horse.isInjured
                    ? 4 // Injured horses move very slowly
                    : isPlaying && !horse.isInjured
                    ? 1.2 // Rhythmic tempo for dancing
                    : horse.energy < 30 
                    ? 2 
                    : horse.happiness > 80 
                    ? 0.8 
                    : 1,
                  repeat: Infinity,
                  ease: horse.isInjured ? "easeOut" : isPlaying ? "easeInOut" : "easeInOut",
                  delay: isPlaying && !horse.isInjured ? (horse.id * 0.1) : 0, // Slight delay offset for each horse when dancing
                }}
              >
                <FadeInImage
                  src={horse.avatar}
                  alt={horse.name}
                  className="w-40 h-40 object-contain rounded-lg"
                  style={{
                    transform:
                      horse.direction > -90 && horse.direction < 90
                        ? "none"
                        : "scaleX(-1)",
                    ...getHorseHealthEffects(horse),
                  }}
                />
                
                
                {/* Care Action Visual Effects */}
                {horse.isBeingGroomed && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Grooming sparkles */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-yellow-400"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      >
                        ✨
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                
                {horse.isEatingApple && (
                  <motion.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [1, 1, 0],
                      y: [0, -10, -20],
                      scale: [1, 1.2, 0.8]
                    }}
                    transition={{ duration: 2, repeat: 1 }}
                  >
                    🍎
                  </motion.div>
                )}
                
                {horse.isEatingCarrot && (
                  <motion.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [1, 1, 0],
                      y: [0, -10, -20],
                      scale: [1, 1.2, 0.8]
                    }}
                    transition={{ duration: 2, repeat: 1 }}
                  >
                    🥕
                  </motion.div>
                )}
                
                {horse.isBeingHealed && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Healing aura */}
                    <motion.div
                      className="absolute inset-0 bg-green-400 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    {/* Healing crosses */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-green-500 text-xl"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.2, 0.5],
                          y: [0, -30],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      >
                        ✚
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                
                {/* Musical notes for dancing horses */}
                {isPlaying && !horse.isResting && (
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-blue-400"
                        style={{
                          left: `${40 + i * 20}%`,
                          top: `${30 + i * 15}%`,
                          fontSize: '14px'
                        }}
                        animate={{
                          opacity: [0, 0.8, 0],
                          y: [0, -15],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 1 + (horse.id * 0.5), // Longer offset per horse
                          ease: "easeInOut"
                        }}
                      >
                        {i % 2 === 0 ? '🎵' : '🎶'}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Horse Status Indicators */}
                {getHorseStatusIndicators(horse).map((indicator, index) => (
                  <motion.div
                    key={indicator}
                    className="absolute text-xl"
                    style={{
                      top: `-${20 + (index * 25)}px`,
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [0.8, 1, 0.8], 
                      y: [0, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  >
                    {indicator}
                  </motion.div>
                ))}
                {showNameTags && (
                  <motion.div
                    className="absolute bg-amber-800 text-amber-100 px-2 py-1 border border-amber-600 text-xs whitespace-nowrap"
                    style={{
                      top: '50px',
                      left: '0%',
                      transform: 'translateX(-50%)',
                      fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                      fontWeight: 'bold',
                      fontSize: '10px',
                      letterSpacing: '0.5px'
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: horse.id * 0.2 }}
                  >
                    {horse.name.toUpperCase()}
                  </motion.div>
                )}
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
            className="absolute top-4 right-4 border-2"
            style={{
              backgroundColor: 'rgba(146, 64, 14, 0.9)',
              borderColor: '#d97706',
              color: '#fef3c7',
              padding: '16px',
              fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
              fontSize: '8px',
              letterSpacing: '1px',
              zIndex: '20'
            }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 style={{
              fontWeight: 'bold',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
              fontSize: '8px'
            }}>
              <span>🏠</span>
              STABLE STATUS
            </h3>
            <div style={{
              fontSize: '7px',
              fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
              lineHeight: '1.4'
            }}>
              <p style={{ fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace', fontSize: '7px', marginBottom: '4px' }}>
                🐎 HORSES: {stableHorses.length}/5
              </p>
              
              {/* Interactive Feed Status */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '2px',
                  cursor: coins >= careCosts.feed ? 'pointer' : 'not-allowed',
                  opacity: coins >= careCosts.feed ? 1 : 0.6
                }}
                onClick={() => handleCareAction('feed')}
                title={`Feed horses (${careCosts.feed} coins)`}
              >
                <span style={{ 
                  color: getResourceColor(stableResources.feed),
                  fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
                  fontSize: '7px'
                }}>
                  🌾 FEED: {Math.round(stableResources.feed)}%
                </span>
              </div>
              
              {/* Interactive Water Status */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '2px',
                  cursor: coins >= careCosts.water ? 'pointer' : 'not-allowed',
                  opacity: coins >= careCosts.water ? 1 : 0.6
                }}
                onClick={() => handleCareAction('water')}
                title={`Refill water (${careCosts.water} coins)`}
              >
                <span style={{ 
                  color: getResourceColor(stableResources.water),
                  fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
                  fontSize: '7px'
                }}>
                  💧 WATER: {Math.round(stableResources.water)}%
                </span>
              </div>
              
              {/* Interactive Pasture Status */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '2px',
                  cursor: coins >= careCosts.pasture ? 'pointer' : 'not-allowed',
                  opacity: coins >= careCosts.pasture ? 1 : 0.6
                }}
                onClick={() => handleCareAction('pasture')}
                title={`Maintain pasture (${careCosts.pasture} coins)`}
              >
                <span style={{ 
                  color: getResourceColor(stableResources.pasture),
                  fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
                  fontSize: '7px'
                }}>
                  🌱 PASTURE: {Math.round(stableResources.pasture)}%
                </span>
              </div>
              
              {/* Interactive Cleanliness Status */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '2px',
                  cursor: coins >= careCosts.cleanliness ? 'pointer' : 'not-allowed',
                  opacity: coins >= careCosts.cleanliness ? 1 : 0.6
                }}
                onClick={() => handleCareAction('cleanliness')}
                title={`Clean stable (${careCosts.cleanliness} coins)`}
              >
                <span style={{ 
                  color: getResourceColor(stableResources.cleanliness),
                  fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
                  fontSize: '7px'
                }}>
                  🧼 CLEAN: {Math.round(stableResources.cleanliness)}%
                </span>
              </div>
              
              <div style={{ 
                marginTop: '6px', 
                paddingTop: '4px', 
                borderTop: '1px solid #d97706',
                fontSize: '6px',
                color: '#fed7aa'
              }}>
                CLICK TO CARE FOR HORSES
              </div>
            </div>
          </motion.div>

          {/* Care Action Feedback */}
          {careActionFeedback && (
            <motion.div
              className="absolute top-4 right-4"
              style={{
                backgroundColor: careActionFeedback.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                borderColor: careActionFeedback.type === 'success' ? '#16a34a' : '#dc2626',
                border: '2px solid',
                color: '#ffffff',
                padding: '8px 12px',
                fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
                fontSize: '8px',
                letterSpacing: '1px',
                zIndex: '25',
                transform: 'translateY(-80px)'
              }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
            >
              {careActionFeedback.message}
            </motion.div>
          )}

          {/* New Day Notification */}
          {newDayNotification && (
            <motion.div
              className="absolute top-1/2 left-1/2"
              style={{
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(251, 191, 36, 0.95)',
                border: '3px solid #f59e0b',
                color: '#92400e',
                padding: '16px 24px',
                borderRadius: '12px',
                fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
                fontSize: '12px',
                letterSpacing: '1px',
                zIndex: '30',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
            >
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>🌅 ✨</div>
              {newDayNotification}
              <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>
                💰 Daily Income Received!
              </div>
            </motion.div>
          )}

          {/* Now Playing indicator */}
          {isPlaying && currentSong && (
            <div className="absolute bottom-4 left-4 border-2"
              style={{
                color: '#92400e',
                backgroundColor: 'rgba(251, 191, 36, 0.8)',
                padding: '8px 12px',
                borderColor: '#a16207',
                fontFamily: '"Press Start 2P", "Courier New", "Monaco", "Menlo", monospace',
                fontSize: '8px',
                letterSpacing: '1px',
                zIndex: '25'
              }}>
              <div className="flex items-center gap-2">
                <img 
                  src={currentSong.image}
                  alt={`${currentSong.name} Album Cover`}
                  style={{
                    width: '70px',
                    height: '70px',
                    objectFit: 'cover',
                    border: '1px solid #92400e'
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-blue-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span style={{ fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important' }}>NOW PLAYING: {currentSong.name}</span>
                <button
                  className="ml-2 px-2 py-1 bg-amber-700 border border-amber-600 text-amber-100 hover:bg-amber-600 transition-colors"
                  style={{
                    fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                    fontSize: '10px',
                    letterSpacing: '1px'
                  }}
                  onClick={() => {
                    if (currentAudio) {
                      currentAudio.pause();
                      currentAudio.currentTime = 0;
                      setIsPlaying(false);
                      setCurrentAudio(null);
                      setCurrentSong(null);
                    }
                  }}
                >
                  STOP
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
        {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Select Grazing Horses</h2>
            <p className="text-sm text-gray-600 mb-3">Maximum 5 horses can graze at once ({selectedHorseIds.length}/5)</p>
            <div className="space-y-2">
              {availableHorses.map((horse) => {
                const isChecked = selectedHorseIds.includes(horse.id);
                const isDisabled = !isChecked && selectedHorseIds.length >= 5;
                return (
                  <label key={horse.id} className={`flex items-center gap-2 ${isDisabled ? 'opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleHorseRoaming(horse.id)}
                      disabled={isDisabled}
                    />
                    <span>{horse.name}</span>
                    {isDisabled && <span className="text-xs text-gray-500">(limit reached)</span>}
                  </label>
                );
              })}
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
            console.log('🏠 Stable - onSendToLabyrinth called with selectedHorse:', selectedHorse);
            console.log('🎒 Stable - selectedHorse inventory:', selectedHorse?.inventory);
            onSendToLabyrinth(selectedHorse);
            setSelectedHorse(null);
          }}
          onCareAction={(horseId, actionType) => {
            handleIndividualCareAction(horseId, actionType);
            setSelectedHorse(null); // Close modal to see animation effects
          }}
          onSellItem={handleSellItem}
          coins={coins}
          careCosts={individualCareCosts}
        />
      )}
      {showMusicLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-amber-800 border-2 border-amber-600 p-6 w-80 max-h-[80vh] overflow-y-auto"
            style={{
              fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
              fontSize: '12px',
              letterSpacing: '1px'
            }}>
            <h2 className="text-xl font-bold mb-4 text-amber-100 text-center"
              style={{
                fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                letterSpacing: '2px'
              }}>
              MUSIC LIBRARY
            </h2>
            <div className="space-y-2">
              <div 
                className="bg-amber-700 border border-amber-500 px-3 py-2 cursor-pointer hover:bg-amber-600 transition-colors"
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (isPlaying) {
                    return; // Don't start playing if already playing
                  }
                  
                  // Stop any currently playing audio
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Gallop to Glory.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'THEME SONG',
                    image: '/record collection/theme song.png'
                  });
                  
                  // Set up event listeners
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                  });
                  
                  audio.addEventListener('error', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed');
                  });
                  
                  audio.play().catch(err => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed:', err);
                  });
                }}
              >
                <span className="text-amber-100">♪ THEME SONG</span>
              </div>
              
              <div 
                className="bg-amber-700 border border-amber-500 px-3 py-2 cursor-pointer hover:bg-amber-600 transition-colors"
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (isPlaying) {
                    return; // Don't start playing if already playing
                  }
                  
                  // Stop any currently playing audio
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Wild Mane.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'WILD MANE',
                    image: '/record collection/Wild Mane.png'
                  });
                  
                  // Set up event listeners
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                  });
                  
                  audio.addEventListener('error', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed');
                  });
                  
                  audio.play().catch(err => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed:', err);
                  });
                }}
              >
                <span className="text-amber-100">♪ WILD MANE</span>
              </div>
              
              <div 
                className="bg-amber-700 border border-amber-500 px-3 py-2 cursor-pointer hover:bg-amber-600 transition-colors"
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (isPlaying) {
                    return; // Don't start playing if already playing
                  }
                  
                  // Stop any currently playing audio
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Wild and Unbridled.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'WILD AND UNBRIDLED',
                    image: '/record collection/Wild and Unbridled.png'
                  });
                  
                  // Set up event listeners
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                  });
                  
                  audio.addEventListener('error', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed');
                  });
                  
                  audio.play().catch(err => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed:', err);
                  });
                }}
              >
                <span className="text-amber-100">♪ WILD AND UNBRIDLED</span>
              </div>
              
              <div 
                className="bg-amber-700 border border-amber-500 px-3 py-2 cursor-pointer hover:bg-amber-600 transition-colors"
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
                onClick={() => {
                  if (isPlaying) {
                    return; // Don't start playing if already playing
                  }
                  
                  // Stop any currently playing audio
                  if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                  }
                  
                  const audio = new Audio('/sounds/Clover.mp3');
                  setCurrentAudio(audio);
                  setIsPlaying(true);
                  setCurrentSong({
                    name: 'CLOVER',
                    image: '/record collection/Clover.png'
                  });
                  
                  // Set up event listeners
                  audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                  });
                  
                  audio.addEventListener('error', () => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed');
                  });
                  
                  audio.play().catch(err => {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentSong(null);
                    console.log('Audio play failed:', err);
                  });
                }}
              >
                <span className="text-amber-100">♪ CLOVER</span>
              </div>
            </div>
            <div className="text-right mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMusicLibrary(false)}
                className="px-4 py-2 bg-amber-600 border-2 border-amber-500 text-amber-100 hover:bg-amber-700 transition-colors font-bold"
                style={{
                  fontFamily: 'Press Start 2P, Courier New, Monaco, Menlo, monospace !important',
                  fontSize: '11px',
                  letterSpacing: '1px'
                }}
              >
                CLOSE
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorseStable;
