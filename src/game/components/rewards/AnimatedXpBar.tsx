type AnimatedXpBarProps = {
  totalXp: number;
};

const XP_PER_LEVEL = 120;

const getLevelFromXp = (xp: number) =>
  Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);

const getLevelProgressPct = (xp: number) => {
  const level = getLevelFromXp(xp);
  const levelFloor = (level - 1) * XP_PER_LEVEL;
  return Math.min(100, Math.max(0, ((xp - levelFloor) / XP_PER_LEVEL) * 100));
};

export const AnimatedXpBar = ({ totalXp }: AnimatedXpBarProps) => {
  const level = getLevelFromXp(totalXp);
  const nextLevelAt = level * XP_PER_LEVEL;
  const pct = getLevelProgressPct(totalXp);

  return (
    <div className="rounded-2xl border border-blue-200/70 bg-white/75 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60">
          XP Progress
        </p>
        <span className="rounded-full bg-blue-900 px-2 py-1 text-xs font-black text-white transition-transform duration-200 reward-level-chip">
          Lv {level}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full bg-gradient-to-r from-[#00b4ff] via-[#1FB6FF] to-[#35d39e] transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-blue-900/70">
        <span>{Math.round(totalXp)} XP</span>
        <span>{nextLevelAt} XP next</span>
      </div>
    </div>
  );
};
