import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Instructor, InstructorStatus } from '../models/instructor.model';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private instructors: Instructor[] = [];
  private instructorsSubject = new BehaviorSubject<Instructor[]>([]);
  public instructors$ = this.instructorsSubject.asObservable();

  private lastFetchTime = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  constructor(private apiService: ApiService) {
    this.loadInstructors();
  }

  private loadInstructors(): void {
    this.apiService.get<Instructor[]>('/instructors').subscribe({
      next: (instructors) => {
        this.instructors = instructors;
        this.instructorsSubject.next(this.instructors);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading instructors:', error);
      }
    });
  }

  getAllInstructors(): Observable<Instructor[]> {
    const now = Date.now();
    // Only reload if cache is expired
    if (now - this.lastFetchTime > this.CACHE_DURATION) {
      this.loadInstructors();
      this.lastFetchTime = now;
    }
    return this.instructors$;
  }
  
  getInstructorById(id: number): Observable<Instructor> {
    return this.apiService.get<Instructor>(`/instructors/${id}`);
  }
  
  getInstructorByInstructorId(instructorId: string): Observable<Instructor> {
    return this.apiService.get<Instructor>(`/instructors/instructor-id/${instructorId}`);
  }
  
  getInstructorsByStatus(status: InstructorStatus): Observable<Instructor[]> {
    return this.apiService.get<Instructor[]>(`/instructors/status/${status}`);
  }
  
  searchInstructors(query: string): Observable<Instructor[]> {
    return this.apiService.get<Instructor[]>('/instructors/search', { query });
  }
  
  isEmailUnique(email: string): Observable<boolean> {
    return this.apiService.get<{unique: boolean}>('/instructors/check-email', { email }).pipe(
      map(response => response.unique)
    );
  }
  
  isInstructorIdUnique(instructorId: string): Observable<boolean> {
    return this.apiService.get<{unique: boolean}>('/instructors/check-instructor-id', { instructorId }).pipe(
      map(response => response.unique)
    );
  }

  addInstructor(instructor: Instructor): Observable<Instructor> {
    return this.apiService.post<Instructor>('/instructors', instructor).pipe(
      tap(newInstructor => {
        // Update local cache
        this.instructors.push(newInstructor);
        this.instructorsSubject.next(this.instructors);
      })
    );
  }
  
  updateInstructor(instructor: Instructor): Observable<Instructor> {
    if (!instructor.id) {
      throw new Error('Cannot update instructor without an ID');
    }
    
    return this.apiService.put<Instructor>(`/instructors/${instructor.id}`, instructor).pipe(
      tap(updatedInstructor => {
        // Update local cache
        const index = this.instructors.findIndex(i => i.id === updatedInstructor.id);
        if (index !== -1) {
          this.instructors[index] = updatedInstructor;
          this.instructorsSubject.next(this.instructors);
        }
      })
    );
  }
  
  deleteInstructor(id: number): Observable<void> {
    return this.apiService.delete<void>(`/instructors/${id}`).pipe(
      tap(() => {
        // Update local cache
        this.instructors = this.instructors.filter(i => i.id !== id);
        this.instructorsSubject.next(this.instructors);
      })
    );
  }
}