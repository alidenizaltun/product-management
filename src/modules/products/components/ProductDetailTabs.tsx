import React, { useMemo, useState } from "react";
import AppTabs, { TabItem } from "@/modules/shared/components/AppTabs";

interface ProductDetailTabsProps {
  productId: string;
  productKind?: number;
}

const ProfileContent: React.FC<{ kind?: number }> = ({ kind }) => {
  if (kind === 1) {
    return <div>Fiziksel ürün profili alanları</div>;
  }

  if (kind === 2) {
    return <div>Yazılım profili alanları</div>;
  }

  if (kind === 3) {
    return <div>Servis profili alanları</div>;
  }

  if (kind === 4) {
    return <div>Abonelik profili alanları</div>;
  }

  return <div>Ürün profili bilgisi</div>;
};

const ProductDetailTabs: React.FC<ProductDetailTabsProps> = ({ productId, productKind }) => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: "general",
        label: "Genel Bilgi",
        content: (
          <div>
            <div className="text-muted">Ürün kimliği: {productId}</div>
            <div>Ürün temel bilgileri bu sekmede görüntülenir.</div>
          </div>
        ),
      },
      {
        id: "variants",
        label: "Varyantlar",
        content: <div>Varyant bilgileri düzenleme ekranında yönetilir.</div>,
      },
      {
        id: "prices",
        label: "Fiyatlar",
        content: <div>Fiyatlar düzenleme ekranında yönetilir.</div>,
      },
      {
        id: "media",
        label: "Medya",
        content: <div>Medya yönetimi düzenleme ekranında yapılır.</div>,
      },
      {
        id: "attributes",
        label: "Özellikler",
        content: <div>Özellikler düzenleme ekranında yönetilir.</div>,
      },
      {
        id: "categories",
        label: "Kategoriler",
        content: <div>Kategori eşleştirmeleri düzenleme ekranında yönetilir.</div>,
      },
      {
        id: "suppliers",
        label: "Tedarikçiler",
        content: <div>Tedarikçi ilişkileri düzenleme ekranında yönetilir.</div>,
      },
      {
        id: "bundles",
        label: "Bundle Ürünler",
        content: <div>Bundle ilişkileri düzenleme ekranında yönetilir.</div>,
      },
      {
        id: "profile",
        label: "Profil",
        content: <ProfileContent kind={productKind} />,
      },
    ],
    [productId, productKind]
  );

  return <AppTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />;
};

export default ProductDetailTabs;
