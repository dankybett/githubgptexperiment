// Dream asset manifest
// Import your custom dream backgrounds here

// Import the images directly
import mountains from './assets/settings/mountains.png';
import beach from './assets/settings/beach.png';
import candyland from './assets/settings/candyland.png';
import celestialgarden from './assets/settings/celestialgarden.png';
import chessboard from './assets/settings/chessboard.png';
import horseballoons from './assets/settings/horseballoons.png';
import insidemouth from './assets/settings/insidemouth.png';
import mechanicalhorses from './assets/settings/mechanicalhorses.png';
import mooncheeseplain from './assets/settings/mooncheeseplain.png';
import thewoods from './assets/settings/thewoods.png';
import toyland from './assets/settings/toyland.png';
import underthesea from './assets/settings/underthesea.png';
import racetrack from './assets/settings/racetrack.png';
import mirrorland from './assets/settings/mirrorland.png';
import mysticalenergy from './assets/settings/mysticalenergy.png';
import labyrinth from './assets/settings/labyrinth.png';
import { path } from 'framer-motion/client';


// Add your custom dream settings here
// When you add new images, import them above and add them to this array
export const CUSTOM_DREAM_SETTINGS = [
  {
    name: 'mountains',
    path: mountains
  },
  {
    name: 'beach',
    path: beach
  },
   {
    name: 'candyland',
    path: candyland
  },
  // celestialgarden and chessboard moved to tarot-only backgrounds
  {
    name: 'horseballoons',
    path: horseballoons
  },
{
    name: 'insidemouth',
    path: insidemouth
  },
  {
    name: 'mechanicalhorses',
    path: mechanicalhorses
  },
  {
    name: 'mooncheeseplain',
    path: mooncheeseplain
  },
  {
    name: 'thewoods',
    path: thewoods
  },
  {
    name: 'toyland',
    path: toyland
  },
  {
    name: 'underthesea',
    path: underthesea
  },
  {
    name: 'racetrack',
    path: racetrack
  },
  {
    name: 'labyrinth',
    path: labyrinth
  }
  // mirrorland and mysticalenergy moved to tarot-only backgrounds
];

// Tarot-exclusive backgrounds
export const TAROT_BACKGROUNDS = [
  {
    name: 'mysticalenergy',
    path: mysticalenergy
  },
  {
    name: 'mirrorland',
    path: mirrorland
  },
  {
    name: 'chessboard',
    path: chessboard
  },
  {
    name: 'celestialgarden',
    path: celestialgarden
  }
];

// Add more custom backgrounds here as you create them:
// {
//   name: 'enchanted-forest', 
//   path: import('./assets/settings/enchanted-forest.jpg')
// }

export default CUSTOM_DREAM_SETTINGS;