import React from 'react';
import { render } from "@testing-library/react";
import { createConfigObserver } from "../src";

test("Renders Package", () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Not setting this whole object get out. Might one day build roam-jest
  window.roamAlphaAPI = {};
  window.roamAlphaAPI.q = () => [["exists"]];
  render(<div className="roam-body" />);
  createConfigObserver({ title: "roam/js/test", config: { tabs: [] } });
});
