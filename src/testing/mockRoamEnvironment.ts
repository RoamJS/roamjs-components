import {
  DatalogClause,
  DatalogConstant,
  DatalogVariable,
  PullBlock,
  GenericQueryResult,
} from "../types/native";
import { parseEDNString } from "edn-data";
import nanoid from "nanoid";
import { JSDOM } from "jsdom";

type Graph = {
  state: Record<number, PullBlock>;
  uids: Record<string, number>;
  titles: Record<string, number>;
};

type EDNValue =
  | { key: string }
  | { sym: string }
  | string
  | EDNValue[]
  | { list: EDNValue[] }
  | { map: [EDNValue, EDNValue][] };

const initMockGraph = (): Graph => ({
  state: {},
  uids: {},
  titles: {},
});

const getDbId = () => Math.ceil(Math.random() * 1000000);

type Aggregate = { type: "aggregate" };
type DatalogPullOption =
  | { type: "as-expr"; value: string }
  | { type: "limit-expr" }
  | { type: "default-expr" };
type DatalogPullAttr =
  | DatalogConstant
  | { type: "wildcard"; value: "*" }
  | {
      type: "map-spec";
      entries: {
        key: string | DatalogPullOption;
        value: "..." | DatalogPullAttr[];
      }[];
    }
  | { type: "attr-expr"; name: string; option: DatalogPullOption };
type DatalogPullExpr = {
  type: "pull";
  variable: DatalogVariable;
  pattern:
    | { type: "pattern-name"; value: string }
    | { type: "pattern-data-literal"; value: DatalogPullAttr[] };
};
type DatalogFindElem = DatalogVariable | DatalogPullExpr | Aggregate;
type DatalogFind = { type: "rel"; elements: DatalogFindElem[] };

type NodeAssignment = { id: number };
type Assignment = Record<string, NodeAssignment | string | number | RegExp>;
const isNode = (v: Assignment[string]): v is NodeAssignment =>
  typeof v === "object" && v !== null && !(v instanceof RegExp);

type QueryResult = Record<string, unknown> | Record<string, unknown>[];
const resolvePattern = (
  pattern: DatalogPullAttr[],
  result: QueryResult,
  graph: Graph
): unknown =>
  Array.isArray(result)
    ? result.map((r) => resolvePattern(pattern, r, graph))
    : pattern.some((pat) => pat.type === "wildcard")
    ? result
    : Object.fromEntries(
        pattern.flatMap((pat): [string, unknown][] => {
          if (pat.type === "constant") {
            return [[pat.value, result[pat.value as keyof PullBlock]]];
          } else if (pat.type === "attr-expr") {
            if (pat.option.type === "as-expr") {
              return [[pat.option.value, result[pat.name as keyof PullBlock]]];
            } else {
              throw new Error(
                `Unexpected pull attribute expression type: ${pat.option.type}`
              );
            }
          } else if (pat.type === "map-spec") {
            return pat.entries.map(({ key, value }) => {
              const k =
                typeof key === "string"
                  ? key
                  : key.type === "as-expr"
                  ? key.value
                  : "";
              const nestedResult = result[k] as QueryResult | undefined;
              if (!nestedResult) return [k, []];
              if (value === "...") {
                const nestedResults = (
                  Array.isArray(nestedResult) ? nestedResult : [nestedResult]
                )
                  .map((a) => a[":db/id"])
                  .filter((id): id is number => typeof id === "number")
                  .map((id) => graph.state[id]);
                return [k, resolvePattern(pattern, nestedResults, graph)];
              } else {
                return [k, resolvePattern(value, nestedResult, graph)];
              }
            });
          } else {
            throw new Error(`Unexpected pull pattern type: ${pat.type}`);
          }
        })
      );

const fireQuery = <T extends GenericQueryResult>({
  graph,
  find,
  where,
}: {
  graph: Graph;
  find: DatalogFind;
  // return-map-spec?
  with?: DatalogVariable[];
  // inputs?
  where: DatalogClause[];
}): T[] => {
  const getAssignments = (
    where: DatalogClause[],
    initialVars = [] as string[]
  ) => {
    return where.reduce(
      (programs, clause, index) => {
        if (programs.assignments.size === 0 && index > 0) return programs;
        const reconcile = (matches: Assignment[], vars: string[]) => {
          vars.forEach((v) => programs.vars.add(v));
          programs.assignments = new Set(
            Array.from(
              new Set(
                (programs.assignments.size === 0 && index === 0
                  ? matches
                  : Array.from(programs.assignments).flatMap((dict) =>
                      matches.map((dic) => ({
                        ...dict,
                        ...dic,
                      }))
                    )
                ).map((a) =>
                  // remove duplicate assignments
                  JSON.stringify(
                    Object.entries(a).sort(([ka], [kb]) => ka.localeCompare(kb))
                  )
                )
              )
            ).map((s) => Object.fromEntries(JSON.parse(s)))
          );
        };
        if (clause.type === "data-pattern") {
          const [source, relation, target] = clause.arguments;
          if (source.type !== "variable") {
            throw new Error("Expected source type to be variable");
          }
          const sourceVar = source.value;
          if (relation.type !== "constant") {
            throw new Error("Expected relation type to be constant");
          }
          const rel = relation.value;
          const targetString = target.value.replace(/^"/, "").replace(/"$/, "");
          const targetVar = target.value;
          if (programs.vars.has(sourceVar)) {
            const newAssignments = Array.from(programs.assignments).flatMap(
              (dict): Assignment[] => {
                const sourceEntry = dict[sourceVar];
                if (!isNode(sourceEntry)) {
                  throw new Error(
                    "Expected the source variable to map to a node"
                  );
                  return [];
                }
                const sourceId = sourceEntry.id;
                if (rel === ":block/refs") {
                  throw new Error("TODO");
                  //   if (target.type !== "variable") {
                  //     throw new Error(
                  //       "Expected target for :block/refs to be a variable"
                  //     );
                  //     return [];
                  //   }
                  //   const targetEntry = dict[targetVar];
                  //   const refs = (
                  //     isNode(targetEntry)
                  //       ? [targetEntry.id]
                  //       : graph.edges.referencesByUid[sourceId] || []
                  //   ).map((ref) => ({
                  //     ...dict,
                  //     [targetVar]: { uid: ref },
                  //   }));
                  //   if (refs.length) programs.vars.add(targetVar);
                  //   return refs;
                } else if (rel === ":block/page") {
                  //   if (target.type !== "variable") {
                  //     throw new Error(
                  //       "Expected target for :block/page to be a variable"
                  //     );
                  //     return [];
                  //   }
                  //   const targetEntry = dict[targetVar];
                  //   if (graph.edges.pagesByUid[sourceId]) {
                  //     return [];
                  //   } else if (isNode(targetEntry)) {
                  //     return targetEntry.id ===
                  //       graph.edges.blocksPageByUid[sourceId]
                  //       ? [dict]
                  //       : [];
                  //   } else {
                  //     programs.vars.add(targetVar);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [targetVar]: {
                  //           uid: graph.edges.blocksPageByUid[sourceId],
                  //         },
                  //       },
                  //     ];
                  //   }
                  throw new Error("TODO");
                } else if (rel === ":node/title") {
                  const sourceTitle = graph.state[sourceId]?.[":node/title"];
                  if (target.type === "constant") {
                    if (graph.titles[targetString] === sourceId) {
                      return [dict];
                    } else {
                      return [];
                    }
                  } else if (target.type === "underscore") {
                    return [dict];
                  } else if (!sourceTitle) {
                    return [];
                  } else {
                    programs.vars.add(targetVar);
                    return [
                      {
                        ...dict,
                        [targetVar]: sourceTitle,
                      },
                    ];
                  }
                } else if (rel === ":block/children") {
                  if (target.type !== "variable") {
                    throw new Error(
                      "Expected target for :block/children to be a variable"
                    );
                  }
                  const targetEntry = dict[targetVar];
                  const children = (
                    isNode(targetEntry)
                      ? [targetEntry.id]
                      : (graph.state[sourceId]?.[":block/children"] || []).map(
                          (c) => c[":db/id"] || 0
                        )
                  ).map((id) => ({
                    ...dict,
                    [targetVar]: { id },
                  }));
                  if (children.length) programs.vars.add(targetVar);
                  return children;
                } else if (rel === ":block/parents") {
                  if (target.type !== "variable") {
                    throw new Error(
                      "Expected target for :block/parents to be a variable"
                    );
                  }
                  const targetEntry = dict[targetVar];
                  const ancestors = (
                    isNode(targetEntry)
                      ? [targetEntry.id]
                      : (graph.state[sourceId]?.[":block/parents"] || []).map(
                          (d) => d[":db/id"] || 0
                        )
                  ).map((id) => ({
                    ...dict,
                    [targetVar]: { id },
                  }));
                  if (ancestors.length) programs.vars.add(targetVar);
                  return ancestors;
                } else if (rel === ":block/string") {
                  //   if (target.type === "constant") {
                  //     if (graph.edges.blocksByUid[sourceId] === targetString) {
                  //       return [dict];
                  //     } else {
                  //       return [];
                  //     }
                  //   } else if (target.type === "underscore") {
                  //     return [dict];
                  //   } else {
                  //     programs.vars.add(targetVar);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [targetVar]: graph.edges.blocksByUid[sourceId],
                  //       },
                  //     ];
                  //   }
                  throw new Error("TODO");
                } else if (rel === ":block/heading") {
                  //   if (target.type === "constant") {
                  //     if (
                  //       graph.edges.headingsByUid[sourceId] ===
                  //       Number(targetString)
                  //     ) {
                  //       return [dict];
                  //     } else {
                  //       return [];
                  //     }
                  //   } else if (target.type === "underscore") {
                  //     return [dict];
                  //   } else {
                  //     programs.vars.add(targetVar);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [targetVar]: graph.edges.headingsByUid[sourceId],
                  //       },
                  //     ];
                  //   }
                  throw new Error("TODO");
                } else if (rel === ":create/user") {
                  //   if (target.type !== "variable") {
                  //     throw new Error(
                  //       "Expected target for :create/user to be a variable"
                  //     );
                  //     return [];
                  //   }
                  //   const targetEntry = dict[targetVar];
                  //   const userId = graph.edges.createUserByUid[sourceId];
                  //   if (isNode(targetEntry)) {
                  //     return targetEntry.id === userId ? [dict] : [];
                  //   } else {
                  //     programs.vars.add(targetVar);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [targetVar]: { uid: userId },
                  //       },
                  //     ];
                  //   }
                  throw new Error("TODO");
                } else if (rel === ":edit/user") {
                  //   if (target.type !== "variable") {
                  //     throw new Error(
                  //       "Expected target for :edit/user to be a variable"
                  //     );
                  //     return [];
                  //   }
                  //   const targetEntry = dict[targetVar];
                  //   const userId = graph.edges.editUserByUid[sourceId];
                  //   if (isNode(targetEntry)) {
                  //     return targetEntry.id === userId ? [dict] : [];
                  //   } else {
                  //     programs.vars.add(targetVar);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [targetVar]: { uid: userId },
                  //       },
                  //     ];
                  //   }
                  throw new Error("TODO");
                } else if (rel === ":create/time") {
                  //   if (target.type === "constant") {
                  //     if (
                  //       graph.edges.createTimeByUid[sourceId] ===
                  //       Number(targetString)
                  //     ) {
                  //       return [dict];
                  //     } else {
                  //       return [];
                  //     }
                  //   } else if (target.type === "underscore") {
                  //     return [dict];
                  //   } else {
                  //     programs.vars.add(targetVar);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [targetVar]: graph.edges.createTimeByUid[sourceId],
                  //       },
                  //     ];
                  //   }
                  throw new Error("TODO");
                } else if (rel === ":edit/time") {
                  //   if (target.type === "constant") {
                  //     if (
                  //       graph.edges.editTimeByUid[sourceId] ===
                  //       Number(targetString)
                  //     ) {
                  //       return [dict];
                  //     } else {
                  //       return [];
                  //     }
                  //   } else if (target.type === "underscore") {
                  //     return [dict];
                  //   } else {
                  //     programs.vars.add(targetVar);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [targetVar]: graph.edges.editTimeByUid[sourceId],
                  //       },
                  //     ];
                  //   }
                  throw new Error("TODO");
                } else if (rel === ":user/display-name") {
                  //   if (target.type === "constant") {
                  //     if (
                  //       graph.edges.userDisplayByUid[sourceId] === targetString
                  //     ) {
                  //       return [dict];
                  //     } else {
                  //       return [];
                  //     }
                  //   } else if (target.type === "underscore") {
                  //     return [dict];
                  //   } else {
                  //     programs.vars.add(targetVar);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [targetVar]: graph.edges.userDisplayByUid[sourceId],
                  //       },
                  //     ];
                  //   }
                  throw new Error("TODO");
                } else {
                  throw new Error(`Unknown rel: ${rel}`);
                }
              }
            );
            programs.assignments = new Set(newAssignments);
          } else if (
            target.type === "variable" &&
            programs.vars.has(targetVar)
          ) {
            const newAssignments = Array.from(programs.assignments).flatMap(
              (_dict) => {
                // const targetEntry = dict[targetVar];
                if (rel === ":block/refs") {
                  //   if (!isNode(targetEntry)) {
                  //     throw new Error(
                  //       "Expected the target variable to map to a node in :block/refs"
                  //     );
                  //     return [];
                  //   }
                  //   const targetId = targetEntry.id;
                  //   const refs = (
                  //     graph.edges.linkedReferencesByUid[targetId] || []
                  //   ).map((ref) => ({
                  //     ...dict,
                  //     [v]: { uid: ref },
                  //   }));
                  //   if (refs.length) programs.vars.add(v);
                  //   return refs;
                  throw new Error("TODO");
                } else if (rel === ":block/page") {
                  //   if (!isNode(targetEntry)) {
                  //     throw new Error(
                  //       "Expected the target variable to map to a node in :block/page"
                  //     );
                  //     return [];
                  //   }
                  //   const targetId = targetEntry.id;
                  //   if (!graph.edges.pagesByUid[targetId]) {
                  //     return [];
                  //   } else {
                  //     const children = Array.from(
                  //       graph.edges.descendantsByUid[targetId] || []
                  //     ).map((d) => ({
                  //       ...dict,
                  //       [v]: { uid: d },
                  //     }));
                  //     if (children.length) programs.vars.add(v);
                  //     return children;
                  //   }
                  throw new Error("TODO");
                } else if (rel === ":node/title") {
                  //   if (typeof targetEntry !== "string") {
                  //     throw new Error(
                  //       "Expected the target variable to map to a string in :block/refs"
                  //     );
                  //     return [];
                  //   }
                  //   const page = graph.edges.pageUidByTitle[targetEntry];
                  //   if (page) {
                  //     programs.vars.add(v);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [v]: { uid: page },
                  //       },
                  //     ];
                  //   }
                  //   return [];
                  throw new Error("TODO");
                } else if (rel === ":block/children") {
                  //   if (!isNode(targetEntry)) {
                  //     throw new Error(
                  //       "Expected the target variable to map to a node in :block/children"
                  //     );
                  //   }
                  //   const targetId = targetEntry.id;
                  //   const parent = graph.edges.parentByUid[targetId];
                  //   if (parent) {
                  //     programs.vars.add(v);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [v]: { uid: parent },
                  //       },
                  //     ];
                  //   } else {
                  //     return [];
                  //   }
                  throw new Error("TODO");
                } else if (rel === ":block/parents") {
                  //   if (!isNode(targetEntry)) {
                  //     throw new Error(
                  //       "Expected the target variable to map to a node in :block/parents"
                  //     );
                  //     return [];
                  //   }
                  //   const targetId = targetEntry.id;
                  //   const ancestors = Array.from(
                  //     graph.edges.ancestorsByUid[targetId] || []
                  //   ).map((child) => ({
                  //     ...dict,
                  //     [v]: { uid: child },
                  //   }));
                  //   if (ancestors.length) programs.vars.add(v);
                  //   return ancestors;
                  throw new Error("TODO");
                } else if (rel === ":block/string") {
                  //   if (typeof targetEntry !== "string") {
                  //     throw new Error(
                  //       "Expected the target variable to map to a string in :block/string"
                  //     );
                  //     return [];
                  //   }
                  //   const blocks = Object.entries(graph.edges.blocksByUid)
                  //     .filter(([_, v]) => v === targetEntry)
                  //     .map(([child]) => ({
                  //       ...dict,
                  //       [v]: { uid: child },
                  //     }));
                  //   if (blocks.length) programs.vars.add(v);
                  //   return blocks;
                  throw new Error("TODO");
                } else if (rel === ":block/heading") {
                  //   if (typeof targetEntry !== "number") {
                  //     throw new Error(
                  //       "Expected the target variable to map to a number in :block/heading"
                  //     );
                  //     return [];
                  //   }
                  //   const blocks = Object.entries(graph.edges.headingsByUid)
                  //     .filter(([_, v]) => v === targetEntry)
                  //     .map(([child]) => ({
                  //       ...dict,
                  //       [v]: { uid: child },
                  //     }));
                  //   if (blocks.length) programs.vars.add(v);
                  //   return blocks;
                  throw new Error("TODO");
                } else if (rel === ":create/user") {
                  //   if (!isNode(targetEntry)) {
                  //     throw new Error(
                  //       "Expected the target variable to map to a node in :create/user"
                  //     );
                  //   }
                  //   const targetId = targetEntry.id;
                  //   const children = Object.keys(graph.edges.createUserByUid)
                  //     .filter(
                  //       (node) => graph.edges.createUserByUid[node] === targetId
                  //     )
                  //     .map((d) => ({
                  //       ...dict,
                  //       [v]: { uid: d },
                  //     }));
                  //   if (children.length) programs.vars.add(v);
                  //   return children;
                  throw new Error("TODO");
                } else if (rel === ":edit/user") {
                  //   if (!isNode(targetEntry)) {
                  //     throw new Error(
                  //       "Expected the target variable to map to a node in :edit/user"
                  //     );
                  //   }
                  //   const targetId = targetEntry.id;
                  //   const children = Object.keys(graph.edges.editUserByUid)
                  //     .filter(
                  //       (node) =>
                  //         graph.edges.editUserByUid[Number(node)] === targetId
                  //     )
                  //     .map((d) => ({
                  //       ...dict,
                  //       [v]: { uid: d },
                  //     }));
                  //   if (children.length) programs.vars.add(v);
                  //   return children;
                  throw new Error("TODO");
                } else if (rel === ":create/time") {
                  //   if (typeof targetEntry !== "number") {
                  //     throw new Error(
                  //       "Expected the target variable to map to a number in :create/time"
                  //     );
                  //   }
                  //   const blocks = Object.entries(graph.edges.createTimeByUid)
                  //     .filter(([_, v]) => v === targetEntry)
                  //     .map(([child]) => ({
                  //       ...dict,
                  //       [v]: { uid: child },
                  //     }));
                  //   if (blocks.length) programs.vars.add(v);
                  //   return blocks;
                  throw new Error("TODO");
                } else if (rel === ":edit/time") {
                  //   if (typeof targetEntry !== "number") {
                  //     throw new Error(
                  //       "Expected the target variable to map to a number in :edit/time"
                  //     );
                  //   }
                  //   const blocks = Object.entries(graph.edges.editTimeByUid)
                  //     .filter(([_, v]) => v === targetEntry)
                  //     .map(([child]) => ({
                  //       ...dict,
                  //       [v]: { uid: child },
                  //     }));
                  //   if (blocks.length) programs.vars.add(v);
                  //   return blocks;
                  throw new Error("TODO");
                } else if (rel === ":user/display-name") {
                  //   if (typeof targetEntry !== "string") {
                  //     throw new Error(
                  //       "Expected the target variable to map to a string in :block/refs"
                  //     );
                  //   }
                  //   const displayName = targetEntry
                  //     .replace(/^"/, "")
                  //     .replace(/"$/, "");
                  //   const user = graph.edges.userUidByDisplay[displayName];
                  //   if (user) {
                  //     programs.vars.add(v);
                  //     return [
                  //       {
                  //         ...dict,
                  //         [v]: { uid: user },
                  //       },
                  //     ];
                  //   }
                  //   return [];
                  throw new Error("TODO");
                } else {
                  throw new Error(`Unknown rel: ${rel}`);
                }
              }
            );
            programs.assignments = new Set(newAssignments);
          } else {
            const matches: Assignment[] | Error =
              rel === ":children/view-type"
                ? target.type === "constant"
                  ? Object.values(graph.uids)
                      .filter(
                        (id) =>
                          graph.state[id][":children/view-type"] !==
                          targetString
                      )
                      .map((id) => ({ [sourceVar]: { id } }))
                  : target.type === "underscore"
                  ? Object.values(graph.uids).map((id) => ({
                      [sourceVar]: { id },
                    }))
                  : Object.values(graph.uids).map((id) => ({
                      [sourceVar]: { id },
                      [targetVar]:
                        graph.state[id][":children/view-type"] || ":bullet",
                    }))
                : rel === ":block/uid"
                ? target.type === "constant"
                  ? [{ [sourceVar]: { id: graph.uids[target.value] } }]
                  : target.type === "underscore"
                  ? Object.values(graph.uids).map((id) => ({
                      [sourceVar]: { id },
                    }))
                  : Object.entries(graph.uids).map(([uid, id]) => ({
                      [sourceVar]: { id },
                      [targetVar]: uid,
                    }))
                : new Error(`Unknown rel: ${rel}`);
            /*
              rel === ":block/refs"
                ? target.type !== "variable"
                  ? []
                  : Object.entries(graph.edges.referencesByUid).flatMap(
                      ([source, refs]) =>
                        refs.map((ref) => ({
                          [v]: { uid: source },
                          [targetVar]: { uid: ref },
                        }))
                    )
                : rel === ":block/page"
                ? target.type !== "variable"
                  ? []
                  : Object.entries(graph.edges.blocksPageByUid).map(
                      ([b, p]) => ({
                        [v]: { uid: b },
                        [targetVar]: { uid: p },
                      })
                    )
                : rel === ":node/title"
                ? target.type === "constant"
                  ? graph.edges.pageUidByTitle[targetString]
                    ? [
                        {
                          [v]: {
                            uid: graph.edges.pageUidByTitle[targetString],
                          },
                        },
                      ]
                    : []
                  : target.type === "underscore"
                  ? Object.values(graph.edges.pageUidByTitle).map((uid) => ({
                      [v]: { uid },
                    }))
                  : Object.entries(graph.edges.pageUidByTitle).map(
                      ([title, uid]) => ({
                        [v]: { uid },
                        [targetVar]: title,
                      })
                    )
                : rel === ":block/children"
                ? target.type !== "variable"
                  ? []
                  : Object.entries(graph.edges.childrenByUid).flatMap(
                      ([source, refs]) =>
                        refs.map((ref) => ({
                          [v]: { uid: source },
                          [targetVar]: { uid: ref },
                        }))
                    )
                : rel === ":block/parents"
                ? target.type !== "variable"
                  ? []
                  : Object.entries(graph.edges.ancestorsByUid).flatMap(
                      ([source, refs]) =>
                        Array.from(refs).map((ref) => ({
                          [v]: { uid: source },
                          [targetVar]: { uid: ref },
                        }))
                    )
                : rel === ":block/string"
                ? target.type === "constant"
                  ? Object.entries(graph.edges.blocksByUid)
                      .filter(([_, text]) => text !== targetString)
                      .map(([uid]) => ({ [v]: { uid } }))
                  : target.type === "underscore"
                  ? Object.keys(graph.edges.blocksByUid).map((uid) => ({
                      [v]: { uid },
                    }))
                  : Object.entries(graph.edges.blocksByUid).map(
                      ([uid, text]) => ({
                        [v]: { uid },
                        [targetVar]: text,
                      })
                    )
                : rel === ":block/heading"
                ? target.type === "constant"
                  ? Object.entries(graph.edges.headingsByUid)
                      .filter(([_, text]) => text !== Number(targetString))
                      .map(([uid]) => ({ [v]: { uid } }))
                  : target.type === "underscore"
                  ? Object.keys(graph.edges.headingsByUid).map((uid) => ({
                      [v]: { uid },
                    }))
                  : Object.entries(graph.edges.headingsByUid).map(
                      ([uid, text]) => ({
                        [v]: { uid },
                        [targetVar]: text,
                      })
                    )
                : rel === ":create/user"
                ? target.type !== "variable"
                  ? []
                  : Object.entries(graph.edges.createUserByUid).map(
                      ([b, p]) => ({
                        [v]: { uid: b },
                        [targetVar]: { uid: p },
                      })
                    )
                : rel === ":edit/user"
                ? target.type !== "variable"
                  ? []
                  : Object.entries(graph.edges.editUserByUid).map(([b, p]) => ({
                      [v]: { uid: b },
                      [targetVar]: { uid: p },
                    }))
                : rel === ":create/time"
                ? target.type === "constant"
                  ? Object.entries(graph.edges.createTimeByUid)
                      .filter(([_, text]) => text !== Number(targetString))
                      .map(([uid]) => ({ [v]: { uid } }))
                  : target.type === "underscore"
                  ? Object.keys(graph.edges.createTimeByUid).map((uid) => ({
                      [v]: { uid },
                    }))
                  : Object.entries(graph.edges.createTimeByUid).map(
                      ([uid, text]) => ({
                        [v]: { uid },
                        [targetVar]: text,
                      })
                    )
                : rel === ":edit/time"
                ? target.type === "constant"
                  ? Object.entries(graph.edges.editTimeByUid)
                      .filter(([_, text]) => text !== Number(targetString))
                      .map(([uid]) => ({ [v]: { uid } }))
                  : target.type === "underscore"
                  ? Object.keys(graph.edges.editTimeByUid).map((uid) => ({
                      [v]: { uid },
                    }))
                  : Object.entries(graph.edges.editTimeByUid).map(
                      ([uid, text]) => ({
                        [v]: { uid },
                        [targetVar]: text,
                      })
                    )
                : rel === ":user/display-name"
                ? target.type === "constant"
                  ? graph.edges.userUidByDisplay[targetString]
                    ? [
                        {
                          [v]: {
                            uid: graph.edges.userUidByDisplay[targetString],
                          },
                        },
                      ]
                    : []
                  : target.type === "underscore"
                  ? Object.values(graph.edges.userUidByDisplay).map((uid) => ({
                      [v]: { uid },
                    }))
                  : Object.entries(graph.edges.userUidByDisplay).map(
                      ([title, uid]) => ({
                        [v]: { uid },
                        [targetVar]: title,
                      })
                    )*/
            if (matches instanceof Error) {
              throw matches;
            }
            reconcile(
              matches,
              target.type === "variable" ? [sourceVar, targetVar] : [sourceVar]
            );
          }
        } else if (
          clause.type === "or-clause" ||
          clause.type === "or-join-clause"
        ) {
          let matches: Assignment[] = [];
          for (const cls of clause.clauses) {
            const assignments = getAssignments(
              [cls],
              Array.from(programs.vars)
            );
            if (assignments.size) {
              matches = Array.from(assignments);
              break;
            }
          }
          const vars =
            clause.type === "or-join-clause"
              ? clause.variables.map((v) => v.value)
              : Object.keys(matches[0] || {});
          const varSet = new Set(vars);
          matches.forEach((a) => {
            Object.keys(a).forEach((k) => {
              if (!varSet.has(k)) {
                delete a[k];
              }
            });
          });
          reconcile(matches, vars);
        } else if (clause.type === "and-clause") {
          const matches = Array.from(
            getAssignments(clause.clauses, Array.from(programs.vars))
          );
          reconcile(matches, Object.keys(matches[0] || {}));
        } else if (clause.type === "pred-expr") {
          if (clause.pred === "clojure.string/includes?") {
            const [variable, constant] = clause.arguments;
            if (variable?.type !== "variable") {
              throw new Error(
                "Expected type to be variable for first clojure.string/includes? argument."
              );
            }
            const v = variable.value;
            if (!programs.vars.has(v)) {
              throw new Error(
                "Expected first clojure.string/includes? argument to be predefined variable."
              );
            }
            if (constant?.type !== "constant") {
              throw new Error(
                "Expected type to be constant for second clojure.string/includes? argument."
              );
            }
            const newAssignments = Array.from(programs.assignments).flatMap(
              (dict) => {
                const sourceEntry = dict[v];
                if (typeof sourceEntry !== "string") {
                  throw new Error("Expected the variable to map to a string");
                }
                if (
                  sourceEntry.includes(
                    constant.value.replace(/^"/, "").replace(/"$/, "")
                  )
                ) {
                  return [dict];
                } else {
                  return [];
                }
              }
            );
            programs.assignments = new Set(newAssignments);
          } else if (clause.pred === "clojure.string/starts-with?") {
            const [variable, constant] = clause.arguments;
            const v = variable.value;
            if (variable?.type !== "variable") {
              throw new Error(
                "Expected type to be variable for first clojure.string/starts-with? argument."
              );
            }
            if (!programs.vars.has(v)) {
              throw new Error(
                "Expected first clojure.string/starts-with? argument to be predefined variable."
              );
            }
            if (constant?.type !== "constant") {
              throw new Error(
                "Expected type to be constant for second clojure.string/starts-with? argument."
              );
            }
            const newAssignments = Array.from(programs.assignments).flatMap(
              (dict) => {
                const sourceEntry = dict[v];
                if (typeof sourceEntry !== "string") {
                  throw new Error("Expected the variable to map to a string");
                  return [];
                }
                if (
                  sourceEntry.startsWith(
                    constant.value.replace(/^"/, "").replace(/"$/, "")
                  )
                ) {
                  return [dict];
                } else {
                  return [];
                }
              }
            );
            programs.assignments = new Set(newAssignments);
          } else if (clause.pred === "clojure.string/ends-with?") {
            const [variable, constant] = clause.arguments;
            const v = variable.value;
            if (variable?.type !== "variable") {
              throw new Error(
                "Expected type to be variable for first clojure.string/ends-with? argument."
              );
            }
            if (!programs.vars.has(v)) {
              throw new Error(
                "Expected first clojure.string/ends-with? argument to be predefined variable."
              );
            }
            if (constant?.type !== "constant") {
              throw new Error(
                "Expected type to be constant for second clojure.string/ends-with? argument."
              );
            }
            const newAssignments = Array.from(programs.assignments).flatMap(
              (dict) => {
                const sourceEntry = dict[v];
                if (typeof sourceEntry !== "string") {
                  throw new Error("Expected the variable to map to a string");
                }
                if (
                  sourceEntry.endsWith(
                    constant.value.replace(/^"/, "").replace(/"$/, "")
                  )
                ) {
                  return [dict];
                } else {
                  return [];
                }
              }
            );
            programs.assignments = new Set(newAssignments);
          } else if (clause.pred === "re-find") {
            const [regex, variable] = clause.arguments;
            const v = variable.value;
            const r = regex.value;
            if (variable?.type !== "variable") {
              throw new Error(
                "Expected type to be variable for first re-find argument."
              );
            }
            if (!programs.vars.has(v)) {
              throw new Error(
                "Expected first re-find argument to be predefined variable."
              );
            }
            if (regex?.type !== "variable") {
              throw new Error(
                "Expected type to be variable for second re-find argument."
              );
            }
            if (!programs.vars.has(r)) {
              throw new Error(
                "Expected second re-find argument to be predefined variable."
              );
            }
            const newAssignments = Array.from(programs.assignments).filter(
              (dict) => {
                const regexEntry = dict[r];
                if (!(regexEntry instanceof RegExp)) {
                  throw new Error("Expected the variable to map to a regexp");
                }
                const targetEntry = dict[v];
                if (typeof targetEntry !== "string") {
                  throw new Error("Expected the variable to map to a string");
                }
                return regexEntry.test(targetEntry);
              }
            );
            programs.assignments = new Set(newAssignments);
          } else if (clause.pred === ">") {
            const [left, right] = clause.arguments;
            const l = left.value;
            const r = right.value;
            if (left?.type === "variable" && !programs.vars.has(l)) {
              throw new Error(
                "If left argument is a variable, it must be predefined"
              );
            }
            if (right?.type === "variable" && !programs.vars.has(r)) {
              throw new Error(
                "If right argument is a variable, it must be predefined"
              );
            }
            const newAssignments = Array.from(programs.assignments).filter(
              (dict) => {
                const leftValue =
                  left.type === "constant" ? Number(left.value) : dict[r];
                if (typeof leftValue !== "number") {
                  throw new Error("Left argument must be a number");
                }
                const rightValue =
                  right.type === "constant" ? Number(right.value) : dict[r];
                if (typeof rightValue !== "number") {
                  throw new Error("Right argument must be a number");
                }
                return leftValue > rightValue;
              }
            );
            programs.assignments = new Set(newAssignments);
          } else if (clause.pred === "<") {
            const [left, right] = clause.arguments;
            const l = left.value;
            const r = right.value;
            if (left?.type === "variable" && !programs.vars.has(l)) {
              throw new Error(
                "If left argument is a variable, it must be predefined"
              );
            }
            if (right?.type === "variable" && !programs.vars.has(r)) {
              throw new Error(
                "If right argument is a variable, it must be predefined"
              );
            }
            const newAssignments = Array.from(programs.assignments).filter(
              (dict) => {
                const leftValue =
                  left.type === "constant" ? Number(left.value) : dict[r];
                if (typeof leftValue !== "number") {
                  throw new Error("Left argument must be a number");
                }
                const rightValue =
                  right.type === "constant" ? Number(right.value) : dict[r];
                if (typeof rightValue !== "number") {
                  throw new Error("Right argument must be a number");
                }
                return leftValue < rightValue;
              }
            );
            programs.assignments = new Set(newAssignments);
          } else {
            throw new Error(`Unexpected predicate ${clause.pred}`);
          }
        } else if (clause.type === "fn-expr") {
          if (clause.fn === "re-pattern") {
            const [constant] = clause.arguments;
            if (constant?.type !== "constant") {
              throw new Error(
                "Expected type to be constant for first re-pattern argument."
              );
            }
            const { binding } = clause;
            if (binding.type !== "bind-scalar") {
              throw new Error(
                "Expected type to be scalar for first re-pattern binding."
              );
            }
            const newAssignments = Array.from(programs.assignments).map(
              (dict) => {
                return {
                  ...dict,
                  [binding.variable.value]: new RegExp(
                    constant.value.replace(/^"/, "").replace(/"$/, "")
                  ),
                };
              }
            );
            programs.assignments = new Set(newAssignments);
          } else {
            throw new Error(`Unexpected fn name ${clause.fn}`);
          }
        } else {
          throw new Error(`Unexpected type ${clause.type}`);
        }
        return programs;
      },
      {
        assignments: new Set<Assignment>([]),
        vars: new Set<string>(initialVars),
      }
    ).assignments;
  };
  const assignments = getAssignments(where);
  const results = Array.from(assignments).map((res) =>
    find.elements.map((el) => {
      if (el.type === "variable") {
        const node = res[el.value];
        if (isNode(node)) {
          return node.id;
        } else if (node instanceof RegExp) {
          return node.source;
        } else {
          return node;
        }
      } else if (el.type === "pull") {
        const node = res[el.variable.value];
        if (typeof node === "undefined") {
          throw new Error(
            `Failed to find ${el.variable.value} in result: ${JSON.stringify(
              res
            )}`
          );
        }
        if (el.pattern.type === "pattern-data-literal") {
          if (isNode(node)) {
            const result = graph.state[node.id];
            return resolvePattern(el.pattern.value, result, graph);
          } else {
            throw new Error(
              `Unexpected pull variable: ${el.variable.value} - ${node}`
            );
          }
        } else {
          throw new Error(
            `Unexpected pull element pattern type: ${el.pattern.type}`
          );
        }
      }
      throw new Error(`Unexpected Find element type: ${el.type}`);
    })
  );
  return results as T[];
};

const mockQuery = <T extends GenericQueryResult>({
  graph,
  query,
}: {
  graph: Graph;
  query: string;
}): T[] => {
  const data = parseEDNString(query) as EDNValue[];
  const findIndex = data.findIndex(
    (d) => typeof d === "object" && "key" in d && d.key === "find"
  );
  const whereIndex = data.findIndex(
    (d) => typeof d === "object" && "key" in d && d.key === "where"
  );
  const findPattern = data.slice(findIndex + 1, whereIndex);
  const find: DatalogFind = {
    type: "rel",
    elements: findPattern.map((p): DatalogFind["elements"][number] => {
      if (typeof p !== "object") {
        throw new Error(
          `Unexpected type for datalog find, looking for object: ${JSON.stringify(
            p
          )}`
        );
      }
      if ("sym" in p) return { type: "variable" as const, value: p.sym };
      if ("list" in p) {
        const [pull, name, attrs] = p.list;
        if (
          typeof pull !== "object" ||
          !("sym" in pull) ||
          pull.sym !== "pull"
        ) {
          throw new Error(
            `Expected first edn value to be a pull symbol. Found: ${JSON.stringify(
              p
            )}`
          );
        }
        if (typeof name !== "object" || !("sym" in name)) {
          throw new Error(
            `Expected second edn value to be a pull symbol. Found: ${JSON.stringify(
              p
            )}`
          );
        }
        if (!Array.isArray(attrs)) {
          throw new Error(
            `Expected third edn value to be an array. Found: ${JSON.stringify(
              p
            )}`
          );
        }
        return {
          type: "pull",
          variable: { type: "variable", value: name.sym.replace(/^\?/, "") },
          pattern: {
            type: "pattern-data-literal",
            value: attrs.map((attr): DatalogPullAttr => {
              if (typeof attr === "object" && "key" in attr) {
                return {
                  type: "constant",
                  value: `:${attr.key}`,
                };
              }
              if (Array.isArray(attr)) {
                const [name, expr, option] = attr;
                if (typeof name !== "object" || !("key" in name)) {
                  throw new Error(
                    `Expected attribute expression to start with key. Found: ${JSON.stringify(
                      attr
                    )}`
                  );
                }
                if (
                  typeof expr !== "object" ||
                  !("key" in expr) ||
                  !["as", "limit", "default"].includes(expr.key)
                ) {
                  throw new Error(
                    `Expected attribute expression to have second key :as, :limit, or :default. Found: ${JSON.stringify(
                      attr
                    )}`
                  );
                }
                if (typeof option !== "string") {
                  throw new Error(
                    `Expected attribute expression to end with literal. Found: ${JSON.stringify(
                      attr
                    )}`
                  );
                }
                const pullOption: DatalogPullOption | undefined =
                  expr.key === "as"
                    ? { type: "as-expr", value: option }
                    : undefined; // should be impossible
                if (!pullOption) {
                  throw new Error(
                    `Expected attribute expression to be an \`as\` key. Found: ${JSON.stringify(
                      expr
                    )}`
                  );
                }
                return {
                  type: "attr-expr",
                  name: `:${name.key}`,
                  option: pullOption,
                };
              }
              if (typeof attr === "object" && "map" in attr) {
                return {
                  type: "map-spec",
                  entries: attr.map.map((entry) => {
                    const [key, value] = entry;
                    if (typeof key !== "object" || !("key" in key)) {
                      throw new Error(
                        `Unexpected pattern map key. Found: ${JSON.stringify(
                          entry
                        )}`
                      );
                    }
                    if (
                      typeof value !== "object" ||
                      !("sym" in value) ||
                      value.sym !== "..."
                    ) {
                      throw new Error(
                        `Unexpected pattern map value. Found: ${JSON.stringify(
                          entry
                        )}`
                      );
                    }
                    return {
                      key: `:${key.key}`,
                      value: value.sym,
                    };
                  }),
                };
              }
              throw new Error(
                `Unexpected pattern literal attribute. Found: ${JSON.stringify(
                  attr
                )}`
              );
            }),
          },
        };
      }
      throw new Error(
        `Unexpected object for datalog find: ${JSON.stringify(p)}`
      );
    }),
  };
  const wherePattern = data.slice(whereIndex + 1);
  const toDatalog = (e: EDNValue): DatalogClause => {
    if (Array.isArray(e)) {
      if (e.length === 3) {
        return {
          type: "data-pattern",
          arguments: e.map((a) => {
            if (typeof a === "object") {
              if ("key" in a) {
                return {
                  type: "constant",
                  value: `:${a.key}`,
                };
              } else if ("sym" in a) {
                return {
                  type: "variable",
                  value: a.sym.slice(1),
                };
              } else {
                throw new Error(
                  `Expected data-pattern argument to come from non array EDN: ${JSON.stringify(
                    a
                  )}`
                );
              }
            } else {
              return {
                type: "constant",
                value: a,
              };
            }
          }),
        };
      }
    }
    throw new Error(`Unknown value for datalog clause: ${JSON.stringify(e)}`);
  };
  const where = wherePattern.map(toDatalog);
  return fireQuery<T>({ graph, find, where });
};

const mockRoamEnvironment = () => {
  const graph = initMockGraph();
  const dom = new JSDOM();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.window = dom.window;
  global.document = dom.window.document;
  global.window.roamAlphaAPI = {
    ...global.window.roamAlphaAPI,
    pull: (_, id) => {
      const pick = (node: PullBlock) => {
        // TODO - process exp
        return node;
      };
      if (Array.isArray(id)) {
        const [attr, val] = id;
        if (attr === ":block/uid") {
          return pick(graph.state[graph.uids[val]]);
        } else if (attr === ":node/title") {
          return pick(graph.state[graph.titles[val]]);
        } else {
          throw new Error(`Attr is not supported: ${attr}`);
        }
      } else if (typeof id === "number") {
        return pick(graph.state[id]);
      } else {
        throw new Error(`Id is not supported: ${id}`);
      }
    },
    q: <T extends GenericQueryResult>(
      query: string,
      ..._params: any[]
    ): T[] => {
      return mockQuery<T>({ graph, query });
    },
    createBlock: async (action) => {
      if (!action.block) throw new Error(`block field is required`);
      if (!action.location) throw new Error(`location field is required`);
      const parent = graph.uids[action.location["parent-uid"]];
      if (!parent)
        throw new Error(
          `Could not find parent by uid: ${action.location["parent-uid"]}`
        );
      const parentBlock = graph.state[parent];
      const id = getDbId();
      const block = {
        ":block/string": action.block.string,
        ":block/uid":
          action.block.uid || window.roamAlphaAPI.util.generateUID(),
        ":block/parents": ([{ ":db/id": parent }] as PullBlock[]).concat(
          parentBlock[":block/parents"] || []
        ),
        ":db/id": id,
        ":block/order": action.location.order,
      };
      graph.uids[block[":block/uid"]] = id;
      parentBlock[":block/children"] = (
        parentBlock[":block/children"] || []
      ).concat({ ":db/id": id });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      graph.state[id] = block;
    },
    updateBlock: async (action) => {
      if (!action.block) throw new Error(`block field is required`);
      if (!action.block.uid) throw new Error(`block uid is required`);
      const block = graph.uids[action.block.uid];
      if (!block) {
        throw new Error(`Could not find block by uid: ${action.block.uid}`);
      }
      if (typeof action.block.string !== "undefined") {
        graph.state[block][":block/string"] = action.block.string;
      }
      if (typeof action.block.open !== "undefined") {
        graph.state[block][":block/open"] = action.block.open;
      }
      if (typeof action.block.heading !== "undefined") {
        graph.state[block][":block/heading"] = action.block.heading;
      }
      if (typeof action.block["text-align"] !== "undefined") {
        graph.state[block][":block/text-align"] = action.block["text-align"];
      }
      if (typeof action.block["children-view-type"] !== "undefined") {
        graph.state[block][
          ":children/view-type"
        ] = `:${action.block["children-view-type"]}`;
      }
    },
    createPage: async (action) => {
      if (!action.page) throw new Error(`page field is required`);
      if (!action.page.title) throw new Error(`page title field is required`);
      const id = getDbId();
      const page = {
        ":node/title": action.page.title,
        ":block/uid": action.page.uid || window.roamAlphaAPI.util.generateUID(),
        ":db/id": id,
      };
      graph.titles[action.page.title] = id;
      graph.uids[page[":block/uid"]] = id;
      graph.state[id] = page;
    },
  };
  global.window.roamAlphaAPI.data = {
    ...global.window.roamAlphaAPI.data,
    fast: {
      q: (query, ..._params) => {
        return mockQuery({ graph, query });
      },
    },
  };
  global.window.roamAlphaAPI.util = {
    ...global.window.roamAlphaAPI.util,
    generateUID: () => nanoid().slice(0, 9),
  };
};

export default mockRoamEnvironment;
