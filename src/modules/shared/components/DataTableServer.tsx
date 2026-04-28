import React from "react";
import { DataTable, DataTableBody, DataTableHead, DataTableItem, DataTableRow, DataTableTitle } from "@/components/Component";
import DataTablePagination from "@/components/pagination/DataTablePagination";

export interface DataColumn<T> {
  key: string;
  title: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableServerProps<T> {
  title: string;
  columns: DataColumn<T>[];
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

function DataTableServer<T>({ title, columns, items, page, pageSize, totalItems, onPageChange }: DataTableServerProps<T>) {
  return (
    <DataTable title={title} className="" bodyClassName="">
      <DataTableTitle>
        <div className="card-title">
          <h6 className="title">{title}</h6>
        </div>
      </DataTableTitle>
      <DataTableBody compact={false} className="" bodyclass="">
        <DataTableHead>
          {columns.map((column) => (
            <DataTableRow key={column.key} className="" size="">
              <span className="sub-text">{column.title}</span>
            </DataTableRow>
          ))}
        </DataTableHead>
        {items.map((item, index) => (
          <DataTableItem key={index} className="">
            {columns.map((column) => (
              <DataTableRow key={column.key} className="" size="">
                {column.render(item)}
              </DataTableRow>
            ))}
          </DataTableItem>
        ))}
      </DataTableBody>
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
    </DataTable>
  );
}

export default DataTableServer;
