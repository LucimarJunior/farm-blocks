export type CropType = 'corn' | 'wheat' | 'soy';

export interface CellData {
  crop: CropType;
  id: string;
}

export type Board = (CellData | null)[][];

export type PieceShape = number[][];

export type GamePhase = 'READY' | 'PLACING' | 'PLANTED' | 'HARVESTING' | 'FINISHED';

export interface Piece {
  id: string;
  shape: PieceShape;
  crop: CropType;
  used: boolean;
}

export type HarvestLevel = 'normal' | 'good' | 'super';

export interface HarvestLineResult {
  orientation: 'row' | 'col';
  index: number;
  level: HarvestLevel;
  dominantCrop: CropType | null;
  cropCounts: Record<CropType, number>;
  points: number;
}

export interface HarvestResult {
  lines: HarvestLineResult[];
  clearedCells: { r: number; c: number }[];
  totalPoints: number;
  comboCount: number;
  bonusPoints: number;
}

export interface ScorePopup {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  subText?: string;
}

export interface HarvestParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  crop: CropType;
  alpha: number;
  rotation: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  linesCleared: number;
  goodHarvests: number;
  superHarvests: number;
  maxCombo: number;
}

export interface PreviewLineHighlight {
  orientation: 'row' | 'col';
  index: number;
  level: HarvestLevel;
}

export interface HoverPreviewData {
  startRow: number;
  startCol: number;
  shape: PieceShape;
  crop: CropType;
  isValid: boolean;
  previewLines: PreviewLineHighlight[];
}
