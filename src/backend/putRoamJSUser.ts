import https from "https";
import headers from "./headers";

const putRoamJSUser = ({
  token,
  data,
  extensionId = process.env.ROAMJS_EXTENSION_ID || "",
  email = process.env.ROAMJS_EMAIL,
  dev = process.env.NODE_ENV === "development",
}: {
  token: string;
  data: { [k: string]: unknown };
  extensionId?: string;
  email?: string;
  dev?: boolean;
}) =>
  new Promise<{ success: boolean }>((resolve, reject) => {
    const req = https
      .request(
        `https://lambda.roamjs.com/user`,
        {
          method: "PUT",
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
              resolve(JSON.parse(body) as { success: boolean });
            else reject(new Error(body));
          });
          res.on("error", reject);
        }
      )
      .on("error", reject);
    req.write(JSON.stringify(data));
    req.end();
  });

export const awsPutRoamJSUser = (
  event: { headers: { [k: string]: string } },
  data: Record<string, unknown>
) =>
  putRoamJSUser({
    token: event.headers.Authorization || event.headers.authorization || "",
    data,
  })
    .then((data) => ({
      statusCode: 200,
      body: JSON.stringify(data),
      headers,
    }))
    .catch((e: Error) => ({
      statusCode: 401,
      body: e.message,
      headers,
    }));

export default putRoamJSUser;
