import axios from "axios";
import headers from "./headers";

const putRoamJSUser = (
  token: string,
  data: { [k: string]: unknown },
  extensionId = process.env.ROAMJS_EXTENSION_ID || "",
  email = process.env.ROAMJS_EMAIL,
  dev = process.env.NODE_ENV === "development"
) =>
  axios
    .put<{ success: boolean }>(`https://lambda.roamjs.com/user`, data, {
      headers: {
        Authorization: `Bearer ${Buffer.from(
          `${email}:${process.env.ROAMJS_DEVELOPER_TOKEN}`
        ).toString("base64")}`,
        "x-roamjs-token": token,
        "x-roamjs-extension": extensionId,
        ...(dev
          ? {
              "x-roamjs-dev": "true",
            }
          : {}),
      },
    })
    .then((r) => r.data);

export const awsPutRoamJSUser = (
  event: { headers: { [k: string]: string } },
  data: Record<string, unknown>
) =>
  putRoamJSUser(
    event.headers.Authorization || event.headers.authorization || "",
    data
  )
  .then((data) => ({
    statusCode: 200,
    body: JSON.stringify(data),
    headers,
  }))
  .catch((e) => ({
    statusCode: 401,
    body: e.response?.data,
    headers,
  }));

export default putRoamJSUser;
