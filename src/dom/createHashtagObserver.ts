import createHTMLObserver from "./createHTMLObserver";

const createHashtagObserver = ({
  callback,
  attribute,
}: {
  callback: (s: HTMLSpanElement) => void;
  attribute: string;
}): void =>
  createHTMLObserver({
    useBody: true,
    tag: "SPAN",
    className: "rm-page-ref--tag",
    callback: (s: HTMLSpanElement) => {
      if (!s.getAttribute(attribute)) {
        s.setAttribute(attribute, "true");
        callback(s);
      }
    },
  });

export default createHashtagObserver;
