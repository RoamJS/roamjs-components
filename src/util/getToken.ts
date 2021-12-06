import {
  getBasicTreeByParentUid,
  getPageUidByPageTitle,
  localStorageGet,
} from "roam-client";
import { getTokenFromTree } from "./getTokenFromTree";

export const getToken = (service = "roamjs"): string =>
  localStorageGet(`token${service === "roamjs" ? "" : `-${service}`}`) ||
  getTokenFromTree(
    getBasicTreeByParentUid(getPageUidByPageTitle(`roam/js/${service}`))
  );
