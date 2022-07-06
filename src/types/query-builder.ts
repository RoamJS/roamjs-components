import { DatalogClause, PullBlock, RoamBasicNode } from "./native";

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

export type Result = { text: string; uid: string } & Record<
  string,
  string | number | Date
>;

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

export type QBResultsView = (props: {
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
}) => JSX.Element;

export type ParseQuery = (q: RoamBasicNode | string) => {
  returnNode: string;
  conditions: Condition[];
  selections: Selection[];
  returnNodeUid: string;
  conditionsNodesUid: string;
  selectionsNodesUid: string;
};

export type FireQuery = (query: {
  returnNode: string;
  conditions: Condition[];
  selections: Selection[];
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
}) => void;
