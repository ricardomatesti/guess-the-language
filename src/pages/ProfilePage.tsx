import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../game/components/shared/Button";
import { useGameStore } from "../game/store/useGameStore";

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
    hydrateCloudStats,
    retryPendingSync,
    clearSyncError,
    signOut,
  } = useGameStore();

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
            {badges.length === 0 ? (
              <p className="text-blue-900/70">
                No badges yet. Keep playing to unlock them.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-lg p-3 border ${
                      badge.unlocked
                        ? "bg-white/80 border-blue-200"
                        : "bg-white/40 border-blue-100"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-wider text-blue-900/60">
                      {badge.rarity}
                    </p>
                    <p className="font-bold text-blue-900">{badge.title}</p>
                    <p className="text-xs text-blue-900/70 mt-1">
                      {badge.description}
                    </p>
                    <p className="text-xs mt-2 font-semibold text-blue-900/60">
                      {badge.unlocked ? "Unlocked" : "Locked"}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-blue-900/70 border-b border-blue-200">
                      <th className="py-2 pr-3">Language</th>
                      <th className="py-2 pr-3">Result</th>
                      <th className="py-2 pr-3">Hints</th>
                      <th className="py-2 pr-3">Tries</th>
                      <th className="py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGames.map((game) => (
                      <tr key={game.id} className="border-b border-blue-100">
                        <td className="py-2 pr-3 font-semibold text-blue-900">
                          {game.languageName}
                        </td>
                        <td className="py-2 pr-3">
                          {game.won ? "Won" : "Lost"}
                        </td>
                        <td className="py-2 pr-3">{game.hintsUsed}/5</td>
                        <td className="py-2 pr-3">{game.tries}</td>
                        <td className="py-2">
                          {new Date(game.guessedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

const Layout = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return (
    <div className="relative z-1 w-full h-fit flex flex-col justify-start items-center mb-4">
      {children}
    </div>
  );
};
