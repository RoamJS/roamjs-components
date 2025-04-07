import React, { useMemo, useState, useEffect } from "react";
import getAllPageNames from "../queries/getAllPageNames";
import AutocompleteInput, { AutocompleteInputProps } from "./AutocompleteInput";

const DEFAULT_EXTRA: string[] = [];

const PageInput = ({
  extra = DEFAULT_EXTRA,
  ...rest
}: {
  extra?: string[];
} & Omit<AutocompleteInputProps, "options">): React.ReactElement => {
  const [pageNames, setPageNames] = useState<string[]>([]);

  useEffect(() => {
    const loadPageNames = async () => {
      try {
        const names = await getAllPageNames();
        setPageNames(names);
      } catch (error) {
        console.error("Failed to load page names:", error);
      }
    };
    loadPageNames();
  }, []);

  const options = useMemo(() => [...pageNames, ...extra], [pageNames, extra]);
  return <AutocompleteInput {...rest} options={options} />;
};

export default PageInput;
