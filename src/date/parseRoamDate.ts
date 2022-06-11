import { MONTHS } from "./constants";

const parseRoamDate = (s: string): Date => {
  const [month, date, year] = s.split(/(?:(?:st|nd|rd|th),)?\s/)
  return new Date(Number(year), MONTHS.indexOf(month), Number(date));
};

export default parseRoamDate;
