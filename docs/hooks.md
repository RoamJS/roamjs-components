# Hooks

https://github.com/RoamJS/roamjs-components/blob/main/src/hooks

Custom React hooks in this codebase manage user interactions and data structures.

[`useArrowKeyDown`](https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/useArrowKeyDown.ts#L13) handles keyboard navigation within a list of results. It takes three parameters: [`results`](https://github.com/RoamJS/roamjs-components/blob/main/src/testing/mockRoamEnvironment.ts#L1147), [`onEnter`](https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/useArrowKeyDown.ts#L15), and [`menuRef`](https://github.com/RoamJS/roamjs-components/blob/main/src/components/CursorMenu.tsx#L115). The hook maintains the [`activeIndex`](https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/useArrowKeyDown.ts#L22) state to track the selected item in the list. The [`onKeyDown`](https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/useArrowKeyDown.ts#L23) function processes key presses:

- **ArrowDown**: Increments [`activeIndex`](https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/useArrowKeyDown.ts#L22), wrapping to 0 if the end of the list is reached, and ensures the selected element is in view.
- **ArrowUp**: Decrements [`activeIndex`](https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/useArrowKeyDown.ts#L22), wrapping to the last index if the beginning is reached, and ensures the selected element is in view.
- **Enter**: Calls [`onEnter`](https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/useArrowKeyDown.ts#L15) with the selected item and resets [`activeIndex`](https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/useArrowKeyDown.ts#L22).

[`useSubTree`](https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/useSubTree.ts#L4) manages a sub-tree data structure. It takes [`props`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L187) and uses [`useMemo`](https://github.com/RoamJS/roamjs-components/blob/main/src/components.tsx#L2) to memoize the result of [`getSubTree(props)`](https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/useSubTree.ts#L8), based on the [`parentUid`](https://github.com/RoamJS/roamjs-components/blob/main/src/components/FormDialog.tsx#L97) property. This hook returns the current sub-tree object and a function to update it.

Both hooks are exported from `https://github.com/RoamJS/roamjs-components/blob/main/src/hooks/index.ts`.
