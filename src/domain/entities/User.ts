export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  phoneNumber: string | null;
  emailConfirmed: boolean;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
}
