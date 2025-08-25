# Dream System Usage Example

## How to Use the Horse Dream System

### 1. Basic Flow
1. Horse energy drops below 25 (horse is sleeping)
2. Dream bubble appears above the horse after 1-4 seconds
3. User clicks the dream bubble
4. Dream modal opens showing the horse's generated dream
5. Dream plays like a video with different phases (intro, action, climax, outro)
6. Modal automatically closes when dream ends

### 2. Adding Dream Setting Images
To add custom dream backgrounds:

1. Place images in `src/dreams/assets/settings/`
2. Supported formats: `.png`, `.jpg`, `.jpeg`
3. Recommended resolution: 1280x720 or higher
4. Example filenames:
   - `beach.png` - Beach scene
   - `forest.jpg` - Magical forest
   - `meadow.png` - Sunny meadow
   - `mountains.jpg` - Mountain vista

### 3. Dream Components
Each dream is composed of:
- **Subject**: Horse(s) from your game
- **Setting**: Background scene (from your images or CSS gradients)
- **Action**: What the horse does (running, flying, dancing, etc.)
- **Mood**: Emotional tone with visual filters (happy, peaceful, magical, etc.)

### 4. Visual Effects
- **Happy dreams**: Bright sparkly filter with animated sparkles
- **Peaceful dreams**: Soft blur with desaturated colors
- **Magical dreams**: Hue-shifted colors with magical overlay
- **Adventurous dreams**: High contrast and saturation
- **Nostalgic dreams**: Sepia tone with soft brightness

### 5. Dream Actions
- **Running**: Horse moves back and forth across the scene
- **Flying**: Horse gently floats up and down
- **Dancing**: Horse rotates and scales rhythmically
- **Galloping**: Similar to running but more energetic
- **Playing**: General happy movement patterns

### 6. Integration Notes
The system is fully integrated with the HorseStable component and will:
- Only show dream bubbles for horses with energy < 25
- Use existing horse images from `/public/horses/` directory
- Automatically load any dream setting images you add
- Fall back to beautiful CSS gradients if no custom images are available

Enjoy experimenting with your horses' dreams! 🐎✨