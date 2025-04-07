const getDisplayNameByEmail = async (email: string): Promise<string> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?name :where[?e :user/display-name ?name] [?e :user/email "${email}"]]`
  );
  return (result?.[0]?.[0] as string) || "";
};

export default getDisplayNameByEmail;
