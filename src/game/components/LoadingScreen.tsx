export const LoadingScreen = () => {
  return (
    <div
      id="ContenedorDePista"
      className="mt-4 backdrop-blur-[1px] min-w-80 min-h-fit max-h-fit p-15 bg-[#56CBF9]/40 shadow-lg rounded-2xl flex flex-col items-center gap-8 relative"
    >
      <div className="relative">
        <div className="w-24 h-24 bg-[#4a90e2] rounded-full flex items-center justify-center shadow-inner">
          <span className="text-5xl">🌍</span>
        </div>
        <div className="absolute -top-1 -left-1 w-26 h-26 border-4 border-t-[#ff7a8a] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-[#1e3a8a] text-3xl font-black uppercase tracking-tight">
          Preparando...
        </h2>
        <div className="flex flex-row gap-1 flex-wrap gap-y-0 justify-center">
          <p className="text-[#4a90e2] font-bold text-lg shrink-0">
            Afilando el oído para los
          </p>
          <div className="flex flex-row gap-1">
            <p className="text-[#1e3a8a] font-bold text-lg">+200</p>
            <p className="text-[#4a90e2] font-bold text-lg">idiomas</p>
          </div>
        </div>
      </div>

      <p className="text-[#1e3a8a]/60 font-medium italic animate-pulse">
        Cargando datos lingüísticos...
      </p>
    </div>
  );
};

export default LoadingScreen;
