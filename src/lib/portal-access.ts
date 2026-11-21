import type { CurrentUser } from '@/types/auth';

export function canAccessCustomer(user: CurrentUser | null): boolean {
  return Boolean(user?.customerProfile && user.roles.includes('CUSTOMER'));
}

export function canAccessProvider(user: CurrentUser | null): boolean {
  return Boolean(
    user?.providerProfile &&
      user.roles.includes(
        user.providerProfile.providerType === 'BUSINESS' ? 'BUSINESS_PROVIDER' : 'INDIVIDUAL_PROVIDER',
      ),
  );
}
