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
            onClick={() => navigate("/auth")}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl px-4 mt-10 mb-10">
        <div className="bg-[#56CBF9]/40 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <StatCard
              label="Games played"
              value={profileStats.gamesPlayed.toString()}
            />
            <StatCard label="Win rate" value={`${profileStats.winRate}%`} />
            <StatCard label="Wins" value={profileStats.wins.toString()} />
            <StatCard label="Losses" value={profileStats.losses.toString()} />
            <StatCard
              label="Current streak"
              value={profileStats.currentStreak.toString()}
            />
            <StatCard
              label="Best streak"
              value={profileStats.bestStreak.toString()}
            />
            <StatCard
              label="Avg hints used"
              value={profileStats.avgHintsUsed.toFixed(2)}
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
  const { signOut } = useGameStore();
  return (
    <div className="relative z-1 w-full h-fit flex flex-col justify-start items-center mb-4">
      <div className="w-full flex justify-end p-2 gap-2">
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
        ></Button>
      </div>
      {children}
    </div>
  );
};
