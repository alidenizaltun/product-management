import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "reactstrap";
import { FormProvider, useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import { parseApiErrors, toFormPath } from "@/utils/apiErrors";
import ProductPicker from "@/modules/products/components/ProductPicker";
import { rememberRecentProduct } from "@/modules/products/utils/recentProducts";
import { useProductDetail } from "@/modules/products/hooks/useProductDetail";
import { useProductMutations } from "@/modules/products/hooks/useProductMutations";
import { useProductPricingRules } from "@/modules/products/hooks/useProductPricingRules";
import { buildFullProductPayload, mapProductToForm, buildDefaultValues } from "@/modules/products/utils/productFormMapper";
import { KIND_LABELS, STATUS_LABELS } from "@/modules/products/components/detail/constants";
import {
    getProductSection,
    isKindAllowedForSection,
    type ProductSectionKey,
} from "@/modules/products/config/productSections";
import type { ProductFormValues } from "@/modules/products/types/productEditor.types";
import type { ProductDetailDto } from "@/shared/types/productOperations.types";

export interface ProductSectionRenderContext {
    productId: string;
    product: ProductDetailDto;
}

interface ProductSectionPageProps {
    sectionKey: ProductSectionKey;
    /** Bölüm içeriği; yalnızca bir ürün seçildikten sonra render edilir. */
    children: (context: ProductSectionRenderContext) => React.ReactNode;
    /**
     * Bölüm kendi kayıt akışına sahipse (satır bazlı API çağrıları) sayfa
     * seviyesindeki kaydet düğmesi gizlenir.
     */
    showSave?: boolean;
    /** Ürün seçicinin üstünde gösterilecek ek bilgi/uyarı içeriği */
    intro?: React.ReactNode;
}

const ProductSectionPage: React.FC<ProductSectionPageProps> = ({
    sectionKey,
    children,
    showSave = true,
    intro,
}) => {
    const section = getProductSection(sectionKey);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const productId = searchParams.get("productId") || "";

    const { data: product, isLoading } = useProductDetail(productId || undefined);
    const { data: currentPricingRules } = useProductPricingRules(productId || undefined);
    const { updateFullMutation } = useProductMutations();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const defaultValues = useMemo(() => buildDefaultValues(), []);
    const form = useForm<ProductFormValues>({ defaultValues, mode: "onBlur" });
    const {
        handleSubmit,
        reset,
        formState: { isDirty },
    } = form;

    useEffect(() => {
        if (product) {
            reset(mapProductToForm(product));
            rememberRecentProduct(section.key, {
                id: product.id,
                name: product.name,
                productCode: product.productCode,
                kind: product.kind,
            });
        } else if (!productId) {
            reset(defaultValues);
        }
    }, [product, productId, reset, defaultValues, section.key]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!isDirty) return;
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const handleProductChange = useCallback(
        (nextId: string | null) => {
            if (nextId === productId) return;
            if (
                isDirty &&
                !window.confirm("Bu sayfada kaydedilmemiş değişiklikler var. Ürünü değiştirmek istediğinize emin misiniz?")
            ) {
                return;
            }

            setSubmitError(null);
            const nextParams = new URLSearchParams(searchParams);
            if (nextId) {
                nextParams.set("productId", nextId);
            } else {
                nextParams.delete("productId");
            }
            setSearchParams(nextParams, { replace: true });
        },
        [isDirty, productId, searchParams, setSearchParams]
    );

    const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
        if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;

        const target = event.target as HTMLElement | null;
        const tagName = target?.tagName.toLowerCase();
        if (!target || tagName === "textarea" || tagName === "button" || target.isContentEditable) return;

        event.preventDefault();
    };

    const onSubmit = async (values: ProductFormValues) => {
        if (!productId) return;
        setSubmitError(null);

        const { payload, normalizedModules } = buildFullProductPayload(values, {
            productId,
            pricingRules: currentPricingRules ?? product?.pricingRules,
        });

        try {
            await updateFullMutation.mutateAsync({ id: productId, payload });
            reset({ ...values, modules: normalizedModules });
            showSuccess(`${section.label} güncellendi`);
        } catch (err: unknown) {
            const { fieldErrors, generalErrors } = parseApiErrors(err);

            let hasFieldErrors = false;
            for (const [serverKey, messages] of Object.entries(fieldErrors)) {
                const path = toFormPath(serverKey) as Parameters<typeof form.setError>[0];
                form.setError(path, {
                    type: "server",
                    message: messages[0] ?? "Geçersiz değer",
                });
                hasFieldErrors = true;
            }

            if (generalErrors.length > 0) {
                setSubmitError(generalErrors.join(" "));
            } else if (!hasFieldErrors) {
                showApiError(err);
                setSubmitError("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
            }
        }
    };

    const kindAllowed = !product || isKindAllowedForSection(section, product.kind);
    const kind = product ? KIND_LABELS[product.kind] : undefined;
    const status = product ? STATUS_LABELS[product.status] : undefined;
    const isPending = updateFullMutation.isPending;

    return (
        <>
            <Head title={section.label} />
            <Content>
                <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown}>
                        <PageHeader
                            title={section.label}
                            description={section.description}
                            actions={
                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                    {product && (
                                        <>
                                            {kind && (
                                                <span className={`badge bg-${kind.color} d-none d-md-inline-flex`}>
                                                    <em className={`icon ni ni-${kind.icon} me-1`} />
                                                    {kind.label}
                                                </span>
                                            )}
                                            {status && (
                                                <span className={`badge badge-dim bg-${status.color} d-none d-md-inline-flex`}>
                                                    {status.label}
                                                </span>
                                            )}
                                            <span
                                                className={`badge badge-dim bg-${isDirty ? "warning" : "success"} d-none d-lg-inline-flex`}
                                            >
                                                {isDirty ? "Kaydedilmemiş değişiklik" : "Güncel"}
                                            </span>
                                            <Button color="light py-2" type="button" onClick={() => navigate(`/products/${product.id}`)}>
                                                Ürün Özeti
                                            </Button>
                                        </>
                                    )}
                                    <Button color="light py-2" type="button" onClick={() => navigate("/products")}>
                                        Ürün Listesine Dön
                                    </Button>
                                    {showSave && product && kindAllowed && (
                                        <Button color="primary py-2" type="submit" disabled={isPending}>
                                            {isPending ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Kaydediliyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Icon name="save" className="me-1" id="" style={{}} />
                                                    Kaydet
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            }
                        />

                        <Block className="" size="">
                            {intro}

                            <ProductPicker
                                allowedKinds={section.allowedKinds}
                                value={productId || null}
                                onChange={handleProductChange}
                                storageKey={section.key}
                                selectedProduct={product ?? null}
                                disabled={isPending}
                            />

                            {submitError && (
                                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                                    <Icon name="cross-circle" className="fs-5" id="" style={{}} />
                                    <span>{submitError}</span>
                                    <button
                                        type="button"
                                        className="btn-close ms-auto"
                                        aria-label="Kapat"
                                        onClick={() => setSubmitError(null)}
                                    />
                                </div>
                            )}

                            {!productId ? (
                                <div className="card card-bordered">
                                    <div className="card-inner text-center py-5">
                                        <em className={`icon ni ni-${section.icon} fs-1 text-soft d-block mb-3`} />
                                        <h6 className="title mb-1">Önce bir ürün seçin</h6>
                                        <p className="text-soft mb-0">
                                            {section.label} bilgilerini görüntülemek ve düzenlemek için yukarıdaki Ürün Seçici'den
                                            bir ürün seçmelisiniz.
                                        </p>
                                    </div>
                                </div>
                            ) : isLoading ? (
                                <div className="card card-bordered">
                                    <div className="card-inner d-flex align-items-center gap-3 py-5">
                                        <span className="spinner-border spinner-border-sm text-primary" />
                                        <span>Ürün yükleniyor...</span>
                                    </div>
                                </div>
                            ) : !product ? (
                                <div className="card card-bordered">
                                    <div className="card-inner text-center py-5">
                                        <em className="icon ni ni-cross-circle fs-1 text-danger d-block mb-3" />
                                        <p className="text-soft mb-0">Ürün bulunamadı veya yüklenirken hata oluştu.</p>
                                    </div>
                                </div>
                            ) : !kindAllowed ? (
                                <div className="card card-bordered">
                                    <div className="card-inner text-center py-5">
                                        <em className="icon ni ni-alert-circle fs-1 text-warning d-block mb-3" />
                                        <h6 className="title mb-1">Bu sayfa seçili ürün tipinde kullanılmaz</h6>
                                        <p className="text-soft mb-0">
                                            {section.label} sayfası yalnızca{" "}
                                            {section.allowedKinds.map((k) => KIND_LABELS[k]?.label).join(", ")} tipindeki ürünler
                                            için geçerlidir.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                children({ productId, product })
                            )}
                        </Block>
                    </form>
                </FormProvider>
            </Content>
        </>
    );
};

export default ProductSectionPage;
