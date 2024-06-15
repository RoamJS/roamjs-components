# DOM Manipulation

https://github.com/RoamJS/roamjs-components/blob/main/src/dom`

The `https://github.com/RoamJS/roamjs-components/blob/main/src/dom` directory contains utility functions and constants for interacting with the Document Object Model (DOM) in the context of Roam Research. These utilities facilitate various operations, including adding commands, observing DOM changes, retrieving data, generating URLs, and parsing block content.

## Adding Block Commands and Script Dependencies

Functions like [`addBlockCommand`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/addBlockCommand.ts#L11) allow developers to add new block commands to the Roam Research UI. Script dependencies can be managed using [`addOldRoamJSDependency`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/addOldRoamJSDependency.ts#L3) and [`addRoamJSDependency`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/addRoamJSDependency.ts#L3). These functions ensure that necessary scripts are loaded into the application.

[See More](https://wiki.mutable.ai/RoamJS/roamjs-components#adding-block-commands-and-script-dependencies)

## DOM Observation and Manipulation

Utilities such as [`createBlockObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/createBlockObserver.ts#L3) and [`createHTMLObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/createHTMLObserver.ts#L4) enable observing changes in the DOM. These functions use [`MutationObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L25) to monitor specific elements and execute callbacks when changes occur. For example, [`createBlockObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/createBlockObserver.ts#L3) observes changes to Roam blocks, while [`createHTMLObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/createHTMLObserver.ts#L4) can be configured to watch for any HTML element with a specific tag and class.

[See More](https://wiki.mutable.ai/RoamJS/roamjs-components#dom-observation-and-manipulation)

## Retrieving and Manipulating Roam-Specific Data

Functions like [`getCurrentPageUid`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getCurrentPageUid.ts#L1), [`getBlockUidFromTarget`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getBlockUidFromTarget.ts#L5), and [`getUids`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getUids.ts#L3) are used to retrieve unique identifiers (UIDs) for pages and blocks within Roam Research. These UIDs are essential for various operations, such as linking to specific blocks or pages.

[See More](https://wiki.mutable.ai/RoamJS/roamjs-components#retrieving-and-manipulating-roamspecific-data)

## URL Generation and Reference Resolution

The [`getRoamUrl`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getRoamUrl.ts#L1) and [`getRoamUrlByPage`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getRoamUrlByPage.ts#L4) functions generate URLs for Roam Research pages and blocks. The [`resolveRefs`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/resolveRefs.ts#L16) function processes text strings to resolve references, such as alias tags and block references, into their corresponding URLs or text content.

[See More](https://wiki.mutable.ai/RoamJS/roamjs-components#url-generation-and-reference-resolution)

## Parsing Roam Block Content

The [`parseRoamBlocksToHtml`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/parseRoamBlocksToHtml.ts#L111) function converts Roam block content into HTML. This is useful for rendering Roam content in different contexts, such as exporting notes or displaying them in custom views.

[See More](https://wiki.mutable.ai/RoamJS/roamjs-components#parsing-roam-block-content)

## Constants

The [`BLOCK_REF_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L42) constant, defined in `https://github.com/RoamJS/roamjs-components/blob/main/src/dom/constants.ts`, is a regular expression used to match block references in Roam Research. This regex is critical for identifying and manipulating block references within the application.

## Utility Functions

- **[`getUidsFromId`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getUidsFromId.ts#L1)**: Extracts [`blockUid`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getUidsFromId.ts#L3) and [`windowId`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getUidsFromId.ts#L5) from an [`id`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L454) string.
- **[`getPageTitleValueByHtmlElement`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getPageTitleValueByHtmlElement.ts#L4)**: Retrieves the page title value associated with an HTML element.
- **[`getReferenceBlockUid`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getReferenceBlockUid.ts#L5)**: Retrieves the UID of a reference block based on an HTML element.
- **[`addScriptAsDependency`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/addScriptAsDependency.ts#L1)**: Adds a script tag to the document's head, ensuring it is only added once.
- **[`createIconButton`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/createIconButton.ts#L1)**: Creates an HTML [`<span>`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L28) element representing an icon button.
- **[`addStyle`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/addStyle.ts#L1)**: Adds a new style element to the document.
- **[`createDivObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/createDivObserver.ts#L3)**: Sets up a [`MutationObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L25) to monitor changes to a specific DOM element.
- **[`createOverlayObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/createOverlayObserver.ts#L3)**: Creates a [`MutationObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L25) that observes changes to the [`document.body`](https://github.com/RoamJS/roamjs-components/blob/main/src/util/runExtension.ts#L51) element.
- **[`createButtonObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/createButtonObserver.ts#L3)**: Monitors the DOM for changes to HTML [`<span>`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L28) elements with a specific class.
- **[`createPageTitleObserver`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/createPageTitleObserver.ts#L4)**: Observes changes to the title of a specific Roam Research page.
- **[`getMutatedNodes`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getMutatedNodes.ts#L3)**: Finds nodes in a list of mutation records that match specified criteria.
- **[`getActiveUids`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getActiveUids.ts#L3)**: Retrieves the UIDs of the currently active HTML element on the page.
- **[`elToTitle`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/elToTitle.ts#L1)**: Converts a DOM [`Node`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/createHTMLObserver.ts#L17) to a string representing its title or text content.
- **[`getDropUidOffset`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/getDropUidOffset.ts#L5)**: Determines the parent UID and offset of a given HTML [`div`](https://github.com/RoamJS/roamjs-components/blob/main/src/components/Filter.tsx#L81) element within its parent container.

These utilities streamline interactions with the DOM, making it easier to build and manage extensions and integrations for Roam Research.
