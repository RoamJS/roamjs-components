import createHTMLObserver from "./createHTMLObserver";

const createButtonObserver = ({
  attribute,
  render,
  shortcut = attribute,
}: {
  shortcut?: string;
  attribute: string;
  render: (b: HTMLButtonElement) => void;
}): MutationObserver =>
  createHTMLObserver({
    callback: (b) => {
      if (
        b.innerText.toUpperCase() ===
          attribute.toUpperCase().replace(/-/g, " ") ||
        b.innerText.toUpperCase() === shortcut.toUpperCase()
      ) {
        const dataAttribute = `data-roamjs-${attribute}`;
        if (!b.getAttribute(dataAttribute)) {
          b.setAttribute(dataAttribute, "true");
          render(b as HTMLButtonElement);
        }
      }
    },
    tag: "BUTTON",
    className: "bp3-button",
    useBody: true,
  });

export default createButtonObserver;
