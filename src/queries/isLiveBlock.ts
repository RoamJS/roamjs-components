const isLiveBlock = (uid: string) =>
  !!window.roamAlphaAPI.pull("[:db/id]", [":block/uid", uid]);

export default isLiveBlock;
