export interface HealthStatus {
  status: string;
  service: string;
  version: string;
}

export interface NavItem {
  name: string;
  href: string;
  iconName: string;
  badge?: string;
}