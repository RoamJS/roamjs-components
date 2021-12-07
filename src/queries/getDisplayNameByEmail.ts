const getDisplayNameByEmail = (email: string): string =>
  (window.roamAlphaAPI.q(
    `[:find ?name :where[?e :user/display-name ?name] [?e :user/email "${email}"]]`
  )?.[0]?.[0] as string) || "";

export default getDisplayNameByEmail;
