const addOldRoamJSDependency = (extension: string): void => {
  const id = `roamjs-${extension.replace(/\/main$/, "")}`;
  const existing = document.getElementById(id);
  if (!existing) {
    const script = document.createElement("script");
    script.src = `https://roamjs.com/${extension}.js`;
    script.async = true;
    script.type = "text/javascript";
    script.id = id;
    document.querySelector("head")?.appendChild(script);
  }
};

export default addOldRoamJSDependency;
