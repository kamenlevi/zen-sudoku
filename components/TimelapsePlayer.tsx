import React, { useState, useEffect, useRef } from 'react';
import { Grid, Move } from '../types';
import { PlayIcon, PauseIcon, RestartIcon } from './icons';

interface TimelapsePlayerProps {
  initialPuzzle: Grid;
  moves: Move[];
}

const ReplayBoard: React.FC<{ board: Grid }> = ({ board }) => {
    return (
        <div className="aspect-square bg-white grid grid-cols-9 grid-rows-9 border border-gray-300 rounded-sm shadow-inner">
          {board.map((row, rowIndex) =>
            row.map((cellValue, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  border-r border-b border-gray-200
                  ${(colIndex + 1) % 3 === 0 && colIndex < 8 ? '!border-r-gray-400' : ''}
                  ${(rowIndex + 1) % 3 === 0 && rowIndex < 8 ? '!border-b-gray-400' : ''}
                  flex items-center justify-center
                `}
              >
                <span className="text-sm sm:text-base text-gray-800 font-medium">
                    {cellValue !== 0 ? cellValue : ''}
                </span>
              </div>
            ))
          )}
        </div>
      );
};


const TimelapsePlayer: React.FC<TimelapsePlayerProps> = ({ initialPuzzle, moves }) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [board, setBoard] = useState<Grid>(initialPuzzle);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const applyMoves = (index: number) => {
    let newBoard = JSON.parse(JSON.stringify(initialPuzzle));
    for (let i = 0; i <= index; i++) {
      if (moves[i]) {
        const { row, col, value } = moves[i];
        newBoard[row][col] = value;
      }
    }
    setBoard(newBoard);
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentMoveIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= moves.length) {
            setIsPlaying(false);
            return prevIndex;
          }
          return nextIndex;
        });
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, moves.length]);

  useEffect(() => {
    applyMoves(currentMoveIndex);
  }, [currentMoveIndex]);

  const handlePlayPause = () => {
    if (currentMoveIndex >= moves.length - 1) {
        handleRestart();
        setIsPlaying(true);
    } else {
        setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(-1);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[250px] mb-4">
        <ReplayBoard board={board} />
      </div>
      <div className="w-full max-w-[250px] flex items-center justify-between bg-gray-100 p-2 rounded-lg">
        <div className="flex items-center space-x-2">
            <button onClick={handlePlayPause} className="text-gray-700 hover:text-black p-1 rounded-full transition-colors">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={handleRestart} className="text-gray-700 hover:text-black p-1 rounded-full transition-colors">
                <RestartIcon />
            </button>
        </div>
        <div className="text-sm font-mono text-gray-600">
            {currentMoveIndex + 1} / {moves.length}
        </div>
      </div>
    </div>
  );
};

export default TimelapsePlayer;