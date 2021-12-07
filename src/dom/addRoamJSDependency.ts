import addOldRoamJSDependency from "./addOldRoamJSDependency";

const addRoamJSDependency = (extension: string): void => {
  addOldRoamJSDependency(`${extension}/main`);
};

export default addRoamJSDependency;
