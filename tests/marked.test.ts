import run, { inlineLexer, lexer, parseInline } from "../src/marked";
import fs from "fs";

test("Runs Default", () => {
  const md = `- A **bolded** text
- An __italicized__ text
- A ^^highlighted^^ text
- A ~~strikethrough~~ text
- A **bolded ** text
- A ** bolded** text
- An __italicized __ text
- __italicized __ text
- A {{[[TODO]]}} This is a todo block
- A {{[[DONE]]}} This is a done block
- \`\`\`javascript
console.log("Render");
console.log("this");
console.log("block");
\`\`\``;

  fs.writeFileSync("debug.json", JSON.stringify(lexer(md), null, 4));
  expect(run(md)).toBe(`<ul>
<li>A <span class="rm-bold">bolded</span> text</li>
<li>An <em class="rm-italics">italicized</em> text</li>
<li>A <span class="rm-highlight">highlighted</span> text</li>
<li>A <del>strikethrough</del> text</li>
<li>A <span class="rm-bold">bolded </span> text</li>
<li>A <span class="rm-bold"> bolded</span> text</li>
<li>An <em class="rm-italics">italicized </em> text</li>
<li><em class="rm-italics">italicized </em> text</li>
<li>A <span><label class="check-container"><input type="checkbox" disabled=""><span class="checkmark"></span></label></span> This is a todo block</li>
<li>A <span><label class="check-container"><input type="checkbox" checked="" disabled=""><span class="checkmark"></span></label></span> This is a done block</li>
<li><pre><code class="language-javascript">console.log(&quot;Render&quot;);
console.log(&quot;this&quot;);
console.log(&quot;block&quot;);
</code></pre>
</li>
</ul>
`);
});

test("Runs code block without newline", () => {
  const md = `- \`\`\`javascript
console.log("Render");
console.log("this");
console.log("block");\`\`\``;

  fs.writeFileSync("debug.json", JSON.stringify(lexer(md), null, 4));
  expect(run(md)).toBe(`<ul>
<li><pre><code class="language-javascript">console.log(&quot;Render&quot;);
console.log(&quot;this&quot;);
console.log(&quot;block&quot;);
</code></pre>
</li>
</ul>
`);
});

test("Runs buttons", () => {
  const md = `- {{pull references}}`;

  fs.writeFileSync("debug.json", JSON.stringify(lexer(md), null, 4));
  expect(run(md)).toBe(`<ul>
<li><button class="bp3-button">pull references</button></li>
</ul>
`);
});

test("Custom components buttons", () => {
  const md = `- {{component}}
- {{no component}}`;

  const context = {
    components: (c: string) => c === "component" && `<p>component</p>`,
  };

  fs.writeFileSync("debug.json", JSON.stringify(lexer(md), null, 4));
  expect(run(md, context)).toBe(`<ul>
<li><p>component</p></li>
<li><button class="bp3-button">no component</button></li>
</ul>
`);
});

test("Runs queries", () => {
  const md = `- {{[[query]]: {and:{or:[[TODO]] [[DONE]]} [[January 26th, 2021]]}}}`;

  fs.writeFileSync("debug.json", JSON.stringify(lexer(md), null, 4));
  expect(run(md)).toBe(`<ul>
<li><button class="bp3-button">query</button></li>
</ul>
`);
});

test("Runs tags as links", () => {
  const md = `- Started with [[Hello World]]
- Then #Vargas is my last name
- This [[Page]] has no href`;

  const pages = {
    "Hello World": "/hello-world",
    Vargas: "/asdfasdf",
  } as { [key: string]: string };
  const context = {
    pagesToHrefs: (tag: string) => pages[tag],
  };
  fs.writeFileSync("debug.json", JSON.stringify(lexer(md, context), null, 4));
  expect(run(md, context)).toBe(`<ul>
<li>Started with <a class="rm-page-ref" data-tag="Hello World" href="/hello-world">Hello World</a></li>
<li>Then <a class="rm-page-ref" data-tag="Vargas" href="/asdfasdf">Vargas</a> is my last name</li>
<li>This Page has no href</li>
</ul>
`);
});

test("Links without context is just text", () => {
  const md = `- Started with [[Hello World]]
- Then #Vargas is my last name
- This [[Page]] has no href`;

  fs.writeFileSync("debug.json", JSON.stringify(lexer(md), null, 4));
  expect(run(md)).toBe(`<ul>
<li>Started with [[Hello World]]</li>
<li>Then #Vargas is my last name</li>
<li>This [[Page]] has no href</li>
</ul>
`);
});

test("Double tag on context", () => {
  const md = `- Started with [[Hello World]] [[Page]]`;
  const context = {
    pagesToHrefs: (t: string) => `/${t.toLowerCase().replace(" ", "-")}`,
  };
  fs.writeFileSync("debug.json", JSON.stringify(lexer(md, context), null, 4));
  expect(run(md, context)).toBe(`<ul>
<li>Started with <a class="rm-page-ref" data-tag="Hello World" href="/hello-world">Hello World</a> <a class="rm-page-ref" data-tag="Page" href="/page">Page</a></li>
</ul>
`);
});

test("Nested Links", () => {
  const md = `- One type of [[[[Nested]] Links]]
- And another [[Example [[Nested]] Link]]
- A Final [[Link [[Nested]]]]`;
  const pages = {
    "[[Nested]] Links": "/start",
    "Example [[Nested]] Link": "/middle",
    "Link [[Nested]]": "/end",
    Nested: "/nested",
  } as { [key: string]: string };
  const context = {
    pagesToHrefs: (tag: string) => pages[tag],
  };

  fs.writeFileSync("debug.json", JSON.stringify(lexer(md, context), null, 4));
  expect(run(md, context)).toBe(`<ul>
<li>One type of <a class="rm-page-ref" data-tag="[[Nested]] Links" href="/start"><a class="rm-page-ref" data-tag="Nested" href="/nested">Nested</a> Links</a></li>
<li>And another <a class="rm-page-ref" data-tag="Example [[Nested]] Link" href="/middle">Example <a class="rm-page-ref" data-tag="Nested" href="/nested">Nested</a> Link</a></li>
<li>A Final <a class="rm-page-ref" data-tag="Link [[Nested]]" href="/end">Link <a class="rm-page-ref" data-tag="Nested" href="/nested">Nested</a></a></li>
</ul>
`);
});

test("Renders iframe", () => {
  const md = `- {{iframe:https://givebutter.com/roamjs}}`;
  fs.writeFileSync("debug.json", JSON.stringify(lexer(md), null, 4));
  expect(run(md)).toBe(`<ul>
<li><div class="rm-iframe-container"><iframe src="https://givebutter.com/roamjs" frameborder="0" class="rm-iframe"></iframe></div></li>
</ul>
`);
});

test("Renders page aliases", () => {
  const md = `- Resolve an alias [Page]([[Hello World]])
- An invalid [alias](wat)`;
  const context = {
    pagesToHrefs: (t: string) => `/${t.toLowerCase().replace(" ", "-")}`,
  };
  fs.writeFileSync("debug.json", JSON.stringify(lexer(md, context), null, 4));
  expect(run(md, context)).toBe(`<ul>
<li>Resolve an alias <a class="rm-alias" href="/hello-world">Page</a></li>
<li>An invalid <a href="wat">alias</a></li>
</ul>
`);
});

test("Renders Roam Attributes", () => {
  const md = `- Known:: Attribute value
- Unexpected:: just bold`;
  const pages: { [t: string]: string } = { Known: "/known" };
  const context = {
    pagesToHrefs: (t: string) => pages[t],
  };
  fs.writeFileSync("debug.json", JSON.stringify(lexer(md, context), null, 4));
  expect(run(md, context)).toBe(`<ul>
<li><span class="rm-bold"><a href="/known">Known:</a></span> Attribute value</li>
<li><span class="rm-bold">Unexpected:</span> just bold</li>
</ul>
`);
});

test("Render block references", () => {
  const md = `- A known reference ((123456789))
- An unknown reference ((abcdefghi))
- An known with unknown page ((asdfghjkl))
- A known alias reference [number alias](((123456789)))
- An unknown alias reference [letter alias](((abcdefghi)))`;
  const pages: { [t: string]: string } = { Number: "/number" };
  const blockReferences: { [t: string]: { text: string; page: string } } = {
    "123456789": {
      text: "A number block",
      page: "Number",
    },
    asdfghjkl: {
      text: "linked content",
      page: "",
    },
  };
  const context = {
    pagesToHrefs: (t: string, r?: string) =>
      pages[t] ? (r ? `${pages[t]}#${r}` : pages[t]) : "",
    blockReferences: (t: string) => blockReferences[t],
  };
  fs.writeFileSync("debug.json", JSON.stringify(lexer(md, context), null, 4));
  expect(run(md, context)).toBe(`<ul>
<li>A known reference <a class="rm-block-ref" href="/number#123456789">A number block</a></li>
<li>An unknown reference ((abcdefghi))</li>
<li>An known with unknown page linked content</li>
<li>A known alias reference <a class="rm-alias" href="/number#123456789">number alias</a></li>
<li>An unknown alias reference letter alias</li>
</ul>
`);
});

test("Render videos", () => {
  const md = `- {{[[youtube]]: https://www.youtube.com/embed/cQ25hHAPZk0}}
- {{video: https://www.youtube.com/embed/cQ25hHAPZk0}}`;
  const pages: { [t: string]: string } = { Known: "/known" };
  const context = {
    pagesToHrefs: (t: string) => pages[t],
  };
  fs.writeFileSync("debug.json", JSON.stringify(lexer(md, context), null, 4));
  expect(run(md, context)).toBe(`<ul>
<li><div class="rm-iframe-container"><iframe src="https://www.youtube.com/embed/cQ25hHAPZk0" class="rm-iframe rm-video-player"></iframe></div></li>
<li><div class="rm-iframe-container"><iframe src="https://www.youtube.com/embed/cQ25hHAPZk0" class="rm-iframe rm-video-player"></iframe></div></li>
</ul>
`);
});

test("Render hrs", () => {
  const md = `---`;
  fs.writeFileSync("debug.json", JSON.stringify(lexer(md), null, 4));
  expect(parseInline(md)).toBe(`<hr>`);
});

test("Incomplete Tag", () => {
  const md = `- [[Incomplete]`;
  fs.writeFileSync("debug.json", JSON.stringify(lexer(md), null, 4));
  expect(run(md)).toBe(`<ul>
<li>[[Incomplete]</li>
</ul>
`);
});

test("Roam Render", () => {
  const md = `{{roam/render: ((sketching))}}`;
  fs.writeFileSync("debug.json", JSON.stringify(lexer(md), null, 4));
  expect(parseInline(md)).toBe(
    `<button class="bp3-button">roam/render</button>`
  );
});

test("Inline Code Blocks", () => {
  const md = `\`\`\`css
body {
  background-color: red;
}\`\`\``;
  fs.writeFileSync("debug.json", JSON.stringify(inlineLexer(md), null, 4));
  expect(parseInline(md)).toBe(
    `<pre><code class="language-css"><span class="token selector">body</span> <span class="token punctuation">{</span>
  <span class="token property">background-color</span><span class="token punctuation">:</span> <span class="token color">red</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code></pre>`
  );
});

test("Inline Code Spans", () => {
  const md = `Here is \`a code\` span`;
  fs.writeFileSync("debug.json", JSON.stringify(inlineLexer(md), null, 4));
  expect(parseInline(md)).toBe(`Here is <code>a code</code> span`);
});

test("Blockquote", () => {
  const md = "> an **important** aside";
  fs.writeFileSync("debug.json", JSON.stringify(inlineLexer(md), null, 4));
  expect(parseInline(md)).toBe(
    `<blockquote class="rm-bq">an <span class="rm-bold">important</span> aside</blockquote>`
  );
});

test("Long underscore", () => {
  const md = "[[__________ wat]]";
  const pages: { [t: string]: string } = {
    "__________ wat": "/___________wat",
  };
  const context = {
    pagesToHrefs: (t: string) => pages[t],
  };
  fs.writeFileSync(
    "debug.json",
    JSON.stringify(inlineLexer(md, context), null, 4)
  );
  expect(parseInline(md, context)).toBe(
    `<a class="rm-page-ref" data-tag="__________ wat" href="/___________wat">__________ wat</a>`
  );
});

test("Double left paren", () => {
  const md = "This block has two left parens ((but should still parse)";
  fs.writeFileSync("debug.json", JSON.stringify(inlineLexer(md), null, 4));
  expect(parseInline(md)).toBe(
    `This block has two left parens ((but should still parse)`
  );
});

test("Single tilde", () => {
  const md = "This ~~has strikethrough~~ but ~this does~ not.";
  fs.writeFileSync("debug.json", JSON.stringify(inlineLexer(md), null, 4));
  expect(parseInline(md)).toBe(
    `This <del>has strikethrough</del> but ~this does~ not.`
  );
});

test("Special chars", () => {
  const md = "« So much happening! »";
  fs.writeFileSync("debug.json", JSON.stringify(inlineLexer(md), null, 4));
  expect(parseInline(md)).toBe(`« So much happening! »`);
});

test("Special chars in inline code", () => {
  const md = "The `build` has a `url/{{github.number}}`.";
  fs.writeFileSync("debug.json", JSON.stringify(inlineLexer(md), null, 4));
  expect(parseInline(md)).toBe(
    `The <code>build</code> has a <code>url/{{github.number}}</code>.`
  );
});

test("Inline before special Inline character", () => {
  const md =
    "There is a RoamJS component called `PageInput`, which you could find as part of the [roamjs-components](https://github.com/dvargas92495/roamjs-components) library.";
  fs.writeFileSync("debug.json", JSON.stringify(inlineLexer(md), null, 4));
  expect(parseInline(md)).toBe(
    `There is a RoamJS component called <code>PageInput</code>, which you could find as part of the <a href="https://github.com/dvargas92495/roamjs-components">roamjs-components</a> library.`
  );
});

test("Link weirdness", () => {
  const md =
    "I have three links [distributed systems](https://en.wikipedia.org/wiki/Distributed_computing), [decentralized finance](https://en.wikipedia.org/wiki/Decentralized_finance), and [algorithmic trading]([[algorithmic trading]]). And another link [Martin](https://martin.ai/) and a final link [[Go]].";
  fs.writeFileSync("debug.json", JSON.stringify(inlineLexer(md), null, 4));
  expect(parseInline(md)).toBe(
    `I have three links <a href="https://en.wikipedia.org/wiki/Distributed_computing">distributed systems</a>, <a href="https://en.wikipedia.org/wiki/Decentralized_finance">decentralized finance</a>, and [algorithmic trading]([[algorithmic trading]]). And another link <a href="https://martin.ai/">Martin</a> and a final link [[Go]].`
  );
});
