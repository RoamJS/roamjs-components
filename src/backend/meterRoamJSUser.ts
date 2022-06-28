import https from "https";

const meterRoamJSUser = (
  user: string,
  quantity = 1,
  extensionId = process.env.ROAMJS_EXTENSION_ID || "",
  email = process.env.ROAMJS_EMAIL,
  dev = process.env.NODE_ENV === "development"
) =>
  new Promise<{ id: string }>((resolve, reject) => {
    const req = https
      .request(
        `https://lambda.roamjs.com/meter`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Buffer.from(
              `${email}:${process.env.ROAMJS_DEVELOPER_TOKEN}`
            ).toString("base64")}`,
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
              resolve(JSON.parse(body) as { id: string });
            else {
              const err = new Error(body);
              err.name = `${res.statusCode}`;
              reject(err);
            }
          });
          res.on("error", reject);
        }
      )
      .on("error", reject);
    req.write(
      JSON.stringify({
        ...(user.startsWith("user_") ? { id: user } : { email: user }),
        quantity,
      })
    );
    req.end();
  });

export default meterRoamJSUser;
