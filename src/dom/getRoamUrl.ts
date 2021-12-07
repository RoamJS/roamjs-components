const getRoamUrl = (blockUid?: string): string =>
  `${window.location.href.replace(/\/page\/.*$/, "")}${
    blockUid ? `/page/${blockUid}` : ""
  }`;

export default getRoamUrl;
