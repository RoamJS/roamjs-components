import addWeeks from "date-fns/addWeeks";
import addDays from "date-fns/addDays";
import dateFnsStartOfWeek from "date-fns/startOfWeek";
import startOfMonth from "date-fns/startOfMonth";
import startOfYear from "date-fns/startOfYear";
import dateFnsEndOfWeek from "date-fns/endOfWeek";
import endOfMonth from "date-fns/endOfMonth";
import endOfYear from "date-fns/endOfYear";
import { Chrono, Parser } from "chrono-node";
import { ParsingComponents } from "chrono-node/dist/results";
import getCurrentUserUid from "../queries/getCurrentUserUid";

type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

let cachedWeekStartsOn: WeekDay | null = null;

const getWeekStartsOn = async (): Promise<WeekDay> => {
  const weekStartsOn = (
    await window.roamAlphaAPI.pull("[:user/settings]", [
      ":user/uid",
      getCurrentUserUid(),
    ])
  )?.[":user/settings"]?.[":first-day-of-week"] as WeekDay;
  cachedWeekStartsOn = weekStartsOn || 0;
  return cachedWeekStartsOn;
};

const startOfWeek = (date: Date) => {
  if (cachedWeekStartsOn === null) {
    getWeekStartsOn().catch(console.error);
    return dateFnsStartOfWeek(date);
  }
  return dateFnsStartOfWeek(date, { weekStartsOn: cachedWeekStartsOn });
};

const endOfWeek = (date: Date) => {
  if (cachedWeekStartsOn === null) {
    getWeekStartsOn().catch(console.error);
    return dateFnsEndOfWeek(date);
  }
  return dateFnsEndOfWeek(date, { weekStartsOn: cachedWeekStartsOn });
};

const ORDINAL_WORD_DICTIONARY: { [word: string]: number } = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19,
  twentieth: 20,
  "twenty first": 21,
  "twenty-first": 21,
  "twenty second": 22,
  "twenty-second": 22,
  "twenty third": 23,
  "twenty-third": 23,
  "twenty fourth": 24,
  "twenty-fourth": 24,
  "twenty fifth": 25,
  "twenty-fifth": 25,
  "twenty sixth": 26,
  "twenty-sixth": 26,
  "twenty seventh": 27,
  "twenty-seventh": 27,
  "twenty eighth": 28,
  "twenty-eighth": 28,
  "twenty ninth": 29,
  "twenty-ninth": 29,
  thirtieth: 30,
  "thirty first": 31,
  "thirty-first": 31,
};

const ORDINAL_REGEX = new RegExp(
  `\\b(?:${Object.keys(ORDINAL_WORD_DICTIONARY)
    .sort((a, b) => b.length - a.length)
    .join("|")}|(?:[1-9])?[0-9](?:st|nd|rd|th)?)\\b`,
  "i"
);

const customDateNlp = new Chrono();
const DAYS_OFFSET = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tues: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thurs: 4,
  thur: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};
const UPCOMING_PATTERN = new RegExp(
  "(\\W|^)" +
    "(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:on\\s*?)?" +
    "upcoming\\s*" +
    "(" +
    Object.keys(DAYS_OFFSET).join("|") +
    ")" +
    "(?=\\W|$)",
  "i"
);
// https://github.com/wanasit/chrono/blob/d8da3c840c50c959a62a0840c9a627f39bc765df/src/parsers/en/ENWeekdayParser.js
customDateNlp.parsers.unshift({
  pattern: () => UPCOMING_PATTERN,
  extract: (context, match) => {
    const index = (match.index || 0) + match[1].length;
    const text = match[0].substr(
      match[1].length,
      match[0].length - match[1].length
    );
    const result = context.createParsingResult(index, text);

    const dayOfWeek = match[2].toLowerCase();
    const offset = DAYS_OFFSET[dayOfWeek as keyof typeof DAYS_OFFSET];
    if (offset === undefined) {
      return null;
    }

    const startMoment = context.refDate;
    const refOffset = startMoment.getDay();
    result.start.assign("weekday", offset);
    if (offset <= refOffset) {
      startMoment.setDate(offset + 7 + startMoment.getDate() - refOffset);
      result.start.assign("day", startMoment.getDate());
      result.start.assign("month", startMoment.getMonth() + 1);
      result.start.assign("year", startMoment.getFullYear());
    } else {
      startMoment.setDate(offset + startMoment.getDate() - refOffset);
      result.start.imply("day", startMoment.getDate());
      result.start.imply("month", startMoment.getMonth() + 1);
      result.start.imply("year", startMoment.getFullYear());
    }

    return result;
  },
});
customDateNlp.parsers.push(
  {
    pattern: () => /\b((start|end) )?of\b/i,
    extract: () => ({}),
  },
  {
    pattern: () => ORDINAL_REGEX,
    extract: () => ({}),
  }
);

export const addNlpDateParser = (p: Parser) => customDateNlp.parsers.push(p);

const assignDay = (p: ParsingComponents, d: Date) => {
  p.assign("year", d.getFullYear());
  p.assign("month", d.getMonth() + 1);
  p.assign("day", d.getDate());
};
customDateNlp.refiners.unshift({
  refine: (_, results) => {
    if (results.length >= 2) {
      const [modifier, date, ...rest] = results;
      if (/start of/i.test(modifier.text)) {
        const dateObj = date.date();
        if (/week/i.test(date.text)) {
          const newDateObj = startOfWeek(dateObj);
          assignDay(date.start, newDateObj);
        }
        if (/month/i.test(date.text)) {
          const newDateObj = startOfMonth(dateObj);
          assignDay(date.start, newDateObj);
        }
        if (/year/i.test(date.text)) {
          const newDateObj = startOfYear(dateObj);
          assignDay(date.start, newDateObj);
        }
      } else if (/end of/i.test(modifier.text)) {
        const dateObj = date.date();
        if (/week/i.test(date.text)) {
          const newDateObj = endOfWeek(dateObj);
          assignDay(date.start, newDateObj);
        }
        if (/month/i.test(date.text)) {
          const newDateObj = endOfMonth(dateObj);
          assignDay(date.start, newDateObj);
        }
        if (/year/i.test(date.text)) {
          const newDateObj = endOfYear(dateObj);
          assignDay(date.start, newDateObj);
        }
      } else if (rest.length >= 2) {
        const [of, d, ...moreRest] = rest;
        if (
          ORDINAL_REGEX.test(modifier.text) &&
          date.start.isOnlyWeekdayComponent() &&
          /of/i.test(of.text)
        ) {
          const match = (
            ORDINAL_REGEX.exec(modifier.text)?.[0] || ""
          ).toLowerCase();
          const num =
            ORDINAL_WORD_DICTIONARY[match] ||
            Number(match.replace(/(?:st|nd|rd|th)$/i, ""));
          const dateObj = d.date();
          if (/month/i.test(d.text)) {
            const startOfMonthDate = startOfMonth(dateObj);
            const originalMonth = startOfMonthDate.getMonth();
            const startOfWeekDate = startOfWeek(startOfMonthDate);
            const dayOfWeekDate = addDays(
              startOfWeekDate,
              date.start.get("weekday") || 0
            );
            const newDateObj = addWeeks(
              dayOfWeekDate,
              num - (originalMonth === dayOfWeekDate.getMonth() ? 1 : 0)
            );
            assignDay(d.start, newDateObj);
          } else if (/year/i.test(d.text)) {
            const startOfYearDate = startOfYear(dateObj);
            const originalYear = startOfYearDate.getFullYear();
            const startOfWeekDate = startOfWeek(startOfYearDate);
            const dayOfWeekDate = addDays(
              startOfWeekDate,
              date.start.get("weekday") || 0
            );
            const newDateObj = addWeeks(
              dayOfWeekDate,
              num - (originalYear === dayOfWeekDate.getFullYear() ? 1 : 0)
            );
            assignDay(d.start, newDateObj);
          } else {
            return results;
          }
          return [d, ...moreRest];
        }
      } else {
        return results;
      }
      return [date, ...rest];
    }
    return results;
  },
});

const parseNlpDate = (s: string, ref?: Date): Date =>
  customDateNlp.parseDate(s, ref) || new Date();

export const parse = (t: string, ref?: Date) => customDateNlp.parse(t, ref);

export default parseNlpDate;
