export const Button = ({
  onClick,
  bg,
  shadow,
  hover,
  text,
  textColor,
  size = "lg",
  tailwindClasses,
}: {
  onClick?: () => void;
  bg: string;
  shadow?: string;
  hover: string;
  text?: string;
  textColor?: string;
  size?: "lg" | "md" | "sm";
  tailwindClasses?: string;
}) => {
  const baseClasses =
    "font-bold rounded-2xl active:shadow-none active:translate-y-[4px] transition-all tracking-wider bg-[var(--bg)] text-[var(--text)] shadow-[0_4px_0_var(--shadow)] hover:bg-[var(--hover)]";
  const sizeClasses =
    size === "lg"
      ? "px-8 py-4"
      : size === "md"
      ? "px-7 py-3"
      : "px-6 py-2 text-sm";

  return (
    <button
      className={`${baseClasses}  ${sizeClasses} ${tailwindClasses}`}
      style={
        {
          "--bg": bg,
          "--text": textColor,
          "--shadow": shadow,
          "--hover": hover,
        } as React.CSSProperties
      }
      onClick={onClick}
    >
      {text}
    </button>
  );
};
