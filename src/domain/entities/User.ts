/**
 * User entity and token payload returned by authentication endpoints.
 */
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
  createdAt: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  expiresAt: string;
}
