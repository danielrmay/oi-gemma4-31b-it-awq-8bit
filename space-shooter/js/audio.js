/**
 * Audio system using Web Audio API for procedural sound effects.
 * No external assets are used; all sounds are generated via oscillators and noise.
 */

import CONFIG from './config.js';

class AudioSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3;
        this.bgmOsc = null;
        this.bgmGain = null;
    }

    startBGM() {
        if (this.bgmOsc) return;

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.1;
        this.bgmGain.connect(this.masterGain);

        const loop = () => {
            const now = this.ctx.currentTime;
            const melody = [
                { f: 110, d: 0.25 }, { f: 110, d: 0.25 }, { f: 146, d: 0.25 }, { f: 164, d: 0.25 },
                { f: 110, d: 0.25 }, { f: 110, d: 0.25 }, { f: 130, d: 0.5 },
                { f: 110, d: 0.25 }, { f: 110, d: 0.25 }, { f: 146, d: 0.25 }, { f: 164, d: 0.25 },
                { f: 110, d: 0.25 }, { f: 110, d: 0.25 }, { f: 123, d: 0.5 },
            ];

            let offset = 0;
            melody.forEach(note => {
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(note.f, now + offset);
                g.gain.setValueAtTime(0, now + offset);
                g.gain.linearRampToValueAtTime(0.1, now + offset + 0.01);
                g.gain.exponentialRampToValueAtTime(0.01, now + offset + note.d);
                osc.connect(g);
                g.connect(this.bgmGain);
                osc.start(now + offset);
                osc.stop(now + offset + note.d);
                offset += note.d;
            });

            this.bgmTimeout = setTimeout(loop, offset * 1000);
        };
        loop();
    }

    stopBGM() {
        clearTimeout(this.bgmTimeout);
        if (this.bgmGain) {
            this.bgmGain.disconnect();
            this.bgmGain = null;
        }
    }


    /**
     * Resumes AudioContext if it was suspended (browser requirement for user interaction)
     */
    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Procedural Laser Sound: Short oscillator sweep from high to low frequency
     */
    playLaser() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    /**
     * Procedural Explosion: Noise burst combined with a low-frequency rumble
     */
    playExplosion(size = 'small') {
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';

        const noiseGain = this.ctx.createGain();

        // Adjust parameters based on enemy size
        const duration = size === 'boss' ? 0.8 : size === 'medium' ? 0.3 : 0.15;
        const freq = size === 'boss' ? 100 : size === 'medium' ? 300 : 600;

        noiseFilter.frequency.setValueAtTime(freq, this.ctx.currentTime);
        noiseGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start();
        noise.stop(this.ctx.currentTime + duration);
    }

    /**
     * Procedural Hit Sound: Very short high-frequency noise burst
     */
    playHit() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    /**
     * Powerup Collect: Ascending tonal sweep
     */
    playPowerup() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    /**
     * Unleash Mode: Low frequency bass drone
     */
    playUnleashDrone() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();

        // Return the oscillator and gain to allow stopping it later
        return { osc, gain };
    }

    /**
     * Boss Warning: Pulsing alarm
     */
    playBossWarning() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(330, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }
}

// Export a singleton instance
export const audio = new AudioSystem();
