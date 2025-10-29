export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  Expert = 'Expert',
  Master = 'Master',
}

export type Grid = number[][];

export interface Cell {
  value: number;
  readonly: boolean;
  isError?: boolean;
}

export type BoardState = Cell[][];

export interface Move {
  row: number;
  col: number;
  value: number; // 0 for erase
  timestamp: number;
}

export interface CompletedGame {
  id: string;
  difficulty: Difficulty;
  startTime: number;
  endTime: number;
  puzzle: Grid;
  solution: Grid;
  moves: Move[];
}

export interface InProgressGame {
  id: string;
  difficulty: Difficulty;
  startTime: number;
  puzzle: Grid;
  solution: Grid;
  boardState: BoardState;
  elapsedTime: number;
}

export enum MistakeHighlightMode {
  None = 'none',
  Temporary = 'temporary',
  Persistent = 'persistent',
}

export interface AppSettings {
  saveHistory: boolean;
  mistakeHighlighting: MistakeHighlightMode;
}