import { useCallback, useState } from "react";

export const toTitle = (id: string): string =>
  id
    .split("-")
    .map((s) => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`)
    .join(" ");

export const useArrowKeyDown = <T>({
  results,
  onEnter,
}: {
  results: T[];
  onEnter: (i: T) => void;
}): {
  activeIndex: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
} => {
  const [activeIndex, setActiveIndex] = useState(0);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (results.length > 0) {
        if (e.key === "ArrowDown") {
          setActiveIndex((activeIndex + 1) % results.length);
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === "ArrowUp") {
          setActiveIndex((activeIndex + results.length - 1) % results.length);
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === "Enter") {
          onEnter(results[activeIndex]);
          setActiveIndex(0);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    [activeIndex, setActiveIndex, results, onEnter]
  );
  return {
    activeIndex,
    onKeyDown,
  };
};
