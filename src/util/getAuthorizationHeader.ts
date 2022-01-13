import getCurrentUserEmail from "../queries/getCurrentUserEmail";
import getToken from "./getToken";

const getAuthorizationHeader = (service?: string) => {
  const token = getToken();
  return token
    ? `Bearer ${window.btoa(`${getCurrentUserEmail()}:${getToken()}`)}`
    : getToken(service);
};

export default getAuthorizationHeader;
