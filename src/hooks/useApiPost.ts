import axios, { AxiosResponse } from "axios";
import { useCallback } from "react";
import getAuthorizationHeader from "../util/getAuthorizationHeader";

const useApiPost = (): ((
  path: string,
  data?: Record<string, unknown>
) => Promise<AxiosResponse>) => {
  return useCallback(
    (path: string, data?: Record<string, unknown>) =>
      axios.post(`${process.env.API_URL}/${path}`, data || {}, {
        headers: { Authorization: getAuthorizationHeader() },
      }),
    []
  );
};

export default useApiPost;
