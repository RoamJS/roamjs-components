import getCurrentUserEmail from "../queries/getCurrentUserEmail";
import getToken from "./getToken";

const getAuthorizationHeader = async (service?: string): Promise<string> => {
  const token = await getToken();
  return token
    ? `Bearer ${window.btoa(`${getCurrentUserEmail()}:${token}`)}`
    : await getToken(service);
};

export default getAuthorizationHeader;
