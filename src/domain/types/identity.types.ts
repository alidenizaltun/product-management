export type Uuid = string;

export interface AdminUser {
  id: Uuid;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  phoneNumber?: string;
  emailConfirmed: boolean;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive: boolean;
  roles: string[];
}

export interface Role {
  id: Uuid;
  name: string;
  description?: string;
  isActive: boolean;
  userCount: number;
  permissions: string[];
  createdAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  description?: string;
  isActive: boolean;
  permissions: string[];
}

export interface PermissionDefinition {
  key: string;
  displayName: string;
  category: string;
}
