# roamjs-components

This is a collection of common UI components used by RoamJS extensions made available to make development easier for other Roam developers.

The `roamjs-components` repository provides a robust set of tools and components for building extensions and integrations for the Roam Research note-taking application. Engineers can use this repo to streamline the development of Roam extensions by leveraging pre-built React components, utility functions, and custom hooks that interact with the Roam Research API. This repo addresses the real-world problem of efficiently creating and managing Roam Research extensions, enabling developers to focus on building unique features rather than handling boilerplate code.

The most important parts of the repo include the Components, utility functions, and database query functions. These components are organized into several directories, each serving a specific purpose:

[Components](https://github.com/RoamJS/roamjs-components/blob/main/docs/components.md): Found in the `…/components` directory, these components handle tasks such as configuration management, external authentication, and data visualization. Key components include configuration panels like `BlockPanel`, `BlocksPanel`, and `OauthPanel`, which are detailed in the Configuration Panels section. These components use React hooks and context to manage state and interactions within the Roam Research application.

[Date and Time Utilities](https://github.com/RoamJS/roamjs-components/blob/main/docs/date.md): Located in `…/date`, this directory provides functions for parsing and manipulating dates, crucial for working with Roam's daily notes. The `parseNlpDate` function uses the `chrono-node` library to parse natural language dates, while `parseRoamDateUid` converts Roam date UIDs into JavaScript Date objects. More details can be found in the Date and Time Utilities section.

[DOM Manipulation](https://github.com/RoamJS/roamjs-components/blob/main/docs/dom.md): The `…/dom` directory contains functions for interacting with the Document Object Model (DOM) within Roam Research. Functions like `addBlockCommand` and `createBlockObserver` are essential for adding new commands and observing changes in the DOM. These utilities are explained in the DOM Manipulation section.

[Event Handling](https://github.com/RoamJS/roamjs-components/blob/main/docs/events.md): The `…/events` directory includes the `watchOnce` function, which sets up one-time event listeners in Roam Research. This function is useful for performing actions when specific changes occur in the Roam environment, as detailed in the Event Handling section.

[Custom React Hooks](https://github.com/RoamJS/roamjs-components/blob/main/docs/hooks.md): Found in `…/hooks`, these hooks provide reusable functionality for managing user interactions and data structures. The `useArrowKeyDown` hook handles keyboard navigation within lists, while `useSubTree` manages sub-tree data structures. More information is available in the Custom React Hooks section.

[Markdown Parsing and Rendering](https://github.com/RoamJS/roamjs-components/blob/main/docs/marked.md): The `…/marked` directory customizes the `marked` library to parse and render Markdown content within Roam Research. This includes handling Roam-specific elements like block references and tags. The Markdown Parsing and Rendering section provides further details.

[Database Queries](https://github.com/RoamJS/roamjs-components/blob/main/docs/queries.md): The `…/queries` directory offers utility functions for interacting with the Roam Research database. Functions like `getAllBlockUids`, `getPageTitleByBlockUid`, and `getCurrentUser` retrieve various types of data from the database. These functions are crucial for building data-driven features and are discussed in the Database Queries section.

[Script Management](https://github.com/RoamJS/roamjs-components/blob/main/docs/scripts.md): The `…/scripts` directory includes functions for managing scripts in Roam Research. This includes functions for creating and managing script commands, as well as functions for executing scripts.

[Type Definitions](https://github.com/RoamJS/roamjs-components/blob/main/docs/types.md): The `…/types` directory contains TypeScript type definitions for various Roam Research components.

[Utility Functions](https://github.com/RoamJS/roamjs-components/blob/main/docs/util.md): The `…/util` directory includes utility functions for working with the Roam Research API. These functions are designed to simplify the process of interacting with the API.

[Write Operations](https://github.com/RoamJS/roamjs-components/blob/main/docs/writes.md): The `…/writes` directory includes functions for performing write operations in Roam, such as `createBlock`, `deleteBlock`, and `updateActiveBlock`. These functions handle the submission of actions to the Roam API, as detailed in the Write Operations section.
