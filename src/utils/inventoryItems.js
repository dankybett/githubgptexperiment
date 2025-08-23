// Inventory item definitions for horses
export const INVENTORY_ITEMS = {
  key: {
    id: 'key',
    name: 'Key',
    description: 'Opens locked doors and vaults',
    image: '/maze/key.png',
    category: 'tool',
    stackable: false
  },
  treasure: {
    id: 'treasure',
    name: 'Treasure',
    description: 'Valuable treasure from the maze',
    image: '/maze/treasure.png',
    category: 'treasure',
    stackable: false
  },
  powerup: {
    id: 'powerup',
    name: 'Power-up',
    description: 'Magical enhancement item',
    image: '/maze/powerup.png',
    category: 'consumable',
    stackable: false
  },
  vault_treasure: {
    id: 'vault_treasure',
    name: 'Vault Treasure',
    description: 'Rare treasure from a secured vault',
    image: '/maze/vault.png',
    category: 'rare_treasure',
    stackable: false
  },
  tarot_card: {
    id: 'tarot_card',
    name: 'Tarot Card',
    description: 'Mystical card from a tarot chest',
    image: '/Tarot cards/tarotchest.png',
    category: 'mystical',
    stackable: false
  },
  mystical_energy: {
    id: 'mystical_energy',
    name: 'Mystical Energy',
    description: 'Pure magical energy from an empty tarot chest',
    image: '/maze/treasure.png',
    category: 'treasure',
    stackable: false
  }
};

// Helper functions for inventory management
export const inventoryUtils = {
  // Add item to horse inventory (dynamic slots based on saddlebags skill)
  addItem: (inventory, item, maxSlots = 4) => {
    if (!inventory) inventory = [];
    
    // Check if inventory is full
    if (inventory.length >= maxSlots) {
      return { success: false, reason: 'Inventory full', inventory };
    }
    
    // For stackable items, check if we already have one
    if (item.stackable) {
      const existingIndex = inventory.findIndex(inv => inv.id === item.id);
      if (existingIndex !== -1) {
        // Increase quantity instead of adding new slot
        const newInventory = [...inventory];
        newInventory[existingIndex] = {
          ...newInventory[existingIndex],
          quantity: (newInventory[existingIndex].quantity || 1) + 1
        };
        return { success: true, inventory: newInventory };
      }
    }
    
    // Add new item
    const newItem = { ...item, quantity: 1 };
    return { success: true, inventory: [...inventory, newItem] };
  },

  // Remove item from inventory
  removeItem: (inventory, itemId) => {
    if (!inventory) return [];
    
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return inventory;
    
    const item = inventory[itemIndex];
    if (item.quantity && item.quantity > 1) {
      // Decrease quantity
      const newInventory = [...inventory];
      newInventory[itemIndex] = { ...item, quantity: item.quantity - 1 };
      return newInventory;
    } else {
      // Remove item completely
      return inventory.filter((_, index) => index !== itemIndex);
    }
  },

  // Check if inventory has specific item
  hasItem: (inventory, itemId) => {
    if (!inventory) return false;
    return inventory.some(item => item.id === itemId);
  },

  // Get item count
  getItemCount: (inventory, itemId) => {
    if (!inventory) return 0;
    // Count all items with the specified id (handles both separate items and stacked items)
    return inventory
      .filter(item => item.id === itemId)
      .reduce((total, item) => total + (item.quantity || 1), 0);
  },

  // Check if inventory has space (dynamic slots based on saddlebags skill)
  hasSpace: (inventory, maxSlots = 4) => {
    return !inventory || inventory.length < maxSlots;
  }
};