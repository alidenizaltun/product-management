import React from "react";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableItem,
  DataTableRow,
} from "@/components/Component";
import DataTablePagination from "@/components/pagination/DataTablePagination";
import EmptyState from "./EmptyState";
import { TableSkeleton } from "./LoadingSkeleton";

export interface DataColumn<T> {
  key: string;
  title: string;
  render: (item: T, index: number) => React.ReactNode;
  size?: string;
  className?: string;
}

interface DataTableServerProps<T> {
  title?: string;
  columns: DataColumn<T>[];
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  emptyAction?: React.ReactNode;
  isLoading?: boolean;
  toolbar?: React.ReactNode;
  rowKey?: (item: T, index: number) => React.Key;
}

function toolsHeaderClass(className?: string) {
  if (!className?.includes("nk-tb-col-tools")) return className;
  if (className.includes("text-end")) return className;
  return `${className} text-end`;
}

function DataTableServer<T>({
  title,
  columns,
  items,
  page,
  pageSize,
  totalItems,
  onPageChange,
  emptyTitle = "Kayıt bulunamadı",
  emptyDescription,
  emptyIcon = "inbox",
  emptyAction,
  isLoading,
  toolbar,
  rowKey,
}: DataTableServerProps<T>) {
  const showEmpty = !isLoading && items.length === 0;
  const showPagination = !isLoading && !showEmpty && totalItems > 0;
  const skeletonRows = Math.min(Math.max(pageSize, 1), 8);

  const header = (
    <DataTableHead>
      {columns.map((column) => (
        <DataTableRow key={column.key} className={toolsHeaderClass(column.className)} size={column.size}>
          <span className="sub-text">{column.title}</span>
        </DataTableRow>
      ))}
    </DataTableHead>
  );

  return (
    <DataTable className="card-stretch" bodyClassName="" title={title}>
      {title || toolbar ? (
        <div className="card-inner position-relative card-tools-toggle">
          <div className="card-title-group">
            {title ? (
              <div className="card-title">
                <h6 className="title mb-0">{title}</h6>
              </div>
            ) : (
              <div />
            )}
            {toolbar ? (
              <div className="card-tools">
                <div className="form-inline flex-nowrap gx-3">{toolbar}</div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div
          className="card-inner p-0"
          role="status"
          aria-busy="true"
          aria-live="polite"
          aria-label="Yükleniyor..."
        >
          <TableSkeleton rows={skeletonRows} columns={columns.length} />
        </div>
      ) : showEmpty ? (
        <>
          <DataTableBody compact className="" bodyclass="">
            {header}
          </DataTableBody>
          <div className="card-inner">
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
            />
          </div>
        </>
      ) : (
        <DataTableBody compact className="" bodyclass="">
          {header}
          {items.map((item, index) => (
            <DataTableItem key={rowKey ? rowKey(item, index) : index} className="">
              {columns.map((column) => (
                <DataTableRow key={column.key} className={column.className} size={column.size}>
                  {column.render(item, index)}
                </DataTableRow>
              ))}
            </DataTableItem>
          ))}
        </DataTableBody>
      )}

      {showPagination ? (
        <div className="card-inner">
          <DataTablePagination
            itemPerPage={pageSize}
            totalItems={totalItems}
            paginate={onPageChange}
            currentPage={page}
            onChangeRowsPerPage={() => undefined}
            customItemPerPage={pageSize}
            setRowsPerPage={() => undefined}
          />
        </div>
      ) : null}
    </DataTable>
  );
}

export default DataTableServer;
