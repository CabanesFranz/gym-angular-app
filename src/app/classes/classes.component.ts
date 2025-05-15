import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

interface GymClass {
  id: number;
  title: string;
  category: string;
  instructor: string;
  duration: number;
  capacity: number;
  schedule: { day: string; time: string }[];
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit {
  // Filter dropdown state
  showFilterDropdown = false;
  
  // Filter states
  selectedCategory = 'all';
  showActiveClasses = true;
  showInactiveClasses = false;
  sortBy = 'title';
  
  // Highlighted class from schedule
  highlightedClassId: number | null = null;
  
  // Full class data
  allClasses: GymClass[] = [
    {
      id: 1,
      title: 'Advanced Weightlifting',
      category: 'strength',
      instructor: 'David Kim',
      duration: 60,
      capacity: 15,
      schedule: [
        { day: 'Mon', time: '6:00 PM' },
        { day: 'Wed', time: '6:00 PM' },
        { day: 'Fri', time: '6:00 PM' }
      ],
      status: 'active'
    },
    {
      id: 2,
      title: 'Spin Class',
      category: 'cardio',
      instructor: 'Emma Roberts',
      duration: 45,
      capacity: 20,
      schedule: [
        { day: 'Tue', time: '5:30 PM' },
        { day: 'Thu', time: '5:30 PM' }
      ],
      status: 'active'
    },
    {
      id: 3,
      title: 'Morning Yoga',
      category: 'yoga',
      instructor: 'Sarah Johnson',
      duration: 60,
      capacity: 12,
      schedule: [
        { day: 'Mon', time: '8:00 AM' },
        { day: 'Wed', time: '8:00 AM' },
        { day: 'Fri', time: '8:00 AM' }
      ],
      status: 'active'
    },
    {
      id: 4,
      title: 'HIIT Training',
      category: 'hiit',
      instructor: 'Mike Peterson',
      duration: 30,
      capacity: 15,
      schedule: [
        { day: 'Tue', time: '7:00 PM' },
        { day: 'Thu', time: '7:00 PM' }
      ],
      status: 'active'
    },
    {
      id: 5,
      title: 'Core Pilates',
      category: 'pilates',
      instructor: 'Lisa Chen',
      duration: 45,
      capacity: 10,
      schedule: [
        { day: 'Wed', time: '6:30 PM' }
      ],
      status: 'active'
    },
    {
      id: 6,
      title: 'Beginner Strength',
      category: 'strength',
      instructor: 'James Wilson',
      duration: 45,
      capacity: 12,
      schedule: [
        { day: 'Mon', time: '10:00 AM' },
        { day: 'Thu', time: '10:00 AM' }
      ],
      status: 'inactive'
    }
  ];
  
  // Filtered classes that are displayed
  filteredClasses: GymClass[] = [];
  
  // Category counts
  categoryCounts = {
    all: 0,
    strength: 0,
    cardio: 0,
    yoga: 0,
    hiit: 0,
    pilates: 0
  };
  
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.calculateCategoryCounts();
  }
  
  ngOnInit(): void {
    // Check for query parameters from the schedule page
    this.route.queryParams.subscribe(params => {
      if (params['highlight']) {
        this.highlightedClassId = +params['highlight'];
      }
      
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      
      this.applyFilters();
      
      // Scroll to the highlighted class after a short delay to allow rendering
      if (this.highlightedClassId) {
        setTimeout(() => {
          this.scrollToHighlightedClass();
        }, 100);
      }
    });
  }
  
  /**
   * Scroll to the highlighted class
   */
  scrollToHighlightedClass(): void {
    if (this.highlightedClassId) {
      const element = document.getElementById(`class-${this.highlightedClassId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
  
  /**
   * Calculate the number of classes in each category
   */
  calculateCategoryCounts(): void {
    // Reset counts
    Object.keys(this.categoryCounts).forEach(key => {
      this.categoryCounts[key as keyof typeof this.categoryCounts] = 0;
    });
    
    // Count all classes
    this.categoryCounts.all = this.allClasses.length;
    
    // Count by category
    this.allClasses.forEach(gymClass => {
      if (this.categoryCounts.hasOwnProperty(gymClass.category)) {
        this.categoryCounts[gymClass.category as keyof typeof this.categoryCounts]++;
      }
    });
  }
  
  /**
   * Toggle the filter dropdown visibility
   */
  toggleFilterDropdown(): void {
    this.showFilterDropdown = !this.showFilterDropdown;
  }
  
  /**
   * Close the filter dropdown when clicking outside
   */
  closeFilterDropdown(): void {
    this.showFilterDropdown = false;
  }
  
  /**
   * Filter classes by category
   * @param category The category to filter by
   */
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
    
    // Update URL query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category },
      queryParamsHandling: 'merge'
    });
  }
  
  /**
   * Toggle active classes filter
   */
  toggleActiveClasses(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.showActiveClasses = checkbox.checked;
    this.applyFilters();
  }
  
  /**
   * Toggle inactive classes filter
   */
  toggleInactiveClasses(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.showInactiveClasses = checkbox.checked;
    this.applyFilters();
  }
  
  /**
   * Change sort order
   */
  changeSortOrder(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortBy = select.value;
    this.applyFilters();
  }
  
  /**
   * Apply all filters and sorting
   */
  applyFilters(): void {
    // First filter by category
    let result = this.allClasses;
    
    if (this.selectedCategory !== 'all') {
      result = result.filter(gymClass => gymClass.category === this.selectedCategory);
    }
    
    // Then filter by status
    result = result.filter(gymClass => {
      if (gymClass.status === 'active' && this.showActiveClasses) return true;
      if (gymClass.status === 'inactive' && this.showInactiveClasses) return true;
      return false;
    });
    
    // Finally sort
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'instructor':
          return a.instructor.localeCompare(b.instructor);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'capacity':
          return b.capacity - a.capacity;
        default:
          return 0;
      }
    });
    
    this.filteredClasses = result;
  }
  
  /**
   * Reset all filters to default
   */
  resetFilters(): void {
    this.selectedCategory = 'all';
    this.showActiveClasses = true;
    this.showInactiveClasses = false;
    this.sortBy = 'title';
    this.applyFilters();
    this.closeFilterDropdown();
    
    // Clear highlight and update URL
    this.highlightedClassId = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { highlight: null, category: 'all' }
    });
  }
  
  /**
   * Check if a class is highlighted
   */
  isHighlighted(classId: number): boolean {
    return this.highlightedClassId === classId;
  }
  
  /**
   * Navigate to the class details page
   * @param classId The ID of the class to view
   */
  viewClassDetails(classId: number): void {
    console.log(`Viewing details for class ID: ${classId}`);
    // In a real app, this would navigate to a details page
    // this.router.navigate(['/classes', classId]);
    
    // For now, just show an alert
    alert(`Viewing details for class ID: ${classId}`);
  }
}
