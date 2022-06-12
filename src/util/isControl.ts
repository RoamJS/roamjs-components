const isControl = (e: KeyboardEvent | MouseEvent): boolean =>
  (e.ctrlKey && !window.roamAlphaAPI.platform.isIOS) || (e.metaKey && window.roamAlphaAPI.platform.isIOS);

export default isControl;
