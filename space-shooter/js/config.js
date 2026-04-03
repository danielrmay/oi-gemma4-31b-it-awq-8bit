/**
 * Configuration constants for Octopus Invaders.
 * Tune these values to adjust game balance and feel.
 */

const CONFIG = {
    // Visuals
    COLORS: {
        BG: '#0D1117',
        PLAYER_GLOW: '#4ECDC4',
        PLAYER_BODY: '#2F3E46',
        ENEMY_SMALL: '#FF007F', // Neon Pink
        ENEMY_MEDIUM: '#00FFFF', // Electric Blue
        ENEMY_BABY: '#00FFFF',   // Cyan
        ENEMY_BOSS: '#BF00FF',   // Glowing Purple
        BULLET_CYAN: '#00FFFF',
        BULLET_GREEN: '#00FF00',
        BULLET_GOLD: '#FFD700',
        BULLET_WHITE: '#FFFFFF',
        PARTICLE_SPARK: '#FFFF00',
        UNLEASH_RING: '#00FF00',
        TEXT_HUD: '#FFFFFF',
        DAMAGE_NUM: '#FFFF00'
    },

    // Player
    PLAYER: {
        RADIUS: 20,
        LERP_FACTOR: 0.35,
        MAX_HEALTH: 100,
        START_HEALTH: 100,
        DAMAGE_BUFFER: 30,
        UPGRADE_INTERVAL: 3, // Every 3 levels
        FIRE_RATE: 150, // ms between shots
    },

    // Bullets
    BULLETS: {
        TIER_1_SPEED: 8,
        TIER_2_SPEED: 10,
        TIER_3_SPEED: 12,
        TIER_4_SPEED: 14,
        WIDTH: 4,
        HEIGHT: 12
    },

    // Enemies
    ENEMIES: {
        SMALL: {
            SIZE: 36,
            HEALTH: 20,
            SPEED: 2,
            SCORE: 100,
            SINE_AMP: 50,
            SINE_FREQ: 0.05
        },
        MEDIUM: {
            SIZE: 48,
            HEALTH: 50,
            SPEED: 1.5,
            SCORE: 250,
        },
        BABY: {
            SIZE: 20,
            HEALTH: 10,
            SPEED: 3,
            SCORE: 50,
        },
        BOSS: {
            SIZE: 150,
            HEALTH: 200,
            SPEED: 0.8,
            SCORE: 5000,
            APPEAR_INTERVAL: 5 // Every 5 levels
        }
    },

    // Gameplay
    GAME: {
        UNLEASH_DURATION: 5000, // ms
        COMBO_TIMEOUT: 2000, // ms
        LEVEL_UP_THRESHOLD: 1000, // enemies killed per level
        SCREEN_SHAKE_INTENSITY: 5
    }
};

export default CONFIG;
