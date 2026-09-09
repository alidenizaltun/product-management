import React from "react";
import { useParams } from "react-router-dom";
import {
  DetailCard,
  DetailPage,
  DetailSection,
  StatusBadge,
  formatDetailDate,
} from "@/components/shared";
import { useSupplier } from "@/application/hooks/useCatalog";

const SupplierDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data: supplier, isLoading, refetch } = useSupplier(id);
  const missing = !isLoading && !supplier;

  return (
    <DetailPage
      title={supplier?.name ?? "Tedarikçi Detayı"}
      subtitle={supplier ? `Kod: ${supplier.supplierCode}` : undefined}
      breadcrumbs={[
        { label: "Tedarikçi Tanımları", to: "/definitions/suppliers" },
        { label: supplier?.name ?? "Detay" },
      ]}
      badges={supplier ? <StatusBadge active={supplier.isActive} /> : undefined}
      loading={isLoading}
      error={missing}
      errorMessage="Tedarikçi bulunamadı veya yüklenirken bir hata oluştu."
      onRetry={() => {
        void refetch();
      }}
      backTo="/definitions/suppliers"
      editTo={id ? `/definitions/suppliers/${id}/edit` : undefined}
    >
      {supplier ? (
        <DetailCard title="Genel Bilgiler" icon="truck" fullHeight={false}>
          <DetailSection
            items={[
              { label: "Kod", value: supplier.supplierCode },
              { label: "Ad", value: supplier.name },
              { label: "Vergi No", value: supplier.taxNumber },
              { label: "E-posta", value: supplier.email },
              { label: "Telefon", value: supplier.phone },
              { label: "Adres", value: supplier.address, fullWidth: true },
              { label: "Oluşturulma", value: formatDetailDate(supplier.createdAt) },
            ]}
          />
        </DetailCard>
      ) : null}
    </DetailPage>
  );
};

export default SupplierDetailPage;
