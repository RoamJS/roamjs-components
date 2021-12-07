const getShallowTreeByParentUid = (
  parentUid: string
): { uid: string; text: string }[] =>
  window.roamAlphaAPI
    .q(
      `[:find (pull ?c [:block/uid :block/string :block/order]) :where [?b :block/uid "${parentUid}"] [?b :block/children ?c]]`
    )
    .sort((a, b) => a[0].order - b[0].order)
    .map(([a]: { uid: string; string: string }[]) => ({
      uid: a.uid,
      text: a.string,
    }));

export default getShallowTreeByParentUid;
