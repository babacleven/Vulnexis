export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ScanProfile = 'fast' | 'standard' | 'deep';

export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed' | 'awaiting_approval' | 'awaiting_scope';

export interface UserSession {
  id: string;
  email: string;
  phone?: string;
  is_admin: boolean;
  credits: number;
  free_scans: number;
  created_at: string;
  referral_code?: string;
}

export interface PricingConfig {
  fast: number;
  standard: number;
  deep: number;
  free_profiles: string[];
}

export interface CreditsMeResponse {
  credits: number;
  free_scans: number;
  next_expiry: string | null;
  is_admin: boolean;
  pricing: PricingConfig;
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  cvss?: number;
  description: string;
  impact?: string;
  remediation: string;
  proof?: string;
  component?: string;
  url?: string;
}

export interface ScanTarget {
  id: string;
  name?: string;
  url: string;
  target_type: 'web' | 'api' | 'graphql';
  authorized: boolean;
  authorized_at?: string;
  scans_count: number;
  last_score?: number;
  last_scan_at?: string;
  created_at: string;
}

export interface Scan {
  id: string;
  target_id: string;
  target_url: string;
  profile: ScanProfile;
  status: ScanStatus;
  progress: number;
  phase: string;
  score: number;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  findings: Finding[];
  log_lines?: string[];
  subdomains?: string[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface TransactionItem {
  id: number;
  delta: number;
  kind: 'free_scan' | 'credit' | 'purchase' | 'promo';
  reason: 'grant' | 'scan_debit' | 'purchase' | 'redeem' | 'refund';
  scan_id: string | null;
  note: string | null;
  created_time: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
  links: {
    first: string;
    last: string | null;
    self: string;
    next: string | null;
    prev: string | null;
  };
}

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}
