import { Label } from "@blueprintjs/core";
import React, { useState, useEffect } from "react";
import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getBasicTreeByParentUid from "../queries/getBasicTreeByParentUid";
import toFlexRegex from "../util/toFlexRegex";
import MenuItemSelect from "./MenuItemSelect";

export const useOauthAccounts = (
  id: string
): {
  accountDropdown: React.ReactElement;
  accountLabel: string;
} => {
  const [accountLabels, setAccountLabels] = useState<string[]>([]);
  const [accountLabel, setAccountLabel] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      const pageUid = await getPageUidByPageTitle(`roam/js/${id}`);
      const tree = await getBasicTreeByParentUid(pageUid);
      const oauthNode = tree.find((t) => toFlexRegex("oauth").test(t.text));
      const labels = (oauthNode?.children || [])
        .map((t) => t.text)
        .filter((t) => !t.startsWith("{") && !t.endsWith("}"));
      setAccountLabels(labels);
      setAccountLabel(labels[0] || "");
    };
    loadAccounts();
  }, [id]);

  const accountDropdown = (
    <>
      {accountLabels.length > 1 && (
        <Label>
          Account:
          <MenuItemSelect
            activeItem={accountLabel}
            onItemSelect={(i) => setAccountLabel(i)}
            items={accountLabels}
          />
        </Label>
      )}
    </>
  );
  return {
    accountDropdown,
    accountLabel,
  };
};
