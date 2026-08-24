# Changelog

## 0.88.5

- Added the Google contacts readonly OAuth scope to the shared Google scope helper.
- Limited development `dev=true` query parameters to RoamJS-hosted requests.
- Sent production extension startup failures to PostHog with privacy-safe error metadata while preserving the local failure toast, and added source map upload support to the shared release CLI.
