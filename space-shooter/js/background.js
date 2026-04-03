/**
 * Background system implementing 4-layer vertical parallax scrolling.
 * Layers move downward (positive Y) and react to mouse movement.
 */

import CONFIG from './config.js';

class BackgroundLayer {
    constructor(count, speed, sizeRange, color, isPlanet = false) {
        this.elements = [];
        this.count = count;
        this.speed = speed;
        this.sizeRange = sizeRange;
        this.color = color;
        this.isPlanet = isPlanet;

        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            this.elements.push(this.createElement());
        }
    }

    createElement() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: this.sizeRange[0] + Math.random() * (this.sizeRange[1] - this.sizeRange[0]),
            opacity: this.isPlanet ? (Math.random() > 0.7 ? 1.0 : 0.4) : 0.5 + Math.random() * 0.5,
            speedMod: 0.8 + Math.random() * 0.4
        };
    }

    update(mouseX, mouseY) {
        const offsetX = (mouseX - window.innerWidth / 2) * this.speed * 0.01;
        const offsetY = (mouseY - window.innerHeight / 2) * this.speed * 0.01;

        for (const el of this.elements) {
            el.y += this.speed * el.speedMod;

            // Wrap around bottom
            if (el.y > window.innerHeight + el.size) {
                el.y = -el.size;
                el.x = Math.random() * window.innerWidth;
            }
        }
    }

    draw(ctx, mouseX, mouseY) {
        const offsetX = (mouseX - window.innerWidth / 2) * this.speed * 0.05;
        const offsetY = (mouseY - window.innerHeight / 2) * this.speed * 0.05;

        ctx.fillStyle = this.color;
        for (const el of this.elements) {
            ctx.globalAlpha = el.opacity;
            if (this.isPlanet) {
                ctx.beginPath();
                ctx.arc(el.x + offsetX, el.y + offsetY, el.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(el.x + offsetX, el.y + offsetY, el.size, el.size);
            }
        }
        ctx.globalAlpha = 1.0;
    }
}

class Background {
    constructor() {
        this.layers = [
            // Stars: Far, slow, tiny
            new BackgroundLayer(100, 0.2, [1, 2], '#FFFFFF'),
            // Nebula/Far Planets: Medium, dim
            new BackgroundLayer(10, 0.5, [20, 40], '#4B0082', true),
            // Mid Planets: Faster, brighter
            new BackgroundLayer(5, 1.2, [60, 100], '#1E90FF', true),
            // Comets: Occasional streaks
            new BackgroundLayer(2, 3.0, [2, 2], '#FFFFFF')
        ];
    }

    update(mouseX, mouseY) {
        for (const layer of this.layers) {
            layer.update(mouseX, mouseY);
        }
    }

    draw(ctx, mouseX, mouseY) {
        for (const layer of this.layers) {
            layer.draw(ctx, mouseX, mouseY);
        }
    }
}

export const background = new Background();
