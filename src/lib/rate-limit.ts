/**
 * Rate limiting simples usando cache em memória.
 * Funciona por instância serverless — adequado para proteção básica contra spam.
 * Para produção de alto volume, substituir por Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  /** Número máximo de requisições permitidas na janela */
  limit: number;
  /** Duração da janela em milissegundos (padrão: 60 000 = 1 min) */
  windowMs?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { limit, windowMs = 60_000 } = options;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // Primeira requisição ou janela expirada: reinicia
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
