import { useEffect, useCallback } from "react";

/**
 * Global click ripple — spawns an expanding wave ring wherever
 * the user clicks. Feels like dropping a pebble in water.
 */
const WaveClickEffect = () => {
  const handleClick = useCallback((e: MouseEvent) => {
    const ring = document.createElement("div");
    ring.className = "wave-click-ring";
    ring.style.left = `${e.clientX}px`;
    ring.style.top = `${e.clientY}px`;
    document.body.appendChild(ring);
    ring.addEventListener("animationend", () => ring.remove());
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  return null;
};

export default WaveClickEffect;
