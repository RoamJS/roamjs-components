import axios from "axios";
import { APIGatewayProxyEvent } from "aws-lambda";
import headers from "./headers";

const getRoamJSUser = (token: string, extensionId: string) =>
  axios
    .get(`https://lambda.roamjs.com/user`, {
      headers: {
        Authorization: process.env.ROAMJS_DEVELOPER_TOKEN,
        "x-roamjs-token": token,
        "x-roamjs-service": extensionId,
      },
    })
    .catch((e) => ({
      statusCode: 401,
      body: e.response?.data,
      headers,
    }));

export const awsGetRoamJSUser = (
  event: APIGatewayProxyEvent,
  extensionId: string
) =>
  getRoamJSUser(
    event.headers.Authorization || event.headers.authorization || "",
    extensionId
  ).catch((e) => ({
    statusCode: 401,
    body: e.response?.data,
    headers,
  }));

export default getRoamJSUser;
