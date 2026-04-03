# 🐙 OCTOPUS INVADERS

A neon-cyberpunk vertical space shooter built with vanilla JavaScript and HTML5 Canvas.

## 🚀 How to Run

The game uses ES Modules, so it must be served via a web server to avoid CORS issues.

1. Open your terminal in the `space-shooter/` directory.
2. Run the following command:
   ```bash
   python3 -m http.server 3031
   ```
3. Open your browser and navigate to: `http://localhost:3031`

## 🎮 Controls

- **Mouse Movement**: Move ship (Smooth LERP tracking)
- **Left Click (Hold)**: Rapid Fire
- **ESC**: Pause (Implementation in progress)

## 🛠️ Project Structure

- `index.html`: Entry point and script dependency loader.
- `css/styles.css`: Fullscreen canvas and UI styling.
- `js/config.js`: Tuning constants for speeds, colors, and enemy stats.
- `js/game.js`: Core loop, collision detection, and state management.
- `js/player.js`: Ship movement, tiers, and unleash mode.
- `js/enemies.js`: Grid-based pixel art octopus rendering and wave logic.
- `js/particles.js`: Explosion, trail, and ink splatter systems.
- `js/background.js`: 4-layer vertical parallax scrolling.
- `js/ui.js`: HUD, Start, and Game Over screens.
- `js/audio.js`: Procedural Web Audio API sound effects.

## 🎨 Visual Style

- **Pixel Art**: All enemies are rendered using grid-based `fillRect` patterns for an authentic retro feel.
- **Cyberpunk Palette**: Neon pinks, cyans, and purples against a dark space background.
- **Feedback**: Screen shake, hit flashes, and floating damage numbers for high-impact gameplay.
