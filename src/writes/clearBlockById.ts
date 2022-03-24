import getUidsFromId from "../dom/getUidsFromId";
import submitActions from "./submitActions";

const clearBlockById = (id: string): Promise<void> =>
  submitActions([
    {
      type: "updateBlock",
      params: {
        block: {
          uid: getUidsFromId(id).blockUid,
          string: "",
        },
      },
    },
  ]);

export default clearBlockById;
