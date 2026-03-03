import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "@supabase/supabase-js";
import { languages } from "../languages";
import {
  EMPTY_PLAYER_STATS,
  type AuthStatus,
  type AuthUser,
  type GameResult,
  type GameResultInput,
  type PlayerStats,
} from "../../types/auth";
import {
  ensureProfile,
  getProfileSummary,
  mergeBestStats,
  recordGameResult,
} from "../../lib/cloud";
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
  recentGames: GameResult[];
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
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  hydrateCloudStats: () => Promise<void>;
  mergeLocalStatsIfNeeded: () => Promise<void>;
  syncGameResult: (result: GameResultInput, token: string) => Promise<void>;
  syncCurrentGameResult: () => Promise<void>;
  retryPendingSync: () => Promise<void>;
  clearSyncError: () => void;
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
      recentGames: [],
      pendingResults: [],
      statsVersion: 1,
      mergeCompletedForUserId: null,
      currentGameToken: makeGameToken(),
      lastSyncedGameToken: null,

      setMobile: (isMobile) => set({ isMobile }),
      setFormError: (formError) => set({ formError }),
      clearSyncError: () => set({ syncError: null }),

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
          ...(user ? {} : { recentGames: [], profileStats: EMPTY_PLAYER_STATS }),
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
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });

        if (error) throw error;
      },

      signInWithEmail: async (email) => {
        if (!supabase) {
          throw new Error("Supabase auth is not configured.");
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/profile`,
          },
        });

        if (error) throw error;
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
        });
      },

      hydrateCloudStats: async () => {
        const { user } = get();
        if (!user) return;

        const summary = await getProfileSummary(user.id);
        set({
          profileStats: summary.stats,
          recentGames: summary.recentGames,
          streak: summary.stats.currentStreak,
          record: summary.stats.bestStreak,
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

      syncGameResult: async (result, token) => {
        const { user, pendingResults } = get();
        if (!user) return;

        set({ isSyncing: true, syncError: null });

        try {
          await recordGameResult(result);
          const summary = await getProfileSummary(user.id);

          set((state) => ({
            isSyncing: false,
            profileStats: summary.stats,
            recentGames: summary.recentGames,
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
