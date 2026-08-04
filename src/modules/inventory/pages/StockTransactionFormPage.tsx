import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import ProductSelect from "@/modules/shared/components/selects/ProductSelect";
import WarehouseSelect from "@/modules/shared/components/selects/WarehouseSelect";
import { TextInput, NumberInput, Textarea, FormField, LoadingButton, UnsavedChangesDialog } from "@/modules/shared/components";
import { useUnsavedChangesGuard } from "@/modules/shared/hooks/useUnsavedChangesGuard";
import { useInventoryTransactionMutations } from "@/modules/inventory/hooks/useInventory";

interface FormValues {
  productId: string;
  warehouseId?: string;
  transactionType: number;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceNumber?: string;
  note?: string;
  occurredAt?: string;
}

const StockTransactionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { create } = useInventoryTransactionMutations();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      productId: "",
      warehouseId: "",
      transactionType: 1,
      quantity: 1,
      unitCost: undefined,
      referenceType: "",
      referenceNumber: "",
      note: "",
      occurredAt: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await create.mutateAsync({
      productId: values.productId,
      warehouseId: values.warehouseId || undefined,
      transactionType: Number(values.transactionType),
      quantity: Number(values.quantity),
      unitCost: values.unitCost,
      referenceType: values.referenceType || undefined,
      referenceNumber: values.referenceNumber || undefined,
      note: values.note || undefined,
      occurredAt: values.occurredAt || undefined,
    });
    allowNextNavigation();
    navigate("/inventory/transactions");
  };

  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

  return (
    <>
      <Head title="Yeni Stok Hareketi" />
      <Content>
        <PageHeader
          title="Yeni Stok Hareketi"
          description="Stok giriş, çıkış veya düzeltme kaydı oluşturun."
          actions={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light py-2"
                onClick={() => navigate("/inventory/transactions")}
                disabled={create.isPending}
              >
                İptal
              </button>
              <LoadingButton color="primary py-2" type="submit" form="tx-form" loading={create.isPending}>
                <Icon name="save" className="me-1" />
                Kaydet
              </LoadingButton>
            </div>
          }
        />
        <Block>
          <div className="card card-bordered">
            <div className="card-inner">
              <form id="tx-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                <div className="col-md-6">
                  <FormField label="Ürün" htmlFor="tx-product" required error={errors.productId?.message}>
                    <Controller
                      control={control}
                      name="productId"
                      rules={{ required: "Ürün seçiniz" }}
                      render={({ field }) => (
                        <ProductSelect
                          value={field.value || null}
                          onChange={(val) => field.onChange(val ?? "")}
                          isInvalid={Boolean(errors.productId)}
                        />
                      )}
                    />
                  </FormField>
                </div>

                <div className="col-md-6">
                  <FormField label="Depo" htmlFor="tx-warehouse">
                    <Controller
                      control={control}
                      name="warehouseId"
                      render={({ field }) => (
                        <WarehouseSelect
                          value={field.value || null}
                          onChange={(val) => field.onChange(val ?? "")}
                        />
                      )}
                    />
                  </FormField>
                </div>

                <div className="col-md-3">
                  <FormField label="İşlem Tipi" htmlFor="tx-type">
                    <select
                      id="tx-type"
                      className="form-control form-select"
                      {...register("transactionType", { valueAsNumber: true })}
                    >
                      <option value={1}>Giriş</option>
                      <option value={2}>Çıkış</option>
                      <option value={3}>Transfer</option>
                      <option value={4}>Düzeltme</option>
                      <option value={5}>İade</option>
                    </select>
                  </FormField>
                </div>

                <div className="col-md-3">
                  <NumberInput
                    label="Miktar"
                    required
                    min={1}
                    error={errors.quantity?.message}
                    {...register("quantity", {
                      valueAsNumber: true,
                      required: "Miktar zorunludur",
                      min: { value: 1, message: "En az 1" },
                    })}
                  />
                </div>

                <div className="col-md-3">
                  <NumberInput label="Birim Maliyet" step="0.01" min={0} {...register("unitCost", { valueAsNumber: true })} />
                </div>

                <div className="col-md-3">
                  <TextInput label="Tarih" type="datetime-local" {...register("occurredAt")} />
                </div>

                <div className="col-md-6">
                  <TextInput
                    label="Referans Tipi"
                    placeholder="initial, order, adjustment..."
                    {...register("referenceType")}
                  />
                </div>

                <div className="col-md-6">
                  <TextInput label="Referans No" {...register("referenceNumber")} />
                </div>

                <div className="col-12">
                  <Textarea label="Not" rows={2} {...register("note")} />
                </div>
              </form>
            </div>
          </div>
        </Block>
      </Content>

      <UnsavedChangesDialog blocker={blocker} />
    </>
  );
};

export default StockTransactionFormPage;
