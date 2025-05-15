import { Instructor } from './instructor.model';

export interface ClassSchedule {
  dayOfWeek: DayOfWeek;
  startTime: string; // Will be converted to/from LocalTime in backend
  endTime: string; // Will be converted to/from LocalTime in backend
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export enum ClassType {
  CARDIO = 'CARDIO',
  STRENGTH = 'STRENGTH',
  YOGA = 'YOGA',
  PILATES = 'PILATES',
  HIIT = 'HIIT',
  CYCLING = 'CYCLING',
  DANCE = 'DANCE',
  MARTIAL_ARTS = 'MARTIAL_ARTS',
  AQUATIC = 'AQUATIC',
  OTHER = 'OTHER'
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ALL_LEVELS = 'ALL_LEVELS'
}

export enum ClassStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  FULL = 'FULL',
  UPCOMING = 'UPCOMING'
}

export interface GymClass {
  id?: number;
  name: string;
  description: string;
  type: ClassType;
  difficultyLevel: DifficultyLevel;
  durationMinutes: number;
  capacity?: number;
  currentEnrollment?: number;
  instructor?: Instructor;
  schedules: ClassSchedule[];
  location?: string;
  imageUrl?: string;
  status: ClassStatus;
  equipment?: string;
  notes?: string;
}