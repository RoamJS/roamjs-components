import type { UserSettings } from "../types";

const getSettingsByEmail = (email: string): UserSettings =>
  window.roamAlphaAPI.q<[UserSettings]>(
    `[:find ?settings :where[?e :user/settings ?settings] [?e :user/email "${email}"]]`
  )?.[0]?.[0] || {};

export default getSettingsByEmail;
