import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { GameContext, type Step } from "../contexts/GameContext";
import { useContext } from "react";

export const Progress = ({ steps }: { steps: Step[] }) => {
  const { currentPlayingStep, goToLevel, isMobile } = useContext(GameContext);

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isPast = index < currentPlayingStep;
        const isLocked = step.status === "locked";

        return (
          <div key={index} className="flex items-center">
            <div
              className={`${!isLocked ? "cursor-pointer hover:scale-110" : ""
                } transition-transform duration-200`}
              onClick={() => !isLocked && goToLevel(index + 1)}
            >
              <Node status={step.status} index={index} isMobile={isMobile}></Node>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`h-[2px] ${isMobile ? "w-4" : "w-4"
                  } transition-all duration-500 ${isPast ? "bg-white/50" : "bg-white/10"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Node = ({
  status,
  index,
  isMobile,
}: {
  status: "correct" | "skipped" | "incorrect" | "current" | "locked";
  index: number;
  isMobile: boolean;
}) => {
  const sizeClass = isMobile ? "w-6 h-6" : "w-8 h-8";
  const iconSize = isMobile ? 14 : 20;

  if (status === "correct") {
    return (
      <div
        className={`relative flex items-center justify-center rounded-full ${sizeClass} bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]`}
      >
        <FaCheck size={iconSize} className="text-white" strokeWidth={3} />
      </div>
    );
  }

  if (status === "current") {
    const currentSize = isMobile ? "w-7 h-7" : "w-9 h-9";
    const fontSize = isMobile ? "text-[10px]" : "text-sm";
    return (
      <div
        className={`relative flex items-center justify-center rounded-full ${currentSize} bg-white shadow-lg scale-110 ring-0 ring-white/20`}
      >
        <div
          className={`absolute flex items-center justify-center rounded-full ${currentSize} bg-white/20 scale-110 animate-pulse-slow`}
        ></div>
        <span className={`${fontSize} font-bold text-blue-500`}>
          {index + 1}
        </span>
      </div>
    );
  }

  if (status === "incorrect") {
    return (
      <div
        className={`relative flex items-center justify-center rounded-full ${sizeClass} bg-red-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]`}
      >
        <ImCross size={isMobile ? 12 : 16} className="text-white" strokeWidth={0.1} />
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div
        className={`relative flex items-center justify-center rounded-full bg-white/10 border border-white/20 ${sizeClass}`}
      ></div>
    );
  }

  if (status === "skipped") {
    return (
      <div
        className={`relative flex items-center justify-center rounded-full bg-white/50 border border-white/20 ${sizeClass}`}
      >
        <div
          className={`rounded-full bg-[#56CBF9]/40 ${isMobile ? "w-3 h-3" : "w-5 h-5"
            }`}
        ></div>
      </div>
    );
  }
};
