import { Tooltip, Position, Popover, Button, Icon } from "@blueprintjs/core";
import React, { useCallback, useRef, useState, useMemo } from "react";
import fuzzy from "fuzzy";

export type Filters = {
  includes: Record<string, Set<string>>;
  excludes: Record<string, Set<string>>;
};

const Filter = ({
  data,
  initialValue,
  onChange,
  renderButtonText = (s) =>
    s ? s.toString() : <i style={{ opacity: 0.5 }}>(Empty)</i>,
  includeHelpMessage = "Only include these values",
  excludeHelpMessage = "Exclude these values",
  small,
}: {
  initialValue?: Filters;
  data: Record<string, string[]>;
  onChange: (filters: Filters) => void;
  renderButtonText?: (s: string, key: string) => React.ReactNode;
  includeHelpMessage?: string;
  excludeHelpMessage?: string;
  small?: boolean;
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const closeFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, [setIsFilterOpen]);
  const initialFiltersValue = useMemo(
    () => ({
      includes: Object.fromEntries(
        Object.keys(data).map((k) => [
          k,
          new Set<string>(
            data[k].filter(
              (d) => initialValue && initialValue.includes[k].has(d)
            )
          ),
        ])
      ),
      excludes: Object.fromEntries(
        Object.keys(data).map((k) => [
          k,
          new Set<string>(
            data[k].filter(
              (d) => initialValue && initialValue.excludes[k].has(d)
            )
          ),
        ])
      ),
    }),
    [initialValue, data]
  );
  const filtersRef = useRef(initialFiltersValue);
  const [filters, setFilters] = useState(filtersRef.current);
  const [filterSearch, setFilterSearch] = useState("");
  const active =
    Object.keys(filters.includes).some((k) => filters.includes[k].size > 0) ||
    Object.keys(filters.excludes).some((k) => filters.excludes[k].size > 0);
  return (
    <Tooltip content={"Filters"} position={Position.BOTTOM}>
      <Popover
        target={
          <Button
            icon={
              <Icon icon={"filter"} color={active ? "#a82a2a" : "#5c7080"} />
            }
            onClick={(e) => {
              e.stopPropagation();
              setIsFilterOpen(!isFilterOpen);
            }}
            className={`roamjs-filter ${active ? "roamjs-filter-active" : ""}`}
            minimal
            small={small}
          />
        }
        content={
          <div
            style={{ maxWidth: 600, maxHeight: 245, overflowY: "scroll" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 500,
                maxWidth: "90vw",
                transition: "all 300ms ease-in 0s",
                padding: 8,
              }}
            >
              <div className="flex-h-box">
                <div
                  style={{
                    flex: "1 1 100%",
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingLeft: 4,
                  }}
                >
                  <div>
                    <strong>Includes</strong>
                    <span style={{ marginLeft: 4, fontSize: 12 }}>
                      Click to Add
                    </span>
                    <div
                      style={{
                        padding: "8px 0px",
                        fontSize: "0.8em",
                        color: "rgb(167, 182, 194)",
                      }}
                    >
                      {Object.values(filters.includes).every(
                        (v) => v.size === 0
                      )
                        ? includeHelpMessage
                        : Object.entries(filters.includes).flatMap(
                            ([key, col]) =>
                              Array.from(col).map((n, i) => (
                                <div
                                  style={{
                                    position: "relative",
                                    display: "inline-block",
                                  }}
                                  key={`${n.toString()}-${i}`}
                                >
                                  <div>
                                    <button
                                      className="bp3-button"
                                      style={{
                                        margin: 4,
                                        paddingRight: 4,
                                        cursor: "pointer",
                                        borderBottomColor: "rgb(92, 112, 128)",
                                      }}
                                      onClick={() => {
                                        filtersRef.current.includes[key].delete(
                                          n
                                        );
                                        const filters = {
                                          ...filtersRef.current,
                                        };
                                        setFilters(filters);
                                        onChange(filters);
                                      }}
                                    >
                                      {renderButtonText(n, key)}
                                    </button>
                                  </div>
                                </div>
                              ))
                          )}
                    </div>
                  </div>
                  <div style={{ paddingTop: 8 }} />
                </div>
                <div
                  className="rm-line"
                  style={{ marginTop: 8, marginBottom: 8 }}
                />
                <div
                  style={{
                    flex: "1 1 100%",
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingLeft: 8,
                  }}
                >
                  <div>
                    <strong>Removes</strong>
                    <span style={{ marginLeft: 4, fontSize: 12 }}>
                      Shift-Click to Add
                    </span>
                    <div
                      style={{
                        padding: "8px 0px",
                        fontSize: "0.8em",
                        color: "rgb(167, 182, 194)",
                      }}
                    >
                      {Object.values(filters.excludes).every(
                        (v) => v.size === 0
                      )
                        ? excludeHelpMessage
                        : Object.entries(filters.excludes).flatMap(
                            ([key, col]) =>
                              Array.from(col).map((n, i) => (
                                <div
                                  style={{
                                    position: "relative",
                                    display: "inline-block",
                                  }}
                                  key={`${n.toString()}-${i}`}
                                >
                                  <div>
                                    <button
                                      className="bp3-button"
                                      style={{
                                        margin: 4,
                                        paddingRight: 4,
                                        cursor: "pointer",
                                        borderBottomColor: "rgb(92, 112, 128)",
                                      }}
                                      onClick={() => {
                                        filtersRef.current.excludes[key].delete(
                                          n
                                        );
                                        const filters = {
                                          ...filtersRef.current,
                                        };
                                        setFilters(filters);
                                        onChange(filters);
                                      }}
                                    >
                                      {renderButtonText(n, key)}
                                    </button>
                                  </div>
                                </div>
                              ))
                          )}
                    </div>
                  </div>
                  <div style={{ paddingTop: 8 }} />
                </div>
              </div>
              <div
                className="rm-line"
                style={{ marginTop: 4, borderColor: "rgb(41, 55, 66)" }}
              />
              <input
                placeholder="Search References"
                className="bp3-input bp3-minimal search-input"
                style={{ margin: 8 }}
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
              <div className="flex-h-box">
                {Object.keys(data).map((k, i, all) => (
                  <React.Fragment key={k}>
                    <div
                      style={{
                        flex: "1 1 100%",
                        paddingTop: 4,
                        paddingBottom: 4,
                        paddingLeft: 4,
                      }}
                    >
                      {(filterSearch
                        ? fuzzy
                            .filter(filterSearch, data[k])
                            .map((s) => s.string)
                        : data[k]
                      )
                        .filter(
                          (n) =>
                            !filters.includes[k].has(n) &&
                            !filters.excludes[k].has(n)
                        )
                        .map((n, i) => (
                          <div
                            style={{
                              position: "relative",
                              display: "inline-block",
                            }}
                            key={`${n.toString()}-${i}`}
                          >
                            <div>
                              <button
                                className="bp3-button"
                                style={{
                                  margin: 4,
                                  paddingRight: 4,
                                  cursor: "pointer",
                                  borderBottomColor: "rgb(92, 112, 128)",
                                }}
                                onClick={(e) => {
                                  if (e.shiftKey)
                                    filtersRef.current.excludes[k].add(n);
                                  else filtersRef.current.includes[k].add(n);
                                  const filters = { ...filtersRef.current };
                                  setFilters(filters);
                                  onChange(filters);
                                }}
                              >
                                {renderButtonText(n, k)}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                    {i < all.length - 1 && (
                      <div
                        className="rm-line"
                        style={{ marginTop: 8, marginBottom: 8 }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        }
        onClose={closeFilter}
        isOpen={isFilterOpen}
      />
    </Tooltip>
  );
};

export default Filter;
