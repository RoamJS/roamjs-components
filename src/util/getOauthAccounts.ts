import getShallowTreeByParentUid from "../queries/getShallowTreeByParentUid";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import localStorageGet from "./localStorageGet";
import toConfigPageName from "./toConfigPageName";
import toFlexRegex from "./toFlexRegex";

const getOauthAccounts = (service: string): string[] => {
  const fromStorage = localStorageGet(`oauth-${service}`);
  if (fromStorage) {
    const accounts = JSON.parse(fromStorage) as {
      text: string;
      data: string;
    }[];
    return accounts.map((a) => a.text);
  }
  const tree = getShallowTreeByParentUid(
    getPageUidByPageTitle(toConfigPageName(service))
  );
  const node = tree.find((s) => toFlexRegex("oauth").test(s.text.trim()));
  if (!node) {
    return [];
  }
  return getShallowTreeByParentUid(node.uid).map((t) => t.text);
};

export default getOauthAccounts;
