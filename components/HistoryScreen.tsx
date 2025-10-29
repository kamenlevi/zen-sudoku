import React, { useState, useMemo } from 'react';
import { CompletedGame, Difficulty, InProgressGame } from '../types';
import MiniBoard from './MiniBoard';
import StatisticsModal from './StatisticsModal';

interface HistoryScreenProps {
  completedGames: CompletedGame[];
  inProgressGames: InProgressGame[];
  onBack: (instant?: boolean) => void;
  onResumeGame: (game: InProgressGame) => void;
  isMobile: boolean;
}

type Tab = Difficulty | 'In Progress';
const TABS: Tab[] = ['In Progress', Difficulty.Easy, Difficulty.Medium, Difficulty.Hard, Difficulty.Expert, Difficulty.Master];

const HistoryScreen: React.FC<HistoryScreenProps> = ({ completedGames, inProgressGames, onBack, onResumeGame, isMobile }) => {
  const [activeTab, setActiveTab] = useState<Tab>('In Progress');
  const [selectedGame, setSelectedGame] = useState<CompletedGame | null>(null);

  const gameData = useMemo(() => {
    const counts: { [key in Tab]: number } = {
      'In Progress': inProgressGames.length,
      [Difficulty.Easy]: 0,
      [Difficulty.Medium]: 0,
      [Difficulty.Hard]: 0,
      [Difficulty.Expert]: 0,
      [Difficulty.Master]: 0,
    };
    const filteredCompleted: { [key in Difficulty]: CompletedGame[] } = {
      [Difficulty.Easy]: [],
      [Difficulty.Medium]: [],
      [Difficulty.Hard]: [],
      [Difficulty.Expert]: [],
      [Difficulty.Master]: [],
    };

    completedGames.forEach(game => {
      if (game.difficulty in counts) {
        counts[game.difficulty]++;
        filteredCompleted[game.difficulty].push(game);
      }
    });
    
    Object.values(filteredCompleted).forEach(arr => arr.sort((a, b) => b.startTime - a.startTime));
    const sortedInProgress = [...inProgressGames].sort((a, b) => b.startTime - a.startTime);

    return { counts, filteredCompleted, sortedInProgress };
  }, [completedGames, inProgressGames]);

  const renderContent = () => {
    if (activeTab === 'In Progress') {
      if (gameData.sortedInProgress.length > 0) {
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gameData.sortedInProgress.map(game => {
              const totalToFill = game.boardState.flat().filter(cell => !cell.readonly).length;
              const filled = game.boardState.flat().filter(cell => !cell.readonly && cell.value !== 0).length;
              const progress = totalToFill > 0 ? Math.round((filled / totalToFill) * 100) : 100;

              return (
                <div key={game.id} className="cursor-pointer group" onClick={() => onResumeGame(game)}>
                  <MiniBoard board={game.boardState} className="shadow group-hover:shadow-lg transition-shadow" />
                  <div className="text-center text-xs text-gray-500 mt-1">
                    <p>{game.difficulty}</p>
                    <p>{progress}% Complete</p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      return (
        <div className="text-center text-gray-500 pt-16">
          <p className="text-xl">No games in progress.</p>
        </div>
      );
    }
    
    const activeGames = gameData.filteredCompleted[activeTab as Difficulty];
    if (activeGames.length > 0) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {activeGames.map(game => (
            <div key={game.id} className="cursor-pointer group" onClick={() => setSelectedGame(game)}>
              <MiniBoard board={game.solution} className="shadow group-hover:shadow-lg transition-shadow" />
              <p className="text-center text-xs text-gray-500 mt-1">{new Date(game.startTime).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-center text-gray-500 pt-16">
        <p className="text-xl">No puzzles completed for this difficulty yet.</p>
      </div>
    );
  };

  return (
    <div className="w-full h-full max-w-lg mx-auto flex flex-col p-4">
      <header className="text-center py-4 flex-shrink-0">
        <h1 className="font-display text-4xl sm:text-5xl tracking-wider">HISTORY</h1>
      </header>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-3 py-4 flex-shrink-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`p-3 rounded-lg text-center transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
              activeTab === tab
                ? 'bg-black text-white shadow-lg'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            <span className="block font-semibold text-sm sm:text-base">{tab}</span>
            <span className={`block text-xs sm:text-sm mt-0.5 ${activeTab === tab ? 'text-gray-300' : 'text-gray-500'}`}>
              {gameData.counts[tab]} {gameData.counts[tab] === 1 ? 'game' : 'games'}
            </span>
          </button>
        ))}
      </div>

      <main className="flex-grow pt-2 overflow-y-auto">
        {renderContent()}
      </main>

      <footer className="py-4 flex-shrink-0">
        {!isMobile && (
          <button
            onClick={() => onBack(true)}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 tracking-wider text-lg">
            MAIN MENU
          </button>
        )}
      </footer>

      <StatisticsModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </div>
  );
};

export default HistoryScreen;