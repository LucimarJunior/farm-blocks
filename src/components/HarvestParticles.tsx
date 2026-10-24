import React, { useEffect, useRef } from 'react';
import { CropType } from '../types';

export interface ParticleTrigger {
  id: string;
  x: number; // Board percentage 0-100
  y: number; // Board percentage 0-100
  crop: CropType;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  shape: 'grain' | 'leaf' | 'chaff';
}

interface HarvestParticlesProps {
  triggers: ParticleTrigger[];
}

export const HarvestParticles: React.FC<HarvestParticlesProps> = ({ triggers }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const processedTriggersRef = useRef<Set<string>>(new Set());

  // Spawn particles on new triggers
  useEffect(() => {
    if (!canvasRef.current || triggers.length === 0) return;
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    triggers.forEach((trigger) => {
      if (processedTriggersRef.current.has(trigger.id)) return;
      processedTriggersRef.current.add(trigger.id);

      const originX = (trigger.x / 100) * width;
      const originY = (trigger.y / 100) * height;

      // Color palettes per crop
      const colors =
        trigger.crop === 'corn'
          ? ['#facc15', '#fde047', '#eab308', '#22c55e', '#16a34a']
          : trigger.crop === 'wheat'
          ? ['#fde047', '#f59e0b', '#d97706', '#b45309', '#fef08a']
          : ['#4ade80', '#22c55e', '#15803d', '#bef264', '#a3e635'];

      // Spawn 10-12 particles per harvested cell
      const count = 11;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3.5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shapeType = i % 3 === 0 ? 'leaf' : i % 3 === 1 ? 'grain' : 'chaff';

        particlesRef.current.push({
          x: originX + (Math.random() - 0.5) * 16,
          y: originY + (Math.random() - 0.5) * 16,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.8, // Upward burst
          size: 3 + Math.random() * 4,
          color,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.25,
          alpha: 1,
          shape: shapeType,
        });
      }
    });

    // Clean up processed ids if triggers array resets
    if (triggers.length === 0) {
      processedTriggersRef.current.clear();
    }
  }, [triggers]);

  // Animation Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // Gravity
        p.vx *= 0.96; // Air drag
        p.rotation += p.vRot;
        p.alpha -= 0.024; // Fade out (~600ms)

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'grain') {
          // Oval corn/wheat grain
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.6, p.size * 1.1, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'leaf') {
          // Pointed green leaf flake
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size);
          ctx.fill();
        } else {
          // Straw chaff sliver
          ctx.fillRect(-p.size * 0.4, -p.size * 1.2, p.size * 0.7, p.size * 2.2);
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
    />
  );
};
