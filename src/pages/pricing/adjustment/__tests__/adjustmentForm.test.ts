import { describe, expect, it } from "vitest";
import {
  adjustmentToForm,
  formToAdjustment,
  getAdjustment,
} from "@/pages/pricing/adjustment/adjustmentForm";
import type {
  ProductPricingRuleAdjustmentDto,
  ProductPricingRuleDto,
} from "@/domain/types/productOperations.types";
import type { AdjustmentFormState } from "@/pages/pricing/adjustment/adjustmentForm";

const json = JSON.stringify({
  applyOn: "currentPrice",
  mode: "unit",
  unit: { freeUnits: null, rounding: "" },
  tiers: [
    { from: 1, to: 10, type: "fixed", value: 50 },
    { from: 11, to: null, type: "fixed", value: 40 },
  ],
});

describe("getAdjustment", () => {
  it("priceAdjustment boşken priceAdjustmentJson içindeki kademeleri okur", () => {
    const rule = {
      id: "rule-001",
      productId: "prod-001",
      code: "rule-kademeli",
      name: "Kademeli fiyat kuralı",
      priority: 10,
      isActive: true,
      priceAdjustmentJson: json,
    } as ProductPricingRuleDto;

    expect(getAdjustment(rule)).toMatchObject({
      mode: "unit",
      applyOn: "currentPrice",
      tiers: [
        { from: 1, to: 10, type: "fixed", value: 50 },
        { from: 11, to: null, type: "fixed", value: 40 },
      ],
    });
  });
});

const emptyLimits = {
  minAdjustment: null,
  maxAdjustment: null,
  minFinalPrice: null,
  maxFinalPrice: null,
};

const emptyConditions = { operator: "all" as const, items: [] };

describe("formToAdjustment / adjustmentToForm", () => {
  it("sabit yüzde indirimi type + value + operation olarak yazar", () => {
    const form: AdjustmentFormState = {
      ...adjustmentToForm({}),
      mode: "",
      type: "percentage",
      value: "10",
      operation: "subtract",
    };

    expect(formToAdjustment(form)).toEqual({
      type: "percentage",
      applyOn: "currentPrice",
      value: 10,
      operation: "subtract",
      limits: emptyLimits,
      conditions: emptyConditions,
    });
  });

  it("Artır yönünde operation alanını göndermez (boş string)", () => {
    const form: AdjustmentFormState = {
      ...adjustmentToForm({}),
      mode: "",
      type: "fixed",
      value: "100",
      operation: "",
    };

    const payload = formToAdjustment(form);
    expect(payload.operation).toBeUndefined();
    expect(payload).toEqual({
      type: "fixed",
      applyOn: "currentPrice",
      value: 100,
      limits: emptyLimits,
      conditions: emptyConditions,
    });
  });

  it("kademeli modda type/value yerine mode + tiers yazar; unit.field boşsa eklenmez", () => {
    const form: AdjustmentFormState = {
      ...adjustmentToForm({}),
      mode: "unit",
      type: "fixed",
      value: "10",
      operation: "",
      tiers: [
        { from: "1", to: "10", type: "fixed", value: "50" },
        { from: "11", to: "", type: "fixed", value: "40" },
      ],
    };

    expect(formToAdjustment(form)).toEqual({
      applyOn: "currentPrice",
      mode: "unit",
      unit: { freeUnits: null, rounding: "" },
      tiers: [
        { from: 1, to: 10, type: "fixed", value: 50 },
        { from: 11, to: null, type: "fixed", value: 40 },
      ],
      limits: emptyLimits,
      conditions: emptyConditions,
    });
  });

  it("unit.field doluysa kademeli payload'a yazar", () => {
    const form: AdjustmentFormState = {
      ...adjustmentToForm({}),
      mode: "unit",
      unitField: "feature.smsCount",
      rounding: "ceil",
      freeUnits: "5",
      tiers: [{ from: "1", to: "", type: "percentage", value: "10" }],
    };

    expect(formToAdjustment(form)).toMatchObject({
      mode: "unit",
      unit: { field: "feature.smsCount", freeUnits: 5, rounding: "ceil" },
      tiers: [{ from: 1, to: null, type: "percentage", value: 10 }],
    });
  });

  it("kademeli kaydı forma okuyup tekrar aynı payload'a çevirir", () => {
    const stored: ProductPricingRuleAdjustmentDto = {
      applyOn: "currentPrice",
      mode: "unit",
      unit: { freeUnits: null, rounding: "" },
      tiers: [
        { from: 1, to: 10, type: "fixed", value: 50 },
        { from: 11, to: null, type: "fixed", value: 40 },
      ],
      limits: emptyLimits,
      conditions: emptyConditions,
    };

    expect(formToAdjustment(adjustmentToForm(stored))).toEqual(stored);
  });

  it("boş kademe satırlarını payload'dan düşürür", () => {
    const form: AdjustmentFormState = {
      ...adjustmentToForm({}),
      mode: "unit",
      tiers: [
        { from: "", to: "", type: "fixed", value: "" },
        { from: "1", to: "5", type: "fixed", value: "20" },
      ],
    };

    expect(formToAdjustment(form).tiers).toEqual([{ from: 1, to: 5, type: "fixed", value: 20 }]);
  });
});
