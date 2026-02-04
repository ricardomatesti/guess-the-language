import { useState, useEffect, useRef, useContext } from "react";
import { IoSearch } from "react-icons/io5";
import { GameContext } from "../contexts/GameContext";
import { Button } from "./shared/Button";
import useIsMobile from "../hooks/useIsMobile";
import { ArrowButton } from "./shared/ArrowButton";
import { AnimatePresence, motion } from "motion/react";
import { languages } from "../languages";

const LanguageSearch = () => {
  const { isMobile } = useIsMobile();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<String[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  const {
    steps,
    currentShowingStep,
    currentPlayingStep,
    formError,
    skipLevel,
    moveToLevel,
    checkGuess,
  } = useContext(GameContext);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = languages.filter((lang) =>
        lang.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div
      className="flex flex-col items-center w-full max-w-lg gap-4 items-end"
      ref={containerRef}
    >
      <div className="relative w-full flex justify-end">
        <div className="relative w-full group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0391CE]/70 group-focus-within:text-blue-600/100 transition-colors z-10">
            <IoSearch size={20} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              // TODO añadir debounce
              setQuery(e.target.value);
              if (e.target.value.length > 0) setShowDropdown(true);
            }}
            placeholder="Busca un idioma..."
            className="w-full pl-12 px-6 py-4 bg-white backdrop-blur-sm border-0 border-[#4BB8EB] rounded-xl font-medium
                shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),_inset_0_-2px_4px_rgba(255,255,255,0.2),_0_8px_10px_-3px_rgba(86,203,249,0.8)] 
                focus:outline-none focus:border-blue-400 text-black placeholder-[#0391CE]/80 transition-all"
          />
          {formError && <FormPopover text={formError}></FormPopover>}

          {showDropdown && results.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white backdrop-blur-md border border-blue-100 rounded-2xl shadow-xl max-h-49 overflow-y-auto overflow-hidden">
              {results.map((lang, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setQuery(lang.toString());

                    setShowDropdown(false);
                    // Aquí llamar a función de validación
                  }}
                  className="px-6 py-3 hover:bg-[#56CBF9] hover:text-white hover:font-bold cursor-pointer transition-all border-b border-blue-50 last:border-none"
                >
                  {lang}
                </li>
              ))}
              {results.length > 4 && (
                <img
                  className="absolute z-10 w-15 right-0 bottom-0"
                  src="/scrollable.png"
                  alt="scrollable content"
                ></img>
              )}
            </ul>
          )}
        </div>
      </div>
      <div className="flex flew-row justify-end items-center w-full gap-2 shrink flex-wrap-reverse">
        <ArrowButton
          direction="left"
          size="lg"
          disabled={currentShowingStep === 1}
          onClick={() => {
            if (currentShowingStep !== 1) moveToLevel({ type: "down" });
          }}
        ></ArrowButton>

        <ArrowButton
          direction="right"
          size="lg"
          disabled={steps[currentShowingStep - 1].status === "current"}
          onClick={() => {
            const disabled = steps[currentShowingStep - 1].status === "current";
            if (!disabled) moveToLevel({ type: "up" });
          }}
        ></ArrowButton>

        {currentPlayingStep < 4 && (
          <Button
            bg="#EAF6FF"
            shadow="#0391CE"
            hover="#D9F3FF"
            textColor="#085878"
            text="Saltar"
            tailwindClasses={isMobile ? "flex-1" : ""}
            onClick={skipLevel}
          ></Button>
        )}
        <Button
          bg="#1FB6FF"
          shadow="#0676a2"
          hover="#4fc6ff"
          textColor="black"
          text="¡Comprobar!"
          onClick={() => checkGuess({ guess: query, setFormText: setQuery })}
          tailwindClasses={isMobile ? "flex-1 uppercase" : "uppercase"}
        ></Button>
      </div>
    </div>
  );
};

const FormPopover = ({ text }: { text: string }) => {
  const { setFormError } = useContext(GameContext);

  useEffect(() => {
    setTimeout(() => {
      setFormError(undefined);
    }, 2000);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute -top-10 left-38 -translate-x-1/2 z-50 whitespace-nowrap"
      >
        <div
          className=" 
            relative px-6 py-2 
            bg-[#f7939b] text-white 
            font-bold rounded-2xl
            shadow-[0_4px_0_#b91c1c] 
            border-0 border-white/20
        "
        >
          {text}
          <div
            className="
                absolute -bottom-2 left-10 -translate-x-1/2 
                w-4 h-4 bg-[#f7939b] 
                rotate-45 border-r-0 border-b-0 border-white/10
                shadow-[3px_3px_0_#b91c1c]
            "
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LanguageSearch;
