import type { UserBadge } from "../../../types/auth";
import type { IconType } from "react-icons";
import {
  FaBolt,
  FaCompass,
  FaCrown,
  FaFire,
  FaMapMarkedAlt,
  FaMedal,
  FaRegStar,
  FaBullseye,
} from "react-icons/fa";

const iconByKey: Record<string, IconType> = {
  spark: FaRegStar,
  flame: FaFire,
  map: FaMapMarkedAlt,
  bolt: FaBolt,
  target: FaBullseye,
  compass: FaCompass,
  crown: FaCrown,
  badge: FaMedal,
};

const sizeClasses = {
  sm: {
    container: "w-16 h-18",
    icon: "text-xl",
    ribbon: "text-[11px]",
  },
  md: {
    container: "w-20 h-22",
    icon: "text-2xl",
    ribbon: "text-xs",
  },
  lg: {
    container: "w-24 h-26",
    icon: "text-3xl",
    ribbon: "text-sm",
  },
} as const;

export const BadgeMedal = ({
  badge,
  size = "md",
  locked = false,
  highlighted = false,
}: {
  badge: UserBadge;
  size?: "sm" | "md" | "lg";
  locked?: boolean;
  highlighted?: boolean;
}) => {
  const Icon = iconByKey[badge.iconKey] ?? FaMedal;
  const classes = sizeClasses[size];

  return (
    <div
      className={`badge-medal rarity-${badge.rarity} ${classes.container} ${
        locked ? "badge-medal--locked" : ""
      } ${highlighted ? "badge-medal--highlight" : ""}`}
    >
      <div className="badge-medal__face">
        <Icon
          className={`${classes.icon} badge-medal__icon`}
          aria-hidden="true"
        />
      </div>
      <div className={`badge-medal__ribbon ${classes.ribbon} z-1`}>
        {badge.unlocked ? "Unlocked" : "Locked"}
      </div>
    </div>
  );
};
