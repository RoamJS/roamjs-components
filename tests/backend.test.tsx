import getRoamJSUser from "../src/backend/getRoamJSUser";
import putRoamJSUser from "../src/backend/putRoamJSUser";
import nanoid from "nanoid";

test("get and put user metadata", (done) => {
  const params = {
    token: `Bearer ${Buffer.from(
      `support@roamjs.com:${process.env.ROAMJS_TEST_DEVELOPER_TOKEN}`
    ).toString("base64")}`,
    extensionId: "developer",
    email: "support@roamjs.com",
    dev: true,
  };
  const foo = nanoid();
  getRoamJSUser(params)
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
      done();
    });
}, 10000);
