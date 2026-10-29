import React, { useEffect, useRef, useState } from 'react';
import { GameStats } from '../types';

type Daily = { date: string; lines: number; supers: number; bestScore: number; claimed: boolean[]; coins: number };
const KEY = 'farm_blocks_daily_missions_v1';
const day = () => new Date().toLocaleDateString('en-CA');
const empty = (date: string, coins = 0): Daily => ({ date, lines: 0, supers: 0, bestScore: 0, claimed: [false, false, false], coins });
function load(): Daily {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null') as Daily | null;
    if (saved && Number.isFinite(saved.coins)) return saved.date === day() ? saved : empty(day(), saved.coins);
  } catch { /* ignore */ }
  return empty(day());
}
const missions = [
  { icon: '🌽', label: 'Colha 10 linhas', target: 10, reward: 50 },
  { icon: '🚜', label: 'Faça 2 Super Colheitas', target: 2, reward: 100 },
  { icon: '🏆', label: 'Alcance 2.000 pontos em uma partida', target: 2000, reward: 75 },
];

export function DailyMissions({ score, stats }: { score: number; stats: GameStats }) {
  const [open, setOpen] = useState(false);
  const [daily, setDaily] = useState<Daily>(load);
  const previous = useRef({ lines: stats.linesCleared, supers: stats.superHarvests });
  const dailyRef = useRef(daily);
  dailyRef.current = daily;

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
        lines: Math.min(10, current.lines + linesAdded),
        supers: Math.min(2, current.supers + supersAdded),
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
    }, 60000);
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
          <p className="text-xs text-amber-300 mb-3">Novas missões a cada dia • Moedas: <strong>{daily.coins.toLocaleString('pt-BR')} 🌾</strong></p>
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
