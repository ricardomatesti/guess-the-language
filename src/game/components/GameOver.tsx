import { useNavigate } from "react-router-dom";
import { Button } from "./shared/Button";
import { useGameStore } from "../store/useGameStore";
import { RewardSequence } from "./rewards/RewardSequence";

export const GameOver = ({
  status,
  correctLanguage,
  onRestart,
}: {
  status: "won" | "lost";
  correctLanguage: string;
  onRestart: () => void;
}) => {
  const navigate = useNavigate();
  const isWin = status === "won";
  const {
    streak,
    record,
    currentPlayingStep,
    tries,
    lastRewardSummary,
    dismissRewardSummary,
  } = useGameStore();

  const handleRestart = () => {
    dismissRewardSummary();
    onRestart();
  };

  if (isWin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-lg mx-auto p-6 animate-in zoom-in duration-500">
        <div className="w-full p-10 rounded-2xl backdrop-blur-[1px] border-0 flex flex-col items-center text-center shadow-2xl bg-[#56CBF9]/40 border-emerald-400/50 shadow-emerald-500/20">
          <div className="w-28 h-28 rounded-full flex items-center justify-center border-8 border-white/30 shadow-lg text-6xl animate-bounce bg-emerald-500 shadow-[0_8px_0_#059669]">
            🏆
          </div>

          <h2 className="text-4xl font-black mb-2 tracking-tighter text-emerald-600">
            INCREDIBLE!
          </h2>

          <p className="text-blue-900/60 font-bold tracking-widest uppercase text-sm mb-6">
            You have mastered the language
          </p>

          <div className="w-full bg-white/50 rounded-3xl p-6 mb-6 border-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <div className="text-4xl font-black text-green-600 tracking-widest uppercase">
              {correctLanguage}
            </div>
          </div>

          {lastRewardSummary && <RewardSequence summary={lastRewardSummary} />}

          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            <div className="bg-white/50 p-4 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <span className="block text-[10px] font-black text-blue-900/40 uppercase tracking-widest">
                Hints Used
              </span>

              <div className="flex flex-row gap-0 w-full items-center justify-center">
                <span className="text-2xl font-black text-blue-900">
                  {currentPlayingStep + 1}
                </span>
                <span className="text-2xl font-black text-blue-900/60">/5</span>
              </div>
            </div>
            <div className="bg-white/50 p-4 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <span className="block text-[10px] font-black text-blue-900/40 uppercase tracking-widest">
                Current Streak
              </span>
              <span className="text-2xl font-black text-blue-900">
                {streak} 🔥
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            {lastRewardSummary && (
              <Button
                text="VIEW PROFILE RECAP"
                textColor="white"
                bg="#0676a2"
                shadow="#045573"
                hover="#0b8bc0"
                onClick={() => navigate("/profile")}
                size="md"
              />
            )}
            <Button
              text="KEEP THE STREAK"
              textColor="white"
              bg="#00b4ff"
              shadow="#0676a2"
              hover="#4fc6ff"
              onClick={handleRestart}
              size="lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[550px] w-full max-w-lg mx-auto p-6 animate-in zoom-in duration-500">
      <div className="w-full p-10 rounded-2xl backdrop-blur-[1px] border-0 flex flex-col items-center text-center shadow-2xl bg-[#56CBF9]/40 shadow-lg">
        <div className="w-24 h-24 rounded-full flex items-center justify-center border-8 border-white/20 animate-bounce shadow-lg text-5xl bg-[#f7939b] shadow-[0_6px_0_#b91c1c]">
          🌍
        </div>

        <h2 className="text-3xl font-black mb-1 tracking-tighter text-red-500">
          SO CLOSE!
        </h2>

        <p className="text-blue-900/40 font-bold tracking-widest uppercase text-[10px] mb-6">
          You've run out of hints
        </p>

        <div className="w-full bg-white/50 rounded-3xl p-6 mb-6  shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
          <span className="block text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] mb-2">
            The language was...
          </span>
          <div className="text-4xl font-black text-blue-600 tracking-widest uppercase">
            {correctLanguage}
          </div>
        </div>

        {lastRewardSummary && <RewardSequence summary={lastRewardSummary} />}

        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          <div className="bg-white/50 p-4 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <span className="block text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-1">
              High Score
            </span>
            <span className="text-xl font-black text-blue-900">
              {record} 🏆
            </span>
          </div>
          <div className="bg-white/50 p-4 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <span className="block text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-1">
              Tries
            </span>
            <span className="text-xl font-black text-blue-900">{tries} ✍️</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          {lastRewardSummary && (
            <Button
              text="VIEW PROFILE RECAP"
              textColor="white"
              bg="#0676a2"
              shadow="#045573"
              hover="#0b8bc0"
              onClick={() => navigate("/profile")}
              size="md"
            />
          )}
          <Button
            text="TRY AGAIN"
            textColor="white"
            bg="#00b4ff"
            shadow="#0676a2"
            hover="#4fc6ff"
            onClick={handleRestart}
            size="lg"
          />
        </div>
      </div>
    </div>
  );
};
