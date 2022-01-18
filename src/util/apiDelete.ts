import axios from "axios";
import getAuthorizationHeader from "../util/getAuthorizationHeader";

const apiDelete = (path: string) =>
  axios.delete(`${process.env.API_URL}/${path}`, {
    headers: { Authorization: getAuthorizationHeader() },
  });

export default apiDelete;
