// utils/apiResponse.ts
import { NextResponse } from 'next/server';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface PaginationMeta {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface SuccessBody<T> {
  success: true;
  message: string | null;
  data: T;
}

export interface PaginatedBody<T> extends SuccessBody<T[]> {
  meta: PaginationMeta;
}

export interface ErrorBody {
  success: false;
  message: string;
  code?: string;
  errors?: unknown;
}

/* ------------------------------------------------------------------ */
/* Internal helper                                                    */
/* ------------------------------------------------------------------ */

function json<
  Body extends SuccessBody<unknown> | PaginatedBody<unknown> | ErrorBody
>(body: Body, init?: number | ResponseInit) {
  const status = typeof init === 'number' ? init : init?.status ?? 200;
  const rest   = typeof init === 'number' ? undefined : init;

  return NextResponse.json(body, { ...rest, status });
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

export const api = {
  /* ----- success --------------------------------------------------- */

  ok<T>(data: T, message = null, status = 200) {
    return json<SuccessBody<T>>({ success: true, message, data }, status);
  },

  created<T>(data: T, message = 'Created') {
    return json<SuccessBody<T>>({ success: true, message, data }, 201);
  },

  /* ----- paginated ------------------------------------------------- */

  paginated<T>(
    items: T[],
    meta: PaginationMeta,
    message = null,
    status = 200
  ) {
    return json<PaginatedBody<T>>(
      { success: true, message, data: items, meta },
      status
    );
  },

  /* ----- generic errors ------------------------------------------- */

  error(
    message = 'Something went wrong',
    {
      status = 400,
      code,
      errors,
    }: { status?: number; code?: string; errors?: unknown } = {}
  ) {
    return json<ErrorBody>(
      { success: false, message, code, errors },
      status
    );
  },

  /* ----- convenient shortcuts ------------------------------------- */

  badRequest(errors?: unknown, msg = 'Bad request') {
    return api.error(msg, { status: 400, code: 'BAD_REQUEST', errors });
  },

  unauthorized(msg = 'Unauthorized') {
    return api.error(msg, { status: 401, code: 'UNAUTHORIZED' });
  },

  notFound(msg = 'Not found') {
    return api.error(msg, { status: 404, code: 'NOT_FOUND' });
  },

  validation(errors: unknown) {
    return api.error('Validation failed', {
      status: 422,
      code: 'VALIDATION_ERROR',
      errors,
    });
  },

  internal(err: unknown, msg = 'Internal server error') {
    return api.error(msg, { status: 500, code: 'INTERNAL_ERROR', errors: err });
  },
};
