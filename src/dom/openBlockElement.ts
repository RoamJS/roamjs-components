

const openBlockElement = (
  block: HTMLElement | null,
  position?: number
): void => {
  if (block) {
    block.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    setTimeout(() => {
      const textArea = document.getElementById(block.id) as HTMLTextAreaElement;
      if (textArea?.tagName === "TEXTAREA") {
        const selection =
          typeof position !== "number" ? textArea.value.length : position;
        textArea.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        textArea.setSelectionRange(selection, selection);
      }
    }, 50);
  }
}

export default openBlockElement;
