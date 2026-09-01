import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { priceListRepository } from "@/infrastructure/api/repositories";
import {
  CreateProductPriceListRequestDto,
  UpdateProductPriceListRequestDto,
} from "@/domain/types/productOperations.types";

export const pricingKeys = {
  priceLists: ["pricing", "priceLists"] as const,
  priceList: (id: string) => ["pricing", "priceLists", id] as const,
  priceListItems: (id: string) => ["pricing", "priceLists", id, "items"] as const,
};

export const usePriceLists = () =>
  useQuery({ queryKey: pricingKeys.priceLists, queryFn: () => priceListRepository.list() });

export const usePriceList = (id?: string) =>
  useQuery({
    queryKey: id ? pricingKeys.priceList(id) : ["pricing", "priceLists", "missing"],
    queryFn: () => priceListRepository.byId(id as string),
    enabled: Boolean(id),
  });

export const usePriceListItems = (id?: string) =>
  useQuery({
    queryKey: id ? pricingKeys.priceListItems(id) : ["pricing", "priceLists", "missing", "items"],
    queryFn: () => priceListRepository.items(id as string),
    enabled: Boolean(id),
  });

export const usePriceListMutations = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload: CreateProductPriceListRequestDto) => priceListRepository.create(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: pricingKeys.priceLists }),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdateProductPriceListRequestDto }) =>
        priceListRepository.update(vars.id, vars.payload),
      onSuccess: (_d, vars) => {
        qc.invalidateQueries({ queryKey: pricingKeys.priceLists });
        qc.invalidateQueries({ queryKey: pricingKeys.priceList(vars.id) });
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => priceListRepository.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: pricingKeys.priceLists }),
    }),
  };
};
