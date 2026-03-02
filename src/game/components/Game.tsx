import { useContext, type ReactNode } from "react";
import { GameContext } from "../contexts/GameContext";
import LanguageSearch from "./LanguageSearch";
import { Level1 } from "./Level1";
import { Level2 } from "./Level2";
import { Level3 } from "./Level3";
import { Level4 } from "./Level4";
import { Level5 } from "./Level5";
import { Progress } from "./Progress";
import { Button } from "./shared/Button";
import { Guesses } from "./Guesses";
import { GameOver } from "./GameOver";
import LoadingScreen from "./LoadingScreen";

const GameLayout = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return (
    <div className="relative z-1 w-full h-fit flex flex-col justify-start items-center mb-4">
      <div className="w-full flex justify-end p-2">
        <Button
          bg="#F7939B"
          shadow="#f45b69"
          hover="#FF808B"
          textColor="#FFFFFF"
          text="Log in"
          size="sm"
        ></Button>
      </div>
      {children}
    </div>
  );
};

export const Game = () => {
  const { gameStatus, guessingData, startGame } = useContext(GameContext);

  if (gameStatus === "loading") {
    return (
      <GameLayout>
        <LoadingScreen></LoadingScreen>
      </GameLayout>
    );
  }

  if (gameStatus === "started" && guessingData) {
    return (
      <GameLayout>
        <GameStarted></GameStarted>
      </GameLayout>
    );
  }

  if (gameStatus === "notStarted") {
    return (
      <GameLayout>
        <GameNotStarted></GameNotStarted>
      </GameLayout>
    );
  }

  if (gameStatus === "won" || gameStatus === "lost") {
    return (
      <GameOver
        status={gameStatus}
        correctLanguage={guessingData["name"]}
        stats={{ hintsUsed: 3, streak: 1 }}
        onRestart={startGame}
      ></GameOver>
    );
  }

  return (
    <GameLayout>
      <GameNotStarted></GameNotStarted>
    </GameLayout>
  );
};

export const GameNotStarted = () => {
  const { startGame } = useContext(GameContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-lg mx-auto p-8">
      <div className="w-full bg-[#56CBF9]/40 backdrop-blur-xl rounded-2xl p-10 shadow-lg flex flex-col items-center text-center">
        {/* Icono Decorativo (Mundo/Idiomas) */}
        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-6 shadow-[0_6px_0_#0676a2] border-4 border-white/50">
          <span className="text-5xl">🌍</span>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-black text-blue-900 mb-4 tracking-tight leading-none">
          ARE YOU A <br />
          <span className="text-blue-600">LANGUAGE LEGEND?</span>
        </h1>

        {/* Descripción corta */}
        <p className="text-blue-800/70 font-medium text-lg mb-10 leading-relaxed">
          Listen, read and guess. <br />
          Can you reach a streak of 10?
        </p>

        <div className="w-full max-w-[280px]">
          <Button
            text="START GAME"
            bg="#1FB6FF"
            shadow="#0676a2"
            hover="#4fc6ff"
            textColor="black"
            size="lg"
            onClick={async () => {
              await startGame();
            }}
          />
        </div>

        {/* Mostar dificultad y modo
        <div className="mt-8 flex gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-blue-900/40 tracking-widest uppercase">
              Dificultad
            </span>
            <span className="text-sm font-bold text-blue-600">NORMAL</span>
          </div>
          <div className="w-px h-8 bg-blue-900/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-blue-900/40 tracking-widest uppercase">
              Modo
            </span>
            <span className="text-sm font-bold text-blue-600">CLÁSICO</span>
          </div>
        </div>
        */}
      </div>

      <p className="mt-6 text-blue-900/40 text-sm font-bold uppercase tracking-widest">
        OVER 200 LANGUAGES AVAILABLE
      </p>
    </div>
  );
};

export const GameStarted = () => {
  const { currentShowingStep, steps, isMobile } = useContext(GameContext);
  const stepName = steps[currentShowingStep - 1].name;

  if (isMobile) {
    return (
      <div
        id="ContenedorDePista"
        className="mt-4 backdrop-blur-[1px] min-w-80 min-h-fit max-h-fit p-10 bg-[#56CBF9]/40 shadow-lg rounded-2xl flex flex-col gap-6 relative"
      >
        <div className="flex flex-row items-center justify-between h-fit -mt-4 -mx-4">
          <div className="flex flex-col gap-0">
            <span className="text-md font-normal text-gray-700 mb-0">
              Hint {currentShowingStep} - {stepName}
            </span>
          </div>
          <Progress steps={steps}></Progress>
        </div>
        <CurrentLevel currentStep={currentShowingStep}></CurrentLevel>
        <div className="w-full flex justify-center">
          <LanguageSearch></LanguageSearch>
        </div>
        <Guesses></Guesses>
      </div>
    );
  }

  return (
    <div
      id="ContenedorDePista"
      className="mt-20 backdrop-blur-[1px] w-220 h-fit p-10 bg-[#56CBF9]/40 shadow-lg rounded-2xl flex flex-col gap-6 relative"
    >
      <div className="flex flex-row items-center justify-between h-fit -mt-4">
        <span className="text-xl font-normal text-gray-700">
          Hint {currentShowingStep} - {stepName}
        </span>
        <Progress steps={steps}></Progress>
      </div>
      <CurrentLevel currentStep={currentShowingStep}></CurrentLevel>
      <div className="w-full flex justify-center">
        <LanguageSearch></LanguageSearch>
      </div>
      <Guesses></Guesses>
    </div>
  );
};

const CurrentLevel = ({ currentStep }: { currentStep: number }) => {
  if (currentStep === 1) {
    return <Level1></Level1>;
  }

  if (currentStep === 2) {
    return <Level2></Level2>;
  }

  if (currentStep === 3) {
    return <Level3></Level3>;
  }

  if (currentStep === 4) {
    return <Level4></Level4>;
  }

  return <Level5></Level5>;
};
