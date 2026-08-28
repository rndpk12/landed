export interface ResumeVersion {
  id: string;
  version: number;
  filename: string;
  contentType: string;
  fileSize: number;
  sha256: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  name: string;
  tags: string[];
  version: string;
  roleTag: string;
  uploadDate: string;
  applications: number;
  interviews: number;
  conversionRate: number;
  versions: ResumeVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumeUploadPayload {
  name: string;
  version: string;
  roleTag: string;
  file: FileList;
}

export interface ResumeVersionUploadPayload {
  resumeId: string;
  file: File;
}
