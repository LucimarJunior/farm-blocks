import React from 'react';
import { HarvestLevel } from '../types';

export interface BannerData {
  id: string;
  type: HarvestLevel | 'combo';
  title: string;
  points: number;
  subtitle?: string;
  cropName?: string;
}

export const HarvestBanner: React.FC<{ banner: BannerData | null }> = ({ banner }) => {
  if (!banner) return null;

  const isSuper = banner.type === 'super';
  const isGood = banner.type === 'good';
  const isCombo = banner.type === 'combo';

  return (
    <div className="absolute top-11 inset-x-0 mx-auto w-fit z-40 pointer-events-none px-2 transition-all duration-300">
      <div
        className={`px-3 py-1 rounded-full shadow-lg border flex items-center gap-1.5 transform transition-all duration-200 ${
          isSuper
            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-yellow-200 text-amber-950 scale-105'
            : isGood
            ? 'bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 border-green-200 text-white'
            : isCombo
            ? 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 border-orange-200 text-white scale-105'
            : 'bg-amber-900/90 border-amber-600 text-amber-100'
        }`}
      >
        <span className="text-xs sm:text-sm font-black tracking-wide uppercase drop-shadow-sm flex items-center gap-1">
          {isSuper && <span>✨</span>}
          {isCombo && <span>🔥</span>}
          <span>{banner.title}</span>
          <span className="opacity-90 font-bold ml-1">+{banner.points}</span>
        </span>
      </div>
    </div>
  );
};
