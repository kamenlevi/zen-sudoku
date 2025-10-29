import React from 'react';
import { BoardState } from '../types';

interface BoardProps {
  boardState: BoardState;
  selectedCell: { row: number; col: number } | null;
  onCellSelect: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ boardState, selectedCell, onCellSelect }) => {
  const getCellClasses = (row: number, col: number): string => {
    const cell = boardState[row][col];
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;

    // Base classes for all cells
    const baseClasses = [
      'w-full h-full flex items-center justify-center text-2xl cursor-pointer select-none',
      'transform transition-all duration-150 ease-out'
    ];

    // Determine base text styling
    let textClass = '';
    if (cell.isError) {
      textClass = 'text-red-500 font-bold';
    } else if (cell.readonly) {
      textClass = 'text-black font-bold'; // Thicker original numbers
    } else {
      textClass = 'text-gray-800 font-medium'; // Sharper user-input numbers
    }
    
    // Default background for all non-highlighted cells is now always white.
    let backgroundClass = 'bg-white';
    let transformClass = '';

    // Highlighting logic when a cell is selected
    if (selectedCell) {
        const selectedCellData = boardState[selectedCell.row][selectedCell.col];
        const selectedValue = selectedCellData.value;

        const inSameRow = selectedCell.row === row;
        const inSameCol = selectedCell.col === col;
        const inSameBox = 
            Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
            Math.floor(selectedCell.col / 3) === Math.floor(col / 3);
        const hasSameValue = selectedValue !== 0 && cell.value === selectedValue;

        // Light gray for related group, overwrites the default white.
        if (inSameRow || inSameCol || inSameBox) {
            backgroundClass = 'bg-gray-100';
        }

        // A softer gray for matching numbers, this overrides the group highlight
        if (hasSameValue) {
            backgroundClass = 'bg-gray-300';
        }
        
        // The selected cell gets the pop-up effect and the same soft highlight
        if (isSelected) {
            backgroundClass = 'bg-gray-300';
            transformClass = 'scale-110 shadow-lg z-20';
        }
    }

    return [...baseClasses, backgroundClass, textClass, transformClass].join(' ');
  };

  return (
    <div className="w-full aspect-square grid grid-cols-9 grid-rows-9 border-2 border-gray-400 rounded-lg transition-colors duration-150 bg-white">
      {boardState.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            data-interactive-cell="true"
            className={`
              relative
              border border-gray-200
              ${(colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-r-gray-400' : ''}
              ${(rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-b-gray-400' : ''}
            `}
            onClick={() => onCellSelect(rowIndex, colIndex)}
          >
            <div className={getCellClasses(rowIndex, colIndex)}>
              {cell.value !== 0 ? cell.value : ''}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Board;