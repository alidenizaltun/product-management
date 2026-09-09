import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { FormModal } from "@/components/shared/FormModal";
import { FormField, TextInput, Textarea } from "@/components/shared";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { catalogKeys, useCategories, useCategoryMutations } from "@/application/hooks/useCatalog";
import type { LookupItem } from "@/domain/types/lookup.types";
import type { ProductCategoryDto } from "@/domain/types/productOperations.types";

interface CategoryQuickAddValues {
  name: string;
  description?: string;
  parentCategoryId?: string;
}

interface CategoryQuickAddModalProps {
  open: boolean;
  toggle: () => void;
  onCreated: (category: ProductCategoryDto) => void;
}

const DEFAULT_VALUES: CategoryQuickAddValues = {
  name: "",
  description: "",
  parentCategoryId: "",
};

const CategoryQuickAddModal: React.FC<CategoryQuickAddModalProps> = ({ open, toggle, onCreated }) => {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { create } = useCategoryMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryQuickAddValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  const handleToggle = () => {
    if (create.isPending) return;
    toggle();
  };

  const onSubmit = async (values: CategoryQuickAddValues) => {
    try {
      const created = await create.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        parentCategoryId: values.parentCategoryId || undefined,
      });
      queryClient.setQueryData<ProductCategoryDto[]>(catalogKeys.categories, (current = []) =>
        current.some((item) => item.id === created.id) ? current : [...current, created]
      );
      queryClient.setQueryData<LookupItem[]>(["lookups", "categories"], (current = []) =>
        current.some((item) => item.id === created.id)
          ? current
          : [...current, { id: created.id, name: created.name }]
      );
      showSuccess("Kategori oluşturuldu.");
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
      title="Yeni Kategori Tanımı"
      centered
      loading={create.isPending}
      submitLabel="Oluştur"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="row g-3">
        <div className="col-12">
          <TextInput
            label="Ad"
            required
            placeholder="Kategori adı"
            error={errors.name?.message}
            {...register("name", { required: "Ad zorunludur" })}
          />
        </div>
        <div className="col-12">
          <FormField label="Üst Kategori" htmlFor="quick-add-category-parent">
            <select
              id="quick-add-category-parent"
              className="form-control form-select"
              disabled={create.isPending}
              {...register("parentCategoryId")}
            >
              <option value="">— Yok (Kök Kategori) —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="col-12">
          <Textarea label="Açıklama" rows={3} placeholder="Kategori açıklaması" {...register("description")} />
        </div>
        <div className="col-12">
          <p className="text-soft fs-12px mb-0">Kod sistem tarafından üretilir.</p>
        </div>
      </div>
    </FormModal>
  );
};

export default CategoryQuickAddModal;
