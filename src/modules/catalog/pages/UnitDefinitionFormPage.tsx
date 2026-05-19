import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
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
        formState: { errors },
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
            navigate("/catalog/unit-definitions");
        } catch (err) {
            showApiError(err);
        }
    };

    const isPending = create.isPending || update.isPending;
    const title = isEdit ? "Birim Düzenle" : "Yeni Birim Tanımı";

    return (
        <>
            <Head title={title} />
            <Content>
                <PageHeader
                    title={title}
                    description="Ürün ve fiyatlandırma birimlerini tanımlayın (Adet, Kullanıcı, Lisans, vb.)"
                    actions={
                        <div className="d-flex gap-2">
                            <Button
                                color="light py-2"
                                onClick={() => navigate("/catalog/unit-definitions")}
                                disabled={isPending}
                            >
                                İptal
                            </Button>
                            <Button color="primary py-2" type="submit" form="unit-definition-form" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="save" id="" className="me-1" style={{}} />
                                        Kaydet
                                    </>
                                )}
                            </Button>
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
                                        <label className="form-label">
                                            Kod <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            className={`form-control text-uppercase ${errors.code ? "is-invalid" : ""}`}
                                            placeholder="ADET"
                                            {...register("code", { required: "Kod zorunludur" })}
                                        />
                                        {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
                                        <small className="text-soft">Kısa, benzersiz kod. Örn: ADET, KG, USER, LT</small>
                                    </div>

                                    <div className="col-md-5">
                                        <label className="form-label">
                                            Ad <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                            placeholder="Adet"
                                            {...register("name", { required: "Ad zorunludur" })}
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Sıra</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            placeholder="0"
                                            {...register("sortOrder", { valueAsNumber: true })}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">Açıklama</label>
                                        <input
                                            className="form-control"
                                            placeholder="Opsiyonel açıklama..."
                                            {...register("description")}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="unit-active"
                                                {...register("isActive")}
                                            />
                                            <label className="form-check-label" htmlFor="unit-active">
                                                Aktif
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </Block>
            </Content>
        </>
    );
};

export default UnitDefinitionFormPage;
