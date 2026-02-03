import { ImCross } from "react-icons/im";
import { FaCheck } from "react-icons/fa";

export const Guesses = () => {
  return (
    <div className="flex flex-col gap-2 w-full items-center">
      <Guess country="Alemán"></Guess>
      <Guess country="Francés"></Guess>
      <Guess country="Ruso"></Guess>
      <Guess country="Inglés" mistake={false}></Guess>
    </div>
  );
};

const Guess = ({
  country,
  mistake = true,
}: {
  country: string;
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
          {country}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full max-w-lg gap-2 p-2 px-4 bg-green-500/40 backdrop-blur-md rounded-2xl border-[1px] border-green-600/50 shadow-[0_0_20px_rgba(50,205,50,0.35)] mt-2">
      <FaCheck size={14} className="text-green-600 mt-[2px]" strokeWidth={3} />
      <p className="text-xl uppercase tracking-widest font-bold text-white">
        {country}
      </p>
    </div>
  );
};
