import getCurrentUser from "./getCurrentUser";

const getCurrentUserUid = (): string => {
  const userArray = getCurrentUser();
  const uidIndex = userArray.findIndex((s) => s === "~:uid");
  if (uidIndex > 0) {
    return userArray[uidIndex + 1];
  }
  return "";
};

export default getCurrentUserUid;
