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
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/pages/products/types/productEditor.types";
import RegionSelect from "@/components/shared/selects/RegionSelect";
import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";

/** Bölge kartlarında seçilebilen para birimleri. */
const CURRENCIES = ["TRY", "USD", "EUR", "GBP"];

const emptyRegion = (sortOrder: number, isFirst: boolean) => ({
  regionId: "",
  currencyCode: DEFAULT_CURRENCY_CODE,
  taxRate: undefined as number | undefined,
  isDefault: isFirst,
  isActive: true,
  sortOrder,
});

type SortableHandleProps = {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
};

const SortableRegionCard: React.FC<{
  id: string;
  children: (dragHandleProps: SortableHandleProps) => React.ReactNode;
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

/**
 * Ürünün satıldığı bölgeler. Her bölge kendi fiyat birimini (para birimi) ve
 * KDV oranını taşır; KDV boş bırakılırsa ürünün genel KDV oranı uygulanır.
 */
const ProductRegionsTab: React.FC = () => {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "regions" });
  const regions = useWatch({ control, name: "regions" }) ?? [];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const reorderRegions = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return;

    move(oldIndex, newIndex);
    arrayMove(regions, oldIndex, newIndex).forEach((_, regionIndex) => {
      setValue(`regions.${regionIndex}.sortOrder`, regionIndex + 1, { shouldDirty: true });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);
    reorderRegions(oldIndex, newIndex);
  };

  /** Varsayılan bölge tektir; biri işaretlendiğinde diğerleri temizlenir. */
  const markAsDefault = (index: number) => {
    fields.forEach((_, i) => {
      setValue(`regions.${i}.isDefault`, i === index, { shouldDirty: true });
    });
  };

  const usedRegionIds = new Set(regions.map((region) => region?.regionId).filter(Boolean));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Satış Bölgeleri</h6>
          <p className="text-soft fs-13px mb-0">
            Ürünün satıldığı her bölge için para birimi ve KDV oranı belirleyin.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm flex-shrink-0"
          onClick={() => append(emptyRegion(fields.length + 1, fields.length === 0))}
        >
          <em className="icon ni ni-plus me-1" />
          Bölge Ekle
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-map-pin fs-2 d-block mb-2" />
          <p className="mb-1">Bu ürün henüz hiçbir bölgeye tanımlı değil.</p>
          <p className="fs-12px mb-0">
            Listede yoksa "Yeni Bölge Tanımı" ile aynı sayfada oluşturabilirsiniz.
          </p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
          <div className="d-flex flex-column gap-3">
            {fields.map((field, index) => {
              const region = regions[index];
              const regionIdError = errors.regions?.[index]?.regionId;

              return (
                <SortableRegionCard id={field.id} key={field.id}>
                  {({ attributes, listeners }) => (
                    <div className={`card card-bordered ${region?.isDefault ? "border-primary" : ""}`}>
                      <div className="card-inner">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-outline-primary">Bölge #{index + 1}</span>
                            {region?.isDefault && <span className="badge badge-dim bg-primary">Varsayılan</span>}
                            {region?.isActive === false && <span className="badge badge-dim bg-secondary">Pasif</span>}
                          </div>
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
                              onClick={() => reorderRegions(index, index - 1)}
                              title="Yukarı taşı"
                            >
                              <em className="icon ni ni-chevron-up" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-icon btn-outline-light"
                              disabled={index === fields.length - 1}
                              onClick={() => reorderRegions(index, index + 1)}
                              title="Aşağı taşı"
                            >
                              <em className="icon ni ni-chevron-down" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-icon btn-trigger text-danger"
                              onClick={() => remove(index)}
                              title="Bölgeyi Kaldır"
                            >
                              <em className="icon ni ni-trash" />
                            </button>
                          </div>
                        </div>
                        <input type="hidden" {...register(`regions.${index}.sortOrder`, { valueAsNumber: true })} />

                        <div className="row g-3">
                          <div className="col-md-5">
                            <label className="form-label">
                              Bölge <span className="text-danger">*</span>
                            </label>
                            <Controller
                              control={control}
                              name={`regions.${index}.regionId`}
                              rules={{
                                required: "Bölge seçiniz",
                                validate: (value) =>
                                  regions.filter((r) => r?.regionId === value).length <= 1 ||
                                  "Aynı bölge birden fazla kez eklenemez",
                              }}
                              render={({ field: f }) => (
                                <RegionSelect
                                  value={f.value || null}
                                  onChange={(val) => f.onChange(val ?? "")}
                                  isInvalid={Boolean(regionIdError)}
                                  error={regionIdError?.message}
                                />
                              )}
                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label">
                              Fiyat Birimi <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-control form-select"
                              {...register(`regions.${index}.currencyCode`, { required: true })}
                            >
                              {CURRENCIES.map((currency) => (
                                <option key={currency} value={currency}>
                                  {currency}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-4">
                            <label className="form-label">KDV Oranı</label>
                            <div className="input-group">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                className="form-control"
                                placeholder="0"
                                {...register(`regions.${index}.taxRate`, {
                                  setValueAs: (value) => (value === "" || value === null ? undefined : Number(value)),
                                  min: { value: 0, message: "KDV oranı 0'dan küçük olamaz" },
                                  max: { value: 100, message: "KDV oranı 100'den büyük olamaz" },
                                })}
                              />
                              <span className="input-group-text">%</span>
                            </div>
                            {errors.regions?.[index]?.taxRate && (
                              <div className="text-danger fs-12px mt-1">{errors.regions[index]?.taxRate?.message}</div>
                            )}
                          </div>

                          <div className="col-12 d-flex align-items-end gap-4 pb-1">
                            <div className="custom-control custom-switch">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id={`region-active-${field.id}`}
                                {...register(`regions.${index}.isActive`)}
                              />
                              <label className="custom-control-label" htmlFor={`region-active-${field.id}`}>
                                Aktif
                              </label>
                            </div>

                            <button
                              type="button"
                              className={`btn btn-sm ${region?.isDefault ? "btn-primary" : "btn-outline-light"}`}
                              onClick={() => markAsDefault(index)}
                              disabled={region?.isDefault}
                            >
                              <em className="icon ni ni-check-circle me-1" />
                              Varsayılan yap
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </SortableRegionCard>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {fields.length > 0 && (
        <p className="text-soft fs-12px mt-3 mb-0">
          {usedRegionIds.size} bölge tanımlı. Fiyat tarifelerinde bölge seçerek bölgeye özel fiyat verebilirsiniz.
        </p>
      )}
    </div>
  );
};

export default ProductRegionsTab;
