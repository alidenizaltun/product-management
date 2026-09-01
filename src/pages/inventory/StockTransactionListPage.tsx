import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import DataTableServer, { DataColumn } from "@/components/shared/DataTableServer";
import { InventoryTransactionDto } from "@/domain/types/productOperations.types";
import { useInventoryTransactions } from "@/application/hooks/useInventory";

const PAGE_SIZE = 10;

const TX_TYPES: Record<number, { label: string; color: string; icon: string }> = {
  1: { label: "Giriş", color: "success", icon: "arrow-down-left" },
  2: { label: "Çıkış", color: "danger", icon: "arrow-up-right" },
  3: { label: "Transfer", color: "info", icon: "swap" },
  4: { label: "Düzeltme", color: "warning", icon: "edit" },
  5: { label: "İade", color: "primary", icon: "back-alt" },
};

const StockTransactionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data: transactions = [], isLoading } = useInventoryTransactions();

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return transactions.slice(start, start + PAGE_SIZE);
  }, [transactions, page]);

  const columns: DataColumn<InventoryTransactionDto>[] = useMemo(
    () => [
      {
        key: "type",
        title: "Tip",
        render: (it) => {
          const t = TX_TYPES[it.transactionType];
          return t ? (
            <span className={`badge badge-dim bg-${t.color}`}>
              <Icon name={t.icon} className="me-1" />
              {t.label}
            </span>
          ) : (
            it.transactionType
          );
        },
      },
      {
        key: "product",
        title: "Ürün",
        render: (it) => <span className="fw-medium fs-13px">{it.productId.slice(0, 8)}</span>,
      },
      {
        key: "quantity",
        title: "Miktar",
        render: (it) => <span className="fw-medium">{it.quantity}</span>,
      },
      {
        key: "cost",
        title: "Birim Maliyet",
        render: (it) => <span className="text-soft">{it.unitCost ? it.unitCost.toLocaleString("tr-TR") : "—"}</span>,
      },
      {
        key: "ref",
        title: "Referans",
        render: (it) => (
          <span className="text-soft">
            {it.referenceType ? `${it.referenceType}: ${it.referenceNumber ?? "—"}` : "—"}
          </span>
        ),
      },
      {
        key: "date",
        title: "Tarih",
        render: (it) => new Date(it.occurredAt).toLocaleString("tr-TR"),
      },
    ],
    []
  );

  return (
    <>
      <Head title="Stok Hareketleri" />
      <Content>
        <PageHeader
          title="Stok Hareketleri"
          description="Stok girişi, çıkışı, transfer ve düzeltmeleri."
          actions={
            <Button color="primary" onClick={() => navigate("/inventory/transactions/new")}>
              <Icon name="plus" className="me-1" />
              Yeni Hareket
            </Button>
          }
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={paginated}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={transactions.length}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Henüz hareket yok"
            emptyIcon="exchange"
            rowKey={(it) => it.id}
          />
        </Block>
      </Content>
    </>
  );
};

export default StockTransactionListPage;
