export interface CustomerProfile {
  firstName: string;
  lastName: string;
}

export interface ProviderProfile {
  id: string;
  providerType: 'INDIVIDUAL' | 'BUSINESS';
  verificationStatus: string;
  isActive: boolean;
}

export interface CurrentUser {
  id: string;
  email: string;
  isEmailVerified: boolean;
  roles: string[];
  permissions: string[];
  customerProfile: CustomerProfile | null;
  providerProfile: ProviderProfile | null;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  csrfToken?: string;
  refreshToken?: string;
}

export interface RegistrationResponse {
  id: string;
  email: string;
  status: 'PENDING';
  emailDelivery: 'accepted' | 'not_configured';
}

export interface SafeSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
  expiresAt: string;
  lastSeenAt: string | null;
  createdAt: string;
  isCurrent: boolean;
}
