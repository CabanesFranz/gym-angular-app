export enum InstructorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE'
}

export interface Instructor {
  id?: number;
  instructorId: string;
  name: string;
  email: string;
  phone: string;
  status: InstructorStatus;
  hireDate?: string; // Will be converted to/from LocalDate in backend
  photoUrl?: string;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  schedule?: string;
  hourlyRate?: number;
  notes?: string;
}