import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { Collapse } from "reactstrap";
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
type StudioStepKey = "units" | "offerings" | "rules";
type TourTargetKey = StudioStepKey | "offeringUnits";

export interface SoftwarePricingStudioHandle {
    startHelpTour: () => void;
}

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

const HELP_TOUR_STEPS: Array<{
    step: StudioStepKey;
    target: TourTargetKey;
    title: string;
    body: string;
    action: string;
}> = [
    {
        step: "units",
        target: "units",
        title: "Ürün birimini netleştirin",
        body: "Fiyat veya kullanım miktarı kullanıcı, cihaz, API çağrısı gibi bir değere göre değişiyorsa önce bu birimi ekleyin. Sabit paket satılacaksa parametre yok seçeneğini kullanın.",
        action: "Birim ekleyin veya parametre olmadığını işaretleyin.",
    },
    {
        step: "offerings",
        target: "offerings",
        title: "Satış planını oluşturun",
        body: "Müşterinin satın alacağı paketi burada tanımlayın. Bu ekranda koltuk ve kullanım bazlı model seçilmez; o karar ürün birimi ve dinamik kural tarafında kurulur.",
        action: "Tek seferlik, abonelik veya deneme planlarından biriyle başlayın.",
    },
    {
        step: "offerings",
        target: "offeringUnits",
        title: "Planı birimle ilişkilendirin",
        body: "Plan bir fiyatlandırma birimine bağlıysa Birim Paleti'ndeki kaydı planın Paket birimleri alanına sürükleyin veya listeden seçin.",
        action: "Birim gerekmiyorsa Birimsiz paket seçili kalabilir.",
    },
    {
        step: "rules",
        target: "rules",
        title: "Gerekirse dinamik kural ekleyin",
        body: "Miktara, pakete veya seçilen ürün birimine göre fiyat değişecekse kural adımında hesaplama mantığını tanımlayın. Sabit fiyatlı paketlerde bu adım opsiyoneldir.",
        action: "Kural yoksa planı kaydetmeniz yeterli.",
    },
];

interface SpotlightState {
    top: number;
    left: number;
    width: number;
    height: number;
    popoverTop: number;
    popoverLeft: number;
}

const SoftwarePricingStudio = forwardRef<SoftwarePricingStudioHandle, SoftwarePricingStudioProps>(({
    productId,
    licenseOfferings,
    productUnits,
    variants = [],
    draftRules,
    onDraftRulesChange,
}, ref) => {
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
    const [openSteps, setOpenSteps] = useState<Record<StudioStepKey, boolean>>({
        units: true,
        offerings: false,
        rules: false,
    });
    const [tourOpen, setTourOpen] = useState(false);
    const [tourStepIndex, setTourStepIndex] = useState(0);
    const [spotlight, setSpotlight] = useState<SpotlightState | null>(null);
    const unitsStepRef = useRef<HTMLElement | null>(null);
    const offeringsStepRef = useRef<HTMLElement | null>(null);
    const offeringUnitsTargetRef = useRef<HTMLDivElement | null>(null);
    const rulesStepRef = useRef<HTMLElement | null>(null);
    const canConfigureOfferings = activeUnits.length > 0 || skipUnitPricing;
    const canConfigureRules = canConfigureOfferings && activeOfferings.length > 0;
    const currentTourStep = HELP_TOUR_STEPS[tourStepIndex];

    const getTourTarget = useCallback(() => {
        if (!currentTourStep) return null;
        if (currentTourStep.target === "units") return unitsStepRef.current;
        if (currentTourStep.target === "offerings") return offeringsStepRef.current;
        if (currentTourStep.target === "offeringUnits") return offeringUnitsTargetRef.current ?? offeringsStepRef.current;
        if (currentTourStep.target === "rules") return rulesStepRef.current;
        return null;
    }, [currentTourStep]);

    const updateSpotlight = useCallback(() => {
        if (!tourOpen || !currentTourStep) {
            setSpotlight(null);
            return;
        }

        const target = getTourTarget();
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const padding = 10;
        const top = Math.max(8, rect.top - padding);
        const left = Math.max(8, rect.left - padding);
        const width = Math.min(window.innerWidth - left - 8, rect.width + padding * 2);
        const height = Math.min(window.innerHeight - top - 8, rect.height + padding * 2);
        const popoverWidth = Math.min(380, window.innerWidth - 32);
        const popoverHeight = 210;
        const popoverLeft = Math.min(Math.max(16, left), window.innerWidth - popoverWidth - 16);
        const preferredTop = top + height + 14;
        const popoverTop =
            preferredTop + popoverHeight > window.innerHeight
                ? Math.max(16, top - popoverHeight - 14)
                : preferredTop;

        setSpotlight({ top, left, width, height, popoverTop, popoverLeft });
    }, [currentTourStep, getTourTarget, tourOpen]);

    useImperativeHandle(ref, () => ({
        startHelpTour: () => {
            setTourStepIndex(0);
            setTourOpen(true);
            setOpenSteps((current) => ({ ...current, units: true }));
        },
    }));

    useEffect(() => {
        if (activeUnits.length === 0 && activeOfferings.length > 0) {
            setSkipUnitPricing(true);
        }
    }, [activeOfferings.length, activeUnits.length]);

    useEffect(() => {
        if (!tourOpen || !currentTourStep) return;
        setOpenSteps((current) => ({ ...current, [currentTourStep.step]: true }));
    }, [currentTourStep, tourOpen]);

    useEffect(() => {
        if (!tourOpen || !currentTourStep) return;

        const target = getTourTarget();
        target?.scrollIntoView({ block: "center", behavior: "smooth" });
        const timer = window.setTimeout(updateSpotlight, 320);

        return () => window.clearTimeout(timer);
    }, [currentTourStep, getTourTarget, tourOpen, updateSpotlight]);

    useLayoutEffect(() => {
        updateSpotlight();
    }, [openSteps, updateSpotlight]);

    useEffect(() => {
        if (!tourOpen) return;

        window.addEventListener("resize", updateSpotlight);
        window.addEventListener("scroll", updateSpotlight, true);

        return () => {
            window.removeEventListener("resize", updateSpotlight);
            window.removeEventListener("scroll", updateSpotlight, true);
        };
    }, [tourOpen, updateSpotlight]);

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

    const toggleStep = (step: StudioStepKey) => {
        setOpenSteps((current) => ({ ...current, [step]: !current[step] }));
    };

    return (
        <div className="software-pricing-studio">
            {tourOpen && currentTourStep && spotlight && (
                <div className="software-pricing-studio-tour" role="dialog" aria-modal="true" aria-live="polite">
                    <div className="software-pricing-studio-tour-scrim top" style={{ height: spotlight.top }} />
                    <div
                        className="software-pricing-studio-tour-scrim left"
                        style={{ top: spotlight.top, width: spotlight.left, height: spotlight.height }}
                    />
                    <div
                        className="software-pricing-studio-tour-scrim right"
                        style={{
                            top: spotlight.top,
                            left: spotlight.left + spotlight.width,
                            height: spotlight.height,
                        }}
                    />
                    <div
                        className="software-pricing-studio-tour-scrim bottom"
                        style={{ top: spotlight.top + spotlight.height }}
                    />
                    <div
                        className="software-pricing-studio-tour-focus"
                        style={{
                            top: spotlight.top,
                            left: spotlight.left,
                            width: spotlight.width,
                            height: spotlight.height,
                        }}
                    />
                    <div
                        className="software-pricing-studio-tour-popover"
                        style={{ top: spotlight.popoverTop, left: spotlight.popoverLeft }}
                    >
                        <div className="software-pricing-studio-tour-head">
                            <span className="badge badge-dim bg-primary">
                                Adım {tourStepIndex + 1} / {HELP_TOUR_STEPS.length}
                            </span>
                            <button
                                type="button"
                                className="btn btn-xs btn-icon btn-trigger"
                                onClick={() => setTourOpen(false)}
                                aria-label="Yardımı kapat"
                            >
                                <em className="icon ni ni-cross" />
                            </button>
                        </div>
                        <h6 className="title mb-1">{currentTourStep.title}</h6>
                        <p className="mb-2">{currentTourStep.body}</p>
                        <p className="text-soft fs-12px mb-3">{currentTourStep.action}</p>
                        <div className="software-pricing-studio-tour-actions">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-light"
                                disabled={tourStepIndex === 0}
                                onClick={() => setTourStepIndex((current) => Math.max(current - 1, 0))}
                            >
                                Önceki
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                    if (tourStepIndex >= HELP_TOUR_STEPS.length - 1) {
                                        setTourOpen(false);
                                        return;
                                    }
                                    setTourStepIndex((current) => Math.min(current + 1, HELP_TOUR_STEPS.length - 1));
                                }}
                            >
                                {tourStepIndex >= HELP_TOUR_STEPS.length - 1 ? "Bitir" : "Devam"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* <div className="software-pricing-studio-summary mb-4">
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
            </div> */}

            <div className="software-pricing-studio-flow">
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

                <section className="software-pricing-studio-step" ref={unitsStepRef}>
                    <button
                        type="button"
                        className="software-pricing-studio-step-head"
                        onClick={() => toggleStep("units")}
                        aria-expanded={openSteps.units}
                    >
                        <span className="software-pricing-studio-step-no">1</span>
                        <div>
                            <h6 className="title mb-1">Ürün Birimleri</h6>
                            <p className="text-soft fs-13px mb-0">Planların ve kuralların kullanacağı ürün içi fiyatlandırma birimlerini kurun.</p>
                        </div>
                        <span className="software-pricing-studio-step-summary">
                            {activeUnits.length ? `${activeUnits.length} aktif birim` : skipUnitPricing ? "Parametresiz" : "Bekliyor"}
                        </span>
                        <em className={`icon ni ni-chevron-${openSteps.units ? "up" : "down"}`} />
                    </button>
                    <Collapse isOpen={openSteps.units}>
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
                    </Collapse>
                </section>

                <section className="software-pricing-studio-step" ref={offeringsStepRef}>
                    <button
                        type="button"
                        className="software-pricing-studio-step-head"
                        onClick={() => toggleStep("offerings")}
                        aria-expanded={openSteps.offerings}
                    >
                        <span className="software-pricing-studio-step-no">2</span>
                        <div>
                            <h6 className="title mb-1">Satış Planları</h6>
                            <p className="text-soft fs-13px mb-0">
                                Satış planı müşterinin satın alacağı pakettir. En az bir plan eklenmeden dinamik fiyatlandırma kuralı oluşturulamaz.
                            </p>
                        </div>
                        <span className="software-pricing-studio-step-summary">
                            {activeOfferings.length ? `${activeOfferings.length} aktif plan` : "Eksik"}
                        </span>
                        <em className={`icon ni ni-chevron-${openSteps.offerings ? "up" : "down"}`} />
                    </button>
                    <Collapse isOpen={openSteps.offerings}>
                        {canConfigureOfferings ? (
                            <div ref={offeringUnitsTargetRef}>
                                <LicenseOfferingsTab productId={productId} productUnits={visibleUnits} />
                            </div>
                        ) : (
                            <div className="software-pricing-studio-lock" ref={offeringUnitsTargetRef}>
                                <em className="icon ni ni-lock" />
                                <div>
                                    <strong>Önce birim kararını tamamlayın.</strong>
                                    <p className="mb-0 text-soft">Bir ürün birimi ekleyin veya bu ürünün fiyatlandırma parametresi olmadığını işaretleyin.</p>
                                </div>
                            </div>
                        )}
                    </Collapse>
                </section>

                <section className="software-pricing-studio-step" ref={rulesStepRef}>
                    <button
                        type="button"
                        className="software-pricing-studio-step-head"
                        onClick={() => toggleStep("rules")}
                        aria-expanded={openSteps.rules}
                    >
                        <span className="software-pricing-studio-step-no">3</span>
                        <div>
                            <h6 className="title mb-1">Dinamik Kurallar</h6>
                            <p className="text-soft fs-13px mb-0">
                                Kurallar seçilen planın fiyatına uygulanır. Önce kuralın hangi plana uygulanacağını, sonra gerekiyorsa o planın birimlerini seçin.
                            </p>
                        </div>
                        <span className="software-pricing-studio-step-summary">
                            {activeRules.length ? `${activeRules.length} aktif kural` : "Opsiyonel"}
                        </span>
                        <em className={`icon ni ni-chevron-${openSteps.rules ? "up" : "down"}`} />
                    </button>
                    <Collapse isOpen={openSteps.rules}>
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
                    </Collapse>
                </section>
            </div>
        </div>
    );
});

SoftwarePricingStudio.displayName = "SoftwarePricingStudio";

export default SoftwarePricingStudio;
