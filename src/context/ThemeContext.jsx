import React, { createContext, useContext, useState, useEffect } from 'react';

// Predefined Aesthetic, Cyberpunk & Pixel Google Font Options
export const FONT_OPTIONS = [
  { 
    id: 'plus-jakarta', 
    name: 'Plus Jakarta Sans', 
    font: "'Plus Jakarta Sans', sans-serif", 
    desc: 'Modern, Bersih & Standar Tech SaaS Global', 
    tag: 'Modern Tech' 
  },
  { 
    id: 'pixelify', 
    name: 'Pixelify Sans', 
    font: "'Pixelify Sans', sans-serif", 
    desc: 'Retro 8-Bit Gaming & Pixel Modern Estetik', 
    tag: 'Pixel Gamer' 
  },
  { 
    id: 'press-start', 
    name: 'Press Start 2P', 
    font: "'Press Start 2P', monospace", 
    desc: 'Arcade Klasik 8-Bit Nostalgia Asli', 
    tag: '8-Bit Arcade' 
  },
  { 
    id: 'silkscreen', 
    name: 'Silkscreen Pixel', 
    font: "'Silkscreen', monospace", 
    desc: 'Tipografi Pixel Kompak & Rapi', 
    tag: 'Pixel Retro' 
  },
  { 
    id: 'outfit', 
    name: 'Outfit Geometric', 
    font: "'Outfit', sans-serif", 
    desc: 'Futuristik, Geometris Tajam & Estetik Tinggi', 
    tag: 'Trending Aesthetic' 
  },
  { 
    id: 'quicksand', 
    name: 'Quicksand Rounded', 
    font: "'Quicksand', sans-serif", 
    desc: 'Imut, Bulat, Lembut & Ramah (Cocok Pastel)', 
    tag: 'Soft & Cute' 
  },
  { 
    id: 'space-grotesk', 
    name: 'Space Grotesk', 
    font: "'Space Grotesk', sans-serif", 
    desc: 'Cyberpunk, Hipster Developer & Sci-Fi Tech', 
    tag: 'Cyber Gamer' 
  },
  { 
    id: 'syne', 
    name: 'Syne High-Fashion', 
    font: "'Syne', sans-serif", 
    desc: 'Artistik, Mewah, Bold & Elegan Kelas Atas', 
    tag: 'Luxury Design' 
  },
  { 
    id: 'playfair', 
    name: 'Playfair Display Serif', 
    font: "'Playfair Display', serif", 
    desc: 'Sultan Royalty, Klasik & Berwibawa Ningrat', 
    tag: 'Royalty Serif' 
  }
];

// Predefined 24+ Color Swatches for Quick 1-Click Customization
export const COLOR_SWATCHES = [
  // 🌸 PASTEL & SOFT PALETTE
  { name: 'Sakura Hanami', hex: '#F472B6', secHex: '#FDA4AF', category: 'pastel' },
  { name: 'Lavender Dreams', hex: '#C084FC', secHex: '#E879F9', category: 'pastel' },
  { name: 'Matcha Botanical', hex: '#34D399', secHex: '#A7F3D0', category: 'pastel' },
  { name: 'Peach Sunset', hex: '#FB923C', secHex: '#F43F5E', category: 'pastel' },
  { name: 'Cotton Candy Blue', hex: '#38BDF8', secHex: '#F472B6', category: 'pastel' },
  { name: 'Butter Vanilla', hex: '#FDE047', secHex: '#F59E0B', category: 'pastel' },
  { name: 'Rosewater Glow', hex: '#FB7185', secHex: '#FDA4AF', category: 'pastel' },
  { name: 'Mint Ice', hex: '#2DD4BF', secHex: '#99F6E4', category: 'pastel' },

  // ⚡ CYBERPUNK & NEON PALETTE
  { name: 'Cyber Gold 2077', hex: '#FFB800', secHex: '#FF5722', category: 'neon' },
  { name: 'Blade Cyan', hex: '#06B6D4', secHex: '#3B82F6', category: 'neon' },
  { name: 'Matrix Emerald', hex: '#10B981', secHex: '#047857', category: 'neon' },
  { name: 'Synthwave Magenta', hex: '#EC4899', secHex: '#8B5CF6', category: 'neon' },
  { name: 'Electric Violet', hex: '#8B5CF6', secHex: '#6366F1', category: 'neon' },
  { name: 'Crimson Protocol', hex: '#EF4444', secHex: '#991B1B', category: 'neon' },
  { name: 'Plasma Arc', hex: '#6366F1', secHex: '#A855F7', category: 'neon' },
  { name: 'Laser Lime', hex: '#84CC16', secHex: '#10B981', category: 'neon' },

  // 👑 LUXURY & ROYALTY PALETTE
  { name: '24K Imperial Gold', hex: '#F59E0B', secHex: '#D97706', category: 'luxury' },
  { name: 'Colombian Emerald', hex: '#059669', secHex: '#10B981', category: 'luxury' },
  { name: 'Midnight Sapphire', hex: '#3B82F6', secHex: '#1E40AF', category: 'luxury' },
  { name: 'Imperial Amethyst', hex: '#9333EA', secHex: '#7E22CE', category: 'luxury' },
  { name: 'Garnet Ruby', hex: '#E11D48', secHex: '#881337', category: 'luxury' },
  { name: 'Titanium Platinum', hex: '#E2E8F0', secHex: '#94A3B8', category: 'luxury' },
  { name: 'Obsidian Slate', hex: '#94A3B8', secHex: '#475569', category: 'luxury' },
  { name: 'Opal Iridescent', hex: '#A78BFA', secHex: '#F472B6', category: 'luxury' }
];

// 22 Extensive Multi-Persona Luxury Themes
export const THEME_PRESETS = [
  // 🌸 1. AESTHETIC & PASTEL
  {
    id: 'sakura-pink',
    name: 'Sakura Hanami',
    category: 'aesthetic',
    primary: '#F472B6',
    secondary: '#FDA4AF',
    glow: 'rgba(244, 114, 182, 0.45)',
    particle: 'sakura-petals',
    fontId: 'quicksand',
    darkBg: '#0c0710',
    darkCard: '#160f20',
    tag: 'Cherry Blossom & Romantic'
  },
  {
    id: 'pastel-lavender',
    name: 'Lavender Twilight',
    category: 'aesthetic',
    primary: '#C084FC',
    secondary: '#E879F9',
    glow: 'rgba(192, 132, 252, 0.45)',
    particle: 'twilight-fireflies',
    fontId: 'outfit',
    darkBg: '#090712',
    darkCard: '#140e24',
    tag: 'Dreamy & Magical Glow'
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Botanical',
    category: 'aesthetic',
    primary: '#34D399',
    secondary: '#A7F3D0',
    glow: 'rgba(52, 211, 153, 0.45)',
    particle: 'floating-leaves',
    fontId: 'quicksand',
    darkBg: '#050e09',
    darkCard: '#0c1c14',
    tag: 'Fresh Nature & Zen'
  },
  {
    id: 'peach-sunset',
    name: 'Peach Sunset',
    category: 'aesthetic',
    primary: '#FB923C',
    secondary: '#F43F5E',
    glow: 'rgba(251, 146, 60, 0.45)',
    particle: 'floating-hearts',
    fontId: 'outfit',
    darkBg: '#0f0808',
    darkCard: '#1e1112',
    tag: 'Golden Hour & Warmth'
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    category: 'aesthetic',
    primary: '#38BDF8',
    secondary: '#F472B6',
    glow: 'rgba(56, 189, 248, 0.45)',
    particle: 'stars-sparkles',
    fontId: 'quicksand',
    darkBg: '#060a12',
    darkCard: '#0d1624',
    tag: 'Sweet Pastel Gradient'
  },
  {
    id: 'butter-vanilla',
    name: 'Butter Vanilla',
    category: 'aesthetic',
    primary: '#FDE047',
    secondary: '#F59E0B',
    glow: 'rgba(253, 224, 71, 0.45)',
    particle: 'gold-glitter-rain',
    fontId: 'outfit',
    darkBg: '#0d0b06',
    darkCard: '#1c170d',
    tag: 'Warm Cozy Caramel'
  },

  // ⚡ 2. CYBERPUNK & SCI-FI GAMER
  {
    id: 'cyber-gold',
    name: 'Neo Tokyo Gold',
    category: 'tech',
    primary: '#FFB800',
    secondary: '#FF5722',
    glow: 'rgba(255, 184, 0, 0.45)',
    particle: 'pixel-grid',
    fontId: 'space-grotesk',
    darkBg: '#06070a',
    darkCard: '#0b0c12',
    tag: 'Cyberpunk 2077 Neon'
  },
  {
    id: 'blade-cyan',
    name: 'Blade Runner Cyan',
    category: 'tech',
    primary: '#06B6D4',
    secondary: '#3B82F6',
    glow: 'rgba(6, 182, 212, 0.45)',
    particle: 'geometric-mesh',
    fontId: 'space-grotesk',
    darkBg: '#040911',
    darkCard: '#081324',
    tag: 'Futuristic AI Grid'
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Ghost',
    category: 'tech',
    primary: '#10B981',
    secondary: '#047857',
    glow: 'rgba(16, 185, 129, 0.45)',
    particle: 'matrix-rain',
    fontId: 'space-grotesk',
    darkBg: '#040b07',
    darkCard: '#08170e',
    tag: 'Digital Hacker Stream'
  },
  {
    id: 'synthwave-1984',
    name: 'Synthwave 1984',
    category: 'tech',
    primary: '#8B5CF6',
    secondary: '#EC4899',
    glow: 'rgba(139, 92, 246, 0.45)',
    particle: 'wave-flow',
    fontId: 'space-grotesk',
    darkBg: '#090514',
    darkCard: '#140c2b',
    tag: 'Retro Outrun Wave'
  },
  {
    id: 'crimson-protocol',
    name: 'Crimson Protocol',
    category: 'tech',
    primary: '#EF4444',
    secondary: '#991B1B',
    glow: 'rgba(239, 68, 68, 0.45)',
    particle: 'cyber-sparks',
    fontId: 'space-grotesk',
    darkBg: '#0c0506',
    darkCard: '#1a0a0d',
    tag: 'High Alert Cyberpunk'
  },
  {
    id: 'plasma-storm',
    name: 'Plasma Voltage',
    category: 'tech',
    primary: '#6366F1',
    secondary: '#A855F7',
    glow: 'rgba(99, 102, 241, 0.45)',
    particle: 'cyber-sparks',
    fontId: 'space-grotesk',
    darkBg: '#060614',
    darkCard: '#0d0d26',
    tag: 'Electric Arc Energy'
  },
  {
    id: 'retro-pixel-arcade',
    name: 'Retro 8-Bit Arcade',
    category: 'tech',
    primary: '#00FF66',
    secondary: '#00E5FF',
    glow: 'rgba(0, 255, 102, 0.45)',
    particle: 'pixel-grid',
    fontId: 'pixelify',
    darkBg: '#050a06',
    darkCard: '#0b140e',
    tag: 'Arcade Gamer & Pixel Aesthetic'
  },
  {
    id: 'gameboy-nostalgia',
    name: 'GameBoy Classic 8-Bit',
    category: 'tech',
    primary: '#8BAC0F',
    secondary: '#9BBC0F',
    glow: 'rgba(139, 172, 15, 0.45)',
    particle: 'pixel-grid',
    fontId: 'press-start',
    darkBg: '#080c05',
    darkCard: '#0f170a',
    tag: 'Vintage 8-Bit Handheld'
  },

  // 👑 3. LUXURY ROYALTY & EXECUTIVE SULTAN
  {
    id: 'imperial-gold',
    name: '24K Imperial Gold',
    category: 'luxury',
    primary: '#F59E0B',
    secondary: '#D97706',
    glow: 'rgba(245, 158, 11, 0.45)',
    particle: 'gold-glitter-rain',
    fontId: 'syne',
    darkBg: '#0c0a06',
    darkCard: '#1a140d',
    tag: 'Pure Luxury & Prestige'
  },
  {
    id: 'royal-emerald',
    name: 'Royal Emerald',
    category: 'luxury',
    primary: '#059669',
    secondary: '#10B981',
    glow: 'rgba(5, 150, 105, 0.45)',
    particle: 'floating-gems',
    fontId: 'syne',
    darkBg: '#040d09',
    darkCard: '#091c13',
    tag: 'Precious Colombian Jewel'
  },
  {
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire',
    category: 'luxury',
    primary: '#3B82F6',
    secondary: '#1E40AF',
    glow: 'rgba(59, 130, 246, 0.45)',
    particle: 'orbit-planets',
    fontId: 'playfair',
    darkBg: '#050914',
    darkCard: '#0b1328',
    tag: 'Deep Velvet Navy'
  },
  {
    id: 'amethyst-dynasty',
    name: 'Amethyst Dynasty',
    category: 'luxury',
    primary: '#9333EA',
    secondary: '#7E22CE',
    glow: 'rgba(147, 51, 234, 0.45)',
    particle: 'floating-gems',
    fontId: 'syne',
    darkBg: '#0a0514',
    darkCard: '#150a28',
    tag: 'Imperial Violet Velvet'
  },
  {
    id: 'garnet-ruby',
    name: 'Garnet Ruby',
    category: 'luxury',
    primary: '#E11D48',
    secondary: '#881337',
    glow: 'rgba(225, 29, 72, 0.45)',
    particle: 'gold-glitter-rain',
    fontId: 'syne',
    darkBg: '#0d0407',
    darkCard: '#1c080f',
    tag: 'Precious Red Crystal'
  },

  // 🌌 4. COSMIC & NATURE AURORA
  {
    id: 'interstellar-nebula',
    name: 'Interstellar Nebula',
    category: 'cosmic',
    primary: '#818CF8',
    secondary: '#C084FC',
    glow: 'rgba(129, 140, 248, 0.45)',
    particle: 'nebula-galaxy',
    fontId: 'outfit',
    darkBg: '#060714',
    darkCard: '#0c0e28',
    tag: 'Deep Galaxy Starlight'
  },
  {
    id: 'northern-aurora',
    name: 'Northern Aurora',
    category: 'cosmic',
    primary: '#2DD4BF',
    secondary: '#4ADE80',
    glow: 'rgba(45, 212, 191, 0.45)',
    particle: 'wave-flow',
    fontId: 'outfit',
    darkBg: '#040d0c',
    darkCard: '#081c19',
    tag: 'Borealis Light Wave'
  },
  {
    id: 'frozen-glacier',
    name: 'Frozen Glacier',
    category: 'cosmic',
    primary: '#38BDF8',
    secondary: '#93C5FD',
    glow: 'rgba(56, 189, 248, 0.45)',
    particle: 'snow-crystals',
    fontId: 'outfit',
    darkBg: '#050b12',
    darkCard: '#0b1624',
    tag: 'Arctic Ice Crystal'
  },

  // 💼 5. MODERN MINIMALIST SAAS
  {
    id: 'modern-obsidian',
    name: 'Obsidian SaaS',
    category: 'saas',
    primary: '#60A5FA',
    secondary: '#3B82F6',
    glow: 'rgba(96, 165, 250, 0.35)',
    particle: 'floating-bokeh',
    fontId: 'plus-jakarta',
    darkBg: '#08090d',
    darkCard: '#10121a',
    tag: 'Silicon Valley Enterprise'
  },
  {
    id: 'slate-monochrome',
    name: 'Slate Monochrome',
    category: 'saas',
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    glow: 'rgba(226, 232, 240, 0.3)',
    particle: 'none',
    fontId: 'plus-jakarta',
    darkBg: '#080808',
    darkCard: '#121212',
    tag: 'Pure Apple Minimalist'
  }
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [siteTitle, setSiteTitle] = useState(() => {
    return localStorage.getItem('tmail_site_title') || 'Flatimo Mail';
  });

  const [siteTagline, setSiteTagline] = useState(() => {
    return localStorage.getItem('tmail_site_tagline') || 'Fast & Disposable Temporary Email';
  });

  const [currentPreset, setCurrentPreset] = useState(() => {
    const saved = localStorage.getItem('tmail_theme_preset');
    return THEME_PRESETS.find(p => p.id === saved) || THEME_PRESETS[6];
  });

  const [fontFamilyId, setFontFamilyId] = useState(() => {
    return localStorage.getItem('tmail_font_family') || currentPreset.fontId || 'plus-jakarta';
  });

  const [glowEnabled, setGlowEnabled] = useState(() => {
    return localStorage.getItem('tmail_glow_enabled') !== 'false';
  });

  const [saturation, setSaturation] = useState(() => {
    const saved = localStorage.getItem('tmail_color_saturation');
    return saved ? parseInt(saved, 10) : 100;
  });

  const [customPrimary, setCustomPrimary] = useState(() => {
    return localStorage.getItem('tmail_custom_primary') || currentPreset.primary;
  });

  const [customSecondary, setCustomSecondary] = useState(() => {
    return localStorage.getItem('tmail_custom_secondary') || currentPreset.secondary;
  });

  const [particleColor, setParticleColor] = useState(() => {
    return localStorage.getItem('tmail_particle_color') || '';
  });

  const [particleType, setParticleType] = useState(() => {
    return localStorage.getItem('tmail_particle_type') || currentPreset.particle;
  });

  const [particleSpeed, setParticleSpeed] = useState(() => {
    return localStorage.getItem('tmail_particle_speed') || 'normal';
  });

  const [particleDensity, setParticleDensity] = useState(() => {
    return localStorage.getItem('tmail_particle_density') || 'normal';
  });

  const [interactivePhysics, setInteractivePhysics] = useState(() => {
    return localStorage.getItem('tmail_interactive_physics') !== 'false';
  });

  const [mode, setMode] = useState(() => {
    return localStorage.getItem('tmail_color_mode') || 'dark';
  });

  // Apply CSS Variables & Dynamic Saturation & Font Family
  useEffect(() => {
    const root = document.documentElement;
    const isDark = mode === 'dark';

    const selectedFont = FONT_OPTIONS.find(f => f.id === fontFamilyId) || FONT_OPTIONS[0];
    const primaryColor = customPrimary || currentPreset.primary;
    const secondaryColor = customSecondary || currentPreset.secondary;
    const bgColor = isDark ? currentPreset.darkBg : '#F8FAFC';
    const cardColor = isDark ? currentPreset.darkCard : '#FFFFFF';
    const textColor = isDark ? '#F1F5F9' : '#0F172A';
    const subtextColor = isDark ? '#94A3B8' : '#64748B';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

    root.style.setProperty('--theme-font', selectedFont.font);
    root.style.setProperty('--theme-primary', primaryColor);
    root.style.setProperty('--theme-secondary', secondaryColor);
    root.style.setProperty('--theme-glow', glowEnabled ? `${primaryColor}66` : 'transparent');
    root.style.setProperty('--theme-saturation', `${saturation}%`);
    root.style.setProperty('--theme-bg', bgColor);
    root.style.setProperty('--theme-card', cardColor);
    root.style.setProperty('--theme-text', textColor);
    root.style.setProperty('--theme-subtext', subtextColor);
    root.style.setProperty('--theme-border', borderColor);

    if (saturation !== 100) {
      root.style.filter = `saturate(${saturation}%)`;
    } else {
      root.style.filter = 'none';
    }

    if (glowEnabled) {
      document.documentElement.classList.add('glow-enabled');
      document.documentElement.classList.remove('glow-disabled');
    } else {
      document.documentElement.classList.add('glow-disabled');
      document.documentElement.classList.remove('glow-enabled');
    }

    document.body.style.fontFamily = selectedFont.font;

    localStorage.setItem('tmail_site_title', siteTitle);
    localStorage.setItem('tmail_site_tagline', siteTagline);
    localStorage.setItem('tmail_theme_preset', currentPreset.id);
    localStorage.setItem('tmail_font_family', fontFamilyId);
    localStorage.setItem('tmail_glow_enabled', String(glowEnabled));
    localStorage.setItem('tmail_color_saturation', String(saturation));
    localStorage.setItem('tmail_custom_primary', primaryColor);
    localStorage.setItem('tmail_custom_secondary', secondaryColor);
    localStorage.setItem('tmail_particle_color', particleColor);
    localStorage.setItem('tmail_particle_type', particleType);
    localStorage.setItem('tmail_particle_speed', particleSpeed);
    localStorage.setItem('tmail_particle_density', particleDensity);
    localStorage.setItem('tmail_interactive_physics', String(interactivePhysics));
    localStorage.setItem('tmail_color_mode', mode);
  }, [siteTitle, siteTagline, currentPreset, fontFamilyId, glowEnabled, saturation, customPrimary, customSecondary, particleColor, particleType, particleSpeed, particleDensity, interactivePhysics, mode]);

  const applyPreset = (presetId) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCurrentPreset(preset);
      if (preset.fontId) setFontFamilyId(preset.fontId);
      setCustomPrimary(preset.primary);
      setCustomSecondary(preset.secondary);
      setParticleType(preset.particle);
    }
  };

  const applyColorSwatch = (swatch) => {
    setCustomPrimary(swatch.hex);
    setCustomSecondary(swatch.secHex);
  };

  const resetDefaults = () => {
    const defaultPreset = THEME_PRESETS[6]; // Neo Tokyo Gold
    setSiteTitle('Flatimo Mail');
    setSiteTagline('Fast & Disposable Temporary Email');
    setCurrentPreset(defaultPreset);
    setFontFamilyId('plus-jakarta');
    setGlowEnabled(true);
    setSaturation(100);
    setCustomPrimary(defaultPreset.primary);
    setCustomSecondary(defaultPreset.secondary);
    setParticleColor('');
    setParticleType(defaultPreset.particle);
    setParticleSpeed('normal');
    setParticleDensity('normal');
    setInteractivePhysics(true);
    setMode('dark');
  };

  return (
    <ThemeContext.Provider value={{
      siteTitle,
      setSiteTitle,
      siteTagline,
      setSiteTagline,
      currentPreset,
      applyPreset,
      fontFamilyId,
      setFontFamilyId,
      fontOptions: FONT_OPTIONS,
      glowEnabled,
      setGlowEnabled,
      toggleGlow: () => setGlowEnabled(prev => !prev),
      saturation,
      setSaturation,
      primaryColor: customPrimary || currentPreset.primary,
      secondaryColor: customSecondary || currentPreset.secondary,
      setCustomPrimary,
      setCustomSecondary,
      particleColor,
      setParticleColor,
      activeParticleColor: particleColor || (customPrimary || currentPreset.primary),
      applyColorSwatch,
      colorSwatches: COLOR_SWATCHES,
      particleType,
      setParticleType,
      particleSpeed,
      setParticleSpeed,
      particleDensity,
      setParticleDensity,
      interactivePhysics,
      setInteractivePhysics,
      mode,
      setMode,
      toggleMode: () => setMode(prev => prev === 'dark' ? 'light' : 'dark'),
      resetDefaults,
      presets: THEME_PRESETS
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
