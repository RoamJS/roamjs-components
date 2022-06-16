import { gatherActions } from "./createBlock";
import { DAILY_NOTE_PAGE_TITLE_REGEX } from "../date";
import type { InputTextNode } from "../types";
import submitActions from "./submitActions";

const createPage = ({
  title,
  tree = [],
  uid = DAILY_NOTE_PAGE_TITLE_REGEX.test(title)
    ? window.roamAlphaAPI.util.dateToPageUid(
        window.roamAlphaAPI.util.pageTitleToDate(title)
      )
    : window.roamAlphaAPI.util.generateUID(),
}: {
  title: string;
  tree?: InputTextNode[];
  uid?: string;
}): Promise<string> => {
  return submitActions([
    {
      type: "createPage",
      params: { page: { title, uid } },
    },
    ...tree
      .flatMap((node, order) => gatherActions({ node, parentUid: uid, order }))
      .map((params) => ({ type: "createBlock" as const, params })),
  ]).then(() => uid);
};

export default createPage;
