const getDisplayNameByEmail = (email: string): string =>
  window.roamAlphaAPI.q<[string]>(
    `[:find ?name :where[?e :user/display-name ?name] [?e :user/email "${email}"]]`
  )?.[0]?.[0] || "";

export default getDisplayNameByEmail;
