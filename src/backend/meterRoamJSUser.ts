import axios from "axios";

const meterRoamJSUser = (
  user: string,
  quantity: number = 1,
  extensionId = process.env.ROAMJS_EXTENSION_ID || "",
  email = process.env.ROAMJS_EMAIL
) =>
  axios
    .post(
      `https://lambda.roamjs.com/meter`,
      {
        email: user,
        quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${Buffer.from(
            `${email}:${process.env.ROAMJS_DEVELOPER_TOKEN}`
          ).toString("base64")}`,
          "x-roamjs-extension": extensionId,
          ...(process.env.NODE_ENV === "development"
            ? {
                "x-roamjs-dev": "true",
              }
            : {}),
        },
      }
    )
    .then((r) => r.data as { id: string });

export default meterRoamJSUser;
