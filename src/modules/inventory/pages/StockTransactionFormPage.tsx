import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import ProductSelect from "@/modules/shared/components/selects/ProductSelect";
import WarehouseSelect from "@/modules/shared/components/selects/WarehouseSelect";
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
    formState: { errors },
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
    navigate("/inventory/transactions");
  };

  return (
    <>
      <Head title="Yeni Stok Hareketi" />
      <Content>
        <PageHeader
          title="Yeni Stok Hareketi"
          description="Stok giriş, çıkış veya düzeltme kaydı oluşturun."
          actions={
            <div className="d-flex gap-2">
              <Button color="light py-2" onClick={() => navigate("/inventory/transactions")} disabled={create.isPending}>
                İptal
              </Button>
              <Button color="primary py-2" type="submit" form="tx-form" disabled={create.isPending}>
                {create.isPending ? (
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
          <div className="card card-bordered">
            <div className="card-inner">
              <form id="tx-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Ürün <span className="text-danger">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="productId"
                    rules={{ required: "Ürün seçiniz" }}
                    render={({ field }) => (
                      <ProductSelect
                        value={field.value || null}
                        onChange={(val) => field.onChange(val ?? "")}
                      />
                    )}
                  />
                  {errors.productId && (
                    <div className="text-danger fs-12px mt-1">{errors.productId.message}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Depo</label>
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
                </div>

                <div className="col-md-3">
                  <label className="form-label">İşlem Tipi</label>
                  <select
                    className="form-control form-select"
                    {...register("transactionType", { valueAsNumber: true })}
                  >
                    <option value={1}>Giriş</option>
                    <option value={2}>Çıkış</option>
                    <option value={3}>Transfer</option>
                    <option value={4}>Düzeltme</option>
                    <option value={5}>İade</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">
                    Miktar <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                    {...register("quantity", {
                      valueAsNumber: true,
                      required: "Miktar zorunludur",
                      min: { value: 1, message: "En az 1" },
                    })}
                  />
                  {errors.quantity && <div className="invalid-feedback">{errors.quantity.message}</div>}
                </div>

                <div className="col-md-3">
                  <label className="form-label">Birim Maliyet</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    {...register("unitCost", { valueAsNumber: true })}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Tarih</label>
                  <input type="datetime-local" className="form-control" {...register("occurredAt")} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Referans Tipi</label>
                  <input
                    className="form-control"
                    placeholder="initial, order, adjustment..."
                    {...register("referenceType")}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Referans No</label>
                  <input className="form-control" {...register("referenceNumber")} />
                </div>

                <div className="col-12">
                  <label className="form-label">Not</label>
                  <textarea className="form-control" rows={2} {...register("note")} />
                </div>
              </form>
            </div>
          </div>
        </Block>
      </Content>
    </>
  );
};

export default StockTransactionFormPage;
