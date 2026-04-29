import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { priceListsApi } from "@/modules/pricing/api/pricing.api";
import {
  CreateProductPriceListRequestDto,
  UpdateProductPriceListRequestDto,
} from "@/domain";

export const pricingKeys = {
  priceLists: ["pricing", "priceLists"] as const,
  priceList: (id: string) => ["pricing", "priceLists", id] as const,
  priceListItems: (id: string) => ["pricing", "priceLists", id, "items"] as const,
};

export const usePriceLists = () =>
  useQuery({ queryKey: pricingKeys.priceLists, queryFn: priceListsApi.list });

export const usePriceList = (id?: string) =>
  useQuery({
    queryKey: id ? pricingKeys.priceList(id) : ["pricing", "priceLists", "missing"],
    queryFn: () => priceListsApi.byId(id as string),
    enabled: Boolean(id),
  });

export const usePriceListItems = (id?: string) =>
  useQuery({
    queryKey: id ? pricingKeys.priceListItems(id) : ["pricing", "priceLists", "missing", "items"],
    queryFn: () => priceListsApi.items(id as string),
    enabled: Boolean(id),
  });

export const usePriceListMutations = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload: CreateProductPriceListRequestDto) => priceListsApi.create(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: pricingKeys.priceLists }),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdateProductPriceListRequestDto }) =>
        priceListsApi.update(vars.id, vars.payload),
      onSuccess: (_d, vars) => {
        qc.invalidateQueries({ queryKey: pricingKeys.priceLists });
        qc.invalidateQueries({ queryKey: pricingKeys.priceList(vars.id) });
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => priceListsApi.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: pricingKeys.priceLists }),
    }),
  };
};
