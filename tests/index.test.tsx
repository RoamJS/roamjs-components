import React from "react";
import { render } from "@testing-library/react";
import { createConfigObserver } from "../src/components/ConfigPage";

test("Renders Package", () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Not setting this whole object. Might one day build roam-jest
  window.roamAlphaAPI = {};
  window.roamAlphaAPI.q = () => [[{ uid: "exists" }]];
  window.roamAlphaAPI.pull = () => ({});
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Not setting this whole object. Might one day build roam-jest
  window.roamAlphaAPI.util = {
    generateUID: () => "abcdefghi"
  }
  render(<div className="roam-body" />);
  createConfigObserver({ title: "roam/js/test", config: { tabs: [] } });
});
