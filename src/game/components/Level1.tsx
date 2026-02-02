import MapChart from "./MapChart";
import { SpeakersNumber } from "./SpeakersNumber";
import { useIsMobile } from "../hooks/useIsMobile";

export const Level1 = () => {
  const { isMobile } = useIsMobile({ maxWidth: 900 });

  if (isMobile) {
    return (
      <div className="w-full flex flex-row justify-center">
        <div className="h-fit flex flex-col gap-10 justify-center items-center">
          <span className="bg-[#56CBF9] w-fit text-xl">
            Hablado en estos continentes:
          </span>

          <div className="h-fit w-80 -mb-18 -mt-18">
            <MapChart />
          </div>
          <SpeakersNumber></SpeakersNumber>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="h-fit flex flex-col gap-10 justify-center items-center">
        <span className="bg-[#56CBF9] w-fit text-2xl">
          Hablado en estos continentes:
        </span>

        <div className="h-fit w-130 -mb-20 -mt-25">
          <MapChart />
        </div>
        <SpeakersNumber></SpeakersNumber>
      </div>
    </div>
  );
};
