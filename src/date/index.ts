export { default as parseRoamDate } from "./parseRoamDate";
export { default as parseRoamDateUid } from "./parseRoamDateUid";
export { default as toRoamDate } from "./toRoamDate";
export { default as toRoamDateUid } from "./toRoamDateUid";
export const DAILY_NOTE_PAGE_REGEX =
  /(January|February|March|April|May|June|July|August|September|October|November|December) [0-3]?[0-9](st|nd|rd|th), [0-9][0-9][0-9][0-9]/;
export const DAILY_NOTE_PAGE_TITLE_REGEX = new RegExp(
  `^${DAILY_NOTE_PAGE_REGEX.source}$`
);
