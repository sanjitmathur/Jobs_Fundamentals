export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success?: boolean;
  error?: string;
  message?: string;
  details?: ApiErrorDetail[];
  code?: string;
  meta?: unknown;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
