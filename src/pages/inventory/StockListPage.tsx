import React, { useMemo, useState } from "react";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import DataTableServer, { DataColumn } from "@/components/shared/DataTableServer";
import { ProductInventoryDto } from "@/domain/types/productOperations.types";
import { useInventories } from "@/application/hooks/useInventory";

const PAGE_SIZE = 10;

const InventoryStockBadge: React.FC<{ inv: ProductInventoryDto }> = ({ inv }) => {
  if (inv.quantityAvailable <= 0) {
    return <span className="badge badge-dim bg-danger">Stoksuz</span>;
  }
  if (inv.reorderPoint && inv.quantityAvailable <= inv.reorderPoint) {
    return <span className="badge badge-dim bg-warning">Düşük</span>;
  }
  return <span className="badge badge-dim bg-success">Mevcut</span>;
};

const StockListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data: inventories = [], isLoading } = useInventories();

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return inventories.slice(start, start + PAGE_SIZE);
  }, [inventories, page]);

  const columns: DataColumn<ProductInventoryDto>[] = useMemo(
    () => [
      {
        key: "productId",
        title: "Ürün",
        render: (it) => <span className="fw-medium fs-13px">{it.productId.slice(0, 8)}</span>,
      },
      {
        key: "warehouse",
        title: "Depo",
        render: (it) => <span className="text-soft">{it.warehouseCode || it.warehouseId.slice(0, 8)}</span>,
      },
      {
        key: "onHand",
        title: "Eldeki",
        render: (it) => <span className="fw-medium">{it.quantityOnHand}</span>,
      },
      {
        key: "reserved",
        title: "Rezerve",
        render: (it) => <span className="text-soft">{it.quantityReserved}</span>,
      },
      {
        key: "available",
        title: "Mevcut",
        render: (it) => (
          <span className={`fw-medium ${it.quantityAvailable <= 0 ? "text-danger" : "text-success"}`}>
            {it.quantityAvailable}
          </span>
        ),
      },
      {
        key: "reorder",
        title: "Yeniden Sipariş",
        render: (it) => <span className="text-soft">{it.reorderPoint ?? "—"}</span>,
      },
      { key: "status", title: "Durum", render: (it) => <InventoryStockBadge inv={it} /> },
    ],
    []
  );

  return (
    <>
      <Head title="Stok Durumu" />
      <Content>
        <PageHeader
          title="Stok Durumu"
          description="Ürün, varyant ve depo bazlı anlık stok durumu."
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={paginated}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={inventories.length}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Stok kaydı bulunamadı"
            emptyIcon="package"
            rowKey={(it) => it.id}
          />
        </Block>
      </Content>
    </>
  );
};

export default StockListPage;
