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
  const search = new URLSearchParams(params).toString();
  return axios
    .get<RoamJSUser>(`https://lambda.roamjs.com/user${search}`, {
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
};

export const awsGetRoamJSUser =
  <T = Record<string, unknown>>(
    handler: (
      u: RoamJSUser & { token: string },
      body: T
    ) => Promise<APIGatewayProxyResult>
  ): APIGatewayProxyHandler =>
  (event) => {
    const token =
      event.headers.Authorization || event.headers.authorization || "";
    return getRoamJSUser({ token })
      .then((u) =>
        handler({ ...u, token }, {
          ...event.queryStringParameters,
          ...JSON.parse(event.body || "{}"),
        } as T)
      )
      .catch((e) => ({
        statusCode: 401,
        body: e.response?.data,
        headers,
      }));
  };

export default getRoamJSUser;
