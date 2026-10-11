/**
 * Mahi Crick Pro - 3D Cricket Ball Component
 * High performance Canvas-based 3D sphere renderer with rotating seam and specular lighting
 */

import React, { useEffect, useRef } from 'react';

interface CricketBall3DProps {
  size?: number;
  rotationSpeed?: number;
  className?: string;
  wobble?: boolean;
}

export const CricketBall3D: React.FC<CricketBall3DProps> = ({
  size = 140,
  rotationSpeed = 0.025,
  className = '',
  wobble = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    let tilt = 0.35; // tilt angle for seam visibility

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.44;

      ctx.clearRect(0, 0, w, h);

      // 1. Drop shadow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.95, r * 0.8, r * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.filter = 'blur(10px)';
      ctx.fill();
      ctx.restore();

      // 2. Leather Ball Base Gradient
      const baseGrad = ctx.createRadialGradient(
        cx - r * 0.35,
        cy - r * 0.35,
        r * 0.1,
        cx,
        cy,
        r
      );
      baseGrad.addColorStop(0, '#f87171'); // Light highlight
      baseGrad.addColorStop(0.2, '#dc2626'); // Rich crimson
      baseGrad.addColorStop(0.65, '#991b1b'); // Deep leather red
      baseGrad.addColorStop(0.95, '#450a0a'); // Dark edge rim
      baseGrad.addColorStop(1, '#1e0505');

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.clip();

      // 3. 3D Seam projection
      // Calculate 3D points on great circle of sphere rotated by angle
      const numStitches = 64;
      const seamPoints: { x: number; y: number; z: number }[] = [];

      for (let i = 0; i < numStitches; i++) {
        const theta = (i / numStitches) * Math.PI * 2;
        // Point on unit circle in X-Z plane tilted by tilt
        const rawX = Math.cos(theta);
        const rawY = Math.sin(theta) * Math.sin(tilt);
        const rawZ = Math.sin(theta) * Math.cos(tilt);

        // Rotate around Y axis by angle
        const rotX = rawX * Math.cos(angle) + rawZ * Math.sin(angle);
        const rotY = rawY + (wobble ? Math.sin(angle * 2) * 0.08 : 0);
        const rotZ = -rawX * Math.sin(angle) + rawZ * Math.cos(angle);

        seamPoints.push({
          x: cx + rotX * r,
          y: cy + rotY * r,
          z: rotZ,
        });
      }

      // Draw Seam Ribbon (visible only when z > -0.2)
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#fef08a'; // goldish white thread
      ctx.lineCap = 'round';

      for (let i = 0; i < seamPoints.length; i++) {
        const p1 = seamPoints[i];
        const p2 = seamPoints[(i + 1) % seamPoints.length];

        if (p1.z > -0.15 && p2.z > -0.15) {
          // Stitch thread segment
          const depthAlpha = Math.max(0.1, (p1.z + 1) / 2);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(254, 240, 138, ${depthAlpha * 0.9})`;
          ctx.stroke();

          // Cross stitch marks
          if (i % 2 === 0 && p1.z > 0.1) {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const normX = -dy * 0.12;
            const normY = dx * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x - normX, p1.y - normY);
            ctx.lineTo(p1.x + normX, p1.y + normY);
            ctx.strokeStyle = `rgba(255, 255, 255, ${depthAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.lineWidth = 3.5;
          }
        }
      }

      // 4. Glossy Specular Sheen (simulating polished lacquer on leather)
      const sheenGrad = ctx.createRadialGradient(
        cx - r * 0.45,
        cy - r * 0.45,
        2,
        cx - r * 0.45,
        cy - r * 0.45,
        r * 0.6
      );
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(cx - r * 0.45, cy - r * 0.45, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = sheenGrad;
      ctx.fill();

      // Rim ambient glow
      ctx.restore();

      angle += rotationSpeed;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [rotationSpeed, wobble]);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        className="w-full h-full"
      />
    </div>
  );
};
