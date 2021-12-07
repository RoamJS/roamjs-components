import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getTextByBlockUid from "../queries/getTextByBlockUid";
import { BLOCK_REF_REGEX } from "./constants";
import getRoamUrl from "./getRoamUrl";

const aliasTagRegex = new RegExp(
  `\\[[^\\]]*\\]\\((\\[\\[([^\\]]*)\\]\\])\\)`,
  "g"
);

const aliasRefRegex = new RegExp(
  `\\[[^\\]]*\\]\\((${BLOCK_REF_REGEX.source})\\)`,
  "g"
);

const resolveRefs = (text: string): string => {
  return text
    .replace(aliasTagRegex, (alias, del, pageName) => {
      const blockUid = getPageUidByPageTitle(pageName);
      return alias.replace(del, `${getRoamUrl(blockUid)}`);
    })
    .replace(aliasRefRegex, (alias, del, blockUid) => {
      return alias.replace(del, `${getRoamUrl(blockUid)}`);
    })
    .replace(new RegExp(BLOCK_REF_REGEX, "g"), (_, blockUid) => {
      const reference = getTextByBlockUid(blockUid);
      return reference || blockUid;
    });
};

export default resolveRefs;
