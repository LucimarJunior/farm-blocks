import React, { useEffect, useState } from 'react';
import { Trophy, X, RefreshCw } from 'lucide-react';

type ScoreRow = { id: string; player_name: string; score: number; created_at: string };
const SUPABASE_URL = 'https://grggbuwkhxgygiyhgfwa.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_JLoUriHwbRcXL4czl6yUmw_InCUEYwD';

export function RankingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [period, setPeriod] = useState<'world' | 'weekly' | 'monthly'>('world');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetch(period === 'world'
      ? `${SUPABASE_URL}/rest/v1/farm_blocks_scores?select=id,player_name,score,created_at&order=score.desc,created_at.asc&limit=10`
      : `${SUPABASE_URL}/rest/v1/rpc/farm_blocks_period_ranking`, {
      method: period === 'world' ? 'GET' : 'POST',
      headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
      ...(period === 'world' ? {} : { body: JSON.stringify({ p_period: period }) }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Falha ao consultar ranking');
        return response.json();
      })
      .then((rows: ScoreRow[]) => setScores(rows))
      .catch((err) => {
        if (err.name !== 'AbortError') setError('Não foi possível carregar o ranking. Tente novamente.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [isOpen, refresh, period]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <section role="dialog" aria-modal="true" aria-label="Rankings" className="w-full max-w-sm bg-amber-950 border-2 border-amber-600 rounded-3xl p-5 text-amber-100 shadow-2xl max-h-[85dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-xl font-black text-yellow-300"><Trophy size={22}/> RANKINGS</h2>
          <button onClick={onClose} aria-label="Fechar ranking" className="rounded-lg bg-amber-900 p-2"><X size={18}/></button>
        </div>
        <div className="grid grid-cols-3 gap-1 mb-4">{([['world', '🌍 Mundial'], ['weekly', '📅 Semanal'], ['monthly', '🗓️ Mensal']] as const).map(([value, label]) => <button key={value} onClick={() => setPeriod(value)} className={`rounded-lg py-2 text-xs font-black ${period === value ? 'bg-yellow-400 text-amber-950' : 'bg-amber-900 text-amber-200'}`}>{label}</button>)}</div>
        {loading ? <p className="text-center py-8">Carregando recordes...</p>
          : error ? <p role="alert" className="text-center py-8 text-rose-300">{error}</p>
          : scores.length === 0 ? <p className="text-center py-8">Ainda não existem pontuações neste ranking.</p>
          : <ol className="space-y-2">{scores.map((row, index) => (
            <li key={row.id || index} className="flex justify-between gap-2 bg-amber-900/60 rounded-xl p-3">
              <span className="truncate">{index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `${index + 1}º`} {row.player_name}</span>
              <strong className="shrink-0 text-yellow-300">{row.score.toLocaleString('pt-BR')} pts</strong>
            </li>
          ))}</ol>}
        <button onClick={() => setRefresh((n) => n + 1)} className="w-full mt-4 py-3 rounded-xl bg-emerald-700 font-bold flex items-center justify-center gap-2"><RefreshCw size={16}/> Atualizar ranking</button>
        <p className="text-center text-xs text-amber-300/70 mt-3">{period === 'world' ? 'Mundial: maior pontuação em uma partida.' : period === 'weekly' ? 'Semanal: soma das partidas finalizadas de segunda a domingo (Brasília).' : 'Mensal: soma das partidas finalizadas neste mês (Brasília).'}</p>
      </section>
    </div>
  );
}
