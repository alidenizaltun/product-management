import React from "react";
import { Button } from "reactstrap";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues, VariantAxisForm } from "@/modules/products/types/productEditor.types";

const parseAxisValues = (valuesCsv: string) =>
  valuesCsv
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const buildCombinations = (axes: VariantAxisForm[]) => {
  const validAxes = axes
    .map((axis) => ({
      name: axis.name?.trim(),
      values: parseAxisValues(axis.valuesCsv ?? ""),
    }))
    .filter((axis) => axis.name && axis.values.length);

  if (!validAxes.length) {
    return [] as Array<Record<string, string>>;
  }

  return validAxes.reduce<Array<Record<string, string>>>((acc, axis) => {
    if (acc.length === 0) {
      return axis.values.map((value) => ({ [axis.name as string]: value }));
    }

    return acc.flatMap((combo) =>
      axis.values.map((value) => ({
        ...combo,
        [axis.name as string]: value,
      }))
    );
  }, []);
};

const VariantBuilder: React.FC = () => {
  const { control, register, getValues } = useFormContext<ProductFormValues>();
  const {
    fields: axisFields,
    append: appendAxis,
    remove: removeAxis,
  } = useFieldArray({ control, name: "metadata.variantAxes" });
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    replace: replaceVariants,
  } = useFieldArray({ control, name: "metadata.variants" });

  const handleGenerate = () => {
    const axes = getValues("metadata.variantAxes") ?? [];
    const combos = buildCombinations(axes);
    if (!combos.length) {
      return;
    }

    const existingVariants = getValues("metadata.variants") ?? [];
    const variantSummaries = new Map(
      existingVariants.map((variant) => [variant.optionSummary ?? "", variant])
    );

    const generated = combos.map((combo) => {
      const optionSummary = Object.entries(combo)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" | ");
      const existing = variantSummaries.get(optionSummary);
      if (existing) {
        return existing;
      }
      return {
        sku: "",
        barcode: "",
        isActive: true,
        optionSummary,
      };
    });

    replaceVariants(generated);
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="card card-bordered">
        <div className="card-inner border-bottom">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h6 className="mb-0">Varyant Akslari</h6>
              <small className="text-muted">Aks ekleyip kombinasyon uretin.</small>
            </div>
            <div className="d-flex gap-2">
              <Button
                color="light"
                size="sm"
                type="button"
                onClick={() => appendAxis({ name: "", valuesCsv: "" })}
              >
                Aks Ekle
              </Button>
              <Button color="primary" size="sm" type="button" onClick={handleGenerate}>
                Kombinasyon Uret
              </Button>
            </div>
          </div>
        </div>
        <div className="card-inner">
          {axisFields.length === 0 ? (
            <div className="alert alert-light mb-0">Henus varyant akslari eklenmedi.</div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {axisFields.map((axis, index) => (
                <div key={axis.id} className="border rounded p-3">
                  <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                      <label className="form-label">Aks Adi</label>
                      <input
                        className="form-control"
                        {...register(`metadata.variantAxes.${index}.name` as const, { required: true })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Degerler (virgul ile)</label>
                      <input
                        className="form-control"
                        placeholder="Kirmizi, Mavi, Siyah"
                        {...register(`metadata.variantAxes.${index}.valuesCsv` as const)}
                      />
                    </div>
                    <div className="col-md-2 text-end">
                      <Button color="danger" size="sm" type="button" onClick={() => removeAxis(index)}>
                        Kaldir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card card-bordered">
        <div className="card-inner border-bottom">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h6 className="mb-0">Varyantlar</h6>
              <small className="text-muted">Kombinasyon uretin ya da manuel varyant ekleyin.</small>
            </div>
            <Button
              color="light"
              size="sm"
              type="button"
              onClick={() => appendVariant({ sku: "", barcode: "", isActive: true, optionSummary: "" })}
            >
              Varyant Ekle
            </Button>
          </div>
        </div>
        <div className="card-inner">
          {variantFields.length === 0 ? (
            <div className="alert alert-light mb-0">Varyant bulunmuyor.</div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {variantFields.map((variant, index) => (
                <div key={variant.id} className="border rounded p-3">
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label">SKU</label>
                      <input
                        className="form-control"
                        {...register(`metadata.variants.${index}.sku` as const, { required: true })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Barkod</label>
                      <input className="form-control" {...register(`metadata.variants.${index}.barcode` as const)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Secenek Ozeti</label>
                      <input
                        className="form-control"
                        {...register(`metadata.variants.${index}.optionSummary` as const)}
                      />
                    </div>
                    <div className="col-md-1 d-flex align-items-center">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          {...register(`metadata.variants.${index}.isActive` as const)}
                        />
                        <label className="form-check-label">Aktif</label>
                      </div>
                    </div>
                    <div className="col-md-1 text-end">
                      <Button color="danger" size="sm" type="button" onClick={() => removeVariant(index)}>
                        Kaldir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariantBuilder;
