import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { TextInput, FormField, LoadingButton, UnsavedChangesDialog } from "@/modules/shared/components";
import { useUnsavedChangesGuard } from "@/modules/shared/hooks/useUnsavedChangesGuard";
import { showSuccess } from "@/modules/shared/components/NotificationAlert";
import { parseApiErrors, toFormPath } from "@/utils/apiErrors";
import { useProductMutations } from "@/modules/products/hooks/useProductMutations";
import { buildDefaultValues, buildFullProductPayload } from "@/modules/products/utils/productFormMapper";
import { KIND_LABELS } from "@/modules/products/components/detail/constants";
import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";
import type { ProductFormValues } from "@/modules/products/types/productEditor.types";

interface ProductCreateFormValues {
    name: string;
    kind: number;
    status: number;
    defaultCurrencyCode: string;
}

const STATUS_OPTIONS = [
    { value: 0, label: "Taslak" },
    { value: 1, label: "Aktif" },
    { value: 2, label: "Pasif" },
];

/**
 * Yeni Ürün — yalnızca ürünün kimliğini oluşturan minimum alanlar.
 * Ürün kodu sistem tarafından üretilir (PRD-000001); formda sorulmaz.
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
            status: 1,
            defaultCurrencyCode: DEFAULT_CURRENCY_CODE,
        },
        mode: "onBlur",
    });

    const {
        register,
        handleSubmit,
        setError,
        getValues,
        setValue,
        formState: { errors, isDirty },
    } = form;
    const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

    const onSubmit = async (values: ProductCreateFormValues) => {
        setSubmitError(null);

        const formValues: ProductFormValues = {
            ...buildDefaultValues(),
            name: values.name.trim(),
            kind: Number(values.kind),
            status: Number(values.status),
            defaultCurrencyCode: values.defaultCurrencyCode,
        };

        const { payload } = buildFullProductPayload(formValues);

        try {
            const created = await createFullMutation.mutateAsync(payload);
            showSuccess("Ürün oluşturuldu. Bölümleri ilgili sayfalardan tamamlayabilirsiniz.");
            allowNextNavigation();
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
                                <button
                                    type="button"
                                    className="btn btn-light py-2"
                                    onClick={() => navigate("/products")}
                                >
                                    Ürün Listesine Dön
                                </button>
                                <LoadingButton color="primary py-2" type="submit" loading={isPending}>
                                    <Icon name="save" className="me-1" id="" style={{}} />
                                    Oluştur ve Devam Et
                                </LoadingButton>
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
                                                <TextInput
                                                    id="product-name"
                                                    label="Ürün Adı"
                                                    required
                                                    placeholder="Örn. Kurumsal Lisans Paketi"
                                                    error={errors.name?.message}
                                                    {...register("name", { required: "Ürün adı zorunludur" })}
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <FormField label="Ürün Türü" htmlFor="product-kind" required>
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
                                                </FormField>
                                            </div>

                                            <div className="col-md-3">
                                                <FormField label="Durum" htmlFor="product-status">
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
                                                </FormField>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </Block>
                </form>
            </Content>

            <UnsavedChangesDialog blocker={blocker} />
        </>
    );
};

export default ProductCreatePage;
