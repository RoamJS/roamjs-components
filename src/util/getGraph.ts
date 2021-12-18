const getGraph = (): string =>
  /^#\/(?:app|offline)\/([^/]*?)(?:\/page\/.{9,10})?$/.exec(window.location.hash)?.[1] ||
  "";

export default getGraph;
