import axios from "axios";
import { APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda";
import headers from "./headers";

type RoamJSUser = { email: string; [k: string]: unknown };

const getRoamJSUser = (token: string, extensionId: string) =>
  axios
    .get<RoamJSUser>(`https://lambda.roamjs.com/user`, {
      headers: {
        Authorization: process.env.ROAMJS_DEVELOPER_TOKEN,
        "x-roamjs-token": token,
        "x-roamjs-service": extensionId,
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
    handler: (u: RoamJSUser) => Promise<APIGatewayProxyResult>,
    extensionId = process.env.ROAMJS_EXTENSION_ID || ""
  ): APIGatewayProxyHandler =>
  (event) =>
    getRoamJSUser(
      event.headers.Authorization || event.headers.authorization || "",
      extensionId
    )
      .then(handler)
      .catch((e) => ({
        statusCode: 401,
        body: e.response?.data,
        headers,
      }));

export default getRoamJSUser;
