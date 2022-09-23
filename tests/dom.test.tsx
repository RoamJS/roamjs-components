import getUidsFromId from "../src/dom/getUidsFromId";
import { test, expect } from "@playwright/test";

test("getUidsFromId", () => {
  const { blockUid, windowId } = getUidsFromId(
    "block-input-gxCw10dD79O6yRGXFYiqBvd1doo1-body-outline-06-15-2022-_-xhP9myA"
  );
  expect(blockUid).toBe("_-xhP9myA");
  expect(windowId).toBe("gxCw10dD79O6yRGXFYiqBvd1doo1-body-outline-06-15-2022");
});
