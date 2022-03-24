import submitActions from "./submitActions";

const clearBlockByUid = (uid: string): Promise<void> =>
  submitActions([
    {
      type: "updateBlock",
      params: {
        block: {
          uid,
          string: "",
        },
      },
    },
  ]);

export default clearBlockByUid;
