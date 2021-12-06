const getGraph = (): string =>
  /^#\/app\/([^/]*?)(?:\/page\/.{9,10})?$/.exec(window.location.hash)?.[1] ||
  "";

export default getGraph;
