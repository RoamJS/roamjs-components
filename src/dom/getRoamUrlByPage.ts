import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getRoamUrl from "./getRoamUrl";

const getRoamUrlByPage = (page: string): string => {
  const uid = getPageUidByPageTitle(page);
  return uid && getRoamUrl(uid);
};

export default getRoamUrlByPage;
