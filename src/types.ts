export type ProcurementType = 'AOR' | 'RS' | 'ER';

export interface ProcurementProject {
  id: string;
  title: string;
  type: ProcurementType;
  status: 'Drafting' | 'Review' | 'Approved';
  lastModified: string;
  content: string;
  complianceScore?: number;
  complianceIssues?: ComplianceIssue[];
}

export interface ComplianceIssue {
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
}
