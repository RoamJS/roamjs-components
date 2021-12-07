const addStyle = (content: string, id?: string): HTMLStyleElement => {
  const existing = document.getElementById(id || "") as HTMLStyleElement;
  if (existing) return existing;
  const css = document.createElement("style");
  css.textContent = content;
  if (id) css.id = id;
  document.getElementsByTagName("head")[0].appendChild(css);
  return css;
};

export default addStyle;
