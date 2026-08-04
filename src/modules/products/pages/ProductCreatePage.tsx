import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import { useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { showSuccess } from "@/modules/shared/components/NotificationAlert";
import { parseApiErrors, toFormPath } from "@/utils/apiErrors";
import { useProductMutations } from "@/modules/products/hooks/useProductMutations";
import { buildDefaultValues, buildFullProductPayload } from "@/modules/products/utils/productFormMapper";
import { KIND_LABELS } from "@/modules/products/components/detail/constants";
import type { ProductFormValues } from "@/modules/products/types/productEditor.types";

interface ProductCreateFormValues {
    name: string;
    kind: number;
    productCode: string;
    status: number;
    defaultCurrencyCode: string;
}

const STATUS_OPTIONS = [
    { value: 0, label: "Taslak" },
    { value: 1, label: "Aktif" },
    { value: 2, label: "Pasif" },
];

const slugify = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 20);

const buildAutoCode = (name: string) => {
    const base = slugify(name) || "URUN";
    return `${base}-${Date.now().toString().slice(-5)}`;
};

/**
 * Yeni Ürün — yalnızca ürünün kimliğini oluşturan minimum alanlar.
 * Kayıt sonrası kullanıcı Ürün Özeti sayfasına yönlendirilir; diğer bölümler
 * kendi sabit sayfalarından tamamlanır.
 */
const ProductCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const { createFullMutation } = useProductMutations();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<ProductCreateFormValues>({
        defaultValues: {
            name: "",
            kind: 2,
            productCode: "",
            status: 1,
            defaultCurrencyCode: "TRY",
        },
        mode: "onBlur",
    });

    const {
        register,
        handleSubmit,
        setError,
        getValues,
        setValue,
        formState: { errors },
    } = form;

    const onSubmit = async (values: ProductCreateFormValues) => {
        setSubmitError(null);

        const formValues: ProductFormValues = {
            ...buildDefaultValues(),
            name: values.name.trim(),
            productCode: values.productCode.trim() || buildAutoCode(values.name),
            kind: Number(values.kind),
            status: Number(values.status),
            defaultCurrencyCode: values.defaultCurrencyCode,
        };

        const { payload } = buildFullProductPayload(formValues);

        try {
            const created = await createFullMutation.mutateAsync(payload);
            showSuccess("Ürün oluşturuldu. Bölümleri ilgili sayfalardan tamamlayabilirsiniz.");
            navigate(`/products/${created.id}`);
        } catch (err: unknown) {
            const { fieldErrors, generalErrors } = parseApiErrors(err);

            let hasFieldErrors = false;
            for (const [serverKey, messages] of Object.entries(fieldErrors)) {
                const path = toFormPath(serverKey) as Parameters<typeof setError>[0];
                setError(path, { type: "server", message: messages[0] ?? "Geçersiz değer" });
                hasFieldErrors = true;
            }

            if (generalErrors.length > 0) {
                setSubmitError(generalErrors.join(" "));
            } else if (!hasFieldErrors) {
                setSubmitError("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
            }
        }
    };

    const isPending = createFullMutation.isPending;

    return (
        <>
            <Head title="Yeni Ürün" />
            <Content>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <PageHeader
                        title="Yeni Ürün"
                        description="Önce ürün kimliğini oluşturun; diğer bölümleri sabit menüdeki sayfalardan tamamlayın."
                        actions={
                            <div className="d-flex gap-2 align-items-center flex-wrap">
                                <Button color="light py-2" type="button" onClick={() => navigate("/products")}>
                                    Ürün Listesine Dön
                                </Button>
                                <Button color="primary py-2" type="submit" disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="save" className="me-1" id="" style={{}} />
                                            Oluştur ve Devam Et
                                        </>
                                    )}
                                </Button>
                            </div>
                        }
                    />

                    <Block className="" size="">
                        {submitError && (
                            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                                <Icon name="cross-circle" className="fs-5" id="" style={{}} />
                                <span>{submitError}</span>
                            </div>
                        )}

                        <div className="row g-4">
                            <div className="col-lg-12">
                                <section className="card card-bordered">
                                    <div className="card-inner border-bottom">
                                        <h5 className="title mb-1">Ürün Kimliği</h5>
                                        <p className="text-soft mb-0">
                                            Ürün türü, ürünün hangi sayfaların Ürün Seçici'sinde görüneceğini belirlediği için
                                            zorunludur.
                                        </p>
                                    </div>
                                    <div className="card-inner">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label" htmlFor="product-name">
                                                    Ürün Adı <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    id="product-name"
                                                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                                    placeholder="Örn. Kurumsal Lisans Paketi"
                                                    {...register("name", { required: "Ürün adı zorunludur" })}
                                                />
                                                {errors.name && <span className="invalid-feedback d-block">{errors.name.message}</span>}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label" htmlFor="product-kind">
                                                    Ürün Türü <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    id="product-kind"
                                                    className="form-select"
                                                    {...register("kind", { required: true, valueAsNumber: true })}
                                                >
                                                    {Object.entries(KIND_LABELS).map(([value, meta]) => (
                                                        <option key={value} value={value}>
                                                            {meta.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-3">
                                                <label className="form-label" htmlFor="product-status">
                                                    Durum
                                                </label>
                                                <select
                                                    id="product-status"
                                                    className="form-select"
                                                    {...register("status", { valueAsNumber: true })}
                                                >
                                                    {STATUS_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </Block>
                </form>
            </Content>
        </>
    );
};

export default ProductCreatePage;
