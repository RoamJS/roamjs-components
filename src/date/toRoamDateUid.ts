const toRoamDateUid = (d = new Date()): string =>
  isNaN(d.valueOf())
    ? ""
    : `${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
        .getDate()
        .toString()
        .padStart(2, "0")}-${d.getFullYear()}`;

export default toRoamDateUid;
