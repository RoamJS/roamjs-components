import { createConfigObserver } from "../src";

test("Renders Package", () => {
  createConfigObserver({ title: "roam/js/test", config: { tabs: [] } });
});
