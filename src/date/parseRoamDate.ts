import parse from "date-fns/parse";

const parseRoamDate = (s: string): Date =>
  parse(s, "MMMM do, yyyy", new Date());

export default parseRoamDate;
