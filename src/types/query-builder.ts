export type Result = { text: string; uid: string } & Record<
  `${string}-uid`,
  string
> &
  Record<string, string | number | Date>;

export type RunQuery = (parentUid: string) => Promise<Result[]>;
export type ListActiveQueries = () => { uid: string }[];
