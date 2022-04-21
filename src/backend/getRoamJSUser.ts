import axios from "axios";
import { APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda";
import headers from "./headers";

type RoamJSUser = { email: string; id: string; [k: string]: unknown };

const getRoamJSUser = ({
  token,
  extensionId = process.env.ROAMJS_EXTENSION_ID || "",
  email = process.env.ROAMJS_EMAIL,
  dev = process.env.NODE_ENV === "development",
  params = {},
}: {
  token: string;
  extensionId?: string;
  email?: string;
  dev?: boolean;
  params?: Record<string, string>;
}) => {
  const url = new URL(`https://lambda.roamjs.com/user`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  return axios
    .get<RoamJSUser>(url.toString(), {
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
    .then((r) => r.data)
    .catch((e) =>
      Promise.reject(
        new Error(
          typeof e.response?.data === "object"
            ? e.response.data.message || JSON.stringify(e.response.data)
            : e.response?.data || e.message
        )
      )
    );
};

export const awsGetRoamJSUser =
  <T = Record<string, unknown>>(
    handler: (
      u: RoamJSUser & { token: string },
      body: T
    ) => Promise<APIGatewayProxyResult>,
    params?: Record<string, string>
  ): APIGatewayProxyHandler =>
  (event) => {
    const token =
      event.headers.Authorization || event.headers.authorization || "";
    return getRoamJSUser({ token, params })
      .then((u) =>
        handler({ ...u, token }, {
          ...event.queryStringParameters,
          ...JSON.parse(event.body || "{}"),
        } as T)
      )
      .catch((e) => ({
        statusCode: 401,
        body: e.message,
        headers,
      }));
  };

export default getRoamJSUser;
