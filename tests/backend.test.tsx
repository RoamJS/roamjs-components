import getRoamJSUser from "../src/backend/getRoamJSUser";
import putRoamJSUser from "../src/backend/putRoamJSUser";
import nanoid from "nanoid";
import { test, expect } from "@playwright/test";

test("get and put user metadata", async () => {
  const params = {
    token: `Bearer ${Buffer.from(
      `support@roamjs.com:${process.env.ROAMJS_TEST_DEVELOPER_TOKEN}`
    ).toString("base64")}`,
    extensionId: "developer",
    email: "support@roamjs.com",
    dev: true,
  };
  const foo = nanoid();
  await getRoamJSUser(params)
    .then((u) => {
      expect(u.email).toBe(params.email);
      return putRoamJSUser({ data: { foo }, ...params });
    })
    .then((r) => {
      expect(r.success).toBeTruthy();
      return getRoamJSUser(params);
    })
    .then((r) => {
      expect(r.foo).toBe(foo);
    });
});
