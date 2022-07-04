import React, { useMemo } from "react";
import getAllPageNames from "../queries/getAllPageNames";
import AutocompleteInput, { AutocompleteInputProps } from "./AutocompleteInput";

const DEFAULT_EXTRA: string[] = [];

const PageInput = ({
  extra = DEFAULT_EXTRA,
  ...rest
}: {
  extra?: string[];
} & Omit<AutocompleteInputProps, "options">): React.ReactElement => {
  const options = useMemo(() => [...getAllPageNames(), ...extra], [extra]);
  return <AutocompleteInput {...rest} options={options} />;
};

export default PageInput;
