import { useEffect } from "react";
import type { UserBadge } from "../../../types/auth";
import { BadgeMedal } from "./BadgeMedal";

export const BadgeDetailsModal = ({
  badge,
  onClose,
}: {
  badge: UserBadge | null;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (!badge) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      <button
        type="button"
        aria-label="Close badge details"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="badge-details-title"
        className="relative z-10 w-full md:max-w-md bg-white rounded-t-3xl md:rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between mb-4">
          <h3
            id="badge-details-title"
            className="text-xl font-black text-blue-900"
          >
            Badge Details
          </h3>
          <button
            type="button"
            className="text-blue-900/70 hover:text-blue-900 font-bold"
            onClick={onClose}
            autoFocus
          >
            Close
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-3">
          <div>
            <BadgeMedal badge={badge} size="lg" locked={!badge.unlocked} />
          </div>
          <h4 className="text-2xl font-black text-blue-900">{badge.title}</h4>

          <div className="flex gap-2">
            <span className={`badge-rarity-pill rarity-${badge.rarity}`}>
              {badge.rarity}
            </span>
            <span
              className={`badge-status-pill ${
                badge.unlocked
                  ? "badge-status-pill--unlocked"
                  : "badge-status-pill--locked"
              }`}
            >
              {badge.unlocked ? "Unlocked" : "Locked"}
            </span>
          </div>

          <p className="text-blue-900/70 text-sm">{badge.description}</p>

          {badge.unlockedAt && (
            <p className="text-xs text-blue-900/50">
              Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
