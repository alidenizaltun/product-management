import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
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

const getFallbackSpotlight = (): SpotlightState => {
    const popoverWidth = Math.min(380, window.innerWidth - 32);
    return {
        top: 96,
        left: 16,
        width: Math.max(0, window.innerWidth - 32),
        height: 0,
        popoverTop: Math.max(16, Math.min(140, window.innerHeight - 240)),
        popoverLeft: Math.max(16, (window.innerWidth - popoverWidth) / 2),
    };
};

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
    const [activeStep, setActiveStep] = useState<StudioStepKey>("units");
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
        if (!target) {
            setSpotlight(getFallbackSpotlight());
            return;
        }

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
            setSpotlight(null);
            setTourOpen(true);
            setActiveStep("units");
        },
    }));

    useEffect(() => {
        if (activeUnits.length === 0 && activeOfferings.length > 0) {
            setSkipUnitPricing(true);
        }
    }, [activeOfferings.length, activeUnits.length]);

    useEffect(() => {
        if (!tourOpen || !currentTourStep) return;
        setActiveStep(currentTourStep.step);
    }, [currentTourStep, tourOpen]);

    useEffect(() => {
        if (activeStep === "rules" && !canConfigureRules) {
            setActiveStep(canConfigureOfferings ? "offerings" : "units");
            return;
        }

        if (activeStep === "offerings" && !canConfigureOfferings) {
            setActiveStep("units");
        }
    }, [activeStep, canConfigureOfferings, canConfigureRules]);

    useEffect(() => {
        if (!tourOpen || !currentTourStep) return;

        const target = getTourTarget();
        target?.scrollIntoView({ block: "center", behavior: "smooth" });
        const timer = window.setTimeout(updateSpotlight, 320);
        const retryTimer = window.setTimeout(updateSpotlight, 650);

        return () => {
            window.clearTimeout(timer);
            window.clearTimeout(retryTimer);
        };
    }, [currentTourStep, getTourTarget, tourOpen, updateSpotlight]);

    useLayoutEffect(() => {
        updateSpotlight();
    }, [activeStep, updateSpotlight]);

    useEffect(() => {
        if (!tourOpen) return;

        window.addEventListener("resize", updateSpotlight);
        window.addEventListener("scroll", updateSpotlight, true);

        return () => {
            window.removeEventListener("resize", updateSpotlight);
            window.removeEventListener("scroll", updateSpotlight, true);
        };
    }, [tourOpen, updateSpotlight]);

    const stepState = {
        units: {
            isActive: activeStep === "units",
            isDone: canConfigureOfferings,
            canOpen: true,
        },
        offerings: {
            isActive: activeStep === "offerings",
            isDone: canConfigureRules,
            canOpen: canConfigureOfferings,
        },
        rules: {
            isActive: activeStep === "rules",
            isDone: true,
            canOpen: canConfigureRules,
        },
    };

    const goToStep = (step: StudioStepKey) => {
        if (!stepState[step].canOpen) return;
        setActiveStep(step);
    };

    const goToOfferings = () => {
        if (!canConfigureOfferings) return;
        setActiveStep("offerings");
    };

    const goToRules = () => {
        if (!canConfigureRules) return;
        setActiveStep("rules");
    };

    const steps: Array<{
        key: StudioStepKey;
        number: number;
        title: string;
        summary: string;
    }> = [
        {
            key: "units",
            number: 1,
            title: "Ürün Birimleri",
            summary: activeUnits.length ? `${activeUnits.length} aktif birim` : skipUnitPricing ? "Parametresiz" : "Bekliyor",
        },
        {
            key: "offerings",
            number: 2,
            title: "Satış Planları",
            summary: !canConfigureOfferings ? "Kilitli" : activeOfferings.length ? `${activeOfferings.length} aktif paket` : "Eksik",
        },
        {
            key: "rules",
            number: 3,
            title: "Dinamik Kurallar",
            summary: !canConfigureRules ? "Kilitli" : activeRules.length ? `${activeRules.length} aktif kural` : "Opsiyonel",
        },
    ];

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
            <div className="software-pricing-studio-flow">
                <div className="software-pricing-studio-stepper" aria-label="Yazılım fiyatlandırma adımları">
                    {steps.map((step) => {
                        const state = stepState[step.key];

                        return (
                            <button
                                type="button"
                                key={step.key}
                                className={`software-pricing-studio-stepper-item ${state.isActive ? "is-active" : ""} ${state.isDone ? "is-done" : ""} ${!state.canOpen ? "is-locked" : ""}`}
                                disabled={!state.canOpen}
                                aria-current={state.isActive ? "step" : undefined}
                                onClick={() => goToStep(step.key)}
                            >
                                <span className="software-pricing-studio-stepper-no">{step.number}</span>
                                <span className="software-pricing-studio-stepper-copy">
                                    <strong>{step.title}</strong>
                                    <small>{step.summary}</small>
                                </span>
                            </button>
                        );
                    })}
                </div>

                {activeStep === "units" && (
                    <section className="software-pricing-studio-panel" ref={unitsStepRef}>
                        <div className="software-pricing-studio-panel-head">
                            <div>
                                <h6 className="title mb-1">Ürün Birimleri</h6>
                                <p className="text-soft fs-13px mb-0">Planların ve kuralların kullanacağı ürün içi fiyatlandırma birimlerini kurun.</p>
                            </div>
                            <span className="software-pricing-studio-step-summary">
                                {activeUnits.length ? `${activeUnits.length} aktif birim` : skipUnitPricing ? "Parametresiz" : "Bekliyor"}
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
                        <div className="software-pricing-studio-step-actions">
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={!canConfigureOfferings}
                                onClick={goToOfferings}
                            >
                                Devam Et
                                <em className="icon ni ni-arrow-right ms-1" />
                            </button>
                        </div>
                    </section>
                )}

                {activeStep === "offerings" && (
                    <section className="software-pricing-studio-panel" ref={offeringsStepRef}>
                        <div className="software-pricing-studio-panel-head">
                            <div>
                                <h6 className="title mb-1">Satış Planları</h6>
                                <p className="text-soft fs-13px mb-0">
                                    Satış planı müşterinin satın alacağı pakettir. En az bir plan eklenmeden dinamik fiyatlandırma kuralı oluşturulamaz.
                                </p>
                            </div>
                            <span className="software-pricing-studio-step-summary">
                                {!canConfigureOfferings ? "Kilitli" : activeOfferings.length ? `${activeOfferings.length} aktif paket` : "Eksik"}
                            </span>
                        </div>
                        {canConfigureOfferings ? (
                            <>
                                <div ref={offeringUnitsTargetRef}>
                                    <LicenseOfferingsTab productId={productId} productUnits={visibleUnits} />
                                </div>
                                <div className="software-pricing-studio-step-actions">
                                    <button
                                        type="button"
                                        className="btn btn-outline-light"
                                        onClick={() => setActiveStep("units")}
                                    >
                                        <em className="icon ni ni-arrow-left me-1" />
                                        Geri
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={!canConfigureRules}
                                        onClick={goToRules}
                                    >
                                        Devam Et
                                        <em className="icon ni ni-arrow-right ms-1" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="software-pricing-studio-lock" ref={offeringUnitsTargetRef}>
                                <em className="icon ni ni-lock" />
                                <div>
                                    <strong>Önce birim kararını tamamlayın.</strong>
                                    <p className="mb-0 text-soft">Bir ürün birimi ekleyin veya bu ürünün fiyatlandırma parametresi olmadığını işaretleyin.</p>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {activeStep === "rules" && (
                    <section className="software-pricing-studio-panel" ref={rulesStepRef}>
                        <div className="software-pricing-studio-panel-head">
                            <div>
                                <h6 className="title mb-1">Dinamik Kurallar</h6>
                                <p className="text-soft fs-13px mb-0">
                                    Kurallar seçilen planın fiyatına uygulanır. Önce kuralın hangi plana uygulanacağını, sonra gerekiyorsa o planın birimlerini seçin.
                                </p>
                            </div>
                            <span className="software-pricing-studio-step-summary">
                                {!canConfigureRules ? "Kilitli" : activeRules.length ? `${activeRules.length} aktif kural` : "Opsiyonel"}
                            </span>
                        </div>
                        {canConfigureRules ? (
                            <>
                                <SoftwarePricingTiersTab
                                    productId={productId}
                                    licenseOfferings={visibleOfferings}
                                    productUnits={visibleUnits}
                                    variants={variants}
                                    draftRules={draftRules}
                                    onDraftRulesChange={onDraftRulesChange}
                                />
                                <div className="software-pricing-studio-step-actions">
                                    <button
                                        type="button"
                                        className="btn btn-outline-light"
                                        onClick={() => setActiveStep("offerings")}
                                    >
                                        <em className="icon ni ni-arrow-left me-1" />
                                        Geri
                                    </button>
                                </div>
                            </>
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
                )}
            </div>
        </div>
    );
});

SoftwarePricingStudio.displayName = "SoftwarePricingStudio";

export default SoftwarePricingStudio;
