import { useEffect, useRef, useState } from "react";

export function useRapidClickToggle(requiredClicks = 5, windowMs = 1_000) {
  const [visible, setVisible] = useState(false);
  const clickTimesRef = useRef<number[]>([]);

  useEffect(() => {
    const handlePointerDown = () => {
      const now = Date.now();
      const recentClicks = [...clickTimesRef.current, now].filter(timestamp => now - timestamp <= windowMs);
      if (recentClicks.length >= requiredClicks) {
        setVisible(current => !current);
        clickTimesRef.current = [];
        return;
      }
      clickTimesRef.current = recentClicks;
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    return () => window.removeEventListener("pointerdown", handlePointerDown, true);
  }, [requiredClicks, windowMs]);

  return visible;
}
