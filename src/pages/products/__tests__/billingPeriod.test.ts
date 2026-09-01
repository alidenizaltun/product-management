import { describe, expect, it } from "vitest";
import { getBillingPeriodValueForUnit } from "@/pages/products/utils/billingPeriod";

describe("billing period defaults", () => {
  it("faturalama birimine göre önerilen gün sayısını döndürür", () => {
    expect(getBillingPeriodValueForUnit(1)).toBe(1);
    expect(getBillingPeriodValueForUnit(2)).toBe(7);
    expect(getBillingPeriodValueForUnit(3)).toBe(30);
    expect(getBillingPeriodValueForUnit(4)).toBe(365);
  });

  it("boş veya bilinmeyen birimde değer üretmez", () => {
    expect(getBillingPeriodValueForUnit("")).toBeUndefined();
    expect(getBillingPeriodValueForUnit(99)).toBeUndefined();
  });
});
