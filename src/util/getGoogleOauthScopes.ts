export const GOOGLE_OAUTH_SCOPE_NAMES = [
  "calendar.readonly",
  "calendar.events",
  "userinfo.email",
  "drive.file",
  "contacts.readonly",
] as const;

export const GOOGLE_OAUTH_SCOPE_URL_PREFIX =
  "https://www.googleapis.com/auth/";

const getGoogleOauthScopes = (
  scopes: readonly string[] = GOOGLE_OAUTH_SCOPE_NAMES
): string =>
  scopes
    .map((scope) =>
      scope.startsWith(GOOGLE_OAUTH_SCOPE_URL_PREFIX)
        ? scope
        : `${GOOGLE_OAUTH_SCOPE_URL_PREFIX}${scope}`
    )
    .join("%20");

export default getGoogleOauthScopes;
