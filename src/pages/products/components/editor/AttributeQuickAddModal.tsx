import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { FormModal, FormField, TextInput, Checkbox } from "@/components/shared";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { attributeKeys, useAttributeDefinitionMutations } from "@/application/hooks/useAttributes";
import type { ProductAttributeDefinitionDto } from "@/domain/types/productOperations.types";

interface AttributeQuickAddValues {
  key: string;
  displayName: string;
  dataType: number;
  isRequired: boolean;
  isFilterable: boolean;
  isVariantAxis: boolean;
}

interface AttributeQuickAddModalProps {
  open: boolean;
  toggle: () => void;
  onCreated: (definition: ProductAttributeDefinitionDto) => void;
}

const DEFAULT_VALUES: AttributeQuickAddValues = {
  key: "",
  displayName: "",
  dataType: 1,
  isRequired: false,
  isFilterable: false,
  isVariantAxis: false,
};

const AttributeQuickAddModal: React.FC<AttributeQuickAddModalProps> = ({ open, toggle, onCreated }) => {
  const queryClient = useQueryClient();
  const { create } = useAttributeDefinitionMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttributeQuickAddValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  const handleToggle = () => {
    if (create.isPending) return;
    toggle();
  };

  const onSubmit = async (values: AttributeQuickAddValues) => {
    try {
      const created = await create.mutateAsync({
        key: values.key,
        displayName: values.displayName,
        dataType: Number(values.dataType),
        isRequired: values.isRequired,
        isFilterable: values.isFilterable,
        isVariantAxis: values.isVariantAxis,
      });
      queryClient.setQueryData<ProductAttributeDefinitionDto[]>(attributeKeys.definitions, (current = []) =>
        current.some((item) => item.id === created.id) ? current : [...current, created]
      );
      showSuccess("Özellik tanımı oluşturuldu.");
      onCreated(created);
      toggle();
    } catch (err) {
      showApiError(err);
    }
  };

  return (
    <FormModal
      open={open}
      toggle={handleToggle}
      title="Yeni Özellik Tanımı"
      centered
      loading={create.isPending}
      submitLabel="Oluştur"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="row g-3">
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
        <div className="col-12">
          <FormField label="Veri Tipi" htmlFor="quick-add-attr-data-type">
            <select
              id="quick-add-attr-data-type"
              className="form-control form-select"
              disabled={create.isPending}
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
        <div className="col-12">
          <span className="form-label d-block">Özellikler</span>
          <div className="d-flex flex-wrap gap-3 mt-1">
            <Checkbox label="Zorunlu" switchStyle {...register("isRequired")} />
            <Checkbox label="Filtrelenebilir" switchStyle {...register("isFilterable")} />
            <Checkbox label="Varyant Eksen" switchStyle {...register("isVariantAxis")} />
          </div>
        </div>
      </div>
    </FormModal>
  );
};

export default AttributeQuickAddModal;
