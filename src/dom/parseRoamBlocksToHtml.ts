import { getParseInline, RoamContext } from "../marked";
import type { TreeNode, ViewType } from "../types";

const VIEW_CONTAINER = {
  bullet: "ul",
  document: "div",
  numbered: "ol",
};
const HEADINGS = ["p", "h1", "h2", "h3"];

const parseRoamBlocksToHtml = async ({
  content,
  viewType,
  level,
  context,
}: {
  level: number;
  context: Required<RoamContext>;
  content: TreeNode[];
  viewType: ViewType;
}): Promise<string> => {
  if (content.length === 0) {
    return "";
  }
  const parseInline = await getParseInline();
  const items = content.map(async (t) => {
    let skipChildren = false;
    const componentsWithChildren = (
      s: string,
      ac?: string
    ): string | false => {
      const parent = context.components(s, ac);
      if (parent) {
        return parent;
      } else if (/table/i.test(s)) {
        skipChildren = true;
        const flatten = (n: TreeNode): TreeNode[][] =>
          n.children.length
            ? n.children
                .map((c) => flatten(c))
                .flatMap((c) => c.map((cc) => [n, ...cc]))
            : [[n]];
        const rows = flatten(t).map((row) =>
          row.slice(1).map(
            (td) =>
              `<td>${parseInline(td.text, {
                ...context,
                components: componentsWithChildren,
              })}</td`
          )
        );
        const columns = Math.max(...rows.map((row) => row.length), 0);
        const fill = Array<string>(columns).fill("<td></td>");
        const normalizedRows = rows.map((row) =>
          [...row, ...fill.slice(0, columns - row.length)].join("")
        );
        return `<table class="roam-table"><tbody>${normalizedRows
          .map((row) => `<tr>${row}</tr>`)
          .join("")}</tbody></table>`;
      } else if (/roam\/render/i.test(s)) {
        skipChildren = true;
        const acCode = ac || "";
        return `<div class="roam-render">${acCode}</div>`;
      }
      return false;
    };
    const classlist =
      t.textAlign === "left"
        ? ["text-align-left"]
        : t.textAlign === "center"
        ? ["text-align-center"]
        : t.textAlign === "right"
        ? ["text-align-right"]
        : [];
    const textToParse = t.text.replace(/#\.([^\s]*)/g, (_, className) => {
      classlist.push(className);
      return "";
    });
    const inlineMarked = await parseInline(textToParse, {
      ...context,
      components: componentsWithChildren,
    });
    const innerHtml = `<${HEADINGS[t.heading]}>${inlineMarked}</${
      HEADINGS[t.heading]
    }>\n${
      skipChildren
        ? ""
        : parseRoamBlocksToHtml({
            content: t.children,
            viewType: t.viewType,
            level: level + 1,
            context,
          })
    }`;
    if (level > 0 && viewType === "document") {
      classlist.push("document-bullet");
    }
    const attrs = `id="${t.uid}"${
      classlist.length ? ` class="${classlist.join(" ")}"` : ""
    }`;
    const blockHtml =
      level === 0 && viewType === "document"
        ? `<div ${attrs}>${innerHtml}</div>`
        : `<li ${attrs}>${innerHtml}</li>`;
    return blockHtml;
  });
  const containerTag =
    level > 0 && viewType === "document" ? "ul" : VIEW_CONTAINER[viewType];
  return `<${containerTag}>${items.join("\n")}</${containerTag}>`;
};

export default parseRoamBlocksToHtml;
