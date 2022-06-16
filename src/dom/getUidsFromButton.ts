import getUids from "./getUids";

const getUidsFromButton = (
  button: HTMLButtonElement
): ReturnType<typeof getUids> => {
  return getUids(button.closest<HTMLDivElement>(".roam-block"));
};

export default getUidsFromButton;
