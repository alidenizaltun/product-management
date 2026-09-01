import { CreateIntegrationRequest, Integration, UpdateIntegrationRequest } from "../types/system.types";

export interface IIntegrationRepository {
  getAll(): Promise<Integration[]>;
  getById(id: string): Promise<Integration>;
  create(payload: CreateIntegrationRequest): Promise<Integration>;
  update(id: string, payload: UpdateIntegrationRequest): Promise<void>;
  delete(id: string): Promise<void>;
  test(id: string): Promise<Integration>;
}
