import React, { useMemo, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/pages/products/types/productEditor.types";
import { useRegionLookups } from "@/application/hooks/useLookups";
import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";

const PRICE_TYPES = [
  { value: 1, label: "Satış Fiyatı", icon: "cart", color: "primary" },
  { value: 2, label: "Maliyet Fiyatı", icon: "briefcase", color: "warning" },
  { value: 3, label: "Liste Fiyatı", icon: "tag", color: "info" },
  { value: 4, label: "Kampanya Fiyatı", icon: "percent", color: "success" },
];

const addYears = (date: Date, years: number) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
};

const toDateTimeInput = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const defaultValidity = () => {
  const now = new Date();
  return {
    validFrom: toDateTimeInput(now),
    validTo: toDateTimeInput(addYears(now, 1)),
  };
};

const emptyPrice = (overrides: Partial<ProductFormValues["prices"][number]> = {}) => ({
  regionId: "",
  priceType: 1,
  amount: undefined as number | undefined,
  compareAtAmount: undefined as number | undefined,
  currencyCode: DEFAULT_CURRENCY_CODE,
  minQuantity: 1,
  maxQuantity: undefined as number | undefined,
  salesChannel: "",
  customerGroupCode: "",
  ...defaultValidity(),
  ...overrides,
});

const PRICE_TEMPLATES = [
  {
    title: "Temel satış",
    description: "Ürünün vitrindeki ana fiyatı.",
    icon: "cart",
    price: emptyPrice({ priceType: 1 }),
  },
  {
    title: "Liste / karşılaştırma",
    description: "İndirim öncesi referans fiyat.",
    icon: "tag",
    price: emptyPrice({ priceType: 3, compareAtAmount: 0 }),
  },
  {
    title: "Kampanya",
    description: "Belirli tarih aralığı için özel fiyat.",
    icon: "percent",
    price: emptyPrice({ priceType: 4 }),
  },
  {
    title: "Bayi fiyatı",
    description: "Müşteri grubu veya kanala özel fiyat.",
    icon: "users",
    price: emptyPrice({ priceType: 1, customerGroupCode: "dealer" }),
  },
];

const getPriceMeta = (value?: number) =>
  PRICE_TYPES.find((item) => item.value === Number(value)) ?? PRICE_TYPES[0];

const formatMoney = (amount?: number, currency = DEFAULT_CURRENCY_CODE) =>
  typeof amount === "number" && Number.isFinite(amount)
    ? `${amount.toLocaleString("tr-TR")} ${currency}`
    : `0 ${currency}`;

const PriceMatrix: React.FC = () => {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const { fields, append, remove, swap } = useFieldArray({ control, name: "prices" });
  const prices = useWatch({ control, name: "prices" }) ?? [];
  const productRegions = useWatch({ control, name: "regions" }) ?? [];
  const { data: regionLookups = [] } = useRegionLookups(true);
  const [openAdvanced, setOpenAdvanced] = useState<Record<string, boolean>>({});

  const regionNameById = useMemo(
    () => new Map(regionLookups.map((region) => [region.id, region.name])),
    [regionLookups]
  );

  /** Ürüne tanımlı bölgeler; fiyat satırında yalnızca bunlar seçilebilir. */
  const availableRegions = useMemo(
    () =>
      productRegions
        .filter((region) => region?.regionId && region.isActive !== false)
        .map((region) => ({
          id: region.regionId,
          name: regionNameById.get(region.regionId) ?? "Bölge",
          currencyCode: region.currencyCode || DEFAULT_CURRENCY_CODE,
        })),
    [productRegions, regionNameById]
  );

  /** Bölgeli fiyat bölgenin para birimini, bölgesiz fiyat ürünün para birimini kullanır. */
  const resolveCurrency = (regionId?: string) =>
    availableRegions.find((region) => region.id === regionId)?.currencyCode ?? DEFAULT_CURRENCY_CODE;

  const primaryPrice = useMemo(
    () => prices.find((price) => Number(price?.priceType) === 1 && Number(price?.amount) > 0),
    [prices]
  );

  const toggleAdvanced = (fieldId: string) => {
    setOpenAdvanced((current) => ({ ...current, [fieldId]: !current[fieldId] }));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Fiyat Tarifleri</h6>
          <p className="text-soft fs-13px mb-0">Önce temel fiyatı belirleyin, gerekirse kampanya ve kanal istisnaları ekleyin.</p>
        </div>
        <div className="text-end">
          <span className="text-soft fs-12px d-block">Canlı sonuç</span>
          <strong>
            {primaryPrice
              ? formatMoney(primaryPrice.amount, resolveCurrency(primaryPrice.regionId))
              : "Fiyat bekleniyor"}
          </strong>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {PRICE_TEMPLATES.map((template) => (
          <div className="col-sm-6 col-xl-3" key={template.title}>
            <button
              type="button"
              className="card card-bordered h-100 text-start w-100 bg-white"
              onClick={() => append({ ...template.price, minQuantity: 1 })}
            >
              <div className="card-inner">
                <span className="btn btn-icon btn-light rounded-circle mb-3">
                  <em className={`icon ni ni-${template.icon}`} />
                </span>
                <h6 className="title mb-1">{template.title}</h6>
                <p className="text-soft fs-12px mb-0">{template.description}</p>
              </div>
            </button>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-sign-turkish-lira fs-2 d-block mb-2" />
          <p className="mb-0">Henüz fiyat eklenmedi. Yukarıdaki şablonlardan biriyle başlayın.</p>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {fields.map((field, index) => {
          const price = prices[index];
          const meta = getPriceMeta(price?.priceType);
          const expanded = Boolean(openAdvanced[field.id]);
          const amountError = errors.prices?.[index]?.amount;

          return (
            <div key={field.id} className={`card card-bordered border-${meta.color}`}>
              <div className="card-inner">
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
                  <div className="d-flex align-items-start gap-3">
                    <span className={`btn btn-icon btn-${meta.color} rounded-circle flex-shrink-0`}>
                      <em className={`icon ni ni-${meta.icon}`} />
                    </span>
                    <div>
                      <span className={`badge badge-dim bg-${meta.color} mb-1`}>{meta.label}</span>
                      <h6 className="title mb-0">Fiyat #{index + 1}</h6>
                      <p className="text-soft fs-12px mb-0">
                        {price?.regionId ? regionNameById.get(price.regionId) ?? "Bölge" : "Tüm bölgeler"}
                        {" · "}
                        {price?.customerGroupCode ? `${price.customerGroupCode} grubu` : "Tüm müşteriler"}
                        {price?.salesChannel ? ` · ${price.salesChannel}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-icon btn-outline-light"
                      disabled={index === 0}
                      onClick={() => swap(index, index - 1)}
                      title="Yukarı taşı"
                    >
                      <em className="icon ni ni-chevron-up" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-icon btn-outline-light"
                      disabled={index === fields.length - 1}
                      onClick={() => swap(index, index + 1)}
                      title="Aşağı taşı"
                    >
                      <em className="icon ni ni-chevron-down" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-icon btn-trigger text-danger"
                      onClick={() => remove(index)}
                      title="Fiyatı Sil"
                    >
                      <em className="icon ni ni-trash" />
                    </button>
                  </div>
                </div>

                <div className="row g-3 align-items-end">
                  <div className="col-lg-3">
                    <label className="form-label">Fiyat tipi</label>
                    <select
                      className="form-control form-select"
                      {...register(`prices.${index}.priceType`, { valueAsNumber: true })}
                    >
                      {PRICE_TYPES.map((pt) => (
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-3">
                    <label className="form-label">Bölge</label>
                    <select
                      className="form-control form-select"
                      {...register(`prices.${index}.regionId`, {
                        // Bölge seçildiğinde fiyatın para birimi bölgeninkiyle eşitlenir.
                        onChange: (event) =>
                          setValue(
                            `prices.${index}.currencyCode`,
                            resolveCurrency(event.target.value || undefined),
                            { shouldDirty: true }
                          ),
                      })}
                    >
                      <option value="">Tüm bölgeler</option>
                      {availableRegions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name} ({region.currencyCode})
                        </option>
                      ))}
                    </select>
                    {availableRegions.length === 0 && (
                      <div className="text-soft fs-12px mt-1">
                        Bölgeye özel fiyat için önce Bölgeler sayfasından bölge ekleyin.
                      </div>
                    )}
                  </div>

                  <div className="col-lg-4">
                    <label className="form-label">
                      Tutar <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-group-lg">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={`form-control ${amountError ? "is-invalid" : ""}`}
                        placeholder="0.00"
                        {...register(`prices.${index}.amount`, {
                          valueAsNumber: true,
                          required: "Tutar zorunludur",
                        })}
                      />
                      <input type="hidden" {...register(`prices.${index}.currencyCode`)} />
                      <span className="input-group-text">{resolveCurrency(price?.regionId)}</span>
                    </div>
                    {amountError && <div className="invalid-feedback d-block">{amountError.message}</div>}
                  </div>

                  <div className="col-lg-2">
                    <button
                      type="button"
                      className="btn btn-outline-light w-100"
                      onClick={() => toggleAdvanced(field.id)}
                    >
                      <em className={`icon ni ni-chevron-${expanded ? "up" : "down"} me-1`} />
                      Detaylar
                    </button>
                  </div>

                  {expanded && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label">Karşılaştırma Fiyatı</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          placeholder="0.00"
                          {...register(`prices.${index}.compareAtAmount`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Min. Miktar</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          placeholder="1"
                          {...register(`prices.${index}.minQuantity`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Maks. Miktar</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          placeholder="Sınır yok"
                          {...register(`prices.${index}.maxQuantity`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Geçerlilik Başlangıcı <span className="text-danger">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          className={`form-control ${errors.prices?.[index]?.validFrom ? "is-invalid" : ""}`}
                          {...register(`prices.${index}.validFrom`, {
                            required: "Başlangıç tarihi zorunludur",
                          })}
                        />
                        {errors.prices?.[index]?.validFrom && (
                          <div className="invalid-feedback">{errors.prices[index]?.validFrom?.message}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Geçerlilik Bitişi <span className="text-danger">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          className={`form-control ${errors.prices?.[index]?.validTo ? "is-invalid" : ""}`}
                          {...register(`prices.${index}.validTo`, {
                            required: "Bitiş tarihi zorunludur",
                            validate: (value) => {
                              const from = getValues(`prices.${index}.validFrom`);
                              if (from && value && value < from) {
                                return "Bitiş tarihi başlangıç tarihinden önce olamaz";
                              }
                              return true;
                            },
                          })}
                        />
                        {errors.prices?.[index]?.validTo && (
                          <div className="invalid-feedback">{errors.prices[index]?.validTo?.message}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Satış Kanalı</label>
                        <input
                          className="form-control"
                          placeholder="web, mobile, pos..."
                          {...register(`prices.${index}.salesChannel`)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Müşteri Grubu</label>
                        <input
                          className="form-control"
                          placeholder="retail, wholesale, dealer..."
                          {...register(`prices.${index}.customerGroupCode`)}
                        />
                      </div>
                    </>
                  )}
                </div>

                {!expanded && (
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-light"
                      onClick={() => setValue(`prices.${index}.customerGroupCode`, "dealer", { shouldDirty: true })}
                    >
                      Bayi
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-light"
                      onClick={() => setValue(`prices.${index}.salesChannel`, "web", { shouldDirty: true })}
                    >
                      Web
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-light"
                      onClick={() => setValue(`prices.${index}.priceType`, 4, { shouldDirty: true })}
                    >
                      Kampanya yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceMatrix;
