import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { TextInput, FormField, Checkbox, LoadingButton, UnsavedChangesDialog } from "@/modules/shared/components";
import { useUnsavedChangesGuard } from "@/modules/shared/hooks/useUnsavedChangesGuard";
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
    formState: { errors, isDirty },
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
      allowNextNavigation();
      navigate("/definitions/attributes");
    } catch (err) {
      showApiError(err);
    }
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Özellik Tanımı Düzenle" : "Yeni Özellik Tanımı";
  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

  return (
    <>
      <Head title={title} />
      <Content>
        <PageHeader
          title={title}
          actions={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light py-2"
                onClick={() => navigate("/definitions/attributes")}
                disabled={isPending}
              >
                İptal
              </button>
              <LoadingButton color="primary py-2" type="submit" form="attr-def-form" loading={isPending}>
                <Icon name="save" className="me-1" />
                Kaydet
              </LoadingButton>
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
                    <TextInput
                      label="Anahtar"
                      required
                      placeholder="color"
                      error={errors.key?.message}
                      {...register("key", { required: "Anahtar zorunludur" })}
                    />
                  </div>

                  <div className="col-md-6">
                    <TextInput
                      label="Görünen Ad"
                      required
                      placeholder="Renk"
                      error={errors.displayName?.message}
                      {...register("displayName", { required: "Görünen ad zorunludur" })}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField label="Veri Tipi" htmlFor="attr-data-type">
                      <select
                        id="attr-data-type"
                        className="form-control form-select"
                        {...register("dataType", { valueAsNumber: true })}
                      >
                        <option value={1}>Metin</option>
                        <option value={2}>Sayı</option>
                        <option value={3}>Boolean</option>
                        <option value={4}>Tarih</option>
                        <option value={5}>Liste</option>
                      </select>
                    </FormField>
                  </div>

                  <div className="col-md-6">
                    <span className="form-label d-block">Özellikler</span>
                    <div className="d-flex flex-wrap gap-3 mt-1">
                      <Checkbox label="Zorunlu" switchStyle {...register("isRequired")} />
                      <Checkbox label="Filtrelenebilir" switchStyle {...register("isFilterable")} />
                      <Checkbox label="Varyant Eksen" switchStyle {...register("isVariantAxis")} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <TextInput
                      label="İzinli Değerler (JSON)"
                      placeholder='["red","green","blue"]'
                      error={errors.allowedValuesJson?.message}
                      {...register("allowedValuesJson", {
                        validate: (v) => {
                          if (!v) return true;
                          try { JSON.parse(v); return true; } catch { return "Geçerli bir JSON giriniz"; }
                        },
                      })}
                    />
                  </div>

                  <div className="col-md-6">
                    <TextInput
                      label="Doğrulama Kuralı (JSON)"
                      placeholder='{"min":0,"max":100}'
                      error={errors.validationRuleJson?.message}
                      {...register("validationRuleJson", {
                        validate: (v) => {
                          if (!v) return true;
                          try { JSON.parse(v); return true; } catch { return "Geçerli bir JSON giriniz"; }
                        },
                      })}
                    />
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

export default AttributeDefinitionFormPage;
