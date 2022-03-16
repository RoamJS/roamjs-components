const addScriptAsDependency = ({
  id,
  src,
  dataAttributes,
}: {
  id: string;
  src: string;
  dataAttributes: Record<string, string>;
}): void => {
  const existing = document.getElementById(id);
  if (!existing) {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.type = "text/javascript";
    script.id = id;
    Object.entries(dataAttributes).forEach(([k, v]) =>
      script.setAttribute(`data-${k}`, v)
    );
    document.querySelector("head")?.appendChild(script);
  }
};

export default addScriptAsDependency;
