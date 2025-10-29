import React from 'react';
import { Difficulty } from '../types';
import { DIFFICULTIES } from '../constants';

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <h2 className="font-display text-3xl text-gray-700 mb-4">Choose Difficulty</h2>
      {DIFFICULTIES.map((level) => (
        <button
          key={level}
          onClick={() => onSelectDifficulty(level)}
          className="w-56 py-3 text-lg tracking-widest text-black bg-transparent border-2 border-gray-400 rounded-lg hover:bg-black hover:text-white transition-all duration-150 ease-in-out"
        >
          {level}
        </button>
      ))}
    </div>
  );
};

export default DifficultySelector;
