import React from 'react';
import { GameStats } from '../types';
import { DailyMissions } from './DailyMissions';
import { Crown, Volume2, VolumeX, RotateCcw, BookOpen, Trophy } from 'lucide-react';

interface HUDProps {
  score: number;
  highScore: number;
  stats: GameStats;
  onOpenBonus: () => void;
  onOpenAchievements: () => void;
  onOpenGarage: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  onOpenRules: () => void;
  onOpenRanking: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  stats,
  onOpenBonus,
  onOpenAchievements,
  onOpenGarage,
  soundEnabled,
  onToggleSound,
  onRestart,
  onOpenRules,
  onOpenRanking,
}) => {
  return (
    <header className="w-full max-w-[420px] mx-auto px-2.5 pt-1 pb-0.5 z-20 flex flex-col gap-1 shrink-0">
      {/* Top Title and Actions Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-amber-700/80 border border-amber-500/60 flex items-center justify-center shadow-sm">
            <span className="text-sm">🌾</span>
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-none">
              FARM BLOCKS
            </h1>
            <span className="text-[9px] font-bold text-amber-300 drop-shadow uppercase tracking-wider block">
              Colheita Infinita
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button onClick={onOpenBonus} title="Bônus de Colheita" aria-label="Abrir bônus de colheita" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/70 border border-yellow-600/60 text-yellow-200 flex items-center justify-center shadow-sm text-sm">🚜</button>
          <button onClick={onOpenGarage} title="Garagem e Loja" aria-label="Abrir garagem e loja" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/70 border border-yellow-600/60 text-yellow-200 flex items-center justify-center shadow-sm text-sm">🛒</button>
          <button onClick={onOpenAchievements} title="Conquistas" aria-label="Abrir conquistas" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/70 border border-yellow-600/60 text-yellow-200 flex items-center justify-center shadow-sm text-sm">🏅</button>
          <DailyMissions score={score} stats={stats} />
          <button onClick={onOpenRanking} title="Ranking Mundial" aria-label="Abrir ranking mundial" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/70 border border-yellow-600/60 text-yellow-300 flex items-center justify-center shadow-sm"><Trophy className="w-3.5 h-3.5" /></button>
          <button
            onClick={onOpenRules}
            title="Como Jogar"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/70 border border-amber-700/60 hover:bg-amber-900/80 text-amber-200 flex items-center justify-center transition-all shadow-sm active:scale-95"
            aria-label="Regras do jogo"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar som' : 'Ativar som'}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/70 border border-amber-700/60 hover:bg-amber-900/80 text-amber-200 flex items-center justify-center transition-all shadow-sm active:scale-95"
            aria-label="Alternar som"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
          </button>

          <button
            onClick={onRestart}
            title="Reiniciar Partida"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/70 border border-amber-700/60 hover:bg-amber-900/80 text-amber-200 flex items-center justify-center transition-all shadow-sm active:scale-95"
            aria-label="Reiniciar jogo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slim Score and Record Board */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* Current Score */}
        <div className="bg-amber-950/80 backdrop-blur-sm border border-amber-700/60 rounded-lg px-2.5 py-1 flex items-center justify-between shadow-md">
          <span className="text-[10px] font-extrabold text-amber-300/90 uppercase tracking-wider">
            PONTOS
          </span>
          <span className="text-base sm:text-lg font-black text-white tracking-tight tabular-nums drop-shadow-sm">
            {score.toLocaleString('pt-BR')}
          </span>
        </div>

        {/* Record (High Score) */}
        <div className="bg-amber-950/80 backdrop-blur-sm border border-yellow-600/70 rounded-lg px-2.5 py-1 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-1 text-[10px] font-extrabold text-yellow-300 uppercase tracking-wider">
            <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>RECORDE</span>
          </div>
          <span className="text-base sm:text-lg font-black text-yellow-100 tracking-tight tabular-nums drop-shadow-sm">
            {highScore.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    </header>
  );
};
