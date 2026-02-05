import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { GameContext, type Step } from "../contexts/GameContext";
import { useContext } from "react";

export const Progress = ({ steps }: { steps: Step[] }) => {
  const { currentPlayingStep } = useContext(GameContext);

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isPast = index < currentPlayingStep;

        return (
          <div key={index} className="flex items-center">
            <Node status={step.status} index={index}></Node>

            {index < steps.length - 1 && (
              <div
                className={`h-[2px] w-4 transition-colors duration-500 ${
                  isPast ? "bg-white/50" : "bg-white/10"
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
}: {
  status: "correct" | "skipped" | "incorrect" | "current" | "locked";
  index: number;
}) => {
  if (status === "correct") {
    return (
      <div className="relative flex items-center justify-center rounded-full w-6 h-6 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]">
        <FaCheck size={14} className="text-white" strokeWidth={3} />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div className="relative flex items-center justify-center rounded-full w-7 h-7 bg-white shadow-lg scale-110 ring-0 ring-white/20">
        <div className="absolute flex items-center justify-center rounded-full w-7 h-7 bg-white/20 scale-110 animate-pulse-slow"></div>
        <span className="text-[10px] font-bold text-blue-500">{index + 1}</span>
      </div>
    );
  }

  if (status === "incorrect") {
    return (
      <div className="relative flex items-center justify-center rounded-full w-6 h-6 bg-red-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]">
        <ImCross size={12} className="text-white" strokeWidth={0.1} />
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="relative flex items-center justify-center rounded-full bg-white/10 border border-white/20 w-6 h-6"></div>
    );
  }

  if (status === "skipped") {
    return (
      <div className="relative flex items-center justify-center rounded-full bg-white/50 border border-white/20 w-6 h-6">
        <div className="rounded-full bg-[#56CBF9]/40 w-3 h-3"></div>
      </div>
    );
  }
};
