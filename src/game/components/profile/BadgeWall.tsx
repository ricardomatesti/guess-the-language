import type { UserBadge, BadgeRarity } from "../../../types/auth";
import { BadgeMedal } from "./BadgeMedal";

const rarityOrder: BadgeRarity[] = ["legendary", "epic", "rare", "common"];

const rarityTitle: Record<BadgeRarity, string> = {
  legendary: "Legendary",
  epic: "Epic",
  rare: "Rare",
  common: "Common",
};

const sortBadges = (list: UserBadge[]) => {
  return [...list].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;

    if (a.unlockedAt && b.unlockedAt) {
      const dateDiff =
        new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      if (dateDiff !== 0) return dateDiff;
    }

    return a.title.localeCompare(b.title);
  });
};

export const BadgeWall = ({
  badges,
  highlightedBadgeIds,
  onSelectBadge,
}: {
  badges: UserBadge[];
  highlightedBadgeIds?: string[];
  onSelectBadge: (badge: UserBadge) => void;
}) => {
  const highlightSet = new Set(highlightedBadgeIds ?? []);

  if (badges.length === 0) {
    return (
      <p className="text-blue-900/70">
        No badges yet. Keep playing to unlock them.
      </p>
    );
  }

  return (
    <div className="flex flex-row justify-between flex-wrap items-center justify-center gap-2">
      {rarityOrder.map((rarity) => {
        const items = sortBadges(
          badges.filter((badge) => badge.rarity === rarity)
        );
        if (items.length === 0) return null;

        const unlockedCount = items.filter((badge) => badge.unlocked).length;

        return (
          <section key={rarity}>
            <div className="flex flex-col items-center justify-start mb-2">
              <h3 className="font-black text-blue-900">
                {rarityTitle[rarity]}
              </h3>
              <span className="text-xs text-blue-900/60 font-semibold">
                {unlockedCount}/{items.length} unlocked
              </span>
            </div>

            <div className="flex flex-row flex-wrap gap-2">
              {items.map((badge, index) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => onSelectBadge(badge)}
                  className="badge-wall-item text-left w-30"
                  style={{ animationDelay: `${index * 60}ms` }}
                  aria-label={`${badge.title} badge, ${
                    badge.unlocked ? "unlocked" : "locked"
                  }, ${badge.rarity}`}
                >
                  <div className="relative">
                    <BadgeMedal
                      badge={badge}
                      size="md"
                      locked={!badge.unlocked}
                      highlighted={highlightSet.has(badge.id)}
                    />
                    {!badge.unlocked && (
                      <span className="badge-locked-chip">Locked</span>
                    )}
                  </div>
                  <p
                    className={`badge-title ${
                      badge.unlocked ? "" : "badge-title--locked"
                    }`}
                  >
                    {badge.title}
                  </p>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
