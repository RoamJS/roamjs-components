const parseRoamDateUid = (s: string): Date => {
  const [month, date, year] = s.split("-").map((s) => Number(s));
  return new Date(year, month - 1, date);
};

export default parseRoamDateUid;
