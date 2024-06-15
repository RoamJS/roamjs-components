# Components

https://github.com/RoamJS/roamjs-components/tree/main/src/components

React components in this codebase provide various functionalities for the Roam Research application, focusing on configuration management, external authentication, user interface elements, and data visualization.

## Configuration Panels

Configuration panels are managed by components located in `https://github.com/RoamJS/roamjs-components/blob/main/src/components/ConfigPanels`. These components handle various input types such as text, number, time, and selection fields, as well as external authentication. The panels are designed to be modular and reusable, allowing for easy integration and customization within the Roam Research application.

[See More](https://wiki.mutable.ai/RoamJS/roamjs-components#configuration-panels)

## Extension API Context

The [`ExtensionApiContext`](https://github.com/RoamJS/roamjs-components/blob/main/src/components/ExtensionApiContext.tsx#L5) component, found in `https://github.com/RoamJS/roamjs-components/blob/main/src/components/ExtensionApiContext.tsx`, provides a React context for managing the extension API and version information. It exports two custom hooks, [`useExtensionAPI()`](https://github.com/RoamJS/roamjs-components/blob/main/src/components/ExtensionApiContext.tsx#L9) and [`useVersion()`](https://github.com/RoamJS/roamjs-components/blob/main/src/components/ExtensionApiContext.tsx#L11), which allow components to access the extension API and version information, respectively. The [`ExtensionApiContextProvider`](https://github.com/RoamJS/roamjs-components/blob/main/src/util/renderWithUnmount.ts#L3) component wraps the application to provide the necessary context.

[See More](https://wiki.mutable.ai/RoamJS/roamjs-components#extension-api-context)

## Utility Components

Utility components are located in `https://github.com/RoamJS/roamjs-components/blob/main/src/components/util` and provide additional functionality within the Roam Research application. Key components include:

- **AutocompleteInput**: Provides an autocomplete input field with fuzzy string matching and customizable options.
- **BlockErrorBoundary**: A React error boundary that handles errors within a specific block of content.
- **Loading**: Renders a small loading spinner component and a function to display it in a specific location on the page.
- **PageLink**: Renders a link to a Roam Research page, handling various user interactions such as opening the page in the sidebar.
- **MenuItemSelect**: Provides a dropdown menu with selectable items, supporting filtering and custom rendering of menu items.
- **ExternalLogin**: Handles the authentication flow for various external services and integrates the authentication data into a Roam Research note.
- **FormDialog**: Provides a reusable dialog box with various input fields for collecting user data.
- **ProgressDialog**: Displays a progress dialog showing the progress of writing actions to Roam and providing an estimated time for completion.
- **SimpleAlert**: Renders a customizable alert dialog with options for confirmation, cancellation, and a "Don't show again" checkbox.
- **Description**: Displays a tooltip with a description text when the user hovers over an information icon.

[See More](https://wiki.mutable.ai/RoamJS/roamjs-components#utility-components)
