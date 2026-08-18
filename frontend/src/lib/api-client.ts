const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
};

const GENERIC_ERROR_MESSAGE = 'Bir şeyler ters gitti, tekrar dene';

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Sunucuya ulaşılamıyor, internet bağlantını kontrol et');
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    // Kendi route handler'larımız { error: string } döner. Fastify'nin kendi ürettiği hatalar
    // (ör. @fastify/rate-limit, 404, bozuk JSON body) { statusCode, error, message } şeklinde
    // döner ve asıl okunabilir metin message'da olur — o yüzden önce message'a bakılıyor.
    const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const message =
      (typeof record?.message === 'string' && record.message) ||
      (typeof record?.error === 'string' && record.error) ||
      GENERIC_ERROR_MESSAGE;
    throw new ApiError(response.status, message);
  }

  return data as T;
}
