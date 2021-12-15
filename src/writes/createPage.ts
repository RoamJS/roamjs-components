import createBlock from "./createBlock";
import { DAILY_NOTE_PAGE_TITLE_REGEX } from "../date";
import type { InputTextNode } from "../types";
import toRoamDateUid from "../date/toRoamDateUid";
import parseRoamDate from "../date/parseRoamDate";

const createPage = ({
  title,
  tree = [],
  uid = DAILY_NOTE_PAGE_TITLE_REGEX.test(title)
    ? toRoamDateUid(parseRoamDate(title))
    : window.roamAlphaAPI.util.generateUID(),
}: {
  title: string;
  tree?: InputTextNode[];
  uid?: string;
}): string => {
  window.roamAlphaAPI.createPage({ page: { title, uid } });
  tree.forEach((node, order) => createBlock({ node, parentUid: uid, order }));
  return uid;
};

export default createPage;
