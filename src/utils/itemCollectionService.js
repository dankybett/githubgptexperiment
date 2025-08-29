// Centralized Item Collection Service
// Handles all item collection logic with consistent validation and state management

import { INVENTORY_ITEMS, inventoryUtils } from './inventoryItems.js';

export class ItemCollectionService {
  constructor() {
    // Map-based lookups for O(1) performance
    this.rewardPositionMap = new Map(); // "x,y" -> reward
    this.powerupPositionMap = new Map(); // "x,y" -> powerup  
    this.keyPositionMap = new Map(); // "x,y" -> key
    this.collectedPositions = new Set(); // "x,y"
  }

  // Initialize positions from arrays (during maze generation)
  setRewardPositions(rewardPositions) {
    this.rewardPositionMap.clear();
    rewardPositions.forEach(reward => {
      const key = `${reward.x},${reward.y}`;
      this.rewardPositionMap.set(key, reward);
    });
  }

  setPowerupPositions(powerupPositions) {
    this.powerupPositionMap.clear();
    powerupPositions.forEach(powerup => {
      const key = `${powerup.x},${powerup.y}`;
      this.powerupPositionMap.set(key, powerup);
    });
  }

  setKeyPositions(keyPositions) {
    this.keyPositionMap.clear();
    keyPositions.forEach(keyData => {
      const key = `${keyData.x},${keyData.y}`;
      this.keyPositionMap.set(key, keyData);
    });
  }

  // Reset for new maze
  reset() {
    this.rewardPositionMap.clear();
    this.powerupPositionMap.clear();
    this.keyPositionMap.clear();
    this.collectedPositions.clear();
  }

  // Check if position has been collected
  isPositionCollected(x, y) {
    return this.collectedPositions.has(`${x},${y}`);
  }

  // Get item at position
  getItemAtPosition(x, y) {
    const posKey = `${x},${y}`;
    
    if (this.rewardPositionMap.has(posKey)) {
      return {
        type: 'reward',
        data: this.rewardPositionMap.get(posKey)
      };
    }
    
    if (this.powerupPositionMap.has(posKey)) {
      return {
        type: 'powerup', 
        data: this.powerupPositionMap.get(posKey)
      };
    }
    
    if (this.keyPositionMap.has(posKey)) {
      return {
        type: 'key',
        data: this.keyPositionMap.get(posKey)
      };
    }
    
    return null;
  }

  // Core collection method - handles all item types consistently
  collectItem(x, y, options = {}) {
    const posKey = `${x},${y}`;
    
    // Prevent duplicate collection
    if (this.collectedPositions.has(posKey)) {
      return {
        success: false,
        reason: 'already_collected',
        item: null
      };
    }

    const itemData = this.getItemAtPosition(x, y);
    if (!itemData) {
      return {
        success: false,
        reason: 'no_item',
        item: null
      };
    }

    // Check inventory space if provided
    const { inventory, maxSlots, collectedKeys = [] } = options;
    
    let item = null;
    let requiresInventorySpace = true;

    switch (itemData.type) {
      case 'reward':
        const reward = itemData.data.rewardType;
        item = reward.inventoryItem || reward;
        break;
        
      case 'powerup':
        // Powerups are applied immediately, don't need inventory space
        item = itemData.data.powerupType;
        requiresInventorySpace = false;
        break;
        
      case 'key':
        // Check if key already collected
        if (collectedKeys.includes(itemData.data.id)) {
          return {
            success: false,
            reason: 'key_already_collected',
            item: null
          };
        }
        item = INVENTORY_ITEMS.key;
        break;
    }

    // Check inventory space for items that need it
    const isInventoryFull = requiresInventorySpace && inventory && maxSlots && !inventoryUtils.hasSpace(inventory, maxSlots);

    // Mark as collected and remove from position maps regardless of inventory status
    this.collectedPositions.add(posKey);
    this.rewardPositionMap.delete(posKey);
    this.powerupPositionMap.delete(posKey);
    this.keyPositionMap.delete(posKey);

    return {
      success: !isInventoryFull,
      reason: isInventoryFull ? 'inventory_full' : undefined,
      item: item,
      itemType: itemData.type,
      position: { x, y },
      keyId: itemData.type === 'key' ? itemData.data.id : null,
      originalData: itemData.data
    };
  }

  // Collect multiple items (for magnet)
  collectMultipleItems(positions, options = {}) {
    const results = [];
    const { inventory, maxSlots } = options;
    
    // Calculate available space
    let availableSpace = maxSlots ? Math.max(0, maxSlots - (inventory?.length || 0)) : Infinity;
    
    for (const { x, y } of positions) {
      const result = this.collectItem(x, y, { 
        ...options, 
        maxSlots: availableSpace > 0 ? maxSlots : 0 
      });
      
      if (result.success) {
        results.push(result);
        // Only decrement space for items that need inventory slots
        if (result.itemType !== 'powerup') {
          availableSpace--;
        }
      } else if (result.reason === 'inventory_full') {
        // For full inventory, still track the item for modal handling
        results.push(result);
      }
    }
    
    return results;
  }

  // Get all remaining reward positions as array (for compatibility)
  getRewardPositions() {
    return Array.from(this.rewardPositionMap.values());
  }

  // Get all remaining powerup positions as array (for compatibility)  
  getPowerupPositions() {
    return Array.from(this.powerupPositionMap.values());
  }

  // Get items within range for magnet collection
  getItemsInRange(centerX, centerY, range) {
    const items = [];
    
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip center position
        
        const x = centerX + dx;
        const y = centerY + dy;
        const item = this.getItemAtPosition(x, y);
        
        if (item && !this.isPositionCollected(x, y)) {
          items.push({ x, y, ...item });
        }
      }
    }
    
    return items;
  }
}

// Export singleton instance
export const itemCollectionService = new ItemCollectionService();