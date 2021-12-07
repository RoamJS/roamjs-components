import type { UserSettings } from "../types";

const getSettingsByEmail = (email: string): UserSettings =>
  (window.roamAlphaAPI.q(
    `[:find ?settings :where[?e :user/settings ?settings] [?e :user/email "${email}"]]`
  )?.[0]?.[0] as UserSettings) || {};

export default getSettingsByEmail;
