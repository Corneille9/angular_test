export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  path: string;
  per_page: number;
  total: number;
}
