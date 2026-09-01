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

  return (
    <DataTable className="" bodyClassName="" title={title}>
      {(title || toolbar) ? (
        <div className="card-inner position-relative card-tools-toggle">
          <div className="card-title-group">
            {title ? (
              <div className="card-title">
                <h6 className="title mb-0">{title}</h6>
              </div>
            ) : <div />}
            {toolbar ? <div className="card-tools">{toolbar}</div> : null}
          </div>
        </div>
      ) : null}

      <DataTableBody compact={false} className="" bodyclass="">
        <DataTableHead>
          {columns.map((column) => (
            <DataTableRow key={column.key} className={column.className} size={column.size}>
              <span className="sub-text">{column.title}</span>
            </DataTableRow>
          ))}
        </DataTableHead>

        {isLoading ? (
          <DataTableItem className="">
            <div className="d-flex align-items-center gap-2 py-3 px-3">
              <span className="spinner-border spinner-border-sm text-primary" />
              <span className="text-soft">Yükleniyor...</span>
            </div>
          </DataTableItem>
        ) : (
          items.map((item, index) => (
            <DataTableItem key={rowKey ? rowKey(item, index) : index} className="">
              {columns.map((column) => (
                <DataTableRow key={column.key} className={column.className} size={column.size}>
                  {column.render(item, index)}
                </DataTableRow>
              ))}
            </DataTableItem>
          ))
        )}
      </DataTableBody>

      {showEmpty ? (
        <div className="card-inner">
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        </div>
      ) : null}

      {totalItems > 0 ? (
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
