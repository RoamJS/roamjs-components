const elToTitle = (e?: Node): string => {
  if (!e) {
    return "";
  } else if (e.nodeName === "#text") {
    return e.nodeValue || "";
  } else if (
    e.nodeName === "SPAN" &&
    (e as HTMLSpanElement).classList.contains("rm-page-ref__brackets")
  ) {
    return "";
  } else if (
    e.nodeName === "SPAN" &&
    (e as HTMLSpanElement).classList.contains("rm-page-ref")
  ) {
    return `[[${Array.from(e.childNodes).map(elToTitle).join("")}]]`;
  } else {
    return Array.from(e.childNodes).map(elToTitle).join("");
  }
};

export default elToTitle;
