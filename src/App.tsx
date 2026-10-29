/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Board as BoardType,
  CropType,
  GamePhase,
  GameStats,
  HarvestLineResult,
  HoverPreviewData,
  Piece,
  ScorePopup,
} from './types';
import {
  canPlaceShapeAt,
  countShapeCells,
  generateTrayPieces,
  isGameOver,
} from './utils/pieces';
import { createEmptyBoard, evaluateHarvest, getPreviewCompletedLines } from './utils/harvest';
import { sound } from './audio';
import { FarmBackground } from './components/FarmBackground';
import { HUD } from './components/HUD';
import { Board } from './components/Board';
import { PieceTray, PieceRender } from './components/PieceTray';
import { ParticleTrigger } from './components/HarvestParticles';
import { HarvestBanner, BannerData } from './components/HarvestBanner';
import { GameOverModal, RulesModal } from './components/Modals';
import { RankingModal } from './components/RankingModal';
import { RoundBonus, BonusState, initialBonus, updateBonus } from './components/RoundBonus';

interface DragState {
  piece: Piece;
  originRect: DOMRect;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  touchOffset: number; // upward finger offset in pixels
}

const STORAGE_KEYS = {
  HIGH_SCORE: 'farm_blocks_highscore',
  SAVED_GAME: 'farm_blocks_game_state_v1',
  FIRST_TIME: 'farm_blocks_has_played',
};

export default function App() {
  // Game state
  const [board, setBoard] = useState<BoardType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_GAME);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.board && Array.isArray(parsed.board)) return parsed.board;
      }
    } catch {
      // ignore
    }
    return createEmptyBoard();
  });

  const [score, setScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_GAME);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.score === 'number') return parsed.score;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [trayPieces, setTrayPieces] = useState<Piece[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_GAME);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.trayPieces && Array.isArray(parsed.trayPieces)) {
          // If all saved pieces were already used, generate fresh pieces immediately!
          const remaining = parsed.trayPieces.filter((p: Piece) => !p.used);
          if (remaining.length > 0) return parsed.trayPieces;
        }
      }
    } catch {
      // ignore
    }
    return generateTrayPieces();
  });

  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_GAME);
      if (saved && parsedHasStats(saved)) {
        return JSON.parse(saved).stats;
      }
    } catch {
      // ignore
    }
    return {
      score: 0,
      highScore: 0,
      linesCleared: 0,
      goodHarvests: 0,
      superHarvests: 0,
      maxCombo: 0,
    };
  });

  const [bonus, setBonus] = useState<BonusState>(() => {
    try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_GAME) || 'null'); if (saved?.bonus?.awarded?.length === 3) return { ...initialBonus(), ...saved.bonus, cornLines: saved.bonus.cornLines ?? 0, awarded: [false, ...saved.bonus.awarded.slice(1)] }; } catch { /* ignore */ }
    return initialBonus();
  });
  const bonusRef = useRef(bonus);
  const [cornLines, setCornLines] = useState<number>(() => bonus.cornLines);
  const [showBonus, setShowBonus] = useState(false);
  const [bonusNotice, setBonusNotice] = useState('');

  // Sound toggle state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());

  // UI state
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showRanking, setShowRanking] = useState<boolean>(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(() => {
    return !localStorage.getItem(STORAGE_KEYS.FIRST_TIME);
  });
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Game sequence state: PLACING -> PLANTED -> HARVESTING -> FINISHED -> READY
  const [phase, setPhase] = useState<GamePhase>('READY');

  // Animation states
  const [isHarvesting, setIsHarvesting] = useState<boolean>(false);
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [activeHarvesters, setActiveHarvesters] = useState<HarvestLineResult[]>([]);
  const [particleTriggers, setParticleTriggers] = useState<ParticleTrigger[]>([]);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [currentBanner, setCurrentBanner] = useState<BannerData | null>(null);

  // Drag & drop state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoverPreview, setHoverPreview] = useState<HoverPreviewData | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const harvestTimeoutsRef = useRef<number[]>([]);
  const harvestRafRef = useRef<number | null>(null);
  const harvestedCellsRef = useRef<Set<string>>(new Set());
  const currentBoardRef = useRef<BoardType>(board);

  // Keep currentBoardRef in sync with board state changes
  useEffect(() => {
    currentBoardRef.current = board;
  }, [board]);

  // Cleanup pending harvest timers and animation frames on unmount
  useEffect(() => {
    return () => {
      if (harvestRafRef.current !== null) {
        cancelAnimationFrame(harvestRafRef.current);
      }
      harvestTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  function parsedHasStats(str: string): boolean {
    try {
      const p = JSON.parse(str);
      return p && p.stats && typeof p.stats.linesCleared === 'number';
    } catch {
      return false;
    }
  }

  // Defensive check: If all pieces in tray are used, immediately generate 3 new pieces
  useEffect(() => {
    const remaining = trayPieces.filter((p) => !p.used);
    if (remaining.length === 0) {
      setTrayPieces(generateTrayPieces(board));
    }
  }, [trayPieces, board]);

  // Save game state
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SAVED_GAME,
        JSON.stringify({
          board,
          score,
          trayPieces,
          stats: { ...stats, score, highScore },
          bonus,
        })
      );
    } catch {
      // ignore
    }
  }, [board, score, trayPieces, stats, highScore, bonus]);

  // Award mission points once as soon as harvest statistics reach a target.
  useEffect(() => {
    const { next, earned, completed } = updateBonus(bonusRef.current, { cornLines, supers: stats.superHarvests, maxCombo: stats.maxCombo });
    bonusRef.current = next;
    setBonus(next);
    if (earned > 0) {
      setScore(prev => prev + earned);
      setBonusNotice(`MISSÃO COMPLETA! +${earned} PONTOS • ${completed.join(' / ')}`);
    }
  }, [cornLines, stats.superHarvests, stats.maxCombo]);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      setIsNewRecord(true);
      try {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      } catch {
        // ignore
      }
    }
  }, [score, highScore]);

  // First time popup
  useEffect(() => {
    if (isFirstTime) {
      setShowRules(true);
    }
  }, [isFirstTime]);

  const handleCloseRules = () => {
    setShowRules(false);
    if (isFirstTime) {
      setIsFirstTime(false);
      localStorage.setItem(STORAGE_KEYS.FIRST_TIME, 'true');
    }
  };

  const handleToggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
  };

  // Restart / New Game
  const handleRestart = useCallback(() => {
    if (harvestRafRef.current !== null) {
      cancelAnimationFrame(harvestRafRef.current);
      harvestRafRef.current = null;
    }
    harvestTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    harvestTimeoutsRef.current = [];
    harvestedCellsRef.current.clear();

    const newBoard = createEmptyBoard();
    const newPieces = generateTrayPieces(newBoard);
    currentBoardRef.current = newBoard.map((row) => [...row]);
    setBoard(newBoard);
    setScore(0);
    bonusRef.current = initialBonus();
    setBonus(bonusRef.current);
    setCornLines(0);
    setShowBonus(false);
    setBonusNotice('');
    setTrayPieces(newPieces);
    setHoverPreview(null);
    setDragState(null);
    setPhase('READY');
    setIsHarvesting(false);
    setClearingCells(new Set());
    setActiveHarvesters([]);
    setParticleTriggers([]);
    setCurrentBanner(null);
    setShowGameOver(false);
    setIsNewRecord(false);
    setStats({
      score: 0,
      highScore,
      linesCleared: 0,
      goodHarvests: 0,
      superHarvests: 0,
      maxCombo: 0,
    });
    sound.playPick();
  }, [highScore]);

  // Pointer Down on Tray Piece
  const handlePointerDownPiece = (
    e: React.PointerEvent,
    piece: Piece,
    originRect: DOMRect
  ) => {
    e.preventDefault();
    if (phase !== 'READY' || isHarvesting || piece.used) return;

    setPhase('PLACING');
    sound.playPick();

    // Finger offset: 82px above touch point on mobile touch devices
    const isTouch = e.pointerType === 'touch';
    const touchOffset = isTouch ? 82 : 0;

    setDragState({
      piece,
      originRect,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY - touchOffset,
      touchOffset,
    });
  };

  // Drag calculation
  const updateDragPreview = useCallback(
    (clientX: number, clientY: number, piece: Piece, offset: number) => {
      if (!boardRef.current) return;

      const boardRect = boardRef.current.getBoundingClientRect();
      const cellSize = boardRect.width / 8;
      const pieceRows = piece.shape.length;
      const pieceCols = piece.shape[0].length;

      // Effective position of the piece center
      const targetX = clientX;
      const targetY = clientY - offset;

      // Calculate where the top-left of the piece should snap
      const pieceHalfWidth = (pieceCols * cellSize) / 2;
      const pieceHalfHeight = (pieceRows * cellSize) / 2;

      const relativeX = targetX - pieceHalfWidth - boardRect.left;
      const relativeY = targetY - pieceHalfHeight - boardRect.top;

      const col = Math.round(relativeX / cellSize);
      const row = Math.round(relativeY / cellSize);

      // Check if any block of the piece falls on or near the board
      const isNearBoard =
        row >= -pieceRows &&
        row <= 8 &&
        col >= -pieceCols &&
        col <= 8;

      if (isNearBoard) {
        // Check if at least one cell overlaps the board grid
        let hasCellOnBoard = false;
        for (let r = 0; r < pieceRows; r++) {
          for (let c = 0; c < pieceCols; c++) {
            if (piece.shape[r][c] === 1) {
              const br = row + r;
              const bc = col + c;
              if (br >= 0 && br < 8 && bc >= 0 && bc < 8) {
                hasCellOnBoard = true;
                break;
              }
            }
          }
          if (hasCellOnBoard) break;
        }

        if (hasCellOnBoard) {
          const valid = canPlaceShapeAt(board, piece.shape, row, col);
          const previewLines = valid
            ? getPreviewCompletedLines(board, piece.shape, piece.crop, row, col)
            : [];

          setHoverPreview({
            startRow: row,
            startCol: col,
            shape: piece.shape,
            crop: piece.crop,
            isValid: valid,
            previewLines,
          });
          return;
        }
      }

      setHoverPreview(null);
    },
    [board]
  );

  // Global Pointer Move & Up listeners while dragging
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentX: e.clientX,
              currentY: e.clientY - prev.touchOffset,
            }
          : null
      );
      updateDragPreview(e.clientX, e.clientY, dragState.piece, dragState.touchOffset);
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();

      if (hoverPreview && hoverPreview.isValid) {
        // 1. Immediately write ALL cells of placed piece to the board state (Problem 1 Requirement 1)
        const { startRow, startCol, shape, crop } = hoverPreview;
        const newBoard = board.map((row) => [...row]);
        const cellCount = countShapeCells(shape);

        // Place all cells
        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
              newBoard[startRow + r][startCol + c] = {
                crop,
                id: `cell_${Date.now()}_${startRow + r}_${startCol + c}`,
              };
            }
          }
        }

        // 2. Render the entire piece, including the cells that complete the line/col (Problem 1 Requirement 2)
        setBoard(newBoard);
        currentBoardRef.current = newBoard.map((row) => [...row]);

        // Mark placed piece as used in tray
        const updatedTray = trayPieces.map((p) =>
          p.id === dragState.piece.id ? { ...p, used: true } : p
        );
        setTrayPieces(updatedTray);
        const allUsed = updatedTray.every((p) => p.used);

        // Clear drag states and hover highlights immediately
        setDragState(null);
        setHoverPreview(null);

        // Play planting sound
        sound.playPlace();

        // Lock controls and set state to PLANTED (Sequence: PLACING -> PLANTED)
        setIsHarvesting(true);
        setPhase('PLANTED');

        // Check if this placement triggered a harvest
        const harvest = evaluateHarvest(newBoard);

        if (!harvest) {
          // No harvest lines: simple placement
          setScore((prev) => prev + cellCount);
          setIsHarvesting(false);
          setPhase('READY');

          let finalPieces = updatedTray;
          if (allUsed) {
            finalPieces = generateTrayPieces(newBoard);
            setTrayPieces(finalPieces);
          }

          if (isGameOver(newBoard, finalPieces)) {
            const goTimer = window.setTimeout(() => {
              setShowGameOver(true);
              sound.playGameOver();
            }, 300);
            harvestTimeoutsRef.current.push(goTimer);
          }
          return;
        }

        // HARVEST DETECTED!
        // Calculate Score & Bonuses ONLY ONCE before animation starts
        const addedPoints = cellCount + harvest.totalPoints;
        setScore((prev) => prev + addedPoints);

        let goodCount = 0;
        let superCount = 0;
        const harvestedCornLines = harvest.lines.filter((line) => line.cropCounts.corn === 8).length;
        if (harvestedCornLines > 0) setCornLines((prev) => prev + harvestedCornLines);
        harvest.lines.forEach((line) => {
          if (line.level === 'good') goodCount++;
          if (line.level === 'super') superCount++;
        });

        // Audio
        if (superCount > 0) {
          sound.playSuperHarvest();
        } else if (goodCount > 0) {
          sound.playGoodHarvest();
        } else if (harvest.comboCount > 1) {
          sound.playCombo(harvest.comboCount);
        } else {
          sound.playHarvest();
        }

        // Celebratory banner
        if (superCount > 0) {
          setCurrentBanner({
            id: String(Date.now()),
            type: 'super',
            title: superCount > 1 ? 'SUPER COLHEITA DUPLA!' : 'SUPER COLHEITA!',
            points: harvest.totalPoints,
            subtitle: '8 CULTURAS IGUAIS',
          });
        } else if (goodCount > 0) {
          setCurrentBanner({
            id: String(Date.now()),
            type: 'good',
            title: goodCount > 1 ? 'BOAS COLHEITAS!' : 'BOA COLHEITA!',
            points: harvest.totalPoints,
            subtitle: '6-7 CULTURAS IGUAIS',
          });
        } else if (harvest.comboCount > 1) {
          setCurrentBanner({
            id: String(Date.now()),
            type: 'combo',
            title: `COMBO x${harvest.comboCount}!`,
            points: harvest.totalPoints,
            subtitle: `${harvest.comboCount} LINHAS SIMULTÂNEAS`,
          });
        }

        // Floating score popup
        const newPopupId = `popup_${Date.now()}`;
        setScorePopups((prev) => [
          ...prev,
          {
            id: newPopupId,
            x: 50,
            y: 50,
            text: `+${harvest.totalPoints}`,
            color: superCount > 0 ? '#fde047' : goodCount > 0 ? '#86efac' : '#ffffff',
            subText:
              superCount > 0
                ? 'SUPER COLHEITA!'
                : goodCount > 0
                ? 'BOA COLHEITA!'
                : harvest.comboCount > 1
                ? `COMBO x${harvest.comboCount}!`
                : undefined,
          },
        ]);

        const popupTimer = window.setTimeout(() => {
          setScorePopups((prev) => prev.filter((p) => p.id !== newPopupId));
        }, 1200);
        harvestTimeoutsRef.current.push(popupTimer);

        const bannerTimer = window.setTimeout(() => {
          setCurrentBanner(null);
        }, 2400);
        harvestTimeoutsRef.current.push(bannerTimer);

        // Update stats
        setStats((prev) => ({
          ...prev,
          linesCleared: prev.linesCleared + harvest.lines.length,
          goodHarvests: prev.goodHarvests + goodCount,
          superHarvests: prev.superHarvests + superCount,
          maxCombo: Math.max(prev.maxCombo, harvest.comboCount),
        }));

        // Plan passes in sequence: all completed rows first, then all completed columns
        const plannedPasses: Array<{ line: HarvestLineResult; direction: 'right' | 'up' }> = [];
        const completedRows = harvest.lines.filter((l) => l.orientation === 'row');
        const completedCols = harvest.lines.filter((l) => l.orientation === 'col');
        completedRows.forEach((rowLine) => plannedPasses.push({ line: rowLine, direction: 'right' }));
        completedCols.forEach((colLine) => plannedPasses.push({ line: colLine, direction: 'up' }));

        // Clear harvested cells tracker for this turn
        harvestedCellsRef.current.clear();

        // 3. Wait for browser visual update and a short pause of 200 ms (Problem 1 Requirement 3)
        // 4. Only then start the harvester animation (Problem 1 Requirement 4)
        // 5. No cell is eliminated before the machine begins cutting (Problem 1 Requirement 5)
        const pauseTimer = window.setTimeout(() => {
          setPhase('HARVESTING');

          const executePass = (passIndex: number) => {
            if (passIndex >= plannedPasses.length) {
              // FINISHED: All passes complete
              setPhase('FINISHED');
              setActiveHarvesters([]);
              setParticleTriggers([]);
              setIsHarvesting(false);

              let finalPieces = updatedTray;
              if (allUsed) {
                finalPieces = generateTrayPieces(currentBoardRef.current);
                setTrayPieces(finalPieces);
              }

              if (isGameOver(currentBoardRef.current, finalPieces)) {
                const goTimer = window.setTimeout(() => {
                  setShowGameOver(true);
                  sound.playGameOver();
                }, 300);
                harvestTimeoutsRef.current.push(goTimer);
              }

              // Return to READY state
              setPhase('READY');
              return;
            }

            const currentPass = plannedPasses[passIndex];
            setActiveHarvesters([currentPass.line]);
            const passStartTime = performance.now();
            const isRow = currentPass.direction === 'right';
            const lineIdx = currentPass.line.index;

            // Frame-based calculation (Problem 3: Calculate position every frame via RAF)
            const frame = (now: number) => {
              const elapsed = now - passStartTime;
              const progress = Math.min(1.0, elapsed / 2500);

              let boardChanged = false;
              const newTriggers: ParticleTrigger[] = [];

              // Check each of the 8 cells in this line
              // The cutter platform reaches cell center at: progress >= ((step + 0.5) * 12.5) / 123.77
              for (let step = 0; step < 8; step++) {
                const cutProgress = ((step + 0.5) * 12.5) / 123.77;

                if (progress >= cutProgress) {
                  const r = isRow ? lineIdx : 7 - step;
                  const c = isRow ? step : lineIdx;
                  const key = `${r},${c}`;

                  // Do not harvest intersection cells twice (Problem 3: simultaneous harvest rule)
                  if (!harvestedCellsRef.current.has(key)) {
                    harvestedCellsRef.current.add(key);

                    const cell = currentBoardRef.current[r][c];
                    const cellCrop = cell?.crop || currentPass.line.dominantCrop || 'corn';

                    // Remove the plant from the board at this exact frame
                    currentBoardRef.current[r][c] = null;
                    boardChanged = true;

                    // Spawn agricultural particles at the exact cell center
                    newTriggers.push({
                      id: `pt_${r}_${c}_${Date.now()}_${Math.random()}`,
                      x: (c + 0.5) * 12.5,
                      y: (r + 0.5) * 12.5,
                      crop: cellCrop,
                    });
                  }
                }
              }

              if (boardChanged) {
                setBoard(currentBoardRef.current.map((row) => [...row]));
              }

              if (newTriggers.length > 0) {
                setParticleTriggers((prev) => [...prev, ...newTriggers]);
              }

              if (progress < 1.0) {
                harvestRafRef.current = requestAnimationFrame(frame);
              } else {
                // Pass complete!
                setActiveHarvesters([]);
                if (passIndex + 1 < plannedPasses.length) {
                  // Execute next pass in sequence
                  const nextPassTimer = window.setTimeout(() => {
                    executePass(passIndex + 1);
                  }, 60);
                  harvestTimeoutsRef.current.push(nextPassTimer);
                } else {
                  // All passes complete!
                  setPhase('FINISHED');
                  setActiveHarvesters([]);
                  setParticleTriggers([]);
                  setIsHarvesting(false);

                  let finalPieces = updatedTray;
                  if (allUsed) {
                    finalPieces = generateTrayPieces(currentBoardRef.current);
                    setTrayPieces(finalPieces);
                  }

                  if (isGameOver(currentBoardRef.current, finalPieces)) {
                    const goTimer = window.setTimeout(() => {
                      setShowGameOver(true);
                      sound.playGameOver();
                    }, 300);
                    harvestTimeoutsRef.current.push(goTimer);
                  }

                  setPhase('READY');
                }
              }
            };

            harvestRafRef.current = requestAnimationFrame(frame);
          };

          // Start first planned pass
          executePass(0);
        }, 200);

        harvestTimeoutsRef.current.push(pauseTimer);
      } else {
        // Invalid drop: piece bounces back to tray
        sound.playInvalid();
        setPhase('READY');
      }

      setDragState(null);
      setHoverPreview(null);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
    window.addEventListener('pointercancel', handlePointerUp, { passive: false });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState, hoverPreview, board, trayPieces, isHarvesting, updateDragPreview]);

  // Dynamic cell size for dragged piece matching board cell size 1:1
  const boardCellSize = boardRef.current ? boardRef.current.offsetWidth / 8 : 42;

  return (
    <main
      className="relative w-screen h-[100dvh] max-h-[100dvh] flex flex-col justify-between items-center overflow-hidden touch-none select-none text-slate-100"
      style={{
        paddingTop: 'max(4px, env(safe-area-inset-top))',
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      }}
    >
      {/* 2D Farm Landscape Vector Background */}
      <FarmBackground />

      {/* Top HUD with Scores & Quick Controls */}
      <HUD
        score={score}
        highScore={highScore}
        stats={stats}
        onOpenBonus={() => setShowBonus(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRestart={handleRestart}
        onOpenRules={() => setShowRules(true)}
        onOpenRanking={() => setShowRanking(true)}
      />

      {bonusNotice && <button onClick={() => setBonusNotice('')} className="z-30 max-w-[95vw] mx-auto bg-emerald-800/95 border border-yellow-400 rounded-lg px-3 py-1 text-xs font-black text-yellow-200 shadow-xl">🌟 {bonusNotice} ✕</button>}

      {/* Dynamic Harvest & Combo Banner Announcement */}
      <HarvestBanner banner={currentBanner} />

      {/* Central 8x8 Board Container */}
      <section aria-label="Tabuleiro Farm Blocks" className="w-full flex-1 min-h-0 flex items-center justify-center px-2 py-0.5 z-10 overflow-hidden">
        <Board
          board={board}
          boardRef={boardRef}
          hoverPreview={hoverPreview}
          clearingCells={clearingCells}
          activeHarvesters={activeHarvesters}
          particleTriggers={particleTriggers}
          scorePopups={scorePopups}
        />
      </section>

      {/* Bottom Tray with 3 Pieces */}
      <section aria-label="Bandeja de Peças" className="w-full pb-1 z-10 shrink-0">
        <div className="w-full max-w-[400px] mx-auto text-center mb-0.5">
          <span className="text-[10px] sm:text-xs font-bold text-amber-200/90 drop-shadow uppercase tracking-wider">
            Peças Disponíveis
          </span>
        </div>
        <PieceTray
          pieces={trayPieces}
          board={board}
          activeDragPieceId={dragState?.piece.id || null}
          disabled={isHarvesting}
          onPointerDownPiece={handlePointerDownPiece}
        />
      </section>

      {/* Floating Dragged Piece directly following thumb with upward offset */}
      {dragState && (
        <div
          className="fixed pointer-events-none z-50 transition-none"
          style={{
            left: `${dragState.currentX}px`,
            top: `${dragState.currentY}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="drop-shadow-2xl scale-105 filter">
            <PieceRender
              shape={dragState.piece.shape}
              crop={dragState.piece.crop}
              cellSize={boardCellSize}
            />
          </div>
        </div>
      )}

      {/* Rules / Tutorial Modal */}
      <RulesModal
        isOpen={showRules}
        onClose={handleCloseRules}
        isFirstTime={isFirstTime}
      />

      <RankingModal isOpen={showRanking} onClose={() => setShowRanking(false)} />
      {showBonus && <RoundBonus state={bonus} onClose={() => setShowBonus(false)} />}

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={showGameOver}
        score={score}
        highScore={highScore}
        isNewRecord={isNewRecord}
        linesCleared={stats.linesCleared}
        goodHarvests={stats.goodHarvests}
        superHarvests={stats.superHarvests}
        maxCombo={stats.maxCombo}
        onPlayAgain={handleRestart}
      />
    </main>
  );
}
