import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  DataTableServer,
  DetailCard,
  DetailPage,
  DetailSection,
  EMPTY_DETAIL_VALUE,
  StatusBadge,
  formatDetailDate,
} from "@/components/shared";
import type { DataColumn } from "@/components/shared";
import { usePriceList, usePriceListItems } from "@/application/hooks/usePricing";
import type { ProductPriceListItemDto } from "@/domain/types/productOperations.types";

const PriceListDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data: priceList, isLoading, refetch } = usePriceList(id);
  const { data: items = [], isLoading: itemsLoading } = usePriceListItems(id);
  const missing = !isLoading && !priceList;

  const columns: DataColumn<ProductPriceListItemDto>[] = useMemo(
    () => [
      { key: "product", title: "Ürün", render: (it) => it.productId || EMPTY_DETAIL_VALUE },
      {
        key: "amount",
        title: "Tutar",
        render: (it) =>
          `${it.amount.toLocaleString("tr-TR")} ${priceList?.currencyCode ?? ""}`.trim(),
      },
      {
        key: "compare",
        title: "Karşılaştırma",
        render: (it) =>
          it.compareAtAmount
            ? `${it.compareAtAmount.toLocaleString("tr-TR")} ${priceList?.currencyCode ?? ""}`.trim()
            : EMPTY_DETAIL_VALUE,
      },
      { key: "min", title: "Min", render: (it) => it.minQuantity ?? EMPTY_DETAIL_VALUE },
      { key: "max", title: "Max", render: (it) => it.maxQuantity ?? EMPTY_DETAIL_VALUE },
    ],
    [priceList?.currencyCode]
  );

  return (
    <DetailPage
      title={priceList?.name ?? "Fiyat Listesi"}
      subtitle={priceList ? `Kod: ${priceList.code}` : undefined}
      breadcrumbs={[
        { label: "Fiyat Listeleri", to: "/pricing/price-lists" },
        { label: priceList?.name ?? "Detay" },
      ]}
      badges={priceList ? <StatusBadge active={priceList.isActive} /> : undefined}
      loading={isLoading}
      error={missing}
      errorMessage="Fiyat listesi bulunamadı veya yüklenirken bir hata oluştu."
      onRetry={() => {
        void refetch();
      }}
      backTo="/pricing/price-lists"
      editTo={id ? `/pricing/price-lists/${id}/edit` : undefined}
    >
      {priceList ? (
        <div className="row g-3">
          <div className="col-lg-6">
            <DetailCard title="Genel Bilgiler" icon="tag" fullHeight={false}>
              <DetailSection
                items={[
                  { label: "Kod", value: priceList.code },
                  { label: "Ad", value: priceList.name },
                  { label: "Para Birimi", value: priceList.currencyCode },
                  { label: "Satış Kanalı", value: priceList.salesChannel },
                  { label: "Müşteri Grubu", value: priceList.customerGroupCode },
                  { label: "Açıklama", value: priceList.description, fullWidth: true },
                ]}
              />
            </DetailCard>
          </div>
          <div className="col-lg-6">
            <DetailCard title="Geçerlilik" icon="calendar" fullHeight={false}>
              <DetailSection
                items={[
                  { label: "Başlangıç", value: formatDetailDate(priceList.validFrom) },
                  { label: "Bitiş", value: formatDetailDate(priceList.validTo) },
                  { label: "Oluşturulma", value: formatDetailDate(priceList.createdAt) },
                  { label: "Güncellenme", value: formatDetailDate(priceList.updatedAt) },
                ]}
              />
            </DetailCard>
          </div>
          <div className="col-12">
            <DataTableServer
              title="Liste Kalemleri"
              columns={columns}
              items={items}
              page={1}
              pageSize={items.length || 1}
              totalItems={items.length}
              onPageChange={() => undefined}
              isLoading={itemsLoading}
              emptyTitle="Kalem yok"
              emptyDescription="Bu fiyat listesinde henüz ürün yok."
              emptyIcon="clip"
              rowKey={(it) => it.id}
            />
          </div>
        </div>
      ) : null}
    </DetailPage>
  );
};

export default PriceListDetailPage;
