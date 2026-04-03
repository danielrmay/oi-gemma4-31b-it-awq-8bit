/**
 * Enemy system implementing pixel-art octopus aliens.
 * Rendering is grid-based using fillRect to ensure a retro pixelated look.
 */

import CONFIG from './config.js';
import { particles } from './particles.js';
import { audio } from './audio.js';

// Pixel grids for octopus types (1 = filled, 0 = empty)
const GRIDS = {
    SMALL: [
        [0,1,1,0],
        [1,1,1,1],
        [1,1,1,1],
        [1,0,0,1],
        [0,1,1,0],
        [1,0,0,1]
    ],
    MEDIUM: [
        [0,1,1,1,0],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,0,1,0,1],
        [0,1,0,1,0],
        [1,0,1,0,1]
    ],
    BABY: [
        [0,1,0],
        [1,1,1],
        [0,1,0],
        [1,0,1]
    ],
    BOSS: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,0,0,0,0,1,1],
        [1,1,0,0,0,0,1,1],
        [1,1,1,1,1,1,1,1],
        [1,0,1,0,1,0,1,0],
        [0,1,0,1,0,1,0,1],
        [1,0,1,0,1,0,1,0],
        [0,1,0,1,0,1,0,1]
    ]
};

export class Enemy {
    constructor(type, x, y) {
        this.type = type;
        const stats = CONFIG.ENEMIES[type];
        this.size = stats.SIZE;
        this.health = stats.HEALTH;
        this.maxHealth = stats.HEALTH;
        this.speed = stats.SPEED;
        this.score = stats.SCORE;
        this.x = x;
        this.y = y;
        this.hitFlash = 0;
        this.frame = 0;
        this.grid = GRIDS[type];
        this.color = this.getColor();
    }

    getColor() {
        switch(this.type) {
            case 'SMALL': return CONFIG.COLORS.ENEMY_SMALL;
            case 'MEDIUM': return CONFIG.COLORS.ENEMY_MEDIUM;
            case 'BABY': return CONFIG.COLORS.ENEMY_BABY;
            case 'BOSS': return CONFIG.COLORS.ENEMY_BOSS;
            default: return '#FFFFFF';
        }
    }

    update(game) {
        this.frame++;

        // Movement patterns
        if (this.type === 'SMALL') {
            this.y += this.speed;
            this.x += Math.sin(this.frame * CONFIG.ENEMIES.SMALL.SINE_FREQ) * CONFIG.ENEMIES.SMALL.SINE_AMP * 0.05;
        } else {
            this.y += this.speed;
        }

        if (this.hitFlash > 0) this.hitFlash--;
    }

    draw(ctx) {
        const rows = this.grid.length;
        const cols = this.grid[0].length;
        const cellW = this.size / cols;
        const cellH = this.size / rows;

        ctx.fillStyle = this.hitFlash > 0 ? '#FFFFFF' : this.color;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (this.grid[r][c] === 1) {
                    // Simple tentacle animation: toggle bottom row based on frame
                    if (r === rows - 1 && Math.floor(this.frame / 10) % 2 === 0 && this.type !== 'BOSS') {
                        continue;
                    }
                    ctx.fillRect(this.x + c * cellW, this.y + r * cellH, cellW, cellH);
                }
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.hitFlash = 3;
        audio.playHit();
        return this.health <= 0;
    }
}

class EnemyManager {
    constructor() {
        this.enemies = [];
        this.wave = 1;
        this.enemiesKilled = 0;
    }

    spawnWave() {
        const isBossWave = this.wave % CONFIG.ENEMIES.BOSS.APPEAR_INTERVAL === 0;

        if (isBossWave) {
            this.spawnBoss();
        } else {
            const count = 3 + this.wave;
            for (let i = 0; i < count; i++) {
                const type = Math.random() > 0.3 ? 'SMALL' : 'MEDIUM';
                this.enemies.push(new Enemy(type, Math.random() * (window.innerWidth - 50), -50 - (i * 100)));
            }
        }
    }

    spawnBoss() {
        this.enemies.push(new Enemy('BOSS', window.innerWidth / 2 - CONFIG.ENEMIES.BOSS.SIZE / 2, -200));
        audio.playBossWarning();
    }

    update(game) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.update(game);

            if (e.y > window.innerHeight + e.size) {
                this.enemies.splice(i, 1);
            }
        }

        if (this.enemies.length === 0) {
            this.wave++;
            this.spawnWave();
        }
    }

    draw(ctx) {
        for (const e of this.enemies) {
            e.draw(ctx);
        }
    }
}

export const enemyManager = new EnemyManager();
