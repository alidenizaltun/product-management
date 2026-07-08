import React, { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import ProductUnitsTab from "@/modules/products/components/editor/ProductUnitsTab";
import LicenseOfferingsTab from "@/modules/products/components/editor/LicenseOfferingsTab";
import SoftwarePricingTiersTab from "@/modules/products/components/editor/SoftwarePricingTiersTab";
import type { ProductFormValues } from "@/modules/products/types/productEditor.types";
import type {
    ProductLicenseOfferingDto,
    ProductPricingRuleDto,
    ProductUnitDto,
    ProductVariantDto,
} from "@/shared/types/productOperations.types";

type ProductUnitOption = ProductUnitDto & { _tempId?: string };
type LicenseOfferingOption = ProductLicenseOfferingDto & { _tempId?: string };
const UNIT_DRAG_MIME = "application/x-product-unit-ref";

interface SoftwarePricingStudioProps {
    productId?: string;
    licenseOfferings: LicenseOfferingOption[];
    productUnits: ProductUnitOption[];
    variants?: ProductVariantDto[];
    draftRules?: ProductPricingRuleDto[];
    onDraftRulesChange?: (rules: ProductPricingRuleDto[]) => void;
}

const getUnitKey = (unit: { id?: string; _tempId?: string }) =>
    unit.id ? `id:${unit.id}` : unit._tempId ? `temp:${unit._tempId}` : "";

const getUnitReferenceKeys = (item: {
    productUnitId?: string | null;
    productUnitTempId?: string | null;
    productUnitIds?: string[];
    productUnitTempIds?: string[];
}) => [
    ...(item.productUnitIds?.length ? item.productUnitIds : item.productUnitId ? [item.productUnitId] : []).map((id) => `id:${id}`),
    ...(item.productUnitTempIds?.length ? item.productUnitTempIds : item.productUnitTempId ? [item.productUnitTempId] : []).map((id) => `temp:${id}`),
];

const getUnitLabel = (unit: { name?: string; code?: string }) =>
    unit.name?.trim() || unit.code?.trim() || "Adsız birim";

const HelpInfo: React.FC<{ text: string }> = ({ text }) => (
    <span className="software-pricing-studio-help" title={text} aria-label={text}>
        <em className="icon ni ni-info" />
    </span>
);

const SoftwarePricingStudio: React.FC<SoftwarePricingStudioProps> = ({
    productId,
    licenseOfferings,
    productUnits,
    variants = [],
    draftRules,
    onDraftRulesChange,
}) => {
    const { control } = useFormContext<ProductFormValues>();
    const formUnits = useWatch({ control, name: "productUnits" }) ?? [];
    const formOfferings = useWatch({ control, name: "licenseOfferings" }) ?? [];
    const formRules = useWatch({ control, name: "pricingRules" }) ?? [];

    const visibleUnits = productId ? productUnits : formUnits;
    const visibleOfferings = productId ? licenseOfferings : formOfferings;
    const visibleRules = formRules;
    const activeUnits = visibleUnits.filter((unit) => unit.isActive);
    const activeOfferings = visibleOfferings.filter((offering) => offering.isActive);
    const activeRules = visibleRules.filter((rule) => rule.isActive);
    const [skipUnitPricing, setSkipUnitPricing] = useState(false);
    const canConfigureOfferings = activeUnits.length > 0 || skipUnitPricing;
    const canConfigureRules = canConfigureOfferings && activeOfferings.length > 0;

    useEffect(() => {
        if (activeUnits.length === 0 && activeOfferings.length > 0) {
            setSkipUnitPricing(true);
        }
    }, [activeOfferings.length, activeUnits.length]);

    const readiness = [
        {
            label: "Birim kararı",
            done: canConfigureOfferings,
            value: activeUnits.length ? `${activeUnits.length} aktif` : skipUnitPricing ? "Parametresiz" : "Bekliyor",
        },
        {
            label: "Plan",
            done: canConfigureRules,
            value: activeOfferings.length ? `${activeOfferings.length} aktif` : "Eksik",
        },
        {
            label: "Kural",
            done: true,
            value: activeRules.length ? `${activeRules.length} aktif` : "Opsiyonel",
        },
    ];

    return (
        <div className="software-pricing-studio">
            <div className="software-pricing-studio-summary mb-4">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="overline-title text-primary mb-0">Fiyatlandırma Stüdyosu</span>
                        <HelpInfo text="Yazılım fiyatlandırması birim, satış planı ve dinamik kuraldan oluşur. Üstteki birimleri aşağıdaki plan veya kural alanlarına sürükleyerek bağlantı kurabilirsiniz." />
                    </div>
                    <h5 className="title mb-0">Birim, plan ve kuralları tek akışta yönetin</h5>
                </div>
                <div className="software-pricing-studio-metrics">
                    {readiness.map((item) => (
                        <div className={`software-pricing-studio-metric ${item.done ? "is-ready" : "is-missing"}`} key={item.label}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                        </div>
                    ))}
                </div>
            </div>

            <div className="software-pricing-studio-flow">
                <section className="software-pricing-studio-step">
                    <div className="software-pricing-studio-step-head">
                        <span className="software-pricing-studio-step-no">1</span>
                        <div>
                            <h6 className="title mb-1">Ürün Birimleri</h6>
                            <p className="text-soft fs-13px mb-0">Planların ve kuralların kullanacağı ürün içi fiyatlandırma birimlerini kurun.</p>
                        </div>
                    </div>
                    <div className="alert alert-info d-flex align-items-start gap-2 py-2 mb-3 h-100">
                        <em className="icon ni ni-info mt-1" />
                        <span>
                            Yazılım fiyatı kullanıcı, lisans, modül, API çağrısı gibi bir parametreye göre değişiyorsa önce burada o birimleri tanımlayın. Ürün sabit paket fiyatıyla satılacaksa aşağıdaki seçeneği işaretleyip paket adımına geçebilirsiniz.
                        </span>
                    </div>
                    <ProductUnitsTab productId={productId} />
                    <div className="software-pricing-studio-decision mt-3">
                        <div className="form-check form-switch">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="software-pricing-no-unit"
                                checked={skipUnitPricing}
                                disabled={activeUnits.length > 0}
                                onChange={(event) => setSkipUnitPricing(event.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="software-pricing-no-unit">
                                Bu ürün için fiyatlandırma parametresi yok
                            </label>
                        </div>
                        <p className="text-soft fs-12px mb-0">
                            Bu seçim, paketlerin herhangi bir ürün birimine bağlanmadan oluşturulacağını belirtir. Sonradan birim eklerseniz paket ve kural adımlarında o birimleri kullanabilirsiniz.
                        </p>
                    </div>
                </section>

                {activeUnits.length > 0 && (
                    <div className="software-pricing-studio-unit-tray">
                        <div className="software-pricing-studio-unit-tray-head">
                            <div>
                                <div className="d-flex align-items-center gap-2">
                                    <h6 className="title mb-0">Birim Paleti</h6>
                                    <HelpInfo text="Birimi tutup bir satış planındaki veya dinamik kuraldaki ürün birimi alanına bırakın. Bıraktığınız alan o birimi otomatik seçer." />
                                </div>
                                <span className="text-soft fs-12px">Paket ve kural adımlarında sabit kalır.</span>
                            </div>
                        </div>
                        <div className="software-pricing-studio-unit-list">
                            {visibleUnits.map((unit) => {
                                const unitKey = getUnitKey(unit);
                                const linkedOfferings = visibleOfferings.filter((offering) =>
                                    getUnitReferenceKeys(offering).includes(unitKey)
                                );
                                const linkedRules = visibleRules.filter((rule) =>
                                    getUnitReferenceKeys(rule).includes(unitKey)
                                );

                                return (
                                    <button
                                        type="button"
                                        className="software-pricing-studio-unit-chip"
                                        key={unitKey || unit.code || unit.name}
                                        draggable={Boolean(unitKey)}
                                        onDragStart={(event) => {
                                            event.dataTransfer.setData(UNIT_DRAG_MIME, unitKey);
                                            event.dataTransfer.effectAllowed = "copy";
                                        }}
                                        title="Plan veya kural birimi alanına sürükleyin"
                                    >
                                        <em className="icon ni ni-drag" />
                                        <strong>{getUnitLabel(unit)}</strong>
                                        {unit.isDefault && <span className="badge bg-primary">Varsayılan</span>}
                                        <span className="software-pricing-studio-unit-count">{linkedOfferings.length} plan</span>
                                        <span className="software-pricing-studio-unit-count">{linkedRules.length} kural</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <section className="software-pricing-studio-step">
                    <div className="software-pricing-studio-step-head">
                        <span className="software-pricing-studio-step-no">2</span>
                        <div>
                            <h6 className="title mb-1">Satış Planları</h6>
                            <p className="text-soft fs-13px mb-0">
                                Satış planı müşterinin satın alacağı pakettir. En az bir plan eklenmeden dinamik fiyatlandırma kuralı oluşturulamaz.
                            </p>
                        </div>
                    </div>
                    {canConfigureOfferings ? (
                        <LicenseOfferingsTab productId={productId} productUnits={visibleUnits} />
                    ) : (
                        <div className="software-pricing-studio-lock">
                            <em className="icon ni ni-lock" />
                            <div>
                                <strong>Önce birim kararını tamamlayın.</strong>
                                <p className="mb-0 text-soft">Bir ürün birimi ekleyin veya bu ürünün fiyatlandırma parametresi olmadığını işaretleyin.</p>
                            </div>
                        </div>
                    )}
                </section>

                <section className="software-pricing-studio-step">
                    <div className="software-pricing-studio-step-head">
                        <span className="software-pricing-studio-step-no">3</span>
                        <div>
                            <h6 className="title mb-1">Dinamik Kurallar</h6>
                            <p className="text-soft fs-13px mb-0">
                                Kurallar seçilen planın fiyatına uygulanır. Önce kuralın hangi plana uygulanacağını, sonra gerekiyorsa o planın birimlerini seçin.
                            </p>
                        </div>
                    </div>
                    {canConfigureRules ? (
                        <SoftwarePricingTiersTab
                            productId={productId}
                            licenseOfferings={licenseOfferings}
                            productUnits={productUnits}
                            variants={variants}
                            draftRules={draftRules}
                            onDraftRulesChange={onDraftRulesChange}
                        />
                    ) : (
                        <div className="software-pricing-studio-lock">
                            <em className="icon ni ni-lock" />
                            <div>
                                <strong>Önce en az bir satış planı ekleyin.</strong>
                                <p className="mb-0 text-soft">Kural motoru, hangi paketin fiyatını değiştireceğini bilmeden çalıştırılmaz.</p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default SoftwarePricingStudio;
