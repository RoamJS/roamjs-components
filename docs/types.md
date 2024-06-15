## Type Definitions

https://github.com/RoamJS/roamjs-components/blob/main/src/types

The `https://github.com/RoamJS/roamjs-components/blob/main/src/types` directory defines the core types and interfaces used throughout the Roam Research extension ecosystem. These types cover a wide range of functionalities, from data structures and queries to user interface components and SmartBlocks.

The [`index.ts`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/index.ts#L0) file serves as the entry point, importing and re-exporting types from other modules such as [`native`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L0), [`query-builder`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/query-builder.ts#L0), and [`smartblocks`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L15). It also defines the [`Registry`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L22) type, which centralizes the storage of various elements, event listeners, and other state used by the extension. Additionally, it extends the global [`Window`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L57) object with Roam Research-specific APIs and utilities, including the [`roamAlphaAPI`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L83) and [`roamjs`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L234) namespaces.

The [`native.ts`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L0) file provides a comprehensive set of types for working with the Roam Research application. Key types include:

- **Datalog Types**: These types, such as [`DatalogSrcVar`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L6) and [`DatalogVariable`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L11), model the structure of Datalog queries, which are integral to the Roam Research data model.
- **Roam Research Data Structures**: Types like [`RoamBasicBlock`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L139), [`RoamBasicPage`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L144), and [`RoamBasicNode`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L146) represent the various elements of Roam Research, such as blocks, pages, and nodes.
- **User Interface Components**: Types such as [`Action`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L447), [`ButtonAction`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L419), and [`SwitchAction`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L425) model the user interface components that can be added to the Roam Research application.
- **Client-Side Actions**: Types like [`ClientParams`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L324) and [`ActionParams`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L341) represent the parameters for various client-side actions, such as creating or updating blocks and pages.
- **User Settings**: The [`UserSettings`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L363) type represents the user settings for the Roam Research application.
- **Sidebar Functionality**: Types like [`SidebarWindowInput`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L376) and [`SidebarBlockWindow`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L381) model the sidebar functionality of the Roam Research application.

The [`query-builder.ts`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/query-builder.ts#L0) file defines types related to querying and working with data in [Query Builder](https://github.com/RoamJS/query-builder). Key types include:

- **Result**: Represents the result of a query, containing fields like [`text`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L211) and [`uid`](https://github.com/RoamJS/roamjs-components/blob/main/src/util/getOauth.ts#L45).
- **RunQuery** and **RunQuerySync**: Function types that execute a query and return the results.
- **ListActiveQueries**: A function type that returns active queries.
- **IsDiscourseNode**: A function type that determines if a node is a discourse node.

The [`smartblocks.ts`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/smartblocks.ts#L0) file defines types and interfaces used in the [SmartBlocks](https://github.com/RoamJS/smartblocks) extension. Key types include:

- **CommandOutput**: Represents the output of a command handler.
- **CommandHandler**: A function type that handles commands.
- **SmartBlocksContext**: Represents the context in which a SmartBlock is executed.
- **RegisterCommand** and **UnregisterCommand**: Function types for registering and unregistering commands.

These types are essential for building robust and extensible Roam Research applications and integrations. For more detailed information on specific types, refer to the subsections on [Index Types](https://wiki.mutable.ai/RoamJS/roamjs-components#index-types), [Native Types](https://wiki.mutable.ai/RoamJS/roamjs-components#native-types), [Query Builder Types](https://wiki.mutable.ai/RoamJS/roamjs-components#query-builder-types), and [SmartBlocks Types](https://wiki.mutable.ai/RoamJS/roamjs-components#smartblocks-types).
