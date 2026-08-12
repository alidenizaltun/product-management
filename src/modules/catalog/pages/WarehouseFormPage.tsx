import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { TextInput, Textarea, Checkbox, LoadingButton, UnsavedChangesDialog } from "@/modules/shared/components";
import { useUnsavedChangesGuard } from "@/modules/shared/hooks/useUnsavedChangesGuard";
import { useWarehouse, useWarehouseMutations } from "@/modules/catalog/hooks/useCatalog";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";

interface WarehouseFormValues {
  code: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
}

const WarehouseFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: warehouse, isLoading } = useWarehouse(id);
  const { create, update } = useWarehouseMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<WarehouseFormValues>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      address: "",
      city: "",
      country: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (warehouse) {
      reset({
        code: warehouse.code,
        name: warehouse.name,
        description: warehouse.description ?? "",
        address: warehouse.address ?? "",
        city: warehouse.city ?? "",
        country: warehouse.country ?? "",
        isActive: warehouse.isActive,
      });
    }
  }, [warehouse, reset]);

  const onSubmit = async (values: WarehouseFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      address: values.address || undefined,
      city: values.city || undefined,
      country: values.country || undefined,
      isActive: values.isActive,
    };

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, payload: { ...payload, code: values.code } });
      } else {
        // Yeni kayıtta kod gönderilmez; sistem üretir.
        await create.mutateAsync(payload);
      }
      showSuccess(isEdit ? "Depo güncellendi." : "Depo oluşturuldu.");
      allowNextNavigation();
      navigate("/definitions/warehouses");
    } catch (err) {
      showApiError(err);
    }
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Depo Düzenle" : "Yeni Depo";
  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

  return (
    <>
      <Head title={title} />
      <Content>
        <PageHeader
          title={title}
          description={isEdit ? undefined : "Kod sistem tarafından üretilir."}
          actions={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light py-2"
                onClick={() => navigate("/definitions/warehouses")}
                disabled={isPending}
              >
                İptal
              </button>
              <LoadingButton color="primary py-2" type="submit" form="warehouse-form" loading={isPending}>
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
                <form id="warehouse-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                  {isEdit && (
                    <div className="col-md-4">
                      <TextInput
                        label="Kod"
                        required
                        error={errors.code?.message}
                        {...register("code", { required: "Kod zorunludur" })}
                      />
                    </div>
                  )}

                  <div className={isEdit ? "col-md-8" : "col-md-12"}>
                    <TextInput
                      label="Ad"
                      required
                      placeholder="Depo adı"
                      error={errors.name?.message}
                      {...register("name", { required: "Ad zorunludur" })}
                    />
                  </div>

                  <div className="col-md-6">
                    <TextInput label="Şehir" {...register("city")} />
                  </div>

                  <div className="col-md-6">
                    <TextInput label="Ülke" {...register("country")} />
                  </div>

                  <div className="col-12">
                    <Textarea label="Adres" rows={2} {...register("address")} />
                  </div>

                  <div className="col-12">
                    <Textarea label="Açıklama" rows={2} {...register("description")} />
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

export default WarehouseFormPage;
