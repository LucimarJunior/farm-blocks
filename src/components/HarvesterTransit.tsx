import React, { useEffect, useState } from 'react';
import { HarvesterImage, HarvesterId } from './Garage';
import { HarvesterDirection } from './HarvesterAnimation';
import { HarvestLineResult } from '../types';

type Pass = {line:HarvestLineResult;direction:HarvesterDirection};
const center=(p:Pass,atEnd:boolean):[number,number]=>{
 const lane=(p.line.index+.5)*12.5;
 const first=8.75,last=91.25;
 if(p.line.orientation==='row') return [((p.direction==='right')===atEnd)?last:first,lane];
 return [lane,((p.direction==='down')===atEnd)?last:first];
};
const heading=(p:Pass):number=>({right:90,left:270,up:0,down:180}[p.direction]);
const cubic=(a:number,b:number,c:number,d:number,t:number)=>{const q=1-t;return q*q*q*a+3*q*q*t*b+3*q*t*t*c+t*t*t*d;};
export const HarvesterTransit:React.FC<{from:Pass;to:Pass;harvesterId:HarvesterId;duration:number}> = ({from,to,harvesterId,duration})=>{
 const [t,setT]=useState(0);
 useEffect(()=>{
  let frame=0;const started=performance.now();
  const tick=(now:number)=>{const progress=Math.min(1,(now-started)/duration);setT(progress);if(progress<1)frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(frame);
 },[from,to,duration]);
 const [x0,y0]=center(from,true),[x3,y3]=center(to,false);
 // Travel outside the field on the nearest headland, then curve into the next pass.
 const edgeX=x0>50?108:-8,edgeY=y0>50?108:-8;
 const sameRows=from.line.orientation==='row'&&to.line.orientation==='row';
 const sameCols=from.line.orientation==='col'&&to.line.orientation==='col';
 const x1=sameRows?edgeX:sameCols?x0:(from.line.orientation==='row'?edgeX:x0);
 const y1=sameCols?edgeY:sameRows?y0:(from.line.orientation==='col'?edgeY:y0);
 const x2=sameRows?edgeX:sameCols?x3:(to.line.orientation==='row'?(x3>50?108:-8):x3);
 const y2=sameCols?edgeY:sameRows?y3:(to.line.orientation==='col'?(y3>50?108:-8):y3);
 const x=cubic(x0,x1,x2,x3,t),y=cubic(y0,y1,y2,y3,t);
 const dx=3*(1-t)*(1-t)*(x1-x0)+6*(1-t)*t*(x2-x1)+3*t*t*(x3-x2);
 const dy=3*(1-t)*(1-t)*(y1-y0)+6*(1-t)*t*(y2-y1)+3*t*t*(y3-y2);
 const angle=t===0?heading(from):t===1?heading(to):Math.atan2(dy,dx)*180/Math.PI+90;
 return <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
  <div className="absolute drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]" style={{
   width:'32.2%',height:'32.2%',left:`calc(${x}% - 16.1%)`,top:`calc(${y}% - 16.1%)`,
   transform:`rotate(${angle}deg)`
  }}><HarvesterImage id={harvesterId} view="superior" className="block w-full h-full object-contain"/></div>
 </div>;
};
