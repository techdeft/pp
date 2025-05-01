export type IDType =
  | "National ID"
  | "Driver's License"
  | "Passport"
  | "Other"
  | "Integration";

export interface UserData {
  name: string;
  haskyc: boolean;
}

export interface KYCFormData {
  name: string;
  idType: IDType;
  idNumber: string;
  selfieImage: string | null;
  idImage: string | null;
  voiceRecording: string | null;
}

export interface PageParams {
  token: string;
  id: string;
}
