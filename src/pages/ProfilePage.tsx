import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../game/components/shared/Button";
import { useGameStore } from "../game/store/useGameStore";
import type { GameResult, UserBadge } from "../types/auth";
import { BadgeWall } from "../game/components/profile/BadgeWall";
import { BadgeDetailsModal } from "../game/components/profile/BadgeDetailsModal";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    user,
    authStatus,
    profileStats,
    progress,
    badges,
    dailyQuests,
    recentGames,
    isSyncing,
    syncError,
    lastRewardSummary,
    hydrateCloudStats,
    retryPendingSync,
    clearSyncError,
    signOut,
  } = useGameStore();
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);

  const highlightedBadgeIds = useMemo(
    () => lastRewardSummary?.unlockedBadges.map((badge) => badge.id) ?? [],
    [lastRewardSummary]
  );

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    void (async () => {
      await hydrateCloudStats();
      await retryPendingSync();
    })();
  }, [authStatus, hydrateCloudStats, retryPendingSync]);

  if (authStatus !== "authenticated" || !user) {
    return (
      <Layout>
        <div className="w-full max-w-lg bg-white/60 rounded-2xl p-8 text-center shadow-lg mt-12">
          <h1 className="text-2xl font-black text-blue-900 mb-3">
            Sign in required
          </h1>
          <p className="text-blue-900/70 mb-6">
            You need an account to access your profile and cloud stats.
          </p>
          <Button
            bg="#1FB6FF"
            shadow="#0676a2"
            hover="#4fc6ff"
            textColor="#FFFFFF"
            size="md"
            text="Log in"
            onClick={() => navigate("/login")}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-5xl px-4 mt-10 mb-10">
        <div className="bg-[#56CBF9]/40 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black text-blue-900">
                Your Profile
              </h1>
              <p className="text-blue-900/70">{user.email ?? "No email"}</p>
            </div>
            <div className="flex gap-2">
              <Button
                bg="#1FB6FF"
                shadow="#0676a2"
                hover="#4fc6ff"
                textColor="#FFFFFF"
                text="Back to game"
                size="sm"
                onClick={() => navigate("/")}
              />
              <Button
                bg="#F7939B"
                shadow="#f45b69"
                hover="#FF808B"
                textColor="#FFFFFF"
                text="Sign out"
                size="sm"
                onClick={() => {
                  void signOut();
                }}
              />
            </div>
          </div>

          <section className="bg-white/55 rounded-xl p-5">
            <div className="flex items-end justify-between gap-3 mb-3">
              <h2 className="text-xl font-bold text-blue-900">
                Level Progress
              </h2>
              <div className="text-right">
                <p className="text-blue-900/60 text-xs uppercase tracking-wider">
                  Level
                </p>
                <p className="text-3xl font-black text-blue-900">
                  {progress.level}
                </p>
              </div>
            </div>
            <div className="w-full h-4 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00b4ff] to-[#1FB6FF]"
                style={{
                  width: `${Math.min(progress.currentLevelProgressPct, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-blue-900/70 mt-2">
              <span>{progress.totalXp} XP</span>
              <span>Next level at {progress.nextLevelXp} XP</span>
            </div>
          </section>

          <section className="bg-white/55 rounded-xl p-5">
            <h2 className="text-xl font-bold text-blue-900 mb-3">
              Daily Quests
            </h2>
            {dailyQuests.length === 0 ? (
              <p className="text-blue-900/70">
                Play a game to generate today's quests.
              </p>
            ) : (
              <div className="grid md:grid-cols-3 gap-3">
                {dailyQuests.map((quest) => {
                  const pct =
                    quest.target > 0
                      ? (quest.progress / quest.target) * 100
                      : 0;
                  return (
                    <div key={quest.id} className="bg-white/70 rounded-lg p-3">
                      <p className="font-bold text-blue-900 mb-2">
                        {quest.title}
                      </p>
                      <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full ${
                            quest.completed ? "bg-emerald-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-blue-900/70">
                        {quest.progress}/{quest.target}{" "}
                        {quest.completed ? "- Completed" : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="bg-white/55 rounded-xl p-5">
            <h2 className="text-xl font-bold text-blue-900 mb-3">Badges</h2>
            <BadgeWall
              badges={badges}
              highlightedBadgeIds={highlightedBadgeIds}
              onSelectBadge={setSelectedBadge}
            />
          </section>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Games played"
              value={profileStats.gamesPlayed.toString()}
            />
            <StatCard label="Win rate" value={`${profileStats.winRate}%`} />
            <StatCard
              label="Current streak"
              value={profileStats.currentStreak.toString()}
            />
            <StatCard
              label="Best streak"
              value={profileStats.bestStreak.toString()}
            />
          </div>

          <div className="bg-white/50 rounded-xl p-4">
            <h2 className="text-xl font-bold text-blue-900 mb-3">
              Recent games
            </h2>
            {recentGames.length === 0 ? (
              <p className="text-blue-900/70">
                No cloud games yet. Play one while signed in.
              </p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
                {recentGames.map((game) => (
                  <RecentGameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>

          {(isSyncing || syncError) && (
            <div className="mt-4 text-sm">
              {isSyncing && (
                <p className="text-blue-900/70">Syncing stats...</p>
              )}
              {syncError && (
                <div className="flex items-center gap-3">
                  <p className="text-red-600">{syncError}</p>
                  <button
                    className="underline text-blue-900/70"
                    onClick={() => {
                      clearSyncError();
                      void retryPendingSync();
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <BadgeDetailsModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </Layout>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="bg-white/50 rounded-xl p-4">
      <p className="text-blue-900/60 text-xs uppercase tracking-wider">
        {label}
      </p>
      <p className="text-blue-900 text-2xl font-black">{value}</p>
    </div>
  );
};

const RecentGameCard = ({ game }: { game: GameResult }) => {
  return (
    <article className="rounded-xl bg-white/65 border border-blue-100 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-blue-900 truncate">{game.languageName}</p>
        <ResultChip won={game.won} />
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <HintDots hintsUsed={game.hintsUsed} max={5} />
        <p className="text-xs text-blue-900/65">
          {formatGameDate(game.guessedAt)}
        </p>
      </div>
    </article>
  );
};

const ResultChip = ({ won }: { won: boolean }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
        won ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
      }`}
      aria-label={won ? "Won game" : "Lost game"}
    >
      {won ? "Won" : "Lost"}
    </span>
  );
};

const HintDots = ({
  hintsUsed,
  max = 5,
}: {
  hintsUsed: number;
  max?: number;
}) => {
  const clampedHints = Math.max(0, Math.min(hintsUsed, max));
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Hints used ${clampedHints} out of ${max}`}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, index) => {
          const isFilled = index < clampedHints;
          return (
            <span
              key={index}
              className={`h-2.5 w-2.5 rounded-full ${
                isFilled ? "bg-blue-600" : "bg-blue-200"
              }`}
            />
          );
        })}
      </div>
      <span className="text-[11px] font-semibold text-blue-900/70">
        {clampedHints}/{max}
      </span>
    </div>
  );
};

const formatGameDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString();
};

const Layout = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return (
    <div className="relative z-1 w-full h-fit flex flex-col justify-start items-center mb-4">
      {children}
    </div>
  );
};
