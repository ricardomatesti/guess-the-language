import { useContext } from "react";
import { GameContext } from "../contexts/gameContext";
import LanguageSearch from "./LanguageSearch";
import { Level1 } from "./Level1";
import { Level2 } from "./Level2";
import { Level3 } from "./Level3";
import { Level4 } from "./Level4";
import { Level5 } from "./Level5";
import { Progress } from "./Progress";
import useIsMobile from "../hooks/useIsMobile";

export const Game = () => {
  const { isMobile } = useIsMobile({ maxWidth: 900 });
  const { currentStep, steps } = useContext(GameContext);
  const stepName = steps[currentStep - 1].name;

  if (isMobile) {
    return (
      <div className="absolute z-1 w-full h-full flex justify-center">
        <div
          id="ContenedorDePista"
          className="mt-20 backdrop-blur-[1px] min-w-80 min-h-fit max-h-fit p-10 bg-[#56CBF9]/40 rounded-lg flex flex-col gap-6 relative"
        >
          <div className="flex flex-row items-center justify-between h-fit -mt-4">
            <div className="flex flex-col gap-0">
              <span className="text-md font-normal text-gray-700 -mb-1">
                Pista {currentStep}
              </span>
              <span className="text-md font-normal text-gray-700 -mt-1">
                {stepName}
              </span>
            </div>
            <Progress steps={steps} currentStep={currentStep}></Progress>
          </div>
          <CurrentLevel currentStep={currentStep}></CurrentLevel>
          <LanguageSearch></LanguageSearch>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute z-1 w-full h-full flex justify-center">
      <div
        id="ContenedorDePista"
        className="mt-20 backdrop-blur-[1px] w-200 h-fit p-10 bg-[#56CBF9]/40 rounded-lg flex flex-col gap-6 relative"
      >
        <div className="flex flex-row items-center justify-between h-fit -mt-4">
          <span className="text-xl font-normal text-gray-700">
            Pista {currentStep} - {stepName}
          </span>
          <Progress steps={steps} currentStep={currentStep}></Progress>
        </div>
        <CurrentLevel currentStep={currentStep}></CurrentLevel>
        <LanguageSearch></LanguageSearch>
      </div>
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
