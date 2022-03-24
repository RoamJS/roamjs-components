import type {
  DatalogAndClause,
  DatalogArgument,
  DatalogBinding,
  DatalogClause,
  DatalogFnArg,
} from "../types";

const compileDatalog = (
  d:
    | DatalogClause
    | DatalogAndClause
    | DatalogArgument
    | DatalogFnArg
    | DatalogBinding,
  level: number
): string => {
  switch (d.type) {
    case "data-pattern":
      return `[${
        d.srcVar ? `${compileDatalog(d.srcVar, level)} ` : ""
      }${d.arguments.map((a) => compileDatalog(a, level)).join(" ")}]`;
    case "srcvar":
      return `$${d.value.replace(/\s/g, "")}`;
    case "constant":
    case "underscore":
      return d.value;
    case "variable":
      return `?${d.value.replace(/\s/g, "")}`;
    case "fn-expr":
      return `[(${d.fn} ${d.arguments
        .map((a) => compileDatalog(a, level))
        .join(" ")}) ${compileDatalog(d.binding, level)}]`;
    case "pred-expr":
      return `[(${d.pred} ${d.arguments
        .map((a) => compileDatalog(a, level))
        .join(" ")})]`;
    case "rule-expr":
      return `[${
        d.srcVar ? `${compileDatalog(d.srcVar, level)} ` : ""
      }${d.arguments.map((a) => compileDatalog(a, level)).join(" ")}]`;
    case "not-clause":
      return `[${
        d.srcVar ? `${compileDatalog(d.srcVar, level)} ` : ""
      }not ${d.clauses.map((a) => compileDatalog(a, level + 1)).join(" ")}]`;
    case "or-clause":
      return `[${
        d.srcVar ? `${compileDatalog(d.srcVar, level)} ` : ""
      }or ${d.clauses.map((a) => compileDatalog(a, level + 1)).join(" ")}]`;
    case "and-clause":
      return `(and ${d.clauses.map((c) => compileDatalog(c, level + 1))})`;
    case "not-join-clause":
      return `[${
        d.srcVar ? `${compileDatalog(d.srcVar, level)} ` : ""
      }not-join [${d.variables.map((v) =>
        compileDatalog(v, level)
      )}] ${d.clauses.map((a) => compileDatalog(a, level + 1)).join(" ")}]`;
    case "or-join-clause":
      return `[${
        d.srcVar ? `${compileDatalog(d.srcVar, level)} ` : ""
      }or-join [${d.variables.map((v) => compileDatalog(v, level))}] ${d.clauses
        .map((a) => compileDatalog(a, level + 1))
        .join(" ")}]`;
    default:
      return "";
  }
};

export default compileDatalog;
