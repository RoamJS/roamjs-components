

const getDomRefs = (blockUid: string) => {
  const currentlyEditingBlock = document.querySelector(
    "textarea.rm-block-input"
  ) as HTMLTextAreaElement;
  if (getUids(currentlyEditingBlock).blockUid === blockUid) {
    return (
      currentlyEditingBlock.value.match(/\(\(([\w\d-]{9})\)\)/g) || []
    ).map((s) => s.slice(2, -2));
  }
  return [];
}

export default getDomRefs;
