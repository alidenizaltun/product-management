import React, { useId, useMemo } from "react";
import { Button } from "reactstrap";
import FormField from "@/components/shared/FormField";
import HelpLabel from "@/pages/pricing/adjustment/HelpLabel";
import {
  ADJUSTMENT_TYPES,
  CONDITION_OPERATORS,
  emptyCondition,
  emptyTier,
  formatFieldLabel,
} from "@/pages/pricing/adjustment/adjustmentForm";
import type {
  AdjustmentFormState,
  ConditionFormState,
  TierFormState,
} from "@/pages/pricing/adjustment/adjustmentForm";

const CALCULATION_MODE_HELP = (
  <>
    <p className="mb-2">
      Fiyat etkisinin tüm satışa tek değerle mi, yoksa satın alınan miktarın girdiği aralığa göre mi uygulanacağını seçer.
    </p>
    <p className="mb-2">
      <strong>Sabit:</strong> Aynı etki her miktarda geçerlidir. Örnek: 1.000 TL plana %10 düşür seçiliyse sonuç 900 TL olur. 5 kullanıcı da 50 kullanıcı da aynı orandır.
    </p>
    <p className="mb-0">
      <strong>Kademeli:</strong> Miktarın girdiği aralığa göre farklı fiyat uygulanır. Örnek: 1–10 kullanıcı 50 TL/kullanıcı, 11–50 kullanıcı 40 TL/kullanıcı. 8 kullanıcı 50 TL, 20 kullanıcı 40 TL üzerinden hesaplanır.
    </p>
  </>
);

const DEFAULT_EMPTY_CONDITIONS_HINT =
  "Ek koşul yok. Üstte seçilen satış planı ve ürün birimi kapsamı kullanılacak.";

export interface ConditionFieldOption {
  value: string;
  label: string;
}

interface PricingAdjustmentFieldsProps {
  value: AdjustmentFormState;
  onChange: (next: AdjustmentFormState) => void;
  engineOpen: boolean;
  onEngineOpenChange: (open: boolean) => void;
  conditionFieldOptions?: ConditionFieldOption[];
  emptyConditionsHint?: string;
  /** Rendered in the same row as the advanced-settings toggle (rule validity fields). */
  leadingAdvancedRow?: React.ReactNode;
}

const PricingAdjustmentFields: React.FC<PricingAdjustmentFieldsProps> = ({
  value,
  onChange,
  engineOpen,
  onEngineOpenChange,
  conditionFieldOptions = [],
  emptyConditionsHint = DEFAULT_EMPTY_CONDITIONS_HINT,
  leadingAdvancedRow,
}) => {
  const baseId = useId();
  const isUnitMode = value.mode === "unit";

  const fieldOptions = useMemo(() => {
    const merged = new Map<string, ConditionFieldOption>();
    conditionFieldOptions.forEach((field) => merged.set(field.value, field));
    value.conditions.forEach((condition) => {
      const field = condition.field.trim();
      if (field && !merged.has(field)) {
        merged.set(field, { value: field, label: formatFieldLabel(field) });
      }
    });
    return [...merged.values()];
  }, [conditionFieldOptions, value.conditions]);

  const update = <K extends keyof AdjustmentFormState>(key: K, fieldValue: AdjustmentFormState[K]) => {
    onChange({ ...value, [key]: fieldValue });
  };

  const updateMode = (mode: string) => {
    onChange({ ...value, mode });
    if (mode === "unit") onEngineOpenChange(true);
  };

  const updateTier = <K extends keyof TierFormState>(index: number, key: K, fieldValue: TierFormState[K]) => {
    const tiers = [...value.tiers];
    tiers[index] = { ...tiers[index], [key]: fieldValue };
    onChange({ ...value, tiers });
  };

  const addTier = () => update("tiers", [...value.tiers, emptyTier()]);

  const removeTier = (index: number) => {
    update(
      "tiers",
      value.tiers.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const updateCondition = <K extends keyof ConditionFormState>(
    index: number,
    key: K,
    fieldValue: ConditionFormState[K]
  ) => {
    const conditions = [...value.conditions];
    conditions[index] = { ...conditions[index], [key]: fieldValue };
    onChange({ ...value, conditions });
  };

  const addCondition = () => update("conditions", [...value.conditions, emptyCondition()]);

  const removeCondition = (index: number) => {
    update(
      "conditions",
      value.conditions.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  return (
    <>
      <div className="col-12">
        <div className="card card-bordered bg-lighter mb-0">
          <div className="card-inner">
            <div className="row g-3 align-items-end">
              <div className="col-12">
                <span className="overline-title text-primary">
                  <HelpLabel help="Bu bölüm, kural çalıştığında ürün fiyatında ne yapılacağını tanımlar. Önce fiyat artırılsın mı düşürülsün mü seçilir, sonra bu değişimin yüzde, sabit tutar veya çarpan olarak nasıl hesaplanacağı belirlenir.">
                    Fiyat aksiyonu
                  </HelpLabel>
                </span>
              </div>
              <div className="col-md-3">
                <FormField
                  label={<HelpLabel help={CALCULATION_MODE_HELP}>Hesaplama modu</HelpLabel>}
                  htmlFor={`${baseId}-mode`}
                >
                  <select
                    id={`${baseId}-mode`}
                    className="form-select"
                    value={value.mode}
                    onChange={(event) => updateMode(event.target.value)}
                  >
                    <option value="">Sabit</option>
                    <option value="unit">Kademeli</option>
                  </select>
                </FormField>
              </div>
              <div className="col-md-3">
                <FormField
                  label={
                    <HelpLabel help="Kural tetiklendiğinde fiyatın hangi yöne değişeceğini seçer. Düşür seçeneği indirim uygular; artır seçeneği fiyatın üzerine ekleme yapar.">
                      Fiyat yönü
                    </HelpLabel>
                  }
                  htmlFor={`${baseId}-operation`}
                >
                  <select
                    id={`${baseId}-operation`}
                    className="form-select"
                    value={value.operation === "subtract" ? "subtract" : "add"}
                    onChange={(event) =>
                      update("operation", event.target.value === "subtract" ? "subtract" : "")
                    }
                  >
                    <option value="subtract">Düşür</option>
                    <option value="add">Artır</option>
                  </select>
                </FormField>
              </div>
              <div className="col-md-3">
                <FormField
                  label={
                    <HelpLabel help="Fiyat değişiminin hangi yöntemle hesaplanacağını belirtir. Yüzdeyle seçerseniz değer alanı yüzde oranıdır; sabit tutarda doğrudan para tutarıdır; çarpanda fiyat belirlenen katsayıyla çarpılır.">
                      Değişim türü
                    </HelpLabel>
                  }
                  htmlFor={`${baseId}-type`}
                >
                  <select
                    id={`${baseId}-type`}
                    className="form-select"
                    value={value.type || "fixed"}
                    disabled={isUnitMode}
                    onChange={(event) => update("type", event.target.value)}
                  >
                    <option value="fixed">Sabit tutarla</option>
                    <option value="percentage">Yüzdeyle</option>
                    <option value="multiplier">Çarpanla</option>
                  </select>
                </FormField>
              </div>
              <div className="col-md-3">
                <FormField
                  label={
                    <HelpLabel help="Seçilen değişim türünün sayısal karşılığıdır. Yüzde indirimi için 10 yazmak yüzde 10 anlamına gelir; sabit tutar için para tutarı, çarpan için katsayı olarak yorumlanır.">
                      Değişim değeri
                    </HelpLabel>
                  }
                  htmlFor={`${baseId}-value`}
                >
                  <input
                    id={`${baseId}-value`}
                    className="form-control"
                    type="number"
                    step="0.0001"
                    placeholder={isUnitMode ? "Kademeden gelir" : "10"}
                    value={value.value}
                    disabled={isUnitMode}
                    onChange={(event) => update("value", event.target.value)}
                  />
                </FormField>
              </div>
              {isUnitMode && (
                <div className="col-12 border-top pt-3 mt-1">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="title mb-0">
                      <HelpLabel help="Birim bazlı fiyatlandırmada farklı miktar aralıklarına farklı fiyat etkisi tanımlamak için kullanılır. Örneğin 1-10 kullanıcı için bir tutar, 11-50 kullanıcı için farklı bir tutar belirleyebilirsiniz.">
                        Fiyat kademeleri
                      </HelpLabel>
                    </h6>
                    <Button color="light" size="sm" type="button" onClick={addTier}>
                      <em className="icon ni ni-plus me-1" />
                      Kademe ekle
                    </Button>
                  </div>
                  {value.tiers.length ? (
                    <div className="table-responsive">
                      <table className="table table-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>
                              <HelpLabel help="Bu kademenin hangi miktardan itibaren geçerli olacağını belirtir. Örneğin 1 yazarsanız kademe 1 birimden başlar.">
                                Aralık başlangıcı
                              </HelpLabel>
                            </th>
                            <th>
                              <HelpLabel help="Bu kademenin hangi miktara kadar geçerli olacağını belirtir. Boş bırakılırsa üst sınır olmadan devam eden son kademe olarak yorumlanabilir.">
                                Aralık bitişi
                              </HelpLabel>
                            </th>
                            <th>
                              <HelpLabel help="Bu kademede fiyat etkisinin yüzde, sabit tutar veya çarpan olarak mı uygulanacağını seçer.">
                                Kademe türü
                              </HelpLabel>
                            </th>
                            <th>
                              <HelpLabel help="Kademe türünün sayısal değeridir. Yüzde türünde oran, sabit tutarda para tutarı, çarpanda katsayı olarak kullanılır.">
                                Kademe değeri
                              </HelpLabel>
                            </th>
                            <th className="text-end">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {value.tiers.map((tier, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  className="form-control"
                                  type="number"
                                  aria-label={`Kademe ${index + 1} aralık başlangıcı`}
                                  value={tier.from}
                                  onChange={(event) => updateTier(index, "from", event.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  className="form-control"
                                  type="number"
                                  aria-label={`Kademe ${index + 1} aralık bitişi`}
                                  value={tier.to}
                                  onChange={(event) => updateTier(index, "to", event.target.value)}
                                />
                              </td>
                              <td>
                                <select
                                  className="form-select"
                                  aria-label={`Kademe ${index + 1} türü`}
                                  value={tier.type}
                                  onChange={(event) => updateTier(index, "type", event.target.value)}
                                >
                                  {ADJUSTMENT_TYPES.map((item) => (
                                    <option key={item.value} value={item.value}>
                                      {item.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  className="form-control"
                                  type="number"
                                  step="0.0001"
                                  aria-label={`Kademe ${index + 1} değeri`}
                                  value={tier.value}
                                  onChange={(event) => updateTier(index, "value", event.target.value)}
                                />
                              </td>
                              <td className="text-end">
                                <Button color="danger" outline size="sm" type="button" onClick={() => removeTier(index)}>
                                  Sil
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-soft fs-13px mb-0">
                      Henüz kademe eklenmedi. Farklı miktar aralıkları tanımlamak için "Kademe ekle" butonunu kullanın.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {leadingAdvancedRow}
      <div className={leadingAdvancedRow ? "col-md-3 d-flex align-items-end" : "col-12 d-flex justify-content-end"}>
        <Button
          color="light"
          outline
          type="button"
          className={leadingAdvancedRow ? "w-100" : undefined}
          onClick={() => onEngineOpenChange(!engineOpen)}
        >
          <em className={`icon ni ni-chevron-${engineOpen ? "up" : "down"} me-1`} />
          Gelişmiş ayarlar
        </Button>
      </div>

      {engineOpen && (
        <div className="col-12">
          <div className="card card-bordered mb-0">
            <div className="card-inner">
              <h6 className="overline-title text-primary mb-3">
                <HelpLabel help="Bu alanlar kuralın teknik çalışma biçimini belirler. Çoğu standart indirim veya artırım için kapalı kalabilir; öncelik, ek koşul, birim bazlı kademe veya fiyat limitleri gerektiğinde kullanılır.">
                  Gelişmiş ayarlar
                </HelpLabel>
              </h6>

              <div className="pricing-rule-sections">
                <div className="pricing-rule-section">
                  <h6 className="title mb-3">Kademe ayarları</h6>
                  <div className={`row g-3 ${isUnitMode ? "row-cols-1 row-cols-md-5" : "row-cols-1 row-cols-md-2"}`}>
                    {isUnitMode && (
                      <>
                        <div className="col">
                          <FormField
                            label={
                              <HelpLabel help="Fiyat hesaplamasına dahil edilmeyecek başlangıç miktarıdır. Örneğin 5 ücretsiz kullanıcı varsa ilk 5 kullanıcı ücretlendirilmez, hesaplama kalan miktardan başlar.">
                                Ücretsiz miktar
                              </HelpLabel>
                            }
                            htmlFor={`${baseId}-free-units`}
                          >
                            <input
                              id={`${baseId}-free-units`}
                              className="form-control"
                              type="number"
                              value={value.freeUnits}
                              onChange={(event) => update("freeUnits", event.target.value)}
                            />
                          </FormField>
                        </div>
                        <div className="col">
                          <FormField
                            label={
                              <HelpLabel help="Birim miktarı tam sayı değilse nasıl yuvarlanacağını belirler. Yukarı seçeneği eksik kalan parçayı bir üst birime tamamlar; aşağı, alt tam sayıya indirir; en yakın, matematiksel yuvarlama yapar.">
                                Miktar yuvarlama
                              </HelpLabel>
                            }
                            htmlFor={`${baseId}-rounding`}
                          >
                            <select
                              id={`${baseId}-rounding`}
                              className="form-select"
                              value={value.rounding}
                              onChange={(event) => update("rounding", event.target.value)}
                            >
                              <option value="">Seçiniz</option>
                              <option value="ceil">Yukarı</option>
                              <option value="floor">Aşağı</option>
                              <option value="round">En yakın</option>
                              <option value="none">Yok</option>
                            </select>
                          </FormField>
                        </div>
                        <div className="col">
                          <FormField
                            label={
                              <HelpLabel help="Ek koşullardan kaç tanesinin sağlanması gerektiğini belirler. Tüm koşullar seçilirse her koşul doğru olmalıdır; herhangi biri seçilirse koşullardan birinin doğru olması yeterlidir.">
                                Koşul mantığı
                              </HelpLabel>
                            }
                            htmlFor={`${baseId}-conditions-operator`}
                          >
                            <select
                              id={`${baseId}-conditions-operator`}
                              className="form-select"
                              value={value.conditionsOperator}
                              onChange={(event) =>
                                update("conditionsOperator", event.target.value as "all" | "any")
                              }
                            >
                              <option value="all">Tüm koşullar sağlansın</option>
                              <option value="any">Herhangi biri sağlansın</option>
                            </select>
                          </FormField>
                        </div>
                      </>
                    )}
                    <div className="col">
                      <FormField
                        label={
                          <HelpLabel help="Kural uygulandıktan sonra oluşacak son satış fiyatının inebileceği en düşük değerdir. Özellikle indirimlerde fiyatın belirli bir tabanın altına düşmesini engellemek için kullanılır.">
                            Minimum son fiyat
                          </HelpLabel>
                        }
                        htmlFor={`${baseId}-min-final`}
                      >
                        <input
                          id={`${baseId}-min-final`}
                          className="form-control"
                          type="number"
                          value={value.minFinalPrice}
                          onChange={(event) => update("minFinalPrice", event.target.value)}
                        />
                      </FormField>
                    </div>
                    <div className="col">
                      <FormField
                        label={
                          <HelpLabel help="Kural uygulandıktan sonra oluşacak son satış fiyatının çıkabileceği en yüksek değerdir. Artırım veya çarpan kullanılan kurallarda son fiyatı tavan değerle sınırlamak için kullanılır.">
                            Maksimum son fiyat
                          </HelpLabel>
                        }
                        htmlFor={`${baseId}-max-final`}
                      >
                        <input
                          id={`${baseId}-max-final`}
                          className="form-control"
                          type="number"
                          value={value.maxFinalPrice}
                          onChange={(event) => update("maxFinalPrice", event.target.value)}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>

                <div className="pricing-rule-section">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="title mb-0">
                      <HelpLabel help="Kuralın sadece belirli veriler sağlandığında çalışmasını istiyorsanız ek koşul ekleyin. Örneğin miktar belirli bir sayının üzerindeyse veya belirli bir özellik değeri varsa kural çalışabilir.">
                        Ek koşullar
                      </HelpLabel>
                    </h6>
                    <Button color="light" size="sm" type="button" onClick={addCondition}>
                      <em className="icon ni ni-plus me-1" />
                      Koşul ekle
                    </Button>
                  </div>
                  <div className="d-flex flex-column gap-3">
                    {value.conditions.map((condition, index) => (
                      <div className="row g-3 align-items-end" key={index}>
                        <div className="col-md-4">
                          <FormField
                            label={
                              <HelpLabel help="Koşulun hangi veri alanına bakacağını seçer. Miktar, kullanıcı sayısı, seçili pakete atanan diğer birimlerin miktarı veya fiyat hesaplamasında kullanılan özel bir alan olabilir.">
                                Koşul alanı
                              </HelpLabel>
                            }
                            htmlFor={`${baseId}-condition-field-${index}`}
                          >
                            <select
                              id={`${baseId}-condition-field-${index}`}
                              className="form-select"
                              value={condition.field}
                              onChange={(event) => updateCondition(index, "field", event.target.value)}
                            >
                              <option value="">Alan seçiniz</option>
                              {fieldOptions.map((field) => (
                                <option key={field.value} value={field.value}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                          </FormField>
                        </div>
                        <div className="col-md-3">
                          <FormField
                            label={
                              <HelpLabel help="Seçilen alanın beklenen değerle nasıl karşılaştırılacağını belirtir. Eşittir, büyüktür, küçüktür veya içerir gibi operatörler kuralın ne zaman geçerli olacağını belirler.">
                                Koşul işleci
                              </HelpLabel>
                            }
                            htmlFor={`${baseId}-condition-operator-${index}`}
                          >
                            <select
                              id={`${baseId}-condition-operator-${index}`}
                              className="form-select"
                              value={condition.operator}
                              onChange={(event) => updateCondition(index, "operator", event.target.value)}
                            >
                              <option value="">Seçiniz</option>
                              {CONDITION_OPERATORS.map((operator) => (
                                <option key={operator.value} value={operator.value}>
                                  {operator.label}
                                </option>
                              ))}
                            </select>
                          </FormField>
                        </div>
                        <div className="col-md-3">
                          <FormField
                            label={
                              <HelpLabel help="Koşul alanının karşılaştırılacağı beklenen değerdir. Örneğin miktar alanı için 10 yazarsanız seçilen karşılaştırma işlemine göre 10 eşiği kullanılır.">
                                Koşul değeri
                              </HelpLabel>
                            }
                            htmlFor={`${baseId}-condition-value-${index}`}
                          >
                            <input
                              id={`${baseId}-condition-value-${index}`}
                              className="form-control"
                              value={condition.value}
                              onChange={(event) => updateCondition(index, "value", event.target.value)}
                              disabled={condition.operator === "exists"}
                            />
                          </FormField>
                        </div>
                        <div className="col-md-2 text-end">
                          <Button color="danger" outline size="sm" type="button" onClick={() => removeCondition(index)}>
                            Sil
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!value.conditions.length && (
                      <p className="text-soft fs-13px mb-0">{emptyConditionsHint}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PricingAdjustmentFields;
