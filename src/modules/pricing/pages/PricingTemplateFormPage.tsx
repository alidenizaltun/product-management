import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import LookupSelect from "@/modules/shared/components/selects/LookupSelect";
import { useUnitDefinitionLookups } from "@/services/lookup/useLookups";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";
import {
  ADJUSTMENT_TYPES,
  adjustmentToForm,
  defaultAdjustment,
  emptyTier,
  formToAdjustment,
  numberToInput,
} from "@/modules/pricing/adjustment/adjustmentForm";
import type { AdjustmentFormState } from "@/modules/pricing/adjustment/adjustmentForm";
import {
  usePricingTemplate,
  usePricingTemplateMutations,
} from "@/modules/pricing/hooks/usePricingTemplates";
import { PRICING_TEMPLATE_KIND } from "@/shared/types/productOperations.types";
import type { ProductPricingRuleAdjustmentDto } from "@/shared/types/productOperations.types";

const ROUNDING_OPTIONS = [
  { value: "", label: "Yok" },
  { value: "ceil", label: "Yukarı yuvarla" },
  { value: "floor", label: "Aşağı yuvarla" },
  { value: "round", label: "En yakına yuvarla" },
];

const parsePayload = (payloadJson?: string): ProductPricingRuleAdjustmentDto => {
  if (!payloadJson) return defaultAdjustment;
  try {
    return JSON.parse(payloadJson) as ProductPricingRuleAdjustmentDto;
  } catch {
    return defaultAdjustment;
  }
};

const PricingTemplateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: template, isLoading } = usePricingTemplate(id);
  const { create, update } = usePricingTemplateMutations();
  const { data: unitDefinitions = [], isLoading: unitsLoading } = useUnitDefinitionLookups(true);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitDefinitionId, setUnitDefinitionId] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState(DEFAULT_CURRENCY_CODE);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");
  const [adjustment, setAdjustment] = useState<AdjustmentFormState>(() =>
    adjustmentToForm(defaultAdjustment)
  );

  useEffect(() => {
    if (!template) return;
    setCode(template.code);
    setName(template.name);
    setDescription(template.description ?? "");
    setUnitDefinitionId(template.unitDefinitionId ?? null);
    setCurrencyCode(template.currencyCode);
    setIsActive(template.isActive);
    setSortOrder(String(template.sortOrder));
    setAdjustment(adjustmentToForm(parsePayload(template.payloadJson)));
  }, [template]);

  const isUnitMode = adjustment.mode === "unit";
  const hasTiers = adjustment.tiers.length > 0;

  const updateAdjustment = <K extends keyof AdjustmentFormState>(
    key: K,
    value: AdjustmentFormState[K]
  ) => setAdjustment((current) => ({ ...current, [key]: value }));

  const updateTier = (index: number, key: "from" | "to" | "value", value: string) =>
    setAdjustment((current) => {
      const tiers = [...current.tiers];
      tiers[index] = { ...tiers[index], [key]: value };
      return { ...current, tiers };
    });

  const saving = create.isPending || update.isPending;

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (isUnitMode) return hasTiers || Boolean(adjustment.value.trim());
    return Boolean(adjustment.value.trim());
  }, [name, isUnitMode, hasTiers, adjustment.value]);

  const handleSubmit = async () => {
    const payload = formToAdjustment(adjustment);

    try {
      if (isEdit && id) {
        await update.mutateAsync({
          id,
          payload: {
            code,
            name: name.trim(),
            description: description.trim() || null,
            unitDefinitionId,
            currencyCode,
            payload,
            isActive,
            sortOrder: Number(sortOrder) || 0,
          },
        });
        showSuccess("Şablon güncellendi.");
      } else {
        await create.mutateAsync({
          name: name.trim(),
          description: description.trim() || null,
          templateKind: PRICING_TEMPLATE_KIND.PricingRule,
          unitDefinitionId,
          currencyCode,
          payload,
          isActive,
          sortOrder: Number(sortOrder) || 0,
        });
        showSuccess("Şablon oluşturuldu.");
      }
      navigate("/pricing/templates");
    } catch (error) {
      showApiError(error);
    }
  };

  if (isEdit && isLoading) {
    return (
      <Content>
        <div className="text-center py-5">Yükleniyor…</div>
      </Content>
    );
  }

  return (
    <>
      <Head title={isEdit ? "Şablonu Düzenle" : "Yeni Fiyat Şablonu"} />
      <Content>
        <PageHeader
          title={isEdit ? `Şablon: ${template?.name ?? ""}` : "Yeni Fiyat Şablonu"}
          description="Ürün bağımsız fiyatlandırma tanımı. Ürünlere uygulandığında değerler kopyalanır."
          actions={
            <Button color="light" onClick={() => navigate("/pricing/templates")}>
              <Icon name="arrow-left" className="me-1" />
              Listeye Dön
            </Button>
          }
        />

        <Block>
          <div className="card card-bordered">
            <div className="card-inner">
              <h6 className="title mb-3">Tanım</h6>
              <div className="row g-3">
                {isEdit && (
                  <div className="col-md-3">
                    <label className="form-label">Kod</label>
                    <input
                      className="form-control"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                    />
                  </div>
                )}
                <div className={isEdit ? "col-md-5" : "col-md-8"}>
                  <label className="form-label">
                    Ad <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    value={name}
                    placeholder="SMS Birim Fiyatı 2026"
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Para Birimi</label>
                  <input
                    className="form-control"
                    value={currencyCode}
                    maxLength={3}
                    onChange={(event) => setCurrencyCode(event.target.value.toUpperCase())}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Birim</label>
                  <LookupSelect
                    items={unitDefinitions}
                    isLoading={unitsLoading}
                    value={unitDefinitionId}
                    onChange={setUnitDefinitionId}
                    placeholder="Birim seçin (ör. SMS)"
                  />
                  <div className="form-note">
                    Şablon bir ürüne uygulandığında, üründe bu birim yoksa otomatik oluşturulur.
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Sıra</label>
                  <input
                    type="number"
                    className="form-control"
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <div className="custom-control custom-switch">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="template-active"
                      checked={isActive}
                      onChange={(event) => setIsActive(event.target.checked)}
                    />
                    <label className="custom-control-label" htmlFor="template-active">
                      Aktif
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Açıklama</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </Block>

        <Block>
          <div className="card card-bordered">
            <div className="card-inner">
              <h6 className="title mb-3">Fiyatlandırma</h6>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Hesaplama</label>
                  <select
                    className="form-select"
                    value={adjustment.mode}
                    onChange={(event) => updateAdjustment("mode", event.target.value)}
                  >
                    <option value="">Tek tutar</option>
                    <option value="unit">Birim başına</option>
                  </select>
                </div>

                {!isUnitMode && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label">Tür</label>
                      <select
                        className="form-select"
                        value={adjustment.type}
                        onChange={(event) => updateAdjustment("type", event.target.value)}
                      >
                        <option value="">Seçin…</option>
                        {ADJUSTMENT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Değer</label>
                      <input
                        className="form-control"
                        value={adjustment.value}
                        onChange={(event) => updateAdjustment("value", event.target.value)}
                      />
                    </div>
                  </>
                )}

                {isUnitMode && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label">Miktar alanı</label>
                      <input
                        className="form-control"
                        value={adjustment.unitField}
                        placeholder="feature.smsCount"
                        onChange={(event) => updateAdjustment("unitField", event.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Ücretsiz</label>
                      <input
                        className="form-control"
                        value={adjustment.freeUnits}
                        onChange={(event) => updateAdjustment("freeUnits", event.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Yuvarlama</label>
                      <select
                        className="form-select"
                        value={adjustment.rounding}
                        onChange={(event) => updateAdjustment("rounding", event.target.value)}
                      >
                        {ROUNDING_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {isUnitMode && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="title mb-0">Kademeler</h6>
                    <Button
                      size="sm"
                      color="light"
                      onClick={() => updateAdjustment("tiers", [...adjustment.tiers, emptyTier()])}
                    >
                      <Icon name="plus" className="me-1" />
                      Kademe Ekle
                    </Button>
                  </div>

                  {adjustment.tiers.length === 0 && (
                    <div className="alert alert-light">
                      Kademe yoksa birim fiyatı tek değer üzerinden hesaplanır.
                    </div>
                  )}

                  {adjustment.tiers.map((tier, index) => (
                    <div className="row g-2 align-items-end mb-2" key={index}>
                      <div className="col-3">
                        <label className="form-label">Başlangıç</label>
                        <input
                          className="form-control"
                          value={tier.from}
                          onChange={(event) => updateTier(index, "from", event.target.value)}
                        />
                      </div>
                      <div className="col-3">
                        <label className="form-label">Bitiş</label>
                        <input
                          className="form-control"
                          value={tier.to}
                          placeholder="Sınırsız"
                          onChange={(event) => updateTier(index, "to", event.target.value)}
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label">Birim fiyat</label>
                        <input
                          className="form-control"
                          value={tier.value}
                          onChange={(event) => updateTier(index, "value", event.target.value)}
                        />
                      </div>
                      <div className="col-2">
                        <Button
                          color="light"
                          className="btn-icon text-danger"
                          onClick={() =>
                            updateAdjustment(
                              "tiers",
                              adjustment.tiers.filter((_, tierIndex) => tierIndex !== index)
                            )
                          }
                        >
                          <Icon name="trash" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(adjustment.conditions.length > 0 ||
                adjustment.minAdjustment ||
                adjustment.maxAdjustment ||
                adjustment.minFinalPrice ||
                adjustment.maxFinalPrice) && (
                <div className="alert alert-light mt-3">
                  Bu şablon koşul ve/veya limit tanımları içeriyor. Bunlar burada
                  düzenlenmez ama kaydederken korunur; değiştirmek için şablonu bir ürüne
                  uygulayıp kural panelinden düzenleyin.
                </div>
              )}
            </div>
          </div>
        </Block>

        <Block>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" onClick={() => navigate("/pricing/templates")}>
              Vazgeç
            </Button>
            <Button color="primary" disabled={!canSubmit || saving} onClick={handleSubmit}>
              {saving ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
          {isEdit && template && (
            <div className="form-note text-end mt-2">
              Güncel sürüm: v{template.version}. Fiyat gövdesi değişirse sürüm artar ve bu
              şablondan türemiş {numberToInput(template.usageCount) || "0"} kural geride kalır.
            </div>
          )}
        </Block>
      </Content>
    </>
  );
};

export default PricingTemplateFormPage;
