export interface Warehouse {
  id: number;
  name: string;
  code: string;
  description?: string;
  address?: string;
  manager?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
