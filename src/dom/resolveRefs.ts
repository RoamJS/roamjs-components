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

const resolveRefs = async (text: string): Promise<string> => {
  let result = text;

  const aliasTagMatches = [...text.matchAll(aliasTagRegex)];
  for (const match of aliasTagMatches) {
    const [alias, del, pageName] = match;
    const blockUid = await getPageUidByPageTitle(pageName);
    const url = getRoamUrl(blockUid);
    const newAlias = alias.replace(del, url);
    result = result.replace(alias, newAlias);
  }

  const aliasRefMatches = [...text.matchAll(aliasRefRegex)];
  for (const match of aliasRefMatches) {
    const [alias, del, blockUid] = match;
    const url = getRoamUrl(blockUid);
    const newAlias = alias.replace(del, url);
    result = result.replace(alias, newAlias);
  }

  const blockRefMatches = [...text.matchAll(new RegExp(BLOCK_REF_REGEX, "g"))];
  for (const match of blockRefMatches) {
    const [_, blockUid] = match;
    const reference = await getTextByBlockUid(blockUid);
    result = result.replace(_, reference || blockUid);
  }

  return result;
};

export default resolveRefs;
