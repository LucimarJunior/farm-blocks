import React from 'react';
import { Board, CropType, Piece, PieceShape } from '../types';
import { canPlaceShapeAnywhere } from '../utils/pieces';
import { CropIcon } from './Crops';

interface PieceTrayProps {
  pieces: Piece[];
  board: Board;
  activeDragPieceId: string | null;
  disabled?: boolean;
  rotationCost?: number;
  rotationCurrency?: string;
  onRotatePiece?: (id:string)=>void;
  onPointerDownPiece: (e: React.PointerEvent, piece: Piece, originRect: DOMRect) => void;
}

/**
 * Calculates the optimal cell size for a piece in the tray so it fills
 * the slot comfortably without any clipping or distortion.
 */
export function getOptimalPieceCellSize(shape: PieceShape): number {
  const rows = shape.length;
  const cols = shape[0].length;
  // Available usable dimensions inside each tray slot
  const maxW = 104;
  const maxH = 88;
  const cellW = Math.floor((maxW - (cols - 1) * 3) / cols);
  const cellH = Math.floor((maxH - (rows - 1) * 3) / rows);
  const calculated = Math.min(cellW, cellH);

  // Large, generous sizes for 1x1, 2x1, 2x2, down to 20px for 4x1/5x1
  return Math.max(19, Math.min(36, calculated));
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  pieces,
  board,
  activeDragPieceId,
  disabled = false,
  onPointerDownPiece,
  rotationCost,
  rotationCurrency,
  onRotatePiece,
}) => {
  return (
    <div className={`w-full max-w-[400px] mx-auto px-2 py-1 flex items-center justify-between gap-2.5 z-10 h-[100px] sm:h-[110px] shrink-0 ${disabled ? 'pointer-events-none' : ''}`}>
      {pieces.map((piece, index) => {
        if (piece.used) {
          return (
            <div
              key={piece.id || index}
              className="flex-1 h-full rounded-2xl bg-amber-950/20 border-2 border-dashed border-amber-900/35 flex items-center justify-center opacity-30 pointer-events-none"
            />
          );
        }

        const canFit = canPlaceShapeAnywhere(board, piece.shape);
        const isDragging = activeDragPieceId === piece.id;
        const trayCellSize = getOptimalPieceCellSize(piece.shape);

        return (
          <div
            key={piece.id}
            data-piece-id={piece.id}
            className={`relative flex-1 h-full rounded-2xl bg-amber-950/65 backdrop-blur-sm border-2 border-amber-800/60 shadow-lg p-1.5 flex items-center justify-center select-none transition-all duration-150 touch-none ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : isDragging
                ? 'opacity-0 scale-90'
                : canFit
                ? 'cursor-grab active:cursor-grabbing opacity-100 hover:border-amber-500/80 hover:bg-amber-900/40 active:scale-95'
                : 'cursor-grab opacity-40 grayscale-[35%]'
            }`}
            onPointerDown={(e) => {
              if (disabled) return;
              const target = e.currentTarget;
              const rect = target.getBoundingClientRect();
              onPointerDownPiece(e, piece, rect);
            }}
          >
            <PieceRender shape={piece.shape} crop={piece.crop} cellSize={trayCellSize} />
            {onRotatePiece && rotationCost !== undefined && <button type="button"
              aria-label={`Girar peça por ${rotationCost} ${rotationCurrency}`}
              title={`Girar 90° • ${rotationCost} ${rotationCurrency}`}
              onPointerDown={e=>e.stopPropagation()}
              onClick={e=>{e.stopPropagation();onRotatePiece(piece.id);}}
              disabled={disabled || isDragging}
              className="absolute -top-2 -right-1 z-20 rounded-full bg-yellow-400 text-amber-950 border-2 border-amber-950 px-2 py-1 text-[10px] font-black shadow-lg disabled:opacity-40">↻ {rotationCost}{rotationCurrency}</button>}
          </div>
        );
      })}
    </div>
  );
};

export const PieceRender: React.FC<{
  shape: PieceShape;
  crop: CropType;
  cellSize?: number;
}> = ({ shape, crop, cellSize = 30 }) => {
  const rows = shape.length;
  const cols = shape[0].length;

  return (
    <div
      className="grid gap-0.5 sm:gap-1 justify-center items-center pointer-events-none select-none"
      style={{
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        width: `${cols * cellSize + (cols - 1) * 2}px`,
        height: `${rows * cellSize + (rows - 1) * 2}px`,
      }}
    >
      {shape.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r},${c}`}
            className="w-full h-full flex items-center justify-center"
            style={{
              visibility: cell === 1 ? 'visible' : 'hidden',
            }}
          >
            {cell === 1 && (
              <div
                className="w-full h-full p-0.5 soil-tile rounded-md sm:rounded-lg shadow-sm overflow-hidden flex items-center justify-center"
                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
              >
                <CropIcon crop={crop} animate={false} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
