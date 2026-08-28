export interface JobImportPayload {
  url: string;
}

export interface JobImportResponse {
  company: string;
  role: string;
  location: string;
  employmentType: string;
  experience: string;
  salary: string;
  skills: string[];
  description: string;
}
