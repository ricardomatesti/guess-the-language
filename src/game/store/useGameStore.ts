import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "@supabase/supabase-js";
import { languages } from "../languages";
import {
  EMPTY_PLAYER_PROGRESS,
  EMPTY_PLAYER_STATS,
  type AuthStatus,
  type AuthUser,
  type DailyQuest,
  type GameResult,
  type GameResultInput,
  type GameRewardSummary,
  type PlayerProgress,
  type PlayerStats,
  type UserBadge,
} from "../../types/auth";
import {
  ensureProfile,
  getProfileSummary,
  getProgressionSummary,
  mergeBestStats,
  processGameProgress,
  recordGameResult,
} from "../../lib/cloud";
import { normalizeAuthError } from "../../lib/authErrors";
import { getSessionUser, isSupabaseEnabled, supabase } from "../../lib/supabase";

export type statusType =
  | "correct"
  | "skipped"
  | "incorrect"
  | "current"
  | "locked";
export type GameStatusType =
  | "notStarted"
  | "loading"
  | "started"
  | "won"
  | "lost";

export type Step = {
  id: number;
  status: statusType;
  name: string;
};

export type Guess = {
  language: string;
  mistake: boolean;
};

type PendingGameResult = GameResultInput & { token: string };

interface GameState {
  gameStatus: GameStatusType;
  currentShowingStep: number;
  currentPlayingStep: number;
  steps: Step[];
  guesses: Guess[];
  formError: string | undefined;
  guessingData: any;
  streak: number;
  record: number;
  tries: number;
  isMobile: boolean;
  authStatus: AuthStatus;
  user: AuthUser | null;
  isSyncing: boolean;
  syncError: string | null;
  profileStats: PlayerStats;
  progress: PlayerProgress;
  badges: UserBadge[];
  dailyQuests: DailyQuest[];
  recentGames: GameResult[];
  lastRewardSummary: GameRewardSummary | null;
  pendingResults: PendingGameResult[];
  statsVersion: number;
  mergeCompletedForUserId: string | null;
  currentGameToken: string;
  lastSyncedGameToken: string | null;
  setMobile: (isMobile: boolean) => void;
  setFormError: (error: string | undefined) => void;
  setAuthSession: (session: Session | null) => void;
  startGame: () => Promise<void>;
  checkGuess: (guess: string, setFormText: (text: string) => void) => void;
  skipLevel: () => void;
  moveToLevel: (type: "up" | "down") => void;
  goToLevel: (level: number) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  hydrateCloudStats: () => Promise<void>;
  hydrateProgression: () => Promise<void>;
  mergeLocalStatsIfNeeded: () => Promise<void>;
  syncProgressionAfterGame: (
    result: GameResultInput,
    token: string,
  ) => Promise<void>;
  syncGameResult: (result: GameResultInput, token: string) => Promise<void>;
  syncCurrentGameResult: () => Promise<void>;
  retryPendingSync: () => Promise<void>;
  clearSyncError: () => void;
  dismissRewardSummary: () => void;
}

const makeGameToken = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const baseSteps = (): Step[] => [
  { id: 1, status: "current", name: "No. of speakers" },
  { id: 2, status: "locked", name: "Word" },
  { id: 3, status: "locked", name: "Audio" },
  { id: 4, status: "locked", name: "Sentence" },
  { id: 5, status: "locked", name: "Country" },
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gameStatus: "notStarted",
      currentShowingStep: 1,
      currentPlayingStep: 0,
      steps: baseSteps(),
      guesses: [],
      formError: undefined,
      guessingData: undefined,
      streak: 0,
      record: 0,
      tries: 0,
      isMobile: false,
      authStatus: isSupabaseEnabled ? "loading" : "disabled",
      user: null,
      isSyncing: false,
      syncError: null,
      profileStats: EMPTY_PLAYER_STATS,
      progress: EMPTY_PLAYER_PROGRESS,
      badges: [],
      dailyQuests: [],
      recentGames: [],
      lastRewardSummary: null,
      pendingResults: [],
      statsVersion: 1,
      mergeCompletedForUserId: null,
      currentGameToken: makeGameToken(),
      lastSyncedGameToken: null,

      setMobile: (isMobile) => set({ isMobile }),
      setFormError: (formError) => set({ formError }),
      clearSyncError: () => set({ syncError: null }),
      dismissRewardSummary: () => set({ lastRewardSummary: null }),

      setAuthSession: (session) => {
        if (!isSupabaseEnabled) {
          set({ authStatus: "disabled", user: null });
          return;
        }

        const user = getSessionUser(session);
        set({
          user,
          authStatus: user ? "authenticated" : "unauthenticated",
          syncError: null,
          ...(user
            ? {}
            : {
                recentGames: [],
                profileStats: EMPTY_PLAYER_STATS,
                progress: EMPTY_PLAYER_PROGRESS,
                badges: [],
                dailyQuests: [],
                lastRewardSummary: null,
              }),
        });
      },

      startGame: async () => {
        set({
          gameStatus: "loading",
          steps: baseSteps(),
          guesses: [],
          currentShowingStep: 1,
          currentPlayingStep: 0,
          tries: 0,
          currentGameToken: makeGameToken(),
          lastRewardSummary: null,
        });

        try {
          const response = await fetch("/data/data.json");
          const data = await response.json();
          const langs = data.languages;
          const randomIndex = Math.floor(langs.length * Math.random());
          set({ guessingData: langs[randomIndex], gameStatus: "started" });
        } catch (error) {
          console.error("Error loading JSON:", error);
          set({ gameStatus: "notStarted" });
        }
      },

      checkGuess: (guess, setFormText) => {
        const trimmedGuess = guess.trim();
        const { currentPlayingStep, guessingData, streak, record } = get();

        if (trimmedGuess === "") {
          set({ formError: "You must write something" });
          return;
        }

        if (!languages.includes(trimmedGuess)) {
          set({ formError: "Select a language from the list" });
          return;
        }

        set((state) => ({ tries: state.tries + 1 }));

        const isWin =
          trimmedGuess.toLowerCase() === guessingData.name.toLowerCase();

        if (isWin) {
          const nextStreak = streak + 1;
          const nextRecord = Math.max(nextStreak, record);
          set({ gameStatus: "won", streak: nextStreak, record: nextRecord });
          return;
        }

        if (currentPlayingStep === 4) {
          set({ gameStatus: "lost", streak: 0 });
          return;
        }

        set((state) => {
          const newSteps = [...state.steps];
          newSteps[currentPlayingStep] = {
            ...newSteps[currentPlayingStep],
            status: "incorrect",
          };
          newSteps[currentPlayingStep + 1] = {
            ...newSteps[currentPlayingStep + 1],
            status: "current",
          };

          return {
            steps: newSteps,
            guesses: [...state.guesses, { language: guess, mistake: true }],
            currentShowingStep: currentPlayingStep + 2,
            currentPlayingStep: currentPlayingStep + 1,
          };
        });
        setFormText("");
      },

      skipLevel: () => {
        const { currentPlayingStep } = get();

        if (currentPlayingStep >= 4) return;

        set((state) => {
          const newSteps = [...state.steps];
          newSteps[currentPlayingStep] = {
            ...newSteps[currentPlayingStep],
            status: "skipped",
          };
          newSteps[currentPlayingStep + 1] = {
            ...newSteps[currentPlayingStep + 1],
            status: "current",
          };

          return {
            steps: newSteps,
            currentShowingStep: currentPlayingStep + 2,
            currentPlayingStep: currentPlayingStep + 1,
          };
        });
      },

      moveToLevel: (type) => {
        set((state) => ({
          currentShowingStep:
            type === "up"
              ? state.currentShowingStep + 1
              : state.currentShowingStep - 1,
        }));
      },

      goToLevel: (level) => {
        const { steps } = get();
        if (steps[level - 1].status !== "locked") {
          set({ currentShowingStep: level });
        }
      },

      signInWithGoogle: async () => {
        if (!supabase) {
          throw new Error("Supabase auth is not configured.");
        }

        const redirectTo = `${window.location.origin}/profile`;
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo },
          });

          if (error) throw error;
        } catch (error) {
          throw new Error(normalizeAuthError(error));
        }
      },

      signInWithEmailPassword: async (email, password) => {
        if (!supabase) {
          throw new Error("Supabase auth is not configured.");
        }

        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;
        } catch (error) {
          throw new Error(normalizeAuthError(error));
        }
      },

      signUpWithEmailPassword: async (email, password) => {
        if (!supabase) {
          throw new Error("Supabase auth is not configured.");
        }

        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/login`,
            },
          });

          if (error) throw error;
        } catch (error) {
          throw new Error(normalizeAuthError(error));
        }
      },

      sendPasswordReset: async (email) => {
        if (!supabase) {
          throw new Error("Supabase auth is not configured.");
        }

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) throw error;
        } catch (error) {
          throw new Error(normalizeAuthError(error));
        }
      },

      updatePassword: async (newPassword) => {
        if (!supabase) {
          throw new Error("Supabase auth is not configured.");
        }

        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) throw error;
        } catch (error) {
          throw new Error(normalizeAuthError(error));
        }
      },

      signOut: async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({
          authStatus: "unauthenticated",
          user: null,
          recentGames: [],
          profileStats: EMPTY_PLAYER_STATS,
          progress: EMPTY_PLAYER_PROGRESS,
          badges: [],
          dailyQuests: [],
          lastRewardSummary: null,
        });
      },

      hydrateCloudStats: async () => {
        const { user } = get();
        if (!user) return;

        const summary = await getProfileSummary(user.id);
        set({
          profileStats: summary.stats,
          recentGames: summary.recentGames,
          progress: summary.progress,
          badges: summary.badges,
          dailyQuests: summary.dailyQuests,
          streak: summary.stats.currentStreak,
          record: summary.stats.bestStreak,
        });
      },

      hydrateProgression: async () => {
        const { user } = get();
        if (!user) return;

        const progression = await getProgressionSummary(user.id);
        set({
          progress: progression.progress,
          badges: progression.badges,
          dailyQuests: progression.dailyQuests,
        });
      },

      mergeLocalStatsIfNeeded: async () => {
        const { user, mergeCompletedForUserId, streak, record } = get();
        if (!user) return;
        if (mergeCompletedForUserId === user.id) return;

        await ensureProfile(user.id, user.email);
        const merged = await mergeBestStats(user.id, streak, record);

        set({
          streak: merged.currentStreak,
          record: merged.bestStreak,
          mergeCompletedForUserId: user.id,
          profileStats: merged,
        });
      },

      syncProgressionAfterGame: async (result, token) => {
        const rewardSummary = await processGameProgress(result, token);

        set({
          lastRewardSummary: rewardSummary,
          progress: {
            totalXp: rewardSummary.totalXpAfter,
            level: rewardSummary.levelAfter,
            nextLevelXp: rewardSummary.levelAfter * 120,
            currentLevelProgressPct: Number(
              (
                ((rewardSummary.totalXpAfter -
                  (rewardSummary.levelAfter - 1) * 120) /
                  120) *
                100
              ).toFixed(1),
            ),
          },
          dailyQuests: rewardSummary.questUpdates,
        });
      },

      syncGameResult: async (result, token) => {
        const { user, pendingResults } = get();
        if (!user) return;

        set({ isSyncing: true, syncError: null });

        try {
          await recordGameResult(result);
          await get().syncProgressionAfterGame(result, token);
          const summary = await getProfileSummary(user.id);

          set((state) => ({
            isSyncing: false,
            profileStats: summary.stats,
            recentGames: summary.recentGames,
            progress: summary.progress,
            badges: summary.badges,
            dailyQuests: summary.dailyQuests,
            streak: summary.stats.currentStreak,
            record: summary.stats.bestStreak,
            lastSyncedGameToken: token,
            pendingResults: state.pendingResults.filter(
              (item) => item.token !== token,
            ),
          }));
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not sync your game result.";

          const alreadyQueued = pendingResults.some((p) => p.token === token);
          set((state) => ({
            isSyncing: false,
            syncError: message,
            pendingResults: alreadyQueued
              ? state.pendingResults
              : [...state.pendingResults, { ...result, token }],
          }));
        }
      },

      syncCurrentGameResult: async () => {
        const {
          authStatus,
          user,
          gameStatus,
          guessingData,
          currentPlayingStep,
          tries,
          currentGameToken,
          lastSyncedGameToken,
          syncGameResult,
        } = get();

        if (authStatus !== "authenticated" || !user) return;
        if (gameStatus !== "won" && gameStatus !== "lost") return;
        if (!guessingData?.name) return;
        if (currentGameToken === lastSyncedGameToken) return;

        const result: GameResultInput = {
          languageName: guessingData.name,
          won: gameStatus === "won",
          hintsUsed: currentPlayingStep + 1,
          tries,
          guessedAt: new Date().toISOString(),
        };

        await syncGameResult(result, currentGameToken);
      },

      retryPendingSync: async () => {
        const { user, pendingResults } = get();
        if (!user || pendingResults.length === 0) return;

        for (const result of pendingResults) {
          await get().syncGameResult(result, result.token);
        }
      },
    }),
    {
      name: "game-storage",
      partialize: (state) => ({
        streak: state.streak,
        record: state.record,
        statsVersion: state.statsVersion,
        mergeCompletedForUserId: state.mergeCompletedForUserId,
        pendingResults: state.pendingResults,
      }),
    },
  ),
);
