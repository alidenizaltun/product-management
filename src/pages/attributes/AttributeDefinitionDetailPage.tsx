import React from "react";
import { useParams } from "react-router-dom";
import {
  DetailCard,
  DetailPage,
  DetailSection,
  EMPTY_DETAIL_VALUE,
  formatDetailYesNo,
} from "@/components/shared";
import { useAttributeDefinition } from "@/application/hooks/useAttributes";

const DATA_TYPE_LABELS: Record<number, string> = {
  1: "Metin",
  2: "Sayı",
  3: "Boolean",
  4: "Tarih",
  5: "Liste",
};

const AttributeDefinitionDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data: def, isLoading, refetch } = useAttributeDefinition(id);
  const missing = !isLoading && !def;

  return (
    <DetailPage
      title={def?.displayName ?? "Özellik Tanımı"}
      subtitle={def ? `Anahtar: ${def.key}` : undefined}
      breadcrumbs={[
        { label: "Özellik Tanımları", to: "/definitions/attributes" },
        { label: def?.displayName ?? "Detay" },
      ]}
      loading={isLoading}
      error={missing}
      errorMessage="Özellik tanımı bulunamadı veya yüklenirken bir hata oluştu."
      onRetry={() => {
        void refetch();
      }}
      backTo="/definitions/attributes"
      editTo={id ? `/definitions/attributes/${id}/edit` : undefined}
    >
      {def ? (
        <DetailCard title="Genel Bilgiler" icon="list" fullHeight={false}>
          <DetailSection
            items={[
              { label: "Anahtar", value: def.key },
              { label: "Görünen Ad", value: def.displayName },
              { label: "Veri Tipi", value: DATA_TYPE_LABELS[def.dataType] ?? EMPTY_DETAIL_VALUE },
              { label: "Zorunlu", value: formatDetailYesNo(def.isRequired) },
              { label: "Filtrelenebilir", value: formatDetailYesNo(def.isFilterable) },
              { label: "Varyant Eksen", value: formatDetailYesNo(def.isVariantAxis) },
              { label: "İzinli Değerler", value: def.allowedValuesJson, fullWidth: true },
              { label: "Doğrulama Kuralı", value: def.validationRuleJson, fullWidth: true },
            ]}
          />
        </DetailCard>
      ) : null}
    </DetailPage>
  );
};

export default AttributeDefinitionDetailPage;
