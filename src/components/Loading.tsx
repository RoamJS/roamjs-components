import { Spinner, SpinnerSize } from "@blueprintjs/core";
import React from "react";
import ReactDOM from "react-dom";

const Loading = () => {
  return <Spinner size={SpinnerSize.SMALL} />;
};

export const renderLoading = (targetUid?: string) => {
  const reactParent = document.createElement("div");
  reactParent.style.position = "absolute";
  reactParent.style.bottom = "0";
  reactParent.style.right = "0";
  const parent = targetUid
    ? document.querySelector<HTMLDivElement>(
        `.rm-block__input[id$="${targetUid}"]`
      )?.parentElement || document.querySelector(".roam-article")
    : document.querySelector(".roam-article");
  if (parent) {
    parent.appendChild(reactParent);
    ReactDOM.render(<Loading />, reactParent);
    return () => {
      ReactDOM.unmountComponentAtNode(reactParent);
      reactParent.remove();
    };
  } else {
    return () => {
      // no parent found
    };
  }
};

export default Loading;
