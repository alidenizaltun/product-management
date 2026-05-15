import React, { useState, useMemo } from "react";
import { Button, Input } from "reactstrap";
import Icon from "@/components/icon/Icon";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortDirection = "asc" | "desc" | null;

interface ColumnDef<T> {
  key: string;
  title: string;
  render: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  width?: string;
  align?: "start" | "center" | "end";
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (item: T) => React.Key;
  selectable?: boolean;
  selectedKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
  onRowClick?: (item: T) => void;
  bulkActions?: React.ReactNode;
  sortable?: boolean;
  defaultSort?: { key: string; direction: SortDirection };
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
  className?: string;
  tableClassName?: string;
  loading?: boolean;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

// ─── ResponsiveTable ──────────────────────────────────────────────────────────

function ResponsiveTable<T>({
  columns,
  data,
  rowKey,
  selectable,
  selectedKeys = [],
  onSelectionChange,
  onRowClick,
  bulkActions,
  sortable,
  defaultSort,
  striped,
  hoverable = true,
  bordered = true,
  compact,
  stickyHeader,
  maxHeight,
  className = "",
  tableClassName = "",
  loading,
  emptyIcon = "inbox",
  emptyTitle = "Kayıt bulunamadı",
  emptyDescription,
}: ResponsiveTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(
    defaultSort?.key ?? null
  );
  const [sortDir, setSortDir] = useState<SortDirection>(
    defaultSort?.direction ?? null
  );

  const handleSort = (col: ColumnDef<T>) => {
    if (!col.sortable && !sortable) return;
    if (sortKey === col.key) {
      setSortDir((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
      );
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortFn) return data;
    return [...data].sort((a, b) =>
      sortDir === "asc" ? col.sortFn!(a, b) : -col.sortFn!(a, b)
    );
  }, [data, sortKey, sortDir, columns]);

  const allSelected =
    selectable && data.length > 0 && selectedKeys.length === data.length;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : data.map((item) => rowKey(item)));
  };

  const toggleRow = (key: React.Key) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key]
    );
  };

  return (
    <div className={`card card-bordered ${className}`}>
      {selectable && selectedKeys.length > 0 && bulkActions && (
        <div className="card-inner py-2 bg-light d-flex align-items-center gap-3">
          <span className="text-soft fs-12">
            <strong>{selectedKeys.length}</strong> kayıt seçildi
          </span>
          {bulkActions}
        </div>
      )}

      <div
        className={stickyHeader ? "table-responsive" : ""}
        style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      >
        <table
          className={`table ${striped ? "table-striped" : ""} ${hoverable ? "table-hover" : ""} ${bordered ? "table-bordered" : ""} ${compact ? "table-sm" : ""} mb-0 ${tableClassName}`}
        >
          <thead className={`table-light ${stickyHeader ? "position-sticky top-0" : ""}`}>
            <tr>
              {selectable && (
                <th style={{ width: 40 }} className="text-center">
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </div>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`${col.hideOnMobile ? "d-none d-md-table-cell" : ""} ${
                    col.align ? `text-${col.align}` : ""
                  } ${col.sortable || sortable ? "cursor-pointer user-select-none" : ""}`}
                  onClick={() => handleSort(col)}
                >
                  <span className="overline-title">
                    {col.title}
                    {sortKey === col.key && sortDir && (
                      <Icon
                        name={sortDir === "asc" ? "arrow-up" : "arrow-down"}
                        className="ms-1 fs-12px"
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-center py-4"
                >
                  <span className="spinner-border spinner-border-sm text-primary me-2" />
                  <span className="text-soft">Yükleniyor...</span>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-center py-5"
                >
                  <Icon
                    name={emptyIcon}
                    className="fs-2 text-soft d-block mb-2"
                  />
                  <h6 className="title mb-1">{emptyTitle}</h6>
                  {emptyDescription && (
                    <p className="text-soft mb-0">{emptyDescription}</p>
                  )}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => {
                const key = rowKey(item);
                const isSelected = selectedKeys.includes(key);
                return (
                  <tr
                    key={key}
                    className={isSelected ? "table-active" : ""}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    style={onRowClick ? { cursor: "pointer" } : undefined}
                  >
                    {selectable && (
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isSelected}
                            onChange={() => toggleRow(key)}
                          />
                        </div>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`${col.hideOnMobile ? "d-none d-md-table-cell" : ""} ${
                          col.align ? `text-${col.align}` : ""
                        }`}
                      >
                        {col.render(item, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResponsiveTable;

// ─── SimplePagination ─────────────────────────────────────────────────────────

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className={`d-flex justify-content-center align-items-center gap-1 ${className}`}>
      <Button
        color="light"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <Icon name="chevron-left" />
      </Button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="text-soft px-2">
            ...
          </span>
        ) : (
          <Button
            key={p}
            color={p === currentPage ? "primary" : "light"}
            size="sm"
            onClick={() => onPageChange(p as number)}
            className="px-3"
          >
            {p}
          </Button>
        )
      )}
      <Button
        color="light"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <Icon name="chevron-right" />
      </Button>
    </div>
  );
};

// ─── PageSizeSelector ─────────────────────────────────────────────────────────

interface PageSizeSelectorProps {
  value: number;
  options?: number[];
  onChange: (size: number) => void;
  className?: string;
}

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  value,
  options = [10, 25, 50, 100],
  onChange,
  className = "",
}) => (
  <div className={`d-flex align-items-center gap-2 ${className}`}>
    <span className="text-soft fs-12">Sayfa başına:</span>
    <Input
      type="select"
      bsSize="sm"
      style={{ width: 80 }}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </Input>
  </div>
);
