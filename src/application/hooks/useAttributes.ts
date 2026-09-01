import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attributeDefinitionRepository } from "@/infrastructure/api/repositories";
import {
  CreateProductAttributeDefinitionRequestDto,
  UpdateProductAttributeDefinitionRequestDto,
} from "@/domain/types/productOperations.types";

export const attributeKeys = {
  definitions: ["attributes", "definitions"] as const,
  definition: (id: string) => ["attributes", "definitions", id] as const,
};

export const useAttributeDefinitions = () =>
  useQuery({ queryKey: attributeKeys.definitions, queryFn: () => attributeDefinitionRepository.list() });

export const useAttributeDefinition = (id?: string) =>
  useQuery({
    queryKey: id ? attributeKeys.definition(id) : ["attributes", "definitions", "missing"],
    queryFn: () => attributeDefinitionRepository.byId(id as string),
    enabled: Boolean(id),
  });

export const useAttributeDefinitionMutations = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (payload: CreateProductAttributeDefinitionRequestDto) =>
        attributeDefinitionRepository.create(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: attributeKeys.definitions }),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdateProductAttributeDefinitionRequestDto }) =>
        attributeDefinitionRepository.update(vars.id, vars.payload),
      onSuccess: (_d, vars) => {
        qc.invalidateQueries({ queryKey: attributeKeys.definitions });
        qc.invalidateQueries({ queryKey: attributeKeys.definition(vars.id) });
      },
    }),
    remove: useMutation({
      mutationFn: (id: string) => attributeDefinitionRepository.delete(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: attributeKeys.definitions }),
    }),
  };
};
