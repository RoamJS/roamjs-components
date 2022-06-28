import https from "https";
import http from "http";
import { URL } from "url";
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
  const url = new URL(
    `${process.env.API_URL || "https://lambda.roamjs.com"}/user`
  );
  const mod = url.protocol === "http:" ? http : https;
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  return new Promise<RoamJSUser>((resolve, reject) =>
    mod
      .get(
        url,
        {
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
        },
        (res) => {
          res.setEncoding("utf8");
          let body = "";
          res.on("data", (data) => {
            body += data;
          });
          res.on("end", () => {
            if (!res.statusCode) reject("Missing Status Code");
            else if (res.statusCode >= 200 && res.statusCode < 400)
              resolve(JSON.parse(body) as RoamJSUser);
            else {
              const err = new Error(body);
              err.name = `${res.statusCode}`;
              reject(err);
            }
          });
          res.on("error", reject);
        }
      )
      .on("error", reject)
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
        statusCode: Number(e.name) || 500,
        body: e.message,
        headers,
      }));
  };

export default getRoamJSUser;
