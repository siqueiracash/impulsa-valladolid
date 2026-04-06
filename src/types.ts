export type BusinessType = 'restaurante' | 'bar' | 'padaria' | 'barbeiro' | 'cabeleireiro' | 'cafeteria' | 'gimnasio' | 'outro';

export interface AuditFormData {
  businessName: string;
  businessType: BusinessType;
  location: string;
  whatsapp: string;
  email: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  googleBusiness?: string;
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
