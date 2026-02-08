'use client';
import React, { useState } from 'react';
import Sync from './sync';
import StartGameModal from './StartGameModel';
import HistoryViewer from './HistoryViewer';
import { RugbyGame } from '../types';

interface GameSetupScreenProps {
  historicGames: RugbyGame[];
  setHistoricGames: React.Dispatch<React.SetStateAction<RugbyGame[]>>;
  onStartMatch: (opponentName: string, home: boolean) => void; // Parent still handles the "Start"
  syncData: any;
  overwriteData: (incoming: any) => void;
}

export default function GameSetupScreen({
  historicGames,
  setHistoricGames,
  onStartMatch,
  syncData,
  overwriteData
}: GameSetupScreenProps) {
  // Localize setup-only state
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [opponentNameInput, setOpponentNameInput] = useState('');

  const openModal = () => setIsStartModalOpen(true);
  const closeModal = () => setIsStartModalOpen(false);

  return (
    <>
      <Sync name="rug" overwriteData={overwriteData} data={syncData} />

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        {/* ... Header and Hero Text ... */}

        <button
          className="text-center text-xl bg-green-500 hover:bg-green-600 active:bg-green-700 
                     text-white font-bold h-20 w-60 m-4 p-4 rounded-2xl shadow-lg transition"
          onClick={openModal}
        >
          Start New Game
        </button>

        <StartGameModal
          isOpen={isStartModalOpen}
          onClose={closeModal}
          onStart={(name, home) => {
            onStartMatch(name, home); // Call parent to switch views
            closeModal();
            setOpponentNameInput('');
          }}
          input={opponentNameInput}
          setInput={setOpponentNameInput}
        />

        <div className="w-full max-w-xl mt-10">
          <HistoryViewer games={historicGames} setGames={setHistoricGames} />
        </div>
      </div>
    </>
  );
}