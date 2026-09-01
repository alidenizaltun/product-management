import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import {
  useInventoryReservation,
  useInventoryReservationMutations,
} from "@/application/hooks/useInventory";

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: "Aktif", color: "info" },
  2: { label: "Tamamlandı", color: "success" },
  3: { label: "İptal", color: "secondary" },
  4: { label: "Süresi Doldu", color: "danger" },
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

const ReservationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: res, isLoading } = useInventoryReservation(id);
  const { updateStatus } = useInventoryReservationMutations();

  const setStatus = async (status: number) => {
    if (!id) return;
    await updateStatus.mutateAsync({ id, payload: { status } });
  };

  return (
    <>
      <Head title="Rezervasyon Detayı" />
      <Content>
        <PageHeader
          title={res ? `Rezervasyon ${res.reservationCode}` : "Rezervasyon Detayı"}
          actions={
            <div className="d-flex gap-2">
              <Button color="light" onClick={() => navigate("/inventory/reservations")}>
                <Icon name="arrow-left" className="me-1" />
                Geri
              </Button>
              {res && res.status === 1 ? (
                <>
                  <Button color="success" disabled={updateStatus.isPending} onClick={() => setStatus(2)}>
                    <Icon name="check" className="me-1" />
                    Tamamla
                  </Button>
                  <Button color="danger" disabled={updateStatus.isPending} onClick={() => setStatus(3)}>
                    <Icon name="cross" className="me-1" />
                    İptal Et
                  </Button>
                </>
              ) : null}
            </div>
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
          ) : !res ? (
            <div className="card card-bordered">
              <EmptyState icon="alert-circle" title="Rezervasyon bulunamadı" />
            </div>
          ) : (
            <div className="card card-bordered">
              <div className="card-inner">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="overline-title text-primary mb-0">Rezervasyon Bilgileri</h6>
                  {STATUS_MAP[res.status] && (
                    <span className={`badge badge-dim bg-${STATUS_MAP[res.status].color}`}>
                      {STATUS_MAP[res.status].label}
                    </span>
                  )}
                </div>
                <InfoRow label="Kod" value={res.reservationCode} />
                <InfoRow label="Ürün" value={res.productId} />
                <InfoRow label="Varyant" value={res.productVariantId} />
                <InfoRow label="Depo" value={res.warehouseId} />
                <InfoRow label="Miktar" value={res.quantity} />
                <InfoRow label="Kaynak Tipi" value={res.sourceType} />
                <InfoRow label="Kaynak ID" value={res.sourceId} />
                <InfoRow
                  label="Bitiş"
                  value={res.reservedUntil ? new Date(res.reservedUntil).toLocaleString("tr-TR") : undefined}
                />
                <InfoRow label="Oluşturulma" value={new Date(res.createdAt).toLocaleString("tr-TR")} />
              </div>
            </div>
          )}
        </Block>
      </Content>
    </>
  );
};

export default ReservationDetailPage;
