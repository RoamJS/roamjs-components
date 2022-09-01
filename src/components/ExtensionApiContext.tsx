import React, { useContext } from "react";
import { OnloadArgs } from "../types";

const ExtensionApiContext = React.createContext<OnloadArgs | undefined>(
  undefined
);

export const useExtensionAPI = () =>
  useContext(ExtensionApiContext)?.extensionAPI;
export const useVersion = () =>
  useContext(ExtensionApiContext)?.extension.version;

const ExtensionApiContextProvider: React.FC<
  React.PropsWithChildren<OnloadArgs>
> = ({ children, ...props }) => {
  return (
    <ExtensionApiContext.Provider value={props}>
      {children}
    </ExtensionApiContext.Provider>
  );
};

export default ExtensionApiContextProvider;
