export enum UserRole {
  ADMIN = 'Admin',
  INSPECTOR = 'Inspector',
  SUPERVISOR = 'Supervisor',
  CLIENT = 'Client',
  END_USER = 'End User',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Not passed around post-auth
  role: UserRole;
}

export enum ParameterStatus {
  PENDING = 'Pending',
  PASS = 'Pass',
  FAIL = 'Fail',
}

export interface Evidence {
  data: string; // base64 data URL
  name: string;
  type: string; // mime type
}

export interface InspectionParameter {
  id: number;
  description: string;
  nominal: number;
  utl: number; // Upper Tolerance Limit - Now auto-calculated
  ltl: number; // Lower Tolerance Limit - Now auto-calculated
  toleranceType: '+/-' | '+' | '-';
  toleranceValue: number;
  actual?: number;
  deviation?: number;
  status: ParameterStatus;
  gdtSymbol?: string; // For GD&T
  gdtImage?: string; // base64 encoded image of the GDT symbol
  comment?: string;
  evidence?: Evidence[];
}

export interface ProductDetails {
    productName: string;
    partNumber: string;
    drawingNumber: string;
    revision: string;
    uom: string; // Unit of Measurement for the whole report
}

export type InspectionStatus = 'Accepted' | 'Rejected' | 'Rework' | 'Approved with Deviation';

export interface SignatureDetails {
  signed: boolean;
  comment: string;
  timestamp?: string;
}

export interface InspectionReport {
  id: string;
  title: string;
  productDetails: ProductDetails;
  parameters: InspectionParameter[];
  signatures: Record<UserRole, SignatureDetails>;
  evidence: Evidence[];
  isComplete: boolean;
  finalStatus?: InspectionStatus;
  scheduledById: string; // Inspector's User ID
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}
