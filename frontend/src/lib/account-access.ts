export const ACCOUNT_ACCESS_CODES = ['ACCOUNT_DEACTIVATED', 'ACCOUNT_EXPIRED', 'SUBSCRIPTION_REQUIRED'] as const;

export type AccountAccessCode = (typeof ACCOUNT_ACCESS_CODES)[number];

export type AccountAccessState = {
  blocked: boolean;
  code: AccountAccessCode | string | null;
  message: string | null;
};

export function isAccountAccessPayload(data: any): data is { code: string; message?: string } {
  return Boolean(data?.code && ACCOUNT_ACCESS_CODES.includes(data.code));
}

export function accessFromPayload(data: any): AccountAccessState | null {
  if (!data) return null;
  if (data.access?.blocked && data.access.code) {
    return {
      blocked: true,
      code: data.access.code,
      message: data.access.message || defaultAccessMessage(data.access.code)
    };
  }
  if (isAccountAccessPayload(data)) {
    return {
      blocked: true,
      code: data.code,
      message: data.message || defaultAccessMessage(data.code)
    };
  }
  return null;
}

export function defaultAccessMessage(code?: string | null) {
  if (code === 'ACCOUNT_EXPIRED') {
    return 'This business license has expired. Please contact the software owner to renew it.';
  }
  if (code === 'SUBSCRIPTION_REQUIRED') {
    return 'This business does not have an active license. Please contact the software owner for help.';
  }
  return 'This business account has been deactivated. Please contact the software owner to restore access.';
}
