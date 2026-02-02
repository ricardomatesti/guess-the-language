import { createContext, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

type Step = {
  id: number;
  status: statusType;
  name: string;
};

type statusType = "correct" | "skipped" | "incorrect" | "current" | "locked";

export const GameContext = createContext<{
  currentStep: number;
  steps: Step[];
  setSteps: Dispatch<SetStateAction<Step[]>>;
}>({
  currentStep: 0,
  steps: [],
  setSteps: () => {},
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

  const currentStep = useMemo(() => {
    return steps.find((s) => s.status === "current")?.id || 0;
  }, steps);

  return (
    <GameContext.Provider value={{ currentStep, steps, setSteps }}>
      {children}
    </GameContext.Provider>
  );
}
