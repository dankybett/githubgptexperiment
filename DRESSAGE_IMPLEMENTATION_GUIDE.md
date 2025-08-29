# Dressage Card Game Implementation Guide

## Overview
This document provides structured guidance for implementing and developing the dressage-based card game prototype within the existing horse stable game. The dressage game will be accessible when users enter individual horses into dressage competitions from the main stable screen.

## Project Architecture Context

### Current Game Structure
- **Main App**: React-based horse stable management game (App.js:1-200+)
- **Components**: Located in `src/components1/` directory
- **Game States**: Multiple game modes including stable, racing, battleship, labyrinth
- **Horse Management**: Individual horses with inventories, skills, care stats, and custom names
- **Currency System**: Coins for betting and purchases
- **Themes**: Customizable themes with font classes
- **Storage**: Game state persistence using gameStorage utility

### Existing Dressage Prototype
- **Location**: `src/components1/dressage.js`
- **Status**: Complete standalone implementation with all core mechanics
- **Features**: Full card game with stamina, flow, combos, scoring, and visual feedback
- **Dependencies**: React, Lucide icons, Tailwind CSS

## Implementation Strategy

### Phase 1: Integration Foundation

#### 1.1 Navigation Integration
- Add dressage competition entry point in HorseStable component
- Create loading screen transition from stable to dressage arena
- Implement horse selection mechanism for dressage competitions

#### 1.2 State Management Integration
- Connect dressage game state to main app state management
- Integrate with existing horse data (skills, care stats, custom names)
- Link dressage performance to horse skill development system

#### 1.3 Theme Integration  
- Apply current theme system to dressage game UI
- Ensure font classes (theme-retro, theme-arcade, etc.) work with dressage components
- Maintain visual consistency with main game aesthetic

### Phase 2: Core Dressage Implementation

#### 2.1 Dressage Arena Screen Structure
```
[Horse Display Area]
┌─────────────────────────┐
│     Selected Horse      │ 
│    (name + avatar)      │
└─────────────────────────┘

[Judges Panel]
┌─────┬─────┬─────────────┐
│Judge│Judge│   Score     │
│  1  │  2  │  Display    │
└─────┴─────┴─────────────┘

[Player Hand & Game Area]
┌─────────────────────────┐
│   Current Cards Hand    │
│  (max 4 cards shown)   │
└─────────────────────────┘

[Game Stats & Controls]
┌─────┬─────┬─────┬───────┐
│Score│Stam │Flow │Turn   │
│     │     │     │8/8    │
└─────┴─────┴─────┴───────┘
```

#### 2.2 Core Components to Create
1. **DressageArena.js** - Main arena container
2. **DressageHorse.js** - Horse display with animations
3. **JudgesPanel.js** - Three judges with scoring feedback
4. **DressageCard.js** - Enhanced card component with horse-specific theming
5. **DressageGameState.js** - Game state management wrapper

#### 2.3 Enhanced Features Beyond Prototype
- **Horse-Specific Bonuses**: Each horse's skills affect card performance
- **Progressive Difficulty**: Competition levels (Novice → Advanced → Master)
- **Skill Development**: Dressage performance improves horse skills
- **Rewards System**: Coins, skill points, and unlockable content
- **Animation System**: Horse performs moves based on played cards

### Phase 3: Game Mechanics Enhancement

#### 3.1 Horse Integration Features
- **Skill Bonuses**: Horse skills modify card base scores and stamina costs
- **Fatigue System**: Multiple competitions in one day reduce performance
- **Experience Gain**: Successful dressage improves horse's dressage skill
- **Equipment Effects**: Horse items can provide bonuses during competitions

#### 3.2 Progression System
- **Competition Levels**: 
  - Training (18+ points to pass)
  - Intermediate (25+ points to pass) 
  - Advanced (35+ points to pass)
  - Championship (40+ points to pass)
- **Unlock Requirements**: Higher levels require horse skill minimums
- **Rewards**: Coins scale with competition level and performance

#### 3.3 Judge System Details
- **Three Judges**: Each with different scoring emphasis
  - Judge 1: Technique (prefers precise combos)
  - Judge 2: Artistry (prefers variety and flow)
  - Judge 3: Boldness (prefers high-risk moves)
- **Final Score**: Average of three judge scores
- **Judge Feedback**: Specific comments based on performance

### Phase 4: Visual & Audio Polish

#### 4.1 Horse Animations
- **Move Execution**: Visual representation of each dressage move
- **Flow Indicators**: Horse movement smoothness reflects flow meter
- **Combo Celebrations**: Special animations for successful combos
- **Finish Sequences**: Graceful halt and salute animations

#### 4.2 Arena Atmosphere
- **Competition Environment**: Crowd sounds, arena ambiance
- **Judge Reactions**: Visual feedback from judges during performance
- **Weather Effects**: Optional weather that affects certain moves
- **Ceremony Elements**: Competition entrance and award presentations

#### 4.3 Audio Integration
- **Move Sound Effects**: Hoof beats, breathing, tack sounds
- **Ambient Music**: Classical/orchestral background music
- **Judge Commentary**: Text-to-speech or pre-recorded feedback
- **Success Sounds**: Reward chimes for combos and achievements

### Phase 5: Advanced Features

#### 5.1 Multiplayer Elements
- **Tournament System**: Bracketed competitions against AI horses
- **Leaderboards**: Best scores for each competition level
- **Ghost Data**: Compete against previous best performances
- **Seasonal Events**: Special themed competitions

#### 5.2 Customization Options
- **Routine Builder**: Pre-plan card sequences (advanced mode)
- **Arena Customization**: Unlock different competition venues
- **Judge Preferences**: Learn and adapt to judge scoring patterns
- **Equipment System**: Dressage-specific gear for bonuses

#### 5.3 Achievement System
- **Dressage Mastery**: Perfect scores, long win streaks, combo achievements
- **Horse Development**: Train horses to championship levels
- **Collection Milestones**: Unlock all venues, judges, equipment
- **Special Unlocks**: Rare horse breeds, legendary equipment, exclusive venues

## Technical Implementation Details

### File Structure
```
src/components1/
├── dressage/
│   ├── DressageArena.js          # Main competition screen
│   ├── DressageHorse.js          # Animated horse display
│   ├── JudgesPanel.js            # Three judges with scoring
│   ├── DressageCard.js           # Enhanced card component
│   ├── DressageGameState.js      # State management wrapper
│   ├── CompetitionSelect.js      # Level selection screen
│   └── ResultsScreen.js          # Post-competition results
└── dressage.js                   # Original prototype (reference)
```

### State Integration Points

#### Main App State Extensions
```javascript
// Add to existing App.js state
const [showDressage, setShowDressage] = useState(false);
const [selectedHorseForDressage, setSelectedHorseForDressage] = useState(null);
const [dressageResults, setDressageResults] = useState([]);
const [horseDressageSkills, setHorseDressageSkills] = useState({});
```

#### Horse Stable Integration
```javascript
// Add to HorseStable.js
const enterDressageCompetition = (horseIndex) => {
  setSelectedHorseForDressage(horseIndex);
  setShowDressage(true);
};
```

### Performance Considerations
- **Component Optimization**: Use React.memo for card components
- **Animation Performance**: CSS transforms over style changes
- **State Updates**: Batch updates during game progression
- **Memory Management**: Clean up intervals and timeouts

### Testing Strategy
- **Unit Tests**: Individual card mechanics and scoring
- **Integration Tests**: Horse skill effects and state persistence
- **User Experience Tests**: Competition flow and difficulty balance
- **Performance Tests**: Animation smoothness and state update efficiency

## Development Priorities

### Must-Have Features (MVP)
1. Basic dressage arena with horse display
2. Working card game mechanics (existing prototype)
3. Judge scoring system
4. Integration with horse selection
5. Basic rewards (coins + experience)

### Should-Have Features
1. Horse skill bonuses and effects
2. Multiple competition levels
3. Enhanced animations and visual feedback
4. Achievement tracking
5. Equipment system integration

### Could-Have Features
1. Tournament modes
2. Seasonal events
3. Advanced customization options
4. Multiplayer elements
5. Voice commentary

## Success Metrics
- **Player Engagement**: Time spent in dressage mode per session
- **Progression Rate**: How quickly players advance through competition levels
- **Retention**: Return rate for dressage competitions
- **Horse Development**: Impact on overall horse care and progression
- **Achievement Completion**: Percentage of dressage-related achievements unlocked

## Future Expansion Opportunities
- **Additional Disciplines**: Show jumping, cross-country, western events
- **International Competitions**: Different venues and judge styles
- **Breeding System**: Genetic traits affecting dressage aptitude
- **Training Modes**: Practice specific moves and combinations
- **Coaching System**: AI assistant providing strategic advice

## Conclusion
This implementation guide provides a comprehensive framework for integrating the dressage card game prototype into the existing horse stable game. The phased approach allows for iterative development and testing while maintaining the core game's stability and user experience. The dressage system should enhance the overall game by providing a new skill-based mini-game that deepens horse care and progression mechanics.