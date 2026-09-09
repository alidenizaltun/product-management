import React from "react";
import { useParams } from "react-router-dom";
import { DetailCard, DetailPage, DetailSection, formatDetailDate } from "@/components/shared";
import { useCategories, useCategory } from "@/application/hooks/useCatalog";

const CategoryDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data: category, isLoading, refetch } = useCategory(id);
  const { data: categories = [] } = useCategories();

  const parent = categories.find((c) => c.id === category?.parentCategoryId);
  const missing = !isLoading && !category;

  return (
    <DetailPage
      title={category?.name ?? "Kategori Detayı"}
      subtitle={category ? `Kod: ${category.code}` : undefined}
      breadcrumbs={[
        { label: "Kategori Tanımları", to: "/definitions/categories" },
        { label: category?.name ?? "Detay" },
      ]}
      loading={isLoading}
      error={missing}
      errorMessage="Kategori bulunamadı veya yüklenirken bir hata oluştu."
      onRetry={() => {
        void refetch();
      }}
      backTo="/definitions/categories"
      editTo={id ? `/definitions/categories/${id}/edit` : undefined}
    >
      {category ? (
        <DetailCard title="Genel Bilgiler" icon="folder" fullHeight={false}>
          <DetailSection
            items={[
              { label: "Kod", value: category.code },
              { label: "Ad", value: category.name },
              { label: "Üst Kategori", value: parent?.name },
              { label: "Açıklama", value: category.description },
              { label: "Oluşturulma", value: formatDetailDate(category.createdAt) },
            ]}
          />
        </DetailCard>
      ) : null}
    </DetailPage>
  );
};

export default CategoryDetailPage;
