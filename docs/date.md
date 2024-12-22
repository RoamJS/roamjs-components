# Date and Time Utilities

https://github.com/RoamJS/roamjs-components/blob/main/src/date

Utilities for parsing and manipulating dates and times within the Roam Research application are provided in the `https://github.com/RoamJS/roamjs-components/blob/main/src/date` directory. Key functionalities include:

- **Natural Language Date Parsing**: The [`parseNlpDate`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L250) function leverages the [`chrono-node`](/roamjs-components/package.json#L32) library to interpret natural language dates (e.g., "yesterday", "next Monday"). Custom parsing and refinement logic enhance its robustness. The [`startOfWeek`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L13), [`endOfWeek`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L21), [`startOfMonth`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L211), [`endOfMonth`](/roamjs-components/tests/date.test.ts#L14), [`startOfYear`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L224), and [`endOfYear`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L8) functions from [`date-fns`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L1) determine the start and end of various periods. The [`ORDINAL_WORD_DICTIONARY`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L29) and [`ORDINAL_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L73) assist in parsing ordinal words and numbers. The [`assignDay`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L159) function assigns year, month, and day components to a [`ParsingComponents`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L10) object.

- **Roam Date UID Parsing**: The [`parseRoamDateUid`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseRoamDateUid.ts#L1) function converts Roam Research date UIDs (formatted as "month-date-year") into JavaScript [`Date`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L98) objects. It splits the input string, converts the components to numbers, and constructs a [`Date`](https://github.com/RoamJS/roamjs-components/blob/main/src/types/index.ts#L98) object, adjusting the month value to match JavaScript's zero-indexed months.

- **Constants**: The [`constants.ts`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/constants.ts#L0) file provides constants like [`MONTHS`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/constants.ts#L1), an array of month names, and regular expressions ([`DAILY_NOTE_PAGE_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/constants.ts#L15) and [`DAILY_NOTE_PAGE_TITLE_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/constants.ts#L17)) for matching and validating daily note page titles in Roam Research.

For detailed discussions on constants and parsing functions, refer to the subsections [Constants](https://wiki.mutable.ai/RoamJS/roamjs-components#constants) and [Date Parsing](https://wiki.mutable.ai/RoamJS/roamjs-components#date-parsing).