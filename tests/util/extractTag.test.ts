import extractTag from "../../src/util/extractTag";

test("extractTag - Handles default case", () => {
  const key = "[[Hello, World]]";
  expect(extractTag(key)).toBe("Hello, World");
});

test("extractTag - Handles nested case", () => {
  const key = "[[Hello, [[my]] World]]";
  expect(extractTag(key)).toBe("Hello, [[my]] World");
});

test("extractTag - Handles page title with nested titles at ends", () => {
  const key = "[[Hello]] [[World]]";
  expect(extractTag(key)).toBe(key);
});
