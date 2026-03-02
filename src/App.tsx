import { Game } from "./game/components/Game";
import { useIsMobile } from "./game/hooks/useIsMobile";
import { useEffect } from "react";
import { useGameStore } from "./game/store/useGameStore";

function App() {
  const { isMobile } = useIsMobile({ maxWidth: 900 });
  const { setMobile } = useGameStore();

  useEffect(() => {
    setMobile(isMobile);
  }, [isMobile, setMobile]);

  return (
    <>
      <div className="bg-[#B2E6FF] w-screen min-h-dvh h-fit bg-cover bg-center relative flex flex-col patron">
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
        <Game></Game>
      </div>
    </>
  );
}

export default App;
