import axios from "axios";
import getAuthorizationHeader from "../util/getAuthorizationHeader";

const apiPost = (path: string, data?: Record<string, unknown>) =>
  axios
    .post(`${process.env.API_URL}/${path}`, data || {}, {
      headers: { Authorization: getAuthorizationHeader() },
    })
    .catch((e) =>
      Promise.reject(
        new Error(
          typeof e.response?.data === "object"
            ? e.response.data.message || JSON.stringify(e.response.data)
            : e.response?.data || e.message
        )
      )
    );

export default apiPost;
