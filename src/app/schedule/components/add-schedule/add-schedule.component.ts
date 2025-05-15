import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GymClassService } from '../../../classes/services/gym-class.service';
import { InstructorService } from '../../../classes/services/instructor.service';
import { GymClass } from '../../../classes/models/gym-class.model';
import { Instructor } from '../../../classes/models/instructor.model';
import { Schedule, ScheduleStatus } from '../../models/schedule.model';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: 'app-add-schedule',
  templateUrl: './add-schedule.component.html',
  styleUrls: ['./add-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddScheduleComponent implements OnInit, OnDestroy {
  scheduleForm: FormGroup;
  
  // Data
  classes: GymClass[] = [];
  instructors: Instructor[] = [];
  
  // Form state
  loading = false;
  submitting = false;
  error = '';
  success = false;
  
  // Days of week
  daysOfWeek = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' }
  ];
  
  // Status options
  statusOptions = [
    { value: ScheduleStatus.ACTIVE, label: 'Active' },
    { value: ScheduleStatus.UPCOMING, label: 'Upcoming' },
    { value: ScheduleStatus.CANCELLED, label: 'Cancelled' },
    { value: ScheduleStatus.FULL, label: 'Full' }
  ];
  
  // For cleanup
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private scheduleService: ScheduleService,
    private gymClassService: GymClassService,
    private instructorService: InstructorService,
    private cdr: ChangeDetectorRef
  ) {
    this.scheduleForm = this.fb.group({
      gymClass: [null, Validators.required],
      instructor: [null, Validators.required],
      dayOfWeek: ['MONDAY', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      capacity: [null],
      currentEnrollment: [0],
      location: [''],
      status: [ScheduleStatus.ACTIVE],
      notes: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadClasses();
    this.loadInstructors();
    this.handleQueryParams();
  }
  
  /**
   * Handle query parameters to pre-fill the form
   */
  private handleQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['dayOfWeek']) {
          this.scheduleForm.patchValue({
            dayOfWeek: params['dayOfWeek']
          });
        }
        
        if (params['date']) {
          // Set the start date to the selected date
          this.scheduleForm.patchValue({
            startDate: params['date']
          });
        }
        
        this.cdr.markForCheck();
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadClasses(): void {
    this.loading = true;
    this.gymClassService.getAllClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes) => {
          this.classes = classes;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading classes:', err);
          this.error = 'Failed to load classes. Please try again.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }
  
  loadInstructors(): void {
    this.loading = true;
    this.instructorService.getAllInstructors()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (instructors) => {
          this.instructors = instructors;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading instructors:', err);
          this.error = 'Failed to load instructors. Please try again.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }
  
  onClassChange(classId: number): void {
    const selectedClass = this.classes.find(c => c.id === classId);
    if (selectedClass) {
      // Auto-fill capacity and location from the class if available
      this.scheduleForm.patchValue({
        capacity: selectedClass.capacity || null,
        location: selectedClass.location || ''
      });
    }
  }
  
  onSubmit(): void {
    if (this.scheduleForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.scheduleForm.controls).forEach(key => {
        this.scheduleForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.submitting = true;
    this.error = '';
    
    // Format time values for the API (convert from HH:MM format to HH:MM:00)
    const formValues = this.scheduleForm.value;
    const schedule: Schedule = {
      ...formValues,
      startTime: this.formatTimeForApi(formValues.startTime),
      endTime: this.formatTimeForApi(formValues.endTime)
    };
    
    this.scheduleService.createSchedule(schedule)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.success = true;
          this.cdr.markForCheck();
          
          // Navigate back to schedule page after a short delay
          setTimeout(() => {
            this.router.navigate(['/schedule']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error creating schedule:', err);
          this.error = 'Failed to create schedule. Please try again.';
          this.submitting = false;
          this.cdr.markForCheck();
        }
      });
  }
  
  onCancel(): void {
    this.router.navigate(['/schedule']);
  }
  
  private formatTimeForApi(time: string): string {
    // If time is already in HH:MM:SS format, return as is
    if (time.includes(':') && time.split(':').length > 2) {
      return time;
    }
    
    // Otherwise, add seconds
    return time + ':00';
  }
}
