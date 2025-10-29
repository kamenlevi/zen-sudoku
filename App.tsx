import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, BoardState, Grid, Move, CompletedGame, AppSettings, MistakeHighlightMode, InProgressGame } from './types';
import { generateSudoku } from './services/sudokuService';
import { formatTime } from './utils/time';
import Board from './components/Board';
import NumberPad from './components/NumberPad';
import DifficultySelector from './components/DifficultySelector';
import HistoryScreen from './components/HistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import { ClockIcon } from './components/icons';

type View = 'menu' | 'game' | 'history' | 'settings';

const DEFAULT_SETTINGS: AppSettings = {
  saveHistory: true,
  mistakeHighlighting: MistakeHighlightMode.None,
};

const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const checkDevice = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };
    checkDevice(mediaQuery);
    
    // Use the modern addEventListener if available
    try {
      mediaQuery.addEventListener('change', checkDevice);
      return () => mediaQuery.removeEventListener('change', checkDevice);
    } catch (e) {
      // Fallback for older browsers
      mediaQuery.addListener(checkDevice);
      return () => mediaQuery.removeListener(checkDevice);
    }
  }, []);

  return isMobile;
};


const WinToast: React.FC<{
  isOpen: boolean;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}> = ({ isOpen, onPlayAgain, onMainMenu }) => {
  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      role="dialog" aria-modal="true" aria-labelledby="win-toast-heading"
    >
      <div className="bg-white text-black p-8 rounded-xl text-center shadow-2xl mx-4 transform animate-pop-in">
        <h2 id="win-toast-heading" className="font-display text-5xl mb-6">Completed!</h2>
        <div className="flex justify-center space-x-4">
          <button onClick={onPlayAgain} className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">Play Again</button>
          <button onClick={onMainMenu} className="bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">Main Menu</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const [initialPuzzle, setInitialPuzzle] = useState<Grid | null>(null);
  const [solution, setSolution] = useState<Grid | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isWon, setIsWon] = useState(false);
  
  // History and Timer State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [completedGames, setCompletedGames] = useState<CompletedGame[]>([]);
  const [inProgressGames, setInProgressGames] = useState<InProgressGame[]>([]);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // Gesture Navigation State
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isInstant, setIsInstant] = useState(false);

  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem('completedSudokuGames');
      if (storedCompleted) setCompletedGames(JSON.parse(storedCompleted));

      const storedInProgress = localStorage.getItem('inProgressSudokuGames');
      if (storedInProgress) setInProgressGames(JSON.parse(storedInProgress));

      const storedSettings = localStorage.getItem('sudokuSettings');
      if (storedSettings) {
        setSettings(prev => ({...DEFAULT_SETTINGS, ...JSON.parse(storedSettings)}));
      }
      
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    let timerId: number | undefined;
    if (view === 'game' && startTime && !isWon) {
      timerId = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [view, startTime, isWon]);
  
  const saveInProgressGame = useCallback(() => {
    if (view === 'game' && boardState && !isWon && difficulty && initialPuzzle && solution && startTime) {
      const gameToSave: InProgressGame = {
        id: `${difficulty}-${startTime}`,
        difficulty,
        startTime,
        puzzle: initialPuzzle,
        solution,
        boardState,
        elapsedTime,
      };

      setInProgressGames(prev => {
        const otherGames = prev.filter(g => g.id !== gameToSave.id);
        const updatedGames = [...otherGames, gameToSave];
        try {
          localStorage.setItem('inProgressSudokuGames', JSON.stringify(updatedGames));
        } catch(e) { console.error("Failed to save in-progress game:", e); }
        return updatedGames;
      });
    }
  }, [view, boardState, isWon, difficulty, initialPuzzle, solution, startTime, elapsedTime]);

  const resetToMenu = useCallback((instant = false) => {
    if (view === 'game' && !isWon) {
      saveInProgressGame();
    }
    if (instant) {
      setIsInstant(true);
    }
    setView('menu');
    setDifficulty(null);
    setBoardState(null);
    setIsWon(false);
  }, [view, isWon, saveInProgressGame]);

  useEffect(() => {
    if (isInstant) {
      const timer = setTimeout(() => setIsInstant(false), 50);
      return () => clearTimeout(timer);
    }
  }, [isInstant]);

  const newGame = useCallback((level: Difficulty) => {
    const { puzzle, solution } = generateSudoku(level);
    const initialBoardState: BoardState = puzzle.map(row => 
      row.map(value => ({ value, readonly: value !== 0, isError: false }))
    );
    setDifficulty(level);
    setBoardState(initialBoardState);
    setInitialPuzzle(puzzle);
    setSolution(solution);
    setSelectedCell(null);
    setIsWon(false);
    setMoveHistory([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    setView('game');
  }, []);

  const handleCellSelect = (row: number, col: number) => {
    if (boardState) {
      // Only clear temporary errors if the selected cell is editable.
      if (!boardState[row][col].readonly && settings.mistakeHighlighting === MistakeHighlightMode.Temporary) {
        const newBoardState = boardState.map(r => r.map(c => ({...c, isError: false })));
        setBoardState(newBoardState);
      }
      setSelectedCell({ row, col });
    }
  };
  
  const handleClosePad = useCallback(() => setSelectedCell(null), []);

  const handleNumberInput = useCallback((num: number, keepCellSelected = false) => {
    if (!selectedCell || !boardState || !solution || boardState[selectedCell.row][selectedCell.col].readonly) return;
    const { row, col } = selectedCell;
    const newBoardState = boardState.map(r => r.map(c => ({ ...c })));
    
    if (settings.mistakeHighlighting === MistakeHighlightMode.Temporary) {
      newBoardState.forEach(r => r.forEach(c => c.isError = false));
    }

    const isCorrect = solution[row][col] === num;
    newBoardState[row][col].value = num;
    
    if (settings.mistakeHighlighting !== MistakeHighlightMode.None) {
      newBoardState[row][col].isError = !isCorrect;
    } else {
      newBoardState[row][col].isError = false;
    }

    setBoardState(newBoardState);
    setMoveHistory(prev => [...prev, { row, col, value: num, timestamp: Date.now() }]);
    
    if (!keepCellSelected) {
      handleClosePad();
    }
  }, [boardState, selectedCell, handleClosePad, solution, settings.mistakeHighlighting]);

  const handleErase = useCallback((keepCellSelected = false) => {
    if (!selectedCell || !boardState || boardState[selectedCell.row][selectedCell.col].readonly) return;
    const { row, col } = selectedCell;
    const newBoardState = boardState.map(r => r.map(c => ({ ...c })));
    newBoardState[row][col].value = 0;
    newBoardState[row][col].isError = false; // Always clear error on erase
    setBoardState(newBoardState);
    setMoveHistory(prev => [...prev, { row, col, value: 0, timestamp: Date.now() }]);
    if (!keepCellSelected) {
      handleClosePad();
    }
  }, [boardState, selectedCell, handleClosePad]);

  const checkWinCondition = useCallback(() => {
    if (!boardState || !solution) return false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (boardState[r][c].value === 0 || boardState[r][c].value !== solution[r][c]) {
          return false;
        }
      }
    }
    return true;
  }, [boardState, solution]);
  
  useEffect(() => {
    if (view === 'game' && !isWon && checkWinCondition()) {
      setIsWon(true);
      setSelectedCell(null);

      // If game was in progress, remove it from the list
      if (startTime && difficulty) {
        const gameId = `${difficulty}-${startTime}`;
        setInProgressGames(prev => {
          const updatedGames = prev.filter(g => g.id !== gameId);
          if (updatedGames.length < prev.length) {
            try {
              localStorage.setItem('inProgressSudokuGames', JSON.stringify(updatedGames));
            } catch (e) { console.error("Failed to update in-progress games after win:", e); }
          }
          return updatedGames;
        });
      }

      if (settings.saveHistory && difficulty && initialPuzzle && solution && startTime && boardState) {
        const newCompletedGame: CompletedGame = {
          id: `${difficulty}-${startTime}`,
          difficulty,
          startTime,
          endTime: Date.now(),
          puzzle: initialPuzzle,
          solution: boardState.map(row => row.map(cell => cell.value)),
          moves: moveHistory,
        };
        
        setCompletedGames(prev => {
          const updatedGames = [...prev, newCompletedGame];
          try {
            localStorage.setItem('completedSudokuGames', JSON.stringify(updatedGames));
          } catch(e){
            console.error("Failed to save game:", e);
          }
          return updatedGames;
        });
      }
    }
  }, [boardState, checkWinCondition, view, isWon, difficulty, initialPuzzle, solution, startTime, moveHistory, settings.saveHistory]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (view !== 'game' || !selectedCell) return;
      
      const key = event.key;
      if (key >= '1' && key <= '9') {
        event.preventDefault();
        handleNumberInput(parseInt(key, 10), true);
      } else if (key === 'Backspace' || key === 'Delete') {
        event.preventDefault();
        handleErase(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, selectedCell, handleNumberInput, handleErase]);

  const handleSettingsChange = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings };
      try {
        localStorage.setItem('sudokuSettings', JSON.stringify(updatedSettings));
      } catch (e) {
        console.error("Failed to save settings:", e);
      }
      return updatedSettings;
    });
  };

  const handleDeleteHistory = () => {
    if (window.confirm('Are you sure you want to delete all game history? This action cannot be undone.')) {
      setCompletedGames(() => []);
      setInProgressGames(() => []);
      try {
        localStorage.removeItem('completedSudokuGames');
        localStorage.removeItem('inProgressSudokuGames');
      } catch (e) {
        console.error("Failed to delete history:", e);
      }
      alert('All game history has been deleted.');
    }
  };
  
  const resumeGame = (gameToResume: InProgressGame) => {
    setInProgressGames(prev => {
      const updatedGames = prev.filter(g => g.id !== gameToResume.id);
      try {
        localStorage.setItem('inProgressSudokuGames', JSON.stringify(updatedGames));
      } catch (e) { console.error("Failed to update in-progress games on resume:", e); }
      return updatedGames;
    });

    setDifficulty(gameToResume.difficulty);
    setBoardState(gameToResume.boardState);
    setInitialPuzzle(gameToResume.puzzle);
    setSolution(gameToResume.solution);
    setSelectedCell(null);
    setIsWon(false);
    setMoveHistory([]);
    setStartTime(Date.now() - gameToResume.elapsedTime * 1000);
    setElapsedTime(gameToResume.elapsedTime);
    setView('game');
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;

    // Do not initiate drag for buttons or interactive board cells
    if (target.closest('button, [data-interactive-cell="true"]')) {
      return;
    }

    if ((view === 'history' || view === 'settings') && e.clientX > 40) return;
    
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [view]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    // Start dragging only after a small movement threshold
    if (!isDragging && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        const isHorizontalDrag = Math.abs(deltaX) > Math.abs(deltaY);

        if (view === 'game' && isHorizontalDrag) {
            dragStartRef.current = null;
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            return;
        }
        if ((view === 'history' || view === 'settings') && !isHorizontalDrag) {
            dragStartRef.current = null;
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            return;
        }
        setIsDragging(true);
    }

    if (isDragging) {
        if (view === 'history' || view === 'settings') {
            if (deltaX > 0) setDragX(deltaX);
        } else if (view === 'game') {
            if (deltaY > 0) setDragY(deltaY);
        }
    }
  }, [isDragging, view]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    
    if (isDragging) {
      const thresholdX = window.innerWidth / 3;
      const thresholdY = window.innerHeight / 4;
      let shouldReturn = false;
      
      if ((view === 'history' || view === 'settings') && dragX > thresholdX) shouldReturn = true;
      if (view === 'game' && dragY > thresholdY) shouldReturn = true;

      if (shouldReturn) {
        resetToMenu();
      }
    }

    setIsDragging(false);
    setDragX(0);
    setDragY(0);
    dragStartRef.current = null;
  }, [isDragging, view, dragX, dragY, resetToMenu]);
  
  const getScreenStyle = (screen: 'game' | 'history' | 'settings') => {
    const isVisible = view === screen;
    let transform = '';
    if (screen === 'game') {
      transform = `translateY(${isVisible ? dragY + 'px' : '100vh'})`;
    } else {
      transform = `translateX(${isVisible ? dragX + 'px' : '100vw'})`;
    }
    return {
      transform,
      transition: isDragging || isInstant ? 'none' : 'transform 250ms cubic-bezier(0.215, 0.610, 0.355, 1.000)',
      touchAction: (screen === 'game' ? 'pan-x' : 'pan-y'),
    };
  };

  const menuScreen = (
    <>
      <button
        onClick={() => setView('settings')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-gray-500 hover:text-black transition-all duration-200 text-sm uppercase tracking-widest font-semibold px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400"
        aria-label="Open settings"
      >
        Settings
      </button>
      <button
        onClick={() => { saveInProgressGame(); setView('history'); }}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-black transition-all duration-200 text-sm uppercase tracking-widest font-semibold px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400"
        aria-label="View game history"
      >
        History
      </button>
      <DifficultySelector onSelectDifficulty={newGame} />
    </>
  );

  const gameScreen = (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full px-2">
      <header className="text-center py-4 flex-shrink-0">
        <h1 className="font-display text-5xl tracking-wider">SUDOKU</h1>
        {difficulty && <div className="flex items-center justify-center space-x-4 text-gray-500 text-sm tracking-widest mt-1">
          <span>{difficulty.toUpperCase()}</span>
          <span className="flex items-center gap-1"><ClockIcon /> {formatTime(elapsedTime)}</span>
        </div>}
      </header>
      <main className="flex-grow flex flex-col items-center justify-center py-2">
          {boardState && <div className={`w-full max-w-sm flex-shrink-0 transition-all duration-300 ease-in-out ${selectedCell && !boardState[selectedCell.row][selectedCell.col].readonly ? '-translate-y-4 lg:-translate-y-6' : ''}`}>
              <Board boardState={boardState} selectedCell={selectedCell} onCellSelect={handleCellSelect} />
          </div>}
      </main>
      <footer className="py-4 flex-shrink-0">
        {!isMobile && (
          <button onClick={() => resetToMenu(true)} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors tracking-wider text-lg">
            NEW GAME
          </button>
        )}
      </footer>
    </div>
  );

  return (
    <div className="bg-white text-black w-screen h-screen overflow-hidden relative">
      {/* Menu Screen (Base Layer) */}
      <div className={`absolute inset-0 p-2 sm:p-4 flex flex-col items-center justify-center transition-all duration-250 ease-in-out ${view !== 'menu' ? 'scale-95' : 'scale-100'}`}>
        {menuScreen}
      </div>

      {/* Game Screen */}
      <div
        style={getScreenStyle('game')}
        className={`absolute inset-0 z-10 transition-colors duration-200 ${selectedCell ? 'bg-gray-50' : 'bg-white'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {view === 'game' && gameScreen}
      </div>

      {/* History Screen */}
      <div
        style={getScreenStyle('history')}
        className="absolute inset-0 bg-white z-10"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {view === 'history' && <HistoryScreen completedGames={completedGames} inProgressGames={inProgressGames} onBack={resetToMenu} onResumeGame={resumeGame} isMobile={isMobile} />}
      </div>

      {/* Settings Screen */}
      <div
        style={getScreenStyle('settings')}
        className="absolute inset-0 bg-white z-10"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {view === 'settings' && <SettingsScreen settings={settings} onSettingsChange={handleSettingsChange} onDeleteHistory={handleDeleteHistory} onBack={resetToMenu} isMobile={isMobile} />}
      </div>

      {view === 'game' && boardState && (
        <NumberPad 
          isOpen={!!selectedCell && !boardState[selectedCell.row][selectedCell.col].readonly} 
          onNumberSelect={handleNumberInput} 
          onErase={handleErase} 
          onClose={handleClosePad} 
        />
      )}

      <WinToast isOpen={isWon} onPlayAgain={() => newGame(difficulty!)} onMainMenu={() => resetToMenu(true)} />
    </div>
  );
};

export default App;