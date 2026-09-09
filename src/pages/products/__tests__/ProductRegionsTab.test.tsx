import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductRegionsTab from "@/pages/products/components/editor/ProductRegionsTab";
import { buildDefaultValues, buildFullProductPayload } from "@/pages/products/utils/productFormMapper";
import type { ProductFormValues } from "@/pages/products/types/productEditor.types";
import type { ProductRegionForm } from "@/pages/products/types/productEditor.types";

const TWO_REGIONS: ProductRegionForm[] = [
  { regionId: "region-a", currencyCode: "TRY", isDefault: true, isActive: true, sortOrder: 1 },
  { regionId: "region-b", currencyCode: "USD", isDefault: false, isActive: true, sortOrder: 2 },
];

const FormHost: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const form = useForm<ProductFormValues>({
    defaultValues: { ...buildDefaultValues(), regions: TWO_REGIONS },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...form}>
        <ProductRegionsTab />
        {children}
      </FormProvider>
    </QueryClientProvider>
  );
};

const SortOrderProbe: React.FC = () => {
  const { getValues, watch } = useFormContext<ProductFormValues>();
  const regions = watch("regions") ?? [];
  const payloadRegions = buildFullProductPayload(getValues(), { productId: "prod-1" }).payload.regions;
  return (
    <>
      <pre data-testid="region-sort-orders">
        {JSON.stringify(regions.map((region) => ({ regionId: region.regionId, sortOrder: region.sortOrder })))}
      </pre>
      <pre data-testid="region-payload-sort-orders">
        {JSON.stringify(payloadRegions?.map((region) => ({ regionId: region.regionId, sortOrder: region.sortOrder })) ?? [])}
      </pre>
    </>
  );
};

describe("ProductRegionsTab", () => {
  it("Sıra numara kutusu göstermez; sıra chip ve taşıma düğmeleriyle görünür", () => {
    render(<FormHost />);

    expect(screen.queryByLabelText(/^Sıra$/)).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: /^sıra$/i })).not.toBeInTheDocument();
    expect(screen.getByText("Sıra 1")).toBeInTheDocument();
    expect(screen.getByText("Sıra 2")).toBeInTheDocument();
    expect(screen.getAllByTitle("Sürükleyerek sırala")).toHaveLength(2);
    expect(screen.getAllByTitle("Yukarı taşı")).toHaveLength(2);
    expect(screen.getAllByTitle("Aşağı taşı")).toHaveLength(2);
  });

  it("yeniden sıralanınca sortOrder görsel sırayla eşleşir", async () => {
    const user = userEvent.setup();
    render(
      <FormHost>
        <SortOrderProbe />
      </FormHost>
    );

    expect(screen.getByTestId("region-sort-orders")).toHaveTextContent(
      JSON.stringify([
        { regionId: "region-a", sortOrder: 1 },
        { regionId: "region-b", sortOrder: 2 },
      ])
    );

    await user.click(screen.getAllByTitle("Aşağı taşı")[0]);

    const reordered = JSON.stringify([
      { regionId: "region-b", sortOrder: 1 },
      { regionId: "region-a", sortOrder: 2 },
    ]);
    expect(screen.getByTestId("region-sort-orders")).toHaveTextContent(reordered);
    expect(screen.getByTestId("region-payload-sort-orders")).toHaveTextContent(reordered);
  });
});
