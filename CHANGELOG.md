# Changelog

## 0.91.0

- Updated the Roam Alpha API and extension API types to match the latest developer documentation, including search, markdown import, comments, context menus, custom views, AI tools, and current sidebar window identifiers.
- Allowed computed boolean values for query grouping and block zoom paths when no dependent sort or start-UID option is supplied.
- Corrected file download types for optional formats and exposed block/page deletion results.
- Preserved custom page properties and synchronous AI-attributed writes that return a promise, and added custom callout registration types.

## 0.90.0

- Preserve Roam's built-in React 18 external-store hook when extensions initialize.
- Remove React 17 shim injection from the package build configuration. Extensions using this configuration now require a host that provides `useSyncExternalStore`, such as Roam's documented React 18.2.0.
- Existing extension bundles must be rebuilt and republished to adopt this change. Custom build configurations that inject a shim must be updated separately.
