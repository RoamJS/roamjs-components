import getCurrentUserUid from "./getCurrentUserUid";
import getDisplayNameByUid from "./getDisplayNameByUid";

const getCurrentUserDisplayName = async (): Promise<string> => {
  const uid = getCurrentUserUid();
  return await getDisplayNameByUid(uid);
};

export default getCurrentUserDisplayName;
