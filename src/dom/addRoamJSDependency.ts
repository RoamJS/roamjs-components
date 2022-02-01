import addOldRoamJSDependency from "./addOldRoamJSDependency";

const addRoamJSDependency = (extension: string, source?: string): void => {
  addOldRoamJSDependency(`${extension}/main`, source);
};

export default addRoamJSDependency;
