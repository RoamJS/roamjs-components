# Queries

https://github.com/RoamJS/roamjs-components/blob/main/src/queries

Utility functions for interacting with the Roam Research database are provided in the `https://github.com/RoamJS/roamjs-components/blob/main/src/queries` directory. These functions facilitate various operations, including retrieving and manipulating data.

- **Datalog Compilation**: The [`compileDatalog`](https://github.com/RoamJS/roamjs-components/blob/main/src/queries/compileDatalog.ts#L5) function in `https://github.com/RoamJS/roamjs-components/blob/main/src/queries/compileDatalog.ts` compiles Datalog-related constructs into string representations. This includes data patterns, source variables, constants, variables, function expressions, predicate expressions, rule expressions, and different types of clauses (not, or, and, not-join, or-join).

- **Attribute Retrieval**: The [`getAttributeValueByBlockAndName`](https://github.com/RoamJS/roamjs-components/blob/main/src/queries/getAttributeValueByBlockAndName.ts#L4) function in `https://github.com/RoamJS/roamjs-components/blob/main/src/queries/getAttributeValueByBlockAndName.ts` retrieves the value of an attribute associated with a specific block. It uses a Datalog query to find the block with the given attribute name and parent UID, then extracts and returns the attribute value.

- **Utility Functions**:
  - [`isTagOnPage`](https://github.com/RoamJS/roamjs-components/blob/main/src/queries/isTagOnPage.ts#L3) in `https://github.com/RoamJS/roamjs-components/blob/main/src/queries/isTagOnPage.ts` checks if a given tag is present on a specific page. It normalizes the tag and title, then uses a Datalog query to determine if the tag exists on the page.
  - [`normalizePageTitle`](https://github.com/RoamJS/roamjs-components/blob/main/src/queries/normalizePageTitle.ts#L1) in `https://github.com/RoamJS/roamjs-components/blob/main/src/queries/normalizePageTitle.ts` normalizes a page title by replacing backslashes and double quotes with their escaped counterparts.

These utility functions are essential for efficiently interacting with the Roam Research database, enabling complex queries and data manipulations. For more detailed information on specific operations, refer to the respective sections on

- [Block Retrieval](https://wiki.mutable.ai/RoamJS/roamjs-components#block-retrieval)
- [Page Retrieval](https://wiki.mutable.ai/RoamJS/roamjs-components#page-retrieval)
- [User Information](https://wiki.mutable.ai/RoamJS/roamjs-components#user-information)
- [Block Hierarchy](https://wiki.mutable.ai/RoamJS/roamjs-components#block-hierarchy)
- [Block Metadata](https://wiki.mutable.ai/RoamJS/roamjs-components#block-metadata)
- [Attribute Retrieval](https://wiki.mutable.ai/RoamJS/roamjs-components#attribute-retrieval)
- [Datalog Compilation](https://wiki.mutable.ai/RoamJS/roamjs-components#datalog-compilation)
- [Utility Functions](https://wiki.mutable.ai/RoamJS/roamjs-components#utility-functions)
