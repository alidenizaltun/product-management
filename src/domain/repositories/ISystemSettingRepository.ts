import { BulkUpdateSystemSettingsRequest, SystemSetting } from "../types/system.types";

export interface ISystemSettingRepository {
  getAll(): Promise<SystemSetting[]>;
  bulkUpdate(payload: BulkUpdateSystemSettingsRequest): Promise<void>;
}
