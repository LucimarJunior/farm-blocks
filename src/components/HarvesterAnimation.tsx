import React from 'react';
import { HarvestLineResult } from '../types';
import harvesterRight from '../assets/harvester_right.png';
import harvesterLeft from '../assets/harvester_left.png';
import harvesterUp from '../assets/harvester_up.png';
import harvesterDown from '../assets/harvester_down.png';

export type HarvesterDirection = 'right' | 'left' | 'up' | 'down';

// Preload all 4 direction sprites so they are immediately available in memory
if (typeof window !== 'undefined') {
  [harvesterRight, harvesterLeft, harvesterUp, harvesterDown].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

interface HarvesterProps {
  line: HarvestLineResult;
  direction?: HarvesterDirection;
  boardRect?: { width: number; height: number };
}

export const HarvesterAnimation: React.FC<HarvesterProps> = ({ line, direction }) => {
  const isRow = line.orientation === 'row';

  // Determine effective direction:
  // If not explicitly provided, rows default to 'right' (L->R) and columns default to 'up' (B->T)
  const effectiveDirection: HarvesterDirection =
    direction || (isRow ? 'right' : 'up');

  // Aspect ratio of the sprite is 389 x 216 (~1.801 : 1)
  // Cross-width of cutter platform: ~13.2% of board (covers 12.5% tile with realistic furrow cut)
  // Length in direction of travel: 13.2% * (389 / 216) = 23.77% of board
  const crossSpanPct = 13.2;
  const lengthSpanPct = (13.2 * 389) / 216; // ~23.77%

  let spriteSrc: string;
  let animClass: string;
  let widthPct: number;
  let heightPct: number;
  let leftPosPct: number;
  let topPosPct: number;

  switch (effectiveDirection) {
    case 'right':
      spriteSrc = harvesterRight;
      animClass = 'animate-harvester-right';
      widthPct = lengthSpanPct;
      heightPct = crossSpanPct;
      leftPosPct = 0;
      topPosPct = line.index * 12.5 + (12.5 - crossSpanPct) / 2;
      break;

    case 'left':
      spriteSrc = harvesterLeft;
      animClass = 'animate-harvester-left';
      widthPct = lengthSpanPct;
      heightPct = crossSpanPct;
      leftPosPct = 0;
      topPosPct = line.index * 12.5 + (12.5 - crossSpanPct) / 2;
      break;

    case 'up':
      spriteSrc = harvesterUp;
      animClass = 'animate-harvester-up';
      widthPct = crossSpanPct;
      heightPct = lengthSpanPct;
      leftPosPct = line.index * 12.5 + (12.5 - crossSpanPct) / 2;
      topPosPct = 0;
      break;

    case 'down':
      spriteSrc = harvesterDown;
      animClass = 'animate-harvester-down';
      widthPct = crossSpanPct;
      heightPct = lengthSpanPct;
      leftPosPct = line.index * 12.5 + (12.5 - crossSpanPct) / 2;
      topPosPct = 0;
      break;
  }

  return (
    <div
      className="absolute pointer-events-none z-30 select-none overflow-visible"
      style={{
        left: `${leftPosPct}%`,
        top: `${topPosPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
      }}
    >
      <div className={`w-full h-full relative drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)] ${animClass}`}>
        <img
          src={spriteSrc}
          alt={`Colheitadeira ${effectiveDirection}`}
          className="w-full h-full object-contain pointer-events-none select-none block"
          draggable={false}
        />
      </div>
    </div>
  );
};
