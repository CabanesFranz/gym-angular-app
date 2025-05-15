import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { Schedule, ScheduleClass, ScheduleStatus } from '../models/schedule.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/schedules`;
  private cache: { [key: string]: { data: any, timestamp: number } } = {};
  private cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private http: HttpClient) { }

  getAllSchedules(): Observable<Schedule[]> {
    const cacheKey = 'all-schedules';
    if (this.isCacheValid(cacheKey)) {
      return of(this.cache[cacheKey].data);
    }

    return this.http.get<Schedule[]>(this.apiUrl).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError<Schedule[]>('getAllSchedules', []))
    );
  }

  getScheduleById(id: number): Observable<Schedule> {
    const cacheKey = `schedule-${id}`;
    if (this.isCacheValid(cacheKey)) {
      return of(this.cache[cacheKey].data);
    }

    return this.http.get<Schedule>(`${this.apiUrl}/${id}`).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError<Schedule>(`getScheduleById id=${id}`))
    );
  }

  createSchedule(schedule: Schedule): Observable<Schedule> {
    this.clearCache();
    return this.http.post<Schedule>(this.apiUrl, schedule).pipe(
      catchError(this.handleError<Schedule>('createSchedule'))
    );
  }

  updateSchedule(id: number, schedule: Schedule): Observable<Schedule> {
    this.clearCache();
    return this.http.put<Schedule>(`${this.apiUrl}/${id}`, schedule).pipe(
      catchError(this.handleError<Schedule>('updateSchedule'))
    );
  }

  deleteSchedule(id: number): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<void>('deleteSchedule'))
    );
  }

  getSchedulesByStatus(status: ScheduleStatus): Observable<Schedule[]> {
    const cacheKey = `schedules-status-${status}`;
    if (this.isCacheValid(cacheKey)) {
      return of(this.cache[cacheKey].data);
    }

    return this.http.get<Schedule[]>(`${this.apiUrl}/status/${status}`).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError<Schedule[]>(`getSchedulesByStatus status=${status}`, []))
    );
  }

  getSchedulesByDayOfWeek(dayOfWeek: string): Observable<Schedule[]> {
    const cacheKey = `schedules-day-${dayOfWeek}`;
    if (this.isCacheValid(cacheKey)) {
      return of(this.cache[cacheKey].data);
    }

    return this.http.get<Schedule[]>(`${this.apiUrl}/day/${dayOfWeek}`).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError<Schedule[]>(`getSchedulesByDayOfWeek day=${dayOfWeek}`, []))
    );
  }

  getSchedulesByClass(classId: number): Observable<Schedule[]> {
    const cacheKey = `schedules-class-${classId}`;
    if (this.isCacheValid(cacheKey)) {
      return of(this.cache[cacheKey].data);
    }

    return this.http.get<Schedule[]>(`${this.apiUrl}/class/${classId}`).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError<Schedule[]>(`getSchedulesByClass classId=${classId}`, []))
    );
  }

  getSchedulesByInstructor(instructorId: number): Observable<Schedule[]> {
    const cacheKey = `schedules-instructor-${instructorId}`;
    if (this.isCacheValid(cacheKey)) {
      return of(this.cache[cacheKey].data);
    }

    return this.http.get<Schedule[]>(`${this.apiUrl}/instructor/${instructorId}`).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError<Schedule[]>(`getSchedulesByInstructor instructorId=${instructorId}`, []))
    );
  }

  getActiveSchedulesForDate(date: string): Observable<Schedule[]> {
    const cacheKey = `schedules-date-${date}`;
    if (this.isCacheValid(cacheKey)) {
      return of(this.cache[cacheKey].data);
    }

    let params = new HttpParams().set('date', date);
    return this.http.get<Schedule[]>(`${this.apiUrl}/date`, { params }).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError<Schedule[]>(`getActiveSchedulesForDate date=${date}`, []))
    );
  }

  getSchedulesInDateRange(startDate: string, endDate: string): Observable<Schedule[]> {
    const cacheKey = `schedules-range-${startDate}-${endDate}`;
    if (this.isCacheValid(cacheKey)) {
      return of(this.cache[cacheKey].data);
    }

    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<Schedule[]>(`${this.apiUrl}/range`, { params }).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError<Schedule[]>(`getSchedulesInDateRange startDate=${startDate}, endDate=${endDate}`, []))
    );
  }

  searchSchedules(query: string): Observable<Schedule[]> {
    const cacheKey = `schedules-search-${query}`;
    if (this.isCacheValid(cacheKey)) {
      return of(this.cache[cacheKey].data);
    }

    let params = new HttpParams().set('query', query);
    return this.http.get<Schedule[]>(`${this.apiUrl}/search`, { params }).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError<Schedule[]>(`searchSchedules query=${query}`, []))
    );
  }

  getSchedulesForWeek(weekStart: string): Observable<Schedule[]> {
    const cacheKey = `schedules-week-${weekStart}`;
    if (this.isCacheValid(cacheKey)) {
      console.log('Using cached schedule data for week:', weekStart);
      return of(this.cache[cacheKey].data);
    }

    console.log('Fetching schedule data from API for week:', weekStart);
    console.log('API URL:', `${this.apiUrl}/week`);
    
    let params = new HttpParams().set('weekStart', weekStart);
    return this.http.get<Schedule[]>(`${this.apiUrl}/week`, { params }).pipe(
      tap(data => {
        console.log('Received schedule data from API:', data);
        this.setCache(cacheKey, data);
      }),
      catchError(error => {
        console.error('Error fetching schedules for week:', error);
        // Try a fallback endpoint if the /week endpoint fails
        if (error.status === 404) {
          console.log('Trying fallback to get all schedules');
          return this.getAllSchedules();
        }
        return this.handleError<Schedule[]>(`getSchedulesForWeek weekStart=${weekStart}`, [])(error);
      })
    );
  }

  // Convert API Schedule objects to ScheduleClass objects for the UI
  convertToScheduleClasses(schedules: Schedule[]): ScheduleClass[] {
    if (!schedules || !Array.isArray(schedules)) {
      console.error('Invalid schedules data received:', schedules);
      return [];
    }
    
    console.log('Converting schedules to UI format:', schedules);
    
    return schedules.filter(schedule => schedule).map(schedule => {
      try {
        const dayMap: { [key: string]: number } = {
          'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 0
        };

        // Handle potential missing or malformed data
        if (!schedule.gymClass) {
          console.error('Schedule missing gymClass:', schedule);
          schedule.gymClass = { name: 'Unknown Class', type: 'other', id: 0 } as any;
        }
        
        if (!schedule.instructor) {
          console.error('Schedule missing instructor:', schedule);
          schedule.instructor = { name: 'Unknown Instructor', id: 0 } as any;
        }
        
        // Ensure dayOfWeek is in the correct format
        const dayOfWeek = schedule.dayOfWeek ? schedule.dayOfWeek.toUpperCase() : 'MONDAY';
        const day = dayMap[dayOfWeek] !== undefined ? dayMap[dayOfWeek] : 1; // Default to Monday if invalid
        
        return {
          id: schedule.id || 0,
          title: schedule.gymClass.name || 'Unknown Class',
          instructor: schedule.instructor.name || 'Unknown Instructor',
          instructorId: schedule.instructor.id || 0,
          category: (schedule.gymClass.type || 'other').toLowerCase(),
          startTime: this.formatTime(schedule.startTime),
          endTime: this.formatTime(schedule.endTime),
          day: day,
          dayOfWeek: dayOfWeek,
          capacity: schedule.capacity || schedule.gymClass?.capacity || 0,
          currentAttendees: schedule.currentEnrollment || 0,
          location: schedule.location || schedule.gymClass?.location || 'Main Gym',
          status: schedule.status || ScheduleStatus.ACTIVE,
          classId: schedule.gymClass.id || 0
        };
      } catch (error) {
        console.error('Error converting schedule:', schedule, error);
        // Return a placeholder schedule item instead of failing
        return {
          id: 0,
          title: 'Data Error',
          instructor: 'Please check console',
          instructorId: 0,
          category: 'error',
          startTime: '12:00 PM',
          endTime: '1:00 PM',
          day: 1,
          dayOfWeek: 'MONDAY',
          capacity: 0,
          currentAttendees: 0,
          location: 'Error',
          status: ScheduleStatus.CANCELLED,
          classId: 0
        };
      }
    });
  }

  // Format time from API (HH:mm:ss) to UI format (h:mm AM/PM)
  private formatTime(time: string): string {
    if (!time) return '12:00 PM'; // Default time if none provided
    
    try {
      // Handle different time formats
      let hours, minutes;
      
      if (time.includes(':')) {
        // Format: HH:mm or HH:mm:ss
        [hours, minutes] = time.split(':');
      } else if (time.includes('T')) {
        // Format: ISO string or similar with T separator
        const timePart = time.split('T')[1];
        [hours, minutes] = timePart.split(':');
      } else if (time.match(/^\d{1,2}(am|pm)$/i)) {
        // Format: 9am, 10pm, etc.
        const match = time.match(/^(\d{1,2})(am|pm)$/i);
        if (match) {
          hours = match[1];
          minutes = '00';
          const period = match[2].toLowerCase();
          if (period === 'pm' && parseInt(hours, 10) < 12) {
            hours = (parseInt(hours, 10) + 12).toString();
          } else if (period === 'am' && hours === '12') {
            hours = '0';
          }
        } else {
          return '12:00 PM'; // Default if format doesn't match
        }
      } else {
        console.warn('Unrecognized time format:', time);
        return '12:00 PM'; // Default for unrecognized format
      }
      
      // Convert to 12-hour format
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      // Ensure minutes is defined
      minutes = minutes || '00';
      
      // Only use the first two digits of minutes
      if (minutes.length > 2) {
        minutes = minutes.substring(0, 2);
      }
      
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', time, error);
      return '12:00 PM'; // Default time on error
    }
  }

  private isCacheValid(key: string): boolean {
    if (!this.cache[key]) return false;
    
    const now = Date.now();
    return (now - this.cache[key].timestamp) < this.cacheDuration;
  }

  private setCache(key: string, data: any): void {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
  }

  private clearCache(): void {
    this.cache = {};
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}
