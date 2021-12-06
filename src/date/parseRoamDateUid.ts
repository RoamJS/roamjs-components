import parse from "date-fns/parse";

const parseRoamDateUid = (s: string): Date =>
  parse(s, "MM-dd-yyyy", new Date());

export default parseRoamDateUid;
