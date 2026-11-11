import { ApiResponse, Scan, ScanTarget, CreditsMeResponse, NotificationItem, TransactionItem, UserSession } from '../lib/types';

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.msg || `Erreur HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<ApiResponse<{ user: UserSession }>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (payload: { email: string; password: string; phone?: string }) =>
      request<ApiResponse<{ user: UserSession }>>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    logout: () =>
      request<ApiResponse<null>>('/auth/logout', {
        method: 'POST',
      }),
    sendOtp: (phone: string) =>
      request<ApiResponse<{ simulated_code: string }>>('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }),
    verifyOtp: (phone: string, code: string) =>
      request<ApiResponse<null>>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      }),
  },

  // Targets
  targets: {
    list: () => request<ApiResponse<{ items: ScanTarget[] }>>('/targets'),
    get: (id: string) => request<ApiResponse<ScanTarget>>(`/targets/${id}`),
    create: (data: { url: string; name?: string; target_type?: string }) =>
      request<ApiResponse<ScanTarget>>('/targets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    toggleAuthorize: (id: string) =>
      request<ApiResponse<ScanTarget>>(`/targets/${id}/authorize`, {
        method: 'POST',
      }),
    delete: (id: string) =>
      request<ApiResponse<null>>(`/targets/${id}`, {
        method: 'DELETE',
      }),
  },

  // Scans
  scans: {
    list: (params?: { status?: string; target_id?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.target_id) query.set('target_id', params.target_id);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request<ApiResponse<{ items: Scan[] }>>(`/scans${qs}`);
    },
    get: (id: string) => request<ApiResponse<Scan>>(`/scans/${id}`),
    create: (data: { target_id: string; profile: string }) =>
      request<ApiResponse<Scan>>('/scans', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<ApiResponse<null>>(`/scans/${id}`, {
        method: 'DELETE',
      }),
  },

  // Credits
  credits: {
    getMe: () => request<ApiResponse<CreditsMeResponse>>('/credits/me'),
    redeem: (code: string) =>
      request<ApiResponse<{ credits: number; free_scans: number }>>('/credits/redeem', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    getTransactions: () => request<ApiResponse<{ items: TransactionItem[] }>>('/credits/me/transactions'),
  },

  // User & Misc
  misc: {
    getMe: () => request<ApiResponse<UserSession>>('/me'),
    getNotifications: () => request<ApiResponse<{ items: NotificationItem[] }>>('/notifications/me'),
    getUnreadCount: () => request<ApiResponse<{ count: number }>>('/notifications/me/unread-count'),
    readAllNotifications: () => request<ApiResponse<null>>('/notifications/read-all', { method: 'POST' }),
    getReferrals: () => request<ApiResponse<{ request: any }>>('/referrals/me'),
    applyReferral: (data: { fullName: string; promoCode: string; operator: string; phone: string }) =>
      request<ApiResponse<any>>('/referrals/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

export default api;
