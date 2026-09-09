import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LookupSelect from "@/components/shared/selects/LookupSelect";
import { Checkbox, FormField, FormPage, TextInput, Textarea } from "@/components/shared";
import { useUnitDefinitionLookups } from "@/application/hooks/useLookups";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";
import {
  adjustmentToForm,
  defaultAdjustment,
  formToAdjustment,
  numberToInput,
} from "@/pages/pricing/adjustment/adjustmentForm";
import type { AdjustmentFormState } from "@/pages/pricing/adjustment/adjustmentForm";
import PricingAdjustmentFields from "@/pages/pricing/adjustment/PricingAdjustmentFields";
import {
  usePricingTemplate,
  usePricingTemplateMutations,
} from "@/application/hooks/usePricingTemplates";
import { PRICING_TEMPLATE_KIND } from "@/domain/types/productOperations.types";
import type { ProductPricingRuleAdjustmentDto } from "@/domain/types/productOperations.types";

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
  const [adjustment, setAdjustment] = useState<AdjustmentFormState>(() =>
    adjustmentToForm(defaultAdjustment)
  );
  const [engineOpen, setEngineOpen] = useState(false);

  useEffect(() => {
    if (!template) return;
    setCode(template.code);
    setName(template.name);
    setDescription(template.description ?? "");
    setUnitDefinitionId(template.unitDefinitionId ?? null);
    setCurrencyCode(template.currencyCode);
    setIsActive(template.isActive);
    const nextAdjustment = adjustmentToForm(parsePayload(template.payloadJson));
    setAdjustment(nextAdjustment);
    setEngineOpen(nextAdjustment.mode === "unit");
  }, [template]);

  const isUnitMode = adjustment.mode === "unit";
  const hasTiers = adjustment.tiers.length > 0;

  const saving = create.isPending || update.isPending;

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (isUnitMode) return hasTiers || Boolean(adjustment.value.trim());
    return Boolean(adjustment.value.trim());
  }, [name, isUnitMode, hasTiers, adjustment.value]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || saving) return;

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
            sortOrder: template?.sortOrder ?? 0,
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
          sortOrder: 0,
        });
        showSuccess("Şablon oluşturuldu.");
      }
      navigate("/pricing/templates");
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <FormPage
      title={isEdit ? `Şablon: ${template?.name ?? ""}` : "Yeni Fiyat Şablonu"}
      headTitle={isEdit ? "Şablonu Düzenle" : "Yeni Fiyat Şablonu"}
      subtitle="Ürün bağımsız fiyatlandırma tanımı. Ürünlere uygulandığında değerler kopyalanır."
      loading={isEdit && isLoading}
      saving={saving}
      submitDisabled={!canSubmit}
      submitLabel={isEdit ? "Güncelle" : "Oluştur"}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/pricing/templates")}
      stickySave
    >
      <div className="card card-bordered mb-4">
        <div className="card-inner">
          <h6 className="title mb-3">Tanım</h6>
          <div className="row g-3">
            {isEdit && (
              <div className="col-md-3">
                <TextInput
                  label="Kod"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>
            )}
            <div className={isEdit ? "col-md-5" : "col-md-8"}>
              <TextInput
                label="Ad"
                required
                value={name}
                placeholder="SMS Birim Fiyatı 2026"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="col-md-4">
              <TextInput
                label="Para Birimi"
                value={currencyCode}
                maxLength={3}
                onChange={(event) => setCurrencyCode(event.target.value.toUpperCase())}
              />
            </div>
            <div className="col-md-6">
              <FormField
                label="Birim"
                hint="Şablon bir ürüne uygulandığında, üründe bu birim yoksa otomatik oluşturulur."
              >
                <LookupSelect
                  items={unitDefinitions}
                  isLoading={unitsLoading}
                  value={unitDefinitionId}
                  onChange={setUnitDefinitionId}
                  placeholder="Birim seçin (ör. SMS)"
                />
              </FormField>
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <Checkbox
                label="Aktif"
                switchStyle
                id="template-active"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
            </div>
            <div className="col-12">
              <Textarea
                label="Açıklama"
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-bordered">
        <div className="card-inner">
          <h6 className="title mb-3">Fiyatlandırma</h6>
          <div className="row g-3">
            <PricingAdjustmentFields
              value={adjustment}
              onChange={setAdjustment}
              engineOpen={engineOpen}
              onEngineOpenChange={setEngineOpen}
              emptyConditionsHint="Ek koşul yok. Şablon ürüne uygulandığında satış planı ve ürün birimi kapsamı o kuralda seçilir."
            />
          </div>
        </div>
      </div>

      {isEdit && template && (
        <div className="form-note text-end mt-2">
          Güncel sürüm: v{template.version}. Fiyat gövdesi değişirse sürüm artar ve bu
          şablondan türemiş {numberToInput(template.usageCount) || "0"} kural geride kalır.
        </div>
      )}
    </FormPage>
  );
};

export default PricingTemplateFormPage;
