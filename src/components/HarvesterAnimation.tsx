import React from 'react';
import { HarvestLineResult } from '../types';
import { HarvesterId, HarvesterImage } from './Garage';

export type HarvesterDirection = 'right' | 'left' | 'up' | 'down';
interface HarvesterProps {
 line: HarvestLineResult;
 direction?: HarvesterDirection;
 boardRect?: {width:number;height:number};
 harvesterId: HarvesterId;
 duration: number;
}
export const HarvesterAnimation:React.FC<HarvesterProps> = ({line,direction,harvesterId,duration}) => {
 const effectiveDirection = direction || (line.orientation==='row'?'right':'up');
 const isRow=line.orientation==='row';
 const crossSpanPct=13.2;
 const lengthSpanPct=23.77;
 const widthPct=isRow?lengthSpanPct:crossSpanPct;
 const heightPct=isRow?crossSpanPct:lengthSpanPct;
 const leftPosPct=isRow?0:line.index*12.5+(12.5-crossSpanPct)/2;
 const topPosPct=isRow?line.index*12.5+(12.5-crossSpanPct)/2:0;
 const animClass='animate-harvester-'+effectiveDirection;
 // All machine parts rotate as one unit. SVGs are authored facing up, cutter ahead of cabin.
 const rotation:Record<HarvesterDirection,number>={up:0,right:90,down:180,left:270};
 return <div className="absolute pointer-events-none z-30 select-none overflow-visible" style={{left:`${leftPosPct}%`,top:`${topPosPct}%`,width:`${widthPct}%`,height:`${heightPct}%`}}>
  <div className={`w-full h-full relative drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)] ${animClass}`} style={{animationDuration:`${duration}ms`}}>
   <div className="w-full h-full" style={{transform:`rotate(${rotation[effectiveDirection]}deg)`}}><HarvesterImage id={harvesterId} className="w-full h-full object-contain pointer-events-none select-none block" /></div>
  </div>
 </div>;
};
