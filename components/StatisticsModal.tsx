import React, { useState } from 'react';
import { CompletedGame } from '../types';
import MiniBoard from './MiniBoard';
import TimelapsePlayer from './TimelapsePlayer';
import { formatTime } from '../utils/time';

type SubTab = 'Moves' | 'Timelapse';

interface StatisticsModalProps {
  game: CompletedGame | null;
  onClose: () => void;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ game, onClose }) => {
  const [activeTab, setActiveTab] = useState<SubTab>('Moves');

  if (!game) return null;

  const totalTime = Math.floor((game.endTime - game.startTime) / 1000);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b text-center">
          <h2 className="font-display text-2xl">Game Details</h2>
          <p className="text-sm text-gray-500">{new Date(game.startTime).toLocaleString()}</p>
        </header>

        <main className="p-4 sm:p-6 flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Original Puzzle</h3>
              <MiniBoard board={game.puzzle} />
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Statistics</h3>
                <div className="space-y-2 text-gray-700">
                    <p><strong>Difficulty:</strong> {game.difficulty}</p>
                    <p><strong>Time Taken:</strong> {formatTime(totalTime)}</p>
                    <p><strong>Total Moves:</strong> {game.moves.length}</p>
                </div>
            </div>
          </div>
          
          <div>
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {(['Moves', 'Timelapse'] as SubTab[]).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`${
                            activeTab === tab
                              ? 'border-black text-black'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-md transition-colors`}
                        >
                          {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            {activeTab === 'Moves' && (
                <div className="bg-gray-50 border rounded-md h-48 overflow-y-scroll p-2 text-sm font-mono text-gray-600">
                  {game.moves.map((move, index) => {
                    const moveTime = formatTime(Math.floor((move.timestamp - game.startTime) / 1000));
                    const action = move.value === 0 ? `Erased from` : `Placed ${move.value} at`;
                    return (
                      <p key={index} className="whitespace-nowrap">
                        <span className="text-gray-400">[{moveTime}]</span> {action} ({move.row + 1}, {move.col + 1})
                      </p>
                    )
                  })}
                  {game.moves.length === 0 && <p className="text-center text-gray-500 mt-4">No moves recorded.</p>}
                </div>
            )}

            {activeTab === 'Timelapse' && (
                <TimelapsePlayer initialPuzzle={game.puzzle} moves={game.moves} />
            )}

          </div>
        </main>
        
        <footer className="p-4 border-t text-right">
          <button 
            onClick={onClose}
            className="bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default StatisticsModal;