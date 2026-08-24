import getGoogleOauthScopes, {
  GOOGLE_OAUTH_SCOPE_NAMES,
  GOOGLE_OAUTH_SCOPE_URL_PREFIX,
} from "../../src/util/getGoogleOauthScopes";
import { test, expect } from "@playwright/test";

test("getGoogleOauthScopes includes Google contacts readonly scope", () => {
  const scopes = getGoogleOauthScopes();

  expect(GOOGLE_OAUTH_SCOPE_NAMES).toContain("contacts.readonly");
  expect(decodeURIComponent(scopes)).toContain(
    `${GOOGLE_OAUTH_SCOPE_URL_PREFIX}contacts.readonly`
  );
});

test("getGoogleOauthScopes encodes scopes for an OAuth query parameter", () => {
  expect(getGoogleOauthScopes(["userinfo.email", "contacts.readonly"])).toBe(
    `${GOOGLE_OAUTH_SCOPE_URL_PREFIX}userinfo.email%20${GOOGLE_OAUTH_SCOPE_URL_PREFIX}contacts.readonly`
  );
});
