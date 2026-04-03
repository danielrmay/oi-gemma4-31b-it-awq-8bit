/**
 * UI System for HUD, Menu screens, and Game Over.
 * Uses monospace font and a clean layout.
 */

import CONFIG from './config.js';

class UI {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.combo = 0;
    }

    drawHUD(ctx, player) {
        ctx.fillStyle = CONFIG.COLORS.TEXT_HUD;
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.score}`, 20, 40);

        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL: ${this.level}`, window.innerWidth / 2, 40);

        ctx.textAlign = 'right';
        ctx.fillText(`COMBO: x${this.combo}`, window.innerWidth - 20, 40);

        // Health Bar
        const barWidth = 200;
        const barHeight = 20;
        const x = window.innerWidth / 2 - barWidth / 2;
        const y = window.innerHeight - 50;

        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);

        const healthPerc = player.health / player.maxHealth;
        ctx.fillStyle = healthPerc > 0.3 ? '#00FF00' : '#FF0000';
        ctx.fillRect(x, y, barWidth * healthPerc, barHeight);

        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    drawStartScreen(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        ctx.fillStyle = CONFIG.COLORS.PLAYER_GLOW;
        ctx.font = '60px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OCTOPUS INVADERS', window.innerWidth / 2, window.innerHeight / 2 - 40);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px monospace';
        ctx.fillText('CLICK TO START', window.innerWidth / 2, window.innerHeight / 2 + 40);
    }

    drawGameOver(ctx, finalScore, level) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        ctx.fillStyle = '#FF0000';
        ctx.font = '60px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', window.innerWidth / 2, window.innerHeight / 2 - 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px monospace';
        ctx.fillText(`FINAL SCORE: ${finalScore}`, window.innerWidth / 2, window.innerHeight / 2);
        ctx.fillText(`LEVEL REACHED: ${level}`, window.innerWidth / 2, window.innerHeight / 2 + 30);
        ctx.fillText('CLICK TO RESTART', window.innerWidth / 2, window.innerHeight / 2 + 80);
    }
}

export const ui = new UI();
