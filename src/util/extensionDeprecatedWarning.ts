import idToTitle from "./idToTitle";
import { render as renderSimpleAlert } from "../components/SimpleAlert";
import getRoamUrl from "../dom/getRoamUrl";
import deleteBlock from "../writes/deleteBlock";

const extensionDeprecatedWarning = async ({
  extensionId,
  reason,
}: {
  extensionId: string;
  reason: string;
}): Promise<void> => {
  const blocks = window.roamAlphaAPI
    .q(
      `[:find (pull ?roamjs [:block/uid]) :where [?block :block/string ?contents] [(clojure.string/includes? ?contents  "https://roamjs.com/${extensionId}")] [?roamjs :block/children ?block]]`
    )
    .map(([{ uid }]) => uid as string);
  renderSimpleAlert({
    content: `RoamJS will soon be deprecating and then removing the ${idToTitle(
      extensionId
    )} extension.

${reason}

If you no longer use this extension, feel free to uninstall it${
      blocks.length
        ? ` by removing the block from [here](${getRoamUrl(
            blocks[0]
          )}) or by clicking confirm`
        : ""
    }. If this will be an issue for any reason, please reach out to support@roamjs.com.`,
    onConfirm: () => blocks.map(b => deleteBlock(b)),
  });
};

export default extensionDeprecatedWarning;
