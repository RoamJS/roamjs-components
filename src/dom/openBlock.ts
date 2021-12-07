import openBlockElement from "./openBlockElement";

const openBlock = (blockId?: string, position?: number): void =>
  openBlockElement(document.getElementById(blockId || ""), position);

export default openBlock;
