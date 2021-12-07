import getCurrentUser from "./getCurrentUser";

const getCurrentUserEmail = (): string => {
  const userArray = getCurrentUser();
  const emailIndex = userArray.findIndex((s) => s === "~:email");
  if (emailIndex > 0) {
    return userArray[emailIndex + 1];
  }
  return "";
};

export default getCurrentUserEmail;
