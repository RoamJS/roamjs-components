import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getRoamUrl from "./getRoamUrl";

const getRoamUrlByPage = async (page: string): Promise<string> => {
  const uid = await getPageUidByPageTitle(page);
  return uid && getRoamUrl(uid);
};

export default getRoamUrlByPage;
