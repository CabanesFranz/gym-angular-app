import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MemberService, Member } from '../services/member.service';

// Using Member interface from MemberService

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss', './members.component.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembersComponent implements OnInit, OnDestroy {
  // Filters
  private _searchTerm: string = '';
  get searchTerm(): string { return this._searchTerm; }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.applyFiltersDebounced();
  }
  
  statusFilter: string = 'all';
  membershipFilter: string = 'all';
  sortOption: string = 'nameAsc';
  
  // Debounce search to improve performance
  private searchDebounceTime = 300; // milliseconds
  private applyFiltersDebounced = this.debounce(() => this.applyFilters(), this.searchDebounceTime);
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;
  
  // Member data
  members: Member[] = [];
  filteredMembers: Member[] = [];
  
  // Modals
  showModal: boolean = false;
  showAddMemberModal: boolean = false;
  showEditMemberModal: boolean = false;
  selectedMember: Member | null = null;
  activeDetailTab: string = 'overview'; // Default active tab for member details
  
  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];
  
  constructor(
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  ) { }
  
  ngOnInit(): void {
    // Subscribe to the members service for real-time updates
    this.subscriptions.push(
      this.memberService.getAllMembers().subscribe(members => {
        this.members = members;
        this.applyFilters();
        // Manually trigger change detection
        this.cdr.markForCheck();
      })
    );
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  /**
   * Utility method to debounce function calls
   */
  private debounce(func: Function, wait: number): () => void {
    let timeout: any;
    return function executedFunction() {
      const later = () => {
        clearTimeout(timeout);
        func();
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  applyFilters(): void {
    let filtered = [...this.members];
    
    // Apply search filter
    if (this._searchTerm.trim() !== '') {
      const term = this._searchTerm.toLowerCase().trim();
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(term) || 
        member.email.toLowerCase().includes(term) ||
        (member.memberId && member.memberId.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === this.statusFilter.toUpperCase());
    }
    
    // Apply membership filter
    if (this.membershipFilter !== 'all') {
      filtered = filtered.filter(member => member.membership === this.membershipFilter.toUpperCase());
    }
    
    // Apply sorting
    switch (this.sortOption) {
      case 'nameAsc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filtered.sort((a, b) => b.joinDate.getTime() - a.joinDate.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.joinDate.getTime() - b.joinDate.getTime());
        break;
    }
    
    // Calculate total pages
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredMembers = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  resetFilters(): void {
    this._searchTerm = '';
    this.statusFilter = 'all';
    this.membershipFilter = 'all';
    this.sortOption = 'nameAsc';
    this.applyFilters();
    this.cdr.markForCheck();
  }
  
  changePage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }
  
  openMemberDetails(member: Member): void {
    this.selectedMember = member;
    this.showModal = true;
    this.activeDetailTab = 'overview'; // Reset to overview tab when opening modal
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }
  
  closeModal(): void {
    this.showModal = false;
    this.selectedMember = null;
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  }
  
  // Prevent modal from closing when clicking inside it
  preventClose(event: Event): void {
    event.stopPropagation();
  }
  
  // Open add member modal
  openAddMemberModal(): void {
    this.showAddMemberModal = true;
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }
  
  // Close add member modal
  closeAddMemberModal(): void {
    this.showAddMemberModal = false;
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  }
  
  // Set active tab for member details
  setActiveDetailTab(tabName: string): void {
    this.activeDetailTab = tabName;
  }
  
  // Open edit member modal
  openEditMemberModal(): void {
    if (!this.selectedMember) return;
    
    this.showEditMemberModal = true;
    this.showModal = false; // Hide the details modal
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }
  
  // Close edit member modal
  closeEditMemberModal(): void {
    this.showEditMemberModal = false;
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  }
  
  // Handle member update
  onMemberUpdated(updatedMember: Member): void {
    // Find and update the member in the local array
    const index = this.members.findIndex(m => m.id === updatedMember.id);
    if (index !== -1) {
      this.members[index] = updatedMember;
      this.applyFilters();
      this.cdr.markForCheck();
    }
    
    // Close the edit modal
    this.closeEditMemberModal();
  }
}
