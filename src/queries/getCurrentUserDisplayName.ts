import getCurrentUser from "./getCurrentUser";

const getCurrentUserDisplayName = (): string => {
  const userArray = getCurrentUser();
  const uidIndex = userArray.findIndex((s) => s === "~:display-name");
  if (uidIndex > 0) {
    return userArray[uidIndex + 1] || "";
  }
  return "";
};

export default getCurrentUserDisplayName;
