import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { RiSpeakLine } from "react-icons/ri";
import { useIsMobile } from "../hooks/useIsMobile";

export const SpeakersNumber = ({ population }: { population: number }) => {
  const { isMobile } = useIsMobile({ maxWidth: 900 });

  const count = useMotionValue(0);
  const rounded = useTransform(() =>
    new Intl.NumberFormat("es-ES").format(Math.round(count.get()))
  );

  useEffect(() => {
    const controls = animate(count, population, {
      duration: 2,
      ease: "circOut",
    });
    return () => controls.stop();
  }, []);

  if (isMobile) {
    return (
      <div className="w-fit px-4 py-2 h-fit bg-[#4BB8EB] rounded-lg flex flex-row gap-2 items-center">
        <RiSpeakLine color="white" size={20} strokeWidth={0.6} />

        <span className="text-white font-semibold text-xl flex items-center">
          <motion.pre className="font-fira font-mediumff">{rounded}</motion.pre>
        </span>
      </div>
    );
  }

  return (
    <div className="w-fit px-6 py-2 h-fit bg-[#4BB8EB] rounded-lg flex flex-row gap-2 items-center">
      <RiSpeakLine color="white" size={35} strokeWidth={0.6} />

      <span className="text-white font-semibold text-4xl flex items-center">
        <motion.pre className="font-fira font-mediumff">{rounded}</motion.pre>
      </span>
    </div>
  );
};
