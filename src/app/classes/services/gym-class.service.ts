import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GymClass, ClassType, DifficultyLevel, ClassStatus } from '../models/gym-class.model';

@Injectable({
  providedIn: 'root'
})
export class GymClassService {
  private classes: GymClass[] = [];
  private classesSubject = new BehaviorSubject<GymClass[]>([]);
  public classes$ = this.classesSubject.asObservable();
  
  private recentClassesSubject = new BehaviorSubject<GymClass[]>([]);
  public recentClasses$ = this.recentClassesSubject.asObservable();

  private lastFetchTime = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  constructor(private apiService: ApiService) {
    this.loadClasses();
  }

  private loadClasses(): void {
    this.apiService.get<GymClass[]>('/classes').subscribe({
      next: (classes) => {
        this.classes = classes;
        this.classesSubject.next(this.classes);
        this.loadRecentClasses();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading classes:', error);
      }
    });
  }
  
  private loadRecentClasses(): void {
    this.apiService.get<GymClass[]>('/classes/recent').subscribe({
      next: (classes) => {
        this.recentClassesSubject.next(classes);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading recent classes:', error);
      }
    });
  }

  getAllClasses(): Observable<GymClass[]> {
    const now = Date.now();
    // Only reload if cache is expired
    if (now - this.lastFetchTime > this.CACHE_DURATION) {
      this.loadClasses();
      this.lastFetchTime = now;
    }
    return this.classes$;
  }

  getRecentClasses(limit: number = 5): Observable<GymClass[]> {
    return this.apiService.get<GymClass[]>('/classes/recent', { limit });
  }
  
  getClassById(id: number): Observable<GymClass> {
    return this.apiService.get<GymClass>(`/classes/${id}`);
  }
  
  getClassesByStatus(status: ClassStatus): Observable<GymClass[]> {
    return this.apiService.get<GymClass[]>(`/classes/status/${status}`);
  }
  
  getClassesByType(type: ClassType): Observable<GymClass[]> {
    return this.apiService.get<GymClass[]>(`/classes/type/${type}`);
  }
  
  getClassesByDifficultyLevel(level: DifficultyLevel): Observable<GymClass[]> {
    return this.apiService.get<GymClass[]>(`/classes/difficulty/${level}`);
  }
  
  getClassesByInstructor(instructorId: number): Observable<GymClass[]> {
    return this.apiService.get<GymClass[]>(`/classes/instructor/${instructorId}`);
  }
  
  searchClasses(query: string): Observable<GymClass[]> {
    return this.apiService.get<GymClass[]>('/classes/search', { query });
  }

  addClass(gymClass: GymClass): Observable<GymClass> {
    return this.apiService.post<GymClass>('/classes', gymClass).pipe(
      tap(newClass => {
        // Update local cache
        this.classes.push(newClass);
        this.classesSubject.next(this.classes);
        this.loadRecentClasses();
      })
    );
  }
  
  updateClass(gymClass: GymClass): Observable<GymClass> {
    if (!gymClass.id) {
      throw new Error('Cannot update class without an ID');
    }
    
    return this.apiService.put<GymClass>(`/classes/${gymClass.id}`, gymClass).pipe(
      tap(updatedClass => {
        // Update local cache
        const index = this.classes.findIndex(c => c.id === updatedClass.id);
        if (index !== -1) {
          this.classes[index] = updatedClass;
          this.classesSubject.next(this.classes);
        }
      })
    );
  }
  
  deleteClass(id: number): Observable<void> {
    return this.apiService.delete<void>(`/classes/${id}`).pipe(
      tap(() => {
        // Update local cache
        this.classes = this.classes.filter(c => c.id !== id);
        this.classesSubject.next(this.classes);
        this.loadRecentClasses();
      })
    );
  }
}