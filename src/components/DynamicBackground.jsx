import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function DynamicBackground() {
  const { 
    particleType, 
    particleSpeed, 
    particleDensity, 
    interactivePhysics, 
    activeParticleColor,
    secondaryColor, 
    mode 
  } = useTheme();
  
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, isMoving: false });

  useEffect(() => {
    if (particleType === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.isMoving = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.isMoving = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const pColor = activeParticleColor || '#FFB800';

    // Speed multiplier
    const speedMult = particleSpeed === 'slow' ? 0.45 : particleSpeed === 'fast' ? 1.85 : 1.0;

    // Density multiplier
    const densityMult = particleDensity === 'low' ? 0.5 : particleDensity === 'high' ? 1.8 : 1.0;
    const baseCount = width < 768 ? 24 : 50;
    const count = Math.floor(baseCount * densityMult);

    // Helper hex to rgba
    const hexToRgba = (hex, alpha) => {
      let c;
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${alpha})`;
      }
      return hex;
    };

    let particles = [];

    // --- INITIALIZE PARTICLES BY TYPE ---

    // 1. STARS & SPARKLES INIT
    if (particleType === 'stars-sparkles') {
      for (let i = 0; i < count * 1.5; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.2 + 0.8,
          alpha: Math.random() * 0.8 + 0.2,
          speedAlpha: (Math.random() * 0.02 + 0.005) * speedMult,
          isSparkle: Math.random() > 0.45,
          spikeLength: Math.random() * 12 + 6,
          vx: (Math.random() * 0.3 - 0.15) * speedMult,
          vy: -(Math.random() * 0.4 + 0.1) * speedMult
        });
      }
    }

    // 2. SAKURA PETALS (3D TUMBLING REALISTIC) INIT
    else if (particleType === 'sakura-petals') {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 10 + 7,
          vy: (Math.random() * 0.9 + 0.6) * speedMult,
          vx: (Math.random() * 0.7 + 0.1) * speedMult,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() * 0.03 - 0.015) * speedMult,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: (Math.random() * 0.04 + 0.01) * speedMult,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: (Math.random() * 0.03 + 0.015) * speedMult,
          alpha: Math.random() * 0.6 + 0.35
        });
      }
    }

    // 3. FLOATING HEARTS INIT
    else if (particleType === 'floating-hearts') {
      for (let i = 0; i < Math.floor(count * 0.75); i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 12 + 8,
          vy: -(Math.random() * 0.7 + 0.3) * speedMult,
          vx: (Math.random() * 0.4 - 0.2) * speedMult,
          pulse: Math.random() * Math.PI,
          alpha: Math.random() * 0.55 + 0.25
        });
      }
    }

    // 4. FLOATING LEAVES INIT
    else if (particleType === 'floating-leaves') {
      for (let i = 0; i < count * 0.9; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 11 + 6,
          vy: (Math.random() * 0.7 + 0.3) * speedMult,
          vx: (Math.random() * 0.8 + 0.2) * speedMult,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() * 0.02 - 0.01) * speedMult,
          sway: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.6 + 0.25
        });
      }
    }

    // 5. TWILIGHT FIREFLIES INIT
    else if (particleType === 'twilight-fireflies') {
      for (let i = 0; i < count * 0.85; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3 + 1.5,
          vx: (Math.random() * 0.8 - 0.4) * speedMult,
          vy: (Math.random() * 0.8 - 0.4) * speedMult,
          glowRadius: Math.random() * 25 + 15,
          glowPhase: Math.random() * Math.PI * 2,
          glowSpeed: (Math.random() * 0.04 + 0.02) * speedMult
        });
      }
    }

    // 6. GOLD GLITTER RAIN INIT
    else if (particleType === 'gold-glitter-rain') {
      for (let i = 0; i < count * 2.2; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 3.5 + 1.2,
          vy: (Math.random() * 2.8 + 1.2) * speedMult,
          vx: (Math.random() * 0.6 - 0.3) * speedMult,
          shimmer: Math.random() * Math.PI * 2,
          shimmerSpeed: (Math.random() * 0.15 + 0.05) * speedMult,
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    }

    // 7. FLOATING GEMS INIT
    else if (particleType === 'floating-gems') {
      for (let i = 0; i < Math.floor(count * 0.65); i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 14 + 8,
          vy: -(Math.random() * 0.5 + 0.2) * speedMult,
          vx: (Math.random() * 0.4 - 0.2) * speedMult,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() * 0.02 - 0.01) * speedMult,
          alpha: Math.random() * 0.6 + 0.3
        });
      }
    }

    // 8. SNOW CRYSTALS INIT
    else if (particleType === 'snow-crystals') {
      for (let i = 0; i < Math.floor(count * 0.9); i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 7 + 4,
          vy: (Math.random() * 1.2 + 0.4) * speedMult,
          vx: (Math.random() * 0.6 - 0.3) * speedMult,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() * 0.02 - 0.01) * speedMult,
          alpha: Math.random() * 0.6 + 0.35
        });
      }
    }

    // 9. PIXEL GRID INIT
    else if (particleType === 'pixel-grid') {
      for (let i = 0; i < count * 1.2; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 8 + 4,
          vx: (Math.random() * 0.6 - 0.3) * speedMult,
          vy: -(Math.random() * 0.9 + 0.3) * speedMult,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() * 0.04 - 0.02) * speedMult,
          alpha: Math.random() * 0.55 + 0.25
        });
      }
    }

    // 10. MATRIX RAIN INIT
    else if (particleType === 'matrix-rain') {
      const columns = Math.floor(width / 22);
      const glyphs = '0123456789ABCDEF01アイウエオカキクケコサシスセソタチツテト';
      for (let i = 0; i < columns; i++) {
        particles.push({
          x: i * 22 + 4,
          y: Math.random() * -height,
          speed: (Math.random() * 4 + 3) * speedMult,
          length: Math.floor(Math.random() * 16 + 8),
          chars: Array.from({ length: 24 }, () => glyphs[Math.floor(Math.random() * glyphs.length)])
        });
      }
    }

    // 11. GEOMETRIC MESH INIT
    else if (particleType === 'geometric-mesh') {
      for (let i = 0; i < count * 1.1; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() * 1 - 0.5) * speedMult,
          vy: (Math.random() * 1 - 0.5) * speedMult,
          radius: Math.random() * 2.5 + 1.5
        });
      }
    }

    // 12. CYBER SPARKS INIT
    else if (particleType === 'cyber-sparks') {
      for (let i = 0; i < count * 1.3; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 25 + 10,
          angle: Math.random() * Math.PI * 2,
          speed: (Math.random() * 3 + 1.5) * speedMult,
          alpha: Math.random() * 0.7 + 0.3,
          decay: Math.random() * 0.03 + 0.01
        });
      }
    }

    // 13. ORBIT PLANETS INIT
    else if (particleType === 'orbit-planets') {
      for (let i = 0; i < Math.floor(count * 0.45); i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 12 + 6,
          vx: (Math.random() * 0.4 - 0.2) * speedMult,
          vy: (Math.random() * 0.4 - 0.2) * speedMult,
          hasRing: Math.random() > 0.3,
          ringRadius: Math.random() * 24 + 14,
          ringTilt: Math.random() * 0.6 + 0.2,
          moonCount: Math.floor(Math.random() * 3),
          moonAngle: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.65 + 0.35
        });
      }
    }

    // 14. NEBULA GALAXY SPIRAL INIT
    else if (particleType === 'nebula-galaxy') {
      for (let i = 0; i < count * 2; i++) {
        const arm = Math.floor(Math.random() * 3);
        const dist = Math.random() * Math.min(width, height) * 0.45;
        const angle = (dist * 0.015) + (arm * (Math.PI * 2 / 3)) + (Math.random() * 0.4 - 0.2);
        particles.push({
          baseAngle: angle,
          dist: dist,
          rotSpeed: (0.003 + (1 / (dist + 50)) * 0.8) * speedMult,
          size: Math.random() * 2.5 + 1,
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    }

    // 15. AURORA WAVE FLOW INIT
    else if (particleType === 'wave-flow') {
      for (let i = 0; i < 6; i++) {
        particles.push({
          offsetY: (height / 7) * (i + 1),
          amplitude: Math.random() * 35 + 20,
          frequency: Math.random() * 0.003 + 0.001,
          phase: Math.random() * Math.PI * 2,
          speed: (Math.random() * 0.02 + 0.01) * speedMult,
          alpha: Math.random() * 0.35 + 0.15
        });
      }
    }

    // 16. BOKEH GLASS BUBBLES INIT
    else if (particleType === 'floating-bokeh') {
      for (let i = 0; i < Math.floor(count * 0.45); i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 85 + 30,
          vx: (Math.random() * 0.5 - 0.25) * speedMult,
          vy: -(Math.random() * 0.6 + 0.2) * speedMult,
          alpha: Math.random() * 0.12 + 0.03
        });
      }
    }

    // --- 🚀 NEW ACTION PARTICLE ENGINES ---

    // 17. BLACK HOLE VORTEX (EVENT HORIZON GRAVITATIONAL PULL)
    else if (particleType === 'black-hole-vortex') {
      const cx = width / 2;
      const cy = height / 2;
      for (let i = 0; i < count * 2.2; i++) {
        const r = Math.random() * Math.min(width, height) * 0.5 + 25;
        const theta = Math.random() * Math.PI * 2;
        particles.push({
          cx, cy,
          r,
          theta,
          radialSpeed: (Math.random() * 0.8 + 0.4) * speedMult,
          angularSpeed: (0.015 + (80 / (r + 10)) * 0.005) * speedMult,
          size: Math.random() * 2.8 + 1,
          alpha: Math.random() * 0.8 + 0.2
        });
      }
    }

    // 18. QUANTUM SUPERNOVA (STARBURST EXPANSION SHOCKWAVES)
    else if (particleType === 'quantum-supernova') {
      for (let i = 0; i < count * 1.8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 3.5 + 1) * speedMult;
        particles.push({
          x: width / 2,
          y: height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.5 + 1.2,
          life: Math.random() * 120 + 30,
          maxLife: 150,
          alpha: 1
        });
      }
    }

    // 19. NEON CONFETTI EXPLOSION (3D TUMBLING CYBER CONFETTI)
    else if (particleType === 'neon-confetti-explosion') {
      for (let i = 0; i < count * 1.4; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * -height,
          w: Math.random() * 12 + 6,
          h: Math.random() * 7 + 4,
          vy: (Math.random() * 2.2 + 1.2) * speedMult,
          vx: (Math.random() * 1.2 - 0.6) * speedMult,
          rotX: Math.random() * Math.PI * 2,
          rotY: Math.random() * Math.PI * 2,
          rotZ: Math.random() * Math.PI * 2,
          rotSpeedX: (Math.random() * 0.06 - 0.03) * speedMult,
          rotSpeedY: (Math.random() * 0.08 - 0.04) * speedMult,
          rotSpeedZ: (Math.random() * 0.04 - 0.02) * speedMult,
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    }

    // 20. DNA HELIX CYBER (3D DOUBLE HELIX ROTATING BIOTECH)
    else if (particleType === 'dna-helix-cyber') {
      const nodes = Math.floor(count * 1.2);
      for (let i = 0; i < nodes; i++) {
        particles.push({
          progress: i / nodes,
          y: (i / nodes) * height,
          speed: (0.015 + Math.random() * 0.005) * speedMult,
          phase: (i * 0.35)
        });
      }
    }

    // 21. PLASMA LIGHTNING STORM (FORKED TESLA ARCS & THUNDER BURSTS)
    else if (particleType === 'plasma-lightning-storm') {
      particles = [{
        timer: 0,
        nextStrike: 25,
        branches: []
      }];
    }

    // 22. BUBBLE LAVA LAMP (VISCOUS METABALLS WITH ORGANIC GLOW)
    else if (particleType === 'bubble-lava-lamp') {
      for (let i = 0; i < 14; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 45 + 25,
          vy: -(Math.random() * 0.7 + 0.2) * speedMult,
          vx: (Math.random() * 0.4 - 0.2) * speedMult,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: (Math.random() * 0.03 + 0.01) * speedMult,
          alpha: Math.random() * 0.25 + 0.1
        });
      }
    }

    // 23. HYPERSPACE WARP (STAR WARS 3D WARP SPEED LIGHT TUNNEL)
    else if (particleType === 'hyperspace-warp') {
      for (let i = 0; i < count * 2.2; i++) {
        particles.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: Math.random() * width,
          prevZ: Math.random() * width
        });
      }
    }

    // --- MAIN RENDER LOOP ---
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // 1. STARS & SPARKLES
      if (particleType === 'stars-sparkles') {
        particles.forEach(p => {
          p.alpha += p.speedAlpha;
          if (p.alpha > 0.95 || p.alpha < 0.1) p.speedAlpha = -p.speedAlpha;

          p.y += p.vy;
          p.x += p.vx;
          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          if (interactivePhysics) {
            const dist = Math.hypot(p.x - mx, p.y - my);
            if (dist < 90) {
              const angle = Math.atan2(p.y - my, p.x - mx);
              p.x += Math.cos(angle) * 2;
              p.y += Math.sin(angle) * 2;
            }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba('#FFFFFF', Math.max(0, p.alpha));
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 12;
          ctx.fill();

          if (p.isSparkle && p.alpha > 0.4) {
            const len = p.spikeLength * (p.alpha);
            ctx.strokeStyle = hexToRgba(pColor, p.alpha * 0.85);
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(p.x - len, p.y);
            ctx.lineTo(p.x + len, p.y);
            ctx.moveTo(p.x, p.y - len);
            ctx.lineTo(p.x, p.y + len);
            ctx.stroke();

            const dLen = len * 0.55;
            ctx.beginPath();
            ctx.moveTo(p.x - dLen, p.y - dLen);
            ctx.lineTo(p.x + dLen, p.y + dLen);
            ctx.moveTo(p.x + dLen, p.y - dLen);
            ctx.lineTo(p.x - dLen, p.y + dLen);
            ctx.strokeStyle = hexToRgba('#FFFFFF', p.alpha * 0.6);
            ctx.stroke();
          }
        });
      }

      // 2. SAKURA PETALS
      else if (particleType === 'sakura-petals') {
        particles.forEach(p => {
          p.sway += p.swaySpeed;
          p.flip += p.flipSpeed;
          p.rotation += p.rotSpeed;
          p.y += p.vy;
          p.x += p.vx + Math.sin(p.sway) * 1.5;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;

          if (interactivePhysics) {
            const dist = Math.hypot(p.x - mx, p.y - my);
            if (dist < 100) {
              const angle = Math.atan2(p.y - my, p.x - mx);
              p.x += Math.cos(angle) * 3;
              p.y += Math.sin(angle) * 3;
            }
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(Math.cos(p.flip), 1);

          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.8, p.size, 0, 0, p.size);
          ctx.bezierCurveTo(-p.size, 0, -p.size * 0.8, -p.size * 0.8, 0, -p.size);

          const grad = ctx.createLinearGradient(0, -p.size, 0, p.size);
          grad.addColorStop(0, hexToRgba('#FFFFFF', p.alpha * 0.8));
          grad.addColorStop(0.5, hexToRgba(pColor, p.alpha));
          grad.addColorStop(1, hexToRgba(pColor, p.alpha * 0.7));

          ctx.fillStyle = grad;
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        });
      }

      // 3. FLOATING HEARTS
      else if (particleType === 'floating-hearts') {
        particles.forEach(p => {
          p.pulse += 0.05 * speedMult;
          const scale = 1 + Math.sin(p.pulse) * 0.15;
          p.y += p.vy;
          p.x += p.vx;

          if (p.y < -30) {
            p.y = height + 30;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(scale, scale);

          ctx.beginPath();
          const d = p.size;
          ctx.moveTo(0, d / 4);
          ctx.quadraticCurveTo(0, 0, d / 4, 0);
          ctx.quadraticCurveTo(d / 2, 0, d / 2, d / 4);
          ctx.quadraticCurveTo(d / 2, 0, (d * 3) / 4, 0);
          ctx.quadraticCurveTo(d, 0, d, d / 4);
          ctx.quadraticCurveTo(d, d / 2, (d * 3) / 4, (d * 3) / 4);
          ctx.lineTo(d / 2, d);
          ctx.lineTo(d / 4, (d * 3) / 4);
          ctx.quadraticCurveTo(0, d / 2, 0, d / 4);

          ctx.fillStyle = hexToRgba(pColor, p.alpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
        });
      }

      // 4. FLOATING LEAVES
      else if (particleType === 'floating-leaves') {
        particles.forEach(p => {
          p.sway += 0.02 * speedMult;
          p.rotation += p.rotSpeed;
          p.y += p.vy;
          p.x += p.vx + Math.sin(p.sway) * 0.8;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size);

          ctx.fillStyle = hexToRgba(pColor, p.alpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        });
      }

      // 5. TWILIGHT FIREFLIES
      else if (particleType === 'twilight-fireflies') {
        particles.forEach(p => {
          p.glowPhase += p.glowSpeed;
          const curAlpha = (Math.sin(p.glowPhase) + 1) * 0.45 + 0.1;
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowRadius);
          grad.addColorStop(0, hexToRgba('#FFFFFF', curAlpha));
          grad.addColorStop(0.25, hexToRgba(pColor, curAlpha * 0.8));
          grad.addColorStop(1, hexToRgba(pColor, 0));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      }

      // 6. GOLD GLITTER RAIN
      else if (particleType === 'gold-glitter-rain') {
        particles.forEach(p => {
          p.shimmer += p.shimmerSpeed;
          const curAlpha = (Math.sin(p.shimmer) + 1) * 0.45 + 0.1;
          p.y += p.vy;
          p.x += p.vx;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(pColor, curAlpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 8;
          ctx.fill();
        });
      }

      // 7. FLOATING GEMS
      else if (particleType === 'floating-gems') {
        particles.forEach(p => {
          p.rot += p.rotSpeed;
          p.y += p.vy;
          p.x += p.vx;

          if (p.y < -30) {
            p.y = height + 30;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);

          ctx.beginPath();
          const s = p.size;
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.8, -s * 0.3);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.8, -s * 0.3);
          ctx.closePath();

          ctx.fillStyle = hexToRgba(pColor, p.alpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.restore();
        });
      }

      // 8. SNOW CRYSTALS
      else if (particleType === 'snow-crystals') {
        particles.forEach(p => {
          p.rotation += p.rotSpeed;
          p.y += p.vy;
          p.x += p.vx;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          ctx.strokeStyle = hexToRgba(pColor, p.alpha);
          ctx.lineWidth = 1.2;
          for (let a = 0; a < 6; a++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, p.radius);
            ctx.moveTo(0, p.radius * 0.5);
            ctx.lineTo(p.radius * 0.3, p.radius * 0.7);
            ctx.moveTo(0, p.radius * 0.5);
            ctx.lineTo(-p.radius * 0.3, p.radius * 0.7);
            ctx.stroke();
          }
          ctx.restore();
        });
      }

      // 9. PIXEL GRID
      else if (particleType === 'pixel-grid') {
        particles.forEach(p => {
          p.rot += p.rotSpeed;
          p.y += p.vy;
          p.x += p.vx;

          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);

          ctx.fillStyle = hexToRgba(pColor, p.alpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 6;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });
      }

      // 10. MATRIX RAIN
      else if (particleType === 'matrix-rain') {
        ctx.font = '14px monospace';
        particles.forEach(col => {
          col.y += col.speed;
          if (col.y > height + col.length * 18) {
            col.y = -100;
          }

          for (let j = 0; j < col.length; j++) {
            const charY = col.y - j * 18;
            if (charY > 0 && charY < height) {
              const char = col.chars[j % col.chars.length];
              const alpha = j === 0 ? 1 : Math.max(0.08, 1 - j / col.length);
              ctx.fillStyle = j === 0 ? '#FFFFFF' : hexToRgba(pColor, alpha * 0.85);
              ctx.fillText(char, col.x, charY);
            }
          }
        });
      }

      // 11. GEOMETRIC MESH
      else if (particleType === 'geometric-mesh') {
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          p1.x += p1.vx;
          p1.y += p1.vy;

          if (p1.x < 0 || p1.x > width) p1.vx = -p1.vx;
          if (p1.y < 0 || p1.y > height) p1.vy = -p1.vy;

          ctx.beginPath();
          ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(pColor, 0.7);
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 110) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = hexToRgba(pColor, (1 - dist / 110) * 0.25);
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }

      // 12. CYBER SPARKS
      else if (particleType === 'cyber-sparks') {
        particles.forEach(p => {
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.alpha = Math.random() * 0.7 + 0.3;
            p.angle = Math.random() * Math.PI * 2;
          }

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - Math.cos(p.angle) * p.length, p.y - Math.sin(p.angle) * p.length);
          ctx.strokeStyle = hexToRgba(pColor, p.alpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 10;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      // 13. ORBIT PLANETS
      else if (particleType === 'orbit-planets') {
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.moonAngle += 0.03 * speedMult;

          if (p.x < -40) p.x = width + 40;
          if (p.x > width + 40) p.x = -40;
          if (p.y < -40) p.y = height + 40;
          if (p.y > height + 40) p.y = -40;

          // Planet Body
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(pColor, p.alpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 12;
          ctx.fill();

          // Planet Rings
          if (p.hasRing) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(1, p.ringTilt);
            ctx.beginPath();
            ctx.arc(0, 0, p.ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = hexToRgba(pColor, p.alpha * 0.6);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      // 14. NEBULA GALAXY SPIRAL
      else if (particleType === 'nebula-galaxy') {
        const cx = width / 2;
        const cy = height / 2;
        particles.forEach(p => {
          p.baseAngle += p.rotSpeed;
          const px = cx + Math.cos(p.baseAngle) * p.dist;
          const py = cy + Math.sin(p.baseAngle) * p.dist;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(pColor, p.alpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 8;
          ctx.fill();
        });
      }

      // 15. AURORA WAVE FLOW
      else if (particleType === 'wave-flow') {
        particles.forEach(wave => {
          wave.phase += wave.speed;
          ctx.beginPath();
          ctx.moveTo(0, wave.offsetY);
          for (let x = 0; x < width; x += 15) {
            const y = wave.offsetY + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = hexToRgba(pColor, wave.alpha);
          ctx.lineWidth = 2.5;
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 14;
          ctx.stroke();
        });
      }

      // 16. BOKEH GLASS BUBBLES
      else if (particleType === 'floating-bokeh') {
        particles.forEach(p => {
          p.y += p.vy;
          p.x += p.vx;
          if (p.y < -100) p.y = height + 100;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, hexToRgba(pColor, p.alpha * 1.5));
          grad.addColorStop(0.8, hexToRgba(pColor, p.alpha * 0.4));
          grad.addColorStop(1, hexToRgba(pColor, 0));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      }

      // --- 🚀 NEW ACTION ENGINES RENDER ---

      // 17. BLACK HOLE VORTEX
      else if (particleType === 'black-hole-vortex') {
        const cx = width / 2;
        const cy = height / 2;

        // Central Event Horizon Shadow
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.shadowColor = pColor;
        ctx.shadowBlur = 35;
        ctx.fill();

        // Relativistic Jet
        ctx.beginPath();
        ctx.moveTo(cx, cy - 80);
        ctx.lineTo(cx, cy + 80);
        ctx.strokeStyle = hexToRgba('#FFFFFF', 0.4);
        ctx.lineWidth = 2;
        ctx.stroke();

        particles.forEach(p => {
          p.r -= p.radialSpeed;
          p.theta += p.angularSpeed;

          if (p.r < 30) {
            p.r = Math.min(width, height) * 0.5 + Math.random() * 50;
          }

          const px = cx + Math.cos(p.theta) * p.r;
          const py = cy + Math.sin(p.theta) * (p.r * 0.65); // Accretion disk tilt

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(pColor, p.alpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 10;
          ctx.fill();
        });
      }

      // 18. QUANTUM SUPERNOVA
      else if (particleType === 'quantum-supernova') {
        const cx = width / 2;
        const cy = height / 2;

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life--;

          if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            p.x = cx;
            p.y = cy;
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 4 + 1.2) * speedMult;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.life = Math.random() * 120 + 30;
          }

          const alpha = p.life / p.maxLife;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(pColor, alpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 12;
          ctx.fill();
        });
      }

      // 19. NEON CONFETTI EXPLOSION
      else if (particleType === 'neon-confetti-explosion') {
        particles.forEach(p => {
          p.rotX += p.rotSpeedX;
          p.rotY += p.rotSpeedY;
          p.rotZ += p.rotSpeedZ;
          p.y += p.vy;
          p.x += p.vx;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotZ);
          ctx.scale(Math.cos(p.rotX), Math.sin(p.rotY));

          ctx.fillStyle = hexToRgba(pColor, p.alpha);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 8;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
      }

      // 20. DNA HELIX CYBER
      else if (particleType === 'dna-helix-cyber') {
        const cx = width / 2;
        const amp = Math.min(width * 0.22, 160);

        particles.forEach(p => {
          p.phase += p.speed;
          p.y += 0.8 * speedMult;
          if (p.y > height) p.y = 0;

          const x1 = cx + Math.sin(p.phase) * amp;
          const x2 = cx - Math.sin(p.phase) * amp;
          const depth = Math.cos(p.phase);

          // Connecting rungs
          ctx.beginPath();
          ctx.moveTo(x1, p.y);
          ctx.lineTo(x2, p.y);
          ctx.strokeStyle = hexToRgba(pColor, 0.25);
          ctx.lineWidth = 1;
          ctx.stroke();

          // Strand 1 node
          ctx.beginPath();
          ctx.arc(x1, p.y, Math.max(1.5, 3 + depth * 1.5), 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(pColor, 0.5 + depth * 0.4);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 10;
          ctx.fill();

          // Strand 2 node
          ctx.beginPath();
          ctx.arc(x2, p.y, Math.max(1.5, 3 - depth * 1.5), 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba('#FFFFFF', 0.5 - depth * 0.3);
          ctx.fill();
        });
      }

      // 21. PLASMA LIGHTNING STORM
      else if (particleType === 'plasma-lightning-storm') {
        const state = particles[0];
        state.timer++;

        if (state.timer >= state.nextStrike) {
          state.timer = 0;
          state.nextStrike = Math.floor(Math.random() * 30 + 15) / speedMult;

          // Generate bolt
          const startX = Math.random() * width;
          let curX = startX;
          let curY = 0;
          const bolt = [{ x: curX, y: curY }];

          while (curY < height) {
            curX += (Math.random() * 40 - 20);
            curY += Math.random() * 35 + 15;
            bolt.push({ x: curX, y: curY });
          }
          state.branches = bolt;
        }

        if (state.branches.length > 1) {
          ctx.beginPath();
          ctx.moveTo(state.branches[0].x, state.branches[0].y);
          for (let b = 1; b < state.branches.length; b++) {
            ctx.lineTo(state.branches[b].x, state.branches[b].y);
          }
          ctx.strokeStyle = hexToRgba(pColor, 0.7);
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 25;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 22. BUBBLE LAVA LAMP
      else if (particleType === 'bubble-lava-lamp') {
        particles.forEach(p => {
          p.pulse += p.pulseSpeed;
          p.y += p.vy;
          p.x += p.vx + Math.sin(p.pulse) * 0.5;

          if (p.y < -p.radius * 2) {
            p.y = height + p.radius * 2;
            p.x = Math.random() * width;
          }

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, hexToRgba(pColor, p.alpha * 1.5));
          grad.addColorStop(0.7, hexToRgba(pColor, p.alpha * 0.5));
          grad.addColorStop(1, hexToRgba(pColor, 0));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      }

      // 23. HYPERSPACE WARP
      else if (particleType === 'hyperspace-warp') {
        const cx = width / 2;
        const cy = height / 2;
        const warpSpeed = 16 * speedMult;

        particles.forEach(p => {
          p.prevZ = p.z;
          p.z -= warpSpeed;

          if (p.z <= 0) {
            p.z = width;
            p.prevZ = width;
            p.x = (Math.random() - 0.5) * width * 2;
            p.y = (Math.random() - 0.5) * height * 2;
          }

          const k = 250 / p.z;
          const px = p.x * k + cx;
          const py = p.y * k + cy;

          const prevK = 250 / p.prevZ;
          const prevPx = p.x * prevK + cx;
          const prevPy = p.y * prevK + cy;

          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = hexToRgba(pColor, Math.min(1, (1 - p.z / width) * 1.2));
          ctx.shadowColor = pColor;
          ctx.shadowBlur = 10;
          ctx.lineWidth = Math.max(1, (1 - p.z / width) * 3);
          ctx.stroke();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleType, particleSpeed, particleDensity, interactivePhysics, activeParticleColor, secondaryColor, mode]);

  if (particleType === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.88 }}
    />
  );
}
