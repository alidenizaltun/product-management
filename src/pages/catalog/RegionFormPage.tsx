import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import { TextInput, NumberInput, Checkbox, LoadingButton, UnsavedChangesDialog } from "@/components/shared";
import { useUnsavedChangesGuard } from "@/application/hooks/useUnsavedChangesGuard";
import { useRegion, useRegionMutations } from "@/application/hooks/useRegions";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";

interface RegionFormValues {
    code: string;
    name: string;
    description?: string;
    isActive: boolean;
    sortOrder: number;
}

const RegionFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { data: region, isLoading } = useRegion(id);
    const { create, update } = useRegionMutations();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<RegionFormValues>({
        defaultValues: {
            code: "",
            name: "",
            description: "",
            isActive: true,
            sortOrder: 0,
        },
    });

    useEffect(() => {
        if (region) {
            reset({
                code: region.code,
                name: region.name,
                description: region.description ?? "",
                isActive: region.isActive,
                sortOrder: region.sortOrder,
            });
        }
    }, [region, reset]);

    const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

    const onSubmit = async (values: RegionFormValues) => {
        const payload = {
            name: values.name,
            description: values.description || undefined,
            isActive: values.isActive,
            sortOrder: values.sortOrder,
        };

        try {
            if (isEdit && id) {
                await update.mutateAsync({ id, payload: { ...payload, code: values.code } });
            } else {
                // Yeni kayıtta kod gönderilmez; sistem üretir.
                await create.mutateAsync(payload);
            }
            showSuccess(isEdit ? "Bölge güncellendi." : "Bölge tanımı oluşturuldu.");
            allowNextNavigation();
            navigate("/definitions/regions");
        } catch (err) {
            showApiError(err);
        }
    };

    const isPending = create.isPending || update.isPending;
    const title = isEdit ? "Bölge Düzenle" : "Yeni Bölge Tanımı";

    return (
        <>
            <Head title={title} />
            <Content>
                <PageHeader
                    title={title}
                    description={
                        isEdit
                            ? "Satış bölgesini düzenleyin (Türkiye, Almanya, Marmara vb.)"
                            : "Satış bölgesi tanımlayın (Türkiye, Almanya, Marmara vb.). Kod sistem tarafından üretilir."
                    }
                    actions={
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-light py-2"
                                onClick={() => navigate("/definitions/regions")}
                                disabled={isPending}
                            >
                                İptal
                            </button>
                            <LoadingButton color="primary py-2" type="submit" form="region-form" loading={isPending}>
                                <Icon name="save" id="" className="me-1" style={{}} />
                                Kaydet
                            </LoadingButton>
                        </div>
                    }
                />
                <Block className="" size="">
                    {isEdit && isLoading ? (
                        <div className="card card-bordered">
                            <div className="card-inner d-flex align-items-center gap-2">
                                <span className="spinner-border spinner-border-sm text-primary" />
                                <span>Yükleniyor...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="card card-bordered">
                            <div className="card-inner">
                                <form id="region-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                                    {isEdit && (
                                        <div className="col-md-4">
                                            <TextInput
                                                label="Kod"
                                                required
                                                className="text-uppercase"
                                                error={errors.code?.message}
                                                {...register("code", { required: "Kod zorunludur" })}
                                            />
                                        </div>
                                    )}

                                    <div className={isEdit ? "col-md-5" : "col-md-9"}>
                                        <TextInput
                                            label="Ad"
                                            required
                                            placeholder="Türkiye"
                                            error={errors.name?.message}
                                            {...register("name", { required: "Ad zorunludur" })}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <NumberInput
                                            label="Sıra"
                                            min={0}
                                            placeholder="0"
                                            {...register("sortOrder", { valueAsNumber: true })}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <TextInput
                                            label="Açıklama"
                                            placeholder="Opsiyonel açıklama..."
                                            {...register("description")}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <Checkbox label="Aktif" switchStyle {...register("isActive")} />
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </Block>
            </Content>

            <UnsavedChangesDialog blocker={blocker} />
        </>
    );
};

export default RegionFormPage;
