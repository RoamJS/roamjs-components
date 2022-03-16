let nextPort = 3000;

const addOldRoamJSDependency = (extension: string, source?: string): void => {
  const id = `roamjs-${extension.replace(/\/main$/, "")}`;
  const existing = document.getElementById(id);
  if (!existing) {
    const script = document.createElement("script");
    script.src = `${
      process.env.NODE_ENV === "development"
        ? `http://localhost:${nextPort+=100}`
        : "https://roamjs.com"
    }/${extension}.js`;
    script.async = true;
    script.type = "text/javascript";
    script.id = id;
    if (source) {
      script.setAttribute("data-source", source);
    }
    document.querySelector("head")?.appendChild(script);
  }
};

export default addOldRoamJSDependency;
