type QBClauseData = {
  relation: string;
  source: string;
  target: string;
  uid: string;
  //@deprecated
  not?: boolean;
};

type QBClause = QBClauseData & { type: "clause" };
type QBNot = QBClauseData & { type: "not" };

type QBNestedData = { conditions: Condition[] };

type QBOr = QBNestedData & {
  type: "or";
};

type QBNor = QBNestedData & {
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
