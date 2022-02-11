import type { APIGatewayProxyResult } from "aws-lambda";
import type { AxiosError } from "axios";
import emailError from "./emailError";
import headers from "./headers";

const emailCatch =
  (subject: string) =>
  (e: AxiosError): Promise<APIGatewayProxyResult> =>
    emailError(subject, e).then((id) => ({
      statusCode: 500,
      body: `Unknown error - Message Id ${id}`,
      headers,
    }));

export default emailCatch;
