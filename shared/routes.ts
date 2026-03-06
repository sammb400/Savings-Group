import { z } from 'zod';
import { insertTransactionSchema } from './schema';

export const api = {
  dashboard: {
    get: {
      method: 'GET' as const,
      path: '/api/dashboard' as const,
      responses: {
        200: z.any(), // Returns DashboardData
      }
    }
  },
  members: {
    list: {
      method: 'GET' as const,
      path: '/api/members' as const,
      responses: {
        200: z.array(z.any()), // Returns Member[]
      }
    }
  },
  transactions: {
    create: {
      method: 'POST' as const,
      path: '/api/transactions' as const,
      input: insertTransactionSchema,
      responses: {
        201: z.any(), // Returns Transaction
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
