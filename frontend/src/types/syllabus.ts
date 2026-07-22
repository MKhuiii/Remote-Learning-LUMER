export interface Syllabus {
  id: string;
  subjectId: string; 
  description: string;
  fileUrl?: string | null; 
  status_id: string; 
  createdAt?: string;
  updatedAt?: string;
}