import React from 'react';
import { Grid, BoardState, Cell } from '../types';

interface MiniBoardProps {
  board: Grid | BoardState;
  className?: string;
}

const isBoardState = (board: Grid | BoardState): board is BoardState => {
  return typeof board[0][0] === 'object' && board[0][0] !== null;
};

const MiniBoard: React.FC<MiniBoardProps> = ({ board, className = '' }) => {
  const isState = isBoardState(board);

  return (
    <div className={`aspect-square bg-white grid grid-cols-9 grid-rows-9 border border-gray-300 rounded-sm ${className}`}>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const cellValue = isState ? (cell as Cell).value : (cell as number);
          const isReadonly = isState ? (cell as Cell).readonly : true;
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                border-r border-b border-gray-200
                ${(colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-gray-300' : ''}
                ${(rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-gray-300' : ''}
                flex items-center justify-center
              `}
            >
              <span className={`text-[0.6em] sm:text-xs ${
                isReadonly ? 'text-gray-800' : 'text-blue-600 font-semibold'
              }`}>
                  {cellValue !== 0 ? cellValue : ''}
              </span>
            </div>
          )
        })
      )}
    </div>
  );
};

export default MiniBoard;