import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';
import { HttpErrorResponse } from '@angular/common/http';

export interface Member {
  id?: number; // Database ID (backend)
  memberId: string; // Member ID (business identifier)
  name: string;
  initials: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  membership: 'PREMIUM' | 'STANDARD' | 'BASIC';
  joinDate: Date;
  expiryDate: Date;
  lastVisit: Date | null;
  photoUrl?: string;
  // Health metrics
  height?: number; // in cm
  weight?: number; // in kg
  bmi?: number;
  bodyFat?: number; // percentage
  fitnessGoals?: string[];
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
    address?: string;
  };
  // Membership details
  paymentMethod?: string;
  membershipNotes?: string;
  // Attendance
  attendanceRate?: number; // percentage
  // Training
  assignedTrainer?: string;
  trainingProgram?: string;
  // Additional notes
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private members: Member[] = [];
  private membersSubject = new BehaviorSubject<Member[]>([]);
  public members$ = this.membersSubject.asObservable();
  
  private newMembersSubject = new BehaviorSubject<Member[]>([]);
  public newMembers$ = this.newMembersSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadMembers();
  }

  private loadMembers(): void {
    this.apiService.get<Member[]>('/members').subscribe({
      next: (members) => {
        // Transform dates from strings to Date objects
        this.members = members.map(member => this.transformMemberDates(member));
        this.membersSubject.next(this.members);
        this.loadNewMembers();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading members:', error);
      }
    });
  }
  
  private loadNewMembers(): void {
    this.apiService.get<Member[]>('/members/new').subscribe({
      next: (members) => {
        const newMembers = members.map(member => this.transformMemberDates(member));
        this.newMembersSubject.next(newMembers);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading new members:', error);
      }
    });
  }
  
  private transformMemberDates(member: any): Member {
    return {
      ...member,
      joinDate: member.joinDate ? new Date(member.joinDate) : null,
      expiryDate: member.expiryDate ? new Date(member.expiryDate) : null,
      lastVisit: member.lastVisit ? new Date(member.lastVisit) : null
    };
  }

  private lastFetchTime = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  getAllMembers(): Observable<Member[]> {
    const now = Date.now();
    // Only reload if cache is expired
    if (now - this.lastFetchTime > this.CACHE_DURATION) {
      this.loadMembers();
      this.lastFetchTime = now;
    }
    return this.members$;
  }

  getNewMembers(): Observable<Member[]> {
    return this.apiService.get<Member[]>('/members/new').pipe(
      map(members => members.map(member => this.transformMemberDates(member)))
    );
  }
  
  getMemberById(id: number): Observable<Member> {
    return this.apiService.get<Member>(`/members/${id}`).pipe(
      map(member => this.transformMemberDates(member))
    );
  }
  
  getMemberByMemberId(memberId: string): Observable<Member> {
    return this.apiService.get<Member>(`/members/member-id/${memberId}`).pipe(
      map(member => this.transformMemberDates(member))
    );
  }
  
  getMembersByStatus(status: 'ACTIVE' | 'INACTIVE' | 'PENDING'): Observable<Member[]> {
    return this.apiService.get<Member[]>(`/members/status/${status}`).pipe(
      map(members => members.map(member => this.transformMemberDates(member)))
    );
  }
  
  getMembersByMembershipType(membershipType: 'PREMIUM' | 'STANDARD' | 'BASIC'): Observable<Member[]> {
    return this.apiService.get<Member[]>(`/members/membership/${membershipType}`).pipe(
      map(members => members.map(member => this.transformMemberDates(member)))
    );
  }
  
  getMembersWithExpiringMembership(days: number = 30): Observable<Member[]> {
    return this.apiService.get<Member[]>('/members/expiring', { days }).pipe(
      map(members => members.map(member => this.transformMemberDates(member)))
    );
  }
  
  searchMembers(query: string): Observable<Member[]> {
    return this.apiService.get<Member[]>('/members/search', { query }).pipe(
      map(members => members.map(member => this.transformMemberDates(member)))
    );
  }
  
  isEmailUnique(email: string): Observable<boolean> {
    return this.apiService.get<{unique: boolean}>('/members/check-email', { email }).pipe(
      map(response => response.unique)
    );
  }
  
  isMemberIdUnique(memberId: string): Observable<boolean> {
    return this.apiService.get<{unique: boolean}>('/members/check-member-id', { memberId }).pipe(
      map(response => response.unique)
    );
  }

  addMember(member: Member): Observable<Member> {
    // Create initials from name if not provided
    if (!member.initials) {
      const nameParts = member.name.split(' ');
      const initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[1][0]}` 
        : `${nameParts[0][0]}${nameParts[0][1] || ''}`;
      member.initials = initials.toUpperCase();
    }
    
    // Set default dates if not provided
    if (!member.joinDate) {
      member.joinDate = new Date();
    }
    
    if (!member.expiryDate) {
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      member.expiryDate = oneYearLater;
    }
    
    if (!member.lastVisit) {
      member.lastVisit = new Date();
    }
    
    // Convert dates to ISO strings for API
    const memberForApi = this.prepareForApi(member);
    
    return this.apiService.post<Member>('/members', memberForApi).pipe(
      map(newMember => this.transformMemberDates(newMember)),
      tap(newMember => {
        // Update local cache
        this.members.push(newMember);
        this.membersSubject.next(this.members);
        this.loadNewMembers();
      })
    );
  }
  
  updateMember(member: Member): Observable<Member> {
    if (!member.id) {
      throw new Error('Cannot update member without an ID');
    }
    
    // Convert dates to ISO strings for API
    const memberForApi = this.prepareForApi(member);
    
    return this.apiService.put<Member>(`/members/${member.id}`, memberForApi).pipe(
      map(updatedMember => this.transformMemberDates(updatedMember)),
      tap(updatedMember => {
        // Update local cache
        const index = this.members.findIndex(m => m.id === updatedMember.id);
        if (index !== -1) {
          this.members[index] = updatedMember;
          this.membersSubject.next(this.members);
        }
      })
    );
  }
  
  deleteMember(id: number): Observable<void> {
    return this.apiService.delete<void>(`/members/${id}`).pipe(
      tap(() => {
        // Update local cache
        this.members = this.members.filter(m => m.id !== id);
        this.membersSubject.next(this.members);
        this.loadNewMembers();
      })
    );
  }
  
  private prepareForApi(member: Member): any {
    // Create a copy to avoid modifying the original
    const memberCopy = { ...member };
    
    // Convert Date objects to ISO strings for the API
    if (memberCopy.joinDate instanceof Date) {
      // Use any to bypass TypeScript's type checking for this conversion
      (memberCopy as any).joinDate = memberCopy.joinDate.toISOString().split('T')[0];
    }
    
    if (memberCopy.expiryDate instanceof Date) {
      (memberCopy as any).expiryDate = memberCopy.expiryDate.toISOString().split('T')[0];
    }
    
    if (memberCopy.lastVisit instanceof Date) {
      (memberCopy as any).lastVisit = memberCopy.lastVisit.toISOString().split('T')[0];
    }
    
    return memberCopy;
  }
}
