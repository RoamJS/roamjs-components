import getEditTimeByBlockUid from "../queries/getEditTimeByBlockUid";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getShallowTreeByParentUid from "../queries/getShallowTreeByParentUid";
import localStorageGet from "./localStorageGet";
import toConfigPageName from "./toConfigPageName";
import toFlexRegex from "./toFlexRegex";

const getOauth = async (service: string, label?: string): Promise<string> => {
  const fromStorage = localStorageGet(`oauth-${service}`);
  if (fromStorage) {
    const accounts = JSON.parse(fromStorage) as {
      text: string;
      data: string;
    }[];
    const accountNode =
      (label ? accounts.find(({ text }) => text === label) : accounts[0]) ||
      ({} as { data?: string });
    const { data, ...node } = accountNode;
    return data ? JSON.stringify({ ...JSON.parse(data), node }) : "{}";
  }
  const pageUid = await getPageUidByPageTitle(toConfigPageName(service));
  const tree = await getShallowTreeByParentUid(pageUid);
  const node = tree.find((s) => toFlexRegex("oauth").test(s.text.trim()));
  if (!node) {
    return "{}";
  }
  const nodeChildren = await getShallowTreeByParentUid(node.uid);
  const index = label
    ? nodeChildren.findIndex((t) => toFlexRegex(label).test(t.text))
    : 0;
  const labelNode = nodeChildren[index];
  if (!labelNode) {
    return "{}";
  }
  if (labelNode.text.startsWith("{") && labelNode.text.endsWith("}")) {
    const obj = JSON.parse(labelNode.text);
    obj.node = {
      uid: labelNode.uid,
      time: await getEditTimeByBlockUid(labelNode.uid),
    };
    return JSON.stringify(obj);
  }
  const dataNode = (await getShallowTreeByParentUid(labelNode.uid))[0];
  const uid = dataNode?.uid || "";
  if (!dataNode?.text) {
    return "{}";
  }
  const obj = JSON.parse(dataNode.text);
  obj.node = {
    uid,
    time: uid ? await getEditTimeByBlockUid(uid) : 0,
  };
  return JSON.stringify(obj);
};

export default getOauth;
