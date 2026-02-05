import { motion } from "framer-motion";
import { FaPlay } from "react-icons/fa";
import { FaVolumeUp } from "react-icons/fa";
import { useSpeech } from "../hooks/useSpeech";
import { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

export const AudioPlayer = ({
  textToSpeak,
  countryName,
}: {
  textToSpeak: string;
  countryName: string;
}) => {
  const { isMobile } = useContext(GameContext);
  const { play, isPlaying } = useSpeech({
    text: textToSpeak,
    lang: countryName,
  });

  if (isMobile) {
    return (
      <div className="flex items-center gap-4 p-4 bg-[#56CBF9]/100 backdrop-blur-md rounded-2xl border border-white/20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={play}
          className="w-12 h-12 flex items-center justify-center bg-[#F45B69] rounded-full shadow-lg shadow-indigo-500/40 text-white shrink-0"
        >
          {isPlaying ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <FaVolumeUp size={24} />
            </motion.div>
          ) : (
            <FaPlay size={24} fill="white" />
          )}
        </motion.button>

        <div>
          {isPlaying ? (
            <SoundBars></SoundBars>
          ) : (
            <p className="text-lg uppercase tracking-widest font-medium text-white line-clamp-1">
              Haz click en el play
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-[#56CBF9]/100 backdrop-blur-md rounded-2xl border border-white/20">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={play}
        className="w-12 h-12 flex items-center justify-center bg-[#F45B69] rounded-full shadow-lg shadow-indigo-500/40 text-white"
      >
        {isPlaying ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <FaVolumeUp size={24} />
          </motion.div>
        ) : (
          <FaPlay size={24} fill="white" />
        )}
      </motion.button>

      <div>
        {isPlaying ? (
          <SoundBars></SoundBars>
        ) : (
          <p className="text-2xl uppercase tracking-widest font-medium text-white">
            Haz click en el play
          </p>
        )}
      </div>
    </div>
  );
};

const SoundBars = () => {
  return (
    <div className="flex items-center gap-[3px] h-8">
      {getArray().map((i, index) => (
        <motion.div
          key={index}
          className="w-[3px] bg-white rounded-full"
          animate={{
            height: ["20%", "100%", "20%"],
          }}
          transition={{
            duration: 0.5 + i * 0.1, // Diferente velocidad para cada barra
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const getArray = () => {
  const { isMobile } = useContext(GameContext);
  const NUMBER_OF_ELEMENTS = isMobile ? 36 : 60;
  const array = Array(NUMBER_OF_ELEMENTS);

  for (let i = 0; i < NUMBER_OF_ELEMENTS; i++) {
    array[i] = Math.floor(Math.random() * 10);
  }

  return array;
};
