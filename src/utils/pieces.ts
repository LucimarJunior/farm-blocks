import { Board, CropType, Piece, PieceShape } from '../types';

// Standard polyomino piece definitions (similar to Block Blast / 1010!)
export const PIECE_SHAPES: { name: string; shape: PieceShape; weight: number }[] = [
  // 1. Single dot
  { name: 'dot_1x1', shape: [[1]], weight: 6 },

  // 2. Lines of 2
  { name: 'line_2x1_h', shape: [[1, 1]], weight: 9 },
  { name: 'line_2x1_v', shape: [[1], [1]], weight: 9 },

  // 3. Lines of 3
  { name: 'line_3x1_h', shape: [[1, 1, 1]], weight: 8 },
  { name: 'line_3x1_v', shape: [[1], [1], [1]], weight: 8 },

  // 4. Lines of 4
  { name: 'line_4x1_h', shape: [[1, 1, 1, 1]], weight: 6 },
  { name: 'line_4x1_v', shape: [[1], [1], [1], [1]], weight: 6 },

  // 5. Lines of 5 (rare high reward)
  { name: 'line_5x1_h', shape: [[1, 1, 1, 1, 1]], weight: 3 },
  { name: 'line_5x1_v', shape: [[1], [1], [1], [1], [1]], weight: 3 },

  // 6. 2x2 Square
  {
    name: 'square_2x2',
    shape: [
      [1, 1],
      [1, 1],
    ],
    weight: 8,
  },

  // 7. 3x3 Square (rare)
  {
    name: 'square_3x3',
    shape: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    weight: 2,
  },

  // 8. Corner 2x2 (Small L, 3 cells)
  {
    name: 'corner_tl',
    shape: [
      [1, 1],
      [1, 0],
    ],
    weight: 7,
  },
  {
    name: 'corner_tr',
    shape: [
      [1, 1],
      [0, 1],
    ],
    weight: 7,
  },
  {
    name: 'corner_bl',
    shape: [
      [1, 0],
      [1, 1],
    ],
    weight: 7,
  },
  {
    name: 'corner_br',
    shape: [
      [0, 1],
      [1, 1],
    ],
    weight: 7,
  },

  // 9. Standard L 3x2 (4 cells)
  {
    name: 'L_3x2_1',
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    weight: 6,
  },
  {
    name: 'L_3x2_2',
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    weight: 6,
  },
  {
    name: 'L_3x2_3',
    shape: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    weight: 6,
  },
  {
    name: 'L_3x2_4',
    shape: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    weight: 6,
  },

  // 10. Horizontal L 2x3 (4 cells)
  {
    name: 'L_2x3_1',
    shape: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    weight: 5,
  },
  {
    name: 'L_2x3_2',
    shape: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    weight: 5,
  },
  {
    name: 'L_2x3_3',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    weight: 5,
  },
  {
    name: 'L_2x3_4',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    weight: 5,
  },

  // 11. Large L 3x3 (5 cells)
  {
    name: 'big_L_tl',
    shape: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    weight: 3,
  },
  {
    name: 'big_L_tr',
    shape: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    weight: 3,
  },
  {
    name: 'big_L_bl',
    shape: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    weight: 3,
  },
  {
    name: 'big_L_br',
    shape: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    weight: 3,
  },

  // 12. T shapes (4 cells)
  {
    name: 'T_up',
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    weight: 5,
  },
  {
    name: 'T_down',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    weight: 5,
  },
  {
    name: 'T_left',
    shape: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    weight: 5,
  },
  {
    name: 'T_right',
    shape: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    weight: 5,
  },

  // 13. Z and S shapes (4 cells)
  {
    name: 'Z_h',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    weight: 4,
  },
  {
    name: 'S_h',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    weight: 4,
  },
  {
    name: 'Z_v',
    shape: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    weight: 4,
  },
  {
    name: 'S_v',
    shape: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    weight: 4,
  },

  // 14. Plus cross (5 cells)
  {
    name: 'plus_cross',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    weight: 2,
  },
];

const CROPS: CropType[] = ['corn', 'wheat', 'soy'];

/**
 * Weighted random selection of a piece shape
 */
export function getRandomShape(): PieceShape {
  const totalWeight = PIECE_SHAPES.reduce((acc, curr) => acc + curr.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of PIECE_SHAPES) {
    if (random < item.weight) {
      return item.shape;
    }
    random -= item.weight;
  }

  return PIECE_SHAPES[0].shape;
}

/**
 * Generate 3 random pieces with crops.
 * Ensure nice crop distribution (mix of corn, wheat, soy).
 */
export function generateTrayPieces(board?: Board): Piece[] {
  // Shuffle crop types to ensure variety across the 3 slots
  const shuffledCrops = [...CROPS].sort(() => Math.random() - 0.5);

  const pieces: Piece[] = [];
  for (let i = 0; i < 3; i++) {
    const crop = shuffledCrops[i % shuffledCrops.length];
    let shape = getRandomShape();

    // If board is provided, ensure at least the first piece generated can fit on the board
    if (board && i === 0 && !canPlaceShapeAnywhere(board, shape)) {
      // Find a shape that fits
      for (const p of PIECE_SHAPES) {
        if (canPlaceShapeAnywhere(board, p.shape)) {
          shape = p.shape;
          break;
        }
      }
    }

    pieces.push({
      id: `piece_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}`,
      shape,
      crop,
      used: false,
    });
  }

  return pieces;
}

/**
 * Check if a shape can be placed at given top-left (startRow, startCol) on an 8x8 board
 */
export function canPlaceShapeAt(board: Board, shape: PieceShape, startRow: number, startCol: number): boolean {
  const rows = shape.length;
  const cols = shape[0].length;

  if (startRow < 0 || startCol < 0 || startRow + rows > 8 || startCol + cols > 8) {
    return false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (shape[r][c] === 1) {
        const boardRow = startRow + r;
        const boardCol = startCol + c;
        if (board[boardRow][boardCol] !== null) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Check if a shape can be placed ANYWHERE on the 8x8 board
 */
export function canPlaceShapeAnywhere(board: Board, shape: PieceShape): boolean {
  const shapeRows = shape.length;
  const shapeCols = shape[0].length;

  for (let r = 0; r <= 8 - shapeRows; r++) {
    for (let c = 0; c <= 8 - shapeCols; c++) {
      if (canPlaceShapeAt(board, shape, r, c)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if game is over: returns true if none of the unused tray pieces can be placed anywhere
 */
export function isGameOver(board: Board, trayPieces: Piece[]): boolean {
  const availablePieces = trayPieces.filter((p) => !p.used);
  if (availablePieces.length === 0) {
    return false; // all used, waiting for new pieces
  }

  for (const piece of availablePieces) {
    if (canPlaceShapeAnywhere(board, piece.shape)) {
      return false; // At least one piece can fit!
    }
  }

  return true; // No piece can fit!
}

/**
 * Count the total number of blocks in a shape
 */
export function countShapeCells(shape: PieceShape): number {
  let count = 0;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) count++;
    }
  }
  return count;
}
