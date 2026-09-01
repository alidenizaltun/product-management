import React from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/pages/products/types/productEditor.types";
import CategoryTreeSelect from "@/components/shared/selects/CategoryTreeSelect";

const emptyCategory = () => ({
  productCategoryId: "",
  isPrimary: false,
  sortOrder: 0,
});

const SortableCategoryCard: React.FC<{
  id: string;
  children: (dragHandleProps: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  }) => React.ReactNode;
}> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`pricing-sortable-item ${isDragging ? "is-dragging" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {children({ attributes, listeners })}
    </div>
  );
};

const CategoryTreeSelector: React.FC = () => {
  const { control, register, setValue, watch, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "categoryMaps" });
  const categoryMaps = watch("categoryMaps");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const reorderCategories = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return;

    move(oldIndex, newIndex);
    arrayMove(categoryMaps ?? [], oldIndex, newIndex).forEach((_, categoryIndex) => {
      setValue(`categoryMaps.${categoryIndex}.sortOrder`, categoryIndex + 1, { shouldDirty: true });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);
    reorderCategories(oldIndex, newIndex);
  };

  const appendCategory = () => {
    append({ ...emptyCategory(), sortOrder: fields.length + 1 });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Kategori Atamaları</h6>
          <p className="text-soft fs-13px mb-0">Ürünü bir veya birden fazla kategoriye atayın.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={appendCategory}
        >
          <em className="icon ni ni-plus me-1" />
          Kategori Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">  
          <em className="icon ni ni-layers fs-2 d-block mb-2" />
          <p className="mb-0">Henüz kategori eklenmedi.</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          <div className="d-flex flex-column gap-3 h-100">
            {fields.map((field, index) => (
              <SortableCategoryCard id={field.id} key={field.id}>
                {({ attributes, listeners }) => (
                  <div className="card card-bordered">
                    <div className="card-inner">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-outline-primary">Kategori #{index + 1}</span>
                        <div className="d-flex flex-wrap align-items-center justify-content-end gap-1">
                          <span className="pricing-order-chip" title="Sıra sürükleyerek değiştirilir">
                            Sıra {index + 1}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-icon btn-outline-light pricing-drag-handle"
                            title="Sürükleyerek sırala"
                            {...attributes}
                            {...listeners}
                          >
                            <em className="icon ni ni-drag" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-icon btn-outline-light"
                            disabled={index === 0}
                            onClick={() => reorderCategories(index, index - 1)}
                            title="Yukarı taşı"
                          >
                            <em className="icon ni ni-chevron-up" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-icon btn-outline-light"
                            disabled={index === fields.length - 1}
                            onClick={() => reorderCategories(index, index + 1)}
                            title="Aşağı taşı"
                          >
                            <em className="icon ni ni-chevron-down" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-icon btn-trigger text-danger"
                            onClick={() => remove(index)}
                            title="Kategoriyi Kaldır"
                          >
                            <em className="icon ni ni-trash" />
                          </button>
                        </div>
                      </div>
                      <input type="hidden" {...register(`categoryMaps.${index}.sortOrder`, { valueAsNumber: true })} />

                      <div className="row g-3">
                        <div className="col-md-8">
                          <label className="form-label">
                            Kategori <span className="text-danger">*</span>
                          </label>
                          <Controller
                            control={control}
                            name={`categoryMaps.${index}.productCategoryId`}
                            rules={{ required: "Kategori seçiniz" }}
                            render={({ field: f }) => (
                              <CategoryTreeSelect
                                value={f.value || null}
                                onChange={(val) => f.onChange(val ?? "")}
                              />
                            )}
                          />
                          {errors.categoryMaps?.[index]?.productCategoryId && (
                            <div className="text-danger fs-12px mt-1">
                              {errors.categoryMaps[index]?.productCategoryId?.message}
                            </div>
                          )}
                        </div>

                        <div className="col-md-4 d-flex align-items-end pb-1">
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`cat-primary-${field.id}`}
                              {...register(`categoryMaps.${index}.isPrimary`)}
                            />
                            <label className="form-check-label" htmlFor={`cat-primary-${field.id}`}>
                              Birincil Kategori
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </SortableCategoryCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {fields.length > 0 && (
        <button
          type="button"
          className="btn btn-outline-primary btn-sm mt-3"
          onClick={appendCategory}
        >
          <em className="icon ni ni-plus me-1" />
          Kategori Ekle
        </button>
      )}
    </div>
  );
};

export default CategoryTreeSelector;
