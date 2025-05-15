import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Instructor, InstructorStatus } from '../../../classes/models/instructor.model';
import { InstructorService } from '../../../classes/services/instructor.service';

@Component({
  selector: 'app-add-instructor',
  templateUrl: './add-instructor.component.html',
  styleUrls: ['./add-instructor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddInstructorComponent implements OnInit, OnDestroy {
  instructorForm: FormGroup;
  
  // Status options
  statusOptions = [
    { value: InstructorStatus.ACTIVE, label: 'Active' },
    { value: InstructorStatus.INACTIVE, label: 'Inactive' },
    { value: InstructorStatus.ON_LEAVE, label: 'On Leave' }
  ];
  
  // Form state
  loading = false;
  submitting = false;
  error = '';
  success = false;
  
  // Validation state
  emailChecking = false;
  emailUnique = true;
  instructorIdChecking = false;
  instructorIdUnique = true;
  
  // Arrays for specialties and certifications
  specialties: string[] = [];
  certifications: string[] = [];
  newSpecialty = '';
  newCertification = '';
  
  // For cleanup
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private instructorService: InstructorService,
    private cdr: ChangeDetectorRef
  ) {
    this.instructorForm = this.fb.group({
      instructorId: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('\\(\\d{3}\\) \\d{3}-\\d{4}')]],
      status: [InstructorStatus.ACTIVE, Validators.required],
      hireDate: [''],
      photoUrl: [''],
      bio: ['', Validators.maxLength(1000)],
      schedule: [''],
      hourlyRate: [null, [Validators.min(0), Validators.max(1000)]],
      notes: ['', Validators.maxLength(500)]
    });
  }
  
  ngOnInit(): void {
    // Set up validation for unique email
    this.instructorForm.get('email')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(email => {
        if (email && this.instructorForm.get('email')?.valid) {
          this.checkEmailUniqueness(email);
        } else {
          this.emailUnique = true;
          this.cdr.markForCheck();
        }
      });
    
    // Set up validation for unique instructor ID
    this.instructorForm.get('instructorId')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(instructorId => {
        if (instructorId && this.instructorForm.get('instructorId')?.valid) {
          this.checkInstructorIdUniqueness(instructorId);
        } else {
          this.instructorIdUnique = true;
          this.cdr.markForCheck();
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  checkEmailUniqueness(email: string): void {
    this.emailChecking = true;
    this.cdr.markForCheck();
    
    this.instructorService.isEmailUnique(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isUnique: boolean) => {
          this.emailUnique = isUnique;
          this.emailChecking = false;
          this.cdr.markForCheck();
        },
        error: (err: Error) => {
          console.error('Error checking email uniqueness:', err);
          this.emailChecking = false;
          this.emailUnique = true; // Assume unique on error to not block submission
          this.cdr.markForCheck();
        }
      });
  }
  
  checkInstructorIdUniqueness(instructorId: string): void {
    this.instructorIdChecking = true;
    this.cdr.markForCheck();
    
    this.instructorService.isInstructorIdUnique(instructorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isUnique: boolean) => {
          this.instructorIdUnique = isUnique;
          this.instructorIdChecking = false;
          this.cdr.markForCheck();
        },
        error: (err: Error) => {
          console.error('Error checking instructor ID uniqueness:', err);
          this.instructorIdChecking = false;
          this.instructorIdUnique = true; // Assume unique on error to not block submission
          this.cdr.markForCheck();
        }
      });
  }
  
  onSpecialtyInput(event: Event): void {
    this.newSpecialty = (event.target as HTMLInputElement).value;
  }

  onCertificationInput(event: Event): void {
    this.newCertification = (event.target as HTMLInputElement).value;
  }
  
  addSpecialty(): void {
    if (this.newSpecialty.trim()) {
      this.specialties.push(this.newSpecialty.trim());
      this.newSpecialty = '';
      this.cdr.markForCheck();
    }
  }
  
  removeSpecialty(index: number): void {
    this.specialties.splice(index, 1);
    this.cdr.markForCheck();
  }
  
  addCertification(): void {
    if (this.newCertification.trim()) {
      this.certifications.push(this.newCertification.trim());
      this.newCertification = '';
      this.cdr.markForCheck();
    }
  }
  
  removeCertification(index: number): void {
    this.certifications.splice(index, 1);
    this.cdr.markForCheck();
  }
  
  onSubmit(): void {
    if (this.instructorForm.invalid || !this.emailUnique || !this.instructorIdUnique) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.instructorForm.controls).forEach(key => {
        this.instructorForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.submitting = true;
    this.error = '';
    
    // Create instructor object from form values
    const formValues = this.instructorForm.value;
    const instructor: Instructor = {
      ...formValues,
      specialties: this.specialties,
      certifications: this.certifications
    };
    
    this.instructorService.addInstructor(instructor)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.success = true;
          this.cdr.markForCheck();
          
          // Navigate back to instructors page after a short delay
          setTimeout(() => {
            this.router.navigate(['/instructors']);
          }, 1500);
        },
        error: (err: Error) => {
          console.error('Error creating instructor:', err);
          this.error = 'Failed to create instructor. Please try again.';
          this.submitting = false;
          this.cdr.markForCheck();
        }
      });
  }
  
  onCancel(): void {
    this.router.navigate(['/instructors']);
  }
  
  // Helper method to format phone number as (XXX) XXX-XXXX
  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 0) {
      // Format as (XXX) XXX-XXXX
      if (value.length <= 3) {
        value = `(${value}`;
      } else if (value.length <= 6) {
        value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
      } else {
        value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6, 10)}`;
      }
    }
    
    // Update the input value
    this.instructorForm.get('phone')?.setValue(value, { emitEvent: false });
  }
}
