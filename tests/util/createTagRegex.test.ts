import createTagRegex from "../../src/util/createTagRegex";
import { test, expect } from "@playwright/test";

test("createTagRegex - Matches simple tag", () => {
  const regex = createTagRegex("test");
  expect("[[test]]").toMatch(regex);
  expect("#test").toMatch(regex);
  expect("#[[test]]").toMatch(regex);
});

test("createTagRegex - Matches tag with special characters", () => {
  const regex = createTagRegex("test.*()+?[]");
  expect("[[test.*()+?[]]]").toMatch(regex);
  expect("#test.*()+?[]").toMatch(regex);
  expect("#[[test.*()+?[]]]").toMatch(regex);
});

test("createTagRegex - Complex nested structures", () => {
  const cases = [
    "note with [[brackets]]",
    "[[note]] with * and . and ?",
    "[[EVD]] - Discourse Graph Evidence - [[@source]]",
    "[[EVD]] - #tags here",
  ];

  cases.forEach((content) => {
    const regex = createTagRegex(content);
    expect(`[[${content}]]`).toMatch(regex);
    expect(`#${content}`).toMatch(regex);
    expect(`#[[${content}]]`).toMatch(regex);
  });
});

test("createTagRegex - Handles special regex characters", () => {
  const cases = [
    "test.note", // dot
    "v1*", // asterisk
    "question?", // question mark
    "tag+", // plus
    "note[1]", // brackets
    "path/to/note", // forward slash
    "note\\path", // backslash
    "(parentheses)", // parentheses
    "{curly}", // curly braces
    "tag|another", // pipe
    "^start", // caret
    "end$", // dollar
  ];

  cases.forEach((tag) => {
    const regex = createTagRegex(tag);
    expect(`[[${tag}]]`).toMatch(regex);
    expect(`#${tag}`).toMatch(regex);
    expect(`#[[${tag}]]`).toMatch(regex);
  });
});

test("createTagRegex - Does not match partial tags", () => {
  const regex = createTagRegex("test");
  expect("testing").not.toMatch(regex);
  expect("#testing").not.toMatch(regex);
  expect("[[testing]]").not.toMatch(regex);
});
