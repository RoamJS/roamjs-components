import * as components from "./components";
import * as date from "./date";
import * as dom from "./dom";
import * as events from "./events";
import * as hooks from "./hooks";
import * as marked from "./marked";
import * as queries from "./queries";
import * as types from "./types";
import * as util from "./util";
import * as writes from "./writes";

window.roamjs = window.roamjs || {
  extension: {},
  dynamicElements: new Set(),
  version: {},
  loaded: new Set(["components"]),
};

window.roamjs.extension.components = {
  components,
  date,
  dom,
  events,
  hooks,
  marked,
  queries,
  types,
  util,
  writes,
};