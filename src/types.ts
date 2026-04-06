export type BusinessType = 'restaurante' | 'bar' | 'panaderia' | 'barberia' | 'peluqueria' | 'cafeteria' | 'gimnasio' | 'otro';

export interface AuditFormData {
  businessName: string;
  businessType: BusinessType;
  location: string;
  whatsapp: string;
  email: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
  otherPlatforms?: string;
}

export interface AuditReport {
  strengths: string[];
  problems: string[];
  socialMediaAnalysis: string;
  priorityActions: string[];
  serviceProposal: string;
  storytelling: string;
  technicalAnalysis?: string;
  sources?: { title: string; uri: string }[];
}
