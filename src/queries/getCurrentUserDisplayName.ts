import getCurrentUserUid from "./getCurrentUserUid";
import getDisplayNameByUid from "./getDisplayNameByUid";

const getCurrentUserDisplayName = (): string => {
  const uid = getCurrentUserUid();
  return getDisplayNameByUid(uid);
};

export default getCurrentUserDisplayName;
