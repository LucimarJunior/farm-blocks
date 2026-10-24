import React from 'react';
import { CropType } from '../types';

interface CropProps {
  crop: CropType;
  className?: string;
  animate?: boolean;
}

export const CropIcon: React.FC<CropProps> = ({ crop, className = 'w-full h-full', animate = true }) => {
  if (crop === 'corn') {
    return (
      <div className={`relative flex items-center justify-center ${className} ${animate ? 'animate-sway-corn' : ''}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
          <defs>
            <linearGradient id="cornCobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="85%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="cornLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="cornLeafDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
          </defs>

          {/* Earth base / mound */}
          <ellipse cx="50" cy="88" rx="28" ry="7" fill="#582a0b" opacity="0.6" />

          {/* Back leaves (large wrapping stalks) */}
          <path
            d="M50 82 C30 75 16 55 18 36 C24 48 36 64 48 76 Z"
            fill="url(#cornLeafDark)"
          />
          <path
            d="M50 82 C70 75 84 55 82 36 C76 48 64 64 52 76 Z"
            fill="url(#cornLeafDark)"
          />

          {/* Golden Corn Cob */}
          <ellipse cx="50" cy="50" rx="15" ry="26" fill="url(#cornCobGrad)" stroke="#a16207" strokeWidth="1.5" />

          {/* Kernel texture rows & columns */}
          {/* Row 1 */}
          <circle cx="44" cy="34" r="2.8" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="50" cy="33" r="3" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="56" cy="34" r="2.8" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />

          {/* Row 2 */}
          <circle cx="41" cy="42" r="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="47" cy="41" r="3.2" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="53" cy="41" r="3.2" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="59" cy="42" r="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />

          {/* Row 3 */}
          <circle cx="40" cy="50" r="3.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="46.5" cy="49" r="3.4" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="53.5" cy="49" r="3.4" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="60" cy="50" r="3.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />

          {/* Row 4 */}
          <circle cx="41" cy="58" r="3.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="47" cy="57" r="3.3" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="53" cy="57" r="3.3" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="59" cy="58" r="3.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />

          {/* Row 5 */}
          <circle cx="43" cy="65" r="2.8" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="50" cy="65" r="3" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="57" cy="65" r="2.8" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />

          {/* Top Corn Silk / Tassel */}
          <path
            d="M47 24 C44 14 42 10 40 7 M50 24 C50 13 52 8 55 5 M53 24 C57 15 62 11 65 9"
            stroke="#92400e"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Front wrap-around leaves (Husk) */}
          <path
            d="M36 78 C32 60 36 44 42 36 C42 50 44 68 49 84 Z"
            fill="url(#cornLeafGrad)"
            stroke="#15803d"
            strokeWidth="1"
          />
          <path
            d="M64 78 C68 60 64 44 58 36 C58 50 56 68 51 84 Z"
            fill="url(#cornLeafGrad)"
            stroke="#15803d"
            strokeWidth="1"
          />

          {/* Stem base */}
          <path d="M47 82 L47 90 A3 3 0 0 0 53 90 L53 82 Z" fill="#15803d" />
        </svg>
      </div>
    );
  }

  if (crop === 'wheat') {
    return (
      <div className={`relative flex items-center justify-center ${className} ${animate ? 'animate-sway-wheat' : ''}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
          <defs>
            <linearGradient id="wheatGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="wheatStemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Earth shadow */}
          <ellipse cx="50" cy="88" rx="24" ry="6" fill="#582a0b" opacity="0.6" />

          {/* Left subtle secondary stalk */}
          <path
            d="M45 88 Q36 60 32 40"
            stroke="url(#wheatStemGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="30" cy="36" rx="4" ry="7" transform="rotate(-15 30 36)" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="0.8" />
          <path d="M28 30 L22 18" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />

          {/* Right subtle secondary stalk */}
          <path
            d="M55 88 Q64 60 68 40"
            stroke="url(#wheatStemGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="70" cy="36" rx="4" ry="7" transform="rotate(15 70 36)" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="0.8" />
          <path d="M72 30 L78 18" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />

          {/* Central strong tall stalk */}
          <path
            d="M50 88 L50 24"
            stroke="url(#wheatStemGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Golden Wheat Grains (Stacked interlocking spikelets) */}
          {/* Pair 1 - lowest */}
          <ellipse cx="44" cy="62" rx="5" ry="8" transform="rotate(-30 44 62)" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="1" />
          <ellipse cx="56" cy="62" rx="5" ry="8" transform="rotate(30 56 62)" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="1" />
          <path d="M40 58 L28 50" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M60 58 L72 50" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />

          {/* Pair 2 */}
          <ellipse cx="44" cy="50" rx="5.2" ry="8.5" transform="rotate(-32 44 50)" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="1" />
          <ellipse cx="56" cy="50" rx="5.2" ry="8.5" transform="rotate(32 56 50)" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="1" />
          <path d="M40 45 L26 36" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M60 45 L74 36" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />

          {/* Pair 3 */}
          <ellipse cx="45" cy="38" rx="5" ry="8" transform="rotate(-30 45 38)" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="1" />
          <ellipse cx="55" cy="38" rx="5" ry="8" transform="rotate(30 55 38)" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="1" />
          <path d="M41 33 L29 22" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M59 33 L71 22" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />

          {/* Pair 4 - higher */}
          <ellipse cx="46" cy="27" rx="4.5" ry="7.5" transform="rotate(-25 46 27)" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="1" />
          <ellipse cx="54" cy="27" rx="4.5" ry="7.5" transform="rotate(25 54 27)" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="1" />
          <path d="M43 23 L34 12" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M57 23 L66 12" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />

          {/* Terminal tip grain */}
          <ellipse cx="50" cy="18" rx="4.2" ry="7" fill="url(#wheatGoldGrad)" stroke="#b45309" strokeWidth="1" />
          {/* Top awn whiskers */}
          <path d="M50 12 L50 3" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M48 13 L42 4" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M52 13 L58 4" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // SOJA (Soybean)
  return (
    <div className={`relative flex items-center justify-center ${className} ${animate ? 'animate-sway-soy' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
        <defs>
          <linearGradient id="soyLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
          <linearGradient id="soyPodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="50%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#4d7c0f" />
          </linearGradient>
          <linearGradient id="soyBeanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#a3e635" />
          </linearGradient>
        </defs>

        {/* Earth shadow */}
        <ellipse cx="50" cy="88" rx="26" ry="7" fill="#582a0b" opacity="0.6" />

        {/* Central sturdy bush stem */}
        <path
          d="M50 88 C50 75 48 55 50 38"
          stroke="#15803d"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Side branches */}
        <path d="M50 65 Q38 60 30 52" stroke="#15803d" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M50 58 Q64 54 70 46" stroke="#15803d" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M50 48 Q42 40 36 32" stroke="#15803d" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M50 42 Q58 35 64 28" stroke="#15803d" strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* Plump Hanging Soy Pod 1 (Left lower) */}
        <g transform="rotate(22 28 60)">
          {/* Outer curved fuzzy pod envelope */}
          <path
            d="M24 50 Q21 62 25 74 Q33 72 32 60 Q31 52 24 50 Z"
            fill="url(#soyPodGrad)"
            stroke="#365314"
            strokeWidth="1.2"
          />
          {/* 3 distinct rounded beans showing through the pod casing */}
          <ellipse cx="26" cy="55" rx="3.2" ry="4" fill="url(#soyBeanGrad)" stroke="#4d7c0f" strokeWidth="0.6" />
          <ellipse cx="26" cy="62" rx="3.3" ry="4" fill="url(#soyBeanGrad)" stroke="#4d7c0f" strokeWidth="0.6" />
          <ellipse cx="26" cy="69" rx="3" ry="3.8" fill="url(#soyBeanGrad)" stroke="#4d7c0f" strokeWidth="0.6" />
          {/* Pod tip tail */}
          <path d="M26 74 Q27 77 28 78" stroke="#365314" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>

        {/* Plump Hanging Soy Pod 2 (Right lower) */}
        <g transform="rotate(-18 70 60)">
          <path
            d="M66 50 Q63 62 67 74 Q75 72 74 60 Q73 52 66 50 Z"
            fill="url(#soyPodGrad)"
            stroke="#365314"
            strokeWidth="1.2"
          />
          <ellipse cx="68" cy="55" rx="3.2" ry="4" fill="url(#soyBeanGrad)" stroke="#4d7c0f" strokeWidth="0.6" />
          <ellipse cx="68" cy="62" rx="3.3" ry="4" fill="url(#soyBeanGrad)" stroke="#4d7c0f" strokeWidth="0.6" />
          <ellipse cx="68" cy="69" rx="3" ry="3.8" fill="url(#soyBeanGrad)" stroke="#4d7c0f" strokeWidth="0.6" />
          <path d="M68 74 Q69 77 70 78" stroke="#365314" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>

        {/* Hanging Soy Pod 3 (Center upper) */}
        <g transform="rotate(4 48 48)">
          <path
            d="M45 42 Q42 53 46 64 Q53 62 52 51 Q51 44 45 42 Z"
            fill="url(#soyPodGrad)"
            stroke="#365314"
            strokeWidth="1.2"
          />
          <ellipse cx="47" cy="47" rx="3" ry="3.8" fill="url(#soyBeanGrad)" stroke="#4d7c0f" strokeWidth="0.6" />
          <ellipse cx="47" cy="54" rx="3" ry="3.8" fill="url(#soyBeanGrad)" stroke="#4d7c0f" strokeWidth="0.6" />
          <ellipse cx="47" cy="60" rx="2.8" ry="3.5" fill="url(#soyBeanGrad)" stroke="#4d7c0f" strokeWidth="0.6" />
        </g>

        {/* Trifoliate Broad Round Soybean Leaves */}
        {/* Left leaflet */}
        <path
          d="M34 38 C20 32 14 20 25 15 C36 12 40 25 34 38 Z"
          fill="url(#soyLeafGrad)"
          stroke="#14532d"
          strokeWidth="1"
        />
        <path d="M30 28 L23 18" stroke="#166534" strokeWidth="0.8" fill="none" />

        {/* Right leaflet */}
        <path
          d="M66 38 C80 32 86 20 75 15 C64 12 60 25 66 38 Z"
          fill="url(#soyLeafGrad)"
          stroke="#14532d"
          strokeWidth="1"
        />
        <path d="M70 28 L77 18" stroke="#166534" strokeWidth="0.8" fill="none" />

        {/* Center top dominant round leaflet */}
        <path
          d="M50 36 C36 28 36 10 50 6 C64 10 64 28 50 36 Z"
          fill="url(#soyLeafGrad)"
          stroke="#14532d"
          strokeWidth="1.2"
        />
        <path d="M50 34 L50 10" stroke="#166534" strokeWidth="1" fill="none" />
        <path d="M50 24 Q44 20 42 16" stroke="#166534" strokeWidth="0.8" fill="none" />
        <path d="M50 24 Q56 20 58 16" stroke="#166534" strokeWidth="0.8" fill="none" />
      </svg>
    </div>
  );
};

export const CROP_NAMES: Record<CropType, string> = {
  corn: 'Milho',
  wheat: 'Trigo',
  soy: 'Soja',
};

export const CROP_COLORS: Record<CropType, { bg: string; text: string; border: string }> = {
  corn: { bg: '#ca8a04', text: '#fef08a', border: '#eab308' },
  wheat: { bg: '#b45309', text: '#fde68a', border: '#f59e0b' },
  soy: { bg: '#15803d', text: '#bbf7d0', border: '#22c55e' },
};
