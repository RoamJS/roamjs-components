import type { UserSettings } from "../types";

const getSettingsByEmail = async (email: string): Promise<UserSettings> => {
  const result = await window.roamAlphaAPI.data.backend.q(
    `[:find ?settings :where[?e :user/settings ?settings] [?e :user/email "${email}"]]`
  );
  return (result?.[0]?.[0] as UserSettings) || {};
};

export default getSettingsByEmail;
