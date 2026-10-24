import { Board, CropType, HarvestLineResult, HarvestResult, PieceShape, PreviewLineHighlight } from '../types';

/**
 * Evaluates the board for completed rows and columns, calculates scores,
 * detects Boa Colheita and Super Colheita, and returns all cleared coordinates.
 * CRITICAL: Checks all 8 rows and all 8 columns simultaneously BEFORE clearing.
 */
export function evaluateHarvest(board: Board): HarvestResult | null {
  const completeRows: number[] = [];
  const completeCols: number[] = [];

  // 1. Check all rows
  for (let r = 0; r < 8; r++) {
    let rowFilled = true;
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === null) {
        rowFilled = false;
        break;
      }
    }
    if (rowFilled) {
      completeRows.push(r);
    }
  }

  // 2. Check all columns
  for (let c = 0; c < 8; c++) {
    let colFilled = true;
    for (let r = 0; r < 8; r++) {
      if (board[r][c] === null) {
        colFilled = false;
        break;
      }
    }
    if (colFilled) {
      completeCols.push(c);
    }
  }

  const totalLines = completeRows.length + completeCols.length;
  if (totalLines === 0) {
    return null;
  }

  const lines: HarvestLineResult[] = [];
  let totalPoints = 0;

  // Process rows
  for (const r of completeRows) {
    const cropCounts: Record<CropType, number> = { corn: 0, wheat: 0, soy: 0 };
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c];
      if (cell) {
        cropCounts[cell.crop]++;
      }
    }

    let dominantCrop: CropType | null = null;
    let maxCount = 0;
    for (const crop of ['corn', 'wheat', 'soy'] as CropType[]) {
      if (cropCounts[crop] > maxCount) {
        maxCount = cropCounts[crop];
        dominantCrop = crop;
      }
    }

    let level: HarvestLineResult['level'] = 'normal';
    let linePoints = 100; // Colheita Normal

    if (maxCount === 8) {
      level = 'super';
      linePoints = 100 + 200; // Super Colheita (+200 bonus)
    } else if (maxCount >= 6) {
      level = 'good';
      linePoints = 100 + 50; // Boa Colheita (+50 bonus)
    }

    totalPoints += linePoints;
    lines.push({
      orientation: 'row',
      index: r,
      level,
      dominantCrop,
      cropCounts,
      points: linePoints,
    });
  }

  // Process columns
  for (const c of completeCols) {
    const cropCounts: Record<CropType, number> = { corn: 0, wheat: 0, soy: 0 };
    for (let r = 0; r < 8; r++) {
      const cell = board[r][c];
      if (cell) {
        cropCounts[cell.crop]++;
      }
    }

    let dominantCrop: CropType | null = null;
    let maxCount = 0;
    for (const crop of ['corn', 'wheat', 'soy'] as CropType[]) {
      if (cropCounts[crop] > maxCount) {
        maxCount = cropCounts[crop];
        dominantCrop = crop;
      }
    }

    let level: HarvestLineResult['level'] = 'normal';
    let linePoints = 100;

    if (maxCount === 8) {
      level = 'super';
      linePoints = 100 + 200;
    } else if (maxCount >= 6) {
      level = 'good';
      linePoints = 100 + 50;
    }

    totalPoints += linePoints;
    lines.push({
      orientation: 'col',
      index: c,
      level,
      dominantCrop,
      cropCounts,
      points: linePoints,
    });
  }

  // Combo multiplier bonus if multiple lines cleared in one turn
  let comboBonus = 0;
  if (totalLines > 1) {
    comboBonus = (totalLines - 1) * 75; // Extra rewarding combo bonus
    totalPoints += comboBonus;
  }

  // Collect all unique cell coordinates to clear
  const clearedSet = new Set<string>();
  const clearedCells: { r: number; c: number }[] = [];

  for (const r of completeRows) {
    for (let c = 0; c < 8; c++) {
      const key = `${r},${c}`;
      if (!clearedSet.has(key)) {
        clearedSet.add(key);
        clearedCells.push({ r, c });
      }
    }
  }

  for (const c of completeCols) {
    for (let r = 0; r < 8; r++) {
      const key = `${r},${c}`;
      if (!clearedSet.has(key)) {
        clearedSet.add(key);
        clearedCells.push({ r, c });
      }
    }
  }

  return {
    lines,
    clearedCells,
    totalPoints,
    comboCount: totalLines,
    bonusPoints: comboBonus,
  };
}

/**
 * Creates an empty 8x8 board
 */
export function createEmptyBoard(): Board {
  return Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
}

/**
 * Evaluates simulated line completions during piece drag preview
 */
export function getPreviewCompletedLines(
  board: Board,
  shape: PieceShape,
  crop: CropType,
  startRow: number,
  startCol: number
): PreviewLineHighlight[] {
  const completedLines: PreviewLineHighlight[] = [];

  // Check each row
  for (let r = 0; r < 8; r++) {
    let rowFilled = true;
    const cropCounts: Record<CropType, number> = { corn: 0, wheat: 0, soy: 0 };

    for (let c = 0; c < 8; c++) {
      const shapeR = r - startRow;
      const shapeC = c - startCol;
      const isFromShape =
        shapeR >= 0 &&
        shapeR < shape.length &&
        shapeC >= 0 &&
        shapeC < shape[0].length &&
        shape[shapeR][shapeC] === 1;

      if (isFromShape) {
        cropCounts[crop]++;
      } else if (board[r][c] !== null) {
        cropCounts[board[r][c]!.crop]++;
      } else {
        rowFilled = false;
        break;
      }
    }

    if (rowFilled) {
      const maxCount = Math.max(cropCounts.corn, cropCounts.wheat, cropCounts.soy);
      let level: 'normal' | 'good' | 'super' = 'normal';
      if (maxCount === 8) {
        level = 'super';
      } else if (maxCount >= 6) {
        level = 'good';
      }
      completedLines.push({ orientation: 'row', index: r, level });
    }
  }

  // Check each column
  for (let c = 0; c < 8; c++) {
    let colFilled = true;
    const cropCounts: Record<CropType, number> = { corn: 0, wheat: 0, soy: 0 };

    for (let r = 0; r < 8; r++) {
      const shapeR = r - startRow;
      const shapeC = c - startCol;
      const isFromShape =
        shapeR >= 0 &&
        shapeR < shape.length &&
        shapeC >= 0 &&
        shapeC < shape[0].length &&
        shape[shapeR][shapeC] === 1;

      if (isFromShape) {
        cropCounts[crop]++;
      } else if (board[r][c] !== null) {
        cropCounts[board[r][c]!.crop]++;
      } else {
        colFilled = false;
        break;
      }
    }

    if (colFilled) {
      const maxCount = Math.max(cropCounts.corn, cropCounts.wheat, cropCounts.soy);
      let level: 'normal' | 'good' | 'super' = 'normal';
      if (maxCount === 8) {
        level = 'super';
      } else if (maxCount >= 6) {
        level = 'good';
      }
      completedLines.push({ orientation: 'col', index: c, level });
    }
  }

  return completedLines;
}

