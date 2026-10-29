import React from 'react';
import { GameStats } from '../types';

export type BonusState = { lines: number; supers: number; maxCombo: number; awarded: boolean[]; bonusPoints: number };
export const initialBonus = (): BonusState => ({ lines: 0, supers: 0, maxCombo: 0, awarded: [false, false, false], bonusPoints: 0 });
export const BONUS_KEY = 'farm_blocks_round_bonus_v1';
export const bonusMissions = [
  { icon: '🌽', label: 'Colha 5 linhas', target: 5, reward: 150 },
  { icon: '🚜', label: 'Faça 1 Super Colheita', target: 1, reward: 250 },
  { icon: '🔥', label: 'Faça um combo de 3 linhas', target: 3, reward: 300 },
];
export function updateBonus(current: BonusState, stats: GameStats): { next: BonusState; earned: number; completed: string[] } {
  const values = [stats.linesCleared, stats.superHarvests, stats.maxCombo];
  const awarded = [...current.awarded];
  let earned = 0;
  const completed: string[] = [];
  bonusMissions.forEach((mission, index) => {
    if (!awarded[index] && values[index] >= mission.target) {
      awarded[index] = true;
      earned += mission.reward;
      completed.push(mission.label);
    }
  });
  return { next: { lines: stats.linesCleared, supers: stats.superHarvests, maxCombo: stats.maxCombo, awarded, bonusPoints: current.bonusPoints + earned }, earned, completed };
}
export function RoundBonus({ state, onClose }: { state: BonusState; onClose: () => void }) {
  const values = [state.lines, state.supers, state.maxCombo];
  return <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <section role="dialog" aria-modal="true" aria-label="Bônus de Colheita" className="w-full max-w-sm bg-amber-950 border-2 border-yellow-600 rounded-3xl p-5 text-amber-100 shadow-2xl">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-black text-yellow-300">🚜 BÔNUS DE COLHEITA</h2>
        <button onClick={onClose} className="bg-amber-900 rounded-lg px-3 py-1.5" aria-label="Fechar">✕</button>
      </div>
      <p className="text-xs text-amber-300 mb-3">Complete durante esta partida para ganhar pontos imediatamente!</p>
      <div className="space-y-3">
        {bonusMissions.map((mission, i) => {
          const value = Math.min(values[i], mission.target);
          return <div key={mission.label} className="rounded-xl border border-amber-700 bg-amber-900/60 p-3">
            <div className="flex justify-between gap-2 text-sm font-bold"><span>{mission.icon} {mission.label}</span><span className="text-yellow-300 shrink-0">+{mission.reward}</span></div>
            <div className="flex justify-between text-xs mt-2 mb-1"><span>{value}/{mission.target}</span><span>{state.awarded[i] ? 'Concluída ✓' : 'Em andamento'}</span></div>
            <div className="h-2 rounded-full bg-amber-950 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${value / mission.target * 100}%` }} /></div>
          </div>;
        })}
      </div>
      <p className="text-center text-yellow-300 font-black mt-4">Bônus conquistados: +{state.bonusPoints.toLocaleString('pt-BR')} pontos</p>
    </section>
  </div>;
}
