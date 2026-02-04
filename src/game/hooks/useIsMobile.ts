import { useState, useEffect } from "react";

type UseIsMobileReturn = {
  isMobile: boolean;
  isLoading: boolean;
};

type Props = {
  maxWidth?: number;
};

export const useIsMobile = ({
  maxWidth = 768,
}: Props = {}): UseIsMobileReturn => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const MEDIA_QUERY = `(max-width: ${maxWidth}px)`;

  useEffect(() => {
    const checkIsMobile = () => {
      // Check using media query
      const mediaQuery = window.matchMedia(MEDIA_QUERY);

      // Check using user agent (additional detection)
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        "android",
        "webos",
        "iphone",
        "ipad",
        "ipod",
        "blackberry",
        "windows phone",
        "mobile",
      ];
      const isMobileUA = mobileKeywords.some((keyword) =>
        userAgent.includes(keyword)
      );

      // Combine both checks - prioritize media query but consider user agent
      const isMobileDevice =
        mediaQuery.matches || (isMobileUA && window.innerWidth <= maxWidth);

      setIsMobile(isMobileDevice);

      setIsLoading(false);
    };

    // Initial check
    checkIsMobile();

    // Listen for media query changes
    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    const handleChange = () => checkIsMobile();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Listen for window resize. I THINK WE CAN COMMENT THIS LINE AND IT STILL WORKS AND THE
    // PERFRORMANCE IS BETTER
    //window.addEventListener("resize", checkIsMobile);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }

      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return {
    isMobile,
    isLoading,
  };
};

export default useIsMobile;
