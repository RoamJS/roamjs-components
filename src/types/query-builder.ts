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
