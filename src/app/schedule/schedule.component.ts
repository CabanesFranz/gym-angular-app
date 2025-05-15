import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, timeout } from 'rxjs/operators';
import { ScheduleService } from './services/schedule.service';
import { ScheduleClass, ScheduleStatus } from './models/schedule.model';

interface WeekDay {
  name: string;
  date: string;
  fullDate: Date;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleComponent implements OnInit, OnDestroy {
  // View state
  currentView: 'week' | 'day' = 'week';
  
  // Date state
  today = new Date();
  currentWeekStart: Date = new Date();
  selectedDay: WeekDay = { name: '', date: '', fullDate: new Date() };
  
  // Week days
  weekDays: WeekDay[] = [];
  
  // Time slots
  timeSlots: string[] = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', 
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];
  
  // Schedule data from API
  scheduleClasses: ScheduleClass[] = [];
  
  // For cleanup
  private destroy$ = new Subject<void>();
  
  // Loading state
  loading = false;
  error = false;
  
  constructor(
    private router: Router,
    private scheduleService: ScheduleService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.initializeWeek();
    this.loadScheduleData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Initialize the current week view
   */
  initializeWeek(): void {
    // Set the current week to start on Sunday
    this.currentWeekStart = this.getStartOfWeek(this.today);
    this.generateWeekDays();
    
    // Set the selected day to today
    const todayIndex = this.today.getDay();
    this.selectedDay = this.weekDays[todayIndex];
  }
  
  /**
   * Generate the week days array based on the current week start
   */
  generateWeekDays(): void {
    this.weekDays = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);
      
      this.weekDays.push({
        name: dayNames[i],
        date: date.getDate().toString(),
        fullDate: date
      });
    }
  }
  
  /**
   * Get the start of the week (Sunday) for a given date
   */
  getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    return result;
  }
  
  /**
   * Navigate to the previous week
   */
  previousWeek(): void {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    this.currentWeekStart = newStart;
    this.generateWeekDays();
    this.loadScheduleData();
  }
  
  /**
   * Navigate to the next week
   */
  nextWeek(): void {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    this.currentWeekStart = newStart;
    this.generateWeekDays();
    this.loadScheduleData();
  }
  
  /**
   * Go to the current week
   */
  goToToday(): void {
    this.currentWeekStart = this.getStartOfWeek(this.today);
    this.generateWeekDays();
    
    // Set view to week and selected day to today
    this.currentView = 'week';
    const todayIndex = this.today.getDay();
    this.selectedDay = this.weekDays[todayIndex];
    
    // Reload schedule data
    this.loadScheduleData();
  }
  
  /**
   * Set the current view (week or day)
   */
  setView(view: 'week' | 'day'): void {
    this.currentView = view;
    this.cdr.markForCheck();
  }
  
  /**
   * Check if a day is today
   */
  isToday(dayIndex: number): boolean {
    const day = this.weekDays[dayIndex];
    return this.isSameDay(day.fullDate, this.today);
  }
  
  /**
   * Check if two dates are the same day
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  /**
   * Get classes for a specific day and time
   */
  getClassesForDayAndTime(dayIndex: number, timeIndex: number): ScheduleClass[] {
    const day = (dayIndex + 0) % 7; // Adjust if week starts on Monday
    const timeSlot = this.timeSlots[timeIndex];
    
    return this.scheduleClasses.filter(cls => {
      return cls.day === day && cls.startTime === timeSlot;
    });
  }
  
  /**
   * Get classes for the selected day
   */
  getClassesForSelectedDay(timeIndex: number): ScheduleClass[] {
    const day = this.selectedDay.fullDate.getDay();
    const timeSlot = this.timeSlots[timeIndex];
    
    return this.scheduleClasses.filter(cls => {
      return cls.day === day && cls.startTime === timeSlot;
    });
  }
  
  /**
   * Calculate the height of a class based on its duration
   */
  calculateClassHeight(cls: ScheduleClass): number {
    // Calculate duration in hours
    const startParts = cls.startTime.match(/(\d+):(\d+) ([AP]M)/);
    const endParts = cls.endTime.match(/(\d+):(\d+) ([AP]M)/);
    
    if (!startParts || !endParts) return 60; // Default to 1 hour
    
    let startHour = parseInt(startParts[1]);
    const startMinute = parseInt(startParts[2]);
    const startPeriod = startParts[3];
    
    let endHour = parseInt(endParts[1]);
    const endMinute = parseInt(endParts[2]);
    const endPeriod = endParts[3];
    
    // Convert to 24-hour format
    if (startPeriod === 'PM' && startHour < 12) startHour += 12;
    if (startPeriod === 'AM' && startHour === 12) startHour = 0;
    if (endPeriod === 'PM' && endHour < 12) endHour += 12;
    if (endPeriod === 'AM' && endHour === 12) endHour = 0;
    
    // Calculate total minutes
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    // Convert to pixels (60px per hour)
    return (durationMinutes / 60) * 60;
  }
  
  /**
   * Calculate the position of a class based on its start time
   */
  calculateClassPosition(cls: ScheduleClass): number {
    // Get the start time in minutes past the hour
    const startParts = cls.startTime.match(/(\d+):(\d+) ([AP]M)/);
    
    if (!startParts) return 0;
    
    const startMinute = parseInt(startParts[2]);
    
    // Convert to pixels (60px per hour)
    return (startMinute / 60) * 60;
  }
  
  /**
   * Get the current week display string
   */
  get currentWeekDisplay(): string {
    const start = this.weekDays[0].date;
    const end = this.weekDays[6].date;
    return `${start} - ${end}`;
  }
  
  /**
   * Get the current month and year display
   */
  get currentMonthYear(): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return this.currentWeekStart.toLocaleDateString('en-US', options);
  }
  
  /**
   * Get the selected day display string
   */
  get selectedDayDisplay(): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return this.selectedDay.fullDate.toLocaleDateString('en-US', options);
  }
  
  /**
   * Navigate to the classes page and highlight the corresponding class
   * @param classId The ID of the class to view
   */
  navigateToClassDetails(classId: number): void {
    console.log(`Navigating to classes page for class ID: ${classId}`);
    
    // Navigate to the classes page with the class ID as a query parameter
    // This will allow the classes component to highlight or filter to show this specific class
    this.router.navigate(['/classes'], { 
      queryParams: { 
        highlight: classId,
        category: this.scheduleClasses.find(cls => cls.id === classId)?.category || 'all'
      } 
    });
  }
  
  /**
   * Navigate to the add class page
   */
  navigateToAddClass(): void {
    this.router.navigate(['/schedule/add']);
  }
  
  /**
   * Navigate to the add class page with the selected day pre-filled
   * @param date The date to pre-fill
   */
  navigateToAddClassForDay(date: Date): void {
    // Convert day of week to the format expected by the API (MONDAY, TUESDAY, etc.)
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = dayNames[date.getDay()];
    
    // Navigate to add page with query params
    this.router.navigate(['/schedule/add'], {
      queryParams: {
        dayOfWeek: dayOfWeek,
        date: this.formatDateForApi(date)
      }
    });
  }
  
  /**
   * Load schedule data from the API for the current week
   */
  loadScheduleData(): void {
    this.loading = true;
    this.error = false;
    this.cdr.markForCheck(); // Ensure loading state is reflected immediately
    
    // Format the date as YYYY-MM-DD for the API
    const formattedDate = this.formatDateForApi(this.currentWeekStart);
    
    console.log('Loading schedules for week starting:', formattedDate);
    
    this.scheduleService.getSchedulesForWeek(formattedDate)
      .pipe(
        takeUntil(this.destroy$),
        // Add a timeout to prevent infinite loading
        timeout(10000) // 10 second timeout
      )
      .subscribe({
        next: (schedules: any) => {
          console.log('Received schedules from API:', schedules);
          try {
            this.scheduleClasses = this.scheduleService.convertToScheduleClasses(schedules || []);
            console.log('Converted schedule classes:', this.scheduleClasses);
          } catch (error) {
            console.error('Error converting schedule data:', error);
            this.error = true;
          } finally {
            this.loading = false;
            this.cdr.markForCheck();
          }
        },
        error: (err: any) => {
          console.error('Error loading schedules:', err);
          this.loading = false;
          this.error = true;
          this.cdr.markForCheck();
          
          // If we're getting consistent errors, try loading mock data for testing
          // this.loadMockData();
        },
        complete: () => {
          // Ensure loading state is cleared even if next or error aren't called
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }
  
  /**
   * Format a date as YYYY-MM-DD for the API
   */
  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
