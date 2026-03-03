import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { RiSpeakLine } from "react-icons/ri";
import { useGameStore } from "../store/useGameStore";

export const SpeakersNumber = ({ population }: { population: number }) => {
  const { isMobile } = useGameStore();
  const safePopulation = Number.isFinite(population)
    ? Math.max(0, population)
    : 0;
  const formattedPopulation = new Intl.NumberFormat("en-US").format(
    Math.round(safePopulation)
  );

  const count = useMotionValue(0);
  const rounded = useTransform(() =>
    new Intl.NumberFormat("en-US").format(Math.round(count.get()))
  );

  useEffect(() => {
    count.set(0);
    const controls = animate(count, safePopulation, {
      duration: 1.5,
      ease: "circOut",
    });
    return () => controls.stop();
  }, [count, safePopulation]);

  if (isMobile) {
    return (
      <div
        className="w-fit px-4 py-2 h-fit bg-[#4BB8EB]/90 rounded-lg flex flex-col gap-1"
        aria-label={`Estimated speakers: ${formattedPopulation}`}
      >
        <span className="text-[10px] uppercase tracking-[0.08em] text-white/85 font-semibold">
          Estimated speakers
        </span>

        <div className="flex flex-row gap-2 items-center">
          <RiSpeakLine color="white" size={18} strokeWidth={0.6} />

          <span className="text-white font-semibold text-xl flex items-center leading-none">
            <motion.span className="font-fira font-medium">
              {rounded}
            </motion.span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-fit px-6 py-3 h-fit bg-[#4BB8EB]/90 rounded-lg flex flex-col gap-1"
      aria-label={`Estimated speakers: ${formattedPopulation}`}
    >
      <span className="text-xs uppercase tracking-[0.09em] text-white/85 font-semibold">
        Estimated speakers
      </span>

      <div className="flex flex-row gap-2 items-center">
        <RiSpeakLine color="white" size={30} strokeWidth={0.6} />

        <span className="text-white font-semibold text-4xl flex items-center leading-none">
          <motion.span className="font-fira font-medium">{rounded}</motion.span>
        </span>
      </div>
    </div>
  );
};
