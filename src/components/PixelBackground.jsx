import React, { useMemo } from 'react';

export default function PixelBackground() {
  // Generate randomized floating pixel blocks
  const pixelBlocks = useMemo(() => {
    const blocks = [];
    const colors = [
      'bg-brand-yellow/30 border-brand-yellow/60 shadow-glow-yellow-sm',
      'bg-brand-orange/30 border-brand-orange/60 shadow-glow-orange-sm',
      'bg-brand-yellow-neon/40 border-brand-yellow-neon/80 shadow-glow-yellow',
      'bg-amber-500/25 border-amber-400/50 shadow-glow-yellow-sm',
    ];

    for (let i = 0; i < 22; i++) {
      const left = Math.floor(Math.random() * 96) + 2; // 2% - 98%
      const size = Math.floor(Math.random() * 14) + 8; // 8px - 22px
      const duration = Math.floor(Math.random() * 16) + 14; // 14s - 30s
      const delay = Math.floor(Math.random() * 18); // 0s - 18s
      const color = colors[Math.floor(Math.random() * colors.length)];

      blocks.push({
        id: i,
        style: {
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          animation: `floatPixel ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        },
        className: `absolute rounded-sm border ${color} backdrop-blur-[1px]`,
      });
    }
    return blocks;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      
      {/* Moving Diagonal Pixel Grid */}
      <div className="absolute inset-0 pixel-bg-grid opacity-60" />

      {/* Moving Dot Matrix Layer */}
      <div className="absolute inset-0 pixel-bg-dots opacity-40" />

      {/* Floating Cyber Glowing Pixel Cubes */}
      {pixelBlocks.map((block) => (
        <div
          key={block.id}
          style={block.style}
          className={block.className}
        />
      ))}

      {/* Radial Vignette Mask (Keeps center readable & clear) */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-dark-950/60 to-dark-950 pointer-events-none" />

      {/* Ambient Top & Bottom Lighting */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-brand-yellow/10 via-brand-orange/5 to-transparent blur-3xl" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-t from-brand-orange/10 via-brand-yellow/5 to-transparent blur-3xl" />
      
    </div>
  );
}
