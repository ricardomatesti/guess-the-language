import { createContext, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { languages } from "../languages";
import useIsMobile from "../hooks/useIsMobile";

export type Step = {
  id: number;
  status: statusType;
  name: string;
};

export type Guess = {
  language: string;
  mistake: boolean;
};

type statusType = "correct" | "skipped" | "incorrect" | "current" | "locked";
type GameStatusType = "notStarted" | "loading" | "started" | "won" | "lost";

export const GameContext = createContext<{
  gameStatus: GameStatusType;
  currentShowingStep: number;
  currentPlayingStep: number;
  steps: Step[];
  guesses: Guess[];
  formError: string | undefined;
  guessingData: any; // TODO tipar la data
  streak: number;
  record: number;
  tries: number;
  isMobile: boolean;
  startGame: () => void;
  setFormError: Dispatch<SetStateAction<string | undefined>>;
  setSteps: Dispatch<SetStateAction<Step[]>>;
  setGuesses: Dispatch<SetStateAction<Guess[]>>;
  skipLevel: () => void;
  moveToLevel: ({ type }: { type: "up" | "down" }) => void;
  checkGuess: ({
    guess,
    setFormText,
  }: {
    guess: string;
    setFormText: Dispatch<SetStateAction<string>>;
  }) => void;
}>({
  gameStatus: "notStarted",
  currentShowingStep: 0,
  currentPlayingStep: 0,
  steps: [],
  guesses: [],
  formError: "",
  guessingData: undefined,
  streak: 0,
  record: 0,
  tries: 0,
  isMobile: false,
  startGame: () => {},
  setGuesses: () => {},
  setFormError: () => {},
  setSteps: () => {},
  skipLevel: () => {},
  moveToLevel: () => {},
  checkGuess: () => {},
});

export function GameContextProvider({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  const { isMobile } = useIsMobile({ maxWidth: 900 });
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, status: "current", name: "Nº nativos" },
    { id: 2, status: "locked", name: "Palabra" },
    { id: 3, status: "locked", name: "Audio" },
    { id: 4, status: "locked", name: "Frase" },
    { id: 5, status: "locked", name: "País" },
  ]);
  const [stats, setStats] = useState(() => {
    const savedStreak = localStorage.getItem("game_current_streak");
    const savedRecord = localStorage.getItem("game_max_record");
    return {
      streak: savedStreak ? parseInt(savedStreak, 10) : 0,
      record: savedRecord ? parseInt(savedRecord, 10) : 0,
    };
  });
  const [gameStatus, setGameStatus] = useState<GameStatusType>("notStarted");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [currentShowingStep, setCurrentShowingStep] = useState(1);
  const [currentPlayingStep, setCurrentPlayingStep] = useState(0);
  const [tries, setTries] = useState(0);

  const [guessingData, setGuessingData] = useState<any>(undefined);

  const getLanguageForTheGame = async function () {
    try {
      const response = await fetch("/data/data.json");
      const data = await response.json();
      const languages = data["languages"];

      const randomIndex = Math.floor((languages.length - 1) * Math.random());
      await setGuessingData(languages[randomIndex]);
      return;
    } catch (error) {
      console.error("Error cargando el JSON:", error);
    }
  };

  const startGame = async () => {
    // Ponemos los valores por defecto
    setSteps([
      { id: 1, status: "current", name: "Nº nativos" },
      { id: 2, status: "locked", name: "Palabra" },
      { id: 3, status: "locked", name: "Audio" },
      { id: 4, status: "locked", name: "Frase" },
      { id: 5, status: "locked", name: "País" },
    ]);
    setGuesses([]);
    setCurrentShowingStep(1);
    setCurrentPlayingStep(0);
    setTries(0);

    await getLanguageForTheGame();
    setGameStatus("started");
  };

  const checkEndGame = (guess: string) => {
    if (guess.toLowerCase() === guessingData["name"].toLowerCase()) {
      setGameStatus("won");
      registerWinLocalStorage();
      return true;
    }

    if (currentPlayingStep === 4) {
      setGameStatus("lost");
      registerLossLocalStorage();
      return true;
    }
    return false;
  };

  const registerWinLocalStorage = () => {
    setStats((prev) => {
      const nextStreak = prev.streak + 1;
      const nextRecord = Math.max(nextStreak, prev.record);

      localStorage.setItem("game_current_streak", nextStreak.toString());
      localStorage.setItem("game_max_record", nextRecord.toString());

      return { streak: nextStreak, record: nextRecord };
    });
  };

  const registerLossLocalStorage = () => {
    setStats((prev) => {
      localStorage.setItem("game_current_streak", "0");
      return { ...prev, streak: 0 };
    });
  };

  const checkGuess = ({
    guess,
    setFormText,
  }: {
    guess: string;
    setFormText: Dispatch<SetStateAction<string>>;
  }) => {
    const trimmedGuess = guess.trim();

    if (trimmedGuess === "") return;

    if (!isInLanguageList(trimmedGuess)) {
      setFormError("Selecciona un idioma de la lista");
      return;
    }

    setTries((prev) => prev + 1);
    const gameEnded = checkEndGame(guess);

    if (gameEnded) return;

    setSteps((prev) => {
      return [
        ...prev.slice(0, currentPlayingStep),
        ...[
          { ...prev[currentPlayingStep], status: "incorrect" as statusType },
          {
            ...prev[currentPlayingStep + 1],
            status: "current" as statusType,
          },
        ],
        ...prev.slice(currentPlayingStep + 2),
      ];
    });
    setGuesses((prev) => [
      ...prev,
      {
        language: guess,
        mistake: true,
      },
    ]);
    setFormText("");

    setCurrentShowingStep(currentPlayingStep + 2);
    setCurrentPlayingStep((prev) => prev + 1);
  };

  const skipLevel = () => {
    setSteps((prev) => {
      return [
        ...prev.slice(0, currentPlayingStep),
        ...[
          { ...prev[currentPlayingStep], status: "skipped" as statusType },
          {
            ...prev[currentPlayingStep + 1],
            status: "current" as statusType,
          },
        ],
        ...prev.slice(currentPlayingStep + 2),
      ];
    });

    setCurrentShowingStep(currentPlayingStep + 2);
    setCurrentPlayingStep((prev) => prev + 1);
  };

  const moveToLevel = ({ type }: { type: "up" | "down" }) => {
    if (type === "up") {
      setCurrentShowingStep((prev) => prev + 1);
    }
    if (type === "down") {
      setCurrentShowingStep((prev) => prev - 1);
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameStatus,
        currentShowingStep,
        currentPlayingStep,
        steps,
        guesses,
        formError,
        guessingData,
        record: stats.record,
        streak: stats.streak,
        tries,
        isMobile,
        startGame,
        setGuesses,
        setFormError,
        setSteps,
        skipLevel,
        moveToLevel,
        checkGuess,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

const isInLanguageList = (language: string) => {
  const languageList = languages;

  return languageList.includes(language);
};

const StreakManager = {
  KEY: "game_win_streak",

  get: () => {
    const streak = localStorage.getItem(StreakManager.KEY);
    return streak ? parseInt(streak, 10) : 0;
  },

  increment: () => {
    const newStreak = StreakManager.get() + 1;
    localStorage.setItem(StreakManager.KEY, newStreak.toString());
    return newStreak;
  },

  reset: () => {
    localStorage.setItem(StreakManager.KEY, "0");
    return 0;
  },
};
