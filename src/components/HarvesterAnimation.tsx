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
 progress?: number;
}

/** One shared frame progress drives the harvester position and the crop cutter. */
export const HarvesterAnimation:React.FC<HarvesterProps> = ({line,direction,harvesterId,progress=0}) => {
 const travel:HarvesterDirection=direction||(line.orientation==='row'?'right':'up');
 const size=32.2;
 const lane=(line.index+.5)*12.5;
 // The cutter is near the front of the sprite; align it with the crop position.
 const cutterAhead=0;
 const travelSign=travel==='right'||travel==='down'?1:-1;
 // Enter and leave the field completely; the cutter crosses tiles only mid-pass.
 const cutterPosition=travelSign===1?(6.25+87.5*progress):(93.75-87.5*progress);
 const machineCenter=cutterPosition-travelSign*cutterAhead;
 const x=line.orientation==='row'?machineCenter:lane;
 const y=line.orientation==='row'?lane:machineCenter;
 const rotation:Record<HarvesterDirection,number>={up:0,right:90,down:180,left:270};
 return <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
   <div className="absolute pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]" style={{
     width:`${size}%`,height:`${size}%`,
     left:`calc(${x}% - ${size/2}%)`,top:`calc(${y}% - ${size/2}%)`,
     transform:`rotate(${rotation[travel]}deg)`,
   }}>
     <HarvesterImage id={harvesterId} view="superior" className="block w-full h-full object-contain"/>
   </div>
 </div>;
};
