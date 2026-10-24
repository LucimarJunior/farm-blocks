import React from 'react';
import { Board as BoardType, HarvestLevel, HarvestLineResult, HoverPreviewData, ScorePopup } from '../types';
import { CropIcon } from './Crops';
import { HarvesterAnimation } from './HarvesterAnimation';
import { HarvestParticles, ParticleTrigger } from './HarvestParticles';

interface BoardProps {
  board: BoardType;
  boardRef: React.RefObject<HTMLDivElement | null>;
  hoverPreview: HoverPreviewData | null;
  clearingCells: Set<string>;
  activeHarvesters: HarvestLineResult[];
  particleTriggers: ParticleTrigger[];
  scorePopups: ScorePopup[];
}

export const Board: React.FC<BoardProps> = ({
  board,
  boardRef,
  hoverPreview,
  clearingCells,
  activeHarvesters,
  particleTriggers,
  scorePopups,
}) => {
  // Pre-calculate preview cell map
  const previewMap = new Map<string, { isValid: boolean; crop: HoverPreviewData['crop'] }>();
  if (hoverPreview) {
    const { startRow, startCol, shape, crop, isValid } = hoverPreview;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          const br = startRow + r;
          const bc = startCol + c;
          if (br >= 0 && br < 8 && bc >= 0 && bc < 8) {
            previewMap.set(`${br},${bc}`, { isValid, crop });
          }
        }
      }
    }
  }

  // Only calculate completed lines preview during active piece dragging
  const rowHighlightLevel = new Map<number, HarvestLevel>();
  const colHighlightLevel = new Map<number, HarvestLevel>();

  if (hoverPreview && hoverPreview.isValid && hoverPreview.previewLines && activeHarvesters.length === 0) {
    for (const line of hoverPreview.previewLines) {
      if (line.orientation === 'row') {
        const current = rowHighlightLevel.get(line.index);
        if (!current || line.level === 'super' || (line.level === 'good' && current === 'normal')) {
          rowHighlightLevel.set(line.index, line.level);
        }
      } else {
        const current = colHighlightLevel.get(line.index);
        if (!current || line.level === 'super' || (line.level === 'good' && current === 'normal')) {
          colHighlightLevel.set(line.index, line.level);
        }
      }
    }
  }

  const boardWidth = boardRef.current ? boardRef.current.offsetWidth : 320;
  const boardHeight = boardRef.current ? boardRef.current.offsetHeight : 320;

  return (
    <div
      className="relative aspect-square mx-auto p-1.5 sm:p-2 rounded-2xl wood-border shrink-0 select-none shadow-2xl"
      style={{
        width: 'min(92vw, calc(100dvh - 200px), 365px)',
        height: 'min(92vw, calc(100dvh - 200px), 365px)',
      }}
    >
      {/* Inner soil bed container */}
      <div
        ref={boardRef}
        className="relative w-full h-full grid grid-cols-8 grid-rows-8 gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-amber-950/90 rounded-xl overflow-hidden shadow-inner border border-amber-900/60"
        style={{ touchAction: 'none' }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const preview = previewMap.get(key);

            // Determine if this cell is part of a completed line in preview
            const rowLvl = rowHighlightLevel.get(r);
            const colLvl = colHighlightLevel.get(c);
            let lineLevel: HarvestLevel | null = null;
            if (rowLvl === 'super' || colLvl === 'super') {
              lineLevel = 'super';
            } else if (rowLvl === 'good' || colLvl === 'good') {
              lineLevel = 'good';
            } else if (rowLvl === 'normal' || colLvl === 'normal') {
              lineLevel = 'normal';
            }

            return (
              <div
                key={key}
                data-row={r}
                data-col={c}
                className="relative flex items-center justify-center rounded-md sm:rounded-lg soil-tile overflow-hidden select-none"
              >
                {/* Soil furrows texture */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#a16207_1px,transparent_1px)] [background-size:5px_5px]" />

                {/* Occupied Crop Tile (disappears immediately when harvester cutter reaches it) */}
                {cell && (
                  <div
                    className={`w-full h-full p-0.5 transition-opacity duration-75 ${
                      preview && preview.isValid ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    <CropIcon crop={cell.crop} animate={true} />
                  </div>
                )}

                {/* Discrete Completed Line Preview Highlight (only during dragging) */}
                {lineLevel && !preview && (
                  <div
                    className={`absolute inset-0 rounded-md sm:rounded-lg pointer-events-none z-10 transition-all duration-150 ${
                      lineLevel === 'super'
                        ? 'bg-yellow-300/35 border-2 border-yellow-300 ring-2 ring-yellow-300/70 shadow-[0_0_12px_rgba(253,224,71,0.7)] animate-pulse'
                        : lineLevel === 'good'
                        ? 'bg-amber-400/25 border-2 border-amber-300 ring-2 ring-amber-300/60 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-emerald-500/20 border-2 border-emerald-400/80 ring-2 ring-emerald-400/50 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                    }`}
                  />
                )}

                {/* Hover Preview Tile */}
                {preview && (
                  <div
                    className={`absolute inset-0 rounded-md sm:rounded-lg flex items-center justify-center transition-all duration-75 z-20 ${
                      preview.isValid
                        ? lineLevel === 'super'
                          ? 'border-2 border-yellow-300 bg-yellow-400/35 shadow-[0_0_14px_rgba(253,224,71,0.85)]'
                          : lineLevel === 'good'
                          ? 'border-2 border-amber-300 bg-amber-400/30 shadow-[0_0_10px_rgba(251,191,36,0.7)]'
                          : 'border-2 border-emerald-400 bg-emerald-500/25 shadow-[0_0_10px_rgba(52,211,153,0.7)]'
                        : 'border-2 border-red-500 bg-red-500/35 shadow-[0_0_10px_rgba(239,68,68,0.7)]'
                    }`}
                  >
                    {preview.isValid ? (
                      <div className="w-full h-full p-0.5 opacity-85 scale-95 drop-shadow-md">
                        <CropIcon crop={preview.crop} animate={false} />
                      </div>
                    ) : !cell ? (
                      <div className="w-full h-full p-0.5 opacity-50 grayscale-[40%] scale-90">
                        <CropIcon crop={preview.crop} animate={false} />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Agricultural Particles Canvas (Leaves, Chaff, Grain) */}
        <HarvestParticles triggers={particleTriggers} />

        {/* Combine Harvesters Sweeping through completed lines */}
        {activeHarvesters.map((harvester, idx) => (
          <HarvesterAnimation
            key={`${harvester.orientation}_${harvester.index}_${idx}`}
            line={harvester}
            boardRect={{ width: boardWidth, height: boardHeight }}
          />
        ))}

        {/* Floating Score Indicators */}
        {scorePopups.map((popup) => (
          <div
            key={popup.id}
            className="absolute z-50 pointer-events-none animate-float-badge flex flex-col items-center"
            style={{
              left: `${popup.x}%`,
              top: `${popup.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span
              className="text-base sm:text-xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-2 py-0.5 rounded-full"
              style={{ color: popup.color }}
            >
              {popup.text}
            </span>
            {popup.subText && (
              <span className="text-[10px] sm:text-xs font-extrabold text-amber-200 drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] uppercase tracking-wide">
                {popup.subText}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
