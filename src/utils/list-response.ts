export interface List<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_page: number;
}
