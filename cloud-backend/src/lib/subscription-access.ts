export const ACCESS_CODES = {
  DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  EXPIRED: 'ACCOUNT_EXPIRED',
  REQUIRED: 'SUBSCRIPTION_REQUIRED',
} as const;

export type SubscriptionAccess = {
  blocked: boolean;
  code: string | null;
  message: string | null;
};

const MESSAGES = {
  [ACCESS_CODES.DEACTIVATED]:
    'This business account has been deactivated. Please contact the software owner to restore access.',
  [ACCESS_CODES.EXPIRED]:
    'This business license has expired. Please contact the software owner to renew it.',
  [ACCESS_CODES.REQUIRED]:
    'This business does not have an active license. Please contact the software owner for help.',
};

export function describeSubscription(subscription: {
  status?: string | null;
  expires_at?: Date | string | null;
} | null | undefined): SubscriptionAccess {
  if (!subscription) {
    return { blocked: true, code: ACCESS_CODES.REQUIRED, message: MESSAGES[ACCESS_CODES.REQUIRED] };
  }

  if (subscription.status !== 'active' && subscription.status !== 'trial') {
    return { blocked: true, code: ACCESS_CODES.DEACTIVATED, message: MESSAGES[ACCESS_CODES.DEACTIVATED] };
  }

  if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
    return { blocked: true, code: ACCESS_CODES.EXPIRED, message: MESSAGES[ACCESS_CODES.EXPIRED] };
  }

  return { blocked: false, code: null, message: null };
}
