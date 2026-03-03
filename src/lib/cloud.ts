import {
  EMPTY_PLAYER_PROGRESS,
  EMPTY_PLAYER_STATS,
  type DailyQuest,
  type GameResult,
  type GameResultInput,
  type GameRewardSummary,
  type QuestRewardUpdate,
  type PlayerProgress,
  type PlayerStats,
  type ProfileSummary,
  type UserBadge,
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

type PlayerProgressRow = {
  user_id: string;
  total_xp: number;
  level: number;
};

type BadgeDefinitionRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon_key: string;
  active: boolean;
};

type UserBadgeRow = {
  badge_id: string;
  unlocked_at: string;
};

type DailyQuestRow = {
  quest_id: string;
  progress: number;
  target: number;
  completed_at: string | null;
};

type DailyQuestDefinitionRow = {
  id: string;
  title: string;
};

const xpPerLevel = 120;

const toPlayerStats = (row: PlayerStatsRow | null): PlayerStats => {
  if (!row) return EMPTY_PLAYER_STATS;

  const gamesPlayed = row.games_played ?? 0;
  const wins = row.wins ?? 0;

  return {
    gamesPlayed,
    wins,
    losses: row.losses ?? 0,
    winRate:
      gamesPlayed > 0 ? Number(((wins / gamesPlayed) * 100).toFixed(1)) : 0,
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

const toPlayerProgress = (row: PlayerProgressRow | null): PlayerProgress => {
  if (!row) return EMPTY_PLAYER_PROGRESS;

  const currentLevelFloor = (row.level - 1) * xpPerLevel;
  const nextLevelXp = row.level * xpPerLevel;
  const progressInLevel = Math.max(0, row.total_xp - currentLevelFloor);

  return {
    totalXp: row.total_xp,
    level: row.level,
    nextLevelXp,
    currentLevelProgressPct: Number(
      ((progressInLevel / xpPerLevel) * 100).toFixed(1),
    ),
  };
};

const todayUtc = () => new Date().toISOString().slice(0, 10);

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

export const getProgressionSummary = async (userId: string) => {
  if (!supabase) {
    return {
      progress: EMPTY_PLAYER_PROGRESS,
      badges: [] as UserBadge[],
      dailyQuests: [] as DailyQuest[],
    };
  }

  const { error: ensureError } = await supabase.rpc(
    "ensure_daily_quests_for_today",
  );
  if (ensureError) throw ensureError;

  const today = todayUtc();

  const [
    { data: progressData, error: progressError },
    { data: badgeDefinitions, error: badgeDefinitionsError },
    { data: userBadgeRows, error: userBadgeRowsError },
    { data: dailyQuestRows, error: dailyQuestRowsError },
    { data: dailyQuestDefinitions, error: dailyQuestDefinitionsError },
  ] = await Promise.all([
    supabase
      .from("player_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<PlayerProgressRow>(),
    supabase
      .from("badge_definitions")
      .select("id, title, description, category, rarity, icon_key, active")
      .eq("active", true)
      .returns<BadgeDefinitionRow[]>(),
    supabase
      .from("user_badges")
      .select("badge_id, unlocked_at")
      .eq("user_id", userId)
      .returns<UserBadgeRow[]>(),
    supabase
      .from("user_daily_quests")
      .select("quest_id, progress, target, completed_at")
      .eq("user_id", userId)
      .eq("quest_date", today)
      .returns<DailyQuestRow[]>(),
    supabase
      .from("daily_quest_definitions")
      .select("id, title")
      .eq("active", true)
      .returns<DailyQuestDefinitionRow[]>(),
  ]);

  if (progressError) throw progressError;
  if (badgeDefinitionsError) throw badgeDefinitionsError;
  if (userBadgeRowsError) throw userBadgeRowsError;
  if (dailyQuestRowsError) throw dailyQuestRowsError;
  if (dailyQuestDefinitionsError) throw dailyQuestDefinitionsError;

  const unlockedMap = new Map(
    (userBadgeRows ?? []).map((row) => [row.badge_id, row.unlocked_at]),
  );

  const badges: UserBadge[] = (badgeDefinitions ?? [])
    .map((definition) => {
      const unlockedAt = unlockedMap.get(definition.id) ?? null;
      return {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        category: definition.category,
        rarity: definition.rarity,
        iconKey: definition.icon_key,
        unlocked: Boolean(unlockedAt),
        unlockedAt,
      };
    })
    .sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return a.title.localeCompare(b.title);
    });

  const questDefinitionMap = new Map(
    (dailyQuestDefinitions ?? []).map((q) => [q.id, q.title]),
  );

  const dailyQuests: DailyQuest[] = (dailyQuestRows ?? []).map((q) => ({
    id: q.quest_id,
    title: questDefinitionMap.get(q.quest_id) ?? q.quest_id,
    progress: q.progress,
    target: q.target,
    completed: q.completed_at !== null,
    completedAt: q.completed_at,
  }));

  return {
    progress: toPlayerProgress(progressData),
    badges,
    dailyQuests,
  };
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
      progress: EMPTY_PLAYER_PROGRESS,
      badges: [],
      dailyQuests: [],
    };
  }

  const [
    { data: profileData, error: profileError },
    { data: statsData, error: statsError },
    { data: recentData, error: recentError },
    progression,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle<ProfileRow>(),
    supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<PlayerStatsRow>(),
    supabase
      .from("game_results")
      .select("id, language_name, won, hints_used, tries, guessed_at")
      .eq("user_id", userId)
      .order("guessed_at", { ascending: false })
      .limit(recentGamesLimit)
      .returns<GameResultRow[]>(),
    getProgressionSummary(userId),
  ]);

  if (profileError) throw profileError;
  if (statsError) throw statsError;
  if (recentError) throw recentError;

  return {
    displayName: profileData?.display_name ?? null,
    avatarUrl: profileData?.avatar_url ?? null,
    stats: toPlayerStats(statsData),
    recentGames: (recentData ?? []).map(toGameResult),
    progress: progression.progress,
    badges: progression.badges,
    dailyQuests: progression.dailyQuests,
  };
};

export const recordGameResult = async (result: GameResultInput) => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.",
    );
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

export const processGameProgress = async (
  result: GameResultInput,
  gameToken: string,
): Promise<GameRewardSummary> => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.",
    );
  }

  const { data, error } = await supabase.rpc("process_game_progress", {
    p_won: result.won,
    p_hints_used: result.hintsUsed,
    p_tries: result.tries,
    p_language_name: result.languageName,
    p_game_token: gameToken,
  });

  if (error) throw error;

  const unlockedBadges = ((data?.unlockedBadges ?? []) as UserBadge[]).map(
    (badge) => ({
      ...badge,
      unlocked: true,
      unlockedAt: badge.unlockedAt ?? new Date().toISOString(),
    }),
  );

  return {
    xpBase: data?.xpBase ?? data?.xpGained ?? 0,
    xpQuestBonus: data?.xpQuestBonus ?? 0,
    xpTotal: data?.xpTotal ?? data?.xpGained ?? 0,
    levelBefore: data?.levelBefore ?? 1,
    levelAfter: data?.levelAfter ?? 1,
    totalXpBefore: data?.totalXpBefore ?? 0,
    totalXpAfter: data?.totalXpAfter ?? 0,
    unlockedBadges,
    questUpdates: ((data?.questUpdates ?? []) as QuestRewardUpdate[]).map(
      (quest) => ({
        id: quest.id,
        title: quest.title,
        progressBefore: quest.progressBefore ?? 0,
        progressAfter: quest.progressAfter ?? quest.progressBefore ?? 0,
        target: quest.target ?? 0,
        completed:
          typeof quest.completed === "boolean"
            ? quest.completed
            : Boolean(quest.completedAt),
        completedAt: quest.completedAt ?? null,
        completedNow: Boolean(quest.completedNow),
        xpReward: quest.xpReward ?? 0,
      }),
    ),
  };
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
