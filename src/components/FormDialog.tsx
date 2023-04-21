import {
  Button,
  Checkbox,
  Classes,
  Dialog,
  InputGroup,
  Intent,
  Label,
  NumericInput,
} from "@blueprintjs/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import getTextByBlockUid from "../queries/getTextByBlockUid";
import createOverlayRender from "../util/createOverlayRender";
import type { RoamOverlayProps } from "../util/renderOverlay";
import BlockInput from "./BlockInput";
import MenuItemSelect from "./MenuItemSelect";
import PageInput from "./PageInput";
import nanoid from "nanoid";

type Props<T> = {
  title?: React.ReactNode;
  content?: React.ReactNode;
  onSubmit?: (data: T) => Promise<unknown> | unknown;
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
          defaultValue?: string;
          type: "embed";
        }
    ) & { label?: string }
  >;
};

const EmbedInput = ({
  defaultValue = "",
  onChange,
}: {
  defaultValue?: string;
  onChange: (s: () => string) => void;
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (elRef.current && !loaded) {
      const uid = window.roamAlphaAPI.util.generateUID();
      const parentUid = window.roamAlphaAPI.util.generateUID();
      window.roamAlphaAPI.createPage({
        page: { uid: parentUid, title: nanoid() },
      });
      window.roamAlphaAPI.createBlock({
        location: {
          "parent-uid": parentUid,
          order: 0,
        },
        block: { uid, string: defaultValue },
      });
      window.roamAlphaAPI.ui.components.renderBlock({
        uid,
        el: elRef.current,
      });
      // In the future, we can return the whole tree of data from `parentUid`
      onChange(() => getTextByBlockUid(uid));
      setLoaded(true);
      return () => {
        window.roamAlphaAPI.deleteBlock({ block: { uid } });
        window.roamAlphaAPI.deletePage({ page: { uid: parentUid } });
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }, [elRef, defaultValue, onChange, setLoaded, loaded]);
  return (
    <div
      ref={elRef}
      className="rounded-md bg-white font-normal mt-1 bp3-input h-auto h-32 overflow-scroll"
    >
      <style>{`div.rm-autocomplete__results {
  z-index: 1000;
}`}</style>
    </div>
  );
};

const FormDialog = <T extends Record<string, unknown>>({
  title,
  content,
  isOpen,
  onClose,
  onSubmit = () => Promise.resolve(),
  fields = {},
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
            Object.entries(data).map(
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
        {Object.entries(fields).map(([name, meta]) => {
          if (meta.type === "text") {
            return (
              <Label>
                {meta.label}
                <InputGroup
                  value={data[name] as string}
                  onChange={(e) =>
                    setData({
                      ...data,
                      [name]: e.target.value,
                    })
                  }
                />
              </Label>
            );
          } else if (meta.type === "number") {
            return (
              <Label>
                {meta.label}
                <NumericInput
                  value={data[name] as string}
                  onChange={(e) =>
                    setData({
                      ...data,
                      [name]: e.target.value,
                    })
                  }
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
              />
            );
          } else if (meta.type === "select") {
            return (
              <Label>
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
                />
              </Label>
            );
          } else if (meta.type === "page") {
            return (
              <Label>
                {meta.label}
                <PageInput
                  value={data[name] as string}
                  setValue={(e) =>
                    setData({
                      ...data,
                      [name]: e,
                    })
                  }
                />
              </Label>
            );
          } else if (meta.type === "block") {
            return (
              <Label>
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
                />
              </Label>
            );
          } else if (meta.type === "embed") {
            return (
              <Label>
                {meta.label}
                <EmbedInput
                  defaultValue={meta.defaultValue}
                  onChange={(value) => {
                    setData({
                      ...data,
                      [name]: value,
                    });
                  }}
                />
              </Label>
            );
          } else {
            return <></>;
          }
        })}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <span className="text-red-700">{error}</span>
          <Button text={"Cancel"} onClick={onClose} disabled={loading} />
          <Button
            text={"Submit"}
            intent={Intent.PRIMARY}
            onClick={onClick}
            disabled={loading}
          />
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
