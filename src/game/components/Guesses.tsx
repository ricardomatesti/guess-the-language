import { ImCross } from "react-icons/im";
import { FaCheck } from "react-icons/fa";
import { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export const Guesses = () => {
  const { guesses } = useContext(GameContext);

  if (guesses.length === 0) return;

  return (
    <div className="flex flex-col gap-2 w-full items-center">
      {guesses.map((g, index) => (
        <Guess key={index} language={g.language} mistake={g.mistake}></Guess>
      ))}
    </div>
  );
};

const Guess = ({
  language,
  mistake = true,
}: {
  language: string;
  mistake?: boolean;
}) => {
  if (mistake) {
    return (
      <div className="flex items-center w-full max-w-lg gap-2 p-2 px-4 bg-white/30 backdrop-blur-md rounded-2xl border-[0px] border-blue-500/25 shadow-[0_0_15px_rgba(255,0,0,0.1)]">
        <ImCross
          size={12}
          className="text-red-600 mt-[2px]"
          strokeWidth={0.1}
        />

        <p className="text-xl uppercase tracking-widest font-semibold text-red-600">
          {language}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full max-w-lg gap-2 p-2 px-4 bg-green-500/40 backdrop-blur-md rounded-2xl border-[1px] border-green-600/50 shadow-[0_0_20px_rgba(50,205,50,0.35)] mt-2">
      <FaCheck size={14} className="text-green-600 mt-[2px]" strokeWidth={3} />
      <p className="text-xl uppercase tracking-widest font-bold text-white">
        {language}
      </p>
    </div>
  );
};
