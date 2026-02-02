import { RxFontFamily } from "react-icons/rx";
import { MdOutlineCategory } from "react-icons/md";

export const Level2 = () => {
  return (
    <div className="w-full flex flex-row justify-center">
      <div className="h-fit flex flex-col justify-center items-center">
        <div className="flex flex-col justify-start gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-6xl font-bold">HELLO</span>
            <span className="bg-[#56CBF9] w-fit text-4xl">/hɛˈləʊ/</span>
          </div>

          <div className="flex flex-row gap-2">
            <div className="w-fit h-fit rounded-full bg-[#F45B69] flex flex-row gap-2 items-center px-4 py-1">
              <MdOutlineCategory size={20} color="white"></MdOutlineCategory>
              <span className="text-lg font-medium text-white">Saludo</span>
            </div>

            <div className="w-fit h-fit rounded-full bg-[#56CBF9] flex flex-row gap-2 items-center px-4 py-1">
              <RxFontFamily size={20} color=""></RxFontFamily>
              <span className="text-lg font-medium ">Latín</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
