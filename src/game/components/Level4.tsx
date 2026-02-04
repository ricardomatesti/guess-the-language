import { useContext } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { GameContext } from "../contexts/GameContext";

export const Level4 = () => {
  const { isMobile } = useIsMobile({ maxWidth: 900 });
  const { guessingData } = useContext(GameContext);
  const { sentence, translation } = guessingData["fourthHint"];

  if (isMobile) {
    return (
      <div className="flex flex-row justify-center">
        <div className="w-fit h-fit flex flex-col justify-center items-center">
          <div className="flex flex-col justify-start gap-6">
            <div className="flex flex-col gap-4">
              <span className="text-2xl font-bold">❝{sentence}❞</span>
              <span className="bg-[#56CBF9] w-fit text-2xl">{translation}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-center">
      <div className="w-fit h-fit flex flex-col justify-center items-center">
        <div className="flex flex-col justify-start gap-6">
          <div className="flex flex-col gap-4">
            <span className="text-4xl font-bold">❝{sentence}❞</span>
            <span className="bg-[#56CBF9] w-fit text-4xl">{translation}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
