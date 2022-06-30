import addStyle from "../dom/addStyle";

type RunReturn = {
  elements?: HTMLElement[];
  observers?: MutationObserver[];
  domListeners?: (
    | {
        el: Window;
        type: keyof WindowEventMap;
        listener: (
          this: Window,
          ev: WindowEventMap[keyof WindowEventMap]
        ) => void;
      }
    | {
        el: Document;
        type: keyof DocumentEventMap;
        listener: (
          this: Document,
          ev: DocumentEventMap[keyof DocumentEventMap]
        ) => void;
      }
    | {
        el: HTMLElement;
        type: keyof HTMLElementEventMap;
        listener: (
          this: HTMLElement,
          ev: HTMLElementEventMap[keyof HTMLElementEventMap]
        ) => void;
      }
  )[];
  commands?: string[];
  timeouts?: { timeout: number }[];
};

const runExtension = (
  args:
    | string
    | {
        roamMarketplace?: boolean;
        extensionId: string;
        run?: () => void | Promise<void> | RunReturn | Promise<RunReturn>;
        unload?: () => void | Promise<void>;
      },

  // @deprecated both args
  _run: () => void | Promise<void> = Promise.resolve
): void | { onload: () => void; onunload: () => void } => {
  const extensionId = typeof args === "string" ? args : args.extensionId;
  const run = typeof args === "string" ? _run : args.run;
  const roamMarketplace =
    typeof args === "string"
      ? false
      : args.roamMarketplace || process.env.ROAM_MARKETPLACE === "true";
  const unload = typeof args === "string" ? () => Promise.resolve : args.unload;

  let loaded: RunReturn | undefined | void = undefined;
  const onload = () => {
    if (window.roamjs?.loaded?.has?.(extensionId)) {
      return;
    }
    window.roamjs = {
      loaded: window.roamjs?.loaded || new Set(),
      extension: window.roamjs?.extension || {},
      version: window.roamjs?.version || {},
      actions: {},
    };
    window.roamjs.loaded.add(extensionId);
    window.roamjs.version[extensionId] =
      process.env.ROAMJS_VERSION || process.env.NODE_ENV || "";

    addStyle(
      `.bp3-button:focus {
    outline-width: 2px;
  }`,
      "roamjs-default"
    );

    const result = run?.();
    const dispatch = () => {
      document.body.dispatchEvent(new Event(`roamjs:${extensionId}:loaded`));
    };
    Promise.resolve(result).then((res) => {
      dispatch();
      loaded = res;
    });
  };

  const onunload = () => {
    unload?.();
    if (loaded) {
      (loaded.elements || []).forEach((e) => e.remove());
      (loaded.observers || []).forEach((e) => e.disconnect());
      (loaded.domListeners || []).forEach((e) =>
        e.el.removeEventListener(e.type, e.listener)
      );
      (loaded.commands || []).forEach((label) =>
        window.roamAlphaAPI.ui.commandPalette.removeCommand({ label })
      );
      (loaded.timeouts || []).forEach((e) => window.clearTimeout(e.timeout));
    }
    delete window.roamjs?.version[extensionId];
    window.roamjs?.loaded.delete(extensionId);
    if (!window.roamjs?.loaded.size) {
      document.getElementById("roamjs-default")?.remove();
    }
    // how to handle adding RoamJS token command? it's own extension depending on dependency management?
  };
  if (roamMarketplace) {
    return {
      onload,
      onunload,
    };
  } else {
    return onload();
  }
};

export default runExtension;
