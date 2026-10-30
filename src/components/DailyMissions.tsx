import React, { useEffect, useRef, useState } from 'react';
import { GameStats } from '../types';

type Daily = { date: string; lines: number; supers: number; bestScore: number; claimed: boolean[]; coins: number };
const KEY = 'farm_blocks_daily_missions_v1';
// Todos usam a mesma data civil de Brasília, independentemente do fuso do aparelho.
const day = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());
const dayIndex = (date: string) => Math.floor(Date.parse(date + 'T00:00:00Z') / 86400000);
type Mission = { icon: string; label: string; target: number; reward: number };
const missionSets: Mission[][] = [
  [
    { icon: '🌽', label: 'Colha 10 linhas', target: 10, reward: 50 },
    { icon: '🚜', label: 'Faça 2 Super Colheitas', target: 2, reward: 100 },
    { icon: '🏆', label: 'Alcance 2.000 pontos em uma partida', target: 2000, reward: 75 },
  ],
  [
    { icon: '🌽', label: 'Colha 15 linhas', target: 15, reward: 75 },
    { icon: '🚜', label: 'Faça 1 Super Colheita', target: 1, reward: 60 },
    { icon: '🏆', label: 'Alcance 3.000 pontos em uma partida', target: 3000, reward: 100 },
  ],
  [
    { icon: '🌽', label: 'Colha 8 linhas', target: 8, reward: 40 },
    { icon: '🚜', label: 'Faça 3 Super Colheitas', target: 3, reward: 150 },
    { icon: '🏆', label: 'Alcance 1.500 pontos em uma partida', target: 1500, reward: 60 },
  ],
  [
    { icon: '🌽', label: 'Colha 20 linhas', target: 20, reward: 100 },
    { icon: '🚜', label: 'Faça 2 Super Colheitas', target: 2, reward: 100 },
    { icon: '🏆', label: 'Alcance 2.500 pontos em uma partida', target: 2500, reward: 90 },
  ],
  [
    { icon: '🌽', label: 'Colha 12 linhas', target: 12, reward: 60 },
    { icon: '🚜', label: 'Faça 1 Super Colheita', target: 1, reward: 60 },
    { icon: '🏆', label: 'Alcance 4.000 pontos em uma partida', target: 4000, reward: 130 },
  ],
];
const missionsFor = (date: string): Mission[] => missionSets[((dayIndex(date) % missionSets.length) + missionSets.length) % missionSets.length];
const empty = (date: string, coins = 0): Daily => ({ date, lines: 0, supers: 0, bestScore: 0, claimed: [false, false, false], coins });
export function spendMissionCoins(amount:number):boolean {
  const current=load();
  if (!Number.isSafeInteger(amount) || amount<0 || current.coins<amount) return false;
  localStorage.setItem(KEY,JSON.stringify({...current,coins:current.coins-amount}));
  window.dispatchEvent(new Event('farm-blocks-missions-changed'));
  return true;
}
export function getMissionCoins():number { return load().coins; }
function load(): Daily {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null') as Daily | null;
    if (saved && Number.isFinite(saved.coins)) return saved.date === day() ? saved : empty(day(), saved.coins);
  } catch { /* ignore */ }
  return empty(day());
}
export function DailyMissions({ score, stats }: { score: number; stats: GameStats }) {
  const [open, setOpen] = useState(false);
  const [daily, setDaily] = useState<Daily>(load);
  useEffect(() => {
    const sync=()=>setDaily(load());
    window.addEventListener('farm-blocks-missions-changed',sync);
    return ()=>window.removeEventListener('farm-blocks-missions-changed',sync);
  }, []);
  const previous = useRef({ lines: stats.linesCleared, supers: stats.superHarvests });
  const missions = missionsFor(daily.date);

  useEffect(() => {
    const previousStats = previous.current;
    const linesAdded = Math.max(0, stats.linesCleared - previousStats.lines);
    const supersAdded = Math.max(0, stats.superHarvests - previousStats.supers);
    previous.current = { lines: stats.linesCleared, supers: stats.superHarvests };
    setDaily(old => {
      const current = old.date === day() ? old : empty(day(), old.coins);
      if (!linesAdded && !supersAdded && score <= current.bestScore) return current;
      return {
        ...current,
        lines: current.lines + linesAdded,
        supers: current.supers + supersAdded,
        bestScore: Math.max(current.bestScore, score),
      };
    });
  }, [stats.linesCleared, stats.superHarvests, score]);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(daily)); } catch { /* ignore */ }
  }, [daily]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDaily(old => old.date === day() ? old : empty(day(), old.coins));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const values = [daily.lines, daily.supers, daily.bestScore];
  const ready = missions.filter((m, i) => values[i] >= m.target && !daily.claimed[i]).length;
  const claim = (index: number) => {
    setDaily(old => {
      if (old.date !== day()) return empty(day(), old.coins);
      if (old.claimed[index] || [old.lines, old.supers, old.bestScore][index] < missions[index].target) return old;
      const claimed = [...old.claimed];
      claimed[index] = true;
      return { ...old, claimed, coins: old.coins + missions[index].reward };
    });
  };

  return (
    <>
      <button onClick={() => setOpen(true)} title="Missões diárias" aria-label="Abrir missões diárias"
        className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/70 border border-emerald-600/70 text-emerald-200 flex items-center justify-center shadow-sm text-sm">
        🌾
        {ready > 0 && <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-amber-950 rounded-full text-[9px] font-black w-4 h-4 flex items-center justify-center">{ready}</span>}
      </button>
      {open && <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <section role="dialog" aria-modal="true" aria-label="Missões diárias" className="w-full max-w-sm max-h-[85dvh] overflow-y-auto bg-amber-950 border-2 border-amber-600 rounded-3xl p-5 text-amber-100 shadow-2xl">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-black text-yellow-300">🌾 MISSÕES DA FAZENDA</h2>
            <button onClick={() => setOpen(false)} aria-label="Fechar missões" className="bg-amber-900 rounded-lg px-3 py-1.5 font-bold">✕</button>
          </div>
          <p className="text-xs text-amber-300 mb-3">Renovação às 00:00 (Brasília) • Moedas: <strong>{daily.coins.toLocaleString('pt-BR')} 🌾</strong></p>
          <div className="space-y-3">
            {missions.map((m, i) => {
              const progress = Math.min(m.target, values[i]);
              const done = progress >= m.target;
              return <div key={m.label} className="bg-amber-900/60 border border-amber-700 rounded-xl p-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-bold">{m.icon} {m.label}</span>
                  <span className="text-xs text-yellow-300 shrink-0">+{m.reward} 🌾</span>
                </div>
                <div className="flex justify-between text-[11px] text-amber-200 mt-2 mb-1">
                  <span>{progress.toLocaleString('pt-BR')} / {m.target.toLocaleString('pt-BR')}</span>
                  <span>{daily.claimed[i] ? 'Resgatada ✓' : done ? 'Concluída!' : 'Em andamento'}</span>
                </div>
                <div className="h-2 rounded-full bg-amber-950 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${100 * progress / m.target}%` }} /></div>
                {done && !daily.claimed[i] && <button onClick={() => claim(i)} className="w-full mt-2 rounded-lg bg-yellow-400 text-amber-950 font-black py-2">RESGATAR +{m.reward} 🌾</button>}
              </div>;
            })}
          </div>
          <p className="text-[11px] text-amber-300/80 mt-3 text-center">O progresso e as moedas ficam salvos neste navegador.</p>
        </section>
      </div>}
    </>
  );
}
