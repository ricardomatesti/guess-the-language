import MapChart from "./MapChart";
import { SpeakersNumber } from "./SpeakersNumber";
import { useIsMobile } from "../hooks/useIsMobile";
import { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export const Level1 = () => {
  const { isMobile } = useIsMobile({ maxWidth: 900 });
  const { guessingData } = useContext(GameContext);
  const { continents, population } = guessingData["firstHint"];

  const HEADER_TEXT =
    continents.length > 1
      ? "Hablado en estos continentes:"
      : "Hablado en este continente:";

  if (isMobile) {
    return (
      <div className="w-full flex flex-row justify-center">
        <div className="h-fit flex flex-col gap-10 justify-center items-center">
          <span className="bg-[#56CBF9] w-fit text-xl">{HEADER_TEXT}</span>

          <div className="h-fit w-80 -mb-18 -mt-18">
            <MapChart continents={continents} />
          </div>
          <SpeakersNumber population={population}></SpeakersNumber>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="h-fit flex flex-col gap-10 justify-center items-center">
        <span className="bg-[#56CBF9] w-fit text-2xl">{HEADER_TEXT}</span>

        <div className="h-fit w-130 -mb-20 -mt-25">
          <MapChart continents={continents} />
        </div>
        <SpeakersNumber population={population}></SpeakersNumber>
      </div>
    </div>
  );
};
