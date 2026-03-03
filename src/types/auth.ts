export type AuthProvider = "email" | "google" | "unknown";

export type AuthStatus =
  | "disabled"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export type AuthUser = {
  id: string;
  email: string | null;
  provider: AuthProvider;
};

export type EmailPasswordCredentials = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type ResetPasswordPayload = {
  password: string;
  confirmPassword: string;
};

export type AuthFormState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

export type GameResultInput = {
  languageName: string;
  won: boolean;
  hintsUsed: number;
  tries: number;
  guessedAt: string;
};

export type GameResult = {
  id: string;
  languageName: string;
  won: boolean;
  hintsUsed: number;
  tries: number;
  guessedAt: string;
};

export type PlayerStats = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  avgHintsUsed: number;
};

export type PlayerProgress = {
  totalXp: number;
  level: number;
  nextLevelXp: number;
  currentLevelProgressPct: number;
};

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export type UserBadge = {
  id: string;
  title: string;
  description: string;
  category: string;
  rarity: BadgeRarity;
  iconKey: string;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type DailyQuest = {
  id: string;
  title: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt: string | null;
};

export type GameRewardSummary = {
  xpGained: number;
  levelBefore: number;
  levelAfter: number;
  totalXpBefore: number;
  totalXpAfter: number;
  unlockedBadges: UserBadge[];
  questUpdates: DailyQuest[];
};

export type ProfileSummary = {
  displayName: string | null;
  avatarUrl: string | null;
  stats: PlayerStats;
  recentGames: GameResult[];
  progress: PlayerProgress;
  badges: UserBadge[];
  dailyQuests: DailyQuest[];
};

export const EMPTY_PLAYER_STATS: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  currentStreak: 0,
  bestStreak: 0,
  avgHintsUsed: 0,
};

export const EMPTY_PLAYER_PROGRESS: PlayerProgress = {
  totalXp: 0,
  level: 1,
  nextLevelXp: 120,
  currentLevelProgressPct: 0,
};
