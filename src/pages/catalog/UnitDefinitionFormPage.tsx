import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TextInput, NumberInput, Checkbox, FormPage, UnsavedChangesDialog } from "@/components/shared";
import { useUnsavedChangesGuard } from "@/application/hooks/useUnsavedChangesGuard";
import { useUnitDefinition, useUnitDefinitionMutations } from "@/application/hooks/useUnitDefinitions";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";

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
            <FormPage
                title={title}
                subtitle="Ürün ve fiyatlandırma birimlerini tanımlayın (Adet, Kullanıcı, Lisans, vb.)"
                loading={isEdit && isLoading}
                saving={isPending}
                onSubmit={handleSubmit(onSubmit)}
                onCancel={() => navigate("/definitions/software-units")}
            >
                <div className="card card-bordered">
                    <div className="card-inner">
                        <div className="row g-3">
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

                            <div className={isEdit ? "col-md-6" : "col-12"}>
                                <TextInput
                                    label="Ad"
                                    required
                                    placeholder="Adet"
                                    error={errors.name?.message}
                                    {...register("name", { required: "Ad zorunludur" })}
                                />
                            </div>

                            {isEdit && (
                                <div className="col-md-2">
                                    <NumberInput
                                        label="Sıra"
                                        size="sm"
                                        min={0}
                                        placeholder="0"
                                        {...register("sortOrder", { valueAsNumber: true })}
                                    />
                                </div>
                            )}

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
                        </div>
                    </div>
                </div>
            </FormPage>

            <UnsavedChangesDialog blocker={blocker} />
        </>
    );
};

export default UnitDefinitionFormPage;
