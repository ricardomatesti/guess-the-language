import type { QuestRewardUpdate } from "../../../types/auth";

type QuestRewardListProps = {
  quests: QuestRewardUpdate[];
  showCompletions: boolean;
};

export const QuestRewardList = ({
  quests,
  showCompletions,
}: QuestRewardListProps) => {
  const filteredQuests = quests.filter((quest) => !quest.completed);
  if (filteredQuests.length === 0) return null;

  return (
    <div className="space-y-2 rounded-2xl border border-blue-200/70 bg-white/75 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60">
        Daily Quests
      </p>
      {filteredQuests.map((quest) => {
        const pct =
          quest.target > 0
            ? Math.min(100, (quest.progressAfter / quest.target) * 100)
            : 0;
        return (
          <div key={quest.id} className="rounded-xl bg-white/80 p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-blue-900">
                {quest.title}
              </p>
              <p className="text-xs text-blue-900/70">
                {quest.progressAfter}/{quest.target}
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
              <div
                className={`h-full transition-all duration-300 ${
                  quest.completed ? "bg-emerald-500" : "bg-blue-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {showCompletions && quest.completedNow && quest.xpReward > 0 && (
              <p className="mt-1 text-xs font-bold text-emerald-700">
                Quest Complete +{quest.xpReward} XP
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
