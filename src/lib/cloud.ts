import {
  EMPTY_PLAYER_STATS,
  type GameResult,
  type GameResultInput,
  type PlayerStats,
  type ProfileSummary,
} from "../types/auth";
import { supabase } from "./supabase";

type PlayerStatsRow = {
  user_id: string;
  games_played: number;
  wins: number;
  losses: number;
  current_streak: number;
  best_streak: number;
  hints_used_total: number;
  avg_hints_used: number;
};

type ProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
};

type GameResultRow = {
  id: string;
  language_name: string;
  won: boolean;
  hints_used: number;
  tries: number;
  guessed_at: string;
};

const toPlayerStats = (row: PlayerStatsRow | null): PlayerStats => {
  if (!row) return EMPTY_PLAYER_STATS;

  const gamesPlayed = row.games_played ?? 0;
  const wins = row.wins ?? 0;

  return {
    gamesPlayed,
    wins,
    losses: row.losses ?? 0,
    winRate: gamesPlayed > 0 ? Number(((wins / gamesPlayed) * 100).toFixed(1)) : 0,
    currentStreak: row.current_streak ?? 0,
    bestStreak: row.best_streak ?? 0,
    avgHintsUsed: row.avg_hints_used ?? 0,
  };
};

const toGameResult = (row: GameResultRow): GameResult => ({
  id: row.id,
  languageName: row.language_name,
  won: row.won,
  hintsUsed: row.hints_used,
  tries: row.tries,
  guessedAt: row.guessed_at,
});

export const ensureProfile = async (userId: string, email?: string | null) => {
  if (!supabase) return;

  const payload = {
    id: userId,
    display_name: email ? email.split("@")[0] : null,
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) throw error;
};

export const getPlayerStats = async (userId: string): Promise<PlayerStats> => {
  if (!supabase) return EMPTY_PLAYER_STATS;

  const { data, error } = await supabase
    .from("player_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<PlayerStatsRow>();

  if (error) throw error;
  return toPlayerStats(data);
};

export const getProfileSummary = async (
  userId: string,
  recentGamesLimit = 10,
): Promise<ProfileSummary> => {
  if (!supabase) {
    return {
      displayName: null,
      avatarUrl: null,
      stats: EMPTY_PLAYER_STATS,
      recentGames: [],
    };
  }

  const [{ data: profileData, error: profileError }, { data: statsData, error: statsError }, { data: recentData, error: recentError }] = await Promise.all([
    supabase.from("profiles").select("display_name, avatar_url").eq("id", userId).maybeSingle<ProfileRow>(),
    supabase.from("player_stats").select("*").eq("user_id", userId).maybeSingle<PlayerStatsRow>(),
    supabase
      .from("game_results")
      .select("id, language_name, won, hints_used, tries, guessed_at")
      .eq("user_id", userId)
      .order("guessed_at", { ascending: false })
      .limit(recentGamesLimit)
      .returns<GameResultRow[]>(),
  ]);

  if (profileError) throw profileError;
  if (statsError) throw statsError;
  if (recentError) throw recentError;

  return {
    displayName: profileData?.display_name ?? null,
    avatarUrl: profileData?.avatar_url ?? null,
    stats: toPlayerStats(statsData),
    recentGames: (recentData ?? []).map(toGameResult),
  };
};

export const recordGameResult = async (result: GameResultInput) => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
  }

  const { error } = await supabase.rpc("record_game_result", {
    p_language_name: result.languageName,
    p_won: result.won,
    p_hints_used: result.hintsUsed,
    p_tries: result.tries,
    p_guessed_at: result.guessedAt,
  });

  if (error) throw error;
};

export const mergeBestStats = async (
  userId: string,
  localStreak: number,
  localRecord: number,
): Promise<PlayerStats> => {
  if (!supabase) return EMPTY_PLAYER_STATS;

  const { data: statsData, error: statsError } = await supabase
    .from("player_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<PlayerStatsRow>();

  if (statsError) throw statsError;

  const cloud = toPlayerStats(statsData);
  const mergedCurrentStreak = Math.max(localStreak, cloud.currentStreak);
  const mergedBestStreak = Math.max(localRecord, cloud.bestStreak);

  const upsertPayload = {
    user_id: userId,
    games_played: cloud.gamesPlayed,
    wins: cloud.wins,
    losses: cloud.losses,
    current_streak: mergedCurrentStreak,
    best_streak: mergedBestStreak,
    hints_used_total: Math.round(cloud.avgHintsUsed * cloud.gamesPlayed),
    avg_hints_used: cloud.avgHintsUsed,
  };

  const { error: upsertError } = await supabase
    .from("player_stats")
    .upsert(upsertPayload, { onConflict: "user_id" });

  if (upsertError) throw upsertError;

  return {
    ...cloud,
    currentStreak: mergedCurrentStreak,
    bestStreak: mergedBestStreak,
  };
};
