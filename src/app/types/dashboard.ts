export interface DashboardUserStats {
  total: number;
  admins: number;
  customers: number;
  new_today: number;
}

export interface DashboardProductStats {
  total: number;
  active: number;
  inactive: number;
  out_of_stock: number;
  low_stock: number;
}

export interface DashboardOrderStats {
  total: number;
  pending: number;
  paid: number;
  shipped: number;
  completed: number;
  cancelled: number;
  today: number;
  this_month: number;
}

export interface DashboardRevenueStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
}

export interface DashboardStatistics {
  users: DashboardUserStats;
  products: DashboardProductStats;
  orders: DashboardOrderStats;
  revenue: DashboardRevenueStats;
  recent_orders: any;
}

export interface SalesChartData {
  period: string;
  data: any;
}

