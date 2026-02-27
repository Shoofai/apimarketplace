/**
 * Types for the Adaptive Deployment Auditor.
 * Snapshot describes the codebase; checks are generated from it and produce a report.
 */

export interface CodeSnapshot {
  timestamp: string;
  git: {
    branch: string;
    commit: string;
    uncommitted: boolean;
  };
  architecture: {
    framework: string;
    version: string;
    router: 'app' | 'pages';
    packageManager: string;
    nodeVersion: string;
  };
  services: {
    database?: DatabaseInfo;
    auth?: AuthInfo;
    payments?: PaymentInfo;
    storage?: StorageInfo;
    email?: EmailInfo;
    analytics?: AnalyticsInfo;
  };
  patterns: {
    apiRoutes: string[];
    serverComponents: string[];
    clientComponents: string[];
    middleware: string[];
    cron: string[];
  };
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
    outdated: string[];
    vulnerable: string[];
  };
  environment: {
    required: string[];
    optional: string[];
    missing: string[];
    exposed: string[];
  };
  customLogic: {
    authFlows: string[];
    paymentFlows: string[];
    dataModels: string[];
    businessRules: string[];
  };
  risks: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
  changes?: {
    filesChanged: number;
    linesChanged: number;
    newDependencies: string[];
    removedDependencies: string[];
    newPatterns: string[];
    changedPatterns: string[];
  };
}

export interface DatabaseInfo {
  type: 'supabase' | 'prisma';
  version?: string;
  tables?: string[];
  hasRLS?: boolean;
  hasGeneratedTypes?: boolean;
  schema?: boolean;
  projectId?: string;
}

export interface AuthInfo {
  type: 'supabase-auth' | 'next-auth';
  flows?: string[];
  providers?: string[];
}

export interface PaymentInfo {
  type: 'stripe';
  version?: string;
  webhooks?: string[];
  products?: string[];
}

export interface StorageInfo {
  type: string;
  buckets?: string[];
}

export interface EmailInfo {
  type: string;
  version?: string;
}

export interface AnalyticsInfo {
  type: string;
  version?: string;
}

export interface CheckResult {
  passed: boolean;
  message?: string;
  detail?: string;
}

export interface CheckDefinition {
  id: string;
  category: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  validator: () => Promise<CheckResult>;
  fixPromptTemplate: string;
  enabled: boolean;
  reason?: string;
}

export interface CheckResultWithMeta extends CheckResult {
  id: string;
  category: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fixPromptTemplate?: string;
}

export interface DiagnosticReport {
  timestamp: string;
  snapshot: CodeSnapshot;
  results: CheckResultWithMeta[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: number;
    total: number;
  };
}
