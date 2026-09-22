'use client';

import confetti from 'canvas-confetti';

// Palette + count locked per DESIGN.md — no rainbow, no excess.
const PALETTE = ['#C8A052', '#6B2D2D', '#1A1A1A'];

export function fireConfetti() {
  if (typeof window === 'undefined') return;
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 38,
    origin: { x: 0.5, y: 1 },
    colors: PALETTE,
    scalar: 0.95,
    ticks: 200,
    gravity: 1.1,
  });
}
