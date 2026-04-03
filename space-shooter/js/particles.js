/**
 * Particle system for visual effects including explosions, engine trails,
 * bullet trails, and hit sparks.
 */

import CONFIG from './config.js';

class Particle {
    constructor(x, y, color, vx, vy, life, size = 2) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = this.life / this.maxLife;
    }

    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    /**
     * General purpose spawn method
     */
    spawn(x, y, color, vx, vy, life, size) {
        this.particles.push(new Particle(x, y, color, vx, vy, life, size));
    }

    /**
     * Explosion: Green core burst + scattered colored particles
     */
    explode(x, y, color, count = 20, intensity = 2) {
        // Core burst (green)
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * intensity;
            this.spawn(x, y, '#00FF00', Math.cos(angle) * speed, Math.sin(angle) * speed, 20 + Math.random() * 20, 3);
        }
        // Colored debris
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * intensity * 2;
            this.spawn(x, y, color, Math.cos(angle) * speed, Math.sin(angle) * speed, 30 + Math.random() * 30, 2);
        }
    }

    /**
     * Ink Splatter: Spawned on octopus death
     */
    splatter(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3;
            this.spawn(x, y, color, Math.cos(angle) * speed, Math.sin(angle) * speed, 40 + Math.random() * 20, 4 + Math.random() * 4);
        }
    }

    /**
     * Hit Sparks: White/Yellow short lived particles
     */
    sparks(x, y) {
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4;
            const color = Math.random() > 0.5 ? CONFIG.COLORS.PARTICLE_SPARK : '#FFFFFF';
            this.spawn(x, y, color, Math.cos(angle) * speed, Math.sin(angle) * speed, 10 + Math.random() * 10, 2);
        }
    }

    /**
     * Engine Trail: Small orange-yellow particles
     */
    engineTrail(x, y) {
        const color = Math.random() > 0.5 ? '#FFCC00' : '#FF6600';
        this.spawn(x, y, color, (Math.random() - 0.5) * 1, Math.random() * 2 + 1, 10 + Math.random() * 10, 2);
    }

    /**
     * Bullet Trail: Tiny particles matching bullet color
     */
    bulletTrail(x, y, color) {
        this.spawn(x, y, color, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 5 + Math.random() * 5, 1);
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }
}

export const particles = new ParticleSystem();
