export type Uuid = string;

export type SystemSettingDataType = "String" | "Number" | "Boolean" | "Json";

export interface SystemSetting {
  id: Uuid;
  category: string;
  key: string;
  value?: string;
  dataType: SystemSettingDataType;
  displayName: string;
  description?: string;
  isEditable: boolean;
  sortOrder: number;
  updatedAt?: string;
}

export interface UpdateSystemSettingItem {
  id: Uuid;
  value?: string;
}

export interface BulkUpdateSystemSettingsRequest {
  items: UpdateSystemSettingItem[];
}

export type IntegrationType = "Email" | "Sms" | "Payment" | "Storage" | "Webhook" | "Other";

export interface Integration {
  id: Uuid;
  name: string;
  type: IntegrationType | string;
  providerKey: string;
  isEnabled: boolean;
  configJson?: string;
  hasCredentials: boolean;
  credentialsPreview?: string;
  isSystemManaged: boolean;
  description?: string;
  lastTestedAt?: string;
  lastTestSucceeded?: boolean;
  lastTestMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateIntegrationRequest {
  name: string;
  type: string;
  providerKey: string;
  isEnabled: boolean;
  configJson?: string;
  credentials?: Record<string, string>;
  description?: string;
}

export interface UpdateIntegrationRequest {
  name: string;
  isEnabled: boolean;
  configJson?: string;
  credentials?: Record<string, string>;
  description?: string;
}
