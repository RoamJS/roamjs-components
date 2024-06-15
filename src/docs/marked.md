# Markdown Parsing and Rendering

https://github.com/RoamJS/roamjs-components/blob/main/src/marked

Markdown content is parsed and rendered using a custom implementation of the [`marked`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L14) library, tailored for Roam Research. The main entry point for this functionality is in `https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts`.

- **Language Syntax Highlighting**: Various language syntax highlighters from the [`refractor`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L2) library are registered, including Markdown, YAML, CSS, Bash, Java, Rust, Python, C#, Clojure, and HCL.

- **Regular Expressions**: Several regular expressions are defined to match different types of Markdown elements:

  - [`URL_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L32): Matches URLs
  - [`TODO_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L34): Matches TODO items
  - [`DONE_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L35): Matches DONE items
  - [`IFRAME_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L36): Matches iframes
  - [`BUTTON_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L39): Matches buttons
  - [`TAG_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L41): Matches tags
  - [`BLOCK_REF_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L42): Matches block references
  - [`ALIAS_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L45): Matches aliases
  - [`ALIAS_REF_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L46): Matches alias references
  - [`HASHTAG_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L47): Matches hashtags
  - [`ATTRIBUTE_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L48): Matches attributes
  - [`BOLD_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L49): Matches bold text
  - [`ITALICS_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L50): Matches italicized text
  - [`HIGHLIGHT_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L51): Matches highlighted text
  - [`INLINE_STOP_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L52): Matches various inline elements that should stop the parsing of inline text
  - [`HR_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L54): Matches horizontal rules
  - [`BQ_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L55): Matches blockquotes
  - [`TWEET_STATUS_REGEX`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L56): Matches Twitter status URLs

- **Custom Options ([`opts`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L121))**: Extends the default [`marked`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L14) options to handle:

  - HTML tags
  - Strikethrough text
  - Bold and italicized text
  - Code blocks
  - Inline text
  - Code spans

- **Custom Renderer ([`renderer`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L426))**: Extends the default [`marked`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L14) renderer to handle:

  - Different types of links
  - Code spans with syntax highlighting
  - Various HTML elements

- **Exported Functions**: Several functions wrap the [`marked`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L14) library's functionality, allowing for contextual parsing of Markdown text based on a provided [`RoamContext`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L563) object:
  - [`getInlineLexer`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L602)
  - [`getLexer`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L603)
  - [`getParseInline`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L604)
  - [`getParse`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L605)
  - [`inlineLexer`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L615)
  - [`lexer`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L616)
  - [`parseInline`](https://github.com/RoamJS/roamjs-components/blob/main/src/marked/index.ts#L617)
  - [`parse`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L253)
  - [`default`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/index.ts#L2) (exports the [`parse`](https://github.com/RoamJS/roamjs-components/blob/main/src/date/parseNlpDate.ts#L253) function)

These customizations ensure that Roam-specific elements and formatting are correctly handled within the Markdown content.
