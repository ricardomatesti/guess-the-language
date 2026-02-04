import { createContext, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { languages } from "../languages";

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
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, status: "current", name: "Nº nativos" },
    { id: 2, status: "locked", name: "Palabra" },
    { id: 3, status: "locked", name: "Audio" },
    { id: 4, status: "locked", name: "Frase" },
    { id: 5, status: "locked", name: "País" },
  ]);
  const [gameStatus, setGameStatus] = useState<GameStatusType>("notStarted");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [currentShowingStep, setCurrentShowingStep] = useState(1);
  const [currentPlayingStep, setCurrentPlayingStep] = useState(0);

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

    await getLanguageForTheGame();
    setGameStatus("started");
  };

  const checkEndGame = (guess: string) => {
    if (guess.toLowerCase() === guessingData["name"].toLowerCase()) {
      setGameStatus("won");
      return true;
    }

    if (currentPlayingStep === 4) {
      setGameStatus("lost");
      return true;
    }
    return false;
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
