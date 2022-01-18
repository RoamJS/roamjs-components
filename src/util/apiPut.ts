import axios from "axios";
import getAuthorizationHeader from "../util/getAuthorizationHeader";

const apiPut = (path: string, data?: Record<string, unknown>) =>
  axios.put(`${process.env.API_URL}/${path}`, data || {}, {
    headers: { Authorization: getAuthorizationHeader() },
  });

export default apiPut;
