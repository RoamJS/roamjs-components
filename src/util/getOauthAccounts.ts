import getShallowTreeByParentUid from "../queries/getShallowTreeByParentUid";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import localStorageGet from "./localStorageGet";
import toConfigPageName from "./toConfigPageName";
import toFlexRegex from "./toFlexRegex";

const getOauthAccounts = async (service: string): Promise<string[]> => {
  const fromStorage = localStorageGet(`oauth-${service}`);
  if (fromStorage) {
    const accounts = JSON.parse(fromStorage) as {
      text: string;
      data: string;
    }[];
    return accounts.map((a) => a.text);
  }
  const pageUid = await getPageUidByPageTitle(toConfigPageName(service));
  const tree = await getShallowTreeByParentUid(pageUid);
  const node = tree.find((s) => toFlexRegex("oauth").test(s.text.trim()));
  if (!node) {
    return [];
  }
  const nodeChildren = await getShallowTreeByParentUid(node.uid);
  return nodeChildren.map((t) => t.text);
};

export default getOauthAccounts;
