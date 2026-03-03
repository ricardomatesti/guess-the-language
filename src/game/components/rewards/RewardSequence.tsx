import { useEffect, useMemo, useRef, useState } from "react";
import type { GameRewardSummary } from "../../../types/auth";
import { AnimatedXpBar } from "./AnimatedXpBar";
import { QuestRewardList } from "./QuestRewardList";

type RewardSequenceProps = {
  summary: GameRewardSummary;
  onComplete?: () => void;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const RewardSequence = ({
  summary,
  onComplete,
}: RewardSequenceProps) => {
  const [displayXp, setDisplayXp] = useState(summary.totalXpBefore);
  const [showQuests, setShowQuests] = useState(false);
  const [showQuestBonuses, setShowQuestBonuses] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(true);
  const displayXpRef = useRef(summary.totalXpBefore);

  const completedQuestRewards = useMemo(
    () =>
      summary.questUpdates.filter(
        (quest) => quest.completedNow && quest.xpReward > 0
      ),
    [summary.questUpdates]
  );

  const clearRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const animateXpTo = (to: number, durationMs = 430) =>
    new Promise<void>((resolve) => {
      clearRaf();
      const from = displayXpRef.current;
      if (from === to || durationMs <= 0) {
        displayXpRef.current = to;
        setDisplayXp(to);
        resolve();
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        if (!runningRef.current) {
          resolve();
          return;
        }
        const elapsed = now - start;
        const pct = Math.min(1, elapsed / durationMs);
        const eased = 1 - Math.pow(1 - pct, 3);
        const nextXp = from + (to - from) * eased;
        displayXpRef.current = nextXp;
        setDisplayXp(nextXp);
        if (pct < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          displayXpRef.current = to;
          setDisplayXp(to);
          resolve();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    });

  useEffect(() => {
    runningRef.current = true;
    setDisplayXp(summary.totalXpBefore);
    displayXpRef.current = summary.totalXpBefore;
    setShowQuests(false);
    setShowQuestBonuses(false);
    setShowBadges(false);
    setIsDone(false);
    setIsSkipped(false);

    const run = async () => {
      const baseTarget = summary.totalXpBefore + summary.xpBase;

      await wait(120);
      if (!runningRef.current) return;
      await animateXpTo(baseTarget, 460);
      if (!runningRef.current) return;

      if (summary.questUpdates.length > 0) {
        setShowQuests(true);
        await wait(360);
        if (!runningRef.current) return;
      }

      if (completedQuestRewards.length > 0) {
        setShowQuestBonuses(true);
        let xpAfterBonuses = baseTarget;
        for (const quest of completedQuestRewards) {
          if (!runningRef.current) return;
          xpAfterBonuses += quest.xpReward;
          await animateXpTo(
            Math.min(summary.totalXpAfter, xpAfterBonuses),
            320
          );
          await wait(160);
        }
      }

      if (summary.totalXpAfter !== displayXpRef.current) {
        await animateXpTo(summary.totalXpAfter, 260);
      }

      if (!runningRef.current) return;

      if (summary.unlockedBadges.length > 0) {
        setShowBadges(true);
        await wait(320);
      }

      if (!runningRef.current) return;
      setIsDone(true);
      onComplete?.();
    };

    void run();

    return () => {
      runningRef.current = false;
      clearRaf();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  const applySkip = () => {
    runningRef.current = false;
    clearRaf();
    setIsSkipped(true);
    displayXpRef.current = summary.totalXpAfter;
    setDisplayXp(summary.totalXpAfter);
    setShowQuests(summary.questUpdates.length > 0);
    setShowQuestBonuses(completedQuestRewards.length > 0);
    setShowBadges(summary.unlockedBadges.length > 0);
    setIsDone(true);
    onComplete?.();
  };

  return (
    <div className="mb-6 w-full rounded-2xl bg-white/50 p-4 text-left shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-widest text-blue-900/55">
          Rewards
        </p>
        {!isDone && (
          <button
            className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-900 hover:bg-blue-50"
            onClick={applySkip}
          >
            Skip animation
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatedXpBar totalXp={displayXp} />

        {showQuests && (
          <QuestRewardList
            quests={summary.questUpdates}
            showCompletions={showQuestBonuses || isSkipped}
          />
        )}

        {showBadges && summary.unlockedBadges.length > 0 && (
          <div className="rounded-2xl border border-blue-200/70 bg-white/75 p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60">
              New Badges
            </p>
            <div className="flex flex-wrap gap-2">
              {summary.unlockedBadges.map((badge) => (
                <span
                  key={badge.id}
                  className={`rounded-full px-2 py-1 text-xs font-bold ${badgeChipClass(
                    badge.rarity
                  )}`}
                >
                  {badge.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {isDone && false && (
        <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-900/80">
          <p>Game XP: +{summary.xpBase}</p>
          <p>Quest bonus XP: +{summary.xpQuestBonus}</p>
          <p className="font-bold text-blue-900">
            Total gained: +{summary.xpTotal}
          </p>
        </div>
      )}
    </div>
  );
};

const badgeChipClass = (rarity: string) => {
  switch (rarity) {
    case "legendary":
      return "bg-amber-500 text-amber-950";
    case "epic":
      return "bg-fuchsia-500 text-white";
    case "rare":
      return "bg-blue-500 text-white";
    default:
      return "bg-slate-400 text-white";
  }
};
