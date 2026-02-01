// pages/index.tsx (Main App View)
'use client';
import { useState, useMemo, useEffect } from 'react';
import { RugbyGame, ScoreEvent, RUGBY_RULES, PLAYERS, AnimationData } from './types';
import GameTimer from './components/Timer';
import { v4 as uuidv4 } from 'uuid';
import HistoryViewer from './components/HistoryViewer';
import { useLocalStorage } from 'usehooks-ts';
import FinishGameModal from './components/FinishGameModal';
import StartGameModal from './components/StartGameModel';
import TryAnimationOverlay from './components/TryAnimationOverlay';
import Sync from './components/sync';
import ScoreUnit from './components/ScoreUnit';




export default function ScorekeeperApp() {
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [postGameComment, setPostGameComment] = useState('');
  const [activeGame, setActiveGame] = useState<RugbyGame | null>(null);
  const [historicGames, setHistoricGames] = useLocalStorage('rugby_history', new Array<RugbyGame>());
  const [isStartModalOpen, setIsStartModalOpen] = useState(false); // NEW STATE for the Start Modal
  const [opponentNameInput, setOpponentNameInput] = useState(''); // NEW STATE for modal input
  const [animationData, setAnimationData] = useState<AnimationData | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isHome, setIsHome] = useState(activeGame?.home);


  useEffect(() => {
    setHasMounted(true);
  }, []);

  const startNewGameFlow = () => {
    setIsStartModalOpen(true);
  };

  const handleScore = (playerId: string, type: 'try' | 'conversion', event: React.MouseEvent<HTMLButtonElement>) => {
    if (!activeGame || activeGame.isFinished) return;

    const rect = event.currentTarget.getBoundingClientRect();

    // Start the animation at the center of the button
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    // Set the animation data
    setAnimationData({
      type: type.toUpperCase() as 'TRY' | 'CONVERSION',
      startX,
      startY,
    });

    // Auto-dismiss the animation after 1.5 seconds
    setTimeout(() => {
      setAnimationData(null);
    }, 1500);

    const newEvent: ScoreEvent = {
      id: uuidv4(),
      playerId,
      type,
      points: RUGBY_RULES[type],
      timestamp: Date.now(), // Record score time
    };

    const newGame: RugbyGame = {
      ...activeGame,
      scoreEvents: [...activeGame.scoreEvents, newEvent],
    };
    setActiveGame(newGame);
    setIsHome(newGame.home);
    localStorage.setItem('activeGame', JSON.stringify(newGame));
  };

  const handleGameSetup = (opponentName: string, home: boolean) => {
    // We can now remove the prompt() call as the name comes from the argument

    // ... existing initialization logic ...
    const newGame: RugbyGame = {
      id: uuidv4(),
      opponent: opponentName || 'Opponent Team', // Use the collected name
      startTime: Date.now(),
      pauseTime: null,
      elapsedTimeAtPause: 0,
      opponentScore: 0,
      isFinished: false,
      scoreEvents: [],
      comments: '',
      home
    };

    setIsHome(newGame.home);
    setActiveGame(newGame);
    localStorage.setItem('activeGame', JSON.stringify(newGame));

    setIsStartModalOpen(false); // Close the modal
    setOpponentNameInput(''); // Clear the input state
  };

  const handleTogglePause = () => {
    if (!activeGame) return;

    const now = Date.now();
    let newGame: RugbyGame;

    if (activeGame.pauseTime === null) {
      // --- PAUSE LOGIC ---
      // 1. Calculate the total elapsed time up to the moment of pausing.
      const currentElapsed = now - activeGame.startTime + activeGame.elapsedTimeAtPause;

      newGame = {
        ...activeGame,
        pauseTime: now, // Record the absolute time of the pause
        elapsedTimeAtPause: currentElapsed, // Store the running total time
      };

    } else {
      // We only need to reset startTime back to 'now' because the running total 
      // time is already saved in activeGame.elapsedTimeAtPause.

      // Calculate the duration of the pause to ensure accuracy, 
      // although we don't strictly need it for the state update,
      // it helps to verify that the time has been tracked correctly.
      const pauseDuration = now - activeGame.pauseTime;

      newGame = {
        ...activeGame,
        // Reset startTime to NOW. The timer calculation (Date.now() - startTime)
        // will start calculating the NEW segment from zero, adding to the 
        // PREVIOUSLY saved elapsedTimeAtPause.
        startTime: now,
        pauseTime: null,
        // elapsedTimeAtPause REMAINS the same total time as when it was paused.
      };
    }

    setActiveGame(newGame);
    localStorage.setItem('activeGame', JSON.stringify(newGame));
  };

  const handleOpponentScore = (type: 'try' | 'conversion') => {
    if (!activeGame || activeGame.isFinished) return;

    const points = RUGBY_RULES[type];

    const newGame: RugbyGame = {
      ...activeGame,
      // Increment the opponent's score
      opponentScore: activeGame.opponentScore + points,
    };

    setActiveGame(newGame);
    localStorage.setItem('activeGame', JSON.stringify(newGame));
  };

  const finishGame = () => {
    if (!activeGame) return;
    // Step 1: Stop the timer (if running) and save the final elapsed time
    const now = Date.now();
    let finalElapsed = activeGame.elapsedTimeAtPause;

    // If the game was running when the button was pressed, calculate the last segment of time
    if (activeGame.pauseTime === null && !activeGame.isFinished) {
      finalElapsed = activeGame.elapsedTimeAtPause + (now - activeGame.startTime);
    }

    // Step 2: Update the activeGame object with the final time and finished status
    const finalActiveGame: RugbyGame = {
      ...activeGame,
      isFinished: true,
      pauseTime: null,
      // This is the total time elapsed for the whole game
      elapsedTimeAtPause: finalElapsed,
    };

    setActiveGame(finalActiveGame);
    localStorage.setItem('activeGame', JSON.stringify(finalActiveGame));

    // Step 3: Open the comment collection modal
    setIsFinishModalOpen(true);
  };

  const calculatedTotalScore = useMemo(() => {
    return activeGame?.scoreEvents.reduce((total, event) => total + event.points, 0) || 0;
  }, [activeGame]);

  const overwriteData = (incoming: any) => {
    const data = incoming.value.data;
    console.log('overwrite:', isFinishModalOpen, postGameComment, activeGame, historicGames, isStartModalOpen, opponentNameInput);
    setIsFinishModalOpen(data.isFinishModalOpen);
    setPostGameComment(data.postGameComment);
    setActiveGame(data.activeGame);
    setIsHome(data.activeGame.home);
    setHistoricGames(data.historicGames);
    setIsStartModalOpen(data.isStartModalOpen);
    setOpponentNameInput(data.opponentNameInput);
  }

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 font-bold animate-pulse">Loading Rugby Scorekeeper...</p>
      </div>
    );
  }

  // --- RENDERING ---
  if (!activeGame) {
    return (
      <>
        <Sync name='rug' overwriteData={overwriteData} data={{
          isFinishModalOpen, postGameComment, activeGame, historicGames, isStartModalOpen, opponentNameInput
        }} ></Sync>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-6">
            Rugby Scorekeeper
          </h1>
          <p className="text-gray-600 mb-8 text-lg text-center max-w-sm">
            Track match time, score player tries, and save game history.
          </p>

          {/* YOUR STYLED START BUTTON */}
          <button
            className='text-center text-xl bg-green-500 hover:bg-green-600 active:bg-green-700 
                             text-white font-bold h-20 w-60 m-4 p-4 rounded-2xl shadow-lg 
                             transition duration-150 ease-in-out'
            onClick={startNewGameFlow}
          >
            Start New Game
          </button>

          <StartGameModal
            isOpen={isStartModalOpen}
            onClose={() => setIsStartModalOpen(false)}

            // --> IT IS PASSED HERE <--
            onStart={handleGameSetup}

            input={opponentNameInput}
            setInput={setOpponentNameInput}
          />


          <div className="w-full max-w-xl mt-10">
            <HistoryViewer games={historicGames} setGames={setHistoricGames} />
          </div>
        </div></>)
  }

  const handleSaveFinalGame = () => {
    if (!activeGame) return;

    // 1. Create the final game object with the collected comment
    const finishedGameWithComment: RugbyGame = {
      ...activeGame,
      comments: postGameComment,
    };

    // 2. Save to history
    setHistoricGames((prev: RugbyGame[]) => [finishedGameWithComment, ...prev]);

    // 3. Clear active game state and LocalStorage
    setActiveGame(null);
    localStorage.removeItem('activeGame');

    // 4. Reset modal state
    setIsFinishModalOpen(false);
    setPostGameComment('');
  };

  const handleUndoLastScore = () => {
    if (!activeGame || activeGame.scoreEvents.length === 0) return;

    const { scoreEvents } = activeGame;

    // 1. Find the score event with the latest timestamp
    const lastScoreEvent = scoreEvents.reduce((latest, current) => {
      return (current.timestamp > latest.timestamp) ? current : latest;
    }, scoreEvents[0]);

    // 2. Filter the score events to exclude the last one found
    const updatedScoreEvents = scoreEvents.filter(event => event.id !== lastScoreEvent.id);

    // 3. Create the new game state
    const newGame: RugbyGame = {
      ...activeGame,
      scoreEvents: updatedScoreEvents,
    };

    // 4. Update state and persistence
    setActiveGame(newGame);
    localStorage.setItem('activeGame', JSON.stringify(newGame));
  };

  const handleUndoOpponentScore = () => {
    if (!activeGame || activeGame.opponentScore <= 0) return;

    // This is simpler as we don't track individual opponent events, 
    // we must prompt or ask the user which amount to undo.
    // For simplicity, we'll implement a single-point undo (undo last point total)

    // In a real app, you'd track opponent events too, but since we don't, 
    // we'll make a simplification: undo the largest typical score (try=5 points) 
    // and let the user correct it later, or prompt for the amount.

    // For robust scoring, the best approach is to prompt the user:
    const undoAmount = parseInt(prompt("Enter points to subtract from Opponent Score (e.g., 5 or 2):") || '0');

    if (undoAmount > 0) {
      const newScore = Math.max(0, activeGame.opponentScore - undoAmount);
      const newGame: RugbyGame = {
        ...activeGame,
        opponentScore: newScore,
      };
      setActiveGame(newGame);
      localStorage.setItem('activeGame', JSON.stringify(newGame));
    }
  };
  return (
    <>
      <Sync name='rug' overwriteData={overwriteData} data={{
        isFinishModalOpen, postGameComment, activeGame, historicGames, isStartModalOpen, opponentNameInput
      }} ></Sync>

      <div className="flex flex-col items-center min-h-screen bg-blue-300 p-4">
        {/* 1. Use the GameTimer to CALCULATE the time (It will call the setter below) */}

        {/* 2. Integrate the elapsedTimeDisplay into the score banner */}
        <div className="score-display text-center my-4 w-full grid grid-cols-3 h-30 justify-around items-center">

          {!isHome && <ScoreUnit score={activeGame.opponentScore} label={activeGame.opponent} onUndo={handleUndoOpponentScore} colourClass={'text-red-600'}></ScoreUnit>}
          {isHome && <ScoreUnit score={calculatedTotalScore} label={'Southwell City'} onUndo={handleUndoLastScore} colourClass={'text-green-600'}></ScoreUnit>}

          <span className="text-2xl font-bold tabular-nums w-38 justify-self-center">
            <GameTimer
              game={activeGame}
              onTimerUpdate={(ms) => { }}
            />

          </span>
          {isHome && <ScoreUnit score={activeGame.opponentScore} label={activeGame.opponent} onUndo={handleUndoOpponentScore} colourClass={'text-red-600'}></ScoreUnit>}
          {!isHome && <ScoreUnit score={calculatedTotalScore} label={'Southwell City'} onUndo={handleUndoLastScore} colourClass={'text-green-600'}></ScoreUnit>}

        </div>

        <button
          onClick={handleTogglePause}
          className={`w-full max-w-sm py-3 mb-4 text-white font-semibold rounded-lg shadow-md transition duration-150 ${activeGame.pauseTime === null
            ? 'bg-yellow-500 hover:bg-yellow-600' // PAUSE color
            : 'bg-indigo-600 hover:bg-indigo-700' // RESUME color
            }`}
        >
          {activeGame.pauseTime === null ? '⏸️ Pause Game' : '▶️ Resume Game'}
        </button>

        <h3 className="text-xl font-bold text-gray-700 mt-4 mb-2"></h3>
        <div className="flex justify-center gap-6 mb-6">
          <button
            onClick={() => handleOpponentScore('try')}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition shadow-md"
          >
            Opponent Try
          </button>
          {/* <button
          onClick={() => handleOpponentScore('conversion')}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg transition shadow-md"
        >
          Opponent Conversion (+2)
        </button> */}
        </div>

        <h3 className="text-xl font-bold text-gray-700 mt-4 mb-2"></h3>

        <div className="grid grid-cols-4 gap-3 w-full max-w-xl mb-6">
          {PLAYERS.map(player => (
            <div key={player.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <p className="font-semibold text-lg text-gray-800 truncate mb-2">{player.name}</p>
              <div className="flex justify-between gap-2">
                <button
                  onClick={(e) => handleScore(player.id, 'try', e)}
                  className="flex-1 py-2 bg-green-500 w-100 hover:bg-green-600 text-white text-sm font-medium rounded-md transition shadow-sm"
                >
                  Try
                </button>
                {/* <button
                onClick={() => handleScore(player.id, 'conversion')}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition shadow-sm"
              >
                Conversion (+2)
              </button> */}
              </div>
            </div>
          ))}
        </div>

        {/* END GAME BUTTON */}
        <h3 className="text-xl font-bold text-gray-700 mb-2"></h3>
        <button
          type="button" // Prevent default form submission on click
          onClick={() => setIsHome(!isHome)}
          className={`w-full max-w-sm py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition mb-2 ${isHome
            ? ""
            : "w-full max-w-sm py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition"
            }`}
        >
          {isHome && <div>Home</div>}
          {!isHome && <div>Away</div>}
        </button>


        <button
          className="w-full max-w-sm py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition"
          onClick={finishGame}
        >
          🏁 End Match and Save
        </button>

        <FinishGameModal
          isOpen={isFinishModalOpen}
          onClose={() => setIsFinishModalOpen(false)}
          onSave={handleSaveFinalGame}
          comment={postGameComment}
          setComment={setPostGameComment}
          finalScore={calculatedTotalScore - activeGame.opponentScore} // Example: Our score minus their score
        />

        <TryAnimationOverlay data={animationData} />

        {/* History Component */}
        <div className="w-full max-w-xl mt-8">
          <HistoryViewer games={historicGames} setGames={setHistoricGames} />
        </div>
      </div>
    </>
  );
}