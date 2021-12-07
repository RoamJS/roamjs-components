const getUidsFromId = (id: string): { blockUid: string; parentUid: string } => {
  const blockUid = id.substring(id.length - 9, id.length);
  const restOfHTMLId = id.substring(0, id.length - 9);
  const potentialDateUid = restOfHTMLId.substring(
    restOfHTMLId.length - 11,
    restOfHTMLId.length - 1
  );
  const parentUid = isNaN(new Date(potentialDateUid).valueOf())
    ? potentialDateUid.substring(1)
    : potentialDateUid;
  return {
    blockUid,
    parentUid,
  };
};

export default getUidsFromId;
