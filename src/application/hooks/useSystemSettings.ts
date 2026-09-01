import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { systemSettingRepository } from "@/infrastructure/api/repositories";
import type { BulkUpdateSystemSettingsRequest } from "@/domain/types/system.types";

export const useSystemSettings = () =>
    useQuery({
        queryKey: queryKeys.system.settings,
        queryFn: () => systemSettingRepository.getAll(),
    });

export const useSystemSettingsMutations = () => {
    const qc = useQueryClient();

    const bulkUpdate = useMutation({
        mutationFn: (payload: BulkUpdateSystemSettingsRequest) => systemSettingRepository.bulkUpdate(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.system.settings }),
    });

    return { bulkUpdate };
};
