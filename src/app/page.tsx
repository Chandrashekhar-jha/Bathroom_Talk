'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Data ─────────────────────────────────────────────────────────────────────
const heroFragments = [
  { text: "today's lecture made no sense", x: '-44%', y: '-28%', delay: 0.2, dur: 8 },
  { text: 'someone had to say it', x: '40%', y: '-22%', delay: 0.5, dur: 9 },
  { text: 'we all think it, nobody says it', x: '-46%', y: '18%', delay: 0.9, dur: 7.5 },
  { text: 'heard, not exposed', x: '42%', y: '24%', delay: 0.7, dur: 8.5 },
  { text: 'finally someone said it ✓', x: '-32%', y: '42%', delay: 1.2, dur: 9.5 },
  { text: 'the 3am thought that hit different', x: '30%', y: '-42%', delay: 0.3, dur: 7 },
];

const wallNotes = [
  { name: 'GhostFox', text: "today's lecture made zero sense and no one dared say anything", rot: -2.5, bg: '#111118', accent: '#7c5cfc' },
  { name: 'SilentTiger', text: 'someone finally said it. we \u2019ve all been thinking this for months', rot: 1.8, bg: '#0e0e16', accent: '#22d3ee' },
  { name: 'HiddenNote', text: 'meetings could have been emails. every single one this week', rot: -1.2, bg: '#12111a', accent: '#a78bfa' },
  { name: 'NeonWolf', text: 'why do we pretend everything is fine when it clearly isn\u2019t', rot: 2.1, bg: '#0f0f16', accent: '#818cf8' },
  { name: 'MidnightEcho', text: 'the group chat says support each other but nobody actually does', rot: -1.5, bg: '#111118', accent: '#38bdf8' },
];

const identities = [
  'ShadowFox', 'MidnightEcho', 'HiddenTiger', 'GhostNote',
  'SilentWolf', 'NeonHaze', 'ObsidianMask', 'CrypticSoul',
  'VoidWhisper', 'LunarGhost', 'EmberShade', 'PhantomPulse',
];

const chatMessages = [
  { name: 'GhostFox', text: "today's lecture made no sense", typing: false, delay: 0.8 },
  { name: 'SilentEcho', text: 'same here, completely lost after slide 3', typing: false, delay: 2.2 },
  { name: 'NeonWolf', text: 'finally someone said it', typing: false, delay: 3.5 },
  { name: 'MidnightEcho', text: '', typing: true, delay: 4.8 },
];

// ─── CSS (all styles inline to avoid Turbopack CSS processing) ────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --bg: #0a0a0f;
    --bg2: #111118;
    --bg3: #16161f;
    --violet: #7c5cfc;
    --violet-dim: rgba(124,92,252,0.15);
    --violet-glow: rgba(124,92,252,0.3);
    --cyan: #22d3ee;
    --cyan-dim: rgba(34,211,238,0.12);
    --cyan-glow: rgba(34,211,238,0.25);
    --indigo: #818cf8;
    --text1: #ffffff;
    --text2: #f0f0f5;
    --text3: rgba(255,255,255,0.85);
    --border: rgba(255,255,255,0.25);
    --border-hi: rgba(255,255,255,0.4);
    --font-head: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', 'Manrope', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  html { scroll-behavior: smooth; }
  html, body {
    background: var(--bg); color: var(--text1);
    min-height: 100vh; overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    font-family: var(--font-body);
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.35); border-radius:2px; }
  ::selection { background: rgba(124,92,252,0.3); }

  /* ── NOISE ── */
  .b-noise {
    pointer-events: none; position: fixed; inset: 0; z-index: 999; opacity: 0.005;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 160px 160px;
  }

  /* ── NAV ── */
  .b-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    transition: background 0.4s, backdrop-filter 0.4s;
    font-family: var(--font-body);
  }
  .b-nav.scrolled {
    background: rgba(10,10,15,0.75);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--border);
  }
  .b-nav-inner {
    max-width: 1140px; margin: 0 auto;
    padding: 1.6rem 2rem;
    display: flex; align-items: center; justify-content: space-between; gap: 2rem;
  }
  .b-logo {
    text-decoration: none; color: var(--text1);
    font-family: var(--font-head); font-size: 1.1rem; font-weight: 700;
    letter-spacing: -0.03em;
    display: flex; align-items: center; gap: 0.5rem;
    transition: opacity 0.2s;
  }
  .b-logo:hover { opacity: 0.7; }
  .b-logo-icon {
    width: 28px; height: 28px; border-radius: 7px;
    background: linear-gradient(135deg, var(--violet), var(--indigo));
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 0.82rem; font-weight: 800; color: #fff;
  }
  .b-nav-links { display: flex; gap: 2.25rem; }
  .b-nav-link {
    text-decoration: none; color: var(--text2);
    font-size: 0.875rem; font-weight: 400;
    transition: color 0.2s; letter-spacing: 0.01em;
  }
  .b-nav-link:hover { color: var(--text1); }
  .b-nav-cta {
    text-decoration: none; color: #fff;
    font-size: 0.875rem; font-weight: 600;
    padding: 0.55rem 1.25rem;
    background: var(--violet); border-radius: 8px;
    transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
    font-family: var(--font-body);
  }
  .b-nav-cta:hover {
    background: #8f6dfd;
    transform: translateY(-1px);
    box-shadow: 0 6px 24px var(--violet-glow);
  }

  /* ── HERO ── */
  .b-hero {
    position: relative; min-height: 100dvh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 8rem 1.5rem 5rem;
    overflow: hidden; isolation: isolate;
  }
  .b-hero-spot {
    pointer-events: none; position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 38%, rgba(124,92,252,0.08) 0%, transparent 70%);
    will-change: transform;
  }
  .b-hero-spot2 {
    pointer-events: none; position: absolute; inset: 0;
    background: radial-gradient(ellipse 40% 35% at 50% 55%, rgba(34,211,238,0.04) 0%, transparent 65%);
  }
  .b-badge {
    position: relative; z-index: 2;
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.35rem 0.9rem;
    background: rgba(124,92,252,0.1);
    border: 1px solid rgba(124,92,252,0.2);
    border-radius: 100px;
    font-size: 0.72rem; font-weight: 500;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: var(--indigo); margin-bottom: 2rem;
  }
  .b-badge-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 6px var(--cyan);
    animation: blink 2s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* DOORWAY */
  .b-door-wrap {
    position: relative; z-index: 1;
    width: 240px; height: 360px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 3rem; flex-shrink: 0;
  }
  .b-door-arch {
    position: relative; width: 100%; height: 100%;
    border-left: 1.5px solid rgba(255,255,255,0.09);
    border-right: 1.5px solid rgba(255,255,255,0.09);
    border-top: 1.5px solid rgba(255,255,255,0.09);
    border-radius: 130px 130px 0 0;
    box-shadow: 0 0 80px rgba(124,92,252,0.12), 0 0 160px rgba(34,211,238,0.04);
  }
  .b-door-interior {
    position: absolute; inset: 11px 11px 0 11px;
    border-radius: 119px 119px 0 0;
    background: #0c0c12; overflow: hidden;
  }
  .b-door-radial {
    position: absolute; inset: 0;
    background: radial-gradient(
      ellipse 90% 80% at 50% 100%,
      rgba(124,92,252,0.35) 0%,
      rgba(34,211,238,0.1) 40%,
      transparent 70%
    );
  }
  .b-door-halo {
    position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
    width: 120px; height: 40px;
    background: radial-gradient(ellipse at center, rgba(124,92,252,0.5) 0%, transparent 70%);
    filter: blur(8px);
  }
  .b-door-beam {
    position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(124,92,252,0.8), rgba(34,211,238,0.6), transparent);
    filter: blur(1px);
  }
  .b-door-keyhole {
    position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
    z-index: 5; width: 18px; height: 28px;
  }
  .b-door-keyhole::before {
    content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 10px; height: 10px; border-radius: 50%;
    border: 1.5px solid rgba(124,92,252,0.6);
    box-shadow: 0 0 8px rgba(124,92,252,0.5), inset 0 0 4px rgba(124,92,252,0.1);
  }
  .b-door-keyhole::after {
    content: ''; position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
    width: 5px; height: 14px;
    border: 1.5px solid rgba(124,92,252,0.45); border-top: none;
    border-radius: 0 0 3px 3px;
  }
  /* Fragments */
  .b-frag {
    position: absolute; top: 50%; left: 50%;
    transform: translate(calc(-50% + var(--fx)), calc(-50% + var(--fy)));
    font-family: var(--font-mono);
    font-size: 0.62rem; font-weight: 400;
    color: rgba(255,255,255,0.85);
    white-space: nowrap; pointer-events: none; user-select: none;
    border-bottom: 1px dashed rgba(255,255,255,0.06);
    padding-bottom: 1px; will-change: transform;
  }

  /* Hero text */
  .b-hero-head {
    position: relative; z-index: 2;
    font-family: var(--font-head);
    font-size: clamp(3.5rem, 9vw, 7rem);
    font-weight: 800; line-height: 1.0;
    letter-spacing: -0.04em; text-align: center;
    color: var(--text1); margin-bottom: 1.25rem;
  }
  .b-hero-head .accent {
    background: linear-gradient(135deg, #c4b5fd 0%, #818cf8 40%, #7c5cfc 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .b-hero-sub {
    position: relative; z-index: 2;
    font-size: 1.05rem; font-weight: 400; line-height: 1.75;
    color: var(--text2); text-align: center;
    max-width: 460px; margin: 0 auto 2.75rem;
  }
  .b-hero-cta {
    position: relative; z-index: 2;
    display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; justify-content: center;
  }
  .b-btn-primary {
    text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.8rem 1.8rem; background: var(--violet); color: #fff;
    font-size: 0.95rem; font-weight: 600; border-radius: 9px;
    transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
    font-family: var(--font-body); letter-spacing: 0.01em;
  }
  .b-btn-primary:hover { background: #8f6dfd; transform: translateY(-1px); box-shadow: 0 8px 28px var(--violet-glow); }
  .b-btn-secondary {
    text-decoration: none; display: inline-flex; align-items: center;
    padding: 0.8rem 1.8rem; color: var(--text2);
    font-size: 0.95rem; font-weight: 400; border-radius: 9px;
    border: 1px solid var(--border-hi);
    transition: color 0.2s, border-color 0.2s, transform 0.15s;
    font-family: var(--font-body);
  }
  .b-btn-secondary:hover { color: var(--text1); border-color: rgba(255,255,255,0.2); transform: translateY(-1px); }
  .b-hero-fade {
    position: absolute; bottom: 0; left: 0; right: 0; height: 200px;
    background: linear-gradient(to bottom, transparent, var(--bg));
    pointer-events: none; z-index: 3;
  }

  /* ── SECTION BASE ── */
  .b-section {
    max-width: 1100px; margin: 0 auto; padding: 6rem 2rem;
  }
  .b-section-label {
    font-family: var(--font-mono); font-size: 0.7rem; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--cyan); margin-bottom: 1rem; display: block;
  }
  .b-section-title {
    font-family: var(--font-head); font-size: clamp(2rem, 5vw, 3.25rem);
    font-weight: 800; letter-spacing: -0.03em; color: var(--text1);
    margin-bottom: 0.75rem; line-height: 1.1;
  }
  .b-section-sub {
    font-size: 1rem; color: var(--text2); line-height: 1.7; margin-bottom: 3.5rem;
  }
  .b-divider {
    width: 100%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-hi), transparent);
    margin: 0;
  }

  /* ── WALL SECTION ── */
  .b-wall {
    background: var(--bg2);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 5rem 0;
  }
  .b-wall-inner { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }
  .b-wall-grid {
    display: flex; gap: 1.25rem; overflow-x: auto; padding-bottom: 1rem;
    scrollbar-width: none;
  }
  .b-wall-grid::-webkit-scrollbar { display: none; }
  .b-note {
    flex-shrink: 0; width: 260px; min-height: 150px;
    padding: 1.25rem 1.4rem;
    background: var(--bg); border-radius: 10px;
    border: 1px solid var(--border);
    position: relative; cursor: default;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    will-change: transform;
  }
  .b-note:hover {
    transform: rotate(0deg) translateY(-4px) !important;
    box-shadow: 0 0 0 1px rgba(124,92,252,0.2), 0 12px 40px rgba(0,0,0,0.5);
    z-index: 10;
  }
  .b-note-name {
    font-family: var(--font-mono); font-size: 0.68rem; font-weight: 500;
    margin-bottom: 0.65rem; letter-spacing: 0.04em;
  }
  .b-note-text {
    font-family: var(--font-mono); font-size: 0.8rem; font-weight: 400;
    color: #ffffff; line-height: 1.6;
  }
  .b-note-tag {
    position: absolute; bottom: 0.75rem; right: 1rem;
    font-family: var(--font-mono); font-size: 0.58rem;
    color: rgba(255,255,255,0.6); letter-spacing: 0.02em;
  }

  /* ── COUNTERS ── */
  .b-counters {
    padding: 5rem 2rem;
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
  }
  .b-counter-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 14px; padding: 2rem 1.75rem;
    text-align: center;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .b-counter-card:hover {
    border-color: rgba(124,92,252,0.25);
    box-shadow: 0 0 40px rgba(124,92,252,0.06);
  }
  .b-counter-emoji { font-size: 1.75rem; margin-bottom: 0.75rem; display: block; }
  .b-counter-num {
    font-family: var(--font-head); font-size: 2.75rem; font-weight: 800;
    letter-spacing: -0.04em; color: var(--text1);
    display: block; margin-bottom: 0.4rem;
  }
  .b-counter-label { font-size: 0.85rem; color: var(--text2); font-weight: 400; }

  /* ── HOW IT WORKS ── */
  .b-how-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
    margin-top: 0;
  }
  .b-how-panel {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 16px; padding: 2.5rem 2rem;
    position: relative; overflow: hidden;
    transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    cursor: default;
  }
  .b-how-panel:hover {
    border-color: rgba(124,92,252,0.2);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,92,252,0.1);
  }
  .b-how-num {
    font-family: var(--font-head); font-size: 3.5rem; font-weight: 800;
    letter-spacing: -0.06em;
    background: linear-gradient(135deg, rgba(124,92,252,0.5) 0%, rgba(34,211,238,0.2) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    line-height: 1; display: block; margin-bottom: 1.25rem;
  }
  .b-how-title {
    font-family: var(--font-head); font-size: 1.15rem; font-weight: 700;
    color: var(--text1); margin-bottom: 0.65rem; letter-spacing: -0.02em;
  }
  .b-how-desc { font-size: 0.9rem; color: var(--text2); line-height: 1.7; }
  .b-how-glow {
    position: absolute; bottom: -40px; right: -40px; width: 120px; height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── IDENTITY ── */
  .b-identity {
    background: var(--bg2);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 5.5rem 2rem;
    text-align: center;
  }
  .b-identity-inner { max-width: 540px; margin: 0 auto; }
  .b-id-display {
    font-family: var(--font-head); font-size: clamp(2.4rem, 7vw, 4.5rem);
    font-weight: 800; letter-spacing: -0.04em;
    background: linear-gradient(135deg, #f3f3f3 0%, #c4b5fd 60%, var(--violet) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    margin: 1.25rem 0 2rem;
    transition: opacity 0.15s;
    min-height: 1.1em; display: block;
  }
  .b-id-display.fade { opacity: 0; }
  .b-btn-gen {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.7rem 1.5rem;
    background: transparent; color: var(--text2);
    font-size: 0.875rem; font-weight: 500;
    border: 1px solid var(--border-hi); border-radius: 8px;
    cursor: pointer; transition: all 0.2s;
    font-family: var(--font-body); letter-spacing: 0.01em;
  }
  .b-btn-gen:hover { color: var(--text1); border-color: rgba(124,92,252,0.4); background: var(--violet-dim); }
  .b-id-sub { font-size: 0.85rem; color: var(--text2); margin-top: 0.75rem; }

  /* ── CHAT ── */
  .b-chat-wrap {
    max-width: 1100px; margin: 0 auto; padding: 6rem 2rem;
  }
  .b-chat-window {
    max-width: 420px; margin: 0 auto;
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .b-chat-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 0.6rem;
  }
  .b-chat-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 6px var(--cyan); }
  .b-chat-room { font-family: var(--font-mono); font-size: 0.78rem; color: var(--cyan); }
  .b-chat-count { font-family: var(--font-body); font-size: 0.72rem; color: var(--text2); margin-left: auto; }
  .b-chat-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; min-height: 220px; }
  .b-chat-msg { display: flex; flex-direction: column; gap: 0.2rem; opacity: 0; }
  .b-chat-msg.visible { opacity: 1; transition: opacity 0.5s ease; }
  .b-msg-name { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 500; letter-spacing: 0.04em; }
  .b-msg-text { font-family: var(--font-mono); font-size: 0.82rem; color: #ffffff; line-height: 1.5; }
  .b-typing { display: flex; align-items: center; gap: 0.4rem; }
  .b-typing-name { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text2); }
  .b-typing-dots { display: flex; gap: 3px; }
  .b-typing-dot {
    width: 4px; height: 4px; border-radius: 50%; background: var(--text2);
    animation: typedot 1.2s ease-in-out infinite;
  }
  .b-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .b-typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typedot { 0%,100%{opacity:0.3;transform:translateY(0)} 50%{opacity:1;transform:translateY(-3px)} }

  /* ── FINAL CTA ── */
  .b-final {
    text-align: center; padding: 8rem 2rem 7rem;
  }
  .b-final-inner { max-width: 680px; margin: 0 auto; }
  .b-final-quote {
    font-family: var(--font-head); font-size: clamp(1.75rem, 4.5vw, 3rem);
    font-weight: 700; letter-spacing: -0.03em; line-height: 1.25;
    color: var(--text1); margin-bottom: 2.5rem;
  }
  .b-final-quote em { font-style: italic; color: var(--indigo); }
  .b-final-sub { font-size: 0.95rem; color: var(--text2); margin-bottom: 2.5rem; line-height: 1.7; }

  /* ── FOOTER ── */
  .b-footer {
    background: var(--bg2); border-top: 1px solid var(--border);
    padding: 3rem 2rem;
  }
  .b-footer-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;
  }
  .b-footer-brand {
    font-family: var(--font-head); font-size: 0.95rem; font-weight: 700;
    color: var(--text1); text-decoration: none; letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 0.4rem;
  }
  .b-footer-links { display: flex; gap: 2rem; }
  .b-footer-link {
    text-decoration: none; color: var(--text2); font-size: 0.85rem;
    transition: color 0.2s; font-weight: 400;
  }
  .b-footer-link:hover { color: var(--text1); }
  .b-footer-copy { font-size: 0.78rem; color: rgba(255,255,255,0.35); }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .b-how-grid { grid-template-columns: 1fr; }
    .b-counters { grid-template-columns: 1fr; max-width: 380px; }
  }
  @media (max-width: 768px) {
    .b-nav-links { display: none; }
    .b-nav-inner { padding: 1.3rem 1.25rem; }
    .b-hero-head { font-size: clamp(2.8rem, 12vw, 5rem); }
    .b-door-wrap { width: 180px; height: 280px; }
    .b-frag { font-size: 0.56rem; }
    .b-section { padding: 4rem 1.25rem; }
    .b-footer-inner { flex-direction: column; text-align: center; }
    .b-footer-links { justify-content: center; }
    .b-how-grid { gap: 1rem; }
  }
  @media (max-width: 480px) {
    .b-door-wrap { width: 140px; height: 220px; }
    .b-frag { display: none; }
  }
`;

// ─── Component ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const doorRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const fragmentRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Counter refs
  const counter1Ref = useRef<HTMLSpanElement>(null);
  const counter2Ref = useRef<HTMLSpanElement>(null);
  const counter3Ref = useRef<HTMLSpanElement>(null);

  // Section refs for scroll animations
  const wallRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const identityRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);

  // Identity generator
  const [currentId, setCurrentId] = useState(identities[0]);
  const idRef = useRef<HTMLSpanElement>(null);

  // Chat messages visibility
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  // Navbar scroll effect
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Nav
      gsap.from(navRef.current, { y: -24, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.1 });

      // ── Hero sequence
      const heroTl = gsap.timeline({ delay: 0.4 });
      heroTl
        .from(badgeRef.current, { y: 14, opacity: 0, duration: 0.8, ease: 'power3.out' })
        .from(doorRef.current, { scaleY: 0.82, opacity: 0, duration: 1.8, ease: 'expo.out', transformOrigin: 'bottom center' }, '-=0.6')
        .from(headRef.current, { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out' }, '-=1.4')
        .from(subRef.current, { y: 20, opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.8')
        .from(ctaRef.current, { y: 16, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');

      // ── Fragments
      fragmentRefs.current.forEach((el, i) => {
        if (!el) return;
        const f = heroFragments[i];
        gsap.from(el, { opacity: 0, y: 8, duration: 1.2, delay: 1.5 + f.delay, ease: 'power2.out' });
        gsap.to(el, { y: `+=${6 + i * 1.5}`, x: `+=${i % 2 === 0 ? 4 : -4}`, duration: f.dur, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: f.delay });
      });

      // ── Spotlight wander
      if (spotRef.current) {
        gsap.to(spotRef.current, { x: 60, y: 25, duration: 13, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }

      // ── Wall notes: staggered slide-in
      if (wallRef.current) {
        gsap.from(wallRef.current.querySelectorAll('.b-note'), {
          y: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: wallRef.current, start: 'top 80%' },
        });
      }

      // ── Counters: count-up
      const counterData = [
        { el: counter1Ref.current, end: 138, suffix: '' },
        { el: counter2Ref.current, end: 420, suffix: '' },
        { el: counter3Ref.current, end: 64, suffix: '' },
      ];
      counterData.forEach(({ el, end, suffix }) => {
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: end, duration: 2, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.floor(obj.val) + suffix; },
          scrollTrigger: { trigger: countersRef.current, start: 'top 80%', once: true },
        });
      });

      // ── How panels: stagger
      if (howRef.current) {
        gsap.from(howRef.current.querySelectorAll('.b-how-panel'), {
          y: 36, opacity: 0, stagger: 0.15, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: howRef.current, start: 'top 78%' },
        });
      }

      // ── Identity section
      if (identityRef.current) {
        gsap.from(identityRef.current.querySelectorAll('.b-reveal'), {
          y: 24, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: identityRef.current, start: 'top 78%' },
        });
      }

      // ── Final CTA
      if (finalRef.current) {
        gsap.from(finalRef.current.querySelectorAll('.b-reveal'), {
          y: 28, opacity: 0, stagger: 0.14, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: finalRef.current, start: 'top 80%' },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Chat message reveal simulation
  useEffect(() => {
    chatMessages.forEach((msg, i) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, i]);
      }, msg.delay * 1000 + 2500);
    });
  }, []);

  // Identity generator
  function generateId() {
    const el = idRef.current;
    if (!el) return;
    el.classList.add('fade');
    setTimeout(() => {
      const next = identities[Math.floor(Math.random() * identities.length)];
      setCurrentId(next);
      el.classList.remove('fade');
    }, 150);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div ref={rootRef}>
        {/* Noise grain */}
        <div className="b-noise" aria-hidden />

        {/* ════════════ NAVBAR ════════════ */}
        <nav ref={navRef} className="b-nav">
          <div className="b-nav-inner">
            <Link href="/" className="b-logo">
              <span className="b-logo-icon">S</span>
              StallTalk
            </Link>
            <div className="b-nav-links">
              <Link href="#how" className="b-nav-link">How it Works</Link>
              <Link href="#voices" className="b-nav-link">Voices</Link>
              <Link href="#safety" className="b-nav-link">Safety</Link>
            </div>
            <Link href="/join" className="b-nav-cta">Enter StallTalk</Link>
          </div>
        </nav>

        {/* ════════════ HERO ════════════ */}
        <section ref={heroRef} className="b-hero">
          <div ref={spotRef} className="b-hero-spot" aria-hidden />
          <div className="b-hero-spot2" aria-hidden />

          {/* Live badge */}
          <div ref={badgeRef} className="b-badge">
            <span className="b-badge-dot" />
            138 people inside right now
          </div>

          {/* Doorway + fragments */}
          <div ref={doorRef} className="b-door-wrap">
            <div className="b-door-arch">
              <div className="b-door-interior">
                <div className="b-door-radial" />
                <div className="b-door-beam" />
              </div>
              <div className="b-door-halo" />
              <div className="b-door-keyhole" />
            </div>

            {heroFragments.map((f, i) => (
              <span
                key={i}
                ref={el => { fragmentRefs.current[i] = el; }}
                className="b-frag"
                style={{ '--fx': f.x, '--fy': f.y } as React.CSSProperties}
              >
                {f.text}
              </span>
            ))}
          </div>

          {/* Headline */}
          <h1 ref={headRef} className="b-hero-head">
            Speak the <span className="accent">unsaid.</span>
          </h1>

          {/* Sub */}
          <p ref={subRef} className="b-hero-sub">
            StallTalk is a private anonymous space where students, teams, and communities share what they really think.
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="b-hero-cta">
            <Link href="/join" className="b-btn-primary">
              Enter StallTalk →
            </Link>
            <Link href="/join" className="b-btn-secondary">
              Join with Code
            </Link>
          </div>

          <div className="b-hero-fade" aria-hidden />
        </section>

        {/* ════════════ ANONYMOUS WALL ════════════ */}
        <div id="voices" className="b-wall">
          <div ref={wallRef} className="b-wall-inner">
            <span className="b-section-label">Anonymous Wall</span>
            <h2 className="b-section-title">What people wrote today</h2>
            <p className="b-section-sub">Real messages from real people — no names, no faces, just honesty.</p>

            <div className="b-wall-grid">
              {wallNotes.map((note, i) => (
                <div
                  key={i}
                  className="b-note"
                  style={{
                    transform: `rotate(${note.rot}deg)`,
                    background: note.bg,
                  }}
                >
                  <div className="b-note-name" style={{ color: note.accent }}>{note.name}</div>
                  <div className="b-note-text">{note.text}</div>
                  <div className="b-note-tag">anon · just now</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════ LIVE COUNTERS ════════════ */}
        <div ref={countersRef}>
          <div className="b-counters">
            {[
              { emoji: '🔥', label: 'people inside stalls', ref: counter1Ref },
              { emoji: '💬', label: 'anonymous notes today', ref: counter2Ref },
              { emoji: '👀', label: 'active rooms', ref: counter3Ref },
            ].map(({ emoji, label, ref }, i) => (
              <div key={i} className="b-counter-card">
                <span className="b-counter-emoji">{emoji}</span>
                <span ref={ref} className="b-counter-num">0</span>
                <span className="b-counter-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="b-divider" />

        {/* ════════════ HOW IT WORKS ════════════ */}
        <div id="how" className="b-section">
          <span className="b-section-label">How it works</span>
          <h2 className="b-section-title">Three steps to honesty.</h2>
          <p className="b-section-sub">No signups, no profiles, no traces.</p>

          <div ref={howRef} className="b-how-grid">
            {[
              { num: '01', title: 'Enter a Stall', desc: 'Join a private anonymous room using a short invite code. No account needed.' },
              { num: '02', title: 'Become Anonymous', desc: 'You get a randomly generated identity like ShadowFox or MidnightEcho. Nobody knows who you are.' },
              { num: '03', title: 'Speak Freely', desc: 'Share thoughts, confessions, reactions, and feedback without fear of judgment.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="b-how-panel">
                <span className="b-how-num">{num}</span>
                <div className="b-how-title">{title}</div>
                <div className="b-how-desc">{desc}</div>
                <div className="b-how-glow" />
              </div>
            ))}
          </div>
        </div>

        <div className="b-divider" />

        {/* ════════════ IDENTITY GENERATOR ════════════ */}
        <div ref={identityRef} className="b-identity">
          <div className="b-identity-inner">
            <span className="b-section-label b-reveal">Your StallTalk Identity</span>
            <p className="b-section-title b-reveal" style={{ fontFamily: 'var(--font-head)' }}>You enter as...</p>
            <span ref={idRef} className="b-id-display b-reveal">{currentId}</span>
            <div>
              <button onClick={generateId} className="b-btn-gen b-reveal">
                ↻ Generate New Identity
              </button>
            </div>
            <p className="b-id-sub b-reveal">A new random name. A new voice. No history attached.</p>
          </div>
        </div>

        {/* ════════════ CHAT PREVIEW ════════════ */}
        <div ref={chatRef} className="b-chat-wrap">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="b-section-label">Live Preview</span>
            <h2 className="b-section-title">Inside a StallTalk stall</h2>
            <p className="b-section-sub">Anonymous. Real-time. Honest.</p>
          </div>

          <div className="b-chat-window">
            {/* Header */}
            <div className="b-chat-header">
              <span className="b-chat-dot" />
              <span className="b-chat-room">#cs-batch</span>
              <span className="b-chat-count">12 anonymous</span>
            </div>

            {/* Messages */}
            <div className="b-chat-body">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`b-chat-msg ${visibleMessages.includes(i) ? 'visible' : ''}`}>
                  {msg.typing ? (
                    <div className="b-typing">
                      <span className="b-typing-name" style={{ color: 'rgba(129,140,248,0.7)' }}>MidnightEcho</span>
                      <div className="b-typing-dots">
                        <span className="b-typing-dot" />
                        <span className="b-typing-dot" />
                        <span className="b-typing-dot" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="b-msg-name" style={{ color: i === 0 ? '#7c5cfc' : i === 1 ? '#22d3ee' : '#a78bfa' }}>
                        {msg.name}
                      </span>
                      <span className="b-msg-text">{msg.text}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="b-divider" />

        {/* ════════════ FINAL CTA ════════════ */}
        <div id="safety" ref={finalRef} className="b-final">
          <div className="b-final-inner">
            <h2 className="b-final-quote b-reveal">
              There are things people only say<br />
              when <em>nobody knows it's them.</em>
            </h2>
            <p className="b-final-sub b-reveal">
              StallTalk is that place. A private room on the internet where your words matter more than your identity.
            </p>
            <div className="b-reveal">
              <Link href="/join" className="b-btn-primary" style={{ display: 'inline-flex' }}>
                Enter StallTalk →
              </Link>
            </div>
          </div>
        </div>

        {/* ════════════ FOOTER ════════════ */}
        <footer className="b-footer">
          <div className="b-footer-inner">
            <Link href="/" className="b-footer-brand">
              <span className="b-logo-icon">S</span>
              StallTalk
            </Link>
            <div className="b-footer-links">
              <Link href="#" className="b-footer-link">About</Link>
              <Link href="#safety" className="b-footer-link">Safety</Link>
              <Link href="#" className="b-footer-link">Privacy</Link>
            </div>
            <span className="b-footer-copy">© 2026 StallTalk</span>
          </div>
        </footer>
      </div>
    </>
  );
}
