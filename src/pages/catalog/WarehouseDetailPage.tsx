import React from "react";
import { useParams } from "react-router-dom";
import {
  DetailCard,
  DetailPage,
  DetailSection,
  StatusBadge,
  formatDetailDate,
} from "@/components/shared";
import { useWarehouse } from "@/application/hooks/useCatalog";

const WarehouseDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data: warehouse, isLoading, refetch } = useWarehouse(id);
  const missing = !isLoading && !warehouse;

  return (
    <DetailPage
      title={warehouse?.name ?? "Depo Detayı"}
      subtitle={warehouse ? `Kod: ${warehouse.code}` : undefined}
      breadcrumbs={[
        { label: "Depo Tanımları", to: "/definitions/warehouses" },
        { label: warehouse?.name ?? "Detay" },
      ]}
      badges={warehouse ? <StatusBadge active={warehouse.isActive} /> : undefined}
      loading={isLoading}
      error={missing}
      errorMessage="Depo bulunamadı veya yüklenirken bir hata oluştu."
      onRetry={() => {
        void refetch();
      }}
      backTo="/definitions/warehouses"
      editTo={id ? `/definitions/warehouses/${id}/edit` : undefined}
    >
      {warehouse ? (
        <DetailCard title="Genel Bilgiler" icon="building" fullHeight={false}>
          <DetailSection
            items={[
              { label: "Kod", value: warehouse.code },
              { label: "Ad", value: warehouse.name },
              { label: "Şehir", value: warehouse.city },
              { label: "Ülke", value: warehouse.country },
              { label: "Adres", value: warehouse.address, fullWidth: true },
              { label: "Açıklama", value: warehouse.description, fullWidth: true },
              { label: "Oluşturulma", value: formatDetailDate(warehouse.createdAt) },
            ]}
          />
        </DetailCard>
      ) : null}
    </DetailPage>
  );
};

export default WarehouseDetailPage;
