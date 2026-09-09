import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormField, FormPage, NumberInput, TextInput, Textarea } from "@/components/shared";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";
import {
  usePriceRevision,
  usePriceRevisionMutations,
} from "@/application/hooks/usePriceRevisions";
import {
  ADJUSTMENT_TYPE_OPTIONS,
  ROUNDING_MODE_OPTIONS,
  ROUNDING_STEP_OPTIONS,
} from "@/pages/pricing/components/revisionDisplay";
import { PRICE_ADJUSTMENT_TYPE } from "@/domain/types/productOperations.types";

const PriceRevisionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: revision, isLoading } = usePriceRevision(id);
  const { create, update } = usePriceRevisionMutations(id);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<number>(PRICE_ADJUSTMENT_TYPE.Percent);
  const [value, setValue] = useState("15");
  const [roundingMode, setRoundingMode] = useState(2);
  const [roundingStep, setRoundingStep] = useState("0.01");
  const [currencyCode, setCurrencyCode] = useState<string>(DEFAULT_CURRENCY_CODE);
  const [effectiveDate, setEffectiveDate] = useState("");

  useEffect(() => {
    if (!revision) return;
    setCode(revision.code);
    setName(revision.name);
    setDescription(revision.description ?? "");
    setAdjustmentType(revision.adjustmentType);
    setValue(String(revision.value));
    setRoundingMode(revision.roundingMode);
    setRoundingStep(revision.roundingStep != null ? String(revision.roundingStep) : "0.01");
    setCurrencyCode(revision.currencyCode ?? "");
    setEffectiveDate(revision.effectiveDate ? revision.effectiveDate.slice(0, 10) : "");
  }, [revision]);

  /**
   * Tutar bazlı zam para birimine bağlıdır: kapsamda TRY ve USD fiyatlar birlikte
   * varsa "5 ekle" anlamsızlaşır. Backend de bunu doğruluyor.
   */
  const currencyRequired =
    adjustmentType === PRICE_ADJUSTMENT_TYPE.Amount ||
    adjustmentType === PRICE_ADJUSTMENT_TYPE.SetValue;

  const saving = create.isPending || update.isPending;
  const canSubmit =
    name.trim().length > 0 &&
    value.trim().length > 0 &&
    (!currencyRequired || currencyCode.trim().length === 3);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || saving) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      adjustmentType,
      value: Number(value),
      roundingMode,
      roundingStep: roundingMode === 1 ? null : Number(roundingStep),
      currencyCode: currencyCode.trim() || null,
      effectiveDate: effectiveDate ? new Date(effectiveDate).toISOString() : null,
    };

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, payload: { ...payload, code } });
        showSuccess("Revizyon güncellendi. Önizleme sıfırlandı.");
        navigate(`/pricing/revisions/${id}`);
      } else {
        const created = await create.mutateAsync(payload);
        showSuccess("Revizyon oluşturuldu. Şimdi kapsamını seçin.");
        navigate(`/pricing/revisions/${created.id}`);
      }
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <FormPage
      title={isEdit ? `Zam: ${revision?.name ?? ""}` : "Yeni Zam"}
      headTitle={isEdit ? "Zam Revizyonunu Düzenle" : "Yeni Zam"}
      subtitle="Oranı ve yuvarlamayı belirleyin. Kapsam bir sonraki adımda seçilir."
      loading={isEdit && isLoading}
      saving={saving}
      submitDisabled={!canSubmit}
      submitLabel={isEdit ? "Güncelle" : "Devam Et"}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/pricing/revisions")}
    >
      <div className="card card-bordered">
        <div className="card-inner">
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
            <div className={isEdit ? "col-md-9" : "col-md-12"}>
              <TextInput
                label="Ad"
                required
                value={name}
                placeholder="2026 Temmuz genel zam"
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="col-md-4">
              <FormField label="Zam türü" htmlFor="revision-adjustment-type">
                <select
                  id="revision-adjustment-type"
                  className="form-select"
                  value={adjustmentType}
                  onChange={(event) => setAdjustmentType(Number(event.target.value))}
                >
                  {ADJUSTMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="col-md-4">
              <NumberInput
                label="Değer"
                required
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </div>

            <div className="col-md-4">
              <FormField label="Yuvarlama" htmlFor="revision-rounding-mode">
                <select
                  id="revision-rounding-mode"
                  className="form-select"
                  value={roundingMode}
                  onChange={(event) => setRoundingMode(Number(event.target.value))}
                >
                  {ROUNDING_MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {roundingMode !== 1 && (
              <div className="col-md-4">
                <FormField label="Yuvarlama adımı" htmlFor="revision-rounding-step">
                  <select
                    id="revision-rounding-step"
                    className="form-select"
                    value={roundingStep}
                    onChange={(event) => setRoundingStep(event.target.value)}
                  >
                    {ROUNDING_STEP_OPTIONS.map((step) => (
                      <option key={step} value={step}>
                        {step}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            )}

            <div className="col-md-4">
              <TextInput
                label="Geçerlilik tarihi"
                type="date"
                value={effectiveDate}
                hint="Boş bırakılırsa uygulandığı anda geçerli olur. İleri tarih verilirse o tarihten önce uygulanamaz."
                onChange={(event) => setEffectiveDate(event.target.value)}
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

      {isEdit && (
        <div className="alert alert-warning mt-3 mb-0">
          Oran ya da yuvarlama değişirse mevcut önizleme satırları silinir ve revizyon taslak durumuna döner.
        </div>
      )}
    </FormPage>
  );
};

export default PriceRevisionFormPage;
