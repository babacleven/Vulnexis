export interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  phone?: string;
  credits: number;
  free_scans: number;
  is_admin: boolean;
  created_at: string;
}

export interface DBTarget {
  id: string;
  userId: string;
  url: string;
  name: string;
  target_type: 'web' | 'api' | 'graphql';
  authorized: boolean;
  authorized_at?: string;
  scans_count: number;
  last_score?: number;
  last_scan_at?: string;
  created_at: string;
}

export interface DBFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  cvss?: number;
  description: string;
  impact?: string;
  remediation: string;
  proof?: string;
  component?: string;
  url?: string;
}

export interface DBScan {
  id: string;
  userId: string;
  target_id: string;
  target_url: string;
  profile: 'fast' | 'standard' | 'deep';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'awaiting_approval';
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
  findings: DBFinding[];
  log_lines: string[];
  subdomains: string[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
}

export interface DBTransaction {
  id: number;
  userId: string;
  delta: number;
  kind: 'free_scan' | 'credit' | 'purchase' | 'promo';
  reason: 'grant' | 'scan_debit' | 'purchase' | 'redeem' | 'refund';
  scan_id: string | null;
  note: string | null;
  created_time: string;
}

export interface DBNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface DBReferralRequest {
  id: string;
  userId: string;
  promoCode: string;
  fullName: string;
  operator: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
