import { Difficulty, Grid } from '../types';

const baseSolvedBoard: Grid = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

function shuffleArray<T,>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function createShuffledBoard(): Grid {
  const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const numberMap = new Map<number, number>();
  for (let i = 0; i < 9; i++) {
    numberMap.set(i + 1, numbers[i]);
  }

  return baseSolvedBoard.map(row => 
    row.map(cellValue => numberMap.get(cellValue)!)
  );
}


export function generateSudoku(difficulty: Difficulty): { puzzle: Grid, solution: Grid } {
  const solution = createShuffledBoard();
  const puzzle = JSON.parse(JSON.stringify(solution));

  let holes: number;
  switch (difficulty) {
    case Difficulty.Easy:
      holes = 35;
      break;
    case Difficulty.Medium:
      holes = 45;
      break;
    case Difficulty.Hard:
      holes = 55;
      break;
    case Difficulty.Expert:
      holes = 60;
      break;
    case Difficulty.Master:
      holes = 64;
      break;
    default:
      holes = 45;
  }
  
  let attempts = 0;
  const maxAttempts = 300; // Increased attempts for harder puzzles

  while (holes > 0 && attempts < maxAttempts) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      holes--;
    }
    attempts++;
  }

  return { puzzle, solution };
}