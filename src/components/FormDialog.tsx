import {
  Button,
  Checkbox,
  Classes,
  Dialog,
  InputGroup,
  Intent,
  Label,
  NumericInput,
  Spinner,
  SpinnerSize,
} from "@blueprintjs/core";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import getTextByBlockUid from "../queries/getTextByBlockUid";
import createOverlayRender from "../util/createOverlayRender";
import type { RoamOverlayProps } from "../util/renderOverlay";
import BlockInput from "./BlockInput";
import MenuItemSelect from "./MenuItemSelect";
import PageInput from "./PageInput";
import nanoid from "nanoid";
import { getUids } from "../dom";
import { InputTextNode, PullBlock } from "../types";
import getFullTreeByParentUid from "../queries/getFullTreeByParentUid";
import createPage from "../writes/createPage";
import { createBlock } from "../writes";

type Props<T> = {
  title?: React.ReactNode;
  content?: React.ReactNode;
  onSubmit?: (data: T) => Promise<unknown> | unknown;
  submitButtonText?: string;
  cancelButtonText?: string;
  fields?: Record<
    string,
    (
      | {
          defaultValue?: string;
          type: "text";
        }
      | {
          defaultValue?: number;
          type: "number";
        }
      | {
          defaultValue?: string;
          type: "select";
          options?: string[];
        }
      | {
          defaultValue?: string;
          type: "page";
        }
      | {
          defaultValue?: string;
          type: "block";
        }
      | {
          defaultValue?: boolean;
          type: "flag";
        }
      | {
          defaultValue?: InputTextNode[];
          type: "embed";
        }
    ) & { label?: string; conditional?: string }
  >;
};

const EmbedInput = ({
  defaultValue,
  onChange,
  autoFocus,
}: {
  defaultValue?: InputTextNode[];
  onChange: (s: () => InputTextNode[]) => void;
  autoFocus: boolean;
}) => {
  const defaultEmbed = useMemo(() => defaultValue || [], [defaultValue]);
  const elRef = useRef<HTMLDivElement>(null);
  const parentUid = useMemo(window.roamAlphaAPI.util.generateUID, []);
  const realFocus = useCallback(() => {
    if (!elRef.current) return;
    const block = elRef.current.querySelector<
      HTMLDivElement | HTMLTextAreaElement
    >(`div[id*="block-input"],textarea[id*="block-input"]`);
    if (document.activeElement === block) return;
    if (block?.id === "block-input-ghost")
      createBlock({ parentUid, node: { text: "" } }).then(() =>
        setTimeout(realFocus, 500)
      );
    const { windowId, blockUid } = getUids(block);
    if (blockUid)
      window.roamAlphaAPI.ui.setBlockFocusAndSelection({
        location: {
          "block-uid": blockUid,
          "window-id": windowId,
        },
      });
  }, [elRef]);
  useEffect(() => {
    const el = elRef.current;
    if (el) {
      createPage({
        uid: parentUid,
        title: nanoid(),
        tree: defaultEmbed,
      }).then(() => {
        window.roamAlphaAPI.ui.components.renderPage({
          uid: parentUid,
          el,
          hideMentions: true,
        });
        if (autoFocus) realFocus();
      });
      // In the future, we can return the whole tree of data from `parentUid`
      onChange(() => getFullTreeByParentUid(parentUid).children);
      return () => {
        window.roamAlphaAPI.deletePage({ page: { uid: parentUid } });
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }, [
    elRef,
    defaultEmbed,
    autoFocus,
    realFocus,
    parentUid,
    // Triggering infinite rerender
    // onChange
  ]);
  return (
    <>
      <style>{`div.rm-autocomplete__results {
  z-index: 1000;
}
.roamjs-form-embed div div:has(> h1.rm-title-display),
.roamjs-form-embed .rm-api-render--page > div:has(.rm-reference-main) {
  display: none;
}`}</style>
      <div
        ref={elRef}
        className="rounded-md bg-white font-normal mt-1 bp3-input h-32 overflow-scroll roamjs-form-embed py-2 px-4"
        tabIndex={0}
        onFocus={realFocus}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const { blockUid } = getUids(e.target as HTMLTextAreaElement);
          const { [":block/order"]: order, [":block/parents"]: parents } =
            window.roamAlphaAPI.pull(
              "[:block/order {:block/parents [:block/uid]}]",
              [":block/uid", blockUid]
            ) as PullBlock;
          if (
            !(
              order === 0 &&
              parents?.length === 1 &&
              parents[0][":block/uid"] === parentUid
            )
          )
            return;
          e.stopPropagation();
          e.preventDefault();
          const label = elRef.current?.parentElement;
          if (!label) return;
          const nextElToFocus = e.shiftKey
            ? label.previousElementSibling ||
              label
                .closest(".bp3-dialog")
                ?.querySelector(".bp3-dialog-footer .bp3-button")
            : label.nextElementSibling ||
              label
                .closest(".bp3-dialog")
                ?.querySelector(
                  ".bp3-dialog-footer .bp3-button.bp3-intent-primary"
                );
          if (!nextElToFocus) return;
          const focusQuery = "input,button";
          if (nextElToFocus.matches(focusQuery))
            (nextElToFocus as HTMLElement).focus();
          else nextElToFocus.querySelector<HTMLElement>(focusQuery)?.focus();
        }}
      />
    </>
  );
};

const FormDialog = <T extends Record<string, unknown>>({
  title,
  content,
  isOpen,
  onClose,
  onSubmit = () => Promise.resolve(),
  fields = {},
  submitButtonText = "Submit",
  cancelButtonText = "Cancel",
}: RoamOverlayProps<Props<T>>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<T>(
    () =>
      Object.fromEntries(
        Object.entries(fields)
          .filter(([, meta]) => typeof meta.defaultValue !== "undefined")
          .map(([key, meta]) => [key, meta.defaultValue])
      ) as T
  );
  const onClick = useCallback(
    () =>
      Promise.resolve(
        onSubmit(
          Object.fromEntries(
            Object.entries(data)
              .filter(([key]) => {
                const { conditional } = fields[key];
                return !conditional || !!data[conditional];
              })
              .map(
                ([key, value]) =>
                  [key, typeof value === "function" ? value() : value] as const
              )
          ) as T
        )
      )
        .then(onClose)
        .catch((e) => {
          setError(e.message);
          setLoading(false);
        }),
    [data, onClose, setError, setLoading]
  );
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      enforceFocus={!title}
      autoFocus={!title}
    >
      <div className={Classes.DIALOG_BODY}>
        {content}
        {Object.entries(fields).map(([name, meta], index) => {
          if (meta.conditional && !data[meta.conditional]) {
            return <div key={name} />;
          }
          if (meta.type === "text") {
            return (
              <Label key={name} className={`roamjs-field-${name}`}>
                {meta.label}
                <InputGroup
                  value={data[name] as string}
                  onChange={(e) =>
                    setData({
                      ...data,
                      [name]: e.target.value,
                    })
                  }
                  autoFocus={index === 0}
                />
              </Label>
            );
          } else if (meta.type === "number") {
            return (
              <Label key={name} className={`roamjs-field-${name}`}>
                {meta.label}
                <NumericInput
                  value={data[name] as string}
                  onChange={(e) =>
                    setData({
                      ...data,
                      [name]: e.target.value,
                    })
                  }
                  autoFocus={index === 0}
                />
              </Label>
            );
          } else if (meta.type === "flag") {
            return (
              <Checkbox
                label={meta.label}
                value={data[name] as string}
                onChange={(e) =>
                  setData({
                    ...data,
                    [name]: (e.target as HTMLInputElement).checked,
                  })
                }
                key={name}
                autoFocus={index === 0}
                className={`roamjs-field-${name}`}
              />
            );
          } else if (meta.type === "select") {
            return (
              <Label key={name} className={`roamjs-field-${name}`}>
                {meta.label}
                <MenuItemSelect
                  activeItem={data[name] as string}
                  onItemSelect={(e) =>
                    setData({
                      ...data,
                      [name]: e,
                    })
                  }
                  items={meta.options || []}
                  ButtonProps={{
                    autoFocus: index === 0,
                  }}
                />
              </Label>
            );
          } else if (meta.type === "page") {
            return (
              <Label key={name} className={`roamjs-field-${name}`}>
                {meta.label}
                <PageInput
                  key={name}
                  value={data[name] as string}
                  setValue={(e) =>
                    setData({
                      ...data,
                      [name]: e,
                    })
                  }
                  autoFocus={index === 0}
                />
              </Label>
            );
          } else if (meta.type === "block") {
            return (
              <Label key={name} className={`roamjs-field-${name}`}>
                {meta.label}
                <BlockInput
                  value={
                    getTextByBlockUid(data[name] as string) ||
                    (data[name] as string)
                  }
                  setValue={(text, uid) =>
                    setData({
                      ...data,
                      [name]: window.roamAlphaAPI.pull("[:db/id]", [
                        ":block/uid",
                        uid || "",
                      ])
                        ? uid
                        : text,
                    })
                  }
                  autoFocus={index === 0}
                />
              </Label>
            );
          } else if (meta.type === "embed") {
            return (
              <Label key={name} className={`roamjs-field-${name}`}>
                {meta.label}
                <EmbedInput
                  defaultValue={meta.defaultValue}
                  onChange={(value) => {
                    setData({
                      ...data,
                      [name]: value,
                    });
                  }}
                  autoFocus={index === 0}
                />
              </Label>
            );
          } else {
            return <div key={name} />;
          }
        })}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={`${Classes.DIALOG_FOOTER_ACTIONS} items-center flex-row-reverse`}>
          <Button
            text={submitButtonText}
            intent={Intent.PRIMARY}
            onClick={onClick}
            disabled={loading}
            className="flex-shrink-0"
          />
          <Button
            text={cancelButtonText}
            onClick={onClose}
            disabled={loading}
            className="flex-shrink-0"
          />
          <span className="text-red-700 flex-grow">{error}</span>
          {loading && <Spinner size={SpinnerSize.SMALL} />}
        </div>
      </div>
    </Dialog>
  );
};

export const render = createOverlayRender<Props<Record<string, unknown>>>(
  "form-dialog",
  FormDialog
);

export const prompt = ({
  defaultAnswer,
  question,
  title,
}: {
  title: string;
  question: string;
  defaultAnswer: string;
}) =>
  new Promise<string>((resolve) =>
    render({
      onSubmit: (data) => resolve(data.value as string),
      fields: { value: { type: "text", defaultValue: defaultAnswer } },
      title,
      content: (
        <div className="whitespace-pre-wrap font-semibold text-lg mb-4">
          {question}
        </div>
      ),
    })
  );

export default FormDialog;
