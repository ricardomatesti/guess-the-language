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

export type ProfileSummary = {
  displayName: string | null;
  avatarUrl: string | null;
  stats: PlayerStats;
  recentGames: GameResult[];
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
