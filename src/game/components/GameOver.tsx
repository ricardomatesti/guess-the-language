import React from "react";
import { Button } from "./shared/Button";

export const GameOver = ({
  status,
  correctLanguage,
  stats,
  onRestart,
}: any) => {
  const isWin = status === "won";
  if (isWin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-lg mx-auto p-6 animate-in zoom-in duration-500">
        <div className="w-full p-10 rounded-[3rem] backdrop-blur-2xl border-0 flex flex-col items-center text-center shadow-2xl bg-emerald-500/20 border-emerald-400/50 shadow-emerald-500/20">
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-8 border-8 border-white/30 shadow-lg text-6xl animate-bounce dbg-emerald-500 shadow-[0_8px_0_#059669]">
            🏆
          </div>

          <h2 className="text-4xl font-black mb-2 tracking-tighter text-emerald-600">
            ¡INCREÍBLE!
          </h2>

          <p className="text-blue-900/60 font-bold tracking-widest uppercase text-sm mb-6">
            Has dominado el idioma
          </p>

          <div className="px-8 py-4 rounded-2xl mb-10 inline-block text-3xl font-black tracking-[0.2em] bg-emerald-500 text-white">
            {correctLanguage.toUpperCase()}
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mb-10">
            <div className="bg-white/40 p-4 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <span className="block text-[10px] font-black text-blue-900/40 uppercase tracking-widest">
                Pistas Usadas
              </span>
              <span className="text-2xl font-black text-blue-900">
                {stats.hintsUsed}/5
              </span>
            </div>
            <div className="bg-white/40 p-4 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <span className="block text-[10px] font-black text-blue-900/40 uppercase tracking-widest">
                Racha Actual
              </span>
              <span className="text-2xl font-black text-blue-900">
                {stats.streak} 🔥
              </span>
            </div>
          </div>

          <div className="w-full">
            <Button
              text="JUGAR DE NUEVO"
              textColor="white"
              bg={isWin ? "#10b981" : "#00b4ff"}
              shadow={isWin ? "#059669" : "#0676a2"}
              hover={isWin ? "#06CB8D" : "#4fc6ff"}
              onClick={onRestart}
              size="lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[550px] w-full max-w-lg mx-auto p-6 animate-in zoom-in duration-500">
      <div className="w-full p-10 rounded-[3rem] backdrop-blur-2xl border-0 flex flex-col items-center text-center shadow-2xl bg-[#56CBF9]/40 shadow-lg">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border-8 border-white/20 animate-bounce shadow-lg text-5xl bg-[#f7939b] shadow-[0_6px_0_#b91c1c]">
          🌍
        </div>

        <h2 className="text-3xl font-black mb-1 tracking-tighter text-red-500">
          ¡CASI LO TIENES!
        </h2>

        <p className="text-blue-900/40 font-bold tracking-widest uppercase text-[10px] mb-6">
          Te has quedado sin pistas
        </p>

        <div className="w-full bg-white/40 rounded-3xl p-6 mb-8 border-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
          <span className="block text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] mb-2">
            El idioma era...
          </span>
          <div className="text-4xl font-black text-blue-600 tracking-widest uppercase">
            {correctLanguage}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-white/40 p-4 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <span className="block text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-1">
              Tu Mejor Racha
            </span>
            <span className="text-xl font-black text-blue-900">
              {stats.bestStreak}3 🏆
            </span>
          </div>
          <div className="bg-white/40 p-4 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <span className="block text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-1">
              Intentos
            </span>
            <span className="text-xl font-black text-blue-900">
              {stats.attemptsCount}5 ✍️
            </span>
          </div>
        </div>

        <div className="w-full">
          <Button
            text="INTENTARLO OTRA VEZ"
            textColor="white"
            bg="#00b4ff"
            shadow="#0676a2"
            hover="#4fc6ff"
            onClick={onRestart}
            size="lg"
          />
        </div>
      </div>
    </div>
  );
};
