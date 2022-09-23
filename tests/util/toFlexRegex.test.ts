import toFlexRegex from "../../src/util/toFlexRegex";
import { test, expect } from "@playwright/test";

test("toFlexRegex - Handles keys with parens", () => {
  const key = "Hello (World)";
  expect(toFlexRegex(key).test(key)).toBe(true);
});
