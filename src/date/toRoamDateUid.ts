import format from "date-fns/format";

const toRoamDateUid = (d = new Date()): string =>
  isNaN(d.valueOf()) ? "" : format(d, "MM-dd-yyyy");

export default toRoamDateUid;
