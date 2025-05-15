import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';
import { GymClassService } from '../../services/gym-class.service';
import { InstructorService } from '../../services/instructor.service';
import { GymClass, ClassType, DifficultyLevel, ClassStatus, ClassSchedule } from '../../models/gym-class.model';
import { Instructor } from '../../models/instructor.model';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // For better performance
})
export class ClassesComponent implements OnInit, OnDestroy {
  classes: GymClass[] = [];
  filteredClasses: GymClass[] = [];
  loading = true;
  error = false;
  
  // Filter controls
  searchControl = new FormControl('');
  typeFilter = new FormControl('');
  difficultyFilter = new FormControl('');
  statusFilter = new FormControl('');
  
  // Enums for template
  classTypes = Object.values(ClassType);
  difficultyLevels = Object.values(DifficultyLevel);
  classStatuses = Object.values(ClassStatus);
  
  // Modal controls
  showDetailsModal = false;
  selectedClass: GymClass | null = null;
  selectedInstructor: Instructor | null = null;
  loadingInstructorDetails = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private gymClassService: GymClassService,
    private instructorService: InstructorService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClasses();
    this.setupSearchFilter();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadClasses(): void {
    this.loading = true;
    this.error = false;
    console.log("triggered loadClasses");
    this.gymClassService.getAllClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes) => {
          this.classes = classes;
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading classes:', err);
          this.error = true;
          this.loading = false;
        }
      });
  }
  
  private setupSearchFilter(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Debounce to reduce API calls
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyFilters());
      
    this.typeFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
      
    this.difficultyFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
      
    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }
  
  private applyFilters(): void {
    let filtered = [...this.classes];
    
    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm) || 
        c.description.toLowerCase().includes(searchTerm) ||
        (c.location && c.location.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply type filter
    const typeFilter = this.typeFilter.value;
    if (typeFilter) {
      filtered = filtered.filter(c => c.type === typeFilter);
    }
    
    // Apply difficulty filter
    const difficultyFilter = this.difficultyFilter.value;
    if (difficultyFilter) {
      filtered = filtered.filter(c => c.difficultyLevel === difficultyFilter);
    }
    
    // Apply status filter
    const statusFilter = this.statusFilter.value;
    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    this.filteredClasses = filtered;
  }
  
  addClass(): void {
    this.router.navigate(['add'], { relativeTo: this.route });
  }
  
  editClass(id: number): void {
    this.router.navigate(['/classes/edit', id]);
  }
  
  deleteClass(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent opening the details modal
    }
    
    if (confirm('Are you sure you want to delete this class?')) {
      this.gymClassService.deleteClass(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadClasses();
          },
          error: (err) => {
            console.error('Error deleting class:', err);
          }
        });
    }
  }
  
  refreshClasses(): void {
    this.loadClasses();
  }
  
  // Modal methods
  openClassDetails(gymClass: GymClass): void {
    this.selectedClass = gymClass;
    this.showDetailsModal = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    
    // Load instructor details if available
    if (gymClass.instructor && gymClass.instructor.id) {
      this.loadingInstructorDetails = true;
      this.instructorService.getInstructorById(gymClass.instructor.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (instructor) => {
            this.selectedInstructor = instructor;
            this.loadingInstructorDetails = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error loading instructor details:', err);
            this.loadingInstructorDetails = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      this.selectedInstructor = null;
    }
    
    this.cdr.markForCheck();
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedClass = null;
    this.selectedInstructor = null;
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    this.cdr.markForCheck();
  }
  
  preventClose(event: Event): void {
    event.stopPropagation();
  }
  
  formatTime(time: string): string {
    if (!time) return '';
    
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  }
  
  getScheduleDisplay(schedule: ClassSchedule): string {
    if (!schedule) return '';
    return `${schedule.dayOfWeek}: ${this.formatTime(schedule.startTime)} - ${this.formatTime(schedule.endTime)}`;
  }
}
