# Event Handling

https://github.com/RoamJS/roamjs-components/blob/main/src/events

Utilities for setting up and managing event listeners in the Roam Research application are centralized in `https://github.com/RoamJS/roamjs-components/blob/main/src/events`. The primary function provided is [`watchOnce`](https://github.com/RoamJS/roamjs-components/blob/main/src/events/watchOnce.ts#L3), which allows for one-time event listening.

- [`watchOnce`](https://github.com/RoamJS/roamjs-components/blob/main/src/events/watchOnce.ts#L3) is designed to monitor changes in a specific Roam Research block and execute a callback function when a change is detected.
- It takes three parameters: [`pullPattern`](https://github.com/RoamJS/roamjs-components/blob/main/src/events/watchOnce.ts#L4) (the pattern to watch for), [`entityId`](https://github.com/RoamJS/roamjs-components/blob/main/src/events/watchOnce.ts#L5) (the block ID to watch), and [`callback`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L128) (the function to execute upon detection).

The function operates as follows:

- Sets up a watcher using [`window.roamAlphaAPI.data.addPullWatch()`](https://github.com/RoamJS/roamjs-components/blob/main/src/events/watchOnce.ts#L14), passing the [`pullPattern`](https://github.com/RoamJS/roamjs-components/blob/main/src/events/watchOnce.ts#L4), [`entityId`](https://github.com/RoamJS/roamjs-components/blob/main/src/events/watchOnce.ts#L5), and a custom watcher function.
- The custom watcher function invokes the [`callback`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L128) with [`before`](https://github.com/RoamJS/roamjs-components/blob/main/src/util/renderOverlay.ts#L34) and [`after`](https://github.com/RoamJS/roamjs-components/blob/main/src/events/watchOnce.ts#L6) [`PullBlock`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/native.ts#L171) objects.
- If the [`callback`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L128) returns [`true`](/roamjs-components/tsconfig.json#L9), the watcher is removed using [`window.roamAlphaAPI.data.removePullWatch()`](https://github.com/RoamJS/roamjs-components/blob/main/src/events/watchOnce.ts#L10).

This utility is useful for scenarios where an action needs to be performed once upon a block's update, such as updating a visualization or triggering a notification.
