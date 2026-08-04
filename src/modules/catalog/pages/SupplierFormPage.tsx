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
import { useSupplier, useSupplierMutations } from "@/modules/catalog/hooks/useCatalog";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";

interface SupplierFormValues {
  supplierCode: string;
  name: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

const SupplierFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: supplier, isLoading } = useSupplier(id);
  const { create, update } = useSupplierMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SupplierFormValues>({
    defaultValues: {
      supplierCode: "",
      name: "",
      taxNumber: "",
      email: "",
      phone: "",
      address: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (supplier) {
      reset({
        supplierCode: supplier.supplierCode,
        name: supplier.name,
        taxNumber: supplier.taxNumber ?? "",
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        address: supplier.address ?? "",
        isActive: supplier.isActive,
      });
    }
  }, [supplier, reset]);

  const onSubmit = async (values: SupplierFormValues) => {
    const payload = {
      supplierCode: values.supplierCode,
      name: values.name,
      taxNumber: values.taxNumber || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      isActive: values.isActive,
    };

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      showSuccess(isEdit ? "Tedarikçi güncellendi." : "Tedarikçi oluşturuldu.");
      allowNextNavigation();
      navigate("/definitions/suppliers");
    } catch (err) {
      showApiError(err);
    }
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Tedarikçi Düzenle" : "Yeni Tedarikçi";
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
                onClick={() => navigate("/definitions/suppliers")}
                disabled={isPending}
              >
                İptal
              </button>
              <LoadingButton color="primary py-2" type="submit" form="supplier-form" loading={isPending}>
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
                <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                  <div className="col-md-4">
                    <TextInput
                      label="Kod"
                      required
                      placeholder="SUP-001"
                      error={errors.supplierCode?.message}
                      {...register("supplierCode", { required: "Kod zorunludur" })}
                    />
                  </div>

                  <div className="col-md-8">
                    <TextInput
                      label="Ad"
                      required
                      placeholder="Tedarikçi adı"
                      error={errors.name?.message}
                      {...register("name", { required: "Ad zorunludur" })}
                    />
                  </div>

                  <div className="col-md-4">
                    <TextInput label="Vergi No" {...register("taxNumber")} />
                  </div>

                  <div className="col-md-4">
                    <TextInput label="E-posta" type="email" {...register("email")} />
                  </div>

                  <div className="col-md-4">
                    <TextInput label="Telefon" {...register("phone")} />
                  </div>

                  <div className="col-12">
                    <Textarea label="Adres" rows={2} {...register("address")} />
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

export default SupplierFormPage;
