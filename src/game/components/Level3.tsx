import { AudioPlayer } from "./AudioPlayer";
import useIsMobile from "../hooks/useIsMobile";
import { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export const Level3 = () => {
  const { isMobile } = useIsMobile({ maxWidth: 900 });
  const { guessingData } = useContext(GameContext);
  const { audioText, languageCode } = guessingData["thirdHint"];

  if (isMobile) {
    return (
      <div className="w-full flex flex-row justify-center">
        <div className="h-fit flex flex-col justify-center items-center">
          <div className="flex flex-col justify-start gap-6">
            <span className="text-4xl font-bold">Escucha el audio...</span>

            <AudioPlayer
              textToSpeak={audioText}
              countryName={languageCode}
            ></AudioPlayer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="h-fit flex flex-col justify-center items-center">
        <div className="flex flex-col justify-start gap-6">
          <span className="text-6xl font-bold">Escucha el audio...</span>

          <AudioPlayer
            textToSpeak={audioText}
            countryName={languageCode}
          ></AudioPlayer>
        </div>
      </div>
    </div>
  );
};
