import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export const ArrowButton = ({
  onClick,
  size = "lg",
  tailwindClasses,
  disabled,
  direction,
}: {
  onClick?: () => void;
  size?: "lg" | "md" | "sm";
  tailwindClasses?: string;
  disabled?: boolean;
  direction: "left" | "right";
}) => {
  const sizeClasses =
    size === "lg" ? "px-4 py-4" : size === "md" ? "px-3 py-3" : "px-2 py-2";

  if (disabled) {
    return (
      <button
        className={`rounded-2xl transition-all bg-[rgba(234,246,255,0.5)] text-[var(--text)] shadow-[0_4px_0_#0391CE] ${sizeClasses} ${tailwindClasses}`}
        onClick={onClick}
      >
        {direction === "left" ? (
          <FaArrowLeft size={25} color="#91DBF8"></FaArrowLeft>
        ) : (
          <FaArrowRight size={25} color="#91DBF8"></FaArrowRight>
        )}
      </button>
    );
  }

  return (
    <button
      className={`rounded-2xl active:shadow-none active:translate-y-[4px] transition-all bg-[#EAF6FF] text-[var(--text)] shadow-[0_4px_0_#0391CE] hover:bg-[#D9F3FF] ${sizeClasses} ${tailwindClasses}`}
      onClick={onClick}
    >
      {direction === "left" ? (
        <FaArrowLeft size={25} color="#91DBF8"></FaArrowLeft>
      ) : (
        <FaArrowRight size={25} color="#91DBF8"></FaArrowRight>
      )}
    </button>
  );
};
