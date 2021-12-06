import { useMemo } from "react";
import getSubTree from "../util/getSubTree";

const useSubTree = (
  props: Parameters<typeof getSubTree>[0]
): ReturnType<typeof getSubTree> =>
  useMemo(
    () => getSubTree(props),
    [
      ...Object.entries(props)
        .filter(([key]) => key === "tree" || key === "parentUid")
        .map(([, v]) => v),
    ]
  );

export default useSubTree;
