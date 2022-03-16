export type Condition = {
  relation: string;
  source: string;
  target: string;
  uid: string;
  not: boolean;
};

export type Selection = {
  text: string;
  label: string;
  uid: string;
};

export type Result = { text: string; uid: string } & Record<
  string,
  string | number | Date
>;
