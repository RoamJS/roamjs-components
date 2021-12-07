import toRoamDateUid from "../date/toRoamDateUid";

const getCurrentPageUid = (): string =>
  window.location.hash.match(/\/page\/(.*)$/)?.[1] || toRoamDateUid(new Date());

export default getCurrentPageUid;
