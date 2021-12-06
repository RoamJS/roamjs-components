import format from "date-fns/format";

const toRoamDate = (d = new Date()): string =>
  isNaN(d.valueOf()) ? "" : format(d, "MMMM do, yyyy");

export default toRoamDate;
