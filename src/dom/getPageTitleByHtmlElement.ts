const getPageTitleByHtmlElement = (e: Element): ChildNode | undefined => {
  const container =
    e.closest(".roam-log-page") ||
    e.closest(".rm-sidebar-outline") ||
    e.closest(".roam-article") ||
    document;
  const heading =
    (container.getElementsByClassName(
      "rm-title-display"
    )[0] as HTMLHeadingElement) ||
    (container.getElementsByClassName(
      "rm-zoom-item-content"
    )[0] as HTMLSpanElement);
  return Array.from(heading.childNodes).find(
    (n) => n.nodeName === "#text" || n.nodeName === "SPAN"
  );
};

export default getPageTitleByHtmlElement;
