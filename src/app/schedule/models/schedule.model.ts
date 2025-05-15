import { GymClass } from '../../classes/models/gym-class.model';
import { Instructor } from '../../classes/models/instructor.model';

export enum ScheduleStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  FULL = 'FULL',
  UPCOMING = 'UPCOMING'
}

export interface Schedule {
  id?: number;
  gymClass: GymClass;
  instructor: Instructor;
  dayOfWeek: string; // DayOfWeek enum from Java as string
  startTime: string; // LocalTime as string
  endTime: string; // LocalTime as string
  startDate?: string; // LocalDate as string
  endDate?: string; // LocalDate as string
  capacity?: number;
  currentEnrollment?: number;
  location?: string;
  status?: ScheduleStatus;
  notes?: string;
}

export interface ScheduleClass {
  id: number;
  title: string;
  instructor: string;
  instructorId: number;
  category: string;
  startTime: string;
  endTime: string;
  day: number; // 0-6 for Sunday-Saturday
  dayOfWeek: string;
  capacity: number;
  currentAttendees: number;
  location?: string;
  status: ScheduleStatus;
  classId: number;
}
