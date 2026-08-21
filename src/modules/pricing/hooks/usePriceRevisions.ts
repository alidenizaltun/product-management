import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { priceRevisionsApi } from "@/modules/pricing/api/priceRevisions.api";
import type {
  CreatePriceRevisionRequestDto,
  CreatePriceRevisionScopeRequestDto,
  PriceRevisionLineFilterDto,
  UpdatePriceRevisionLineRequestDto,
  UpdatePriceRevisionRequestDto,
} from "@/shared/types/productOperations.types";

export const priceRevisionKeys = {
  all: ["pricing", "revisions"] as const,
  list: (status?: number) => ["pricing", "revisions", "list", status ?? "all"] as const,
  detail: (id: string) => ["pricing", "revisions", id] as const,
  lines: (id: string, filter?: PriceRevisionLineFilterDto) =>
    ["pricing", "revisions", id, "lines", filter ?? {}] as const,
};

export const usePriceRevisions = (status?: number) =>
  useQuery({
    queryKey: priceRevisionKeys.list(status),
    queryFn: () => priceRevisionsApi.list(status),
  });

export const usePriceRevision = (id?: string) =>
  useQuery({
    queryKey: id ? priceRevisionKeys.detail(id) : ["pricing", "revisions", "missing"],
    queryFn: () => priceRevisionsApi.byId(id as string),
    enabled: Boolean(id),
  });

export const usePriceRevisionLines = (id?: string, filter?: PriceRevisionLineFilterDto) =>
  useQuery({
    queryKey: id ? priceRevisionKeys.lines(id, filter) : ["pricing", "revisions", "missing", "lines"],
    queryFn: () => priceRevisionsApi.lines(id as string, filter),
    enabled: Boolean(id),
  });

export const usePriceRevisionMutations = (revisionId?: string) => {
  const queryClient = useQueryClient();

  /**
   * Revizyonda yapılan her değişiklik satırları da etkileyebilir: kapsam ya da oran
   * değişince önizleme satırları silinir, önizleme tazelenince satır id'leri yenilenir.
   * Bu yüzden tüm revizyon anahtarları birlikte geçersiz kılınır.
   */
  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: priceRevisionKeys.all });

  /**
   * Uygulama ve geri alma gerçek fiyatları değiştirir; ürün ve fiyat listesi
   * sorgularının da tazelenmesi gerekir.
   */
  const invalidatePrices = () => {
    invalidateAll();
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["pricing", "priceLists"] });
    queryClient.invalidateQueries({ queryKey: ["pricing", "templates"] });
  };

  const requireId = () => {
    if (!revisionId) throw new Error("Revizyon seçili değil.");
    return revisionId;
  };

  return {
    create: useMutation({
      mutationFn: (payload: CreatePriceRevisionRequestDto) => priceRevisionsApi.create(payload),
      onSuccess: invalidateAll,
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; payload: UpdatePriceRevisionRequestDto }) =>
        priceRevisionsApi.update(vars.id, vars.payload),
      onSuccess: invalidateAll,
    }),
    remove: useMutation({
      mutationFn: (id: string) => priceRevisionsApi.delete(id),
      onSuccess: invalidateAll,
    }),
    addScope: useMutation({
      mutationFn: (payload: CreatePriceRevisionScopeRequestDto) =>
        priceRevisionsApi.addScope(requireId(), payload),
      onSuccess: invalidateAll,
    }),
    removeScope: useMutation({
      mutationFn: (scopeId: string) => priceRevisionsApi.removeScope(requireId(), scopeId),
      onSuccess: invalidateAll,
    }),
    preview: useMutation({
      mutationFn: () => priceRevisionsApi.preview(requireId()),
      onSuccess: invalidateAll,
    }),
    updateLine: useMutation({
      mutationFn: (vars: { lineId: string; payload: UpdatePriceRevisionLineRequestDto }) =>
        priceRevisionsApi.updateLine(requireId(), vars.lineId, vars.payload),
      onSuccess: invalidateAll,
    }),
    submit: useMutation({
      mutationFn: () => priceRevisionsApi.submit(requireId()),
      onSuccess: invalidateAll,
    }),
    approve: useMutation({
      mutationFn: (note?: string) => priceRevisionsApi.approve(requireId(), note),
      onSuccess: invalidateAll,
    }),
    reject: useMutation({
      mutationFn: (note: string) => priceRevisionsApi.reject(requireId(), note),
      onSuccess: invalidateAll,
    }),
    cancel: useMutation({
      mutationFn: () => priceRevisionsApi.cancel(requireId()),
      onSuccess: invalidateAll,
    }),
    apply: useMutation({
      mutationFn: () => priceRevisionsApi.apply(requireId()),
      onSuccess: invalidatePrices,
    }),
    rollback: useMutation({
      mutationFn: () => priceRevisionsApi.rollback(requireId()),
      onSuccess: invalidatePrices,
    }),
  };
};
