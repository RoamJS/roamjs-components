import submitActions from "./submitActions";

const deleteBlock = (uid: string): Promise<string> => {
  return submitActions([
    { params: { block: { uid } }, type: "deleteBlock" },
  ]).then(() => uid);
};

export default deleteBlock;
