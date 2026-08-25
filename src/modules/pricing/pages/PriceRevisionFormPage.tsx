import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";
import {
  usePriceRevision,
  usePriceRevisionMutations,
} from "@/modules/pricing/hooks/usePriceRevisions";
import {
  ADJUSTMENT_TYPE_OPTIONS,
  ROUNDING_MODE_OPTIONS,
  ROUNDING_STEP_OPTIONS,
} from "@/modules/pricing/components/revisionDisplay";
import { PRICE_ADJUSTMENT_TYPE } from "@/shared/types/productOperations.types";

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

  const handleSubmit = async () => {
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

  if (isEdit && isLoading) {
    return (
      <Content>
        <div className="text-center py-5">Yükleniyor…</div>
      </Content>
    );
  }

  return (
    <>
      <Head title={isEdit ? "Zam Revizyonunu Düzenle" : "Yeni Zam"} />
      <Content>
        <PageHeader
          title={isEdit ? `Zam: ${revision?.name ?? ""}` : "Yeni Zam"}
          description="Oranı ve yuvarlamayı belirleyin. Kapsam bir sonraki adımda seçilir."
          actions={
            <Button color="light" onClick={() => navigate("/pricing/revisions")}>
              <Icon name="arrow-left" className="me-1" />
              Listeye Dön
            </Button>
          }
        />

        <Block>
          <div className="card card-bordered">
            <div className="card-inner">
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
                <div className={isEdit ? "col-md-9" : "col-md-12"}>
                  <label className="form-label">
                    Ad <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    value={name}
                    placeholder="2026 Temmuz genel zam"
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Zam türü</label>
                  <select
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
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Değer <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                  />
                </div>

                {/* <div className="col-md-4">
                  <label className="form-label">
                    Para birimi {currencyRequired && <span className="text-danger">*</span>}
                  </label>
                  <input
                    className="form-control"
                    value={currencyCode}
                    maxLength={3}
                    placeholder={currencyRequired ? "TRY" : "Tümü"}
                    onChange={(event) => setCurrencyCode(event.target.value.toUpperCase())}
                  />
                  <div className="form-note">
                    {currencyRequired
                      ? "Tutar bazlı zam yalnızca tek bir para birimine uygulanabilir."
                      : "Boş bırakılırsa tüm para birimleri kapsama girer."}
                  </div>
                </div> */}

                <div className="col-md-4">
                  <label className="form-label">Yuvarlama</label>
                  <select
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
                </div>

                {roundingMode !== 1 && (
                  <div className="col-md-4">
                    <label className="form-label">Yuvarlama adımı</label>
                    <select
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
                  </div>
                )}

                <div className="col-md-4">
                  <label className="form-label">Geçerlilik tarihi</label>
                  <input
                    type="date"
                    className="form-control"
                    value={effectiveDate}
                    onChange={(event) => setEffectiveDate(event.target.value)}
                  />
                  <div className="form-note">
                    Boş bırakılırsa uygulandığı anda geçerli olur. İleri tarih verilirse o
                    tarihten önce uygulanamaz.
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

        {isEdit && (
          <Block>
            <div className="alert alert-warning">
              <Icon name="alert-circle" className="me-1" />
              Oran ya da yuvarlama değişirse mevcut önizleme satırları silinir ve revizyon
              taslak durumuna döner.
            </div>
          </Block>
        )}

        <Block>
          <div className="d-flex justify-content-end gap-2">
            <Button color="light" onClick={() => navigate("/pricing/revisions")}>
              Vazgeç
            </Button>
            <Button color="primary" disabled={!canSubmit || saving} onClick={handleSubmit}>
              {saving ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Devam Et"}
            </Button>
          </div>
        </Block>
      </Content>
    </>
  );
};

export default PriceRevisionFormPage;
