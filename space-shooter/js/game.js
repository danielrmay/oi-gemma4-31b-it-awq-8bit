/**
 * Main Game Engine.
 * Handles the game loop, state machine, input, and collision detection.
 */

import CONFIG from './config.js';
import { player } from './player.js';
import { enemyManager, Enemy } from './enemies.js';
import { background } from './background.js';
import { particles } from './particles.js';
import { ui } from './ui.js';
import { audio } from './audio.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = 'MENU'; // MENU, PLAYING, GAMEOVER
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        this.bullets = [];
        this.damageNumbers = [];
        this.screenShake = 0;
        this.lastFrameTime = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        window.addEventListener('mousedown', () => {
            this.isMouseDown = true;
            if (this.state === 'MENU') {
                this.start();
            } else if (this.state === 'GAMEOVER') {
                this.restart();
            }
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Simple pause could be added here
            }
        });

        this.ctx.imageSmoothingEnabled = false;
        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        this.state = 'PLAYING';
        audio.resume();
        audio.startBGM();
        enemyManager.spawnWave();
    }

    restart() {
        player.health = CONFIG.PLAYER.START_HEALTH;
        player.tier = 1;
        ui.score = 0;
        ui.level = 1;
        ui.combo = 0;
        this.bullets = [];
        this.damageNumbers = [];
        enemyManager.enemies = [];
        enemyManager.wave = 1;
        this.state = 'PLAYING';
        audio.resume();
        audio.startBGM();
        enemyManager.spawnWave();
    }

    spawnBullet() {
        const now = performance.now();
        if (now - player.lastShot < CONFIG.PLAYER.FIRE_RATE) return;

        const speed = this.getBulletSpeed();
        const color = this.getBulletColor();

        // Tier-based spread
        const spreads = {
            1: [0],
            2: [-0.1, 0.1],
            3: [-0.2, 0, 0.2],
            4: [-0.3, -0.1, 0.1, 0.3]
        };

        const currentSpreads = spreads[player.tier] || [0];

        currentSpreads.forEach(angle => {
            this.bullets.push({
                x: player.x,
                y: player.y - 20,
                vx: Math.sin(angle) * speed,
                vy: -Math.cos(angle) * speed,
                color: color,
                radius: CONFIG.BULLETS.WIDTH
            });
        });

        player.lastShot = now;
        audio.playLaser();
    }

    getBulletSpeed() {
        if (player.tier === 1) return CONFIG.BULLETS.TIER_1_SPEED;
        if (player.tier === 2) return CONFIG.BULLETS.TIER_2_SPEED;
        if (player.tier === 3) return CONFIG.BULLETS.TIER_3_SPEED;
        return CONFIG.BULLETS.TIER_4_SPEED;
    }

    getBulletColor() {
        if (player.unleashTime > 0) return '#FFFFFF';
        if (player.tier === 1) return CONFIG.COLORS.BULLET_CYAN;
        if (player.tier === 2) return CONFIG.COLORS.BULLET_GREEN;
        if (player.tier === 3) return CONFIG.COLORS.BULLET_GOLD;
        return CONFIG.COLORS.BULLET_WHITE;
    }

    update(deltaTime) {
        if (this.state !== 'PLAYING') return;

        player.update(this.mouseX, this.mouseY, deltaTime);
        enemyManager.update(this);
        
        // Sync wave to UI level
        ui.level = enemyManager.wave;
        
        background.update(this.mouseX, this.mouseY);
        particles.update();

        if (this.isMouseDown) {
            this.spawnBullet();
        }

        // Update Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx;
            b.y += b.vy;

            // Bullet trails
            particles.bulletTrail(b.x, b.y, b.color);

            if (b.y < -20 || b.x < -20 || b.x > this.canvas.width + 20) {
                this.bullets.splice(i, 1);
                continue;
            }

            // Collision: Bullet vs Enemy
            for (let j = enemyManager.enemies.length - 1; j >= 0; j--) {
                const e = enemyManager.enemies[j];
                const dx = b.x - (e.x + e.size / 2);
                const dy = b.y - (e.y + e.size / 2);
                const distSq = dx * dx + dy * dy;
                const rSum = b.radius + (e.size / 2);

                if (distSq < rSum * rSum) {
                    const damage = player.unleashTime > 0 ? 100 : 20;
                    const dead = e.takeDamage(damage);

                    particles.sparks(b.x, b.y);
                    this.spawnDamageNumber(e.x + e.size / 2, e.y, damage);

                    this.bullets.splice(i, 1);
                    if (dead) {
                        ui.score += e.score * (player.unleashTime > 0 ? 3 : 1);
                        ui.combo++;
                        particles.explode(e.x + e.size / 2, e.y + e.size / 2, e.color);
                        particles.splatter(e.x + e.size / 2, e.y + e.size / 2, e.color);

                        if (e.type === 'MEDIUM') {
                            // Split into babies
                            this.spawnBaby(e.x, e.y);
                            this.spawnBaby(e.x + e.size, e.y);
                        }

                        if (e.type === 'BOSS' || Math.random() > 0.9) {
                            this.spawnPowerup(e.x + e.size / 2, e.y + e.size / 2);
                        }

                        enemyManager.enemies.splice(j, 1);
                    }
                    break;
                }
            }
        }

        // Collision: Player vs Enemy
        for (const e of enemyManager.enemies) {
            const dx = player.x - (e.x + e.size / 2);
            const dy = player.y - (e.y + e.size / 2);
            const distSq = dx * dx + dy * dy;
            const rSum = player.radius + (e.size / 2) + CONFIG.PLAYER.DAMAGE_BUFFER;

        if (distSq < rSum * rSum) {
            if (player.takeDamage(1)) {
                this.state = 'GAMEOVER';
                audio.stopBGM();
                particles.explode(player.x, player.y, CONFIG.COLORS.PLAYER_GLOW, 50, 5);
            }
            this.screenShake = 10;
            ui.combo = 0;
        }
        }

        // Collision: Player vs Powerup
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            if (!b.isPowerup) continue;

            const dx = player.x - b.x;
            const dy = player.y - b.y;
            const distSq = dx * dx + dy * dy;
            const rSum = player.radius + b.radius;

            if (distSq < rSum * rSum) {
                player.collectPowerup();
                this.bullets.splice(i, 1);
            }
        }

        // Update Damage Numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dn = this.damageNumbers[i];
            dn.y -= 0.5;
            dn.life--;
            if (dn.life <= 0) this.damageNumbers.splice(i, 1);
        }
    }

    spawnBaby(x, y) {
        enemyManager.enemies.push(new Enemy('BABY', x, y));
    }

    spawnPowerup(x, y) {
        this.bullets.push({
            x, y, vx: 0, vy: 1, color: '#FFFFFF', radius: 10, isPowerup: true
        });
    }

    spawnDamageNumber(x, y, amount) {
        this.damageNumbers.push({ x, y, amount, life: 60 });
    }

    draw(deltaTime) {
        this.ctx.fillStyle = CONFIG.COLORS.BG;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        if (this.screenShake > 0) {
            this.ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
            this.screenShake *= 0.9;
        }

        background.draw(this.ctx, this.mouseX, this.mouseY);
        enemyManager.draw(this.ctx);

        // Draw bullets
        for (const b of this.bullets) {
            if (b.isPowerup) {
                const time = performance.now() * 0.005;
                const glowSize = 12 + Math.sin(time) * 4;
                
                this.ctx.save();
                this.ctx.translate(b.x, b.y);
                
                // Outer glow
                const grad = this.ctx.createRadialGradient(0, 0, 2, 0, 0, glowSize);
                grad.addColorStop(0, '#FFFFFF');
                grad.addColorStop(0.4, '#FFFF00');
                grad.addColorStop(1, 'transparent');
                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Core
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Rotating rings
                this.ctx.strokeStyle = '#FFFF00';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, 10, 4, time, 0, Math.PI * 2);
                this.ctx.stroke();
                
                this.ctx.restore();
            } else {
                this.ctx.fillStyle = b.color;
                this.ctx.fillRect(b.x - b.radius / 2, b.y - CONFIG.BULLETS.HEIGHT / 2, b.radius, CONFIG.BULLETS.HEIGHT);
            }
        }

        player.draw(this.ctx);
        particles.draw(this.ctx);

        // Damage numbers
        this.ctx.fillStyle = CONFIG.COLORS.DAMAGE_NUM;
        this.ctx.font = '16px monospace';
        for (const dn of this.damageNumbers) {
            this.ctx.globalAlpha = dn.life / 60;
            this.ctx.fillText(`-${dn.amount}`, dn.x, dn.y);
        }
        this.ctx.globalAlpha = 1.0;

        this.ctx.restore();

        if (this.state === 'MENU') {
            ui.drawStartScreen(this.ctx);
        } else if (this.state === 'PLAYING') {
            ui.drawHUD(this.ctx, player);
        } else if (this.state === 'GAMEOVER') {
            ui.drawGameOver(this.ctx, ui.score, ui.level);
        }
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        this.update(deltaTime);
        this.draw(deltaTime);

        requestAnimationFrame((t) => this.loop(t));
    }
}

new Game();
