import { IIntegrationRepository } from "@/domain/repositories/IIntegrationRepository";
import { CreateIntegrationRequest, Integration, UpdateIntegrationRequest } from "@/domain/types/system.types";
import { apiClient } from "../apiClient";
import { apiEndpoints } from "../../config/apiEndpoints";

export class IntegrationRepository implements IIntegrationRepository {
  async getAll(): Promise<Integration[]> {
    return apiClient.get<Integration[]>(apiEndpoints.system.integrations);
  }

  async getById(id: string): Promise<Integration> {
    return apiClient.get<Integration>(apiEndpoints.system.integrationById(id));
  }

  async create(payload: CreateIntegrationRequest): Promise<Integration> {
    return apiClient.post<Integration>(apiEndpoints.system.integrations, payload);
  }

  async update(id: string, payload: UpdateIntegrationRequest): Promise<void> {
    await apiClient.put<void>(apiEndpoints.system.integrationById(id), payload);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<void>(apiEndpoints.system.integrationById(id));
  }

  async test(id: string): Promise<Integration> {
    return apiClient.post<Integration>(apiEndpoints.system.integrationTest(id));
  }
}

export const integrationRepository = new IntegrationRepository();
