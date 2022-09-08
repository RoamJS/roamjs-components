import elToTitle from "./elToTitle";
import getPageTitleByHtmlElement from "./getPageTitleByHtmlElement";

const getPageTitleValueByHtmlElement = (e: Element): string => {
  return elToTitle(getPageTitleByHtmlElement(e));
};

export default getPageTitleValueByHtmlElement;
