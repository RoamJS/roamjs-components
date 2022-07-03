import type { APIGatewayProxyResult } from "aws-lambda";
import emailError from "./emailError";
import headers from "./headers";

const emailCatch =
  (subject: string) =>
  (e: Error): Promise<APIGatewayProxyResult> => {
    const errorCode = Number(e.name);
    if (errorCode >= 400 && errorCode < 500) {
      return Promise.resolve({
        statusCode: errorCode,
        body: e.message,
        headers,
      });
    }
    return emailError(subject, e).then((id) => ({
      statusCode: 500,
      body: `Unknown error - Message Id ${id}`,
      headers,
    }));
  };

export default emailCatch;
