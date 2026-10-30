import React, { useState } from 'react';

export const HARVESTERS = [
  { id:'pioneira', name:'Pioneira', coins:0, duration:3500, width:3, premium:false },
  { id:'mf510', name:'Massey Ferguson 510', coins:700, duration:3000, width:3.5, premium:false },
  { id:'jd975', name:'John Deere 975', coins:1500, duration:2600, width:4.5, premium:false },
  { id:'mf3640', name:'Massey Ferguson 3640', coins:3000, duration:2200, width:6, premium:false },
  { id:'tc57', name:'New Holland TC57', coins:5000, duration:1800, width:7.5, premium:false },
  { id:'case8250', name:'Case IH 8250', coins:0, duration:1500, width:9, premium:true, price:'R$ 9,90' },
  { id:'x91100', name:'John Deere X9 1100', coins:0, duration:1200, width:12, premium:true, price:'R$ 14,90' },
] as const;
export type HarvesterId = typeof HARVESTERS[number]['id'];
export type GarageData = { coins:number; owned:HarvesterId[]; equipped:HarvesterId; rewardedMatches:string[] };
const KEY = 'farm_blocks_garage_v1';
export function loadGarage():GarageData {
  try {
    const d = JSON.parse(localStorage.getItem(KEY)||'null');
    if (d && Number.isSafeInteger(d.coins) && d.coins>=0 && Array.isArray(d.owned) && Array.isArray(d.rewardedMatches))
      return {coins:d.coins,owned:['pioneira',...d.owned.filter((id:string)=>HARVESTERS.some(h=>h.id===id&&!h.premium))],equipped:HARVESTERS.some(h=>h.id===d.equipped&&!h.premium&&d.owned.includes(h.id))?d.equipped:'pioneira',rewardedMatches:d.rewardedMatches};
  } catch {}
  return {coins:0,owned:['pioneira'],equipped:'pioneira',rewardedMatches:[]};
}
export function persistGarage(d:GarageData) { localStorage.setItem(KEY,JSON.stringify(d)); }
export function rewardFinishedMatch(d:GarageData,id:string,score:number):GarageData {
  if(!id||d.rewardedMatches.includes(id)) return d;
  const reward = 10+Math.min(100,Math.floor(Math.max(0,score)/1000)*5);
  const next={...d,coins:d.coins+reward,rewardedMatches:[...d.rewardedMatches,id]};
  persistGarage(next); return next;
}
export function buyHarvester(d:GarageData,id:HarvesterId):GarageData {
  const m=HARVESTERS.find(x=>x.id===id);
  if(!m||m.premium||d.owned.includes(id)||d.coins<m.coins) return d;
  const next={...d,coins:d.coins-m.coins,owned:[...d.owned,id]};
  persistGarage(next);return next;
}
export function equipHarvester(d:GarageData,id:HarvesterId):GarageData {
  if(!d.owned.includes(id)) return d;
  const next={...d,equipped:id};persistGarage(next);return next;
}
const SPRITE_NAMES: Record<HarvesterId,string> = {
  pioneira:'pioneira',
  mf510:'massey_ferguson_510',
  jd975:'john_deere_975',
  mf3640:'massey_ferguson_3640',
  tc57:'new_holland_tc57',
  case8250:'case_ih_8250',
  x91100:'john_deere_x9_1100',
};
export type HarvesterView = 'superior'|'superior_invertida'|'lateral_esquerda'|'lateral_direita';
export function HarvesterImage({id,className='',view='superior'}:{id:HarvesterId;className?:string;view?:HarvesterView}) {
  const name=SPRITE_NAMES[id];
  return <img src={`${import.meta.env.BASE_URL}harvesters/${name}_${view}.png`} alt={HARVESTERS.find(h=>h.id===id)?.name||id} className={className} draggable={false}/>;
}
export function GarageModal({open,onClose,data,onChange}:{open:boolean;onClose:()=>void;data:GarageData;onChange:(d:GarageData)=>void}) {
 const [tab,setTab]=useState<'garage'|'shop'>('shop');
 if(!open)return null;
 return <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label="Garagem e Loja">
  <div className="bg-amber-950 border-2 border-yellow-600 rounded-2xl max-w-lg w-full max-h-[90dvh] flex flex-col text-white shadow-2xl">
   <div className="p-3 flex items-center justify-between"><h2 className="font-black text-yellow-300 text-lg">🚜 Garagem & Loja</h2><button onClick={onClose} className="bg-amber-800 px-3 py-1 rounded-lg" aria-label="Fechar">✕</button></div>
   <div className="px-3 flex justify-between items-center"><div className="flex gap-2"><button className={tab==='garage'?'text-yellow-300 font-black':'text-amber-200'} onClick={()=>setTab('garage')}>Minha garagem</button><button className={tab==='shop'?'text-yellow-300 font-black':'text-amber-200'} onClick={()=>setTab('shop')}>🛒 Loja</button></div><span className="font-bold text-yellow-300">🪙 {data.coins.toLocaleString('pt-BR')}</span></div>
   <p className="px-3 pt-2 text-[11px] text-amber-200">{tab==='garage'?'Selecione uma máquina adquirida para equipar.':'Ganhe moedas ao finalizar partidas. Máquinas premium chegarão com compras no aplicativo.'}</p>
   <div className="overflow-y-auto p-3 grid grid-cols-2 gap-2">
    {HARVESTERS.filter(m=>tab==='shop'||data.owned.includes(m.id)).map(m=>{
      const owned=data.owned.includes(m.id),equipped=data.equipped===m.id;
      return <div key={m.id} className={`bg-amber-900/80 rounded-xl border p-2 flex flex-col gap-1 ${equipped?'border-yellow-400':'border-amber-700'}`}>
       <HarvesterImage id={m.id} className="w-full h-24 object-contain"/>
       <strong className="text-xs leading-tight">{m.name}</strong>
       <span className="text-[10px] text-amber-200">{m.width.toLocaleString('pt-BR')} m • {(m.duration/1000).toLocaleString('pt-BR')} s/linha</span>
       <button disabled={equipped||(m.premium&&!owned)||(!owned&&data.coins<m.coins)} onClick={()=>onChange(owned?equipHarvester(data,m.id):buyHarvester(data,m.id))} className="mt-auto bg-emerald-700 disabled:bg-stone-700 disabled:text-stone-300 rounded-lg px-2 py-2 text-xs font-bold">
        {equipped?'✓ Equipada':owned?'Equipar':m.premium?`🔒 Premium ${m.price}`:data.coins<m.coins?`🔒 ${m.coins.toLocaleString('pt-BR')} 🪙`:`Comprar ${m.coins.toLocaleString('pt-BR')} 🪙`}
       </button>
      </div>;
    })}
   </div>
   <p className="px-3 pb-3 text-[10px] text-amber-300">Compras premium indisponíveis até integração com Apple/Google. Saldo e garagem salvos neste navegador.</p>
  </div>
 </div>;
}
