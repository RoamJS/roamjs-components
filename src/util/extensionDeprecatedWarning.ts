import idToTitle from "./idToTitle";
import { render as renderSimpleAlert } from "../components/SimpleAlert";
import getRoamUrl from "../dom/getRoamUrl";
import deleteBlock from "../writes/deleteBlock";
import { render as renderToast } from "../components/Toast";
import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getSubTree from "./getSubTree";
import { PullBlock } from "../types";

const extensionDeprecatedWarning = async ({
  extensionId,
  reason,
}: {
  extensionId: string;
  reason: string;
}): Promise<void> => {
  const configUid = await getPageUidByPageTitle(extensionId);
  const config = await getBasicTreeByParentUid(configUid);
  const donotShowAgainUid = getSubTree({
    tree: config,
    key: "Do not show again",
  }).uid;
  if (!donotShowAgainUid) {
    const blocks = (
      (await window.roamAlphaAPI.data.backend.q(
        `[:find (pull ?roamjs [:block/uid]) :where [?block :block/string ?contents] [(clojure.string/includes? ?contents  "https://roamjs.com/${extensionId}")] [?roamjs :block/children ?block]]`
      )) as [PullBlock][]
    ).map(([block]) => block[":block/uid"] || "");
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
      onConfirm: () => blocks.map((b) => deleteBlock(b)),
      onCancel: () =>
        renderToast({
          content:
            "Reach out to supprt@roamjs.com if you would like to keep the extension.",
          id: `deprecated-${extensionId}`,
        }),
      confirmText: "Confirm",
      dontShowAgain: configUid,
    });
  }
};

export default extensionDeprecatedWarning;
