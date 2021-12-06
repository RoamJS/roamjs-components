import {
  getBasicTreeByParentUid,
  getPageUidByPageTitle,
  localStorageGet,
} from "roam-client";
import { getTokenFromTree } from "./getTokenFromTree";

const getToken = (service = "roamjs"): string =>
  localStorageGet(`token${service === "roamjs" ? "" : `-${service}`}`) ||
  getTokenFromTree(
    getBasicTreeByParentUid(getPageUidByPageTitle(`roam/js/${service}`))
  );

export default getToken;
