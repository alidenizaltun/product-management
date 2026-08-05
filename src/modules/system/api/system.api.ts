import { apiClient } from "@/shared/api/apiClient";
import { apiEndpoints } from "@/shared/config/apiEndpoints";
import type {
    BulkUpdateSystemSettingsRequest,
    CreateIntegrationRequest,
    Integration,
    SystemSetting,
    UpdateIntegrationRequest,
} from "@/shared/types/system.types";

const ep = apiEndpoints.system;

export const systemSettingsApi = {
    getAll: (): Promise<SystemSetting[]> => apiClient.get<SystemSetting[]>(ep.settings),

    bulkUpdate: (payload: BulkUpdateSystemSettingsRequest): Promise<void> =>
        apiClient.put<void>(ep.settings, payload),
};

export const integrationsApi = {
    getAll: (): Promise<Integration[]> => apiClient.get<Integration[]>(ep.integrations),

    getById: (id: string): Promise<Integration> => apiClient.get<Integration>(ep.integrationById(id)),

    create: (payload: CreateIntegrationRequest): Promise<Integration> =>
        apiClient.post<Integration>(ep.integrations, payload),

    update: (id: string, payload: UpdateIntegrationRequest): Promise<void> =>
        apiClient.put<void>(ep.integrationById(id), payload),

    delete: (id: string): Promise<void> => apiClient.delete<void>(ep.integrationById(id)),

    test: (id: string): Promise<Integration> => apiClient.post<Integration>(ep.integrationTest(id)),
};
