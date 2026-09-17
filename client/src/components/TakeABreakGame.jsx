import React, { useRef, useEffect, useState } from 'react';
import './TakeABreakGame.css';
import { FaHeart, FaRegHeart, FaPause, FaPlay, FaRedo, FaVolumeMute, FaVolumeUp, FaShieldAlt, FaBolt, FaTrophy } from 'react-icons/fa';
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

  brake() {
    this.playTone(340, 'sawtooth', 0.08, 120);
  }

  powerup() {
    [440, 554, 659, 880].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.09), i * 50);
    });
  }

  shieldHit() {
    this.playTone(720, 'triangle', 0.16, 220);
  }

  milestone() {
    [523, 659, 783, 1046].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.13), i * 90);
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
  const bobY = isRunning ? Math.abs(Math.sin(p.animFrame * 2)) * 2.2 : 0;

  // 1. Dynamic Slide Ghost Trails (when braking/sliding)
  if (isDucking) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(-22, 10, 20, 14);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-16, 12, 12, 10);
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-32, 12, 16, 11);
    ctx.restore();
  }

  // Ground Drop Shadow (Scales with jump height)
  const shadowScale = isJumping ? Math.max(0.4, 1 - Math.abs(p.vy) * 0.04) : 1;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(isDucking ? -4 : 0, 29, 16 * shadowScale, 4.5 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Brown Leather Backpack (on back)
  const bpX = isDucking ? -22 : -17;
  const bpY = (isDucking ? 6 : -18) + (isDucking ? 0 : bobY);
  ctx.fillStyle = '#1a0f0d'; // Dark outline
  ctx.fillRect(bpX - 1, bpY - 1, 10, 23);
  ctx.fillStyle = '#451a03'; // Backpack leather
  ctx.fillRect(bpX, bpY, 8, 21);
  ctx.fillStyle = '#78350f'; // Backpack highlight
  ctx.fillRect(bpX + 1, bpY + 1, 3, 19);
  // Backpack brass buckle
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(bpX + 2, bpY + 8, 4, 3);
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(bpX + 3, bpY + 9, 2, 1);

  // 3. Torso: Dark Navy Open Short-Sleeved Jacket & White Inner T-Shirt
  const torsoY = (isDucking ? 6 : -19) + (isDucking ? 0 : bobY);
  const torsoH = isDucking ? 14 : 23;

  // Dark outline
  ctx.fillStyle = '#111827';
  ctx.fillRect(-11, torsoY - 0.5, 21, torsoH + 1);

  // Inner White/Light Gray Crewneck T-Shirt
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(-6, torsoY + 2, 12, torsoH - 2);
  ctx.fillStyle = '#dbeafe'; // Shirt fold shadow
  ctx.fillRect(-5, torsoY + 7, 10, torsoH - 7);
  ctx.fillStyle = '#94a3b8'; // Crease line
  ctx.fillRect(-3, torsoY + 11, 6, 1.5);

  // Dark Navy Open Jacket / Vest Panels (Left & Right flanking inner tee)
  // Left jacket panel
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(-10, torsoY + 1, 5, torsoH - 1);
  ctx.fillStyle = '#2b4c7e'; // Panel highlight
  ctx.fillRect(-9, torsoY + 2, 2, torsoH - 3);
  // Right jacket panel
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(5, torsoY + 1, 5, torsoH - 1);
  ctx.fillStyle = '#2b4c7e';
  ctx.fillRect(6, torsoY + 2, 2, torsoH - 3);

  // Brown Leather Backpack Shoulder Strap across right chest
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(-7, torsoY + 3, 3.5, torsoH - 3);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-6.5, torsoY + 4, 2, torsoH - 4);
  // Metallic gold strap buckle
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-7.5, torsoY + 9, 4, 2.5);

  // Waistline Belt (Dark brown with silver/gold buckle)
  if (!isDucking) {
    ctx.fillStyle = '#3d1604';
    ctx.fillRect(-9, torsoY + torsoH - 2.5, 18, 3);
    ctx.fillStyle = '#fef08a'; // Belt buckle
    ctx.fillRect(-1.5, torsoY + torsoH - 3, 3.5, 3.5);
    ctx.fillStyle = '#1a0f0d';
    ctx.fillRect(-0.5, torsoY + torsoH - 2, 1.5, 1.5);
  }

  // 4. Head & Face (Determined Anime Protagonist)
  const headY = (isDucking ? -6 : -29) + (isDucking ? 0 : bobY);
  const headX = isDucking ? -3 : -8;

  // Neck with warm shadow
  ctx.fillStyle = '#c2612a';
  ctx.fillRect(headX + 4, headY + 12, 7, 3);
  ctx.fillStyle = '#f5ba8b';
  ctx.fillRect(headX + 5, headY + 12, 5, 3);

  // Face Base & Skin
  ctx.fillStyle = '#1a0f0d'; // Chin/Jaw outline
  ctx.fillRect(headX - 0.5, headY - 0.5, 17, 14);
  ctx.fillStyle = '#fcdab7'; // Main skin
  ctx.fillRect(headX, headY, 16, 13);
  // Warm cheek & jaw shadow
  ctx.fillStyle = '#f5ba8b';
  ctx.fillRect(headX + 2, headY + 7, 7, 4);

  // Visible Ear on right side
  ctx.fillStyle = '#1a0f0d';
  ctx.fillRect(headX - 2.5, headY + 5, 3, 5);
  ctx.fillStyle = '#f5ba8b';
  ctx.fillRect(headX - 2, headY + 5.5, 2, 4);
  ctx.fillStyle = '#c2612a'; // Inner ear lobe shadow
  ctx.fillRect(headX - 1.5, headY + 6.5, 1, 2);

  // Expressive Dark Anime Eye (Dark iris with white catchlight glint)
  ctx.fillStyle = '#111827';
  ctx.fillRect(headX + 9, headY + 4, 5, 5);
  ctx.fillStyle = '#ffffff'; // Signature white sparkle glint
  ctx.fillRect(headX + 11.5, headY + 4.5, 2, 2);
  // Determined Dark Eyebrow
  ctx.fillStyle = '#1a0f0d';
  ctx.fillRect(headX + 8, headY + 2, 6.5, 1.8);
  // Nose mark & determined mouth
  ctx.fillStyle = '#c2612a';
  ctx.fillRect(headX + 12, headY + 8, 1.5, 1.5);
  ctx.fillStyle = '#8b3a1a';
  ctx.fillRect(headX + 10, headY + 10, 3.5, 1.2);

  // 5. Signature Dark Espresso Hair with WHITE SPECULAR GLINT STREAK
  // Hair outline / deep shadow
  ctx.fillStyle = '#1a0f0d';
  ctx.fillRect(headX - 3.5, headY - 6.5, 22, 10);
  ctx.fillRect(headX - 3.5, headY - 2, 6, 12);
  // Main dark espresso hair mass
  ctx.fillStyle = '#2d1a16';
  ctx.fillRect(headX - 2.5, headY - 5.5, 20, 9);
  ctx.fillRect(headX - 2.5, headY, 4, 9);
  // Front spiky bangs over forehead
  ctx.fillStyle = '#3e241f';
  ctx.fillRect(headX + 6, headY - 0.5, 6, 4.5);
  ctx.fillRect(headX + 1, headY - 1.5, 5, 4.5);
  ctx.fillRect(headX - 1, headY - 4, 15, 3);

  // ⭐ SIGNATURE WHITE/LIGHT SPECULAR GLINT STREAK ON LEFT BANGS (Exact from reference!)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(headX + 2, headY - 4.5, 4, 2);
  ctx.fillRect(headX + 4, headY - 2.5, 3, 2);
  ctx.fillRect(headX + 6, headY - 0.5, 2, 2);
  ctx.fillStyle = '#e2e8f0'; // Soft glint falloff
  ctx.fillRect(headX + 1, headY - 3.5, 2, 1.5);
  ctx.fillRect(headX + 7, headY - 1.5, 2, 1.5);

  // 6. Arms: Short Navy Sleeve + BARE MUSCULAR FOREARMS + Navy Wristband + Clenched Fists!
  if (isDucking) {
    // Sliding pose: Right bare arm bracing toward ground deck with skid tension
    ctx.fillStyle = '#1e3a5f'; // Short sleeve
    ctx.fillRect(-12, 10, 6, 5);
    // Bare muscular forearm
    ctx.fillStyle = '#fcdab7';
    ctx.fillRect(-12, 14, 5.5, 8);
    ctx.fillStyle = '#d97706'; // Muscle shadow
    ctx.fillRect(-12, 18, 5.5, 3);
    // Dark wristband
    ctx.fillStyle = '#111827';
    ctx.fillRect(-13, 20, 6, 2);
    // Palm bracing ground
    ctx.fillStyle = '#fcdab7';
    ctx.fillRect(-14, 22, 7, 4);

    // Left arm trailing backward
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(3, 8, 5, 5);
    ctx.fillStyle = '#fcdab7'; // Bare forearm
    ctx.fillRect(8, 8, 7, 4.5);
    ctx.fillStyle = '#fcdab7'; // Clenched fist
    ctx.fillRect(15, 8, 4, 4);
  } else {
    // Running / Jumping / Idle arm swing with bare muscular forearms!
    const armX = -4 + armCycle * 7;
    const armY = -14 + bobY;

    // Navy Short Sleeve on upper arm (ends mid-bicep!)
    ctx.fillStyle = '#111827';
    ctx.fillRect(armX - 0.5, armY - 0.5, 7, 7);
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(armX, armY, 6, 6);
    ctx.fillStyle = '#2b4c7e'; // Sleeve cuff
    ctx.fillRect(armX, armY + 5, 6, 1.5);

    // Bare Muscular Forearm with Cel-Shading
    ctx.fillStyle = '#111827'; // Forearm outline
    ctx.fillRect(armX - 0.5, armY + 6.5, 7, 8);
    ctx.fillStyle = '#fcdab7'; // Highlight skin on top
    ctx.fillRect(armX, armY + 7, 6, 7);
    ctx.fillStyle = '#d97706'; // Warm muscle shadow on underside
    ctx.fillRect(armX + 3.5, armY + 8, 2.5, 6);

    // Dark Navy Wristband on right wrist
    ctx.fillStyle = '#111827';
    ctx.fillRect(armX - 0.5, armY + 12, 6.5, 2.5);

    // Clenched Fist with Thumb & Knuckles
    ctx.fillStyle = '#111827'; // Outline
    ctx.fillRect(armX - 0.5, armY + 14, 6.5, 5.5);
    ctx.fillStyle = '#fcdab7'; // Fist skin
    ctx.fillRect(armX, armY + 14.5, 5.5, 4.5);
    ctx.fillStyle = '#c2612a'; // Knuckle groove
    ctx.fillRect(armX + 1, armY + 17, 3.5, 1);
  }

  // 7. Dark Navy Cropped Denim Pants / Cargo Trousers
  ctx.fillStyle = '#111827'; // Outline
  if (isJumping) {
    ctx.fillRect(-8.5, 4.5, 8, 11);
    ctx.fillRect(0.5, 2.5, 8, 11);
    // Dark navy denim
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, 5, 7, 10);
    ctx.fillRect(1, 3, 7, 10);
    ctx.fillStyle = '#283e58';
    ctx.fillRect(-7, 6, 5, 4);
    ctx.fillRect(2, 4, 5, 4);
  } else if (isDucking) {
    // Sliding low profile stance: back leg bent, front leg extended
    ctx.fillRect(-15.5, 11.5, 14, 8);
    ctx.fillRect(-2.5, 12.5, 18, 7);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-15, 12, 13, 7);
    ctx.fillRect(-2, 13, 17, 6);
    ctx.fillStyle = '#283e58';
    ctx.fillRect(4, 13, 5, 4);
  } else {
    // Dynamic run/walk stride with cropped hem
    const lLegX = -8 - legCycle * 7.5;
    const rLegX = 2 + legCycle * 7.5;
    ctx.fillRect(lLegX - 0.5, 4.5 + bobY, 7.5, 14);
    ctx.fillRect(rLegX - 0.5, 4.5 + bobY, 7.5, 14);
    // Denim body
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(lLegX, 5 + bobY, 6.5, 13);
    ctx.fillRect(rLegX, 5 + bobY, 6.5, 13);
    // Denim highlight creases
    ctx.fillStyle = '#283e58';
    ctx.fillRect(lLegX + 1, 7 + bobY, 4, 4);
    ctx.fillRect(rLegX + 1, 7 + bobY, 4, 4);
    // Cropped pants hem / turn-up
    ctx.fillStyle = '#152233';
    ctx.fillRect(lLegX, 16 + bobY, 6.5, 2);
    ctx.fillRect(rLegX, 16 + bobY, 6.5, 2);
  }

  // 8. Saddle-Brown Leather Boot/Sock Cuffs (between pants & sneakers)
  if (isJumping) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-8, 14, 7, 2.5);
    ctx.fillRect(1, 12, 7, 2.5);
  } else if (isDucking) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-17, 16, 8, 2);
    ctx.fillRect(11, 14, 8, 2);
  } else {
    const lLegX = -8 - legCycle * 7.5;
    const rLegX = 2 + legCycle * 7.5;
    ctx.fillStyle = '#78350f'; // Rich saddle brown cuff
    ctx.fillRect(lLegX, 17 + bobY, 6.5, 2.5);
    ctx.fillRect(rLegX, 17 + bobY, 6.5, 2.5);
    ctx.fillStyle = '#92400e'; // Cuff highlight
    ctx.fillRect(lLegX, 17 + bobY, 6.5, 1);
    ctx.fillRect(rLegX, 17 + bobY, 6.5, 1);
  }

  // 9. Classic Red & White Skate Sneakers (Thick White Rubber Platform Sole + Red Canvas!)
  if (isJumping) {
    // Jump shoes
    ctx.fillStyle = '#111827'; // Outline
    ctx.fillRect(-9.5, 15.5, 10, 7);
    ctx.fillRect(0.5, 13.5, 10, 7);
    // Red canvas upper
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-9, 16, 9, 4);
    ctx.fillRect(1, 14, 9, 4);
    // White toe cap
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, 16, 5, 2.5);
    ctx.fillRect(5, 14, 5, 2.5);
    // Thick white rubber platform sole
    ctx.fillRect(-9, 19.5, 9, 2.5);
    ctx.fillRect(1, 17.5, 9, 2.5);
    // Dark bottom sole tread
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-9, 21.5, 9, 0.8);
    ctx.fillRect(1, 19.5, 9, 0.8);
  } else if (isDucking) {
    // Slide shoe flat on ground scraping tarmac
    ctx.fillStyle = '#dc2626'; // Red canvas
    ctx.fillRect(-18, 17, 12, 4);
    ctx.fillRect(12, 15, 11, 4);
    ctx.fillStyle = '#ffffff'; // White toe cap
    ctx.fillRect(19, 15, 4, 3);
    // Thick white sole
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-18, 20, 12, 2.2);
    ctx.fillRect(12, 18.5, 11, 2.2);
    // Dark tread
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-18, 22, 12, 0.8);
    ctx.fillRect(12, 20.5, 11, 0.8);
    // Amber friction sparks
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-20, 21, 5, 2);
  } else {
    const lx = -9 - legCycle * 7.5;
    const rx = 1 + legCycle * 7.5;
    const sy = 19 + bobY;

    // Left Shoe: Red canvas + White platform sole + White toe cap
    ctx.fillStyle = '#111827'; // Outline
    ctx.fillRect(lx - 0.5, sy - 0.5, 10.5, 7);
    ctx.fillStyle = '#dc2626'; // Red canvas body
    ctx.fillRect(lx, sy, 9.5, 4.5);
    ctx.fillStyle = '#b91c1c'; // Canvas shadow
    ctx.fillRect(lx, sy + 2, 4, 2.5);
    ctx.fillStyle = '#ffffff'; // White bumper toe cap
    ctx.fillRect(lx + 5.5, sy, 4, 3);
    ctx.fillRect(lx + 3, sy + 1, 2, 1); // White lace dot
    // Thick White Platform Sole
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(lx, sy + 4.2, 9.5, 2.2);
    // Bottom dark rubber tread pinstripe
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(lx, sy + 6, 9.5, 0.8);

    // Right Shoe
    ctx.fillStyle = '#111827'; // Outline
    ctx.fillRect(rx - 0.5, sy - 0.5, 10.5, 7);
    ctx.fillStyle = '#dc2626'; // Red canvas body
    ctx.fillRect(rx, sy, 9.5, 4.5);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(rx, sy + 2, 4, 2.5);
    ctx.fillStyle = '#ffffff'; // White bumper toe cap
    ctx.fillRect(rx + 5.5, sy, 4, 3);
    ctx.fillRect(rx + 3, sy + 1, 2, 1); // White lace dot
    // Thick White Platform Sole
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx, sy + 4.2, 9.5, 2.2);
    // Bottom dark rubber tread pinstripe
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rx, sy + 6, 9.5, 0.8);
  }
}

// 2. Draw Ultra-Detailed Female Hero (Maya - Matching Reference Image)
function drawFemaleHero(ctx, p, tick) {
  const isDucking = p.isDucking;
  const isJumping = !p.grounded;
  const isRunning = Math.abs(p.vx) > 0.2 && p.grounded;

  const legCycle = isRunning ? Math.sin(p.animFrame) : 0;
  const armCycle = isRunning ? Math.sin(p.animFrame) : 0;
  const bobY = isRunning ? Math.abs(Math.sin(p.animFrame * 2)) * 2.2 : 0;
  // Dynamic ponytail physics responding to movement, jumps & slide wind drag
  const hairSway = isDucking ? -16 : (isRunning ? -Math.sin(p.animFrame) * 8 - 5 : Math.sin(tick * 0.1) * 3);

  // 1. Dynamic Slide Ghost Trails / Motion Blur (Crimson & Amber friction)
  if (isDucking) {
    ctx.save();
    // Ghost Trail 1 (Vibrant Red)
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-22, 10, 20, 14);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-16, 12, 12, 10);
    // Ghost Trail 2 (White inner flash)
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-30, 12, 14, 10);
    ctx.restore();
  }

  // Ground Drop Shadow (Scales with jump height)
  const shadowScale = isJumping ? Math.max(0.4, 1 - Math.abs(p.vy) * 0.04) : 1;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  ctx.beginPath();
  ctx.ellipse(isDucking ? -4 : 0, 29, 16 * shadowScale, 4.5 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Charcoal/Black Tech Backpack (on back)
  const bpX = isDucking ? -22 : -17;
  const bpY = (isDucking ? 6 : -18) + (isDucking ? 0 : bobY);
  ctx.fillStyle = '#09090b'; // Outline
  ctx.fillRect(bpX - 1, bpY - 1, 10, 23);
  ctx.fillStyle = '#18181b'; // Charcoal fabric
  ctx.fillRect(bpX, bpY, 8, 21);
  ctx.fillStyle = '#27272a'; // Highlight rib
  ctx.fillRect(bpX + 1, bpY + 1, 3, 19);
  // Backpack silver zipper / pull tab
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(bpX + 2, bpY + 7, 4, 3);
  ctx.fillStyle = '#71717a';
  ctx.fillRect(bpX + 3, bpY + 8, 2, 1);

  // 3. Torso: Open Red Zip-Up Hoodie / Jacket & White T-Shirt with Red Pixel Heart
  const torsoY = (isDucking ? 6 : -19) + (isDucking ? 0 : bobY);
  const torsoH = isDucking ? 14 : 23;

  // Dark Outline
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-11, torsoY - 0.5, 21, torsoH + 1);

  // Inner Crisp White Crewneck T-Shirt
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-6, torsoY + 2, 12, torsoH - 2);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(-5, torsoY + 6, 10, torsoH - 6);
  ctx.fillStyle = '#e2e8f0'; // Shirt fold crease
  ctx.fillRect(-4, torsoY + 12, 8, 1.5);

  // ❤️ ICONIC RED PIXEL HEART GRAPHIC (<3) ON CHEST (Exact match from reference image!)
  if (!isDucking) {
    const heartX = -2;
    const heartY = torsoY + 7;
    ctx.fillStyle = '#dc2626'; // Deep ruby red heart
    // Row 1: two lobes
    ctx.fillRect(heartX - 2, heartY, 2, 2);
    ctx.fillRect(heartX + 2, heartY, 2, 2);
    // Row 2: full heart width
    ctx.fillRect(heartX - 3, heartY + 2, 8, 2);
    // Row 3: taper
    ctx.fillRect(heartX - 2, heartY + 4, 6, 2);
    // Row 4: bottom point
    ctx.fillRect(heartX - 1, heartY + 6, 4, 1.5);
    ctx.fillRect(heartX, heartY + 7.5, 2, 1);
    // Heart glint dot
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(heartX - 1, heartY + 2, 1.5, 1.5);
  } else {
    // Sliding compressed heart graphic
    const heartX = -1;
    const heartY = torsoY + 4;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(heartX - 2, heartY, 6, 3);
    ctx.fillRect(heartX - 1, heartY + 3, 4, 1.5);
  }

  // Open Red Jacket / Hoodie Panels (Left & Right framing the white shirt)
  // Left jacket panel
  ctx.fillStyle = '#991b1b'; // Deep red shadow
  ctx.fillRect(-10.5, torsoY + 1, 5.5, torsoH - 1);
  ctx.fillStyle = '#dc2626'; // Main vibrant red
  ctx.fillRect(-9.5, torsoY + 1.5, 4, torsoH - 2);
  ctx.fillStyle = '#ef4444'; // Red fold highlight
  ctx.fillRect(-8.5, torsoY + 2, 2, torsoH - 4);

  // Right jacket panel
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(5, torsoY + 1, 5.5, torsoH - 1);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(5.5, torsoY + 1.5, 4, torsoH - 2);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(6, torsoY + 2, 2, torsoH - 4);

  // Popped Hoodie Collar around neck
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(-7.5, torsoY - 1, 4, 3.5);
  ctx.fillRect(3.5, torsoY - 1, 4, 3.5);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-6.5, torsoY - 1, 2.5, 2);
  ctx.fillRect(4.5, torsoY - 1, 2.5, 2);

  // Black Backpack Shoulder Strap (running over right shoulder)
  ctx.fillStyle = '#18181b';
  ctx.fillRect(-7, torsoY + 2.5, 3, torsoH - 3.5);
  ctx.fillStyle = '#27272a';
  ctx.fillRect(-6.5, torsoY + 3, 1.8, torsoH - 4.5);
  ctx.fillStyle = '#e2e8f0'; // Silver buckle
  ctx.fillRect(-7.5, torsoY + 8, 3.5, 2);

  // 4. Head, Face & Brunette Anime Hair with Signature White Glint
  const headY = (isDucking ? -6 : -29) + (isDucking ? 0 : bobY);
  const headX = isDucking ? -3 : -8;

  // Slender Neck with Peach Tone
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(headX + 4, headY + 12, 6, 3);
  ctx.fillStyle = '#fba97b';
  ctx.fillRect(headX + 5, headY + 12, 4.5, 3);

  // Face Base & Radiant Warm Peach Skin
  ctx.fillStyle = '#1a0f0d'; // Outline
  ctx.fillRect(headX - 0.5, headY - 0.5, 17, 14);
  ctx.fillStyle = '#fcdab7'; // Skin base
  ctx.fillRect(headX, headY, 16, 13);
  // Cute Peach-Pink Blush on Cheeks
  ctx.fillStyle = '#fb7185';
  ctx.fillRect(headX + 3, headY + 7, 5, 2.5);
  ctx.fillStyle = '#fda4af';
  ctx.fillRect(headX + 4, headY + 8, 2, 1);

  // Ear on side
  ctx.fillStyle = '#1a0f0d';
  ctx.fillRect(headX - 2.5, headY + 5, 3, 5);
  ctx.fillStyle = '#fba97b';
  ctx.fillRect(headX - 2, headY + 5.5, 2, 4);

  // Facial Features: Expressive Anime Eye & Eyelash
  ctx.fillStyle = '#111827'; // Dark winged upper eyelash
  ctx.fillRect(headX + 8.5, headY + 3, 6, 2.2);
  ctx.fillRect(headX + 13.5, headY + 2.5, 1.5, 1.5);
  // Rich Warm Amber / Hazel Iris
  ctx.fillStyle = '#92400e';
  ctx.fillRect(headX + 9, headY + 4.5, 4.5, 4.5);
  ctx.fillStyle = '#18181b'; // Pupil
  ctx.fillRect(headX + 10.5, headY + 5.5, 2.5, 3);
  // Dual Specular Catchlight Glints
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(headX + 11.5, headY + 4.5, 1.8, 1.8);
  ctx.fillRect(headX + 9.5, headY + 7, 1, 1);

  // Delicate Confident Mouth
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(headX + 9, headY + 10, 3.5, 1.2);

  // 5. Rich Brunette Anime Hair with Signature White Glint & Red Scrunchie Ponytail
  // Base hair mass (Chestnut/espresso brown)
  ctx.fillStyle = '#271206'; // Hair outline/shadow
  ctx.fillRect(headX - 2, headY - 6, 19, 9);
  ctx.fillRect(headX - 2, headY - 2, 5, 11);
  ctx.fillStyle = '#5c270d'; // Main chestnut brown
  ctx.fillRect(headX - 1, headY - 5, 17, 8);
  ctx.fillStyle = '#78350f'; // Warm brown midtone
  ctx.fillRect(headX + 2, headY - 5, 13, 5);

  // Sweeping Front Bangs
  ctx.fillStyle = '#5c270d';
  ctx.fillRect(headX + 4, headY - 2, 7, 4);
  ctx.fillRect(headX + 8, headY + 1, 4, 3);

  // ⭐ SIGNATURE WHITE/LIGHT SPECULAR GLINT STREAK (Exact match with reference image!)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(headX + 5, headY - 4, 3.5, 2);
  ctx.fillRect(headX + 7, headY - 2, 3.5, 2);
  ctx.fillRect(headX + 9, headY, 3, 2);
  // Soft glint halo
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(headX + 4, headY - 3, 1.5, 1.5);
  ctx.fillRect(headX + 10, headY - 1, 1.5, 1.5);

  // 🎀 HIGH PONYTAIL TIED WITH RED SCRUNCHIE (Iconic feature from reference!)
  // Red Scrunchie at crown base
  const ponyBaseX = headX - 6 + hairSway * 0.3;
  const ponyBaseY = headY - 3;
  ctx.fillStyle = '#991b1b'; // Scrunchie shadow
  ctx.fillRect(ponyBaseX - 1, ponyBaseY - 1, 6, 6);
  ctx.fillStyle = '#dc2626'; // Bright red scrunchie
  ctx.fillRect(ponyBaseX, ponyBaseY, 4.5, 4.5);
  ctx.fillStyle = '#ef4444'; // Scrunchie highlight
  ctx.fillRect(ponyBaseX + 1, ponyBaseY, 2.5, 1.5);

  // High Voluminous Wavy Ponytail Cascading Down Behind
  ctx.fillStyle = '#271206'; // Ponytail core shadow
  ctx.fillRect(headX - 12 + hairSway, headY - 2, 9, 18);
  ctx.fillRect(headX - 15 + hairSway, headY + 6, 7, 16);
  // Warm brown wavy volume
  ctx.fillStyle = '#5c270d';
  ctx.fillRect(headX - 11 + hairSway, headY, 7.5, 15);
  ctx.fillRect(headX - 14 + hairSway, headY + 7, 6, 14);
  // Ponytail curl highlights
  ctx.fillStyle = '#78350f';
  ctx.fillRect(headX - 10 + hairSway, headY + 3, 5, 10);
  ctx.fillRect(headX - 13 + hairSway, headY + 11, 4, 8);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(headX - 9 + hairSway, headY + 15, 3, 6);

  // 6. Arms & Bare Forearms (Sleeves Rolled Up to Elbows)
  if (isDucking) {
    // Sliding pose: Right arm bracing ground deck, left arm stabilizing back
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-12, 12, 6, 5); // Red sleeve
    ctx.fillStyle = '#fcdab7'; // Bare forearm skin
    ctx.fillRect(-13, 17, 7, 6);
    // Wristband on right wrist
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-14, 21, 6, 2);
    // Bracing palm on tarmac
    ctx.fillStyle = '#f5ba8b';
    ctx.fillRect(-15, 23, 8, 3);

    // Trailing Arm
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, 9, 8, 4);
    ctx.fillStyle = '#fcdab7';
    ctx.fillRect(11, 9, 6, 3.5);
  } else {
    // Dynamic run swing: Rolled-up red sleeve, bare forearm, wristband, fist
    const armX = -4 + armCycle * 6.5;
    const armY = -14 + bobY;

    // Red rolled-up sleeve ending at elbow
    ctx.fillStyle = '#0f172a'; // Outline
    ctx.fillRect(armX - 1, armY - 0.5, 7.5, 8);
    ctx.fillStyle = '#dc2626'; // Red sleeve
    ctx.fillRect(armX, armY, 6, 7);
    ctx.fillStyle = '#ef4444'; // Sleeve cuff fold
    ctx.fillRect(armX, armY + 5, 6, 2);

    // Bare muscular / athletic forearm skin
    ctx.fillStyle = '#0f172a'; // Outline
    ctx.fillRect(armX - 0.5, armY + 6.5, 6.5, 7.5);
    ctx.fillStyle = '#fcdab7'; // Skin highlight
    ctx.fillRect(armX, armY + 7, 5.5, 6.5);
    ctx.fillStyle = '#f5ba8b'; // Underside shadow
    ctx.fillRect(armX + 3, armY + 8, 2.5, 5.5);

    // Dark wristband on right wrist (as in reference image)
    ctx.fillStyle = '#18181b';
    ctx.fillRect(armX - 0.5, armY + 12, 6, 2.2);

    // Clenched fist
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(armX - 0.5, armY + 14, 6, 5);
    ctx.fillStyle = '#fcdab7';
    ctx.fillRect(armX, armY + 14.5, 5, 4);
    ctx.fillStyle = '#c2612a';
    ctx.fillRect(armX + 1, armY + 17, 3, 1);
  }

  // 7. Baggy Black / Dark Charcoal Cargo Pants with Flap Pockets
  ctx.fillStyle = '#09090b'; // Dark outline
  if (isJumping) {
    ctx.fillRect(-8.5, 4.5, 8, 11);
    ctx.fillRect(0.5, 2.5, 8, 11);
    // Dark charcoal cargo fabric
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-8, 5, 7, 10);
    ctx.fillRect(1, 3, 7, 10);
    // Crease highlights
    ctx.fillStyle = '#27272a';
    ctx.fillRect(-7, 6, 5, 4);
    ctx.fillRect(2, 4, 5, 4);
    // Cargo flap pocket on thigh
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(-7.5, 8, 6, 2);
    ctx.fillRect(1.5, 6, 6, 2);
  } else if (isDucking) {
    // Sliding stance: Wide low profile
    ctx.fillRect(-15.5, 11.5, 14, 8);
    ctx.fillRect(-2.5, 12.5, 18, 7);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-15, 12, 13, 7);
    ctx.fillRect(-2, 13, 17, 6);
    ctx.fillStyle = '#27272a';
    ctx.fillRect(3, 13, 6, 4);
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(-13, 13, 5, 2);
  } else {
    const lLegX = -8 - legCycle * 7.5;
    const rLegX = 2 + legCycle * 7.5;
    // Baggy relaxed leg silhouette
    ctx.fillRect(lLegX - 0.5, 4.5 + bobY, 8, 14);
    ctx.fillRect(rLegX - 0.5, 4.5 + bobY, 8, 14);
    // Charcoal body
    ctx.fillStyle = '#18181b';
    ctx.fillRect(lLegX, 5 + bobY, 7, 13);
    ctx.fillRect(rLegX, 5 + bobY, 7, 13);
    // 3D Crease folds
    ctx.fillStyle = '#27272a';
    ctx.fillRect(lLegX + 1, 7 + bobY, 5, 4);
    ctx.fillRect(rLegX + 1, 7 + bobY, 5, 4);
    // Cargo side flap pockets on outer thigh!
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(lLegX, 9 + bobY, 6.5, 2);
    ctx.fillRect(rLegX + 1, 9 + bobY, 6.5, 2);
    // Baggy cuffs gathering at ankles
    ctx.fillStyle = '#09090b';
    ctx.fillRect(lLegX, 16 + bobY, 7, 2);
    ctx.fillRect(rLegX, 16 + bobY, 7, 2);
  }

  // 8. Red & White High-Top Skate Sneakers (Matching Reference Image!)
  if (isJumping) {
    ctx.fillStyle = '#0f172a'; // Outline
    ctx.fillRect(-9.5, 15.5, 10, 7);
    ctx.fillRect(0.5, 13.5, 10, 7);
    // Red canvas upper
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-9, 16, 9, 4);
    ctx.fillRect(1, 14, 9, 4);
    // White toe bumper cap
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, 16, 5, 2.5);
    ctx.fillRect(5, 14, 5, 2.5);
    // Thick white platform sole
    ctx.fillRect(-9, 19.5, 9, 2.5);
    ctx.fillRect(1, 17.5, 9, 2.5);
    // Dark bottom tread
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-9, 21.5, 9, 0.8);
    ctx.fillRect(1, 19.5, 9, 0.8);
  } else if (isDucking) {
    // Sliding shoe flat on ground scraping tarmac with friction sparks
    ctx.fillStyle = '#dc2626'; // Red canvas
    ctx.fillRect(-18, 17, 12, 4);
    ctx.fillRect(12, 15, 11, 4);
    ctx.fillStyle = '#ffffff'; // White toe cap
    ctx.fillRect(19, 15, 4, 3);
    // Thick white sole
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-18, 20, 12, 2.2);
    ctx.fillRect(12, 18.5, 11, 2.2);
    // Dark tread
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-18, 22, 12, 0.8);
    ctx.fillRect(12, 20.5, 11, 0.8);
    // Friction sparks
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-20, 21, 5, 2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-22, 22, 4, 1.5);
  } else {
    const lx = -9 - legCycle * 7.5;
    const rx = 1 + legCycle * 7.5;
    const sy = 19 + bobY;

    // Left Shoe: Red canvas + White platform sole + White toe cap
    ctx.fillStyle = '#0f172a'; // Outline
    ctx.fillRect(lx - 0.5, sy - 0.5, 10.5, 7);
    ctx.fillStyle = '#dc2626'; // Red canvas body
    ctx.fillRect(lx, sy, 9.5, 4.5);
    ctx.fillStyle = '#b91c1c'; // Canvas shadow
    ctx.fillRect(lx, sy + 2, 4, 2.5);
    ctx.fillStyle = '#ffffff'; // White bumper toe cap
    ctx.fillRect(lx + 5.5, sy, 4, 3);
    ctx.fillRect(lx + 3, sy + 1, 2, 1); // White lace dot
    // Thick White Platform Sole
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(lx, sy + 4.2, 9.5, 2.2);
    // Bottom dark tread
    ctx.fillStyle = '#09090b';
    ctx.fillRect(lx, sy + 6, 9.5, 0.8);

    // Right Shoe
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rx - 0.5, sy - 0.5, 10.5, 7);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(rx, sy, 9.5, 4.5);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(rx, sy + 2, 4, 2.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx + 5.5, sy, 4, 3);
    ctx.fillRect(rx + 3, sy + 1, 2, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx, sy + 4.2, 9.5, 2.2);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(rx, sy + 6, 9.5, 0.8);
  }
}

// 3. Draw Ultra-Detailed Animated 3D Red Cyber-Bug
function drawDetailedBug(ctx, bug, tick) {
  const bx = bug.x;
  const by = bug.y;

  ctx.save();

  if (!bug.alive) {
    // Sizzling squashed cyber-bug remnant
    if (bug.squashedTimer > 0) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.beginPath();
      ctx.ellipse(bx + bug.w / 2, by + bug.h - 3, 21, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(bx + bug.w / 2 - 12, by + bug.h - 6, 24, 3);
      // Glitch circuit splats
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx + bug.w / 2 - 16, by + bug.h - 4, 6, 2.5);
      ctx.fillRect(bx + bug.w / 2 + 10, by + bug.h - 4, 7, 2.5);
      // Sparks
      if (tick % 4 < 2) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bx + bug.w / 2 - 4, by + bug.h - 8, 3, 3);
        ctx.fillRect(bx + bug.w / 2 + 5, by + bug.h - 9, 2, 2);
      }
    }
    ctx.restore();
    return;
  }

  // 1. Realistic Ground Contact Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
  ctx.beginPath();
  ctx.ellipse(bx + bug.w / 2, by + bug.h + 2, 19, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Six Articulated Multi-Segment Mechanical Legs (Authentic Tripod Crawl Gait)
  const legCycle = Math.sin(bug.legPhase);
  ctx.strokeStyle = '#450a0a';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left 3 Legs (Front, Middle, Rear)
  // Front Left Leg
  ctx.beginPath();
  ctx.moveTo(bx + 9, by + 13);
  ctx.lineTo(bx - 3, by + 5 + legCycle * 4.5);
  ctx.lineTo(bx - 10, by + 18 + legCycle * 4.5);
  ctx.stroke();
  // Middle Left Leg
  ctx.beginPath();
  ctx.moveTo(bx + 11, by + 18);
  ctx.lineTo(bx - 6, by + 18 - legCycle * 4.5);
  ctx.lineTo(bx - 13, by + 28 - legCycle * 4.5);
  ctx.stroke();
  // Rear Left Leg
  ctx.beginPath();
  ctx.moveTo(bx + 13, by + 23);
  ctx.lineTo(bx - 4, by + 26 + legCycle * 4.5);
  ctx.lineTo(bx - 9, by + 32 + legCycle * 4.5);
  ctx.stroke();

  // Right 3 Legs (Front, Middle, Rear)
  // Front Right Leg
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 9, by + 13);
  ctx.lineTo(bx + bug.w + 3, by + 5 - legCycle * 4.5);
  ctx.lineTo(bx + bug.w + 10, by + 18 - legCycle * 4.5);
  ctx.stroke();
  // Middle Right Leg
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 11, by + 18);
  ctx.lineTo(bx + bug.w + 6, by + 18 + legCycle * 4.5);
  ctx.lineTo(bx + bug.w + 13, by + 28 + legCycle * 4.5);
  ctx.stroke();
  // Rear Right Leg
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 13, by + 23);
  ctx.lineTo(bx + bug.w + 4, by + 26 - legCycle * 4.5);
  ctx.lineTo(bx + bug.w + 9, by + 32 - legCycle * 4.5);
  ctx.stroke();

  // Metallic Joint Nodes on Legs
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(bx - 4, by + 4 + legCycle * 4.5, 2.5, 2.5);
  ctx.fillRect(bx + bug.w + 1.5, by + 4 - legCycle * 4.5, 2.5, 2.5);

  // 3. 3D Domed Ruby Chitin Shell with Radial Depth
  const shellGrad = ctx.createRadialGradient(
    bx + bug.w / 2 - 4, by + bug.h / 2 - 5, 2,
    bx + bug.w / 2, by + bug.h / 2, 17
  );
  shellGrad.addColorStop(0, '#fca5a5');
  shellGrad.addColorStop(0.25, '#ef4444');
  shellGrad.addColorStop(0.65, '#b91c1c');
  shellGrad.addColorStop(0.9, '#7f1d1d');
  shellGrad.addColorStop(1, '#3b0707');

  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.arc(bx + bug.w / 2, by + bug.h / 2, 16, 0, Math.PI * 2);
  ctx.fill();

  // Armor Carapace Division Seam (Elytra Wing Divider)
  ctx.strokeStyle = '#280404';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(bx + bug.w / 2, by + 6);
  ctx.lineTo(bx + bug.w / 2, by + bug.h - 4);
  ctx.stroke();

  // Pulsing Cyber Glitch Fissures across Carapace
  const pulseGlitch = Math.sin(tick * 0.18 + bug.id) * 0.4 + 0.6;
  ctx.strokeStyle = `rgba(254, 205, 211, ${pulseGlitch})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(bx + bug.w / 2 - 8, by + 14);
  ctx.lineTo(bx + bug.w / 2 - 3, by + 18);
  ctx.lineTo(bx + bug.w / 2 - 7, by + 23);
  ctx.moveTo(bx + bug.w / 2 + 8, by + 14);
  ctx.lineTo(bx + bug.w / 2 + 3, by + 18);
  ctx.lineTo(bx + bug.w / 2 + 7, by + 23);
  ctx.stroke();

  // Specular Gloss Highlight Sheen (Gives spherical 3D volume)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
  ctx.beginPath();
  ctx.ellipse(bx + bug.w / 2 - 5, by + bug.h / 2 - 7, 7, 3.2, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // 4. Head Shield & Snapping Mandibles
  ctx.fillStyle = '#1c0303'; // Head capsule
  ctx.fillRect(bx + bug.w / 2 - 7, by + 18, 14, 8);
  
  // Animated Snapping Mandible Pincers
  const mandibleSnap = Math.abs(Math.sin(tick * 0.15)) * 2.5;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  // Left Pincer
  ctx.moveTo(bx + 11 - mandibleSnap, by + 21);
  ctx.lineTo(bx + 7 - mandibleSnap, by + 28);
  ctx.lineTo(bx + 13 - mandibleSnap, by + 25);
  ctx.fill();
  // Right Pincer
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 11 + mandibleSnap, by + 21);
  ctx.lineTo(bx + bug.w - 7 + mandibleSnap, by + 28);
  ctx.lineTo(bx + bug.w - 13 + mandibleSnap, by + 25);
  ctx.fill();

  // Venomous Sharp Fangs
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(bx + 15, by + 21);
  ctx.lineTo(bx + 17, by + 27);
  ctx.lineTo(bx + 18, by + 21);
  ctx.moveTo(bx + 22, by + 21);
  ctx.lineTo(bx + 23, by + 27);
  ctx.lineTo(bx + 25, by + 21);
  ctx.fill();

  // 5. Angry Glowing Compound Insect Eyes
  // Left Eye (White sclera base)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(bx + 9, by + 8);
  ctx.lineTo(bx + 17, by + 12);
  ctx.lineTo(bx + 11, by + 17);
  ctx.closePath();
  ctx.fill();
  // Right Eye
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 9, by + 8);
  ctx.lineTo(bx + bug.w - 17, by + 12);
  ctx.lineTo(bx + bug.w - 11, by + 17);
  ctx.closePath();
  ctx.fill();

  // Glowing evil pupil cores
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(bx + 12, by + 11, 3.5, 4);
  ctx.fillRect(bx + bug.w - 15.5, by + 11, 3.5, 4);
  // Red optic laser glint
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 6;
  ctx.fillRect(bx + 13, by + 12, 1.8, 2.5);
  ctx.fillRect(bx + bug.w - 14.8, by + 12, 1.8, 2.5);
  ctx.shadowBlur = 0;

  // 6. Twitching Segmented Antennae with Pulsing Warning Orbs
  const antennaTwitch = Math.sin(tick * 0.25 + bug.id) * 3;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.8;
  // Left antenna
  ctx.beginPath();
  ctx.moveTo(bx + 11, by + 5);
  ctx.quadraticCurveTo(bx + 3, by - 3, bx + 1 + antennaTwitch, by - 10);
  ctx.stroke();
  // Right antenna
  ctx.beginPath();
  ctx.moveTo(bx + bug.w - 11, by + 5);
  ctx.quadraticCurveTo(bx + bug.w - 3, by - 3, bx + bug.w - 1 - antennaTwitch, by - 10);
  ctx.stroke();

  // Glowing Plasma Antenna Tips
  ctx.fillStyle = '#fde047';
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 9;
  ctx.beginPath();
  ctx.arc(bx + 1 + antennaTwitch, by - 10, 3, 0, Math.PI * 2);
  ctx.arc(bx + bug.w - 1 - antennaTwitch, by - 10, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

// ==========================================
// HIGH-DEFINITION DIALOGUE PORTRAIT RENDERERS (64x64 Pixel Art)
// ==========================================

function drawMalePortrait(ctx) {
  // 1. Dark cyber vignette background with glowing radial aura
  ctx.fillStyle = '#060d1f';
  ctx.fillRect(0, 0, 64, 64);
  
  const bgGrad = ctx.createRadialGradient(32, 28, 2, 32, 28, 28);
  bgGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
  bgGrad.addColorStop(0.6, 'rgba(30, 58, 95, 0.16)');
  bgGrad.addColorStop(1, 'rgba(6, 13, 31, 0)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 64, 64);

  // Subtle retro scanline texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let y = 0; y < 64; y += 2) {
    ctx.fillRect(0, y, 64, 1);
  }

  // 2. Shoulders & Outfit: Open Dark Navy Jacket & White Crewneck Tee
  // Dark jacket outline
  ctx.fillStyle = '#111827';
  ctx.fillRect(4, 46, 56, 18);

  // Inner White / Light Gray Crewneck T-Shirt
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(18, 44, 28, 20);
  ctx.fillStyle = '#dbeafe'; // Soft blue fold shadow
  ctx.fillRect(20, 48, 24, 16);
  ctx.fillStyle = '#94a3b8'; // Crease lines
  ctx.fillRect(24, 52, 16, 2);
  ctx.fillRect(26, 57, 12, 1.5);

  // Open Navy Jacket Lapels / Panels (Flanking the inner tee)
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(6, 47, 14, 17);
  ctx.fillRect(44, 47, 14, 17);
  ctx.fillStyle = '#2b4c7e'; // Navy lapel highlight
  ctx.fillRect(8, 48, 8, 16);
  ctx.fillRect(48, 48, 8, 16);

  // Saddle-Brown Leather Backpack Shoulder Strap (across right chest)
  ctx.fillStyle = '#1a0f0d';
  ctx.fillRect(14, 44, 8, 20);
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(15, 44, 6, 20);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(16, 45, 3, 19);
  // Metallic Brass Buckle
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(14, 53, 8, 4);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(16, 54, 4, 2);

  // 3. Neck & Chin
  ctx.fillStyle = '#1a0f0d'; // Outline
  ctx.fillRect(23, 38, 18, 8);
  ctx.fillStyle = '#c2612a'; // Deep neck shadow
  ctx.fillRect(24, 39, 16, 7);
  ctx.fillStyle = '#f5ba8b'; // Warm neck tone
  ctx.fillRect(26, 38, 12, 6);

  // 4. Face Base & Jawline
  ctx.fillStyle = '#1a0f0d'; // Jawline outline
  ctx.fillRect(18, 18, 28, 24);
  ctx.fillStyle = '#fcdab7'; // Main warm skin
  ctx.fillRect(19, 19, 26, 22);
  // Warm cheek & jaw shading
  ctx.fillStyle = '#f5ba8b';
  ctx.fillRect(20, 32, 24, 8);
  ctx.fillStyle = '#d98555';
  ctx.fillRect(22, 38, 20, 2);

  // Left & Right Ears
  // Left Ear
  ctx.fillStyle = '#1a0f0d';
  ctx.fillRect(15, 27, 4, 9);
  ctx.fillStyle = '#f5ba8b';
  ctx.fillRect(16, 28, 3, 7);
  ctx.fillStyle = '#c2612a';
  ctx.fillRect(17, 30, 1.5, 3);
  // Right Ear
  ctx.fillStyle = '#1a0f0d';
  ctx.fillRect(45, 27, 4, 9);
  ctx.fillStyle = '#f5ba8b';
  ctx.fillRect(45, 28, 3, 7);
  ctx.fillStyle = '#c2612a';
  ctx.fillRect(45.5, 30, 1.5, 3);

  // 5. Facial Features (Determined Anime Expression)
  // Nose Shadow
  ctx.fillStyle = '#c2612a';
  ctx.fillRect(31, 31, 2, 4);
  ctx.fillRect(30, 34, 4, 1.5);

  // Neutral Determined Mouth
  ctx.fillStyle = '#1a0f0d';
  ctx.fillRect(28, 37, 8, 1.8);
  ctx.fillStyle = '#8b3a1a';
  ctx.fillRect(29, 37, 6, 1);

  // Eyes (Expressive Dark Anime Eyes with White Catchlight Glints)
  // Left Eye
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(23, 26, 6, 5);
  ctx.fillStyle = '#111827';
  ctx.fillRect(25, 26, 4, 5);
  ctx.fillStyle = '#ffffff'; // Signature catchlight glint dot
  ctx.fillRect(27, 26.5, 1.8, 1.8);

  // Right Eye
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(35, 26, 6, 5);
  ctx.fillStyle = '#111827';
  ctx.fillRect(35, 26, 4, 5);
  ctx.fillStyle = '#ffffff'; // Signature catchlight glint dot
  ctx.fillRect(37, 26.5, 1.8, 1.8);

  // Thick Determined Dark Eyebrows
  ctx.fillStyle = '#1a0f0d';
  ctx.fillRect(22, 23, 8, 2.5);
  ctx.fillRect(28, 24, 2, 1.5);
  ctx.fillRect(34, 24, 2, 1.5);
  ctx.fillRect(34, 23, 8, 2.5);

  // 6. Signature Dark Espresso Anime Hair with Iconic White Highlight Streak!
  // Deep hair outline
  ctx.fillStyle = '#1a0f0d';
  ctx.fillRect(16, 8, 32, 15);
  ctx.fillRect(17, 20, 4, 8);
  ctx.fillRect(43, 20, 4, 8);
  // Hair mass
  ctx.fillStyle = '#2d1a16';
  ctx.fillRect(18, 9, 28, 13);
  ctx.fillStyle = '#3e241f';
  ctx.fillRect(19, 10, 26, 10);

  // Hair Spikes (top volume)
  ctx.fillStyle = '#2d1a16';
  ctx.fillRect(19, 5, 6, 5);
  ctx.fillRect(26, 3, 7, 7);
  ctx.fillRect(34, 4, 7, 6);
  ctx.fillRect(41, 7, 5, 5);

  // Front Bangs pointing down over forehead
  ctx.fillStyle = '#2d1a16';
  ctx.fillRect(20, 19, 5, 5);
  ctx.fillRect(26, 19, 6, 6);
  ctx.fillRect(33, 19, 5, 5);
  ctx.fillRect(39, 19, 5, 4);

  // ⭐ SIGNATURE WHITE/LIGHT SPECULAR GLINT STREAK (Exact from reference image!)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(22, 6, 4, 3);
  ctx.fillRect(24, 9, 5, 3);
  ctx.fillRect(27, 12, 4, 3);
  ctx.fillRect(28, 15, 3, 3);
  ctx.fillRect(27, 18, 3, 3);
  // Soft glint aura
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(21, 7, 2, 2);
  ctx.fillRect(23, 11, 2, 2);
  ctx.fillRect(29, 14, 2, 2);
  ctx.fillRect(26, 17, 2, 2);
}

function drawFemalePortrait(ctx) {
  // 1. Ruby / Crimson cyberpunk vignette background
  ctx.fillStyle = '#18070b';
  ctx.fillRect(0, 0, 64, 64);

  const bgGrad = ctx.createRadialGradient(32, 28, 2, 32, 28, 28);
  bgGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
  bgGrad.addColorStop(0.6, 'rgba(185, 28, 28, 0.16)');
  bgGrad.addColorStop(1, 'rgba(24, 7, 11, 0)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 64, 64);

  // Scanline texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let y = 0; y < 64; y += 2) {
    ctx.fillRect(0, y, 64, 1);
  }

  // 2. High Brunette Ponytail tied high with red scrunchie flowing behind head
  ctx.fillStyle = '#271206'; // Deep shadow
  ctx.fillRect(7, 12, 11, 24);
  ctx.fillRect(5, 18, 9, 26);
  ctx.fillStyle = '#5c270d'; // Chestnut brown
  ctx.fillRect(8, 13, 9, 22);
  ctx.fillRect(6, 19, 7, 24);
  ctx.fillStyle = '#78350f'; // Midtone volume
  ctx.fillRect(9, 16, 5, 16);
  ctx.fillRect(7, 24, 4, 16);
  ctx.fillStyle = '#92400e'; // Hair highlight
  ctx.fillRect(10, 20, 3, 10);

  // 🎀 Crimson Red Scrunchie at ponytail tie-point
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(13, 13, 7, 7);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(14, 14, 5, 5);
  ctx.fillStyle = '#f87171';
  ctx.fillRect(15, 14, 3, 2);

  // 3. Open Red Hoodie Shoulders & Popped Collar
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(6, 48, 52, 16);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(8, 46, 48, 18);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(10, 48, 44, 16);

  // Popped red hoodie collar wings
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(15, 42, 9, 8);
  ctx.fillRect(40, 42, 9, 8);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(16, 43, 7, 6);
  ctx.fillRect(41, 43, 7, 6);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(17, 43, 3, 4);
  ctx.fillRect(42, 43, 3, 4);

  // Crisp White Crewneck T-Shirt revealed in middle
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(24, 46, 16, 18);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(26, 48, 12, 16);

  // ❤️ Signature Red Pixel Heart Graphic (<3) on White T-Shirt
  ctx.fillStyle = '#dc2626';
  // Top lobes
  ctx.fillRect(29, 52, 2, 2);
  ctx.fillRect(33, 52, 2, 2);
  // Full heart bar
  ctx.fillRect(28, 54, 8, 2);
  // Tapering
  ctx.fillRect(29, 56, 6, 2);
  // Bottom point
  ctx.fillRect(30, 58, 4, 1.5);
  ctx.fillRect(31, 59.5, 2, 1);
  // Specular glint dot on heart
  ctx.fillStyle = '#fca5a5';
  ctx.fillRect(29, 54, 1, 1);

  // Black Backpack Straps over shoulders
  ctx.fillStyle = '#18181b';
  ctx.fillRect(12, 47, 4, 17);
  ctx.fillRect(48, 47, 4, 17);
  ctx.fillStyle = '#e2e8f0'; // Silver buckles
  ctx.fillRect(12, 54, 4, 2);
  ctx.fillRect(48, 54, 4, 2);

  // 4. Slender Neck & Soft Chin
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(27, 39, 10, 6);
  ctx.fillStyle = '#fba97b';
  ctx.fillRect(28, 38, 8, 6);

  // 5. Face Base & Radiant Peach Skin
  ctx.fillStyle = '#fba97b';
  ctx.fillRect(23, 38, 18, 3);
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(21, 20, 22, 19);
  ctx.fillRect(25, 39, 14, 2);
  ctx.fillRect(28, 41, 8, 1);

  // Ears
  ctx.fillStyle = '#fba97b';
  ctx.fillRect(43, 27, 3, 7);
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(43, 28, 2, 5);

  // 6. Facial Features: Cute Rosy Blush, Lips & Expressive Eyes
  // Pink blush
  ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
  ctx.fillRect(23, 32, 6, 3);
  ctx.fillRect(36, 32, 6, 3);
  ctx.fillStyle = '#fb7185';
  ctx.fillRect(24, 33, 4, 1);
  ctx.fillRect(37, 33, 4, 1);

  // Delicate Lips
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(30, 36, 4, 2);
  ctx.fillStyle = '#fda4af';
  ctx.fillRect(31, 36, 2, 1);

  // Nose Shadow
  ctx.fillStyle = '#fba97b';
  ctx.fillRect(32, 31, 1, 3);

  // Expressive Anime Amber / Hazel Eyes
  // Left Eye (Black lash + wing)
  ctx.fillStyle = '#111827';
  ctx.fillRect(23, 24, 8, 2);
  ctx.fillRect(22, 24, 2, 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(24, 26, 6, 4);
  ctx.fillStyle = '#92400e'; // Warm hazel iris
  ctx.fillRect(25, 26, 4, 4);
  ctx.fillStyle = '#18181b';
  ctx.fillRect(26, 27, 2, 3);
  // Double Specular Glints
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(25, 26, 1, 2);
  ctx.fillRect(26, 26, 1, 1);
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(27, 28, 1, 1);

  // Right Eye (Black lash + wing)
  ctx.fillStyle = '#111827';
  ctx.fillRect(33, 24, 8, 2);
  ctx.fillRect(40, 24, 2, 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(34, 26, 6, 4);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(35, 26, 4, 4);
  ctx.fillStyle = '#18181b';
  ctx.fillRect(36, 27, 2, 3);
  // Double Specular Glints
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(35, 26, 1, 2);
  ctx.fillRect(36, 26, 1, 1);
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(37, 28, 1, 1);

  // Eyebrows
  ctx.fillStyle = '#451a03';
  ctx.fillRect(24, 23, 6, 1);
  ctx.fillRect(34, 23, 6, 1);

  // 7. Layered Chestnut Brunette Anime Hair & Sweeping Fringe
  ctx.fillStyle = '#271206'; // Hair core outline
  ctx.fillRect(19, 10, 26, 11);
  ctx.fillRect(19, 21, 4, 8);
  ctx.fillRect(41, 21, 4, 8);

  ctx.fillStyle = '#5c270d';
  ctx.fillRect(20, 10, 24, 10);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(21, 11, 22, 8);

  // Sweeping Bangs
  ctx.fillRect(21, 18, 4, 6);
  ctx.fillRect(26, 18, 6, 4);
  ctx.fillRect(33, 18, 5, 5);
  ctx.fillRect(39, 18, 4, 6);
  // Warm brown highlights
  ctx.fillStyle = '#92400e';
  ctx.fillRect(22, 12, 6, 3);
  ctx.fillRect(32, 12, 7, 3);

  // ⭐ SIGNATURE WHITE/LIGHT SPECULAR GLINT STREAK (Exact match from reference image!)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(33, 11, 4, 3);
  ctx.fillRect(35, 14, 4, 3);
  ctx.fillRect(37, 17, 3, 3);
  ctx.fillRect(38, 20, 3, 3);
  // Soft glint halo
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(32, 12, 2, 2);
  ctx.fillRect(39, 16, 2, 2);
}

// React component for crisp retro pixel-art dialogue avatar
const PixelAvatar = ({ hero, size = 54 }) => {
  const avatarCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = avatarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 64, 64);
    if (hero === 'male') {
      drawMalePortrait(ctx);
    } else {
      drawFemalePortrait(ctx);
    }
  }, [hero]);

  return (
    <canvas
      ref={avatarCanvasRef}
      width={64}
      height={64}
      className="pixel-avatar-canvas"
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label={`${hero === 'male' ? 'Aditya' : 'Maya'} pixel art avatar`}
    />
  );
};

// ==========================================
// ENDLESS RUNNER RENDERERS & POWER-UPS
// ==========================================

// Flying Glitch Drone Bug (Hovering cyber obstacle with 3D fuselage & laser)
function drawFlyingDrone(ctx, drone, tick) {
  const dx = drone.x;
  const dy = drone.y + Math.sin(tick * 0.12 + (drone.phase || 0)) * 5.5;
  const dw = drone.w;
  const dh = drone.h;

  ctx.save();
  if (!drone.alive) {
    if (drone.squashedTimer > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(dx + dw / 2, dy + dh / 2, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(dx + dw / 2 - 8, dy + dh / 2 - 2, 16, 3);
    }
    ctx.restore();
    return;
  }

  // 1. Downward Scanning Hazard Laser Beam (Telegraphs exact clearance for Brake & Slide!)
  const laserAlpha = Math.sin(tick * 0.16) * 0.05 + 0.14;
  ctx.save();
  // Translucent warning laser cone
  ctx.fillStyle = `rgba(239, 68, 68, ${laserAlpha})`;
  ctx.beginPath();
  ctx.moveTo(dx + dw / 2 - 4, dy + dh);
  ctx.lineTo(dx - 18, 395);
  ctx.lineTo(dx + dw + 18, 395);
  ctx.lineTo(dx + dw / 2 + 4, dy + dh);
  ctx.closePath();
  ctx.fill();

  // Red laser scan bar on ground deck
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.2;
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 9;
  ctx.beginPath();
  ctx.moveTo(dx - 18, 395);
  ctx.lineTo(dx + dw + 18, 395);
  ctx.stroke();
  ctx.restore();

  // 2. Realistic Ground Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(dx + dw / 2, 395, 17, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Left & Right Heavy Engine Pylons & Spinning Rotor Discs
  // Rotor spin angle
  const spinW = Math.abs(Math.cos(tick * 0.9)) * 14;

  // Left Engine Pylon
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(dx - 6, dy + 7, 8, 8);
  ctx.fillStyle = '#f59e0b'; // Hazard chevron
  ctx.fillRect(dx - 4, dy + 9, 3, 4);

  // Left Spinning Energy Rotor Disc (3D perspective)
  ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.beginPath();
  ctx.ellipse(dx - 4, dy + 2, Math.max(4, spinW), 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(dx - 4 - spinW, dy + 2);
  ctx.lineTo(dx - 4 + spinW, dy + 2);
  ctx.stroke();

  // Right Engine Pylon
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(dx + dw - 2, dy + 7, 8, 8);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(dx + dw + 1, dy + 9, 3, 4);

  // Right Spinning Energy Rotor Disc
  ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.beginPath();
  ctx.ellipse(dx + dw + 4, dy + 2, Math.max(4, spinW), 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(dx + dw + 4 - spinW, dy + 2);
  ctx.lineTo(dx + dw + 4 + spinW, dy + 2);
  ctx.stroke();

  // 4. 3D Armored Hexagonal Fuselage Body
  // Outer metallic chassis
  ctx.fillStyle = '#090d16';
  ctx.fillRect(dx + 3, dy + 2, dw - 6, dh - 4);
  // 3D Top bevel highlight
  ctx.fillStyle = '#334155';
  ctx.fillRect(dx + 4, dy + 2, dw - 8, 2.5);
  // Midtone armor plate
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(dx + 4, dy + 4.5, dw - 8, dh - 9);

  // Neon Cyan Armor Trim & Seams
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(dx + 3, dy + 2, dw - 6, dh - 4);

  // 5. High-Tech Camera Turret & Blinking Scanner Eye
  const eyeColor = Math.sin(tick * 0.22) > 0 ? '#ef4444' : '#f59e0b';
  ctx.fillStyle = '#020617'; // Eye socket
  ctx.fillRect(dx + dw / 2 - 7, dy + 6, 14, 8);
  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = 10;
  ctx.fillRect(dx + dw / 2 - 4.5, dy + 7.5, 9, 5);
  // Specular glint on lens
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 0;
  ctx.fillRect(dx + dw / 2 + 1, dy + 8, 2, 2);

  // 6. Wingtip Strobe Beacons
  const beaconOn = tick % 16 < 8;
  if (beaconOn) {
    // Left Red Beacon
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 7;
    ctx.beginPath();
    ctx.arc(dx - 5, dy + 11, 2, 0, Math.PI * 2);
    ctx.fill();
    // Right Cyan Beacon
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.beginPath();
    ctx.arc(dx + dw + 5, dy + 11, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // 7. Dynamic Electrical Glitch Sparks
  if (tick % 20 < 5) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(dx - 3, dy + 8);
    ctx.lineTo(dx - 9, dy + 4);
    ctx.lineTo(dx - 12, dy + 10);
    ctx.moveTo(dx + dw + 3, dy + 8);
    ctx.lineTo(dx + dw + 9, dy + 4);
    ctx.lineTo(dx + dw + 13, dy + 10);
    ctx.stroke();
  }

  ctx.restore();
}

// ⚡ Turbo Coffee Power-up
function drawCoffeePowerup(ctx, x, y, tick) {
  const cy = y + Math.sin(tick * 0.08) * 4;
  ctx.save();
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 12;

  // Cup body
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x + 4, cy + 4, 18, 18);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x + 4, cy + 10, 18, 6);

  // Handle
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x + 24, cy + 12, 4, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  // Lightning bolt on cup
  ctx.fillStyle = '#eab308';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('⚡', x + 8, cy + 17);

  // Steam
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
  ctx.lineWidth = 1.5;
  const steamOffset = Math.sin(tick * 0.12) * 2;
  ctx.beginPath();
  ctx.moveTo(x + 8, cy + 2);
  ctx.quadraticCurveTo(x + 10 + steamOffset, cy - 4, x + 8, cy - 8);
  ctx.moveTo(x + 16, cy + 2);
  ctx.quadraticCurveTo(x + 18 - steamOffset, cy - 4, x + 16, cy - 8);
  ctx.stroke();

  ctx.restore();
}

// 🛡️ Firewall Shield Power-up
function drawShieldPowerup(ctx, x, y, tick) {
  const sy = y + Math.sin(tick * 0.09) * 4;
  ctx.save();
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 14;

  // Orb
  ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
  ctx.beginPath();
  ctx.arc(x + 14, sy + 14, 16, 0, Math.PI * 2);
  ctx.fill();

  // Rotating hexagon
  ctx.save();
  ctx.translate(x + 14, sy + 14);
  ctx.rotate(tick * 0.04);
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = Math.cos(angle) * 12;
    const py = Math.sin(angle) * 12;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // Shield icon
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('🛡️', x + 7, sy + 18);

  ctx.restore();
}

// Active Protective Shield Aura on Player
function drawPlayerShieldAura(ctx, x, y, tick) {
  ctx.save();
  ctx.translate(x, y);
  const pulse = Math.sin(tick * 0.1) * 3;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 16;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + tick * 0.02;
    const px = Math.cos(angle) * (36 + pulse);
    const py = Math.sin(angle) * (36 + pulse);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Active Turbo Aura on Player
function drawPlayerTurboAura(ctx, x, y, tick) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
  ctx.lineWidth = 2;
  const ringR = 24 + (tick % 16) * 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// 3D Cyber Billboard with Structural Lattice & Overhead Floodlamps
function drawBillboard(ctx, bbX, bbY) {
  const bbW = 175;
  const bbH = 125;
  ctx.save();

  // 1. 3D Steel Truss Support Pillars with Cross-Braces
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  // Left pillar
  ctx.strokeRect(bbX + 26, bbY + bbH, 12, 160);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(bbX + 26, bbY + bbH, 12, 160);
  // Right pillar
  ctx.strokeRect(bbX + bbW - 38, bbY + bbH, 12, 160);
  ctx.fillRect(bbX + bbW - 38, bbY + bbH, 12, 160);
  // Diagonal cross-bracing
  ctx.beginPath();
  for (let ly = bbY + bbH; ly < bbY + bbH + 150; ly += 32) {
    ctx.moveTo(bbX + 38, ly);
    ctx.lineTo(bbX + bbW - 38, ly + 32);
    ctx.moveTo(bbX + bbW - 38, ly);
    ctx.lineTo(bbX + 38, ly + 32);
  }
  ctx.stroke();

  // 2. 3D Billboard Backplane Shadow & Depth Edge
  ctx.fillStyle = '#060b17';
  ctx.beginPath();
  ctx.moveTo(bbX + bbW, bbY);
  ctx.lineTo(bbX + bbW + 8, bbY - 8);
  ctx.lineTo(bbX + bbW + 8, bbY + bbH - 8);
  ctx.lineTo(bbX + bbW, bbY + bbH);
  ctx.closePath();
  ctx.fill();

  // 3D Top Bevel Plane
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(bbX, bbY);
  ctx.lineTo(bbX + 8, bbY - 8);
  ctx.lineTo(bbX + bbW + 8, bbY - 8);
  ctx.lineTo(bbX + bbW, bbY);
  ctx.closePath();
  ctx.fill();

  // 3. Main Screen Board
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(bbX, bbY, bbW, bbH);
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#3b82f6';
  ctx.shadowBlur = 10;
  ctx.strokeRect(bbX, bbY, bbW, bbH);

  // Screen Grid Scanlines
  ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
  for (let sy = bbY + 4; sy < bbY + bbH; sy += 6) {
    ctx.fillRect(bbX + 2, sy, bbW - 4, 1.5);
  }

  // 4. Overhead Cyber Spotlights
  ctx.fillStyle = '#64748b';
  ctx.fillRect(bbX + 35, bbY - 14, 16, 6);
  ctx.fillRect(bbX + bbW - 51, bbY - 14, 16, 6);
  // Light glow cones
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(bbX + 43, bbY - 8);
  ctx.lineTo(bbX + 15, bbY + bbH);
  ctx.lineTo(bbX + 80, bbY + bbH);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bbX + bbW - 43, bbY - 8);
  ctx.lineTo(bbX + bbW - 80, bbY + bbH);
  ctx.lineTo(bbX + bbW - 15, bbY + bbH);
  ctx.closePath();
  ctx.fill();

  // 5. Billboard Typography
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Press Start 2P", monospace';
  ctx.fillText('TAKE A', bbX + 20, bbY + 34);

  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = '#f59e0b';
  ctx.fillText('BRAKE!', bbX + 20, bbY + 54);

  ctx.shadowColor = '#38bdf8';
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px "Press Start 2P", monospace';
  ctx.fillText('ENDLESS RUN', bbX + 20, bbY + 78);

  ctx.shadowColor = '#22c55e';
  ctx.fillStyle = '#22c55e';
  ctx.fillText('SLIDE // JUMP', bbX + 20, bbY + 100);

  ctx.restore();
}

const TakeABreakGame = ({ onNavigate }) => {
  const canvasRef = useRef(null);

  // Game UI state
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [bestDistance, setBestDistance] = useState(() => {
    try {
      return parseInt(localStorage.getItem('portfolio_brake_best_distance') || '0', 10);
    } catch { return 0; }
  });
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('portfolio_brake_highscore') || '0', 10);
    } catch { return 0; }
  });
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState(null); // { type: 'turbo' | 'shield', seconds: number | null }
  const [hasShield, setHasShield] = useState(false);
  const [time, setTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'gameover'
  const [selectedHero, setSelectedHero] = useState('male'); // 'male' | 'female'
  const [dialogueText, setDialogueText] = useState(
    "Take a Brake! Run endlessly, tap BRAKE to slide under drone bugs, grab Turbo Coffee, and push your record!"
  );
  const [gameKey, setGameKey] = useState(0);

  // Shared keys object — written by both keyboard listeners and mobile touch buttons
  const keysRef = useRef({ left: false, right: false, up: false, down: false });

  // Refs for reactive game loop access
  const heroRef = useRef(selectedHero);
  useEffect(() => {
    heroRef.current = selectedHero;
  }, [selectedHero]);

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
      setDialogueText("Playing as Aditya! Let's conquer the bugs, hit the brakes when needed, and deploy clean code.");
    } else {
      setDialogueText("Playing as Maya! Fast, agile, and ready to slide under every runtime hazard.");
    }
  };

  // Restart Handler
  const handleRestart = () => {
    keysRef.current.left = false;
    keysRef.current.right = false;
    keysRef.current.up = false;
    keysRef.current.down = false;
    setScore(0);
    setDistance(0);
    setTime(0);
    setFinalTime(0);
    setLives(3);
    setHasShield(false);
    setActivePowerUp(null);
    setIsNewRecord(false);
    setIsPaused(false);
    setGameState('playing');
    setDialogueText("Run restarted! Tap BRAKE to slide under drone bugs, leap over gaps, and grab coffee!");
    setGameKey(k => k + 1);
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
    let screenShake = 0;
    let cameraX = 0;
    let turboTimer = 0; // 60 ticks per sec
    let playerHasShield = false;
    let bugsSquashedCount = 0;
    let lastBrakeAudioTick = 0;
    const reachedMilestones = new Set();

    // Procedural Stars
    const stars = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * CW,
        y: Math.random() * 240,
        size: Math.random() < 0.25 ? 2 : 1,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.05 + 0.02
      });
    }

    // Distant 3D Megastructures (Layer 1 - deep parallax: 0.08)
    const distantSpires = [
      { x: 30, w: 110, h: 350, spireH: 50 },
      { x: 190, w: 130, h: 410, spireH: 70 },
      { x: 370, w: 95, h: 320, spireH: 40 },
      { x: 510, w: 150, h: 430, spireH: 80 },
      { x: 710, w: 105, h: 360, spireH: 55 },
      { x: 870, w: 140, h: 420, spireH: 75 },
      { x: 1060, w: 120, h: 340, spireH: 45 }
    ];

    // 3D Midground Skyscrapers (Layer 2 - parallax: 0.22)
    const buildings = [
      { x: 20, w: 180, h: 230, roofDepth: 16, tint: 'blue' },
      { x: 220, w: 90, h: 270, roofDepth: 14, tint: 'cyan', antenna: true },
      { x: 330, w: 110, h: 330, roofDepth: 18, tint: 'amber', sign: 'CODE' },
      { x: 460, w: 125, h: 370, roofDepth: 20, tint: 'blue', helipad: true },
      { x: 605, w: 90, h: 290, roofDepth: 14, tint: 'magenta', antenna: true },
      { x: 715, w: 115, h: 320, roofDepth: 16, tint: 'amber', sign: 'BRAKE' },
      { x: 850, w: 110, h: 350, roofDepth: 18, tint: 'cyan', sign: 'TURBO' },
      { x: 980, w: 160, h: 390, roofDepth: 22, tint: 'blue', sign: 'DEBUG' }
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
      jumpPower: -12.6,
      gravity: 0.62,
      grounded: false,
      jumpsLeft: 2,
      isDucking: false,
      isBraking: false,
      facing: 1, // 1 right, -1 left
      invulnerable: 0,
      animFrame: 0
    };

    // Platforms & Entities
    let platforms = [];
    let laptops = [];
    let coins = [];
    let bugs = [];
    let drones = [];
    let powerups = [];

    // Procedural Endless Generation Setup
    let generatedUntilX = 1200;
    let chunkIndex = 0;

    const generateNextChunk = () => {
      const startX = generatedUntilX;
      const chunkW = 500;
      chunkIndex++;
      const pattern = chunkIndex % 6;

      if (pattern === 0) {
        // High-speed Runway with Coin Wave and Patrol Bug
        platforms.push({ x: startX, y: 395, w: chunkW, h: 105, type: 'ground' });
        for (let i = 0; i < 5; i++) {
          coins.push({
            id: Math.random(),
            x: startX + 80 + i * 65,
            y: 335 - Math.sin((i / 4) * Math.PI) * 45,
            r: 14,
            collected: false
          });
        }
        bugs.push({
          id: Math.random(),
          x: startX + 260,
          y: 365,
          w: 42,
          h: 30,
          minX: startX + 180,
          maxX: startX + 380,
          vx: 1.3,
          facing: 1,
          alive: true,
          legPhase: 0,
          squashedTimer: 0
        });
      } else if (pattern === 1) {
        // Chasm Pit Jump with Stepping Platform
        const gapW = 125;
        const leftW = 185;
        const rightW = chunkW - leftW - gapW;
        platforms.push({ x: startX, y: 395, w: leftW, h: 105, type: 'ground' });
        platforms.push({ x: startX + leftW + 20, y: 325, w: 85, h: 22, type: 'block' });
        coins.push({ id: Math.random(), x: startX + leftW + 62, y: 285, r: 14, collected: false });
        platforms.push({ x: startX + leftW + gapW, y: 395, w: rightW, h: 105, type: 'ground' });
        laptops.push({ id: Math.random(), x: startX + leftW + gapW + 60, y: 355, w: 36, h: 26, collected: false });
      } else if (pattern === 2) {
        // "TAKE A BRAKE" Low Clearance: Flying Drone Bug overhead!
        // Ground is solid (y=395), hovering drone is at y=326! Player must BRAKE & SLIDE!
        platforms.push({ x: startX, y: 395, w: chunkW, h: 105, type: 'ground' });
        drones.push({
          id: Math.random(),
          x: startX + 230,
          y: 326,
          w: 38,
          h: 24,
          alive: true,
          phase: 0,
          squashedTimer: 0
        });
        // Trail of 3 coins right under the drone rewarding slide
        coins.push({ id: Math.random(), x: startX + 180, y: 375, r: 12, collected: false });
        coins.push({ id: Math.random(), x: startX + 240, y: 375, r: 12, collected: false });
        coins.push({ id: Math.random(), x: startX + 300, y: 375, r: 12, collected: false });
        // Floating platform above with powerup
        platforms.push({ x: startX + 360, y: 275, w: 90, h: 22, type: 'block' });
        powerups.push({ id: Math.random(), type: 'turbo', x: startX + 395, y: 240, collected: false });
      } else if (pattern === 3) {
        // Ascending Cyber Rooftops
        platforms.push({ x: startX, y: 395, w: 140, h: 105, type: 'ground' });
        platforms.push({ x: startX + 160, y: 340, w: 95, h: 22, type: 'block' });
        platforms.push({ x: startX + 275, y: 275, w: 95, h: 22, type: 'block' });
        platforms.push({ x: startX + 390, y: 395, w: 110, h: 105, type: 'ground' });
        coins.push({ id: Math.random(), x: startX + 205, y: 300, r: 14, collected: false });
        laptops.push({ id: Math.random(), x: startX + 305, y: 235, w: 36, h: 26, collected: false });
        bugs.push({
          id: Math.random(),
          x: startX + 410,
          y: 365,
          w: 42,
          h: 30,
          minX: startX + 390,
          maxX: startX + 490,
          vx: 1.1,
          facing: 1,
          alive: true,
          legPhase: 2,
          squashedTimer: 0
        });
      } else if (pattern === 4) {
        // Double Drone Airspace + Shield Power-up
        platforms.push({ x: startX, y: 395, w: chunkW, h: 105, type: 'ground' });
        drones.push({
          id: Math.random(),
          x: startX + 160,
          y: 326,
          w: 38,
          h: 24,
          alive: true,
          phase: 1,
          squashedTimer: 0
        });
        platforms.push({ x: startX + 250, y: 260, w: 90, h: 22, type: 'block' });
        powerups.push({ id: Math.random(), type: 'shield', x: startX + 280, y: 225, collected: false });
        bugs.push({
          id: Math.random(),
          x: startX + 370,
          y: 365,
          w: 42,
          h: 30,
          minX: startX + 320,
          maxX: startX + 480,
          vx: 1.4,
          facing: 1,
          alive: true,
          legPhase: 4,
          squashedTimer: 0
        });
      } else {
        // Wide Gap Leap with Springboard Platform
        const leftW = 160;
        const gapW = 135;
        const rightW = chunkW - leftW - gapW;
        platforms.push({ x: startX, y: 395, w: leftW, h: 105, type: 'ground' });
        platforms.push({ x: startX + leftW + 28, y: 335, w: 80, h: 22, type: 'block' });
        coins.push({ id: Math.random(), x: startX + leftW + 68, y: 295, r: 14, collected: false });
        platforms.push({ x: startX + leftW + gapW, y: 395, w: rightW, h: 105, type: 'ground' });
        powerups.push({ id: Math.random(), type: 'turbo', x: startX + leftW + gapW + 70, y: 360, collected: false });
      }

      generatedUntilX += chunkW;
    };

    // Initialize Endless Runner Platforms & Chunks
    platforms = [{ x: -300, y: 395, w: 1500, h: 105, type: 'ground' }];
    while (generatedUntilX < 2800) {
      generateNextChunk();
    }

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

    // Shared Keys Input
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
        if (!over) togglePause();
      }
    };

    const onKeyUp = (e) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === ' ') keys.up = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = false;
    };

    // Jump trigger used by keyboard and mobile JUMP button
    const triggerJump = () => {
      if (player.grounded || player.jumpsLeft > 0) {
        player.vy = player.jumpPower;
        player.grounded = false;
        player.jumpsLeft--;
        audio.jump();
        addParticles(player.x + player.w / 2, player.y + player.h, '#ffffff', 8);
      }
    };

    if (canvas) canvas._triggerJump = triggerJump;

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Timer Interval
    const timerInterval = setInterval(() => {
      if (!isPausedRef.current && !over) {
        gameTimer += 1;
        setTime(gameTimer);
      }
    }, 1000);

    // Trigger Game Over Helper
    const triggerGameOver = () => {
      over = true;
      clearInterval(timerInterval);
      setFinalTime(gameTimer);
      setGameState('gameover');

      const finalDist = Math.max(0, Math.floor((player.x - 140) / 20));
      let prevBest = 0;
      let prevHigh = 0;
      try {
        prevBest = parseInt(localStorage.getItem('portfolio_brake_best_distance') || '0', 10);
        prevHigh = parseInt(localStorage.getItem('portfolio_brake_highscore') || '0', 10);
      } catch {}

      if (finalDist > prevBest) {
        setIsNewRecord(true);
        setBestDistance(finalDist);
        try {
          localStorage.setItem('portfolio_brake_best_distance', finalDist.toString());
        } catch {}
      }
      if (currentScore > prevHigh) {
        setHighScore(currentScore);
        try {
          localStorage.setItem('portfolio_brake_highscore', currentScore.toString());
        } catch {}
      }

      setDialogueText(
        `Run finished at ${finalDist}m! You scored ${currentScore} points. Tap Run Again to beat your best!`
      );

      // Record run to MySQL
      fetch(apiUrl('/api/game/score'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: heroRef.current === 'male' ? 'Aditya' : 'Maya',
          character_chosen: heroRef.current === 'male' ? 'Aditya' : 'Maya',
          time_seconds: gameTimer,
          bugs_squashed: bugsSquashedCount,
          outcome: `endless_${finalDist}m`
        })
      }).catch(() => {});
    };

    // Game Loop
    let animationFrameId;
    let tick = 0;

    const gameLoop = () => {
      tick++;

      if (!isPausedRef.current && !over) {
        // Calculate dynamic runner speed & distance
        const currentDist = Math.max(0, Math.floor((player.x - 140) / 20));
        setDistance(currentDist);

        // Power-Up timers & Magnetism
        if (turboTimer > 0) {
          turboTimer--;
          // Coin Magnetism
          coins.forEach(c => {
            if (c.collected) return;
            const dx = (player.x + player.w / 2) - c.x;
            const dy = (player.y + player.h / 2) - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 240) {
              c.x += dx * 0.22;
              c.y += dy * 0.22;
            }
          });
        }

        // Sync powerup UI status periodically
        if (tick % 10 === 0) {
          if (turboTimer > 0) {
            setActivePowerUp({ type: 'turbo', seconds: Math.ceil(turboTimer / 60) });
          } else if (playerHasShield) {
            setActivePowerUp({ type: 'shield', seconds: null });
          } else {
            setActivePowerUp(null);
          }
        }

        // 1. Movement & Controls ("TAKE A BRAKE" MECHANIC)
        player.isDucking = keys.down;
        player.isBraking = keys.down;

        // Dynamic Hitbox: Ducking / Braking reduces height from 58 to 32
        // Allows sliding under flying drone bugs (placed at y=340) on ground (y=395)!
        player.h = player.isDucking ? 32 : 58;

        const speedTier = Math.min(4.2, (currentDist / 350) * 0.8);
        const baseRunSpeed = 5.0 + speedTier + (turboTimer > 0 ? 3.4 : 0);

        if (keys.down) {
          // BRAKE & SLIDE!
          player.vx = 1.3; // Rapid brake deceleration
          player.facing = 1;
          player.animFrame += 0.15;

          if (player.grounded) {
            // Brake skid sparks
            if (tick % 3 === 0) {
              addParticles(player.x, player.y + player.h, '#f59e0b', 2);
              addParticles(player.x, player.y + player.h, '#94a3b8', 1);
            }
            if (tick - lastBrakeAudioTick > 24) {
              audio.brake();
              lastBrakeAudioTick = tick;
            }
          }
        } else if (keys.right) {
          // Sprint Boost Forward
          player.vx = baseRunSpeed + 2.5;
          player.facing = 1;
          player.animFrame += 0.35;
        } else if (keys.left) {
          // Decelerate / Backpedal
          player.vx = Math.max(0.8, baseRunSpeed - 2.8);
          player.facing = 1;
          player.animFrame += 0.2;
        } else {
          // Natural Endless Runner Propulsion
          player.vx = baseRunSpeed;
          player.facing = 1;
          player.animFrame += 0.28;
        }

        if (player.animFrame > 6283) player.animFrame -= 6283.1853;

        // Fast Fall Stomp when in air and pressing down
        if (keys.down && !player.grounded) {
          player.vy += 0.9;
        }

        // Apply Gravity
        player.vy += player.gravity;
        player.x += player.vx;
        player.y += player.vy;

        // Camera Tracking
        const targetCamX = Math.max(0, player.x - 220);
        cameraX += (targetCamX - cameraX) * 0.16;

        // Prevent player from falling behind screen edge
        if (player.x < cameraX + 8) {
          player.x = cameraX + 8;
        }

        // 2. Collision with Platforms
        player.grounded = false;
        platforms.forEach(plat => {
          if (
            player.x + player.w > plat.x &&
            player.x < plat.x + plat.w &&
            player.y + player.h >= plat.y &&
            player.y + player.h <= plat.y + 20 &&
            player.vy >= 0
          ) {
            player.y = plat.y - player.h;
            player.vy = 0;
            player.grounded = true;
            player.jumpsLeft = 2;
          }
        });

        // 3. Pit Fall Detection
        if (player.y > CH + 50) {
          currentLives -= 1;
          setLives(currentLives);
          audio.hurt();
          screenShake = 12;
          addParticles(player.x + player.w / 2, CH - 20, '#ff4444', 20);

          if (currentLives <= 0) {
            triggerGameOver();
          } else {
            // Find safe platform ahead
            const safePlat = platforms.find(p => p.x + p.w > player.x - 40 && p.type !== 'goal') || platforms[0];
            player.x = Math.max(cameraX + 60, safePlat ? safePlat.x + 20 : cameraX + 80);
            player.y = (safePlat ? safePlat.y : 395) - player.h - 15;
            player.vx = 0;
            player.vy = -6;
            player.invulnerable = 90;
            addText('-1 LIFE / RESPAWNED', player.x, player.y - 25, '#ef4444');
            setDialogueText("Fell into a memory leak! Respawned with shield - hit the BRAKE before chasms!");
          }
        }

        if (player.invulnerable > 0) {
          player.invulnerable--;
        }

        // 4. Enemy Bug Patrol & Collision
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
            if (turboTimer > 0) {
              // Turbo Smash!
              bug.alive = false;
              bug.squashedTimer = 25;
              bugsSquashedCount++;
              currentScore += 150;
              setScore(currentScore);
              audio.stomp();
              screenShake = 6;
              addText('+150 TURBO SMASH!', bug.x, bug.y - 15, '#f59e0b');
              addParticles(bug.x + bug.w / 2, bug.y + bug.h / 2, '#f59e0b', 24);
            } else if (player.vy > 0 && player.y + player.h - player.vy <= bug.y + 14) {
              // Squashed by Jump
              bug.alive = false;
              bug.squashedTimer = 30;
              bugsSquashedCount++;
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
              if (playerHasShield) {
                // Shield absorbs hit
                playerHasShield = false;
                setHasShield(false);
                audio.shieldHit();
                screenShake = 8;
                player.invulnerable = 60;
                addText('🛡️ SHIELD BROKEN!', player.x, player.y - 20, '#06b6d4');
                addParticles(player.x + player.w / 2, player.y + player.h / 2, '#06b6d4', 20);
                setDialogueText("Firewall Shield absorbed the crash! Keep running!");
              } else {
                // Hurt!
                player.invulnerable = 60;
                currentLives -= 1;
                setLives(currentLives);
                audio.hurt();
                screenShake = 10;
                addParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff4444', 12);
                player.vy = -6;
                player.vx = -player.facing * 4;
                setDialogueText("Ouch! A runtime bug struck! Jump on top to squash or BRAKE to avoid.");

                if (currentLives <= 0) {
                  triggerGameOver();
                }
              }
            }
          }
        });

        // 5. Flying Drone Bug Collision & Brake-Slide Evasion
        drones.forEach(drone => {
          if (!drone.alive) {
            if (drone.squashedTimer > 0) drone.squashedTimer--;
            return;
          }
          const droneY = drone.y + Math.sin(tick * 0.12 + (drone.phase || 0)) * 5;

          // BRAKE & SLIDE EVASION: Player sliding low on ground glides safely under drone radar!
          if (
            player.isDucking &&
            player.grounded &&
            player.x + player.w > drone.x - 10 &&
            player.x < drone.x + drone.w + 10
          ) {
            if (!drone.slideEvaded) {
              drone.slideEvaded = true;
              currentScore += 50;
              setScore(currentScore);
              audio.brake();
              addText('+50 BRAKE SLIDE!', player.x - 10, player.y - 15, '#f59e0b');
              addParticles(player.x, player.y + player.h, '#f59e0b', 8);
              setDialogueText(
                heroRef.current === 'male'
                  ? "Aditya executed a flawless brake slide under the drone scanner!"
                  : "Maya slid under the drone scanner undetected! Clean dodge!"
              );
            }
            return; // Completely evade drone collision while sliding!
          }

          if (
            player.x + player.w > drone.x + 3 &&
            player.x < drone.x + drone.w - 3 &&
            player.y + player.h > droneY + 2 &&
            player.y < droneY + drone.h
          ) {
            if (turboTimer > 0) {
              // Turbo Smash Drone
              drone.alive = false;
              drone.squashedTimer = 25;
              bugsSquashedCount++;
              currentScore += 150;
              setScore(currentScore);
              audio.stomp();
              screenShake = 6;
              addText('+150 DRONE DESTROYED!', drone.x, droneY - 15, '#f59e0b');
              addParticles(drone.x + drone.w / 2, droneY + drone.h / 2, '#f59e0b', 24);
            } else if (player.vy > 0 && player.y + player.h - player.vy <= droneY + 14) {
              // Stomped Drone from above
              drone.alive = false;
              drone.squashedTimer = 30;
              bugsSquashedCount++;
              player.vy = -9.5;
              player.jumpsLeft = 1;
              currentScore += 120;
              setScore(currentScore);
              audio.stomp();
              screenShake = 6;
              addText('+120 DRONE OVERRIDDEN!', drone.x, droneY - 10, '#38bdf8');
              addParticles(drone.x + drone.w / 2, droneY + drone.h / 2, '#38bdf8', 20);
            } else if (player.invulnerable === 0) {
              if (playerHasShield) {
                playerHasShield = false;
                setHasShield(false);
                audio.shieldHit();
                screenShake = 8;
                player.invulnerable = 60;
                addText('🛡️ SHIELD BROKEN!', player.x, player.y - 20, '#06b6d4');
                addParticles(player.x + player.w / 2, player.y + player.h / 2, '#06b6d4', 20);
              } else {
                player.invulnerable = 60;
                currentLives -= 1;
                setLives(currentLives);
                audio.hurt();
                screenShake = 10;
                addParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff4444', 12);
                player.vy = -6;
                player.vx = -player.facing * 4;
                setDialogueText("Hit by a drone scanner! Tap BRAKE to slide underneath them next time!");

                if (currentLives <= 0) {
                  triggerGameOver();
                }
              }
            }
          }
        });

        // 6. Collectibles & Powerups
        laptops.forEach(lap => {
          if (lap.collected) return;
          const bob = Math.sin(tick * 0.08 + (lap.id || 0)) * 4;
          if (
            player.x + player.w > lap.x &&
            player.x < lap.x + lap.w &&
            player.y + player.h > lap.y + bob &&
            player.y < lap.y + lap.h + bob
          ) {
            lap.collected = true;
            currentScore += 50;
            if (currentLives < 3) {
              currentLives += 1;
              setLives(currentLives);
              addText('+1 LIFE RESTORED!', lap.x, lap.y - 30, '#22c55e');
            }
            setScore(currentScore);
            audio.code();
            addText('+50 CODE', lap.x - 10, lap.y - 15, '#38bdf8');
            addParticles(lap.x + lap.w / 2, lap.y + lap.h / 2, '#38bdf8', 16);
            setDialogueText("Clean code gathered! Systems optimized.");
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
          }
        });

        powerups.forEach(pu => {
          if (pu.collected) return;
          if (
            player.x + player.w > pu.x &&
            player.x < pu.x + 30 &&
            player.y + player.h > pu.y &&
            player.y < pu.y + 30
          ) {
            pu.collected = true;
            audio.powerup();
            if (pu.type === 'turbo') {
              turboTimer = 360; // 6 seconds
              currentScore += 100;
              setScore(currentScore);
              addText('⚡ TURBO COFFEE BOOST!', pu.x - 30, pu.y - 20, '#f59e0b');
              addParticles(pu.x + 15, pu.y + 15, '#f59e0b', 28);
              setDialogueText("TURBO BOOST ACTIVATED! Full speed and invulnerability to bugs!");
            } else if (pu.type === 'shield') {
              playerHasShield = true;
              setHasShield(true);
              currentScore += 75;
              setScore(currentScore);
              addText('🛡️ FIREWALL SHIELD!', pu.x - 20, pu.y - 20, '#06b6d4');
              addParticles(pu.x + 15, pu.y + 15, '#06b6d4', 28);
              setDialogueText("Firewall Shield activated! You are shielded against 1 collision.");
            }
          }
        });

        // 7. Distance Milestones
        const milestones = [100, 250, 500, 750, 1000, 1500, 2000, 3000];
        milestones.forEach(m => {
          if (currentDist >= m && !reachedMilestones.has(m)) {
            reachedMilestones.add(m);
            audio.milestone();
            addText(`🚩 ${m}m MILESTONE! +${m} BONUS`, player.x, player.y - 45, '#22c55e');
            currentScore += m;
            setScore(currentScore);
            if (m === 100) setDialogueText("100m reached! Pace is accelerating. Remember to BRAKE before low drones!");
            else if (m === 250) setDialogueText("250m milestone! Production pipeline humming without downtime!");
            else if (m === 500) setDialogueText("500m! Half a kilometer! Elite developer reflexes!");
            else if (m === 1000) setDialogueText("1,000m! BUG-FREE ZONE REACHED! You are an architect!");
          }
        });

        // Procedural Chunks Generation & Pruning
        while (cameraX + CW + 600 > generatedUntilX) {
          generateNextChunk();
        }

        if (tick % 60 === 0) {
          const pruneX = cameraX - 500;
          platforms = platforms.filter(p => p.x + p.w > pruneX);
          bugs = bugs.filter(b => b.x + b.w > pruneX);
          drones = drones.filter(d => d.x + d.w > pruneX);
          coins = coins.filter(c => c.x + c.r > pruneX);
          laptops = laptops.filter(l => l.x + l.w > pruneX);
          powerups = powerups.filter(pu => pu.x + 30 > pruneX);
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

      // Night Sky (Screen space)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
      skyGrad.addColorStop(0, '#040714');
      skyGrad.addColorStop(0.5, '#0a1024');
      skyGrad.addColorStop(1, '#111b38');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CW, CH);

      // Stars with Infinite Parallax Wrapping
      stars.forEach(s => {
        s.alpha += Math.sin(tick * s.twinkleSpeed) * 0.015;
        const sx = ((s.x - cameraX * 0.06) % CW + CW) % CW;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, Math.max(0.2, s.alpha))})`;
        ctx.fillRect(sx, s.y, s.size, s.size);
      });

      // Moon with Slow Drift
      const moonX = ((390 - cameraX * 0.02) % (CW + 200) + CW + 200) % (CW + 200) - 100;
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

      // ── LAYER 1: DISTANT 3D MEGASTRUCTURES & VOLUMETRIC SEARCHLIGHTS (Deep Parallax: 0.07) ──
      ctx.save();
      const spireLoopW = 1200;
      const spireOffset = (cameraX * 0.07) % spireLoopW;

      // Sweeping Volumetric Searchlight Beams across Sky
      const beamAngle1 = Math.sin(tick * 0.015) * 0.35 - 0.2;
      const beamAngle2 = -Math.sin(tick * 0.012 + 1) * 0.35 + 0.15;
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = '#60a5fa';
      // Beam 1
      ctx.beginPath();
      ctx.moveTo(180, 320);
      ctx.lineTo(180 + Math.tan(beamAngle1 - 0.12) * 360, 0);
      ctx.lineTo(180 + Math.tan(beamAngle1 + 0.12) * 360, 0);
      ctx.closePath();
      ctx.fill();
      // Beam 2
      ctx.beginPath();
      ctx.moveTo(850, 300);
      ctx.lineTo(850 + Math.tan(beamAngle2 - 0.1) * 360, 0);
      ctx.lineTo(850 + Math.tan(beamAngle2 + 0.1) * 360, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Distant Spire Silhouettes
      for (let offset = -spireOffset - 200; offset < CW + 300; offset += spireLoopW) {
        distantSpires.forEach(s => {
          const sx = offset + s.x;
          if (sx + s.w > -60 && sx < CW + 60) {
            const topY = 410 - s.h;
            // Spire tower gradient
            const spireGrad = ctx.createLinearGradient(0, topY, 0, 410);
            spireGrad.addColorStop(0, '#0a1226');
            spireGrad.addColorStop(1, '#050a16');
            ctx.fillStyle = spireGrad;
            ctx.fillRect(sx, topY, s.w, s.h);

            // 3D Angled Spire Crown / Obelisk point
            ctx.beginPath();
            ctx.moveTo(sx, topY);
            ctx.lineTo(sx + s.w / 2, topY - s.spireH);
            ctx.lineTo(sx + s.w, topY);
            ctx.closePath();
            ctx.fill();

            // Mast antenna line
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(sx + s.w / 2, topY - s.spireH);
            ctx.lineTo(sx + s.w / 2, topY - s.spireH - 22);
            ctx.stroke();

            // Flashing Aviation Warning Beacon
            if (tick % 30 < 15) {
              ctx.fillStyle = '#ef4444';
              ctx.shadowColor = '#ef4444';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(sx + s.w / 2, topY - s.spireH - 22, 2.2, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }

            // Distant window grid slits
            ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
            for (let wy = topY + 20; wy < 390; wy += 28) {
              ctx.fillRect(sx + 12, wy, s.w - 24, 2);
            }
          }
        });
      }
      ctx.restore();

      // ── LAYER 2: 3D EXTRUDED SKYSCRAPERS WITH PERSPECTIVE ROOF & SIDE DEPTH (Parallax: 0.22) ──
      ctx.save();
      const cityLoopW = 1200;
      const cityOffset = (cameraX * 0.22) % cityLoopW;

      for (let offset = -cityOffset - 200; offset < CW + 300; offset += cityLoopW) {
        buildings.forEach(b => {
          const bx = offset + b.x;
          if (bx + b.w > -70 && bx < CW + 70) {
            const topY = 400 - b.h;
            const d = b.roofDepth || 16;

            // 1. 3D Perspective Rooftop Facet (Isometric angled roof plane)
            ctx.fillStyle = '#16233f'; // Lighter roof surface catching sky glow
            ctx.beginPath();
            ctx.moveTo(bx, topY);
            ctx.lineTo(bx + b.w, topY);
            ctx.lineTo(bx + b.w - d, topY - d);
            ctx.lineTo(bx - d, topY - d);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#2b406b';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Rooftop Helipad
            if (b.helipad) {
              const hx = bx + b.w / 2 - d / 2;
              const hy = topY - d / 2;
              ctx.strokeStyle = '#eab308';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.ellipse(hx, hy, 16, 6, 0, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = '#eab308';
              ctx.font = 'bold 8px monospace';
              ctx.fillText('H', hx - 3, hy + 3);
            }

            // Rooftop Antenna Mast
            if (b.antenna) {
              const ax = bx + b.w - d - 10;
              const ay = topY - d;
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(ax, ay - 30);
              ctx.stroke();
              if (tick % 24 < 12) {
                ctx.fillStyle = '#ef4444';
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(ax, ay - 30, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
              }
            }

            // 2. 3D Left Perspective Side Bevel (Shadow Facet)
            ctx.fillStyle = '#060b17'; // Shadowed side
            ctx.beginPath();
            ctx.moveTo(bx - d, topY - d);
            ctx.lineTo(bx, topY);
            ctx.lineTo(bx, 400);
            ctx.lineTo(bx - d, 400 - d);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#111b33';
            ctx.stroke();

            // 3. Front Facade (Main Face)
            const facadeGrad = ctx.createLinearGradient(0, topY, 0, 400);
            facadeGrad.addColorStop(0, '#0a1226');
            facadeGrad.addColorStop(1, '#080d1c');
            ctx.fillStyle = facadeGrad;
            ctx.fillRect(bx, topY, b.w, b.h);
            ctx.strokeStyle = '#1e2e50';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(bx, topY, b.w, b.h);

            // Architectural Vertical Mullions (gives physical depth ribbing)
            ctx.strokeStyle = '#141e34';
            ctx.lineWidth = 1;
            for (let mx = bx + 22; mx < bx + b.w - 10; mx += 24) {
              ctx.beginPath();
              ctx.moveTo(mx, topY);
              ctx.lineTo(mx, 400);
              ctx.stroke();
            }

            // 4. 3D Multi-Tone Illuminated Windows
            for (let wx = bx + 8; wx < bx + b.w - 10; wx += 16) {
              for (let wy = topY + 14; wy < 380; wy += 22) {
                const seed = (wx * 11 + wy * 19) % 17;
                if (seed > 4) {
                  // Window Inset Frame Shadow
                  ctx.fillStyle = '#050812';
                  ctx.fillRect(wx - 1, wy - 1, 10, 13);

                  // Glowing Window Glass with Varied Color Tints
                  let winColor;
                  if (seed === 5 || seed === 6) winColor = 'rgba(254, 240, 138, 0.45)'; // Warm Amber
                  else if (seed === 7) winColor = 'rgba(244, 114, 182, 0.4)'; // Magenta
                  else if (seed === 8) winColor = 'rgba(255, 255, 255, 0.55)'; // Crisp White
                  else winColor = 'rgba(56, 189, 248, 0.35)'; // Cyan
                  
                  ctx.fillStyle = winColor;
                  ctx.fillRect(wx, wy, 8, 11);

                  // Subtle window divider mullion
                  ctx.fillStyle = '#050812';
                  ctx.fillRect(wx + 3.5, wy, 1, 11);
                }
              }
            }

            // 5. 3D Holographic Rooftop Sign
            if (b.sign) {
              ctx.save();
              const signColor = b.sign === 'BRAKE' ? '#f59e0b' : (b.sign === 'TURBO' ? '#eab308' : '#38bdf8');
              
              // Structural mounting struts
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(bx + 14, topY);
              ctx.lineTo(bx + 14, topY - 14);
              ctx.moveTo(bx + 80, topY);
              ctx.lineTo(bx + 80, topY - 14);
              ctx.stroke();

              // Sign board
              ctx.fillStyle = '#080d1c';
              ctx.fillRect(bx + 8, topY - 26, 84, 15);
              ctx.strokeStyle = signColor;
              ctx.lineWidth = 1.2;
              ctx.strokeRect(bx + 8, topY - 26, 84, 15);

              // Glowing text
              ctx.font = '8px "Press Start 2P", monospace';
              ctx.fillStyle = signColor;
              ctx.shadowColor = signColor;
              ctx.shadowBlur = 10;
              ctx.fillText(b.sign, bx + 14, topY - 15);
              ctx.restore();
            }
          }
        });
      }
      ctx.restore();

      // Billboards Parallax
      ctx.save();
      const bbSpacing = 1600;
      const bbOffset = (cameraX * 0.45) % bbSpacing;
      for (let bxBase = -bbOffset; bxBase < CW + 400; bxBase += bbSpacing) {
        drawBillboard(ctx, bxBase + 100, 110);
      }
      ctx.restore();

      // ── WORLD SPACE RENDERING (Shifted by cameraX) ──
      ctx.save();
      ctx.translate(-cameraX, 0);

      // Platforms (3D Highway and 3D Floating Blocks)
      platforms.forEach(plat => {
        if (plat.x + plat.w < cameraX - 100 || plat.x > cameraX + CW + 100) return;

        if (plat.type === 'ground') {
          // ── 3D CYBER HIGHWAY PLATFORM ──
          
          // 1. 3D Perspective Top Runway Surface (y to y + 10)
          const deckH = 10;
          const roadGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + deckH);
          roadGrad.addColorStop(0, '#1a233a');
          roadGrad.addColorStop(1, '#0e1628');
          ctx.fillStyle = roadGrad;
          ctx.fillRect(plat.x, plat.y, plat.w, deckH);

          // Glowing Sunken Cyan/Green Curb Guide Rails
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.moveTo(plat.x, plat.y);
          ctx.lineTo(plat.x + plat.w, plat.y);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Road Markings (Dashed white/cyan divider stripes)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          for (let rx = plat.x + 8; rx < plat.x + plat.w - 12; rx += 36) {
            ctx.fillRect(rx, plat.y + 4, 18, 2.5);
          }

          // Embedded Pulsing Cyber Cat's Eyes (LED road studs)
          for (let rx = plat.x + 20; rx < plat.x + plat.w - 10; rx += 45) {
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(rx, plat.y + 1, 3.5, 2);
          }

          // 2. 3D Retaining Bulkhead Face (y + 10 down to y + h)
          const faceGrad = ctx.createLinearGradient(0, plat.y + deckH, 0, plat.y + plat.h);
          faceGrad.addColorStop(0, '#0a0f1d');
          faceGrad.addColorStop(0.5, '#070b14');
          faceGrad.addColorStop(1, '#03050a');
          ctx.fillStyle = faceGrad;
          ctx.fillRect(plat.x, plat.y + deckH, plat.w, plat.h - deckH);

          // Top Curb Hazard Caution Striping (Amber & Black Diagonal Chevrons)
          const curbH = 7;
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(plat.x, plat.y + deckH, plat.w, curbH);
          ctx.fillStyle = '#0f172a';
          for (let cx = plat.x; cx < plat.x + plat.w; cx += 14) {
            ctx.beginPath();
            ctx.moveTo(cx, plat.y + deckH);
            ctx.lineTo(cx + 6, plat.y + deckH);
            ctx.lineTo(cx - 2, plat.y + deckH + curbH);
            ctx.lineTo(cx - 8, plat.y + deckH + curbH);
            ctx.closePath();
            ctx.fill();
          }

          // Horizontal Glowing Neon Conduit Pipe
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(plat.x, plat.y + deckH + 28);
          ctx.lineTo(plat.x + plat.w, plat.y + deckH + 28);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Structural Vertical Concrete Seams & Rivets
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.2;
          for (let px = plat.x + 80; px < plat.x + plat.w; px += 80) {
            ctx.beginPath();
            ctx.moveTo(px, plat.y + deckH + curbH);
            ctx.lineTo(px, plat.y + plat.h);
            ctx.stroke();
            // Rivets
            ctx.fillStyle = '#64748b';
            ctx.fillRect(px - 1.5, plat.y + deckH + curbH + 8, 3, 3);
            ctx.fillRect(px - 1.5, plat.y + deckH + curbH + 45, 3, 3);
          }

          // 3. 3D Chasm Canyon Wall Drop-offs (Depths at left & right cliff ends!)
          // Left Cliff Wall
          ctx.fillStyle = '#050812';
          ctx.fillRect(plat.x, plat.y, 4, plat.h);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(plat.x, plat.y);
          ctx.lineTo(plat.x, plat.y + plat.h);
          ctx.stroke();

          // Right Cliff Wall
          ctx.fillStyle = '#050812';
          ctx.fillRect(plat.x + plat.w - 4, plat.y, 4, plat.h);
          ctx.strokeStyle = '#0284c7';
          ctx.beginPath();
          ctx.moveTo(plat.x + plat.w, plat.y);
          ctx.lineTo(plat.x + plat.w, plat.y + plat.h);
          ctx.stroke();

        } else {
          // ── 3D FLOATING CYBER PLATFORM ──
          // 1. 3D Chamfered Top Plate catching light
          ctx.fillStyle = '#141e36';
          ctx.fillRect(plat.x, plat.y, plat.w, 7);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.strokeRect(plat.x, plat.y, plat.w, 7);
          ctx.shadowBlur = 0;

          // Center Green Grip Runway
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(plat.x + 8, plat.y + 2, plat.w - 16, 3);

          // 2. Extruded 3D Chassis Underbelly
          ctx.fillStyle = '#080d19';
          ctx.fillRect(plat.x + 4, plat.y + 7, plat.w - 8, plat.h - 7);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(plat.x + 4, plat.y + 7, plat.w - 8, plat.h - 7);

          // Structural Cross-Brace Detailing
          ctx.strokeStyle = '#1e3a8a';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(plat.x + 6, plat.y + 9);
          ctx.lineTo(plat.x + plat.w - 6, plat.y + plat.h - 2);
          ctx.moveTo(plat.x + plat.w - 6, plat.y + 9);
          ctx.lineTo(plat.x + 6, plat.y + plat.h - 2);
          ctx.stroke();

          // 3. Underside Antigravity Thruster Pods with Downward Plasma Glow
          const th1X = plat.x + 14;
          const th2X = plat.x + plat.w - 22;
          const thY = plat.y + plat.h;

          // Thruster Nozzles
          ctx.fillStyle = '#334155';
          ctx.fillRect(th1X, thY - 2, 8, 4);
          ctx.fillRect(th2X, thY - 2, 8, 4);

          // Pulsing Plasma Cones
          const thrustH = 10 + Math.sin(tick * 0.2 + plat.x) * 4;
          const plasmaGrad = ctx.createLinearGradient(0, thY, 0, thY + thrustH);
          plasmaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
          plasmaGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = plasmaGrad;

          ctx.beginPath();
          ctx.moveTo(th1X + 1, thY + 2);
          ctx.lineTo(th1X + 4, thY + 2 + thrustH);
          ctx.lineTo(th1X + 7, thY + 2);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(th2X + 1, thY + 2);
          ctx.lineTo(th2X + 4, thY + 2 + thrustH);
          ctx.lineTo(th2X + 7, thY + 2);
          ctx.closePath();
          ctx.fill();
        }
      });


      // Collectibles: Laptops
      laptops.forEach(lap => {
        if (lap.collected || lap.x + lap.w < cameraX - 50 || lap.x > cameraX + CW + 50) return;
        const bob = Math.sin(tick * 0.08 + (lap.id || 0)) * 4;
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

      // Collectibles: Golden XP Coins
      coins.forEach(coin => {
        if (coin.collected || coin.x + coin.r < cameraX - 50 || coin.x > cameraX + CW + 50) return;
        ctx.save();
        const spinWidth = Math.abs(Math.cos(tick * 0.06 + (coin.id || 0) * 1.5)) * coin.r;
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
        ctx.restore();
      });

      // Power-Ups (Coffee & Shield)
      powerups.forEach(pu => {
        if (pu.collected || pu.x + 30 < cameraX - 50 || pu.x > cameraX + CW + 50) return;
        if (pu.type === 'turbo') drawCoffeePowerup(ctx, pu.x, pu.y, tick);
        else if (pu.type === 'shield') drawShieldPowerup(ctx, pu.x, pu.y, tick);
      });

      // Patrol Bugs
      bugs.forEach(bug => {
        if (bug.x + bug.w < cameraX - 60 || bug.x > cameraX + CW + 60) return;
        drawDetailedBug(ctx, bug, tick);
      });

      // Flying Drone Bugs
      drones.forEach(drone => {
        if (drone.x + drone.w < cameraX - 60 || drone.x > cameraX + CW + 60) return;
        drawFlyingDrone(ctx, drone, tick);
      });

      // Hero Character
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

        // Active Shield Forcefield
        if (playerHasShield) {
          drawPlayerShieldAura(ctx, player.x + player.w / 2, player.y + player.h / 2, tick);
        }
        // Active Turbo Coffee Aura
        if (turboTimer > 0) {
          drawPlayerTurboAura(ctx, player.x + player.w / 2, player.y + player.h / 2, tick);
        }
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

      // Floating Texts
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

      ctx.restore(); // Restore world translation

      // ── SCREEN SPACE OVERLAYS ──
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
        ctx.fillText('Press [P] or tap Resume to continue', CW / 2, CH / 2 + 25);
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
            <span className="level-title">TAKE A BRAKE • ENDLESS RUN</span>
            <span className="level-goal">
              RUN &bull; TAP <span className="highlight-amber">BRAKE</span> TO SLIDE &bull; DODGE <span className="highlight-red">BUGS</span>
            </span>
          </div>

          {/* Right Metrics: Distance, Score, Powerup, Lives, Controls */}
          <div className="hud-metrics">
            {/* Active Power-up Pill */}
            {activePowerUp && (
              <div className={`powerup-active-badge ${activePowerUp.type}`}>
                {activePowerUp.type === 'turbo' ? (
                  <><FaBolt /> TURBO {activePowerUp.seconds}s</>
                ) : (
                  <><FaShieldAlt /> SHIELD</>
                )}
              </div>
            )}

            {/* Distance Metrics */}
            <div className="hud-metric-box">
              <span className="metric-label">DISTANCE</span>
              <span className="metric-val distance-val">{distance}m</span>
            </div>

            <div className="hud-metric-box">
              <span className="metric-label">BEST</span>
              <span className="metric-val best-val">{Math.max(distance, bestDistance)}m</span>
            </div>

            <div className="hud-metric-box">
              <span className="metric-label">SCORE</span>
              <span className="metric-val score-val">{score}</span>
            </div>

            <div className="hud-metric-box lives-box">
              <span className="metric-label">
                LIVES {hasShield && <FaShieldAlt className="shield-icon-mini" title="Shield Active" />}
              </span>
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
              title="Restart Run"
            >
              <FaRedo />
            </button>
          </div>
        </header>

        {/* CANVAS STAGE */}
        <div className="canvas-container">
          <canvas ref={canvasRef} className="pixel-game-canvas" />

          {/* Game Over Overlay Modal (Endless Run) */}
          {gameState === 'gameover' && (
            <div className="game-modal-overlay">
              <div className="game-modal-card gameover-card">
                <span className="modal-tag">// ENDLESS_RUN_LOG.DAT</span>
                <h2 className="modal-title gameover-title">RUN FINISHED!</h2>

                {isNewRecord && (
                  <div className="new-record-banner">
                    <FaTrophy /> NEW BEST DISTANCE RECORD!
                  </div>
                )}

                <p className="modal-desc">
                  You survived {formatTime(finalTime || time)} through the cyberpunk matrix before production bugs overwhelmed the server!
                </p>

                <div className="modal-stats-row">
                  <div><span>DISTANCE:</span> <strong>{distance}m</strong></div>
                  <div><span>BEST:</span> <strong>{Math.max(distance, bestDistance)}m</strong></div>
                  <div><span>SCORE:</span> <strong>{score}</strong></div>
                </div>

                <div className="modal-buttons-row">
                  <button type="button" className="modal-btn-primary" onClick={handleRestart}>
                    RUN AGAIN &rarr;
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
          {/* Left cluster: ← SLOW | ▼ BRAKE | → SPRINT */}
          <div className="mobile-dpad">
            <button
              type="button"
              className="dpad-btn dpad-left"
              aria-label="Slow down or move left"
              onPointerDown={() => { keysRef.current.left = true; }}
              onPointerUp={() => { keysRef.current.left = false; }}
              onPointerLeave={() => { keysRef.current.left = false; }}
              onPointerCancel={() => { keysRef.current.left = false; }}
            >◀</button>
            <button
              type="button"
              className="dpad-btn dpad-down dpad-brake"
              aria-label="Brake and slide"
              onPointerDown={() => { keysRef.current.down = true; }}
              onPointerUp={() => { keysRef.current.down = false; }}
              onPointerLeave={() => { keysRef.current.down = false; }}
              onPointerCancel={() => { keysRef.current.down = false; }}
            >
              <span>▼</span>
              <span className="brake-label">BRAKE</span>
            </button>
            <button
              type="button"
              className="dpad-btn dpad-right"
              aria-label="Sprint boost or move right"
              onPointerDown={() => { keysRef.current.right = true; }}
              onPointerUp={() => { keysRef.current.right = false; }}
              onPointerLeave={() => { keysRef.current.right = false; }}
              onPointerCancel={() => { keysRef.current.right = false; }}
            >▶</button>
          </div>

          {/* Centre label */}
          <div className="mobile-controls-label">
            <span>◀ SLOW | SPRINT ▶</span>
            <span>▼ <strong>BRAKE &amp; SLIDE</strong></span>
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
              onPointerCancel={() => { keysRef.current.up = false; }}
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
                <span className="key-action">Slow / Sprint</span>
              </div>
              <div className="control-key-row">
                <span className="key-badge">W</span>
                <span className="key-action">Jump (Double)</span>
              </div>
              <div className="control-key-row">
                <span className="key-badge highlight-brake">S</span>
                <span className="key-action"><strong>Brake &amp; Slide</strong></span>
              </div>
            </div>
          </div>

          {/* Quest Dialogue Banner with High-Definition Custom Pixel Avatar */}
          <div className="quest-dialogue-card">
            <div className={`dialogue-avatar-box ${selectedHero}`}>
              <PixelAvatar hero={selectedHero} size={54} />
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
