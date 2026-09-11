import React, { useState } from 'react';
import { 
  X, 
  Palette, 
  Sparkles, 
  Zap, 
  Briefcase, 
  Sliders, 
  Sun, 
  Moon, 
  RotateCcw, 
  Check, 
  Type, 
  Layers, 
  Activity,
  Heart,
  MousePointer,
  Gauge,
  Crown,
  Compass,
  Flame,
  Droplets,
  ALargeSmall,
  SunMedium,
  SlidersHorizontal,
  Paintbrush,
  Orbit,
  Atom,
  PartyPopper,
  Dna,
  ZapOff
} from 'lucide-react';
import { useTheme, THEME_PRESETS, COLOR_SWATCHES, FONT_OPTIONS } from '../context/ThemeContext';

export default function ThemeSettingsModal({ isOpen, onClose }) {
  const {
    siteTitle,
    setSiteTitle,
    siteTagline,
    setSiteTagline,
    currentPreset,
    applyPreset,
    fontFamilyId,
    setFontFamilyId,
    fontOptions,
    glowEnabled,
    setGlowEnabled,
    saturation,
    setSaturation,
    primaryColor,
    setCustomPrimary,
    secondaryColor,
    setCustomSecondary,
    particleColor,
    setParticleColor,
    activeParticleColor,
    applyColorSwatch,
    colorSwatches,
    particleType,
    setParticleType,
    particleSpeed,
    setParticleSpeed,
    particleDensity,
    setParticleDensity,
    interactivePhysics,
    setInteractivePhysics,
    mode,
    toggleMode,
    resetDefaults
  } = useTheme();

  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'colors' | 'fonts' | 'particles' | 'branding'
  const [presetCategory, setPresetCategory] = useState('all'); // 'all' | 'aesthetic' | 'tech' | 'luxury' | 'cosmic' | 'saas'
  const [swatchCategory, setSwatchCategory] = useState('all'); // 'all' | 'pastel' | 'neon' | 'luxury'

  if (!isOpen) return null;

  const filteredPresets = presetCategory === 'all' 
    ? THEME_PRESETS 
    : THEME_PRESETS.filter(p => p.category === presetCategory);

  const filteredSwatches = swatchCategory === 'all'
    ? colorSwatches
    : colorSwatches.filter(s => s.category === swatchCategory);

  const particleOptions = [
    // 🚀 NEW ACTION ENGINES
    { id: 'black-hole-vortex', name: 'Black Hole Vortex 3D', desc: 'Singularitas Gravitasi & Accretion Swirl Kosmik' },
    { id: 'quantum-supernova', name: 'Quantum Supernova', desc: 'Ledakan Bintang & Shockwave Plasma Berkelip' },
    { id: 'hyperspace-warp', name: 'Hyperspace Warp Speed', desc: 'Terowongan Cahaya Meluncur Cepat Star Wars' },
    { id: 'plasma-lightning-storm', name: 'Plasma Lightning Storm', desc: 'Sambaran Kilat Petir Tesla Arc Bercabang' },
    { id: 'dna-helix-cyber', name: 'DNA Double Helix 3D', desc: 'Untaian Putaran Genetika Biotek Cyberpunk' },
    { id: 'neon-confetti-explosion', name: 'Cyber Confetti 3D', desc: 'Hujan Pita Warna-Warni & Diamond Berputar' },
    { id: 'bubble-lava-lamp', name: 'Viscous Lava Lamp', desc: 'Metaball Cairan Glowing Organik Melayang' },

    // 🌸 AESTHETIC & CLASSIC ENGINES
    { id: 'sakura-petals', name: 'Sakura Petals 3D', desc: 'Kelopak Bunga Sakura Bergoyang 3D' },
    { id: 'stars-sparkles', name: 'Stars & 8-Ray Sparkles', desc: 'Bintang Kosmik & Kilau 8-Sudut Cahaya' },
    { id: 'floating-hearts', name: 'Floating Hearts', desc: 'Hati Cinta Glowing Berdenyut Melayang' },
    { id: 'floating-leaves', name: 'Botanical Leaves', desc: 'Daun Teh Botani Melayang Sejuk' },
    { id: 'twilight-fireflies', name: 'Twilight Fireflies', desc: 'Kunang-Kunang Malam Berkedip Hangat' },
    { id: 'gold-glitter-rain', name: '24K Gold Glitter Rain', desc: 'Hujan Kilauan Debu Emas 24K Mewah' },
    { id: 'floating-gems', name: 'Floating Crystal Gems', desc: 'Batu Permata & Berlian 3D Berputar' },
    { id: 'snow-crystals', name: 'Snowflakes 6-Point', desc: 'Kristal Es 6-Sudut Fraktal Melayang' },
    { id: 'pixel-grid', name: 'Cyberpunk Pixels', desc: 'Kotak Pixel Dual-Layer Glow Berputar' },
    { id: 'matrix-rain', name: 'Matrix Code Stream', desc: 'Aliran Kode Digital Katakana Hacker' },
    { id: 'geometric-mesh', name: 'Neural Network Mesh', desc: 'Node Titik & Jaring Garis Interaktif' },
    { id: 'cyber-sparks', name: 'Electric Sparks Arc', desc: 'Percikan Petir & Ekor Cahaya Neon' },
    { id: 'orbit-planets', name: 'Orbit Constellations', desc: 'Planet Cincin Saturnus & Satelit' },
    { id: 'nebula-galaxy', name: 'Cosmic Nebula Spiral', desc: 'Pusaran Galaksi Bintang & Debu Gas' },
    { id: 'wave-flow', name: 'Aurora Wave Flow', desc: 'Gelombang Garis Cahaya Aurora Sinus' },
    { id: 'floating-bokeh', name: 'Glass Bokeh Bubbles', desc: 'Gelembung Orbs Cahaya & Lensa Kilau' },
    { id: 'none', name: 'Polos Minimalis', desc: 'Latar Bersih (0% GPU, Hemat Daya)' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Container with Dynamic Ambient Glow */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl bg-dark-900 border shadow-2xl overflow-hidden text-slate-100 transition-all duration-300"
        style={{
          borderColor: glowEnabled ? `${primaryColor}55` : 'rgba(255, 255, 255, 0.12)',
          boxShadow: glowEnabled ? `0 0 50px ${primaryColor}35, 0 20px 80px rgba(0,0,0,0.95)` : '0 20px 80px rgba(0,0,0,0.95)'
        }}
      >
        {/* Ambient Top Radiant Glow Aura */}
        {glowEnabled && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-16 blur-2xl pointer-events-none opacity-70"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}40, ${secondaryColor}60, ${primaryColor}40)`
            }}
          />
        )}
        
        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-800 bg-dark-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl border shrink-0 group transition-all duration-300"
              style={{
                backgroundColor: `${primaryColor}20`,
                borderColor: `${primaryColor}60`,
                color: primaryColor,
                boxShadow: glowEnabled ? `0 0 18px ${primaryColor}40` : undefined
              }}
            >
              <Palette className="w-5 h-5 icon-twinkle" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Studio Tema, Font & Desain</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih dari {THEME_PRESETS.length} preset mewah, 6 font estetik, saturasi warna, dan {particleOptions.length} gaya partikel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Master Glow Toggle Button Dynamically Colored to Theme */}
            <button
              onClick={() => setGlowEnabled(!glowEnabled)}
              title={glowEnabled ? "Matikan Efek Glow Neon di Seluruh Web" : "Aktifkan Efek Glow Neon di Seluruh Web"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border active:scale-95"
              style={{
                backgroundColor: glowEnabled ? `${primaryColor}20` : '#11121a',
                color: glowEnabled ? primaryColor : '#64748b',
                borderColor: glowEnabled ? `${primaryColor}60` : '#334155',
                boxShadow: glowEnabled ? `0 0 16px ${primaryColor}50` : 'none'
              }}
            >
              <Sparkles className={`w-3.5 h-3.5 ${glowEnabled ? 'icon-twinkle' : ''}`} />
              <span>Glow: {glowEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="group p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-all border border-transparent hover:border-slate-700"
            >
              <X className="w-5 h-5 icon-interactive group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative flex items-center gap-2 px-5 sm:px-6 pt-3 pb-2 border-b border-slate-800 bg-dark-950/60 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'presets'
                ? 'text-dark-950 font-bold shadow-lg scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-dark-800'
            }`}
            style={activeTab === 'presets' ? { 
              backgroundColor: primaryColor,
              boxShadow: glowEnabled ? `0 0 20px ${primaryColor}60` : undefined
            } : {}}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preset Mewah ({THEME_PRESETS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'colors'
                ? 'text-dark-950 font-bold shadow-lg scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-dark-800'
            }`}
            style={activeTab === 'colors' ? { 
              backgroundColor: primaryColor,
              boxShadow: glowEnabled ? `0 0 20px ${primaryColor}60` : undefined
            } : {}}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Warna & Saturasi</span>
          </button>

          <button
            onClick={() => setActiveTab('particles')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'particles'
                ? 'text-dark-950 font-bold shadow-lg scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-dark-800'
            }`}
            style={activeTab === 'particles' ? { 
              backgroundColor: primaryColor,
              boxShadow: glowEnabled ? `0 0 20px ${primaryColor}60` : undefined
            } : {}}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Partikel ({particleOptions.length} Gaya)</span>
          </button>

          <button
            onClick={() => setActiveTab('fonts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'fonts'
                ? 'text-dark-950 font-bold shadow-lg scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-dark-800'
            }`}
            style={activeTab === 'fonts' ? { 
              backgroundColor: primaryColor,
              boxShadow: glowEnabled ? `0 0 20px ${primaryColor}60` : undefined
            } : {}}
          >
            <ALargeSmall className="w-3.5 h-3.5" />
            <span>Font Estetik (6 Pilihan)</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
              activeTab === 'branding'
                ? 'text-dark-950 font-bold shadow-lg scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-dark-800'
            }`}
            style={activeTab === 'branding' ? { 
              backgroundColor: primaryColor,
              boxShadow: glowEnabled ? `0 0 20px ${primaryColor}60` : undefined
            } : {}}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Branding & Efek</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* --- TAB 1: PRESET GAYA MULTI-PERSONA (22 LUXURY PRESETS) --- */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 bg-dark-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                <button
                  onClick={() => setPresetCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    presetCategory === 'all' ? 'bg-dark-800 text-white shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Semua ({THEME_PRESETS.length})
                </button>
                <button
                  onClick={() => setPresetCategory('aesthetic')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    presetCategory === 'aesthetic' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <Heart className="w-3 h-3" />
                  <span>Aesthetic (6)</span>
                </button>
                <button
                  onClick={() => setPresetCategory('tech')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    presetCategory === 'tech' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Cyber / Gamer (6)</span>
                </button>
                <button
                  onClick={() => setPresetCategory('luxury')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    presetCategory === 'luxury' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  <span>Sultan Royalty (5)</span>
                </button>
                <button
                  onClick={() => setPresetCategory('cosmic')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    presetCategory === 'cosmic' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <Compass className="w-3 h-3" />
                  <span>Cosmic (3)</span>
                </button>
                <button
                  onClick={() => setPresetCategory('saas')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    presetCategory === 'saas' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Modern SaaS (2)</span>
                </button>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPresets.map(p => {
                  const isSelected = currentPreset.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p.id)}
                      className={`relative flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all duration-300 ${
                        isSelected 
                          ? 'bg-dark-800/95 scale-[1.02]' 
                          : 'bg-dark-950/70 hover:bg-dark-800/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                      style={{
                        borderColor: isSelected ? p.primary : undefined,
                        boxShadow: (isSelected && glowEnabled)
                          ? `0 0 24px ${p.primary}45, inset 0 0 12px ${p.primary}20` 
                          : undefined
                      }}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 transition-transform duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${p.primary} 0%, ${p.secondary} 100%)`,
                          boxShadow: (isSelected && glowEnabled) ? `0 0 16px ${p.primary}70` : undefined
                        }}
                      >
                        {isSelected && <Check className="w-5 h-5 text-dark-950 stroke-[3] animate-in zoom-in" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-bold text-sm text-white truncate"
                            style={isSelected && glowEnabled ? { color: '#FFFFFF', textShadow: `0 0 10px ${p.primary}80` } : {}}
                          >
                            {p.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {p.tag}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          )}

          {/* --- TAB 2: WARNA & SATURASI TINGGI --- */}
          {activeTab === 'colors' && (
            <div className="space-y-5">
              
              {/* SATURATION SLIDER CARD */}
              <div 
                className="p-4 rounded-2xl bg-dark-950 border space-y-3"
                style={{
                  borderColor: glowEnabled ? `${primaryColor}35` : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: glowEnabled ? `0 0 15px ${primaryColor}15` : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <SlidersHorizontal className="w-4 h-4" style={{ color: primaryColor }} />
                    <span>Pengaturan Saturasi & Kepekatan Warna Website</span>
                  </div>
                  <span 
                    className="font-mono text-xs font-black px-2 py-0.5 rounded-lg border"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      borderColor: `${primaryColor}40`,
                      color: primaryColor
                    }}
                  >
                    {saturation}%
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="40"
                  max="200"
                  step="5"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: primaryColor }}
                />

                {/* Quick Saturation Presets */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: 'Pastel Muted', val: 70 },
                    { label: 'Standar Normal', val: 100 },
                    { label: 'Vivid Berani', val: 140 },
                    { label: 'Hyper Neon', val: 180 }
                  ].map(pst => (
                    <button
                      key={pst.val}
                      onClick={() => setSaturation(pst.val)}
                      className={`py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        saturation === pst.val
                          ? 'bg-dark-800 text-white shadow-sm'
                          : 'bg-dark-900/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      style={saturation === pst.val ? { borderColor: primaryColor, color: primaryColor } : {}}
                    >
                      {pst.label} ({pst.val}%)
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches Category */}
              <div className="flex items-center gap-1.5 bg-dark-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSwatchCategory('all')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    swatchCategory === 'all' ? 'bg-dark-800 text-white shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Semua (24)
                </button>
                <button
                  onClick={() => setSwatchCategory('pastel')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    swatchCategory === 'pastel' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40' : 'text-slate-400'
                  }`}
                >
                  <Heart className="w-3 h-3" />
                  <span>Pastel Soft</span>
                </button>
                <button
                  onClick={() => setSwatchCategory('neon')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    swatchCategory === 'neon' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Cyber Neon</span>
                </button>
                <button
                  onClick={() => setSwatchCategory('luxury')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    swatchCategory === 'luxury' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'text-slate-400'
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  <span>Royalty</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                {filteredSwatches.map(sw => {
                  const isSelected = primaryColor.toLowerCase() === sw.hex.toLowerCase();
                  return (
                    <button
                      key={sw.name}
                      onClick={() => applyColorSwatch(sw)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-300 ${
                        isSelected 
                          ? 'bg-dark-800 text-white scale-[1.02]' 
                          : 'bg-dark-950/70 hover:bg-dark-800/50 text-slate-300 border-slate-800'
                      }`}
                      style={{
                        borderColor: isSelected ? sw.hex : undefined,
                        boxShadow: (isSelected && glowEnabled) ? `0 0 18px ${sw.hex}60` : undefined
                      }}
                    >
                      <div 
                        className="w-7 h-7 rounded-lg shadow-sm shrink-0 flex items-center justify-center transition-transform duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${sw.hex} 0%, ${sw.secHex} 100%)`,
                          boxShadow: (isSelected && glowEnabled) ? `0 0 12px ${sw.hex}80` : undefined
                        }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-dark-950 stroke-[3] animate-in zoom-in" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span 
                          className="font-bold text-xs block truncate"
                          style={isSelected && glowEnabled ? { color: '#FFFFFF', textShadow: `0 0 8px ${sw.hex}80` } : {}}
                        >
                          {sw.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 uppercase">{sw.hex}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Color Picker */}
              <div 
                className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-3"
                style={{
                  borderColor: glowEnabled ? `${primaryColor}30` : undefined,
                  boxShadow: glowEnabled ? `0 0 15px ${primaryColor}15` : undefined
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Palette className="w-4 h-4 text-slate-400" />
                  <span>Pilih Warna Aksen Utama Bebas (Color Picker):</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border-0 shadow-md"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="flex-1 font-mono text-xs uppercase px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

            </div>
          )}

          {/* --- TAB 3: EFEK PARTIKEL & KUSTOM WARNA PARTIKEL --- */}
          {activeTab === 'particles' && (
            <div className="space-y-5">
              
              {/* CUSTOM PARTICLE COLOR SECTION */}
              <div 
                className="p-4 rounded-2xl bg-dark-950 border space-y-3"
                style={{
                  borderColor: glowEnabled ? `${activeParticleColor}40` : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: glowEnabled ? `0 0 18px ${activeParticleColor}20` : undefined
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Paintbrush className="w-4 h-4" style={{ color: activeParticleColor }} />
                    <span>Kustomisasi Warna Partikel Latar</span>
                  </div>

                  {particleColor && (
                    <button
                      onClick={() => setParticleColor('')}
                      className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-dark-900 border border-slate-700"
                    >
                      Reset Ikuti Tema
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={activeParticleColor}
                    onChange={(e) => setParticleColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border-0 shadow-md"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={activeParticleColor}
                      onChange={(e) => setParticleColor(e.target.value)}
                      placeholder="Ikuti tema otomatis..."
                      className="w-full font-mono text-xs uppercase px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                {/* Quick Particle Color Palette */}
                <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                  <span className="text-[11px] text-slate-500 font-semibold shrink-0">Warna Cepat:</span>
                  {['#F472B6', '#C084FC', '#38BDF8', '#34D399', '#FFB800', '#F59E0B', '#EF4444', '#FFFFFF'].map(hex => (
                    <button
                      key={hex}
                      onClick={() => setParticleColor(hex)}
                      className="w-6 h-6 rounded-lg border shrink-0 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: hex,
                        borderColor: particleColor.toLowerCase() === hex.toLowerCase() ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                        boxShadow: particleColor.toLowerCase() === hex.toLowerCase() ? `0 0 10px ${hex}` : undefined
                      }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* Particle Styles Selector (24 Total Engines) */}
              <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span>Pilih Bentuk & Aksi Partikel Detail</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {particleOptions.length} Gaya
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {particleOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setParticleType(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                        particleType === opt.id
                          ? 'bg-dark-800 text-white scale-[1.02]'
                          : 'bg-dark-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                      style={{
                        borderColor: particleType === opt.id ? primaryColor : undefined,
                        boxShadow: (particleType === opt.id && glowEnabled) ? `0 0 18px ${primaryColor}40, inset 0 0 8px ${primaryColor}15` : undefined
                      }}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span style={(particleType === opt.id && glowEnabled) ? { textShadow: `0 0 8px ${primaryColor}80` } : {}}>{opt.name}</span>
                        {particleType === opt.id && <Check className="w-3.5 h-3.5 animate-in zoom-in" style={{ color: primaryColor }} />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Particle Speed & Density */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kecepatan Animasi</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['slow', 'normal', 'fast'].map(spd => (
                      <button
                        key={spd}
                        onClick={() => setParticleSpeed(spd)}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                          particleSpeed === spd
                            ? 'bg-dark-800 text-white'
                            : 'bg-dark-900/60 text-slate-400 border-slate-800'
                        }`}
                        style={{
                          borderColor: particleSpeed === spd ? primaryColor : undefined,
                          boxShadow: (particleSpeed === spd && glowEnabled) ? `0 0 10px ${primaryColor}35` : undefined
                        }}
                      >
                        {spd === 'slow' ? 'Lambat' : spd === 'normal' ? 'Normal' : 'Cepat'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kepadatan Jumlah</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['low', 'normal', 'high'].map(dns => (
                      <button
                        key={dns}
                        onClick={() => setParticleDensity(dns)}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                          particleDensity === dns
                            ? 'bg-dark-800 text-white'
                            : 'bg-dark-900/60 text-slate-400 border-slate-800'
                        }`}
                        style={{
                          borderColor: particleDensity === dns ? primaryColor : undefined,
                          boxShadow: (particleDensity === dns && glowEnabled) ? `0 0 10px ${primaryColor}35` : undefined
                        }}
                      >
                        {dns === 'low' ? 'Sedikit' : dns === 'normal' ? 'Sedang' : 'Padat'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* --- TAB 4: FONT ESTETIK & TIPOGRAFI KEREN --- */}
          {activeTab === 'fonts' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <ALargeSmall className="w-4 h-4 text-slate-400" />
                    <span>Pilih Gaya Tipografi & Font Website</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {fontOptions.length} Font Estetik
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fontOptions.map(f => {
                    const isSelected = fontFamilyId === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFontFamilyId(f.id)}
                        className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                          isSelected
                            ? 'bg-dark-800 text-white scale-[1.02]'
                            : 'bg-dark-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                        style={{
                          borderColor: isSelected ? primaryColor : undefined,
                          boxShadow: (isSelected && glowEnabled) ? `0 0 20px ${primaryColor}40, inset 0 0 10px ${primaryColor}15` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span 
                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border text-slate-400 bg-dark-950" 
                            style={isSelected ? { 
                              color: primaryColor, 
                              borderColor: `${primaryColor}50`,
                              boxShadow: glowEnabled ? `0 0 8px ${primaryColor}30` : undefined
                            } : {}}
                          >
                            {f.tag}
                          </span>
                          {isSelected && <Check className="w-4 h-4 stroke-[3] animate-in zoom-in" style={{ color: primaryColor }} />}
                        </div>

                        {/* Live Font Sample */}
                        <div 
                          className="text-base sm:text-lg font-bold text-white mb-1"
                          style={{ 
                            fontFamily: f.font,
                            textShadow: (isSelected && glowEnabled) ? `0 0 12px ${primaryColor}80` : undefined
                          }}
                        >
                          {f.name}
                        </div>
                        
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {f.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* --- TAB 5: BRANDING & EFEK GLOBAL --- */}
          {activeTab === 'branding' && (
            <div className="space-y-4">
              
              {/* MASTER GLOW TOGGLE CARD WITH THEME COLOR */}
              <div 
                className="p-4 rounded-2xl bg-dark-950 border flex items-center justify-between transition-all"
                style={{
                  borderColor: glowEnabled ? `${primaryColor}50` : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: glowEnabled ? `0 0 20px ${primaryColor}25` : undefined
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2.5 rounded-xl border shrink-0"
                    style={{
                      backgroundColor: glowEnabled ? `${primaryColor}20` : '#161722',
                      borderColor: glowEnabled ? `${primaryColor}60` : '#2a2b3d',
                      color: glowEnabled ? primaryColor : '#94a3b8'
                    }}
                  >
                    <Sparkles className={`w-5 h-5 ${glowEnabled ? 'icon-twinkle' : ''}`} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Efek Cahaya Neon Glow Global
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Nyalakan atau matikan pendaran cahaya neon di seluruh tombol, kartu, dan logo website.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setGlowEnabled(!glowEnabled)}
                  className="px-4 py-2 rounded-xl text-xs font-black transition-all border active:scale-95"
                  style={{
                    backgroundColor: glowEnabled ? `${primaryColor}25` : '#11121a',
                    color: glowEnabled ? primaryColor : '#64748b',
                    borderColor: glowEnabled ? `${primaryColor}60` : '#334155',
                    boxShadow: glowEnabled ? `0 0 16px ${primaryColor}45` : 'none'
                  }}
                >
                  {glowEnabled ? 'GLOW: ON' : 'GLOW: OFF'}
                </button>
              </div>

              {/* Branding Text */}
              <div 
                className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-4"
                style={{
                  borderColor: glowEnabled ? `${primaryColor}30` : undefined,
                  boxShadow: glowEnabled ? `0 0 15px ${primaryColor}15` : undefined
                }}
              >
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Nama Website / Brand:
                  </label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    placeholder="Contoh: Flatimo Mail"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Sub-judul / Tagline:
                  </label>
                  <input
                    type="text"
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                    placeholder="Contoh: Fast & Disposable Temporary Email"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Interactive Physics Toggle */}
              <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MousePointer className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-sm font-bold text-white block">Fisika Interaksi Kursor Mouse</span>
                    <span className="text-[11px] text-slate-400">Partikel menghindar halus saat didekati mouse</span>
                  </div>
                </div>

                <button
                  onClick={() => setInteractivePhysics(!interactivePhysics)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    interactivePhysics
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                      : 'bg-dark-900 text-slate-500 border-slate-800'
                  }`}
                  style={interactivePhysics && glowEnabled ? { boxShadow: '0 0 12px rgba(16, 185, 129, 0.35)' } : {}}
                >
                  {interactivePhysics ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="relative flex items-center justify-between px-5 sm:px-6 py-4 border-t border-slate-800 bg-dark-950/90 shrink-0">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Awal</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-black text-dark-950 transition-all active:scale-95 duration-200"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: glowEnabled ? `0 0 25px ${primaryColor}70` : undefined
            }}
          >
            Simpan & Tutup
          </button>
        </div>

      </div>

    </div>
  );
}
