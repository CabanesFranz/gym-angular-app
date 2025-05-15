import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';
import { GymClassService } from '../../services/gym-class.service';
import { InstructorService } from '../../services/instructor.service';
import { GymClass, ClassType, DifficultyLevel, ClassStatus, DayOfWeek } from '../../models/gym-class.model';
import { Instructor, InstructorStatus } from '../../models/instructor.model';

@Component({
  selector: 'app-edit-class',
  templateUrl: './edit-class.component.html',
  styleUrls: ['./edit-class.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // For better performance
})
export class EditClassComponent implements OnInit, OnDestroy {
  classForm!: FormGroup;
  classId!: number;
  isNewClass = false;
  loading = true;
  saving = false;
  error = false;
  errorMessage = '';
  
  // Enums for template
  classTypes = Object.values(ClassType);
  difficultyLevels = Object.values(DifficultyLevel);
  classStatuses = Object.values(ClassStatus);
  daysOfWeek = Object.values(DayOfWeek);
  
  // Instructors for dropdown
  instructors: Instructor[] = [];
  loadingInstructors = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private gymClassService: GymClassService,
    private instructorService: InstructorService,
    private cdr: ChangeDetectorRef
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadInstructors();
    
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.classId = +params['id'];
        this.isNewClass = false;
        this.loadClass(this.classId);
      } else {
        this.isNewClass = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private createForm(): void {
    this.classForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      type: [ClassType.CARDIO, Validators.required],
      difficultyLevel: [DifficultyLevel.ALL_LEVELS, Validators.required],
      durationMinutes: [60, [Validators.required, Validators.min(5), Validators.max(240)]],
      capacity: [null, [Validators.min(1), Validators.max(100)]],
      currentEnrollment: [0, [Validators.min(0)]],
      instructorId: [null],
      schedules: this.fb.array([]),
      location: [''],
      imageUrl: [''],
      status: [ClassStatus.UPCOMING, Validators.required],
      equipment: [''],
      notes: ['', Validators.maxLength(500)]
    });
  }
  
  private loadClass(id: number): void {
    this.loading = true;
    this.error = false;
    
    this.gymClassService.getClassById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (gymClass) => {
          this.updateForm(gymClass);
        },
        error: (err) => {
          console.error('Error loading class:', err);
          this.error = true;
          this.errorMessage = 'Failed to load class details. Please try again.';
        }
      });
  }
  
  private loadInstructors(): void {
    this.loadingInstructors = true;
    
    // Use getAllInstructors instead since we haven't implemented filtering by status yet
    this.instructorService.getAllInstructors()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingInstructors = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (instructors) => {
          this.instructors = instructors;
        },
        error: (err) => {
          console.error('Error loading instructors:', err);
        }
      });
  }
  
  private updateForm(gymClass: GymClass): void {
    // Clear existing schedules
    while (this.schedules.length) {
      this.schedules.removeAt(0);
    }
    
    // Add each schedule
    if (gymClass.schedules && gymClass.schedules.length > 0) {
      gymClass.schedules.forEach(schedule => {
        this.addSchedule(schedule.dayOfWeek, schedule.startTime, schedule.endTime);
      });
    }
    
    // Update form values
    this.classForm.patchValue({
      name: gymClass.name,
      description: gymClass.description,
      type: gymClass.type,
      difficultyLevel: gymClass.difficultyLevel,
      durationMinutes: gymClass.durationMinutes,
      capacity: gymClass.capacity,
      currentEnrollment: gymClass.currentEnrollment,
      instructorId: gymClass.instructor?.id,
      location: gymClass.location,
      imageUrl: gymClass.imageUrl,
      status: gymClass.status,
      equipment: gymClass.equipment,
      notes: gymClass.notes
    });
  }
  
  get schedules(): FormArray {
    return this.classForm.get('schedules') as FormArray;
  }
  
  addSchedule(dayOfWeek: DayOfWeek | null = null, startTime: string = '', endTime: string = ''): void {
    this.schedules.push(this.fb.group({
      dayOfWeek: [dayOfWeek, Validators.required],
      startTime: [startTime, Validators.required],
      endTime: [endTime, Validators.required]
    }));
    this.cdr.markForCheck();
  }
  
  removeSchedule(index: number): void {
    this.schedules.removeAt(index);
    this.cdr.markForCheck();
  }
  
  onSubmit(): void {
    if (this.classForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.classForm.controls).forEach(key => {
        const control = this.classForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.saving = true;
    this.error = false;
    
    const formValue = this.classForm.value;
    const gymClass: GymClass = {
      id: this.isNewClass ? undefined : this.classId,
      name: formValue.name,
      description: formValue.description,
      type: formValue.type,
      difficultyLevel: formValue.difficultyLevel,
      durationMinutes: formValue.durationMinutes,
      capacity: formValue.capacity,
      currentEnrollment: formValue.currentEnrollment,
      instructor: formValue.instructorId ? { id: formValue.instructorId } as Instructor : undefined,
      schedules: formValue.schedules,
      location: formValue.location,
      imageUrl: formValue.imageUrl,
      status: formValue.status,
      equipment: formValue.equipment,
      notes: formValue.notes
    };
    
    const request = this.isNewClass 
      ? this.gymClassService.addClass(gymClass)
      : this.gymClassService.updateClass(gymClass);
    
    request
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/classes']);
        },
        error: (err) => {
          console.error('Error saving class:', err);
          this.error = true;
          this.errorMessage = 'Failed to save class. Please try again.';
        }
      });
  }
  
  cancel(): void {
    this.router.navigate(['/classes']);
  }
}