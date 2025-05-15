import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Instructor, InstructorStatus } from '../classes/models/instructor.model';
import { InstructorService } from '../classes/services/instructor.service';

@Component({
  selector: 'app-instructors',
  templateUrl: './instructors.component.html',
  styleUrls: ['./instructors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstructorsComponent implements OnInit, OnDestroy {
  // Instructors data
  instructors: Instructor[] = [];
  filteredInstructors: Instructor[] = [];
  
  // UI state
  loading = true;
  error = '';
  searchTerm = '';
  selectedStatus: string = 'all';
  
  // Status filter options
  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: InstructorStatus.ACTIVE, label: 'Active' },
    { value: InstructorStatus.INACTIVE, label: 'Inactive' },
    { value: InstructorStatus.ON_LEAVE, label: 'On Leave' }
  ];
  
  // For cleanup
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  constructor(
    private instructorService: InstructorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.loadInstructors();
    
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadInstructors(): void {
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();
    
    this.instructorService.getAllInstructors()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (instructors) => {
          this.instructors = instructors;
          this.applyFilters();
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
  
  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }
  
  onStatusChange(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
  
  applyFilters(): void {
    let filtered = [...this.instructors];
    
    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(instructor => 
        instructor.status === this.selectedStatus
      );
    }
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(instructor => 
        instructor.name.toLowerCase().includes(term) ||
        instructor.instructorId.toLowerCase().includes(term) ||
        instructor.email.toLowerCase().includes(term) ||
        (instructor.specialties && instructor.specialties.some(s => s.toLowerCase().includes(term)))
      );
    }
    
    this.filteredInstructors = filtered;
    this.cdr.markForCheck();
  }
  
  navigateToAddInstructor(): void {
    this.router.navigate(['/instructors/add']);
  }
  
  viewInstructorDetails(id: number): void {
    // This will be implemented in a future feature
    console.log(`View instructor details for ID: ${id}`);
  }
  
  editInstructor(id: number): void {
    // This will be implemented in a future feature
    console.log(`Edit instructor with ID: ${id}`);
  }
  
  deleteInstructor(id: number, event: Event): void {
    event.stopPropagation(); // Prevent row click event
    
    if (confirm('Are you sure you want to delete this instructor?')) {
      this.instructorService.deleteInstructor(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Instructor was deleted, refresh the list
            this.loadInstructors();
          },
          error: (err) => {
            console.error('Error deleting instructor:', err);
            this.error = 'Failed to delete instructor. Please try again.';
            this.cdr.markForCheck();
          }
        });
    }
  }
  
  // Helper method to get status badge class
  getStatusBadgeClass(status: InstructorStatus): string {
    switch (status) {
      case InstructorStatus.ACTIVE:
        return 'badge-success';
      case InstructorStatus.INACTIVE:
        return 'badge-danger';
      case InstructorStatus.ON_LEAVE:
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }
  
  // Helper method to format specialties for display
  formatSpecialties(specialties?: string[]): string {
    if (!specialties || specialties.length === 0) {
      return 'None';
    }
    
    return specialties.join(', ');
  }
}
