// hooks/useApiRequest.ts
import { toast } from 'sonner';
import { useCallback } from 'react';

/* ------------------------------------------------------------- */
/*  Your shared API-response shapes (same as utils/apiResponse)  */
/* ------------------------------------------------------------- */

interface SuccessBody<T> {
  success: true;
  message: string;
  data: T;
}

interface ErrorBody {
  success: false;
  message: string;
  code?: string;
  errors?: unknown;
}

/* ------------------------------------------------------------- */
/*  The hook                                                     */
/* ------------------------------------------------------------- */

type AnyJson = Record<string, unknown> | unknown[];

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON body for POST / PUT / PATCH */
  body?: AnyJson;
  /** Overrides the default toast-on-success behaviour */
  silent?: boolean;
}

export function useApiRequest() {
  /**
   * Makes a request and returns the typed `data` on success.
   * On *any* error → shows a toast and returns `undefined`.
   */
  const apiRequest = useCallback(
    async <T = unknown>(
      input: RequestInfo | URL,
      { body, silent, headers, ...init }: RequestOptions = {}
    ): Promise<T | undefined> => {
      try {
        const res = await fetch(input, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...(headers || {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        // handle 204 No-Content without JSON
        if (res.status === 204) {
          !silent && toast.success('Done');
          return undefined as unknown as T;
        }

        const json: SuccessBody<T> | ErrorBody = await res.json();

        /* ---------- success path ---------------------------------- */
        if (json.success) {
          if (!silent && json.message) toast.success(json.message);
          return json.data;
        }

        /* ---------- formatted error path ------------------------- */
        toast.error(json.message || 'Error');
        // console.error(json);
        return undefined;
      } catch (err) {
        /* ---------- transport / parse error ---------------------- */
        const msg =
          err instanceof Error ? err.message : 'Network or parsing error';
        toast.error(msg);
        console.error(err);
        return undefined;
      }
    },
    []
  );

  return { apiRequest };
}
