import { apiRequest } from '@/lib/api-client';

export type AuthUser = {
  id: string;
  email: string;
  isEmailVerified: boolean;
};

export type Profile = {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatarUrl: string | null;
  birthDate: string;
  gender: 'female' | 'male' | 'other';
  country: string;
  city: string | null;
  isVerified: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export function registerRequest(email: string, password: string) {
  return apiRequest<AuthTokens & { user: AuthUser; otpExpiresAt: string }>('/auth/register', {
    method: 'POST',
    body: { email, password },
  });
}

export function loginRequest(email: string, password: string) {
  return apiRequest<AuthTokens & { user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function refreshRequest(refreshToken: string) {
  return apiRequest<AuthTokens>('/auth/refresh', { method: 'POST', body: { refreshToken } });
}

export function logoutRequest(refreshToken: string) {
  return apiRequest<{ ok: true }>('/auth/logout', { method: 'POST', body: { refreshToken } });
}

export function sendRegisterOtpRequest(accessToken: string) {
  return apiRequest<{ ok: true; otpExpiresAt: string }>('/auth/send-verification-otp', {
    method: 'POST',
    body: { purpose: 'register' },
    accessToken,
  });
}

export function sendResetOtpRequest(email: string) {
  return apiRequest<{ ok: true; otpExpiresAt: string }>('/auth/send-verification-otp', {
    method: 'POST',
    body: { purpose: 'reset', email },
  });
}

export function verifyRegisterOtpRequest(accessToken: string, code: string) {
  return apiRequest<{ ok: true }>('/auth/verify-email', {
    method: 'POST',
    body: { purpose: 'register', code },
    accessToken,
  });
}

export function verifyResetOtpRequest(email: string, code: string) {
  return apiRequest<{ ok: true; resetToken: string }>('/auth/verify-email', {
    method: 'POST',
    body: { purpose: 'reset', email, code },
  });
}

export function resetPasswordRequest(resetToken: string, newPassword: string) {
  return apiRequest<{ ok: true }>('/auth/reset-password', {
    method: 'POST',
    body: { resetToken, newPassword },
  });
}

export function checkUsernameRequest(username: string) {
  return apiRequest<{ available: boolean }>(`/users/check-username?u=${encodeURIComponent(username)}`);
}

export function getMeRequest(accessToken: string) {
  return apiRequest<{ user: AuthUser; profile: Profile | null }>('/users/me', { accessToken });
}

export type UpdateProfileBody = {
  firstName: string;
  lastName: string;
  username: string;
  birthDate: string;
  gender: 'female' | 'male' | 'other';
  country: string;
  city: string | null;
};

export function updateProfileRequest(accessToken: string, body: UpdateProfileBody) {
  return apiRequest<{ profile: Profile }>('/users/me', { method: 'PATCH', body, accessToken });
}
