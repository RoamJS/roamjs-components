# Write Operations

https://github.com/RoamJS/roamjs-components/blob/main/src/writes

`https://github.com/RoamJS/roamjs-components/blob/main/src/writes` contains functions that handle various write operations in a Roam. These functions include clearing, creating, updating, and deleting blocks, as well as creating pages and managing sidebar operations.

- [`clearBlockById`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/clearBlockById.ts#L4): Clears the content of a block by its ID. It uses [`getUidsFromId`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getUidsFromId.ts#L1) to extract the block UID and then calls [`submitActions`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/submitActions.ts#L19) to update the block content to an empty string.
- [`clearBlockByUid`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/clearBlockByUid.ts#L3): Clears the content of a block by its UID. It directly calls [`submitActions`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/submitActions.ts#L19) with an update action to set the block content to an empty string.
- [`createBlock`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/createBlock.ts#L41): Creates a new block with the provided content and options. It gathers the necessary actions using [`gatherActions`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/createBlock.ts#L4) and submits them using [`submitActions`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/submitActions.ts#L19).
- [`createPage`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/createPage.ts#L6): Creates a new page with the provided title. It checks if the title matches a daily note pattern and generates a UID if necessary. It then submits actions to create the page and any child blocks using [`submitActions`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/submitActions.ts#L19).
- [`deleteBlock`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/deleteBlock.ts#L3): Deletes a block by its UID. It submits a delete action using [`submitActions`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/submitActions.ts#L19).
- [`openBlockInSidebar`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/openBlockInSidebar.ts#L1): Opens a block in the sidebar. It checks if the block is already open in the sidebar and either opens the sidebar or adds a new window with the block UID.
- [`updateActiveBlock`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/updateActiveBlock.ts#L4): Updates the content of the currently active block. It retrieves the active block UID using [`getActiveUids`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getActiveUids.ts#L3) and submits an update action using [`submitActions`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/submitActions.ts#L19).
- [`updateBlock`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/updateBlock.ts#L4): Updates the properties of a block, including text, heading, text alignment, view type, and open state. It submits these updates using [`submitActions`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/submitActions.ts#L19).

The [`submitActions`](https://github.com/RoamJS/roamjs-components/blob/main/src/writes/submitActions.ts#L19) function is central to these operations, handling the submission of various actions to the Roam Research API. It manages an action queue and retries actions in case of API errors.

For more details on see

- [Block Operations](https://wiki.mutable.ai/RoamJS/roamjs-components#block-operations)
- [Page Operations](https://wiki.mutable.ai/RoamJS/roamjs-components#page-operations)
- [Sidebar Operations](https://wiki.mutable.ai/RoamJS/roamjs-components#sidebar-operations)
- [Action Submission](https://wiki.mutable.ai/RoamJS/roamjs-components#action-submission)
