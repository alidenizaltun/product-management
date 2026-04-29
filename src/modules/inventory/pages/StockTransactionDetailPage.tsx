import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import EmptyState from "@/modules/shared/components/EmptyState";
import { useInventoryTransactions } from "@/modules/inventory/hooks/useInventory";

const TX_LABELS: Record<number, string> = {
  1: "Giriş",
  2: "Çıkış",
  3: "Transfer",
  4: "Düzeltme",
  5: "İade",
};

const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="profile-ud-list">
    <div className="profile-ud-item">
      <div className="profile-ud wider">
        <span className="profile-ud-label">{label}</span>
        <span className="profile-ud-value">{value ?? "—"}</span>
      </div>
    </div>
  </div>
);

const StockTransactionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: transactions = [], isLoading } = useInventoryTransactions();
  const tx = transactions.find((t) => t.id === id);

  return (
    <>
      <Head title="Stok Hareket Detayı" />
      <Content>
        <PageHeader
          title="Stok Hareket Detayı"
          description={tx ? `${TX_LABELS[tx.transactionType] ?? tx.transactionType} • ${tx.quantity} adet` : undefined}
          actions={
            <Button color="light" onClick={() => navigate("/inventory/transactions")}>
              <Icon name="arrow-left" className="me-1" />
              Geri
            </Button>
          }
        />
        <Block>
          {isLoading ? (
            <div className="card card-bordered">
              <div className="card-inner d-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm text-primary" />
                <span>Yükleniyor...</span>
              </div>
            </div>
          ) : !tx ? (
            <div className="card card-bordered">
              <EmptyState icon="alert-circle" title="Hareket bulunamadı" />
            </div>
          ) : (
            <div className="card card-bordered">
              <div className="card-inner">
                <h6 className="overline-title text-primary mb-3">Hareket Bilgileri</h6>
                <InfoRow label="Tip" value={TX_LABELS[tx.transactionType]} />
                <InfoRow label="Ürün" value={tx.productId} />
                <InfoRow label="Varyant" value={tx.productVariantId} />
                <InfoRow label="Depo" value={tx.warehouseId} />
                <InfoRow label="Miktar" value={tx.quantity} />
                <InfoRow label="Birim Maliyet" value={tx.unitCost?.toLocaleString("tr-TR")} />
                <InfoRow label="Referans Tipi" value={tx.referenceType} />
                <InfoRow label="Referans No" value={tx.referenceNumber} />
                <InfoRow label="Not" value={tx.note} />
                <InfoRow label="Gerçekleşme" value={new Date(tx.occurredAt).toLocaleString("tr-TR")} />
                <InfoRow label="Oluşturulma" value={new Date(tx.createdAt).toLocaleString("tr-TR")} />
              </div>
            </div>
          )}
        </Block>
      </Content>
    </>
  );
};

export default StockTransactionDetailPage;
