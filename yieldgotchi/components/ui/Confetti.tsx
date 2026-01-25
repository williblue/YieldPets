'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  show: boolean;
}

export function Confetti({ show }: ConfettiProps) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (show && !hasTriggered.current) {
      hasTriggered.current = true;
      
      // Fire confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#06b6d4', '#22d3ee', '#67e8f9'],
      });
      
      fire(0.2, {
        spread: 60,
        colors: ['#06b6d4', '#22d3ee', '#67e8f9'],
      });
      
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#06b6d4', '#22d3ee', '#67e8f9', '#fbbf24'],
      });
      
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ['#06b6d4', '#22d3ee', '#67e8f9'],
      });
      
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#fbbf24', '#f59e0b'],
      });
    }
    
    if (!show) {
      hasTriggered.current = false;
    }
  }, [show]);

  return null;
}
