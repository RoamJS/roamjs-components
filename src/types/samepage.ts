type json =
  | string
  | number
  | boolean
  | null
  | { toJSON: () => string }
  | json[]
  | { [key: string]: json };

export type SamePageApi = {
  addGraphListener: (args: {
    operation: string;
    handler: (e: json, graph: string) => void;
  }) => void;
  removeGraphListener: (args: { operation: string }) => void;
  sendToGraph: (args: {
    graph: string;
    operation: string;
    data?: { [k: string]: json };
  }) => void;
};
