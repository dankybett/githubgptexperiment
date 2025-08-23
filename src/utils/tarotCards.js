// Tarot card definitions for the collection system
export const TAROT_CARDS = [
  { id: 0, name: "The Fool", fileName: "0.thefool.png", description: "New beginnings and adventures" },
  { id: 1, name: "The Magician", fileName: "1. themagician.png", description: "Manifestation and willpower" },
  { id: 2, name: "The High Priestess", fileName: "2.thehighpriestess.png", description: "Intuition and mystery" },
  { id: 3, name: "The Empress", fileName: "3.theempress.png", description: "Fertility and abundance" },
  { id: 4, name: "The Emperor", fileName: "4.theemperor.png", description: "Authority and structure" },
  { id: 5, name: "The Hierophant", fileName: "5.thehierophant.png", description: "Tradition and spiritual guidance" },
  { id: 6, name: "The Lovers", fileName: "6.thelovers.png", description: "Love and relationships" },
  { id: 7, name: "The Chariot", fileName: "7.thechariot.png", description: "Determination and success" },
  { id: 8, name: "Strength", fileName: "8.strength.png", description: "Inner strength and courage" },
  { id: 9, name: "The Hermit", fileName: "9.thehermit.png", description: "Soul searching and guidance" },
  { id: 10, name: "Wheel of Fortune", fileName: "10.wheeloffortune.png", description: "Cycles and destiny" },
  { id: 11, name: "Justice", fileName: "11.justice.png", description: "Balance and fairness" },
  { id: 12, name: "The Hanged Man", fileName: "12.thehangedman.png", description: "Sacrifice and perspective" },
  { id: 13, name: "Death", fileName: "13.death.png", description: "Transformation and renewal" },
  { id: 14, name: "Temperance", fileName: "14.temperance.png", description: "Balance and moderation" },
  { id: 15, name: "The Devil", fileName: "15.thedevil.png", description: "Temptation and bondage" },
  { id: 16, name: "The Tower", fileName: "16.thetower.png", description: "Sudden change and revelation" },
  { id: 17, name: "The Star", fileName: "17.thestar.png", description: "Hope and inspiration" },
  { id: 18, name: "The Moon", fileName: "18.themoon.png", description: "Illusion and subconscious" },
  { id: 19, name: "The Sun", fileName: "19.thesun.png", description: "Joy and success" },
  { id: 20, name: "Judgement", fileName: "20.judgement.png", description: "Rebirth and inner calling" },
  { id: 21, name: "The World", fileName: "21.theworld.png", description: "Completion and fulfillment" }
];

// Helper functions for tarot card management
export const tarotCardUtils = {
  // Get all card IDs
  getAllCardIds: () => TAROT_CARDS.map(card => card.id),
  
  // Get card by ID
  getCardById: (id) => TAROT_CARDS.find(card => card.id === id),
  
  // Get random locked card
  getRandomLockedCard: (unlockedCardIds = []) => {
    const lockedCards = TAROT_CARDS.filter(card => !unlockedCardIds.includes(card.id));
    if (lockedCards.length === 0) return null;
    return lockedCards[Math.floor(Math.random() * lockedCards.length)];
  },
  
  // Check if all cards are unlocked
  areAllCardsUnlocked: (unlockedCardIds = []) => {
    return unlockedCardIds.length >= TAROT_CARDS.length;
  },
  
  // Get unlock progress
  getProgress: (unlockedCardIds = []) => ({
    unlocked: unlockedCardIds.length,
    total: TAROT_CARDS.length,
    percentage: Math.round((unlockedCardIds.length / TAROT_CARDS.length) * 100)
  })
};