import React from 'react';

export type AchievementData = {
  games: number; cornLines: number; superHarvests: number; maxCombo: number;
  bestScore: number; lifetimePoints: number; countedMatches: string[];
  unlocked: Record<string, string>;
};
const KEY = 'farm_blocks_achievements_v1';
export const achievements = [
  { id: 'first', icon: '🌱', title: 'Primeiro Plantio', description: 'Finalize sua primeira partida', target: 1, field: 'games' },
  { id: 'corn', icon: '🌽', title: 'Rei do Milho', description: 'Colha 50 linhas completas de milho', target: 50, field: 'cornLines' },
  { id: 'super', icon: '🚜', title: 'Mestre da Colheita', description: 'Realize 25 Super Colheitas', target: 25, field: 'superHarvests' },
  { id: 'combo', icon: '🔥', title: 'Rei dos Combos', description: 'Faça um combo de 4 linhas', target: 4, field: 'maxCombo' },
  { id: 'bronze', icon: '🥉', title: 'Fazenda de Bronze', description: 'Faça 5.000 pontos em uma partida', target: 5000, field: 'bestScore' },
  { id: 'silver', icon: '🥈', title: 'Fazenda de Prata', description: 'Faça 10.000 pontos em uma partida', target: 10000, field: 'bestScore' },
  { id: 'gold', icon: '🥇', title: 'Fazenda de Ouro', description: 'Faça 20.000 pontos em uma partida', target: 20000, field: 'bestScore' },
  { id: 'legend', icon: '🏆', title: 'Lenda da Colheita', description: 'Acumule 100.000 pontos em partidas finalizadas', target: 100000, field: 'lifetimePoints' },
] as const;
export const emptyAchievements = (): AchievementData => ({
  games: 0, cornLines: 0, superHarvests: 0, maxCombo: 0, bestScore: 0,
  lifetimePoints: 0, countedMatches: [], unlocked: {},
});
export function loadAchievements(): AchievementData {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved.games === 'number' && saved.unlocked) return { ...emptyAchievements(), ...saved };
  } catch { /* ignore */ }
  return emptyAchievements();
}
export function advanceAchievements(old: AchievementData, event: {
  cornLines?: number; superHarvests?: number; combo?: number; score?: number;
  finishedMatch?: { id: string; score: number };
}): { next: AchievementData; newTitles: string[] } {
  const next: AchievementData = { ...old, countedMatches: [...old.countedMatches], unlocked: { ...old.unlocked } };
  next.cornLines += event.cornLines || 0;
  next.superHarvests += event.superHarvests || 0;
  next.maxCombo = Math.max(next.maxCombo, event.combo || 0);
  next.bestScore = Math.max(next.bestScore, event.score || 0);
  if (event.finishedMatch && !next.countedMatches.includes(event.finishedMatch.id)) {
    next.countedMatches.push(event.finishedMatch.id);
    next.games += 1;
    next.lifetimePoints += event.finishedMatch.score;
    next.bestScore = Math.max(next.bestScore, event.finishedMatch.score);
  }
  const newTitles: string[] = [];
  for (const a of achievements) {
    if (!next.unlocked[a.id] && next[a.field] >= a.target) {
      next.unlocked[a.id] = new Date().toISOString();
      newTitles.push(a.title);
    }
  }
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return { next, newTitles };
}
export function AchievementsModal({ data, onClose }: { data: AchievementData; onClose: () => void }) {
  const count = achievements.filter(a => data.unlocked[a.id]).length;
  return <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <section role="dialog" aria-modal="true" aria-label="Álbum de conquistas" className="w-full max-w-sm max-h-[85dvh] overflow-y-auto bg-amber-950 border-2 border-yellow-600 rounded-3xl p-5 text-amber-100 shadow-2xl">
      <div className="flex justify-between items-center mb-3">
        <div><h2 className="text-xl font-black text-yellow-300">🏅 CONQUISTAS</h2><p className="text-xs text-amber-300">{count} de {achievements.length} medalhas desbloqueadas</p></div>
        <button onClick={onClose} aria-label="Fechar conquistas" className="bg-amber-900 rounded-lg px-3 py-1.5">✕</button>
      </div>
      <div className="space-y-2">{achievements.map(a => {
        const unlocked = data.unlocked[a.id];
        const value = Math.min(data[a.field], a.target);
        return <div key={a.id} className={`rounded-xl p-3 border ${unlocked ? 'bg-emerald-950/60 border-yellow-500/70' : 'bg-amber-900/40 border-amber-800/70'}`}>
          <div className="flex gap-3 items-center"><span className={`text-3xl ${unlocked ? '' : 'grayscale opacity-40'}`}>{a.icon}</span><div className="flex-1 min-w-0">
            <div className="font-black text-sm">{a.title} {unlocked ? '✓' : '🔒'}</div>
            <p className="text-xs text-amber-200">{a.description}</p>
            {unlocked ? <p className="text-[10px] text-emerald-300">Desbloqueada em {new Date(unlocked).toLocaleDateString('pt-BR')}</p> : <p className="text-[10px] text-amber-300">{value.toLocaleString('pt-BR')} / {a.target.toLocaleString('pt-BR')}</p>}
          </div></div>
          <div className="h-1.5 rounded-full bg-amber-950 mt-2 overflow-hidden"><div className="h-full bg-yellow-500" style={{ width: `${100 * value / a.target}%` }} /></div>
        </div>;
      })}</div>
      <p className="text-center text-[11px] text-amber-300/80 mt-3">Conquistas salvas neste navegador.</p>
    </section>
  </div>;
}
