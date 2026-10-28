import React, { useEffect, useState } from 'react';
import { saveWorldRecord } from '../utils/worldRanking';
import { CropIcon } from './Crops';
import { Crown, Play, RotateCcw, X, Sparkles, Award } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, isFirstTime }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-amber-950 border-2 border-amber-600 rounded-3xl p-5 shadow-2xl text-amber-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/80">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚜</span>
            <div>
              <h2 className="text-xl font-black text-white leading-tight">
                {isFirstTime ? 'Bem-vindo ao Farm Blocks!' : 'Como Jogar'}
              </h2>
              <p className="text-xs text-amber-300 font-semibold">Colheita Infinita</p>
            </div>
          </div>
          {!isFirstTime && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-amber-900/60 hover:bg-amber-800 flex items-center justify-center text-amber-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-4 py-4 text-xs sm:text-sm">
          {/* Objective */}
          <div className="bg-amber-900/40 p-3 rounded-2xl border border-amber-800/50">
            <p className="font-bold text-white mb-1 flex items-center gap-1.5">
              <span>🎯</span> Objetivo do Jogo
            </p>
            <p className="text-amber-200/90 leading-relaxed">
              Encaixe as peças no tabuleiro 8×8 para completar linhas ou colunas inteiras e colher as plantações. Cada quadrado colocado vale <strong className="text-white">+1 ponto</strong>.
            </p>
          </div>

          {/* 3 Crops */}
          <div>
            <h3 className="font-extrabold text-amber-300 uppercase tracking-wider text-xs mb-2">
              As 3 Culturas Agrícolas
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-amber-900/60 border border-yellow-600/40 rounded-xl p-2 flex flex-col items-center text-center">
                <div className="w-10 h-10 mb-1">
                  <CropIcon crop="corn" animate={false} />
                </div>
                <span className="font-black text-yellow-300 text-xs">MILHO</span>
                <span className="text-[10px] text-amber-200/80">Espigas amarelas</span>
              </div>

              <div className="bg-amber-900/60 border border-amber-600/40 rounded-xl p-2 flex flex-col items-center text-center">
                <div className="w-10 h-10 mb-1">
                  <CropIcon crop="wheat" animate={false} />
                </div>
                <span className="font-black text-amber-400 text-xs">TRIGO</span>
                <span className="text-[10px] text-amber-200/80">Espigas douradas</span>
              </div>

              <div className="bg-amber-900/60 border border-emerald-600/40 rounded-xl p-2 flex flex-col items-center text-center">
                <div className="w-10 h-10 mb-1">
                  <CropIcon crop="soy" animate={false} />
                </div>
                <span className="font-black text-emerald-300 text-xs">SOJA</span>
                <span className="text-[10px] text-amber-200/80">Folhas e vagens</span>
              </div>
            </div>
          </div>

          {/* Harvest System */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-amber-300 uppercase tracking-wider text-xs">
              Sistema de Colheita
            </h3>

            <div className="p-2.5 rounded-xl bg-amber-900/30 border border-amber-800/40 flex items-start gap-2.5">
              <span className="text-lg">🌾</span>
              <div>
                <span className="font-bold text-white text-xs block">Colheita Normal (+100 pts)</span>
                <span className="text-amber-200/80 text-[11px]">
                  Complete 8 quadrados na linha ou coluna (culturas misturadas).
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-600/50 flex items-start gap-2.5">
              <span className="text-lg">🌽</span>
              <div>
                <span className="font-bold text-emerald-300 text-xs block">Boa Colheita (+150 pts)</span>
                <span className="text-amber-200/80 text-[11px]">
                  Complete a linha com <strong>6 ou 7 quadrados da mesma cultura</strong> (+50 pts de bônus).
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-yellow-950/60 border border-yellow-500/60 flex items-start gap-2.5">
              <span className="text-lg">🚜</span>
              <div>
                <span className="font-bold text-yellow-300 text-xs block">Super Colheita (+300 pts)</span>
                <span className="text-amber-200/80 text-[11px]">
                  Complete a linha com <strong>todos os 8 quadrados da mesma cultura</strong> (+200 pts de bônus) e veja a colheitadeira passar!
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-orange-950/50 border border-orange-500/50 flex items-start gap-2.5">
              <span className="text-lg">🔥</span>
              <div>
                <span className="font-bold text-orange-300 text-xs block">Combos Multiplicadores</span>
                <span className="text-amber-200/80 text-[11px]">
                  Complete múltiplas linhas simultâneas para ganhar bônus extras de combo!
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>{isFirstTime ? 'COMEÇAR A COLHEITA' : 'VOLTAR AO JOGO'}</span>
        </button>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  isNewRecord: boolean;
  linesCleared: number;
  goodHarvests: number;
  superHarvests: number;
  maxCombo: number;
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  highScore,
  isNewRecord,
  linesCleared,
  goodHarvests,
  superHarvests,
  maxCombo,
  onPlayAgain,
}) => {
  const [name, setName] = useState(() => localStorage.getItem('farm_blocks_player_name') || '');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (isOpen) setStatus(''); }, [isOpen]);
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setStatus('');
    try {
      await saveWorldRecord(name, highScore);
      localStorage.setItem('farm_blocks_player_name', name.trim());
      setStatus('Recorde registrado no ranking mundial!');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Falha ao salvar o recorde.');
    } finally { setSaving(false); }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-amber-950 border-4 border-amber-600 rounded-3xl p-5 shadow-2xl text-center flex flex-col items-center max-h-[90dvh] overflow-y-auto">
        {/* Banner */}
        <div className="w-16 h-16 rounded-2xl bg-amber-900 border-2 border-amber-500 flex items-center justify-center text-3xl mb-2 shadow-lg">
          🌾
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
          FIM DE JOGO
        </h2>
        <p className="text-xs text-amber-300 font-semibold mb-4">
          Não há mais espaço para encaixar as peças!
        </p>

        {/* New Record Callout */}
        {isNewRecord && (
          <div className="w-full mb-3 py-1.5 px-3 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-amber-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>NOVO RECORDE DA FAZENDA!</span>
            <Crown className="w-4 h-4 fill-amber-950" />
          </div>
        )}

        {/* Score Box */}
        <div className="w-full bg-amber-900/60 border-2 border-amber-700/60 rounded-2xl p-4 mb-4">
          <span className="text-xs font-extrabold text-amber-300 uppercase tracking-widest block mb-0.5">
            PONTUAÇÃO FINAL
          </span>
          <span className="text-4xl font-black text-white tracking-tight tabular-nums">
            {score.toLocaleString('pt-BR')}
          </span>

          <div className="mt-2 pt-2 border-t border-amber-800/80 flex items-center justify-center gap-1 text-xs text-amber-200">
            <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>Melhor Recorde:</span>
            <strong className="text-yellow-300 font-bold tabular-nums">
              {highScore.toLocaleString('pt-BR')}
            </strong>
          </div>
        </div>

        {/* Harvest Stats Breakdown */}
        <div className="w-full grid grid-cols-2 gap-2 text-left mb-5">
          <div className="bg-amber-900/40 p-2 rounded-xl border border-amber-800/50">
            <span className="text-[10px] text-amber-300/80 font-bold uppercase block">Linhas Colhidas</span>
            <span className="text-base font-extrabold text-white tabular-nums">{linesCleared}</span>
          </div>

          <div className="bg-amber-900/40 p-2 rounded-xl border border-amber-800/50">
            <span className="text-[10px] text-amber-300/80 font-bold uppercase block">Maior Combo</span>
            <span className="text-base font-extrabold text-orange-400 tabular-nums">
              {maxCombo > 1 ? `x${maxCombo}` : '-'}
            </span>
          </div>

          <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] text-emerald-300/90 font-bold uppercase block">Boas Colheitas</span>
            <span className="text-base font-extrabold text-emerald-300 tabular-nums">{goodHarvests}</span>
          </div>

          <div className="bg-yellow-950/40 p-2 rounded-xl border border-yellow-600/40">
            <span className="text-[10px] text-yellow-300/90 font-bold uppercase block">Super Colheitas</span>
            <span className="text-base font-extrabold text-yellow-300 tabular-nums">{superHarvests}</span>
          </div>
        </div>

        <div className="w-full mb-4 text-left">
          <label htmlFor="world-player-name" className="block text-xs font-bold text-amber-200 mb-2">Seu apelido no ranking mundial</label>
          <input id="world-player-name" maxLength={20} value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu apelido" className="w-full rounded-xl bg-white text-amber-950 px-3 py-3" />
          <button type="button" disabled={saving || !name.trim()} onClick={handleSave}
            className="w-full mt-2 py-3 rounded-xl bg-yellow-500 text-amber-950 font-black disabled:opacity-50">
            {saving ? 'SALVANDO...' : '🏆 SALVAR NO RANKING MUNDIAL'}
          </button>
          {status && <p role="status" className="text-xs text-amber-200 mt-2 text-center">{status}</p>}
        </div>

        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          <RotateCcw className="w-5 h-5" />
          <span>JOGAR NOVAMENTE</span>
        </button>
      </div>
    </div>
  );
};
