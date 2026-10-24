import React from 'react';

export const FarmBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100/90" />

      {/* Sun and Warm Glow */}
      <div className="absolute top-4 right-10 w-28 h-28 rounded-full bg-amber-200/40 blur-xl pointer-events-none" />
      <div className="absolute top-8 right-14 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-100 shadow-[0_0_40px_rgba(253,224,71,0.6)]" />

      {/* Drifting Clouds */}
      <svg className="absolute top-6 left-6 w-32 h-16 opacity-75 animate-pulse" style={{ animationDuration: '6s' }} viewBox="0 0 100 50">
        <path d="M20 35 A15 15 0 0 1 50 30 A18 18 0 0 1 80 35 A12 12 0 0 1 70 45 L20 45 A10 10 0 0 1 20 35 Z" fill="#ffffff" />
      </svg>
      <svg className="absolute top-16 right-20 w-40 h-20 opacity-60" viewBox="0 0 100 50">
        <path d="M25 35 A14 14 0 0 1 55 28 A16 16 0 0 1 85 35 A10 10 0 0 1 75 45 L25 45 A10 10 0 0 1 25 35 Z" fill="#ffffff" />
      </svg>

      {/* Far Distant Mountain & Rolling Hills */}
      <svg className="absolute bottom-40 w-full h-80 min-w-[600px] -left-10 text-emerald-800/30" preserveAspectRatio="none" viewBox="0 0 1000 300">
        <path d="M0 160 Q250 80 500 140 T1000 110 L1000 300 L0 300 Z" fill="#4d7c0f" opacity="0.35" />
        <path d="M0 190 Q300 120 600 180 T1000 150 L1000 300 L0 300 Z" fill="#65a30d" opacity="0.45" />
      </svg>

      {/* Midground Barn & Farm details on Hill */}
      <div className="absolute bottom-60 right-6 sm:right-16 w-32 h-28 pointer-events-none opacity-90">
        <svg viewBox="0 0 140 120" className="w-full h-full drop-shadow-md">
          {/* Silo */}
          <rect x="12" y="32" width="22" height="60" rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="23" cy="32" rx="11" ry="8" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <line x1="12" y1="52" x2="34" y2="52" stroke="#64748b" strokeWidth="1" />
          <line x1="12" y1="72" x2="34" y2="72" stroke="#64748b" strokeWidth="1" />

          {/* Red Barn Main Body */}
          <polygon points="40,48 75,20 110,48" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
          <rect x="40" y="48" width="70" height="46" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />

          {/* White Barn Trim Cross / Doors */}
          <rect x="62" y="62" width="26" height="32" fill="#ffffff" stroke="#7f1d1d" strokeWidth="1.5" />
          <rect x="64" y="64" width="22" height="30" fill="#991b1b" />
          <line x1="64" y1="64" x2="86" y2="94" stroke="#ffffff" strokeWidth="2" />
          <line x1="86" y1="64" x2="64" y2="94" stroke="#ffffff" strokeWidth="2" />

          {/* Barn Loft Window */}
          <polygon points="68,44 75,34 82,44" fill="#ffffff" />
          <polygon points="69,43 75,36 81,43" fill="#1e293b" />

          {/* Weather vane on roof */}
          <line x1="75" y1="20" x2="75" y2="10" stroke="#f59e0b" strokeWidth="2" />
          <polygon points="70,10 75,6 80,10" fill="#f59e0b" />
        </svg>
      </div>

      {/* Windmill or Country Trees */}
      <div className="absolute bottom-60 left-4 sm:left-12 w-28 h-28 pointer-events-none opacity-90">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Tree 1 */}
          <rect x="26" y="55" width="8" height="25" fill="#78350f" rx="2" />
          <circle cx="30" cy="42" r="22" fill="#15803d" />
          <circle cx="38" cy="36" r="16" fill="#22c55e" opacity="0.9" />
          <circle cx="22" cy="38" r="15" fill="#166534" />

          {/* Tree 2 */}
          <rect x="68" y="60" width="6" height="20" fill="#78350f" rx="1.5" />
          <circle cx="71" cy="48" r="18" fill="#16a34a" />
          <circle cx="77" cy="44" r="13" fill="#4ade80" opacity="0.85" />
        </svg>
      </div>

      {/* Near Rolling Pasture Hill */}
      <svg className="absolute bottom-20 w-[120%] -left-[10%] h-64 text-lime-600" preserveAspectRatio="none" viewBox="0 0 1000 200">
        <path d="M0 60 Q350 20 700 80 T1000 40 L1000 200 L0 200 Z" fill="#65a30d" />
        <path d="M0 100 Q400 50 800 120 T1000 80 L1000 200 L0 200 Z" fill="#4d7c0f" />
      </svg>

      {/* Wooden Post & Rail Fence */}
      <svg className="absolute bottom-36 w-full h-14 min-w-[500px] opacity-80" viewBox="0 0 800 60" preserveAspectRatio="none">
        {/* Horizontal Rails */}
        <line x1="0" y1="20" x2="800" y2="20" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
        <line x1="0" y1="36" x2="800" y2="36" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
        {/* Vertical Posts */}
        {Array.from({ length: 14 }).map((_, i) => (
          <g key={i}>
            <rect x={i * 60 + 10} y="8" width="8" height="42" rx="2" fill="#92400e" stroke="#451a03" strokeWidth="1" />
            <polygon points={`${i * 60 + 9},8 ${i * 60 + 14},2 ${i * 60 + 19},8`} fill="#b45309" />
          </g>
        ))}
      </svg>

      {/* Rich Farm Dirt Foreground Vignette */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-amber-950 via-amber-950/80 to-transparent pointer-events-none" />
    </div>
  );
};
