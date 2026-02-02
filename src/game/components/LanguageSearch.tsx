import { useState, useEffect, useRef, useContext } from "react";
import { IoSearch } from "react-icons/io5";
import { GameContext } from "../contexts/gameContext";

const languages = [
  "Alemán",
  "Árabe",
  "Chino",
  "Español",
  "Francés",
  "Hindi",
  "Inglés",
  "Italiano",
  "Japonés",
  "Portugués",
  "Ruso",
];

type statusType = "correct" | "skipped" | "incorrect" | "current" | "locked";

const LanguageSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<String[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  const { setSteps } = useContext(GameContext);

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
      className="flex flex-col items-center w-full max-w-md mx-auto p-4 gap-4"
      ref={containerRef}
    >
      <div className="relative w-full">
        <div className="relative w-full max-w-md group">
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
            className="w-full pl-12 px-6 py-4 bg-white backdrop-blur-sm border-0 border-[#4BB8EB] rounded-lg font-medium
                shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),_inset_0_-2px_4px_rgba(255,255,255,0.2),_0_8px_10px_-3px_rgba(86,203,249,0.8)] 
                focus:outline-none focus:border-blue-400 text-blue-900 placeholder-[#0391CE]/80 transition-all"
          />

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
        <button
          className="
                px-8 py-4 
                bg-[#EAF6FF]
                text-[#085878]
                font-bold 
                rounded-2xl
                shadow-[0_4px_0_#0391CE] 
                active:shadow-none 
                active:translate-y-[4px]
                hover:bg-[#cceeff]
                transition-all
                tracking-wider
              "
          onClick={() => {
            setSteps((prev) => {
              const currentIndex = prev.findIndex(
                (s) => s.status === "current"
              );

              return [
                ...prev.slice(0, currentIndex),
                ...[
                  { ...prev[currentIndex], status: "skipped" as statusType },
                  {
                    ...prev[currentIndex + 1],
                    status: "current" as statusType,
                  },
                ],
                ...prev.slice(currentIndex + 2),
              ];
            });
          }}
        >
          Saltar
        </button>
        <button
          className="
                px-8 py-4 
                bg-[#1FB6FF]
                text-black
                font-bold 
                rounded-2xl
                shadow-[0_4px_0_#0676a2] 
                active:shadow-none 
                active:translate-y-[4px]
                hover:bg-[#4fc6ff]
                transition-all
                uppercase
                tracking-wider
                shrink-1
              "
        >
          ¡Comprobar!
        </button>
      </div>
    </div>
  );
};

export default LanguageSearch;
