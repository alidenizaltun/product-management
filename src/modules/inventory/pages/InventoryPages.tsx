import React from "react";
import ModuleListPage from "@/modules/shared/pages/ModuleListPage";
import ModuleFormPage from "@/modules/shared/pages/ModuleFormPage";
import ModuleDetailPage from "@/modules/shared/pages/ModuleDetailPage";

export const StockListPage: React.FC = () => (
  <ModuleListPage
    title="Stok Durumu"
    description="Ürün, varyant ve depo bazlı stok izleme"
    createPath="/inventory/stock/new"
    detailPathSample="/inventory/stock/sample"
  />
);

export const StockTransactionListPage: React.FC = () => (
  <ModuleListPage
    title="Stok Hareketleri"
    description="Giriş, çıkış ve düzeltme hareketleri"
    createPath="/inventory/transactions/new"
    detailPathSample="/inventory/transactions/sample"
  />
);

export const StockTransactionFormPage: React.FC = () => (
  <ModuleFormPage
    title="Stok Hareketi Ekle / Düzenle"
    fields={[
      { name: "productId", label: "Ürün", type: "text" },
      { name: "quantity", label: "Miktar", type: "number" },
      { name: "transactionType", label: "İşlem Tipi", type: "text" },
    ]}
  />
);

export const StockTransactionDetailPage: React.FC = () => <ModuleDetailPage title="Stok Hareket Detayı" />;

export const ReservationListPage: React.FC = () => (
  <ModuleListPage
    title="Rezervasyonlar"
    description="Sipariş/kanal bazlı stok rezervasyonları"
    createPath="/inventory/reservations/new"
    detailPathSample="/inventory/reservations/sample"
  />
);

export const ReservationDetailPage: React.FC = () => <ModuleDetailPage title="Rezervasyon Detayı" />;
export const WarehouseStockDetailPage: React.FC = () => <ModuleDetailPage title="Depo Bazlı Stok" />;
