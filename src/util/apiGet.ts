import axios from "axios";
import getAuthorizationHeader from "../util/getAuthorizationHeader";

const apiGet = (path: string) =>
  axios.get(`${process.env.API_URL}/${path}`, {
    headers: { Authorization: getAuthorizationHeader() },
  });

export default apiGet;
