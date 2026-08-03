import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
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
    formState: { errors },
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
      navigate("/definitions/suppliers");
    } catch (err) {
      showApiError(err);
    }
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Tedarikçi Düzenle" : "Yeni Tedarikçi";

  return (
    <>
      <Head title={title} />
      <Content>
        <PageHeader
          title={title}
          actions={
            <div className="d-flex gap-2">
              <Button color="light py-2" onClick={() => navigate("/definitions/suppliers")} disabled={isPending}>
                İptal
              </Button>
              <Button color="primary py-2" type="submit" form="supplier-form" disabled={isPending}>
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
                <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">
                      Kod <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`form-control ${errors.supplierCode ? "is-invalid" : ""}`}
                      placeholder="SUP-001"
                      {...register("supplierCode", { required: "Kod zorunludur" })}
                    />
                    {errors.supplierCode && <div className="invalid-feedback">{errors.supplierCode.message}</div>}
                  </div>

                  <div className="col-md-8">
                    <label className="form-label">
                      Ad <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      placeholder="Tedarikçi adı"
                      {...register("name", { required: "Ad zorunludur" })}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Vergi No</label>
                    <input className="form-control" {...register("taxNumber")} />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">E-posta</label>
                    <input type="email" className="form-control" {...register("email")} />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Telefon</label>
                    <input className="form-control" {...register("phone")} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Adres</label>
                    <textarea className="form-control" rows={2} {...register("address")} />
                  </div>

                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="supplier-active"
                        {...register("isActive")}
                      />
                      <label className="form-check-label" htmlFor="supplier-active">
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

export default SupplierFormPage;
