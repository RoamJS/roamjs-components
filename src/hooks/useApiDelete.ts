import axios, { AxiosResponse } from "axios";
import { useCallback } from "react";
import getAuthorizationHeader from "../util/getAuthorizationHeader";

const useAuthenticatedAxiosDelete = (): ((
  path: string
) => Promise<AxiosResponse>) => {
  return useCallback(
    (path: string) =>
      axios.delete(`${process.env.API_URL}/${path}`, {
        headers: { Authorization: getAuthorizationHeader() },
      }),
    []
  );
};

export default useAuthenticatedAxiosDelete;
