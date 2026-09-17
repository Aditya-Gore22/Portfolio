import React, { useRef, useEffect, useState } from 'react';
import './TakeABreakGame.css';
import { FaHeart, FaRegHeart, FaPause, FaPlay, FaRedo, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { apiUrl } from '../utils/api';

// Web Audio API synthesizer for retro 8-bit sounds (Zero external libraries)
class RetroAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playTone(freq, type, duration, targetFreq = null) {
    if (this.muted || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (targetFreq) {
        osc.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  jump() {
    this.playTone(180, 'square', 0.12, 620);
  }

  coin() {
    this.playTone(987, 'sine', 0.08);
    setTimeout(() => this.playTone(1318, 'sine', 0.12), 65);
  }

  code() {
    this.playTone(523, 'triangle', 0.05);
    setTimeout(() => this.playTone(659, 'triangle', 0.05), 50);
    setTimeout(() => this.playTone(783, 'triangle', 0.05), 100);
    setTimeout(() => this.playTone(1046, 'triangle', 0.15), 150);
  }

  stomp() {
    this.playTone(320, 'sawtooth', 0.15, 60);
  }

  hurt() {
    this.playTone(160, 'sawtooth', 0.25, 40);
  }

  win() {
    [523, 659, 783, 1046, 1318].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.18), i * 100);
    });
  }
}

const audio = new RetroAudio();

// ==========================================
// HIGH-DEFINITION PIXEL-ART RENDERERS
// ==========================================

// 1. Draw Ultra-Detailed Male Hero (Aditya)
function drawMaleHero(ctx, p, tick) {
  const isDucking = p.isDucking;
  const isJumping = !p.grounded;
  const isRunning = Math.abs(p.vx) > 0.2 && p.grounded;

  const legCycle = isRunning ? Math.sin(p.animFrame) : 0;
  const armCycle = isRunning ? Math.sin(p.animFrame) : 0;
  const bobY = isRunning ? Math.abs(Math.sin(p.animFrame * 2)) * 2 : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 29, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Backpack with Straps & Buckles
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(-17, -18 + (isDucking ? 7 : 0) + bobY, 9, 23);
  ctx.fillStyle = '#0f172a'; // Outline
  ctx.strokeRect(-17, -18 + (isDucking ? 7 : 0) + bobY, 9, 23);
  ctx.fillStyle = '#d97706'; // Straps
  ctx.fillRect(-9, -15 + (isDucking ? 7 : 0) + bobY, 3, 17);
  ctx.fillStyle = '#fcd34d'; // Buckle
  ctx.fillRect(-9, -8 + (isDucking ? 7 : 0) + bobY, 3, 2);
  ctx.fillStyle = '#38bdf8'; // Cyan patch
  ctx.fillRect(-16, -6 + (isDucking ? 7 : 0) + bobY, 6, 6);

  // 2. Open Blue Cyber Hoodie & Torso
  ctx.fillStyle = '#1d4ed8'; // Dark fold
  ctx.fillRect(-11, -19 + (isDucking ? 8 : 0) + bobY, 20, isDucking ? 15 : 23);
  ctx.fillStyle = '#2563eb'; // Main blue
  ctx.fillRect(-9, -18 + (isDucking ? 8 : 0) + bobY, 17, isDucking ? 14 : 22);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.strokeRect(-11, -19 + (isDucking ? 8 : 0) + bobY, 20, isDucking ? 15 : 23);

  // Inner White Tee & Cyan Insignia
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-2, -16 + (isDucking ? 8 : 0) + bobY, 7, 13);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-1, -13 + (isDucking ? 8 : 0) + bobY, 4, 4);

  // 3. Head & Detailed Face
  const headY = (isDucking ? -18 : -29) + bobY;
  ctx.fillStyle = '#fed7aa'; // Base skin
  ctx.fillRect(-8, headY, 16, 14);
  ctx.fillStyle = '#ffedd5'; // Cheek highlight
  ctx.fillRect(-4, headY + 5, 8, 5);

  // Expressive Eye (Dark iris + pupil + white sparkle)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(2, headY + 4, 4, 5);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(4, headY + 4, 2, 2); // Glint
  // Brow & Smile
  ctx.fillStyle = '#451a03';
  ctx.fillRect(1, headY + 2, 6, 1);
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(3, headY + 11, 3, 1);

  // 4. Layered Anime Brown Hair
  ctx.fillStyle = '#291003'; // Deep shadow
  ctx.fillRect(-11, headY - 5, 20, 9);
  ctx.fillRect(-11, headY - 1, 6, 11);
  ctx.fillStyle = '#592708'; // Main hair
  ctx.fillRect(-10, headY - 4, 18, 8);
  ctx.fillRect(-10, headY, 4, 8);
  // Hair Spikes & Bangs
  ctx.fillRect(2, headY, 5, 3);
  ctx.fillRect(-3, headY - 1, 4, 4);
  // Sunlit highlight streak
  ctx.fillStyle = '#92400e';
  ctx.fillRect(-6, headY - 4, 12, 2);

  // 5. Arms & Hands
  ctx.fillStyle = '#2563eb'; // Sleeve
  ctx.fillRect(-4 + armCycle * 6, -14 + (isDucking ? 8 : 0) + bobY, 6, 13);
  ctx.fillStyle = '#0f172a'; // Navy wristband
  ctx.fillRect(-3 + armCycle * 6, -2 + (isDucking ? 8 : 0) + bobY, 5, 2);
  ctx.fillStyle = '#fed7aa'; // Clenched fist
  ctx.fillRect(-3 + armCycle * 6, 0 + (isDucking ? 8 : 0) + bobY, 5, 5);

  // 6. Denim Jeans
  ctx.fillStyle = '#1e293b'; // Denim base
  if (isJumping) {
    ctx.fillRect(-8, 5, 7, 10);
    ctx.fillRect(1, 3, 7, 10);
  } else if (isDucking) {
    ctx.fillRect(-10, 5, 10, 8);
    ctx.fillRect(0, 5, 10, 8);
  } else {
    // Dynamic run stride
    ctx.fillRect(-8 - legCycle * 7, 5 + bobY, 6, 15);
    ctx.fillRect(2 + legCycle * 7, 5 + bobY, 6, 15);
    // Jean highlight folds
    ctx.fillStyle = '#334155';
    ctx.fillRect(-7 - legCycle * 7, 8 + bobY, 4, 5);
    ctx.fillRect(3 + legCycle * 7, 8 + bobY, 4, 5);
  }

  // 7. Red High-Top Sneakers
  ctx.fillStyle = '#ef4444'; // Red canvas
  if (isJumping) {
    ctx.fillRect(-8, 15, 8, 6);
    ctx.fillRect(2, 13, 8, 6);
    ctx.fillStyle = '#ffffff'; // White toe cap & sole
    ctx.fillRect(-4, 15, 4, 3);
    ctx.fillRect(6, 13, 4, 3);
    ctx.fillRect(-8, 19, 8, 2);
    ctx.fillRect(2, 17, 8, 2);
  } else if (isDucking) {
    ctx.fillRect(-12, 11, 10, 5);
    ctx.fillRect(2, 11, 10, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, 11, 4, 3);
    ctx.fillRect(8, 11, 4, 3);
    ctx.fillRect(-12, 15, 10, 2);
    ctx.fillRect(2, 15, 10, 2);
  } else {
    const lx = -9 - legCycle * 7;
    const rx = 1 + legCycle * 7;
    const sy = 19 + bobY;
    // Left shoe
    ctx.fillRect(lx, sy, 9, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(lx + 5, sy, 4, 3); // White toe cap
    ctx.fillRect(lx, sy + 4, 9, 2); // Sole
    // Right shoe
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(rx, sy, 9, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx + 5, sy, 4, 3); // White toe cap
    ctx.fillRect(rx, sy + 4, 9, 2); // Sole
  }
}

// 2. Draw Ultra-Detailed Female Hero (Maya)
function drawFemaleHero(ctx, p, tick) {
  const isDucking = p.isDucking;
  const isJumping = !p.grounded;
  const isRunning = Math.abs(p.vx) > 0.2 && p.grounded;

  const legCycle = isRunning ? Math.sin(p.animFrame) : 0;
  const armCycle = isRunning ? Math.sin(p.animFrame) : 0;
  const bobY = isRunning ? Math.abs(Math.sin(p.animFrame * 2)) * 2 : 0;
  const hairSway = isRunning ? -Math.sin(p.animFrame) * 6 : Math.sin(tick * 0.1) * 3;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 29, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Cross-Body Cyber Sling & Pouch
  ctx.fillStyle = '#4a044e';
  ctx.fillRect(-16, -18 + (isDucking ? 7 : 0) + bobY, 8, 22);
  ctx.fillStyle = '#ec4899'; // Neon strap
  ctx.fillRect(-9, -15 + (isDucking ? 7 : 0) + bobY, 3, 16);
  ctx.fillStyle = '#06b6d4'; // Glowing data LED
  ctx.fillRect(-15, -6 + (isDucking ? 7 : 0) + bobY, 3, 3);

  // 2. Cyberpunk Magenta Bomber Jacket
  ctx.fillStyle = '#7e22ce'; // Deep violet shadow
  ctx.fillRect(-10, -19 + (isDucking ? 8 : 0) + bobY, 19, isDucking ? 15 : 23);
  ctx.fillStyle = '#9333ea'; // Main violet
  ctx.fillRect(-8, -18 + (isDucking ? 8 : 0) + bobY, 16, isDucking ? 14 : 22);
  ctx.strokeStyle = '#3b0764';
  ctx.lineWidth = 1;
  ctx.strokeRect(-10, -19 + (isDucking ? 8 : 0) + bobY, 19, isDucking ? 15 : 23);

  // Neon Pink Collar & Accent
  ctx.fillStyle = '#ec4899';
  ctx.fillRect(-6, -18 + (isDucking ? 8 : 0) + bobY, 12, 3);

  // Black Inner Cyber Top & Cyan Power Core
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-2, -15 + (isDucking ? 8 : 0) + bobY, 6, 12);
  ctx.fillStyle = '#06b6d4';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 4;
  ctx.fillRect(-1, -12 + (isDucking ? 8 : 0) + bobY, 4, 4);
  ctx.shadowBlur = 0;

  // 3. Head, Face & Blush
  const headY = (isDucking ? -18 : -29) + bobY;
  ctx.fillStyle = '#fed7aa'; // Skin
  ctx.fillRect(-8, headY, 16, 14);
  ctx.fillStyle = '#f472b6'; // Cute pink blush
  ctx.fillRect(0, headY + 8, 4, 2);

  // Expressive Cyber Eyes (Turquoise pupil + white glint + lash)
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(2, headY + 4, 4, 5);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(2, headY + 3, 5, 2); // Eyelash
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(4, headY + 5, 2, 2); // Glint
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(3, headY + 11, 3, 1); // Lips

  // 4. Flowing Violet Ponytail & Cyber Clip
  ctx.fillStyle = '#3b0764'; // Hair shadow
  ctx.fillRect(-11, headY - 5, 19, 9);
  ctx.fillRect(-11, headY - 1, 5, 10);
  ctx.fillStyle = '#6b21a8'; // Main purple
  ctx.fillRect(-10, headY - 4, 17, 8);
  ctx.fillStyle = '#a855f7'; // Bangs highlight
  ctx.fillRect(-4, headY - 4, 10, 3);

  // High Ponytail Flowing Behind
  ctx.fillStyle = '#7e22ce';
  ctx.fillRect(-15 + hairSway, headY - 2, 7, 16);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(-14 + hairSway, headY + 6, 5, 10);

  // Glowing Cyan Cyber Barrette / Headset
  ctx.fillStyle = '#06b6d4';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 6;
  ctx.fillRect(-5, headY - 2, 4, 4);
  ctx.shadowBlur = 0;

  // 5. Arms & Hands
  ctx.fillStyle = '#9333ea'; // Sleeve
  ctx.fillRect(-4 + armCycle * 6, -14 + (isDucking ? 8 : 0) + bobY, 6, 12);
  ctx.fillStyle = '#06b6d4'; // Cyan wrist comm-link
  ctx.fillRect(-3 + armCycle * 6, -2 + (isDucking ? 8 : 0) + bobY, 5, 2);
  ctx.fillStyle = '#fed7aa'; // Hand
  ctx.fillRect(-3 + armCycle * 6, 0 + (isDucking ? 8 : 0) + bobY, 5, 5);

  // 6. Tactical Dark Leggings with Neon Cyan Stripe
  ctx.fillStyle = '#0f172a';
  if (isJumping) {
    ctx.fillRect(-8, 5, 7, 10);
    ctx.fillRect(1, 3, 7, 10);
    ctx.fillStyle = '#06b6d4'; // Stripe
    ctx.fillRect(-8, 5, 2, 10);
    ctx.fillRect(6, 3, 2, 10);
  } else if (isDucking) {
    ctx.fillRect(-10, 5, 10, 8);
    ctx.fillRect(0, 5, 10, 8);
  } else {
    ctx.fillRect(-8 - legCycle * 7, 5 + bobY, 6, 15);
    ctx.fillRect(2 + legCycle * 7, 5 + bobY, 6, 15);
    // Neon side stripe
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-8 - legCycle * 7, 5 + bobY, 2, 15);
    ctx.fillRect(6 + legCycle * 7, 5 + bobY, 2, 15);
  }

  // 7. Cyan & Magenta High-Tech Sneakers
  ctx.fillStyle = '#06b6d4'; // Cyan base
  if (isJumping) {
    ctx.fillRect(-8, 15, 8, 6);
    ctx.fillRect(2, 13, 8, 6);
    ctx.fillStyle = '#ec4899'; // Magenta heel & sole
    ctx.fillRect(-8, 19, 8, 2);
    ctx.fillRect(2, 17, 8, 2);
  } else if (isDucking) {
    ctx.fillRect(-12, 11, 10, 5);
    ctx.fillRect(2, 11, 10, 5);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(-12, 15, 10, 2);
    ctx.fillRect(2, 15, 10, 2);
  } else {
    const lx = -9 - legCycle * 7;
    const rx = 1 + legCycle * 7;
    const sy = 19 + bobY;
    // Left kick
    ctx.fillRect(lx, sy, 9, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(lx + 5, sy, 4, 3); // White toe
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(lx, sy + 4, 9, 2); // Pink sole
    // Right kick
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(rx, sy, 9, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx + 5, sy, 4, 3);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(rx, sy + 4, 9, 2);
  }
}

// 3. Draw Ultra-Detailed Animated Red Bug
function drawDetailedBug(ctx, bug, tick) {
  const bx = bug.x;
  const by = bug.y;

  ctx.save();

  if (!bug.alive) {
    // Flattened pancake squashed animation
    if (bug.squashedTimer > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(bx + bug.w / 2, by + bug.h - 4, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(bx + bug.w / 2 - 10, by + bug.h - 7, 20, 3);
      // Gooey splats
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(bx + bug.w / 2 - 14, by + bug.h - 3, 4, 3);
      ctx.fillRect(bx + bug.w / 2 + 10, by + bug.h - 4, 5, 3);
    }
    ctx.restore();
    return;
  }

  // Ground drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(bx + bug.w / 2, by + bug.h + 2, 17, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 6 Articulated Segmented Legs with Claw Tips (Tripod crawling gait)
  const legCycle = Math.sin(bug.legPhase);
  ctx.strokeStyle = '#580808';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';

  // Left 3 legs
  // Front left
  ctx.beginPath();
  ctx.moveTo(bx + 8, by + 12);
  ctx.lineTo(bx - 3, by + 4 + legCycle * 4);
  ctx.lineTo(bx - 9, by + 17 + legCycle * 4);
  ctx.stroke();
  // Middle left
  ctx.beginPath();
  ctx.moveTo(bx + 10, by + 17);
  ctx.lineTo(bx - 5, by + 17 - legCycle * 4);
  ctx.lineTo(bx - 12, by + 27 - legCycle * 4);
  ctx.stroke();
  // Rear left
  ctx.beginPath();
  ctx.moveTo(bx + 12, by + 22);
  ctx.lineTo(bx - 3, by + 25 + legCycle * 4);
  ctx.lineTo(bx - 8, by + 31 + legCycle * 4);
  ctx.stroke();

  // Right 3 legs
  // Front right
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 8, by + 12);
  ctx.lineTo(bx + bug.w + 3, by + 4 - legCycle * 4);
  ctx.lineTo(bx + bug.w + 9, by + 17 - legCycle * 4);
  ctx.stroke();
  // Middle right
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 10, by + 17);
  ctx.lineTo(bx + bug.w + 5, by + 17 + legCycle * 4);
  ctx.lineTo(bx + bug.w + 12, by + 27 + legCycle * 4);
  ctx.stroke();
  // Rear right
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 12, by + 22);
  ctx.lineTo(bx + bug.w + 3, by + 25 - legCycle * 4);
  ctx.lineTo(bx + bug.w + 8, by + 31 - legCycle * 4);
  ctx.stroke();

  // 3D Domed Ruby Chitin Shell
  const shellGrad = ctx.createRadialGradient(
    bx + bug.w / 2 - 4, by + bug.h / 2 - 4, 3,
    bx + bug.w / 2, by + bug.h / 2, 17
  );
  shellGrad.addColorStop(0, '#f87171');
  shellGrad.addColorStop(0.35, '#ef4444');
  shellGrad.addColorStop(0.75, '#b91c1c');
  shellGrad.addColorStop(1, '#7f1d1d');

  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.arc(bx + bug.w / 2, by + bug.h / 2, 15.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#450a0a';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Specular Gloss Highlight Sheen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(bx + bug.w / 2 - 5, by + bug.h / 2 - 6, 6.5, 3, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Curved Antennae with Pulsing Neon Orbs
  const antennaTwitch = Math.sin(tick * 0.2 + bug.id) * 2;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.8;
  // Left antenna
  ctx.beginPath();
  ctx.moveTo(bx + 11, by + 4);
  ctx.quadraticCurveTo(bx + 4, by - 3, bx + 2 + antennaTwitch, by - 9);
  ctx.stroke();
  // Right antenna
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 11, by + 4);
  ctx.quadraticCurveTo(bx + bug.w - 4, by - 3, bx + bug.w - 2 - antennaTwitch, by - 9);
  ctx.stroke();

  // Antenna Neon Glowing Tips
  ctx.fillStyle = '#fde047';
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(bx + 2 + antennaTwitch, by - 9, 2.5, 0, Math.PI * 2);
  ctx.arc(bx + bug.w - 2 - antennaTwitch, by - 9, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Angry Slanted Eyes with Glowing Pupils
  // Left Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(bx + 10, by + 7);
  ctx.lineTo(bx + 18, by + 11);
  ctx.lineTo(bx + 12, by + 16);
  ctx.closePath();
  ctx.fill();

  // Right Eye
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 10, by + 7);
  ctx.lineTo(bx + bug.w - 18, by + 11);
  ctx.lineTo(bx + bug.w - 12, by + 16);
  ctx.closePath();
  ctx.fill();

  // Black pupils with evil red glint
  ctx.fillStyle = '#000000';
  ctx.fillRect(bx + 13, by + 10, 3, 4);
  ctx.fillRect(bx + bug.w - 16, by + 10, 3, 4);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(bx + 14, by + 11, 1, 2);
  ctx.fillRect(bx + bug.w - 15, by + 11, 1, 2);

  // Wicked Mandible Fangs & Snarl
  ctx.fillStyle = '#200303';
  ctx.fillRect(bx + 15, by + 20, 12, 4);
  ctx.fillStyle = '#fef08a'; // Sharp fangs
  ctx.beginPath();
  ctx.moveTo(bx + 16, by + 20);
  ctx.lineTo(bx + 18, by + 26);
  ctx.lineTo(bx + 19, by + 20);
  ctx.moveTo(bx + 23, by + 20);
  ctx.lineTo(bx + 24, by + 26);
  ctx.lineTo(bx + 26, by + 20);
  ctx.fill();

  ctx.restore();
}

const TakeABreakGame = ({ onNavigate }) => {
  const canvasRef = useRef(null);

  // Game UI state
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'gameover'
  const [selectedHero, setSelectedHero] = useState('male'); // 'male' | 'female'
  const [dialogueText, setDialogueText] = useState("Collect code, gain XP, avoid the bugs, and reach the flag! Can you complete the level?");
  const [gameKey, setGameKey] = useState(0);

  // Shared keys object — written by both keyboard listeners and mobile touch buttons
  // Stored in a ref so the game loop closure always reads the latest values.
  const keysRef = useRef({ left: false, right: false, up: false, down: false });

  // Use ref to make character selection reactive inside the game loop immediately
  const heroRef = useRef(selectedHero);
  useEffect(() => {
    heroRef.current = selectedHero;
  }, [selectedHero]);

  // Use ref for pause state so game loop and timer don't reset when pausing
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Handle mute toggle
  const toggleMute = () => {
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle Pause
  const togglePause = () => {
    if (gameState !== 'playing') return;
    setIsPaused(prev => !prev);
  };

  // Switch Character
  const handleSelectCharacter = (hero) => {
    setSelectedHero(hero);
    if (hero === 'male') {
      setDialogueText("Playing as Aditya! Let's conquer the bugs and deploy clean code.");
    } else {
      setDialogueText("Playing as Maya! Fast, agile, and ready to squash every runtime bug.");
    }
  };

  // Main game engine
  useEffect(() => {
    audio.init();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const CW = 1024;
    const CH = 500;
    canvas.width = CW;
    canvas.height = CH;

    // Game Variables
    let currentScore = 0;
    let currentLives = 3;
    let gameTimer = 0;
    let over = false;
    let won = false;
    let screenShake = 0;

    // Procedural Stars
    const stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * CW,
        y: Math.random() * 240,
        size: Math.random() < 0.25 ? 2 : 1,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.05 + 0.02
      });
    }

    // Windows in City Buildings
    const buildings = [
      { x: 20, w: 180, h: 220 },
      { x: 215, w: 85, h: 260 },
      { x: 310, w: 95, h: 320, sign: 'CODE' },
      { x: 415, w: 110, h: 360 },
      { x: 535, w: 85, h: 290 },
      { x: 630, w: 100, h: 310 },
      { x: 740, w: 105, h: 340, sign: 'GOOD' },
      { x: 855, w: 150, h: 380, sign: 'STACK' }
    ];

    // Player State
    const player = {
      x: 140,
      y: 330,
      w: 36,
      h: 58,
      vx: 0,
      vy: 0,
      speed: 4.8,
      jumpPower: -12.5,
      gravity: 0.62,
      grounded: false,
      jumpsLeft: 2,
      isDucking: false,
      facing: 1, // 1 right, -1 left
      invulnerable: 0,
      animFrame: 0
    };

    // Platforms
    const platforms = [
      // Main Ground
      { x: 0, y: 395, w: 1024, h: 105, type: 'ground' },
      // Floating Platform 1
      { x: 245, y: 345, w: 95, h: 22, type: 'block' },
      // Floating Platform 2
      { x: 420, y: 280, w: 95, h: 22, type: 'block' },
      // Floating Platform 3
      { x: 620, y: 345, w: 95, h: 22, type: 'block' },
      // Floating Platform 4
      { x: 760, y: 280, w: 95, h: 22, type: 'block' },
      // Goal Platform
      { x: 890, y: 225, w: 134, h: 170, type: 'goal' }
    ];

    // Collectibles
    const laptops = [
      { id: 1, x: 275, y: 305, w: 36, h: 26, collected: false },
      { id: 2, x: 450, y: 240, w: 36, h: 26, collected: false },
      { id: 3, x: 650, y: 305, w: 36, h: 26, collected: false }
    ];

    const coins = [
      { id: 1, x: 375, y: 340, r: 15, collected: false },
      { id: 2, x: 555, y: 275, r: 15, collected: false },
      { id: 3, x: 725, y: 275, r: 15, collected: false }
    ];

    // Enemies (Bugs)
    const bugs = [
      { id: 1, x: 460, y: 365, w: 42, h: 30, minX: 380, maxX: 580, vx: 1.2, facing: 1, alive: true, legPhase: 0, squashedTimer: 0 },
      { id: 2, x: 770, y: 250, w: 42, h: 30, minX: 760, maxX: 825, vx: 1.1, facing: 1, alive: true, legPhase: 2, squashedTimer: 0 },
      { id: 3, x: 855, y: 365, w: 42, h: 30, minX: 835, maxX: 885, vx: 1.0, facing: 1, alive: true, legPhase: 4, squashedTimer: 0 }
    ];

    // Particles & Floating Text
    let particles = [];
    let floatingTexts = [];

    const addText = (text, x, y, color = '#38bdf8') => {
      floatingTexts.push({ text, x, y, vy: -1.2, alpha: 1, color });
    };

    const addParticles = (x, y, color, count = 12) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 3 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 1,
          size: Math.random() * 3 + 2,
          color,
          alpha: 1,
          life: 30
        });
      }
    };

    // Flag Goal
    const goalFlag = {
      x: 935,
      y: 165,
      w: 36,
      h: 60,
      reached: false
    };

    // Keys Input — backed by keysRef so touch buttons share the same state
    const keys = keysRef.current;

    const onKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === ' ') {
        if (!keys.up) {
          if (player.grounded || player.jumpsLeft > 0) {
            player.vy = player.jumpPower;
            player.grounded = false;
            player.jumpsLeft--;
            audio.jump();
            addParticles(player.x + player.w / 2, player.y + player.h, '#ffffff', 8);
          }
        }
        keys.up = true;
      }
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = true;
      if (e.key === 'p' || e.key === 'P') {
        if (!over && !won) togglePause();
      }
    };

    const onKeyUp = (e) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === ' ') keys.up = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = false;
    };

    // Jump trigger used by both keyboard (keydown) and the mobile JUMP button (pointerdown)
    const triggerJump = () => {
      if (player.grounded || player.jumpsLeft > 0) {
        player.vy = player.jumpPower;
        player.grounded = false;
        player.jumpsLeft--;
        audio.jump();
        addParticles(player.x + player.w / 2, player.y + player.h, '#ffffff', 8);
      }
    };

    // Expose triggerJump on the canvas element so the JSX touch buttons can call it
    if (canvas) canvas._triggerJump = triggerJump;

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Timer Interval
    const timerInterval = setInterval(() => {
      if (!isPausedRef.current && !over && !won) {
        gameTimer += 1;
        setTime(gameTimer);
      }
    }, 1000);

    // Game Loop
    let animationFrameId;
    let tick = 0;

    const gameLoop = () => {
      tick++;

      if (!isPausedRef.current && !over && !won) {
        // 1. Movement & Controls
        player.isDucking = keys.down;
        const currentSpeed = player.isDucking ? player.speed * 0.4 : player.speed;

        if (keys.left) {
          player.vx = -currentSpeed;
          player.facing = -1;
          player.animFrame += 0.28;
        } else if (keys.right) {
          player.vx = currentSpeed;
          player.facing = 1;
          player.animFrame += 0.28;
        } else {
          player.vx *= 0.75;
          if (Math.abs(player.vx) < 0.2) player.vx = 0;
        }

        player.vy += player.gravity;
        player.x += player.vx;
        player.y += player.vy;

        if (player.x < 10) player.x = 10;
        if (player.x + player.w > CW - 10) player.x = CW - 10 - player.w;

        // 2. Collision with Platforms
        player.grounded = false;
        platforms.forEach(plat => {
          if (
            player.x + player.w > plat.x &&
            player.x < plat.x + plat.w &&
            player.y + player.h >= plat.y &&
            player.y + player.h <= plat.y + 18 &&
            player.vy >= 0
          ) {
            player.y = plat.y - player.h;
            player.vy = 0;
            player.grounded = true;
            player.jumpsLeft = 2;
          }
        });

        if (player.invulnerable > 0) {
          player.invulnerable--;
        }

        // 3. Enemy Patrol & Collision
        bugs.forEach(bug => {
          if (!bug.alive) {
            if (bug.squashedTimer > 0) bug.squashedTimer--;
            return;
          }
          bug.x += bug.vx;
          bug.legPhase += 0.25;
          if (bug.x <= bug.minX || bug.x + bug.w >= bug.maxX) {
            bug.vx = -bug.vx;
            bug.facing = bug.vx > 0 ? 1 : -1;
          }

          if (
            player.x + player.w > bug.x + 3 &&
            player.x < bug.x + bug.w - 3 &&
            player.y + player.h > bug.y + 2 &&
            player.y < bug.y + bug.h
          ) {
            if (player.vy > 0 && player.y + player.h - player.vy <= bug.y + 14) {
              // Squashed!
              bug.alive = false;
              bug.squashedTimer = 30;
              player.vy = -9.5;
              player.jumpsLeft = 1;
              currentScore += 100;
              setScore(currentScore);
              audio.stomp();
              screenShake = 6;
              addText('+100 SQUASHED!', bug.x - 10, bug.y - 10, '#ef4444');
              addParticles(bug.x + bug.w / 2, bug.y + bug.h / 2, '#ef4444', 20);
              setDialogueText(
                heroRef.current === 'male' 
                  ? "Aditya squashed a critical bug! +100 XP gained." 
                  : "Maya executed bug termination! +100 XP gained."
              );
            } else if (player.invulnerable === 0) {
              // Hurt!
              player.invulnerable = 60;
              currentLives -= 1;
              setLives(currentLives);
              audio.hurt();
              screenShake = 10;
              addParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff4444', 12);
              player.vy = -6;
              player.vx = -player.facing * 5;
              setDialogueText("Ouch! A runtime bug struck! Jump on top of them to squash.");

              if (currentLives <= 0) {
                over = true;
                clearInterval(timerInterval);
                setFinalTime(gameTimer);
                setGameState('gameover');
                setDialogueText("Game Over! The bugs broke production. Press Try Again to redeploy!");
                
                // Record dynamic run to MySQL
                fetch(apiUrl('/api/game/score'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    player_name: heroRef.current === 'male' ? 'Aditya' : 'Maya',
                    character_chosen: heroRef.current === 'male' ? 'Aditya' : 'Maya',
                    time_seconds: gameTimer,
                    bugs_squashed: bugs.filter(b => !b.alive).length,
                    outcome: 'gameover'
                  })
                }).catch(() => {});
              }
            }
          }
        });

        // 4. Collectibles
        laptops.forEach(lap => {
          if (lap.collected) return;
          const bob = Math.sin(tick * 0.08 + lap.id) * 4;
          if (
            player.x + player.w > lap.x &&
            player.x < lap.x + lap.w &&
            player.y + player.h > lap.y + bob &&
            player.y < lap.y + lap.h + bob
          ) {
            lap.collected = true;
            currentScore += 50;
            setScore(currentScore);
            audio.code();
            addText('+50 CODE', lap.x - 10, lap.y - 15, '#38bdf8');
            addParticles(lap.x + lap.w / 2, lap.y + lap.h / 2, '#38bdf8', 16);
            setDialogueText("Clean code gathered! Keep pushing toward the deployment flag.");
          }
        });

        coins.forEach(coin => {
          if (coin.collected) return;
          const dx = (player.x + player.w / 2) - coin.x;
          const dy = (player.y + player.h / 2) - coin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < coin.r + player.w / 2) {
            coin.collected = true;
            currentScore += 25;
            setScore(currentScore);
            audio.coin();
            addText('+25 XP', coin.x - 15, coin.y - 15, '#eab308');
            addParticles(coin.x, coin.y, '#eab308', 14);
            setDialogueText("XP bonus acquired! Skills leveling up.");
          }
        });

        // 5. Goal Flag
        if (
          !goalFlag.reached &&
          player.x + player.w >= goalFlag.x &&
          player.y + player.h >= goalFlag.y &&
          player.y <= goalFlag.y + goalFlag.h + 30
        ) {
          goalFlag.reached = true;
          won = true;
          clearInterval(timerInterval);
          setFinalTime(gameTimer);
          currentScore += 300;
          setScore(currentScore);
          audio.win();
          screenShake = 4;
          setGameState('won');
          setDialogueText(
            heroRef.current === 'male'
              ? "CONGRATULATIONS! Aditya deployed to production and reached the flag!"
              : "CONGRATULATIONS! Maya cleared the level with zero bugs left in production!"
          );
          
          // Record victory run to MySQL
          fetch(apiUrl('/api/game/score'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              player_name: heroRef.current === 'male' ? 'Aditya' : 'Maya',
              character_chosen: heroRef.current === 'male' ? 'Aditya' : 'Maya',
              time_seconds: gameTimer,
              bugs_squashed: bugs.filter(b => !b.alive).length,
              outcome: 'victory'
            })
          }).catch(() => {});

          addText('+300 LEVEL CLEAR!', goalFlag.x - 40, goalFlag.y - 30, '#22c55e');
          for (let k = 0; k < 45; k++) {
            addParticles(goalFlag.x + 18, goalFlag.y + 15, ['#22c55e', '#38bdf8', '#f43f5e', '#fbbf24'][k % 4], 45);
          }
        }
      }

      // --- RENDERING CANVAS ---
      ctx.save();

      if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
        screenShake *= 0.85;
        if (screenShake < 0.5) screenShake = 0;
      }

      ctx.clearRect(0, 0, CW, CH);

      // Night Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
      skyGrad.addColorStop(0, '#040714');
      skyGrad.addColorStop(0.5, '#0a1024');
      skyGrad.addColorStop(1, '#111b38');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CW, CH);

      // Stars
      stars.forEach(s => {
        s.alpha += Math.sin(tick * s.twinkleSpeed) * 0.015;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, Math.max(0.2, s.alpha))})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });

      // Moon
      const moonX = 390;
      const moonY = 80;
      ctx.save();
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(moonX - 6, moonY - 4, 5, 0, Math.PI * 2);
      ctx.arc(moonX + 7, moonY + 6, 4, 0, Math.PI * 2);
      ctx.arc(moonX - 3, moonY + 9, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Buildings
      buildings.forEach(b => {
        const topY = 400 - b.h;
        ctx.fillStyle = '#0a1022';
        ctx.fillRect(b.x, topY, b.w, b.h);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, topY, b.w, b.h);

        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 14) {
          for (let wy = topY + 12; wy < 380; wy += 20) {
            if (((wx * 7 + wy * 13) % 5) !== 0) {
              ctx.fillRect(wx, wy, 8, 10);
            }
          }
        }
      });

      // Billboard
      ctx.save();
      const bbX = 25;
      const bbY = 120;
      const bbW = 165;
      const bbH = 165;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bbX + 30, bbY + bbH, 10, 110);
      ctx.fillRect(bbX + bbW - 40, bbY + bbH, 10, 110);
      ctx.fillStyle = '#060a17';
      ctx.fillRect(bbX, bbY, bbW, bbH);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 12;
      ctx.strokeRect(bbX, bbY, bbW, bbH);
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillText('SAME', bbX + 18, bbY + 36);
      ctx.fillText('PASSION.', bbX + 18, bbY + 56);
      ctx.fillText('DIFFERENT', bbX + 18, bbY + 76);
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ef4444';
      ctx.fillText('LEVEL.', bbX + 18, bbY + 104);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bbX + 62, bbY + 120, 40, 22);
      ctx.restore();

      // Neon Building Signs
      ctx.save();
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillText('CODE', 320, 240);
      ctx.fillText('BUILD', 320, 258);
      ctx.fillText('PLAY', 320, 276);
      ctx.fillText('REPEAT', 320, 294);
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#c084fc';
      ctx.fillText('GOOD', 750, 215);
      ctx.fillText('GAMES', 750, 233);
      ctx.fillText('BETTER', 750, 251);
      ctx.fillText('CODE', 750, 269);
      ctx.fillText('</>', 765, 290);
      ctx.fillStyle = '#60a5fa';
      ctx.shadowColor = '#60a5fa';
      ctx.fillText('HTML', 870, 230);
      ctx.fillText('CSS', 870, 248);
      ctx.fillText('JS', 870, 266);
      ctx.fillText('REACT', 870, 284);
      ctx.fillText('NODE', 870, 302);
      ctx.fillText('SQL', 870, 320);
      ctx.restore();

      // Platforms
      platforms.forEach(plat => {
        if (plat.type === 'ground') {
          ctx.fillStyle = '#0a0f1d';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          for (let gy = plat.y + 20; gy < CH; gy += 24) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(CW, gy);
            ctx.stroke();
          }
          ctx.fillStyle = '#b45309';
          ctx.fillRect(0, plat.y + 45, CW, 8);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(0, plat.y + 47, CW, 4);

          ctx.fillStyle = '#1e293b';
          ctx.fillRect(plat.x, plat.y, plat.w, 8);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(plat.x, plat.y, plat.w, 4);
          for (let gx = 10; gx < CW; gx += 20) {
            ctx.fillRect(gx, plat.y - 2, 4, 3);
          }
        } else if (plat.type === 'goal') {
          ctx.fillStyle = '#0a1020';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

          ctx.fillStyle = '#22c55e';
          ctx.fillRect(plat.x, plat.y, plat.w, 6);

          ctx.save();
          ctx.fillStyle = '#f59e0b';
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.fillText('NEXT', plat.x + 16, plat.y + 36);
          ctx.fillText('LEVEL.', plat.x + 16, plat.y + 50);
          ctx.fillText('A BETTER', plat.x + 16, plat.y + 70);
          ctx.fillText('TOMORROW', plat.x + 16, plat.y + 84);
          ctx.fillStyle = '#f97316';
          ctx.font = '16px "Inter", sans-serif';
          ctx.fillText('\u2192', plat.x + 35, plat.y + 115);
          ctx.restore();

          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(plat.x - 16, plat.y + 10);
          ctx.lineTo(plat.x - 16, 395);
          ctx.moveTo(plat.x - 4, plat.y + 10);
          ctx.lineTo(plat.x - 4, 395);
          for (let ly = plat.y + 20; ly < 395; ly += 16) {
            ctx.moveTo(plat.x - 16, ly);
            ctx.lineTo(plat.x - 4, ly);
          }
          ctx.stroke();
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

          ctx.fillStyle = '#22c55e';
          ctx.fillRect(plat.x, plat.y, plat.w, 4);
          ctx.fillStyle = '#15803d';
          for (let px = plat.x + 4; px < plat.x + plat.w - 4; px += 12) {
            ctx.fillRect(px, plat.y + 4, 6, 3);
          }
        }
      });

      // Goal Flag
      ctx.save();
      const poleX = goalFlag.x + 10;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(poleX, goalFlag.y);
      ctx.lineTo(poleX, goalFlag.y + goalFlag.h);
      ctx.stroke();
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(poleX, goalFlag.y, 4, 0, Math.PI * 2);
      ctx.fill();
      const wave = Math.sin(tick * 0.15) * 4;
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(poleX, goalFlag.y + 2);
      ctx.lineTo(poleX + 32 + wave, goalFlag.y + 14);
      ctx.lineTo(poleX, goalFlag.y + 26);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Collectibles: Laptops
      laptops.forEach(lap => {
        if (lap.collected) return;
        const bob = Math.sin(tick * 0.08 + lap.id) * 4;
        const lx = lap.x;
        const ly = lap.y + bob;

        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(lx - 2, ly + lap.h - 6, lap.w + 4, 6);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(lx - 2, ly + lap.h - 6, lap.w + 4, 6);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(lx + 2, ly, lap.w - 4, lap.h - 6);
        ctx.strokeRect(lx + 2, ly, lap.w - 4, lap.h - 6);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px "Press Start 2P", monospace';
        ctx.fillText('</>', lx + 8, ly + 14);
        ctx.restore();
      });

      // Collectibles: Golden Coins
      coins.forEach(coin => {
        if (coin.collected) return;
        ctx.save();
        const spinWidth = Math.abs(Math.cos(tick * 0.06 + coin.id * 1.5)) * coin.r;
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 14;

        ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.r + 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(coin.x, coin.y, Math.max(3, spinWidth), coin.r, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (spinWidth > 8) {
          ctx.fillStyle = '#713f12';
          ctx.font = 'bold 9px "Press Start 2P", monospace';
          ctx.fillText('XP', coin.x - 7, coin.y + 3);
        }
        ctx.restore();
      });

      // Draw Detailed Red Bugs
      bugs.forEach(bug => {
        drawDetailedBug(ctx, bug, tick);
      });

      // Draw Selected Hero (Male Aditya or Female Maya)
      if (player.invulnerable % 8 < 4) {
        ctx.save();
        ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
        ctx.scale(player.facing, 1);

        if (heroRef.current === 'male') {
          drawMaleHero(ctx, player, tick);
        } else {
          drawFemaleHero(ctx, player, tick);
        }
        ctx.restore();
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha = p.life / 30;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Floating Scores
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.02;
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = 'bold 11px "Press Start 2P", monospace';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
      }

      // Pause Overlay
      if (isPausedRef.current) {
        ctx.save();
        ctx.fillStyle = 'rgba(6, 10, 23, 0.8)';
        ctx.fillRect(0, 0, CW, CH);
        ctx.fillStyle = '#ffffff';
        ctx.font = '22px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillText('PAUSED', CW / 2, CH / 2 - 10);
        ctx.font = '13px "Inter", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.shadowBlur = 0;
        ctx.fillText('Press [P] or tap Resume to continue your quest', CW / 2, CH / 2 + 25);
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      clearInterval(timerInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameKey]);

  const handleRestart = () => {
    // Reset shared keys so no buttons remain "stuck" from the previous run
    keysRef.current.left = false;
    keysRef.current.right = false;
    keysRef.current.up = false;
    keysRef.current.down = false;
    setScore(0);
    setTime(0);
    setFinalTime(0);
    setLives(3);
    setIsPaused(false);
    setGameState('playing');
    setDialogueText("Quest restarted! Collect all code and reach the flag.");
    setGameKey(k => k + 1);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="take-a-break-page">
      <div className="game-wrapper-container">
        
        {/* TOP STATUS / HUD BAR */}
        <header className="game-hud-bar">
          <div className="hud-logo-area" onClick={() => onNavigate('home')}>
            <img src="/images/controller_icon.png" alt="Controller" className="hud-gamepad-icon" />
            <div className="hud-logo-text">
              <span className="hud-logo-title">ADITYA GORE</span>
              <span className="hud-logo-subtitle">DEVELOPER &times; GAMER</span>
            </div>
          </div>

          {/* Character Selector Widget */}
          <div className="hud-character-selector">
            <span className="selector-label">HERO:</span>
            <button
              type="button"
              className={`char-select-btn ${selectedHero === 'male' ? 'active' : ''}`}
              onClick={() => handleSelectCharacter('male')}
              title="Select Aditya (Male Dev)"
            >
              <span className="char-badge-avatar male-mini"></span>
              <span className="char-name">Aditya</span>
            </button>
            <button
              type="button"
              className={`char-select-btn ${selectedHero === 'female' ? 'active' : ''}`}
              onClick={() => handleSelectCharacter('female')}
              title="Select Maya (Female Dev)"
            >
              <span className="char-badge-avatar female-mini"></span>
              <span className="char-name">Maya</span>
            </button>
          </div>

          {/* Center Objective Badge */}
          <div className="hud-quest-badge">
            <span className="level-title">LEVEL 1</span>
            <span className="level-goal">COLLECT <span className="highlight-cyan">CODE</span> &bull; AVOID <span className="highlight-red">BUGS</span> &bull; REACH THE FLAG</span>
          </div>

          {/* Right Metrics: Score, Time, Lives, Controls */}
          <div className="hud-metrics">
            <div className="hud-metric-box">
              <span className="metric-label">SCORE</span>
              <span className="metric-val score-val">{score}</span>
            </div>

            <div className="hud-metric-box">
              <span className="metric-label">TIME</span>
              <span className="metric-val">{formatTime(time)}</span>
            </div>

            <div className="hud-metric-box lives-box">
              <span className="metric-label">LIVES</span>
              <div className="lives-hearts">
                {[1, 2, 3].map(i => (
                  i <= lives ? (
                    <FaHeart key={i} className="heart-icon filled" />
                  ) : (
                    <FaRegHeart key={i} className="heart-icon empty" />
                  )
                ))}
              </div>
            </div>

            <button 
              type="button" 
              className="hud-action-btn" 
              onClick={togglePause}
              title={isPaused ? "Resume Game" : "Pause Game"}
            >
              {isPaused ? <FaPlay /> : <FaPause />}
            </button>

            <button 
              type="button" 
              className="hud-action-btn" 
              onClick={toggleMute}
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>

            <button 
              type="button" 
              className="hud-action-btn" 
              onClick={handleRestart}
              title="Restart Level"
            >
              <FaRedo />
            </button>
          </div>
        </header>

        {/* CANVAS STAGE */}
        <div className="canvas-container">
          <canvas ref={canvasRef} className="pixel-game-canvas" />

          {/* Victory Overlay Modal */}
          {gameState === 'won' && (
            <div className="game-modal-overlay">
              <div className="game-modal-card victory-card">
                <span className="modal-tag">// LEVEL_1_COMPLETE.EXE</span>
                <h2 className="modal-title victory-title">QUEST COMPLETED!</h2>
                <p className="modal-desc">
                  {selectedHero === 'male' ? 'Aditya' : 'Maya'} conquered the bugs, gathered the code, and reached the flag!
                </p>
                <div className="modal-stats-row">
                  <div><span>FINAL SCORE:</span> <strong>{score}</strong></div>
                  <div><span>TIME TAKEN:</span> <strong>{formatTime(finalTime || time)}</strong></div>
                </div>
                <div className="modal-buttons-row">
                  <button type="button" className="modal-btn-primary" onClick={handleRestart}>
                    PLAY AGAIN &rarr;
                  </button>
                  <button type="button" className="modal-btn-secondary" onClick={() => onNavigate('home', 'projects')}>
                    RETURN TO PORTFOLIO
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Overlay Modal */}
          {gameState === 'gameover' && (
            <div className="game-modal-overlay">
              <div className="game-modal-card gameover-card">
                <span className="modal-tag">// SYSTEM_CRASH.ERR</span>
                <h2 className="modal-title gameover-title">GAME OVER!</h2>
                <p className="modal-desc">
                  Too many bugs broke production! Every great developer debugs and redeploys.
                </p>
                <div className="modal-stats-row">
                  <div><span>SCORE:</span> <strong>{score}</strong></div>
                  <div><span>TIME TAKEN:</span> <strong>{formatTime(finalTime || time)}</strong></div>
                </div>
                <div className="modal-buttons-row">
                  <button type="button" className="modal-btn-primary" onClick={handleRestart}>
                    TRY AGAIN &rarr;
                  </button>
                  <button type="button" className="modal-btn-secondary" onClick={() => onNavigate('home')}>
                    BACK TO HOME
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>{/* end canvas-container */}

        {/* ── Mobile Touch Controls (standalone, below canvas, hidden on desktop) ── */}
        <div className="mobile-controls" aria-label="Mobile game controls">
          {/* Left cluster: ← ↓ → */}
          <div className="mobile-dpad">
            <button
              type="button"
              className="dpad-btn dpad-left"
              aria-label="Move left"
              onPointerDown={() => { keysRef.current.left = true; }}
              onPointerUp={() => { keysRef.current.left = false; }}
              onPointerLeave={() => { keysRef.current.left = false; }}
            >◀</button>
            <button
              type="button"
              className="dpad-btn dpad-down"
              aria-label="Duck"
              onPointerDown={() => { keysRef.current.down = true; }}
              onPointerUp={() => { keysRef.current.down = false; }}
              onPointerLeave={() => { keysRef.current.down = false; }}
            >▼</button>
            <button
              type="button"
              className="dpad-btn dpad-right"
              aria-label="Move right"
              onPointerDown={() => { keysRef.current.right = true; }}
              onPointerUp={() => { keysRef.current.right = false; }}
              onPointerLeave={() => { keysRef.current.right = false; }}
            >▶</button>
          </div>

          {/* Centre label */}
          <div className="mobile-controls-label">
            <span>◀ MOVE ▶</span>
            <span>▼ DUCK</span>
          </div>

          {/* Right cluster: JUMP */}
          <div className="mobile-action-cluster">
            <button
              type="button"
              className="dpad-btn dpad-jump"
              aria-label="Jump"
              onPointerDown={() => {
                if (canvasRef.current?._triggerJump) canvasRef.current._triggerJump();
                keysRef.current.up = true;
              }}
              onPointerUp={() => { keysRef.current.up = false; }}
              onPointerLeave={() => { keysRef.current.up = false; }}
            >▲<span className="jump-label">JUMP</span></button>
          </div>
        </div>

        {/* BOTTOM HUD SECTION */}
        <footer className="game-bottom-hud">
          
          {/* Controls Box */}
          <div className="controls-card">
            <span className="controls-title">CONTROLS</span>
            <div className="controls-keys-list">
              <div className="control-key-row">
                <span className="key-badge">A</span>
                <span className="key-badge">D</span>
                <span className="key-action">Move</span>
              </div>
              <div className="control-key-row">
                <span className="key-badge">W</span>
                <span className="key-action">Jump (Double)</span>
              </div>
              <div className="control-key-row">
                <span className="key-badge">S</span>
                <span className="key-action">Duck</span>
              </div>
            </div>
          </div>

          {/* Quest Dialogue Banner with Dynamic Custom Pixel Avatar */}
          <div className="quest-dialogue-card">
            <div className={`dialogue-avatar-box ${selectedHero}`}>
              {selectedHero === 'male' ? (
                <div className="pixel-portrait male-portrait">
                  <div className="portrait-hair male-hair"></div>
                  <div className="portrait-face">
                    <div className="portrait-eye"></div>
                  </div>
                  <div className="portrait-body male-hoodie"></div>
                </div>
              ) : (
                <div className="pixel-portrait female-portrait">
                  <div className="portrait-hair female-hair"></div>
                  <div className="portrait-face">
                    <div className="portrait-eye cyan-glint"></div>
                    <div className="portrait-blush"></div>
                  </div>
                  <div className="portrait-body female-jacket"></div>
                </div>
              )}
            </div>
            <div className="dialogue-content">
              <div className="dialogue-header">
                <span className="speaker-name">{selectedHero === 'male' ? 'Aditya Gore' : 'Maya Chen'}</span>
                <span className="speaker-role">Lead Developer</span>
              </div>
              <p className="dialogue-line">{dialogueText}</p>
            </div>
          </div>

          {/* Small Steps Big Dreams Slogan */}
          <div className="game-slogan-card">
            <img src="/images/controller_icon.png" alt="Controller" className="slogan-gamepad-icon" />
            <div className="slogan-text">
              <span>SMALL</span>
              <span>STEPS</span>
              <span className="highlight">BIGGER</span>
              <span className="highlight">DREAMS</span>
            </div>
          </div>

        </footer>

      </div>
    </div>
  );
};

export default TakeABreakGame;
