import { MONTHS } from "./constants";

const toRoamDate = (d = new Date()): string =>
  isNaN(d.valueOf())
    ? ""
    : `${MONTHS[d.getMonth()]} ${d.getDate()}${
        d.getDate() % 10 === 1 && d.getDate() !== 11
          ? "st"
          : d.getDate() % 10 === 2
          ? "nd"
          : d.getDate() % 10 === 3
          ? "rd"
          : "th"
      }, ${d.getFullYear()}`;

export default toRoamDate;
