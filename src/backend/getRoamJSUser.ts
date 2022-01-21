import axios from "axios";
import { APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda";
import headers from "./headers";

type RoamJSUser = { email: string; [k: string]: unknown };

const getRoamJSUser = (
  token: string,
  extensionId = process.env.ROAMJS_EXTENSION_ID || "",
  email = process.env.ROAMJS_EMAIL
) =>
  axios
    .get<RoamJSUser>(`https://lambda.roamjs.com/user`, {
      headers: {
        Authorization: `Bearer ${Buffer.from(
          `${email}:${process.env.ROAMJS_DEVELOPER_TOKEN}`
        ).toString("base64")}`,
        "x-roamjs-token": token,
        "x-roamjs-extension": extensionId,
        ...(process.env.NODE_ENV === "development"
          ? {
              "x-roamjs-dev": "true",
            }
          : {}),
      },
    })
    .then((r) => r.data);

export const awsGetRoamJSUser =
  (
    handler: (u: RoamJSUser) => Promise<APIGatewayProxyResult>
  ): APIGatewayProxyHandler =>
  (event) =>
    getRoamJSUser(
      event.headers.Authorization || event.headers.authorization || ""
    )
      .then(handler)
      .catch((e) => ({
        statusCode: 401,
        body: e.response?.data,
        headers,
      }));

export default getRoamJSUser;
