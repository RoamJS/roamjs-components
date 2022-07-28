import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import { OnloadArgs, RoamBasicNode } from "../types/native";
import toConfigPageName from "./toConfigPageName";
import { render as renderSimpleAlert } from "../components/SimpleAlert";

const migrateLegacySettings = ({
  extensionId,
  extensionAPI,
  specialKeys = {},
}: Pick<OnloadArgs, "extensionAPI"> & {
  extensionId: string;
  specialKeys?: Record<
    string,
    (n: RoamBasicNode) => { value: unknown; key: string }[]
  >;
}) => {
  const page = toConfigPageName(extensionId);
  const uid = getPageUidByPageTitle(page);
  if (uid) {
    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: `Migrate Settings: ${extensionId}`,
      callback: () => {
        renderSimpleAlert({
          content: `We detected some settings in your ${page} page. Should we try to migrate these settings to the Roam Depot version of the ${extensionId} extension?`,
          onConfirm: () => {
            const tree = getBasicTreeByParentUid(uid);
            tree
              .flatMap((c) => {
                if (specialKeys[c.text]) {
                  return specialKeys[c.text](c).map(({ key, value }) => ({
                    key,
                    value,
                    attributeConfig: false,
                    uid: c.uid,
                  }));
                } else if (/^[\w\s]+::.+$/.test(c.text)) {
                  const [key, value] = c.text.split("::").map((k) => k.trim());
                  return [{ key, value, attributeConfig: true, uid: c.uid }];
                } else {
                  return [
                    {
                      key: c.text,
                      value: c.children[0]?.text || true,
                      attributeConfig: false,
                      uid: c.uid,
                    },
                  ];
                }
              })
              .filter(
                (c) =>
                  process.env.ROAM_MARKETPLACE === "true" ||
                  process.env.ROAM_DEPOT === "true" ||
                  c.attributeConfig
              )
              .forEach((c) =>
                extensionAPI.settings.set(
                  c.key.replace(/ /, "-").toLowerCase(),
                  c.value
                )
              );
            window.roamAlphaAPI.updatePage({
              page: { uid, title: `legacy/${page}` },
            });
          },
        });
      },
    });
  }
};

export default migrateLegacySettings;
