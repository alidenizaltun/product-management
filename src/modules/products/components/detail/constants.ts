export const KIND_LABELS: Record<number, { label: string; color: string; icon: string }> = {
  1: { label: "Fiziksel", color: "primary", icon: "box" },
  2: { label: "Yazılım", color: "info", icon: "laptop" },
  3: { label: "Hizmet", color: "success", icon: "briefcase" },
  4: { label: "Abonelik", color: "warning", icon: "repeat" },
};

export const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "Taslak", color: "secondary" },
  1: { label: "Aktif", color: "success" },
  2: { label: "Pasif", color: "warning" },
  3: { label: "Arşivlendi", color: "danger" },
};

export const PRICE_TYPE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Satış", color: "primary" },
  2: { label: "Kurumsal", color: "info" },
  3: { label: "Toptan", color: "warning" },
  4: { label: "Özel", color: "success" },
};

export const LICENSE_MODEL_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Tek Seferlik", color: "primary" },
  2: { label: "Abonelik", color: "info" },
  5: { label: "Deneme", color: "secondary" },
};

export const ATTRIBUTE_DATA_TYPE_LABELS: Record<number, string> = {
  1: "Metin",
  2: "Sayı",
  3: "Boolean",
  4: "Tarih",
  5: "Liste",
};

export const BILLING_UNIT_LABELS: Record<number, string> = {
  1: "Gün",
  2: "Hafta",
  3: "Ay",
  4: "Yıl",
};

export const INVENTORY_POLICY_LABELS: Record<number, string> = {
  0: "İzin Ver",
  1: "Reddet",
  2: "Beklet",
};
