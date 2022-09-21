import { DatalogClause, PullBlock, RoamBasicNode } from "./native";
import type { Filters } from "../components/Filter";

type QBBase = { uid: string };

export type QBClauseData = {
  relation: string;
  source: string;
  target: string;
  //@deprecated
  not?: boolean;
} & QBBase;
export type QBNestedData = { conditions: Condition[][] } & QBBase;

export type QBClause = QBClauseData & { type: "clause" };
export type QBNot = QBClauseData & { type: "not" };

export type QBOr = QBNestedData & {
  type: "or";
};
export type QBNor = QBNestedData & {
  type: "not or";
};

export type Condition = QBClause | QBNot | QBOr | QBNor;

export type Selection = {
  text: string;
  label: string;
  uid: string;
};

export type ExportTypes = {
  name: string;
  callback: (args: {
    filename: string;
    graph: string;
  }) => Promise<{ title: string; content: string }[]>;
}[];

export type RegisterSelection = (args: {
  test: RegExp;
  pull: (a: {
    returnNode: string;
    match: RegExpExecArray;
    where: DatalogClause[];
  }) => string;
  mapper: (
    r: PullBlock,
    key: string,
    result: Result
  ) =>
    | Result[string]
    | Record<string, Result[string]>
    | Promise<Result[string] | Record<string, Result[string]>>;
}) => void;

export type ResultsViewComponent = (props: {
  parentUid: string;
  header?: React.ReactNode;
  results: Result[];
  hideResults?: boolean;
  resultFilter?: (r: Result) => boolean;
  ctrlClick?: (e: Result) => void;
  preventSavingSettings?: boolean;
  preventExport?: boolean;
  onEdit?: () => void;
  onRefresh?: () => void;
  getExportTypes?: (r: Result[]) => ExportTypes;
  onResultsInViewChange?: (r: Result[]) => void;
  globalFiltersData?: Record<string, Filters>;
  globalPageSize?: number;
}) => JSX.Element;

export type ExportDialogComponent = (props: {
  onClose: () => void;
  isOpen: boolean;
  exportTypes: ExportTypes;
  results: Result[] | (() => Promise<Result[]>);
}) => JSX.Element;
export type QueryEditorComponent = (props: {
  parentUid: string;
  onQuery?: () => void;
  defaultReturnNode?: string;
}) => JSX.Element;
export type QueryPageComponent = (props: {
  pageUid: string;
  configUid?: string;
  defaultReturnNode?: string;
  getExportTypes?: (r: Result[]) => ExportTypes;
  globalFiltersData?: Record<string, Filters>;
  globalPageSize?: number;
  hideMetadata?: boolean;
}) => JSX.Element;

export type ParseQuery = (q: RoamBasicNode | string) => {
  returnNode: string;
  conditions: Condition[];
  selections: Selection[];
  customNode: string;
  returnNodeUid: string;
  conditionsNodesUid: string;
  selectionsNodesUid: string;
  customNodeUid: string;
  isCustomEnabled: boolean;
  isBackendEnabled: boolean;
};

export type FireQuery = (query: {
  returnNode: string;
  conditions: Condition[];
  selections: Selection[];
  isBackendEnabled: boolean;
}) => Promise<Result[]>;

export type ConditionToDatalog = (condition: Condition) => DatalogClause[];

export type RegisterDatalogTranslator = (args: {
  key: string;
  callback: (args: {
    source: string;
    target: string;
    uid: string;
  }) => DatalogClause[];
  targetOptions?: string[] | ((source: string) => string[]);
  placeholder?: string;
  isVariable?: true;
}) => void;

// ALL TYPES ABOVE THIS COMMENT ARE SCHEDULED TO MOVE BACK INTO QUERY BUILDER AS INTERNAL

export type Result = { text: string; uid: string } & Record<
  `${string}-uid`,
  string
> &
  Record<string, string | number | Date>;

export type RunQuery = (parentUid: string) => Promise<Result[]>;
export type ListActiveQueries = () => { uid: string }[];
