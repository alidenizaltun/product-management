import { ISystemSettingRepository } from "@/domain/repositories/ISystemSettingRepository";
import { BulkUpdateSystemSettingsRequest, SystemSetting } from "@/domain/types/system.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

export class SystemSettingRepository implements ISystemSettingRepository {
  async getAll(): Promise<SystemSetting[]> {
    return apiClient.get<SystemSetting[]>(apiEndpoints.system.settings);
  }

  async bulkUpdate(payload: BulkUpdateSystemSettingsRequest): Promise<void> {
    await apiClient.put<void>(apiEndpoints.system.settings, payload);
  }
}

export const systemSettingRepository = new SystemSettingRepository();
