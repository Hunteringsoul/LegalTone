import { useState, useEffect } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    setMatches(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export function useIsMobile(breakpoint = 1024) {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}

export function useContainerWidth(ref, { max = 620, padding = 32, min = 260 } = {}) {
  const [width, setWidth] = useState(max);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      setWidth(Math.min(max, Math.max(min, w - padding)));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("orientationchange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", update);
    };
  }, [ref, max, padding, min]);

  return width;
}
