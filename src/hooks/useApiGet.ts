import axios, { AxiosResponse } from "axios";
import { useCallback } from "react";
import getAuthorizationHeader from "../util/getAuthorizationHeader";

const useApiGet = (): ((path: string) => Promise<AxiosResponse>) => {
  return useCallback(
    (path: string) =>
      axios.get(`${process.env.API_URL}/${path}`, {
        headers: { Authorization: getAuthorizationHeader() },
      }),
    []
  );
};

export default useApiGet;
