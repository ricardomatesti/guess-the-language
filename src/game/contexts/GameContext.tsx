import { createContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

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

export const GameContext = createContext<{
  currentShowingStep: number;
  currentPlayingStep: number;
  steps: Step[];
  guesses: Guess[];
  setSteps: Dispatch<SetStateAction<Step[]>>;
  setGuesses: Dispatch<SetStateAction<Guess[]>>;
  skipLevel: () => void;
  moveToLevel: ({ type }: { type: "up" | "down" }) => void;
}>({
  currentShowingStep: 0,
  currentPlayingStep: 0,
  steps: [],
  guesses: [],
  setGuesses: () => {},
  setSteps: () => {},
  skipLevel: () => {},
  moveToLevel: () => {},
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
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentShowingStep, setCurrentShowingStep] = useState(1);
  const [currentPlayingStep, setCurrentPlayingStep] = useState(0);

  const getLanguageForTheGame = async function () {
    try {
      const response = await fetch("../data/data.json");
      const data = await response.json();
      const texts = data[0];

      const randomIndex = Math.floor((texts.length - 1) * Math.random());
      return texts[randomIndex].text;
    } catch (error) {
      console.error("Error cargando el JSON:", error);
    }
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
        currentShowingStep,
        currentPlayingStep,
        steps,
        guesses,
        setGuesses,
        setSteps,
        skipLevel,
        moveToLevel,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const getCurrevntIndexFromArray = (array: Step[]) => {
  return array.findIndex((s) => s.status === "current");
};
