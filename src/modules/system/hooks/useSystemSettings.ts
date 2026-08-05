import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/query/queryKeys";
import { systemSettingsApi } from "@/modules/system/api/system.api";
import type { BulkUpdateSystemSettingsRequest } from "@/shared/types/system.types";

export const useSystemSettings = () =>
    useQuery({
        queryKey: queryKeys.system.settings,
        queryFn: () => systemSettingsApi.getAll(),
    });

export const useSystemSettingsMutations = () => {
    const qc = useQueryClient();

    const bulkUpdate = useMutation({
        mutationFn: (payload: BulkUpdateSystemSettingsRequest) => systemSettingsApi.bulkUpdate(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.system.settings }),
    });

    return { bulkUpdate };
};
