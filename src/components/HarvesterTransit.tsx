import React, { useEffect, useMemo, useState } from 'react';
import { HarvesterImage, HarvesterId } from './Garage';
import { HarvesterDirection } from './HarvesterAnimation';
import { HarvestLineResult } from '../types';

type Pass = { line: HarvestLineResult; direction: HarvesterDirection };
type Point = [number, number];
const OUT=6.25, FAR=93.75, SPAN=FAR-OUT, PERIMETER=SPAN*4;
const directionVector:Record<HarvesterDirection,Point>={right:[1,0],left:[-1,0],up:[0,-1],down:[0,1]};
const center=(p:Pass,end:boolean):Point=>{
 const lane=(p.line.index+.5)*12.5;
 // Match HarvesterAnimation's exact sprite center at progress 0 and 1.
 // The cutter is 8% ahead of the machine center in its travel direction.
 const cutter=end?(p.direction==='right'||p.direction==='down'?117.75:-17.75):(p.direction==='right'||p.direction==='down'?6.25:93.75);
 const sign=p.direction==='right'||p.direction==='down'?1:-1;
 const machineCenter=cutter;
 if(p.line.orientation==='row')return [machineCenter,lane];
 return [lane,machineCenter];
};
const boundary=(point:Point,vector:Point):Point=>[
 vector[0]>0?FAR:vector[0]<0?OUT:point[0],
 vector[1]>0?FAR:vector[1]<0?OUT:point[1]
];
const perimeterPosition=(p:Point):number=>{
 if(p[1]===OUT)return p[0]-OUT;
 if(p[0]===FAR)return SPAN+p[1]-OUT;
 if(p[1]===FAR)return SPAN*2+FAR-p[0];
 return SPAN*3+FAR-p[1];
};
const perimeterPoint=(distance:number):Point=>{
 const d=((distance%PERIMETER)+PERIMETER)%PERIMETER;
 if(d<SPAN)return [OUT+d,OUT];
 if(d<SPAN*2)return [FAR,OUT+d-SPAN];
 if(d<SPAN*3)return [FAR-(d-SPAN*2),FAR];
 return [OUT,FAR-(d-SPAN*3)];
};
const distance=(a:Point,b:Point)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
function buildPath(from:Pass,to:Pass):Point[]{
 const start=center(from,true),finish=center(to,false);
 // Parallel passes: a short, continuous U-turn with correct departure/arrival tangents.
 // Keep the same combine size; only change the transit trajectory.
 if(from.line.orientation===to.line.orientation && from.direction!==to.direction){
  const row=from.line.orientation==='row';
  const side=row?(from.direction==='right'?1:-1):(from.direction==='down'?1:-1);
  const outer=row?Math.max(122,Math.abs(start[0]-50)+72)*(side):Math.max(122,Math.abs(start[1]-50)+72)*(side);
  const p1:Point=row?[outer,start[1]]:[start[0],outer];
  const p2:Point=row?[outer,finish[1]]:[finish[0],outer];
  const points:Point[]=[];
  for(let i=0;i<=40;i++){
   const t=i/40,q=1-t;
   points.push([
    q*q*q*start[0]+3*q*q*t*p1[0]+3*q*t*t*p2[0]+t*t*t*finish[0],
    q*q*q*start[1]+3*q*q*t*p1[1]+3*q*t*t*p2[1]+t*t*t*finish[1]
   ]);
  }
  return points;
 }
 const exit=boundary(start,directionVector[from.direction]);
 const entering=directionVector[to.direction];
 const entry=boundary(finish,[-entering[0],-entering[1]]);
 const a=perimeterPosition(exit),b=perimeterPosition(entry);
 const clockwise=(b-a+PERIMETER)%PERIMETER;
 const counterclockwise=(a-b+PERIMETER)%PERIMETER;
 const sign=clockwise<=counterclockwise?1:-1;
 const length=Math.min(clockwise,counterclockwise);
 const points:Point[]=[start,exit];
 // Stay on the external headland, including every corner along the perimeter.
 const steps=Math.floor(length/SPAN)+2;
 for(let i=1;i<=steps;i++){
  const offset=i*SPAN;
  if(offset>=length)break;
  const next=sign>0?Math.ceil((a+0.00001)/SPAN)*SPAN+(i-1)*SPAN:Math.floor((a-0.00001)/SPAN)*SPAN-(i-1)*SPAN;
  const delta=sign*(next-a);
  if(delta>0&&delta<length)points.push(perimeterPoint(next));
 }
 points.push(entry,finish);
 // Round outside corners without cutting across planted cells.
 const smooth:Point[]=[points[0]];
 for(let i=1;i<points.length-1;i++){
  const prev=points[i-1],cur=points[i],next=points[i+1];
  const before=distance(prev,cur),after=distance(cur,next);
  if(before<0.001||after<0.001)continue;
  const radius=Math.min(7,before*.35,after*.35);
  const a:Point=[cur[0]+(prev[0]-cur[0])*radius/before,cur[1]+(prev[1]-cur[1])*radius/before];
  const b:Point=[cur[0]+(next[0]-cur[0])*radius/after,cur[1]+(next[1]-cur[1])*radius/after];
  smooth.push(a);
  for(let j=1;j<=8;j++){
   const t=j/8,q=1-t;
   smooth.push([q*q*a[0]+2*q*t*cur[0]+t*t*b[0],q*q*a[1]+2*q*t*cur[1]+t*t*b[1]]);
  }
 }
 smooth.push(points[points.length-1]);
 return smooth;
}
export const HarvesterTransit:React.FC<{from:Pass;to:Pass;harvesterId:HarvesterId;duration:number}>=({from,to,harvesterId,duration})=>{
 const [progress,setProgress]=useState(0);
 useEffect(()=>{
  let frame=0;const started=performance.now();
  const tick=(now:number)=>{const t=Math.min(1,(now-started)/duration);setProgress(t);if(t<1)frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);
  return ()=>cancelAnimationFrame(frame);
 },[from,to,duration]);
 const path=useMemo(()=>buildPath(from,to),[from,to]);
 const lengths=[0];for(let i=1;i<path.length;i++)lengths.push(lengths[i-1]+distance(path[i-1],path[i]));
 const target=progress*lengths[lengths.length-1];
 let segment=1;
 while(segment<lengths.length-1&&lengths[segment]<target)segment++;
 const a=path[segment-1],b=path[segment];
 const fraction=(target-lengths[segment-1])/Math.max(.0001,lengths[segment]-lengths[segment-1]);
 const x=a[0]+(b[0]-a[0])*fraction,y=a[1]+(b[1]-a[1])*fraction;
 const angle=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI+90;
 return <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
  <div className="absolute drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)]" style={{
   width:'32.2%',height:'32.2%',left:`calc(${x}% - 16.1%)`,top:`calc(${y}% - 16.1%)`,
   transform:`rotate(${angle}deg)`
  }}><HarvesterImage id={harvesterId} view="superior" className="block w-full h-full object-contain"/></div>
 </div>;
};
