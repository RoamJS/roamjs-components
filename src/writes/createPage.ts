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
}): Promise<string> => {
  return window.roamAlphaAPI
    .createPage({ page: { title, uid } })
    .then(() =>
      tree
        .map(
          (node, order) => () => createBlock({ node, parentUid: uid, order })
        )
        .reduce((prev, cur) => prev.then(() => cur()), Promise.resolve(""))
    )
    .then(() => uid);
};

export default createPage;
