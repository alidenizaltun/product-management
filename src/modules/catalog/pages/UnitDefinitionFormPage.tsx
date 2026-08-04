import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { TextInput, NumberInput, Checkbox, LoadingButton, UnsavedChangesDialog } from "@/modules/shared/components";
import { useUnsavedChangesGuard } from "@/modules/shared/hooks/useUnsavedChangesGuard";
import { useUnitDefinition, useUnitDefinitionMutations } from "@/modules/catalog/hooks/useUnitDefinitions";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";

interface UnitDefinitionFormValues {
    code: string;
    name: string;
    description?: string;
    isActive: boolean;
    sortOrder: number;
}

const UnitDefinitionFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { data: unit, isLoading } = useUnitDefinition(id);
    const { create, update } = useUnitDefinitionMutations();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<UnitDefinitionFormValues>({
        defaultValues: {
            code: "",
            name: "",
            description: "",
            isActive: true,
            sortOrder: 0,
        },
    });

    useEffect(() => {
        if (unit) {
            reset({
                code: unit.code,
                name: unit.name,
                description: unit.description ?? "",
                isActive: unit.isActive,
                sortOrder: unit.sortOrder,
            });
        }
    }, [unit, reset]);

    const onSubmit = async (values: UnitDefinitionFormValues) => {
        const payload = {
            code: values.code,
            name: values.name,
            description: values.description || undefined,
            isActive: values.isActive,
            sortOrder: values.sortOrder,
        };

        try {
            if (isEdit && id) {
                await update.mutateAsync({ id, payload });
            } else {
                await create.mutateAsync(payload);
            }
            showSuccess(isEdit ? "Birim güncellendi." : "Birim tanımı oluşturuldu.");
            allowNextNavigation();
            navigate("/definitions/software-units");
        } catch (err) {
            showApiError(err);
        }
    };

    const isPending = create.isPending || update.isPending;
    const title = isEdit ? "Birim Düzenle" : "Yeni Birim Tanımı";
    const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

    return (
        <>
            <Head title={title} />
            <Content>
                <PageHeader
                    title={title}
                    description="Ürün ve fiyatlandırma birimlerini tanımlayın (Adet, Kullanıcı, Lisans, vb.)"
                    actions={
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-light py-2"
                                onClick={() => navigate("/definitions/software-units")}
                                disabled={isPending}
                            >
                                İptal
                            </button>
                            <LoadingButton color="primary py-2" type="submit" form="unit-definition-form" loading={isPending}>
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
                                <form id="unit-definition-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                                    <div className="col-md-4">
                                        <TextInput
                                            label="Kod"
                                            required
                                            className="text-uppercase"
                                            placeholder="ADET"
                                            hint="Kısa, benzersiz kod. Örn: ADET, KG, USER, LT"
                                            error={errors.code?.message}
                                            {...register("code", { required: "Kod zorunludur" })}
                                        />
                                    </div>

                                    <div className="col-md-5">
                                        <TextInput
                                            label="Ad"
                                            required
                                            placeholder="Adet"
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

export default UnitDefinitionFormPage;
