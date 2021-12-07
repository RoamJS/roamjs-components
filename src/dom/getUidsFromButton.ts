import getUids from "./getUids";

const getUidsFromButton = (
  button: HTMLButtonElement
): ReturnType<typeof getUids> => {
  const block = button.closest(".roam-block") as HTMLDivElement;
  return block ? getUids(block) : { blockUid: "", parentUid: "" };
};

export default getUidsFromButton;
