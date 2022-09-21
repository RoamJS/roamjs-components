import React from "react";
import type { InputTextNode } from "../../types/native";
import type { ExternalLoginOptions } from "../ExternalLogin";

export type OauthField = {
  type: "oauth";
  defaultValue?: [];
  options: ExternalLoginOptions;
};

export type FieldPanel<T extends UnionField, U = Record<string, unknown>> = ((
  props: {
    order: number;
    uid?: string;
    parentUid: string;
  } & Omit<Field<T>, "Panel"> &
    U
) => React.ReactElement) & { type: T["type"] };

export type TextField = {
  type: "text";
  defaultValue?: string;
  options?: {
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  };
};

export type TimeField = {
  type: "time";
  defaultValue?: Date;
};

export type NumberField = {
  type: "number";
  defaultValue?: number;
};

export type FlagField = {
  type: "flag";
  defaultValue?: boolean;
  options?: {
    onChange?: (f: boolean, e: React.FormEvent<HTMLInputElement>) => void;
  };
};

export type MultiTextField = {
  type: "multitext";
  defaultValue?: string[];
  options?: {
    placeholder?: string;
  };
};

export type PagesField = {
  type: "pages";
  defaultValue?: string[];
};

export type SelectField = {
  type: "select";
  defaultValue?: string;
  options: {
    items: string[] | (() => string[]);
  };
};

export type BlockField = {
  type: "block";
  defaultValue?: InputTextNode;
};

export type BlocksField = {
  type: "blocks";
  defaultValue?: InputTextNode[];
};

export type CustomField = {
  type: "custom";
  defaultValue?: InputTextNode[];
  options: {
    component: React.FC<{
      parentUid: string;
      uid: string;
      defaultValue: InputTextNode[];
      title: string;
    }>;
  };
};

export type ArrayField =
  | PagesField
  | MultiTextField
  | CustomField
  | BlocksField;
export type UnionField =
  | ArrayField
  | TextField
  | TimeField
  | NumberField
  | OauthField
  | FlagField
  | SelectField
  | BlockField;

export type Field<T extends UnionField> = Omit<T, "type"> & {
  title: string;
  description: string;
  Panel: FieldPanel<T>;
};
