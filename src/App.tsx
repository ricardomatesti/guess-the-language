import "./App.css";
import { GameContextProvider } from "./game/contexts/gameContext";
import { Game } from "./game/components/Game";

function App() {
  return (
    <>
      <div className="bg-[#B2E6FF] w-full h-full bg-cover bg-center relative patron">
        <div
          className="w-full h-full absolute z-0 hidden"
          style={{
            backgroundImage: "url('/world-map-no-bg.png')",
            backgroundSize: "2000px 800px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: "35%",

            WebkitMaskImage:
              "radial-gradient(circle, black 2px, transparent 2px)",
            WebkitMaskSize: "20px 20px",
            maskImage: "radial-gradient(circle, black 2px, transparent 2px)",
            maskSize: "20px 20px",
          }}
        ></div>
        <GameContextProvider>
          <Game></Game>
        </GameContextProvider>
      </div>
    </>
  );
}

// https://flagcdn.com/w640/fr.png

// https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/67e2c781c4c953cd9e74eda5_ln4-2-helm-mask-fill.svg

// Pista 1 - Nº nativos
// Pista 2 - Palabra
// Pista 3 - Audio
// Pista 4 - Frase
// Pista 5 - País

export default App;
