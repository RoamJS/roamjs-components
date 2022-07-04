import React, { useCallback, useState } from "react";

const isElInView = (el: HTMLElement, ul: HTMLElement) => {
  const containerTop = ul.scrollTop;
  const containerBottom = containerTop + ul.offsetHeight;

  const elemTop = el.offsetTop;
  const elemBottom = elemTop + el.offsetHeight;

  return elemBottom <= containerBottom && elemTop >= containerTop;
};

const useArrowKeyDown = <T>({
  results,
  onEnter,
  menuRef,
}: {
  results: T[];
  onEnter: (i: T) => void;
  menuRef: React.RefObject<HTMLUListElement>;
}): {
  activeIndex: number;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
} => {
  const [activeIndex, setActiveIndex] = useState(0);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (results.length > 0) {
        if (e.key === "ArrowDown") {
          const newIndex = (activeIndex + 1) % results.length;
          setActiveIndex(newIndex);
          const ul = menuRef.current;
          if (ul) {
            const el = ul.children[newIndex] as HTMLElement;
            if (el && !isElInView(el, ul)) {
              el.scrollIntoView(false);
            }
          }
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === "ArrowUp") {
          const newIndex = (activeIndex + results.length - 1) % results.length;
          setActiveIndex(newIndex);
          const ul = menuRef.current;
          if (ul) {
            const el = ul.children[newIndex] as HTMLElement;
            if (el && !isElInView(el, ul)) {
              el.scrollIntoView(true);
            }
          }
          e.preventDefault();
          e.stopPropagation();
        }
      }
      if (e.key === "Enter") {
        onEnter(results[activeIndex]);
        setActiveIndex(0);
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [activeIndex, setActiveIndex, results, onEnter]
  );
  return {
    activeIndex,
    onKeyDown,
  };
};

export default useArrowKeyDown;
