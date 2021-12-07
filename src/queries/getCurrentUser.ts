const getCurrentUser = (): string[] => {
  const globalAppState = JSON.parse(
    localStorage.getItem("globalAppState") || '["","",[]]'
  ) as (string | string[])[];
  const userIndex = globalAppState.findIndex((s) => s === "~:user");
  if (userIndex > 0) {
    return globalAppState[userIndex + 1] as string[];
  }
  return [];
};

export default getCurrentUser;
