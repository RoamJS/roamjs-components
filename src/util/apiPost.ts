import axios from "axios";
import getAuthorizationHeader from "../util/getAuthorizationHeader";

const apiPost = (path: string, data?: Record<string, unknown>) =>
  axios.post(`${process.env.API_URL}/${path}`, data || {}, {
    headers: { Authorization: getAuthorizationHeader() },
  });

export default apiPost;
