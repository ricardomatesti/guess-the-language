import { LiaQrcodeSolid } from "react-icons/lia";
import { useIsMobile } from "../hooks/useIsMobile";
import { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export const Level5 = () => {
  const { isMobile } = useIsMobile({ maxWidth: 900 });
  const { guessingData } = useContext(GameContext);
  const { countryName, countryIso2Code, countryIso3Code } =
    guessingData["fifthHint"];

  return (
    <div className="flex flex-row justify-center">
      <div className="w-fit h-fit flex flex-col justify-center items-center">
        <div className="flex flex-col justify-start gap-6">
          <div className="flex flex-col gap-4">
            {isMobile ? (
              <BoardingPassMobile
                countryCode={countryIso3Code}
                countryName={countryName}
                passengerName="Anónimo/a"
              ></BoardingPassMobile>
            ) : (
              <BoardingPass
                countryCode={countryIso3Code}
                countryName={countryName}
                passengerName="Anónimo/a"
              ></BoardingPass>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BoardingPass = ({
  countryCode,
  countryName,
  passengerName,
}: {
  countryCode: string;
  countryName: string;
  passengerName: string;
}) => {
  const maskStyleLeft = {
    WebkitMaskImage: `radial-gradient(circle at 0px 50%, transparent 25px, black 0px)`,
    WebkitMaskPosition: "left",
    WebkitMaskRepeat: "no-repeat",
  };

  const maskStyleRight = {
    WebkitMaskImage: `radial-gradient(circle at 100% 50%, transparent 25px, black 13px)`,
    WebkitMaskPosition: "right",
    WebkitMaskRepeat: "no-repeat",
  };

  const perforationMask = {
    WebkitMaskImage: "radial-gradient(circle, transparent 4px, black 4px)",
    WebkitMaskSize: "100% 15px",
  };

  return (
    <div className="flex gap-0">
      <div
        style={maskStyleLeft}
        className="bg-white rounded-l-2xl flex-grow relative flex flex-col overflow-hidden"
      >
        <div
          className="w-full h-full absolute top-5 z-0"
          style={{
            backgroundImage: "url('/world-map-no-bg-red.png')",
            backgroundSize: "400px 180px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: "50%",

            WebkitMaskImage:
              "radial-gradient(circle, black 1.5px, transparent 1.5px)",
            WebkitMaskSize: "6px 6px",
            maskImage:
              "radial-gradient(circle, black 1.5px, transparent 1.5px)",
            maskSize: "6px 6px",
          }}
        ></div>
        <div className="relative z-10 flex flex-col flex-grow">
          <div className="w-full h-10 bg-[#F45B69] flex flex-row gap-2 items-center px-6">
            <img className="-mb-1" width={30} src="/flight-icon.png"></img>
            <span className="text-2xl font-semibold text-white line-clamp-1 ">
              TARJETA DE EMBARQUE
            </span>
          </div>
          <div className="w-full flex flex-col grow justify-between px-6 gap-2 ">
            <div>
              <span className="text-xl font-medium uppercase text-gray-700 line-clamp-1 mt-4">
                PAÍS CON MÁS HABLANTES DEL IDIOMA:
              </span>
            </div>
            <div className="flex flex-row gap-2 -mt-6 items-center ml-2">
              <span className="text-6xl font-black text-gray-900 uppercase">
                {countryCode}
              </span>
              <img
                className="mt-3"
                width={70}
                src="/flight-icon-black.png"
              ></img>
              <span className="text-6xl font-black text-gray-900">
                {countryName}
              </span>
            </div>
            <div className="flex flex-row gap-2 justify-between mb-4">
              <LabelAndText
                label="Pasajero"
                text={passengerName}
                size="lg"
              ></LabelAndText>

              <LabelAndText
                label="Vuelo"
                text="A 0123"
                size="lg"
              ></LabelAndText>
              <LabelAndText label="Puerta" text="12" size="lg"></LabelAndText>
              <LabelAndText label="Asiento" text="25F" size="lg"></LabelAndText>
            </div>
          </div>
        </div>
      </div>

      <div
        style={perforationMask}
        className=" min-w-4 bg-white relative -ml-1 -mr-1 flex flex-col"
      >
        <div className="w-full h-10 bg-[#F45B69]"></div>
      </div>

      <div
        style={maskStyleRight}
        className="bg-white rounded-r-2xl flex flex-col items-center"
      >
        <div className="w-full h-10 bg-[#F45B69] flex flex-row gap-2 items-center px-4">
          <span className="text-2xl font-semibold text-white line-clamp-1">
            FRANCIA
          </span>
          <img className="-mb-1" width={30} src="/flight-icon.png"></img>
          <span className="text-2xl font-semibold text-white line-clamp-1">
            FRN
          </span>
        </div>
        <div className="w-full flex flex-col px-6 gap-2">
          <div className="flex justify-between items-center">
            <img
              className="h-[55px] max-w-[100px] aspect-[6/1] rounded-md"
              src="https://flagcdn.com/w640/fr.png"
            ></img>

            <LiaQrcodeSolid size={80} />
          </div>
          <div className="flex flex-col">
            <LabelAndText label="Pasajero" text={passengerName}></LabelAndText>
            <div className="flex flew-row justify-between">
              <LabelAndText label="Vuelo" text="A 0123"></LabelAndText>

              <LabelAndText label="Asiento" text="25F"></LabelAndText>
            </div>
          </div>
          <div className="max-w-50 mb-4">
            <img src="/barcode.png" className="aspect-[4/1]"></img>
          </div>
        </div>
      </div>
    </div>
  );
};

const LabelAndText = ({
  label,
  text,
  size = "md",
}: {
  label: string;
  text: string;
  size?: "md" | "lg";
}) => {
  if (size === "lg") {
    return (
      <div className="flex flex-col gap-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest -mb-1 line-clamp-1">
          {label}
        </span>
        <span className="text-xl font-medium text-gray-900 -mt-1 line-clamp-1">
          {text}
        </span>
      </div>
    );
  }

  if (size === "md") {
    return (
      <div className="flex flex-col gap-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest -mb-1 line-clamp-1">
          {label}
        </span>
        <span className="text-lg font-medium text-gray-900 -mt-1 line-clamp-1">
          {text}
        </span>
      </div>
    );
  }
};

const BoardingPassMobile = ({
  countryCode,
  countryName,
  passengerName,
}: {
  countryCode: string;
  countryName: string;
  passengerName: string;
}) => {
  const perforationMask = {
    WebkitMaskImage:
      "radial-gradient(circle, transparent 4px, black 4px), radial-gradient(circle at 100% 50%, transparent 15px, black 15px), radial-gradient(circle at 0% 50%, transparent 15px, black 15px)",
    WebkitMaskPosition: "center, right, left",
    WebkitMaskSize: "15px 100%, 100% 100%, 100% 100%",
    WebkitMaskComposite: "source-in, destination-in, destination-in",
    WebkitMaskRepeat: "repeat, no-repeat, no-repeat",
    maskComposite: "intersect",
  };

  return (
    <div className="flex flex-col w-full max-w-[380px] mx-auto">
      <div className="bg-white rounded-t-3xl relative flex flex-col overflow-hidden pb-4">
        <div
          className="w-full h-full absolute top-10 z-0"
          style={{
            backgroundImage: "url('/world-map-no-bg-red.png')",
            backgroundSize: "300px auto",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: "30%",
            WebkitMaskImage:
              "radial-gradient(circle, black 1.5px, transparent 1.5px)",
            WebkitMaskSize: "6px 6px",
          }}
        ></div>

        <div className="relative z-10">
          <div className="w-full h-12 bg-[#F45B69] flex flex-row gap-2 items-center px-4">
            <img
              className="-mb-1"
              width={24}
              src="/flight-icon.png"
              alt="icon"
            />
            <span className="text-lg font-bold text-white tracking-tight uppercase line-clamp-1">
              TARJETA DE EMBARQUE
            </span>
          </div>

          <div className="px-4 flex flex-col items-center">
            <span className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
              País con más hablantes:
            </span>

            <div className="flex flex-row items-center justify-between w-full gap-2 mt-4 mb-2">
              <div>
                <img
                  className="h-[60px] w-auto rounded-md aspect-[7/4]"
                  src="https://flagcdn.com/w640/fr.png"
                  alt="flag"
                />
              </div>
              <div className="flex flex-col gap-0">
                <span className="text-5xl font-black text-gray-900 leading-none uppercase -mb-1">
                  {countryCode}
                </span>
                <span className="text-2xl font-bold text-gray-900 uppercase -mt-1">
                  {countryName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={perforationMask}
        className="min-h-10 bg-white relative -mt-1 -mb-1 flex flex-col"
      >
        <div className="w-full w-10 bg-[#F45B69]"></div>
      </div>

      <div className="bg-white rounded-b-3xl flex flex-col items-center px-6 pb-4">
        <div className="w-full flex flex-row justify-between mb-2">
          <div className="flex flex-col ">
            <LabelAndText label="Pasajero" text={passengerName} size="md" />
            <LabelAndText label="Puerta" text="12" size="md" />
          </div>
          <div className="flex flex-col ">
            <LabelAndText label="Vuelo" text="A 0123" size="md" />
            <LabelAndText label="Asiento" text="25F" size="md" />
          </div>
        </div>
        <div className="w-full flex flex-col items-center gap-2">
          <img
            src="/barcode.png"
            className="w-full h-12 object-cover grayscale"
            alt="barcode"
          />
        </div>
      </div>
    </div>
  );
};
