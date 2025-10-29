// Pagination Link
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Pagination Links (first, last, prev, next)
export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

// Pagination Meta
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationLink[];
  path: string | null;
  per_page: number;
  to: number | null;
  total: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
}

// API Response with message
export interface ApiResponseWithMessage<T> {
  message: string;
  data: T;
}

// Success Response
export interface SuccessResponse {
  success: boolean;
  message: string;
}

// Error Response
export interface ErrorResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

