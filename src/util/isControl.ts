const isControl = (e: KeyboardEvent | MouseEvent): boolean =>
  (e.ctrlKey && window.roamAlphaAPI.platform.isPC) || (e.metaKey && !window.roamAlphaAPI.platform.isPC);

export default isControl;
