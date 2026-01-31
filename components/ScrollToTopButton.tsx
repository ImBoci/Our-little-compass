"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

type ScrollToTopButtonProps = {
  accent?: "rose" | "purple";
};

export default function ScrollToTopButton({ accent = "rose" }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const accentClasses =
    accent === "purple"
      ? "bg-purple-500/20 border-purple-300/70 text-purple-600"
      : "bg-rose-500/20 border-rose-300/70 text-rose-600";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-[90] flex items-center justify-center w-11 h-11 rounded-full backdrop-blur-md border shadow-lg transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${accentClasses}`}
      aria-label="Scroll to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
