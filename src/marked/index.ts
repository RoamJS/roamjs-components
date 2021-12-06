import marked, { Lexer } from "marked";
import XRegExp from "xregexp";
import refractor from "refractor";
import markdown from "refractor/lang/markdown";
import yaml from "refractor/lang/yaml";
import css from "refractor/lang/css";
import bash from "refractor/lang/bash";
import java from "refractor/lang/java";
import rust from "refractor/lang/rust";
import python from "refractor/lang/python";
import csharp from "refractor/lang/csharp";
import clojure from "refractor/lang/clojure";
import hcl from "refractor/lang/hcl";
import toHtml from "hast-util-to-html";

refractor.register(markdown);
refractor.register(yaml);
refractor.register(css);
refractor.register(bash);
refractor.register(java);
refractor.register(rust);
refractor.register(python);
refractor.register(csharp);
refractor.register(clojure);
refractor.register(hcl);

const RENDERED_TODO =
  '<span><label class="check-container"><input type="checkbox" disabled=""><span class="checkmark"></span></label></span>';
const RENDERED_DONE =
  '<span><label class="check-container"><input type="checkbox" checked="" disabled=""><span class="checkmark"></span></label></span>';

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=$]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=$]*)/;
const TODO_REGEX = /^{{(?:\[\[)?TODO(?:\]\])?}}/;
const DONE_REGEX = /^{{(?:\[\[)?DONE(?:\]\])?}}/;
const IFRAME_REGEX = new RegExp(
  `^{{(?:\\[\\[)?iframe(?:\\]\\])?:\\s*(${URL_REGEX.source})}}`
);
const BUTTON_REGEX = /^{{(?:\[\[)?((?:(?!}}[^}])[\w\s-/])*)(?:\]\])?(?::(.*))?}}/;
const TAG_REGEX = /^#?\[\[(.*?)\]\]/;
const BLOCK_REF_REGEX = /^\(\((.*?)\)\)/;
const toAlias = (r: RegExp) =>
  new RegExp(`^\\[([^\\]]*?)\\]\\(${r.source.substring(1)}\\)`);
const ALIAS_REGEX = toAlias(TAG_REGEX);
const ALIAS_REF_REGEX = toAlias(BLOCK_REF_REGEX);
const HASHTAG_REGEX = /^#([^\s]*)/;
const ATTRIBUTE_REGEX = /^(.*?)::/;
const BOLD_REGEX = /^\*\*(.*?)\*\*/;
const ITALICS_REGEX = /^__(.*?)__/;
const HIGHLIGHT_REGEX = /^\^\^([^^]*)\^\^/;
const INLINE_STOP_REGEX = /({{|\*\*([^*]+?)\*\*|__([^_]+?)__|\^\^([^^]+?)\^\^|#?\[\[(.*?)\]\]|#[^\s]|\(\(.*?\)\)|\[(.*?)\]\((.*?)\))/;
const HR_REGEX = /^---$/;
const BQ_REGEX = /^(?:>|\[\[>\]\]) (.*)$/s;
const TWEET_STATUS_REGEX = /\/status\/(.*?)(?:\?s=\d*)?$/;
const HTML_REGEXES = [BUTTON_REGEX, BLOCK_REF_REGEX, HR_REGEX];
const HTML_WITH_CHILD_REGEXES = [
  { rgx: BQ_REGEX, title: "blockquote" },
  { rgx: HIGHLIGHT_REGEX, title: "highlight" },
];
const CODESPAN_REGEX = new RegExp("^```([\\w]*)\n(.*)```$", "s");

const defaultComponents = (component: string, afterColon?: string) => {
  const opts = afterColon?.trim?.() || "";
  switch (component) {
    case "youtube":
    case "video":
      return `<div class="rm-iframe-container"><iframe src="${opts
        .replace("youtu.be", "www.youtube.com/embed")
        .replace("watch?v=", "embed/")
        .replace(
          "vimeo.com",
          "player.vimeo.com/video"
        )}" class="rm-iframe rm-video-player"></iframe></div>`;
    case "pdf":
      return `<div class="rm-iframe-container"><iframe src="${opts}" class="rm-iframe"></iframe></div>`;
    default:
      return "";
  }
};

let lastSrc = "";
// https://github.com/markedjs/marked/blob/d2347e9b9ae517d02138fa6a9844bd8d586acfeb/src/Tokenizer.js#L33-L59
function indentCodeCompensation(raw: string, text: string) {
  const matchIndentToCode = raw.match(/^(\s+)(?:```)/);

  if (matchIndentToCode === null) {
    return text;
  }

  const indentToCode = matchIndentToCode[1];

  return text
    .split("\n")
    .map((node) => {
      const matchIndentInNode = node.match(/^\s+/);
      if (matchIndentInNode === null) {
        return node;
      }

      const [indentInNode] = matchIndentInNode;

      if (indentInNode.length >= indentToCode.length) {
        return node.slice(indentToCode.length);
      }

      return node;
    })
    .join("\n");
}

const opts = {
  tokenizer: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore should accept boolean return value
    tag(src) {
      for (const r of HTML_REGEXES) {
        const match = r.exec(src);
        if (match) {
          return {
            type: "html",
            raw: match[0],
            text: match[0],
          };
        }
      }
      return false;
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore should accept boolean return value
    del(src: string) {
      const match = /^~[^~]/.exec(src);
      if (match) {
        return {
          type: "text",
          raw: "~",
          text: "~",
        };
      }
      return false;
    },
    emStrong(src: string) {
      const match = BOLD_REGEX.exec(src);
      if (match && match[1]?.length) {
        return {
          type: "strong",
          raw: match[0],
          text: match[1],
        };
      }
      const emMatch = ITALICS_REGEX.exec(src);
      if (emMatch && emMatch[1]?.length) {
        return {
          type: "em",
          raw: emMatch[0],
          text: emMatch[1],
        };
      }
      return false;
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore should accept boolean return value
    fences(src: string) {
      const newSrc = src.replace(/```$/, "\n```");
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore should accept boolean return value
      const rules = this.rules;
      const cap = (rules.block.fences as RegExp).exec(
        newSrc
      ) as RegExpExecArray;
      if (cap) {
        const raw = cap[0];
        const text = indentCodeCompensation(raw, cap[3] || "");

        return {
          type: "code",
          raw,
          lang: cap[2] ? cap[2].trim() : cap[2],
          text,
        };
      }
      return false;
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore should accept boolean return value
    inlineText(src) {
      if (src === lastSrc) {
        throw new Error(
          `Infinite loop on byte: ${src.charCodeAt(0)} of string ${src}`
        );
      }
      lastSrc = src;
      const match = INLINE_STOP_REGEX.exec(src);
      if (match) {
        const raw = src.substring(0, match.index);
        const tickMatch = raw.match(/([^`]`|`[^`])/g);
        const numberOfTicks = (tickMatch || []).length;
        if (numberOfTicks % 2 === 0) {
          const index = numberOfTicks > 0 ? /`/.exec(raw)?.index : match.index;
          return {
            type: "text",
            raw: src.substring(0, index),
            text: src.substring(0, index),
          };
        }
      }
      const attribute = ATTRIBUTE_REGEX.exec(src);
      if (attribute) {
        const raw = attribute[0];
        const numberOfTicks = (raw.match(/([^`]`|`[^`])/g) || []).length;
        if (numberOfTicks % 2 === 0) {
          const page = attribute[1];
          const href = this.context().pagesToHrefs?.(page);
          const text = `${page}:`;
          if (href) {
            return {
              type: "strong",
              raw,
              text,
              tokens: [
                {
                  type: "link",
                  raw: text,
                  text,
                  href,
                  tokens: [
                    {
                      type: "text",
                      raw: text,
                      text,
                    },
                  ],
                },
              ],
            };
          } else {
            return {
              type: "strong",
              raw,
              text,
              tokens: [
                {
                  type: "text",
                  raw: text,
                  text,
                },
              ],
            };
          }
        }
      }
      return false;
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore should accept boolean return value
    codespan(src) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore should accept boolean return value
      const cap = this.rules.inline.code.exec(src);
      if (cap) {
        if (cap[0].startsWith("```")) {
          return {
            type: "codespan",
            raw: cap[0],
            text: cap[0],
          };
        }
      }
      return false;
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore should accept boolean return value
    link(src) {
      // hijacking link for html elements with tokens
      for (const { rgx, title } of HTML_WITH_CHILD_REGEXES) {
        const match = rgx.exec(src);
        if (match) {
          return {
            type: "link",
            raw: match[0],
            text: match[1],
            title,
          };
        }
      }

      const context = this.context();
      if (TAG_REGEX.test(src)) {
        const match = XRegExp.matchRecursive(src, "#?\\[\\[", "\\]\\]", "i", {
          valueNames: ["between", "left", "match", "right"],
        });
        const raw = match.map((m) => m.value).join("");
        if (context.pagesToHrefs) {
          const text = match[1].value;
          const href = context.pagesToHrefs(text);
          if (href) {
            return {
              type: "link",
              raw,
              href,
              text,
              title: `tag:${text}`,
            };
          } else {
            return {
              type: "text",
              raw,
              text,
            };
          }
        } else {
          return {
            type: "text",
            raw,
            text: raw,
          };
        }
      }

      const hashMatch = HASHTAG_REGEX.exec(src);
      if (hashMatch) {
        const raw = hashMatch[0];
        if (context.pagesToHrefs) {
          const text = hashMatch[1];
          const href = context.pagesToHrefs(text);
          if (href) {
            return {
              type: "link",
              raw,
              href,
              text,
              title: `tag:${text}`,
            };
          } else {
            return {
              type: "text",
              raw,
              text,
            };
          }
        } else {
          return {
            type: "text",
            raw,
            text: raw,
          };
        }
      }

      const aliasMatch = ALIAS_REGEX.exec(src);
      if (aliasMatch) {
        const raw = aliasMatch[0];
        if (context.pagesToHrefs) {
          const text = aliasMatch[1];
          const href = context.pagesToHrefs(aliasMatch[2]);
          if (href) {
            return {
              type: "link",
              raw,
              href,
              text,
              title: "alias",
            };
          } else {
            return {
              type: "text",
              raw,
              text,
            };
          }
        } else {
          return {
            type: "text",
            raw,
            text: raw,
          };
        }
      }

      const aliasRefMatch = ALIAS_REF_REGEX.exec(src);
      if (aliasRefMatch) {
        const raw = aliasRefMatch[0];
        const text = aliasRefMatch[1];
        const ref = aliasRefMatch[2];
        const href = context.pagesToHrefs?.(
          context.blockReferences?.(ref)?.page || "",
          ref
        );
        if (href) {
          return {
            type: "link",
            raw,
            href,
            text,
            title: "alias",
          };
        } else {
          return {
            type: "text",
            raw,
            text,
          };
        }
      }
      return false;
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore should acce
    context: () => ({} as RoamContext),
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore should be optional
  renderer: {
    link(href: string, title?: string, text?: string): string | false {
      if (title === "alias") {
        const html = this.link(href, undefined, text);
        if (html) {
          return html.replace("href=", 'class="rm-alias" href=');
        }
      } else if (title?.startsWith("tag:")) {
        const html = this.link(href, undefined, text);
        if (html) {
          return html.replace(
            "href=",
            `class="rm-page-ref" data-tag="${title.substring(4)}" href=`
          );
        }
      } else if (title === "highlight") {
        return `<span class="rm-highlight">${text}</span>`;
      } else if (title === "blockquote") {
        return `<blockquote class="rm-bq">${text}</blockquote>`;
      } else if (href.startsWith("https://twitter.com") && text === href) {
        const tweetId = TWEET_STATUS_REGEX.exec(href)?.[1];
        const options = {
          dnt: false,
          frame: false,
          hideCard: false,
          hideThread: true,
          id: tweetId,
          lang: "en",
          theme: "light",
          width: "550px",
        };
        if (tweetId) {
          return `<div>
  <iframe scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" class="" style="position: static; visibility: visible; width: ${
    options.width
  }; height: ${
            options.width
          }; display: block; flex-grow: 1; pointer-events: auto;" title="Twitter Tweet" src="https://platform.twitter.com/embed/Tweet.html?${new URLSearchParams(
            Object.fromEntries(
              Object.entries(options).map(([k, v]) => [k, `${v}`])
            )
          )
            .toString()
            .replace(/&/g, "&amp;")}" data-tweet-id="${tweetId}"></iframe>
  <script>const cs = document.currentScript;
const iframe = cs.previousElementSibling;
const tweetId = iframe.getAttribute('data-tweet-id');
const renderTweet = () => {
  const container = cs.parentElement;
  container.style.height = '${options.width}';
  window['twttr'].ready().then(({widgets}) => 
    widgets.createTweetEmbed(tweetId, cs.parentElement, ${JSON.stringify(
      options
    )})).then(() => {
      iframe.remove();
      cs.remove();
      container.style.height = 'unset';
    });
}
const twttr = window['twttr']
if (!(twttr && twttr.ready)) {
  var s = document.createElement('script');
  s.setAttribute('src', "https://platform.twitter.com/widgets.js");
  s.onload = renderTweet;
  document.body.appendChild(s);
} else {
  renderTweet()
}
</script>
</div>`;
        }
      }
      return false;
    },
    codespan(code: string) {
      const match = CODESPAN_REGEX.exec(code);
      if (match) {
        const nodes = refractor.highlight(match[2], match[1]);
        return `<pre><code class="language-${match[1]}">${toHtml(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          nodes
        )}</code></pre>`;
      }
      return false;
    },
    strong: (text: string) => `<span class="rm-bold">${text}</span>`,
    em: (text: string) => `<em class="rm-italics">${text}</em>`,
    html(text: string) {
      if (TODO_REGEX.test(text)) {
        return RENDERED_TODO;
      } else if (DONE_REGEX.test(text)) {
        return RENDERED_DONE;
      } else if (HR_REGEX.test(text)) {
        return "<hr>";
      } else if (IFRAME_REGEX.test(text)) {
        const match = IFRAME_REGEX.exec(text);
        return `<div class="rm-iframe-container"><iframe src="${match?.[1]}" frameborder="0" class="rm-iframe"></iframe></div>`;
      } else if (HIGHLIGHT_REGEX.test(text)) {
        const match = HIGHLIGHT_REGEX.exec(text);
        return `<span class="rm-highlight">${match?.[1]}</span>`;
      } else if (BUTTON_REGEX.test(text)) {
        const match = BUTTON_REGEX.exec(text)?.[1] || "";
        const afterColon = BUTTON_REGEX.exec(text)?.[2];
        const context = this.context();
        return (
          context.components?.(match, afterColon) ||
          defaultComponents(match, afterColon) ||
          `<button class="bp3-button">${match}</button>`
        );
      } else if (BLOCK_REF_REGEX.test(text)) {
        const match = BLOCK_REF_REGEX.exec(text)?.[1] || "";
        const context = this.context();
        const blockRefInfo = context.blockReferences?.(match);
        if (!blockRefInfo) {
          return text;
        }
        const page = blockRefInfo.page || "";
        const blockText = parseInline(blockRefInfo.text || "", context);
        if (!page) return blockText;
        const href = context.pagesToHrefs?.(page, match);
        return `<a class="rm-block-ref" href="${href}">${blockText}</a>`;
      } else if (BQ_REGEX.test(text)) {
        const match = BQ_REGEX.exec(text);
        return `<blockquote class="rm-bq">${match?.[1]}</blockquote>`;
      } else {
        return text;
      }
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore should acce
    context: () => ({} as RoamContext),
  },
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore should accept boolean return value
marked.use(opts);

export type RoamContext = {
  pagesToHrefs?: (page: string, uid?: string) => string;
  components?: (c: string, ac?: string) => string | false;
  blockReferences?: (ref: string) => { text: string; page: string };
};
const contextualize = <T>(method: (text: string) => T) => (
  text: string,
  context?: RoamContext
): T => {
  opts.tokenizer.context = () => ({
    ...context,
  });
  opts.renderer.context = () => ({
    ...context,
  });
  lastSrc = "";
  return method(text);
};

export const inlineLexer = contextualize((s) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore types are out of date
  Lexer.lexInline(s)
);
export const lexer = contextualize(marked.lexer);
export const parseInline = contextualize(marked.parseInline);
export default contextualize<string>(marked);
