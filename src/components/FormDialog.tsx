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
import React, { useCallback, useState } from "react";
import { RoamOverlayProps } from "../util/createOverlayRender";
import BlockInput from "./BlockInput";
import MenuItemSelect from "./MenuItemSelect";
import PageInput from "./PageInput";

const FormDialog = <T extends Record<string, unknown>>({
  isOpen,
  onClose,
  onSubmit = () => Promise.resolve(),
  fields = {},
}: RoamOverlayProps<{
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
    ) & { label?: string }
  >;
}>) => {
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
      Promise.resolve(onSubmit(data))
        .then(onClose)
        .catch((e) => {
          setError(e.message);
          setLoading(false);
        }),
    [data, onClose, setError, setLoading]
  );
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className={Classes.DIALOG_BODY}>
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

export default FormDialog;
