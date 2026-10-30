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

/** The motion track covers the entire board. The sprite moves only along its completed row/column. */
export const HarvesterAnimation:React.FC<HarvesterProps> = ({line,direction,harvesterId,duration}) => {
 const travel:HarvesterDirection = direction || (line.orientation==='row'?'right':'up');
 const isRow=line.orientation==='row';
 // Square sprite viewport avoids clipping the full combine when rotated by 90 degrees.
 const size=32.2; // 40% larger than the previous 23% viewport
 const lane=(line.index+0.5)*12.5;
 // Small inset compensates for the cutter extending beyond the sprite's center.
 // Keep the full machine visible while still sweeping the first and last tiles.
 const edgeInset=2.5;
 const start=6.25+edgeInset-size/2;
 const end=93.75-edgeInset-size/2;
 const top=isRow?`calc(${lane}% - ${size/2}%)`:undefined;
 const left=!isRow?`calc(${lane}% - ${size/2}%)`:undefined;
 const rotation:Record<HarvesterDirection,number>={up:0,right:90,down:180,left:270};
 const animation=isRow?'farm-harvester-horizontal':'farm-harvester-vertical';
 const reverse=travel==='left'||travel==='up';
 return <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
   <div className="absolute pointer-events-none" style={{
      width:`${size}%`,height:`${size}%`,top,left,
      ['--harvester-start' as string]:`${start}%`,
      ['--harvester-end' as string]:`${end}%`,
      animation:`${animation} ${duration}ms linear both`,
      animationDirection:reverse?'reverse':'normal',
    }}>
     <div className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]" style={{transform:`rotate(${rotation[travel]}deg)`}}>
       <HarvesterImage id={harvesterId} view="superior" className="block w-full h-full object-contain" />
     </div>
   </div>
 </div>;
};
