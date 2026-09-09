import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DetailSection } from "@/components/shared/DetailSection";
import { EMPTY_DETAIL_VALUE, formatDetailDate, formatDetailYesNo } from "@/components/shared/detailDisplay";

describe("DetailSection", () => {
  it("boş, null ve boş string değerleri em dash olarak gösterir", () => {
    render(
      <DetailSection
        title="Genel Bilgiler"
        items={[
          { label: "Kod", value: "CAT-1" },
          { label: "Açıklama", value: "" },
          { label: "Üst", value: null },
          { label: "Not", value: undefined },
        ]}
      />
    );

    expect(screen.getByText("Kod")).toBeInTheDocument();
    expect(screen.getByText("CAT-1")).toBeInTheDocument();
    expect(screen.getAllByText(EMPTY_DETAIL_VALUE)).toHaveLength(3);
  });
});

describe("formatDetailDate / formatDetailYesNo", () => {
  it("eksik tarihi em dash, geçerli tarihi tr-TR olarak yazar", () => {
    expect(formatDetailDate(undefined)).toBe(EMPTY_DETAIL_VALUE);
    expect(formatDetailDate("not-a-date")).toBe(EMPTY_DETAIL_VALUE);
    expect(formatDetailDate("2025-01-01T00:00:00Z")).toContain("2025");
  });

  it("boolean değerleri Evet/Hayır olarak yazar", () => {
    expect(formatDetailYesNo(true)).toBe("Evet");
    expect(formatDetailYesNo(false)).toBe("Hayır");
    expect(formatDetailYesNo(undefined)).toBe(EMPTY_DETAIL_VALUE);
  });
});
