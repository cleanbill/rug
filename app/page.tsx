'use client';
import { useState, useMemo, useEffect } from 'react';
import { RugbyGame, ScoreEvent, RUGBY_RULES, PLAYERS, AnimationData, SubLogEntry, ScoreLogEntry, TackleLogEntry } from './types';
import { v4 as uuidv4 } from 'uuid';
import HistoryViewer from './components/HistoryViewer';
import { useLocalStorage } from 'usehooks-ts';
import FinishGameModal from './components/FinishGameModal';
import TryAnimationOverlay from './components/TryAnimationOverlay';
import Sync from './components/sync';
import SubstitutionLog from './components/SubstitutionLog';
import { PlayerGrid } from './components/PlayerGrid';
import Scoreboard from './components/ScoreBoard';
import GameSetupScreen from './components/GameSetupScreen';

export default function ScorekeeperApp() {

  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [postGameComment, setPostGameComment] = useState('');
  const [activeGame, setActiveGame] = useState<RugbyGame | null>(null);
  const [historicGames, setHistoricGames] = useLocalStorage('rugby_history', new Array<RugbyGame>());
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [opponentNameInput, setOpponentNameInput] = useState('');
  const [animationData, setAnimationData] = useState<AnimationData | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isHome, setIsHome] = useState(activeGame?.home);
  const [playingIds, setPlayingIds] = useState<string[]>(PLAYERS.map(p => p.id));
  const [tackleCounts, setTackleCounts] = useState<Record<string, number>>({});
  const [subHistory, setSubHistory] = useState<SubLogEntry[]>([]);
  const [tackleHistory, setTackleHistory] = useState<TackleLogEntry[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreLogEntry[]>([]);
  const [playTimes, setPlayTimes] = useState<Record<string, number>>({});
  const [lastOnTime, setLastOnTime] = useState<Record<string, number | null>>(() => {
    const now = Date.now();
    const startTimeMap: Record<string, number> = {};
    PLAYERS.forEach(p => {
      startTimeMap[p.id] = now;
    });
    return startTimeMap;
  });

  useEffect(() => {
    const now = Date.now();
    const initialLastOn: Record<string, number> = {};
    PLAYERS.forEach(p => initialLastOn[p.id] = now);
    setLastOnTime(initialLastOn);
    const savedGame = localStorage.getItem('activeGame');
    if (savedGame) {
      const parsed = JSON.parse(savedGame) as RugbyGame;
      // Hydrate the logs from the saved game data
      setSubHistory(parsed.subHistory || []);
      setTackleHistory(parsed.tackleHistory || []);
      setScoreHistory(parsed.scoreHistory || []);
    }
    setHasMounted(true);
  }, []);

  const handleTackle = (playerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const playerName = PLAYERS.find(p => p.id === playerId)?.name || "Unknown Player";
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTackleCounts(prev => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) + 1
    }));

    setTackleHistory(prev => [{
      id: uuidv4(),
      name: playerName,
      time: currentTime
    }, ...prev]);
  };

  const handleScore = (playerId: string, type: 'try' | 'conversion', event: React.MouseEvent<HTMLButtonElement>) => {
    if (!activeGame || activeGame.isFinished) return;

    const playerName = PLAYERS.find(p => p.id === playerId)?.name || "Unknown Player";
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const scoreId = crypto.randomUUID();
    setScoreHistory(prev => [{
      id: scoreId,
      name: playerName,
      type: type.toUpperCase(),
      time: currentTime
    }, ...prev]);

    const rect = event.currentTarget.getBoundingClientRect();

    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    setAnimationData({
      type: type.toUpperCase() as 'TRY' | 'CONVERSION',
      startX,
      startY,
    });

    setTimeout(() => {
      setAnimationData(null);
    }, 1500);

    const newEvent: ScoreEvent = {
      id: scoreId,
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
    setSubHistory([]);
    setTackleHistory([]);
    setScoreHistory([]);

    setTackleCounts({});
    setPlayTimes({});

    const newGame: RugbyGame = {
      id: uuidv4(),
      opponent: opponentName || 'Opponent Team', // Use the collected name
      startTime: Date.now(),
      pauseTime: Date.now(),
      elapsedTimeAtPause: 0,
      opponentScore: 0,
      isFinished: false,
      scoreEvents: [],
      comments: '',
      home,
      subHistory: [],
      tackleHistory: [],
      scoreHistory: []
    };

    setIsHome(newGame.home);
    setPlayingIds(PLAYERS.map(p => p.id));
    const initialLastOn: Record<string, number | null> = {};
    PLAYERS.forEach(p => initialLastOn[p.id] = null);
    setLastOnTime(initialLastOn);

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

      const updatedPlayTimes = { ...playTimes };
      playingIds.forEach(id => {
        if (lastOnTime[id]) {
          const sessionDuration = Math.floor((now - lastOnTime[id]!) / 1000);
          updatedPlayTimes[id] = (updatedPlayTimes[id] || 0) + sessionDuration;
        }
      });
      setPlayTimes(updatedPlayTimes);

      const currentElapsed = now - activeGame.startTime + activeGame.elapsedTimeAtPause;

      newGame = {
        ...activeGame,
        pauseTime: now, // Record the absolute time of the pause
        elapsedTimeAtPause: currentElapsed, // Store the running total time
      };

    } else {
      const clearedLastOn: Record<string, number | null> = {};
      PLAYERS.forEach(p => clearedLastOn[p.id] = null);
      setLastOnTime(clearedLastOn);
      const updatedLastOn = { ...lastOnTime };
      playingIds.forEach(id => {
        updatedLastOn[id] = now;
      });
      setLastOnTime(updatedLastOn);
      const pauseDuration = now - activeGame.pauseTime;

      newGame = {
        ...activeGame,
        startTime: now,
        pauseTime: null,
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
      opponentScore: activeGame.opponentScore + points,
    };

    setActiveGame(newGame);
    localStorage.setItem('activeGame', JSON.stringify(newGame));
  };

  const handleSaveFinalGame = () => {
    if (!activeGame) return;

    const finishedGameWithComment: RugbyGame = {
      ...activeGame,
      comments: postGameComment,
    };

    setHistoricGames((prev: RugbyGame[]) => [finishedGameWithComment, ...prev]);

    setActiveGame(null);
    localStorage.removeItem('activeGame');

    setIsFinishModalOpen(false);
    setPostGameComment('');
  };

  const handleUndoLastScore = () => {
    if (!activeGame || activeGame.scoreEvents.length === 0) return;

    const { scoreEvents } = activeGame;

    const lastScoreEvent = scoreEvents.reduce((latest, current) => {
      return (current.timestamp > latest.timestamp) ? current : latest;
    }, scoreEvents[0]);

    const updatedScoreEvents = scoreEvents.filter(event => event.id !== lastScoreEvent.id);
    const updatedScoreHistory = scoreHistory.filter(event => event.id !== lastScoreEvent.id);

    const newGame: RugbyGame = {
      ...activeGame,
      scoreHistory: updatedScoreHistory,
      scoreEvents: updatedScoreEvents,
    };

    setActiveGame(newGame);
    localStorage.setItem('activeGame', JSON.stringify(newGame));
  };

  const handleUndoOpponentScore = () => {
    if (!activeGame || activeGame.opponentScore <= 0) return;

    const undoAmount = 5;//parseInt(prompt("Enter points to subtract from Opponent Score (e.g., 5 or 2):") || '0');

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

  const togglePlayerStatus = (playerId: string, playerName: string) => {
    const now = Date.now();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isGoingOff = playingIds.includes(playerId);

    if (isGoingOff) {
      const sessionDuration = Math.floor((now - (lastOnTime[playerId] || now)) / 1000);
      setPlayTimes(prev => ({
        ...prev,
        [playerId]: (prev[playerId] || 0) + sessionDuration
      }));
      setLastOnTime(prev => ({ ...prev, [playerId]: null }));
    } else {
      setLastOnTime(prev => ({ ...prev, [playerId]: now }));
    }

    setPlayingIds(prev =>
      isGoingOff ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );

    setSubHistory(prev => [{
      id: crypto.randomUUID(),
      name: playerName,
      type: isGoingOff ? 'OFF' : 'ON',
      time: currentTime
    }, ...prev]); // Newest at the top
  };

  const finishGame = () => {
    if (!activeGame) return;

    const now = Date.now();

    let finalElapsed = activeGame.elapsedTimeAtPause;
    if (activeGame.pauseTime === null && !activeGame.isFinished) {
      finalElapsed = activeGame.elapsedTimeAtPause + (now - activeGame.startTime);
    }

    const finalPlayTimes = { ...playTimes };
    playingIds.forEach(id => {
      if (lastOnTime[id]) {
        const session = Math.floor((now - lastOnTime[id]!) / 1000);
        finalPlayTimes[id] = (finalPlayTimes[id] || 0) + session;
      }
    });

    const finalActiveGame: RugbyGame = {
      ...activeGame,
      isFinished: true,
      pauseTime: null,
      elapsedTimeAtPause: finalElapsed,
      tackles: tackleCounts,
      subHistory: subHistory,
      playtimeTotals: finalPlayTimes,
      scoreHistory: scoreHistory,
      tackleHistory: tackleHistory,
    };

    setActiveGame(finalActiveGame);
    localStorage.setItem('activeGame', JSON.stringify(finalActiveGame));
    setIsFinishModalOpen(true);
  };

  const calculatedTotalScore = useMemo(() => {
    return activeGame?.scoreEvents.reduce((total, event) => total + event.points, 0) || 0;
  }, [activeGame]);

  const overwriteData = (incoming: any) => {
    if (incoming.value?.data == null) {
      console.log("Cannot sync as there is no data");
      console.log(incoming);
      return false;
    }
    const data = incoming.value.data;
    console.log('overwrite:', isFinishModalOpen, postGameComment, activeGame, historicGames, isStartModalOpen, opponentNameInput);
    setIsFinishModalOpen(data.isFinishModalOpen);
    setPostGameComment(data.postGameComment);
    setActiveGame(data.activeGame);
    setIsHome(data.activeGame?.home);
    setHistoricGames(data.historicGames);
    setIsStartModalOpen(data.isStartModalOpen);
    setOpponentNameInput(data.opponentNameInput);
    return true;
  }

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 font-bold animate-pulse">Loading Rugby Scorekeeper...</p>
      </div>
    );
  }

  if (!activeGame) {
    return (
      <GameSetupScreen
        historicGames={historicGames}
        setHistoricGames={setHistoricGames}
        onStartMatch={handleGameSetup} // The only big function passed down
        syncData={{
          isFinishModalOpen, postGameComment, activeGame, historicGames, isStartModalOpen, opponentNameInput
        }}
        overwriteData={overwriteData}
      />
    )
  }

  return (
    <>
      <Sync name='rug' overwriteData={overwriteData} data={{
        isFinishModalOpen, postGameComment, activeGame, historicGames, isStartModalOpen, opponentNameInput
      }} ></Sync>

      <div className="flex flex-col items-center min-h-screen bg-blue-300 p-4">

        <Scoreboard isHome={isHome || true}
          activeGame={activeGame}
          ourScore={calculatedTotalScore}
          onUndoOur={handleUndoLastScore}
          onUndoOpponent={handleUndoOpponentScore}></Scoreboard>

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
        </div>

        <PlayerGrid players={PLAYERS} playingIds={playingIds} toggleStatus={togglePlayerStatus} handleScore={handleScore} tackleCounts={tackleCounts} handleTackle={handleTackle}></PlayerGrid>

        <SubstitutionLog history={subHistory}></SubstitutionLog>
        <h3 className="text-xl font-bold text-gray-700 mb-2 mt-2"></h3>
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

        <div className="w-full max-w-xl mt-8">
          <HistoryViewer games={historicGames} setGames={setHistoricGames} />
        </div>
      </div>
    </>
  );
}