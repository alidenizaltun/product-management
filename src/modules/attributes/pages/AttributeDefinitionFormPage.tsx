import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import {
  useAttributeDefinition,
  useAttributeDefinitionMutations,
} from "@/modules/attributes/hooks/useAttributes";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";

interface FormValues {
  key: string;
  displayName: string;
  dataType: number;
  isRequired: boolean;
  isFilterable: boolean;
  isVariantAxis: boolean;
  allowedValuesJson?: string;
  validationRuleJson?: string;
}

const AttributeDefinitionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: definition, isLoading } = useAttributeDefinition(id);
  const { create, update } = useAttributeDefinitionMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      key: "",
      displayName: "",
      dataType: 1,
      isRequired: false,
      isFilterable: false,
      isVariantAxis: false,
      allowedValuesJson: "",
      validationRuleJson: "",
    },
  });

  useEffect(() => {
    if (definition) {
      reset({
        key: definition.key,
        displayName: definition.displayName,
        dataType: definition.dataType,
        isRequired: definition.isRequired,
        isFilterable: definition.isFilterable,
        isVariantAxis: definition.isVariantAxis,
        allowedValuesJson: definition.allowedValuesJson ?? "",
        validationRuleJson: definition.validationRuleJson ?? "",
      });
    }
  }, [definition, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      key: values.key,
      displayName: values.displayName,
      dataType: Number(values.dataType),
      isRequired: values.isRequired,
      isFilterable: values.isFilterable,
      isVariantAxis: values.isVariantAxis,
      allowedValuesJson: values.allowedValuesJson || undefined,
      validationRuleJson: values.validationRuleJson || undefined,
    };

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      showSuccess(isEdit ? "Özellik tanımı güncellendi." : "Özellik tanımı oluşturuldu.");
      navigate("/attributes/definitions");
    } catch (err) {
      showApiError(err);
    }
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Özellik Tanımı Düzenle" : "Yeni Özellik Tanımı";

  return (
    <>
      <Head title={title} />
      <Content>
        <PageHeader
          title={title}
          actions={
            <div className="d-flex gap-2">
              <Button color="light py-2" onClick={() => navigate("/attributes/definitions")} disabled={isPending}>
                İptal
              </Button>
              <Button color="primary py-2" type="submit" form="attr-def-form" disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Icon name="save" className="me-1" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          }
        />
        <Block>
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
                <form id="attr-def-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Anahtar <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`form-control ${errors.key ? "is-invalid" : ""}`}
                      placeholder="color"
                      {...register("key", { required: "Anahtar zorunludur" })}
                    />
                    {errors.key && <div className="invalid-feedback">{errors.key.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Görünen Ad <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`form-control ${errors.displayName ? "is-invalid" : ""}`}
                      placeholder="Renk"
                      {...register("displayName", { required: "Görünen ad zorunludur" })}
                    />
                    {errors.displayName && (
                      <div className="invalid-feedback">{errors.displayName.message}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Veri Tipi</label>
                    <select className="form-control form-select" {...register("dataType", { valueAsNumber: true })}>
                      <option value={1}>Metin</option>
                      <option value={2}>Sayı</option>
                      <option value={3}>Boolean</option>
                      <option value={4}>Tarih</option>
                      <option value={5}>Liste</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-block">Özellikler</label>
                    <div className="d-flex flex-wrap gap-3 mt-1">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          id="attr-required"
                          className="form-check-input"
                          {...register("isRequired")}
                        />
                        <label htmlFor="attr-required" className="form-check-label">
                          Zorunlu
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          id="attr-filterable"
                          className="form-check-input"
                          {...register("isFilterable")}
                        />
                        <label htmlFor="attr-filterable" className="form-check-label">
                          Filtrelenebilir
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          id="attr-axis"
                          className="form-check-input"
                          {...register("isVariantAxis")}
                        />
                        <label htmlFor="attr-axis" className="form-check-label">
                          Varyant Eksen
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">İzinli Değerler (JSON)</label>
                    <input
                      className="form-control"
                      placeholder='["red","green","blue"]'
                      {...register("allowedValuesJson")}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Doğrulama Kuralı (JSON)</label>
                    <input
                      className="form-control"
                      placeholder='{"min":0,"max":100}'
                      {...register("validationRuleJson")}
                    />
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

export default AttributeDefinitionFormPage;
