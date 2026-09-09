import { describe, expect, it } from "vitest";
import { getAdjustment } from "@/pages/pricing/adjustment/adjustmentForm";
import type { ProductPricingRuleDto } from "@/domain/types/productOperations.types";

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
