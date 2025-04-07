import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getTokenFromTree from "./getTokenFromTree";
import localStorageGet from "./localStorageGet";

const getToken = async (service = "roamjs"): Promise<string> => {
  const fromStorage = localStorageGet(
    `token${service === "roamjs" ? "" : `-${service}`}`
  );
  if (fromStorage) return fromStorage;

  const pageUid = await getPageUidByPageTitle(`roam/js/${service}`);
  const tree = await getBasicTreeByParentUid(pageUid);
  return getTokenFromTree(tree);
};

export default getToken;
