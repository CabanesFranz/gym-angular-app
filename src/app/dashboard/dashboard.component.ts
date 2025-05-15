import { Component, OnInit, OnDestroy } from '@angular/core';
import { MemberService, Member } from '../services/member.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss', './dashboard.component.modal.scss', './new-members.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentDate = new Date();
  newMembers: Member[] = [];
  totalMembers = 0;
  showAddMemberModal = false;
  
  private subscriptions: Subscription[] = [];
  
  constructor(private memberService: MemberService) {}
  
  ngOnInit(): void {
    // Subscribe to new members
    this.subscriptions.push(
      this.memberService.getNewMembers().subscribe(members => {
        this.newMembers = members;
      })
    );
    
    // Subscribe to all members to get total count
    this.subscriptions.push(
      this.memberService.getAllMembers().subscribe(members => {
        this.totalMembers = members.length;
      })
    );
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  openAddMemberModal(): void {
    this.showAddMemberModal = true;
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }
  
  closeAddMemberModal(): void {
    this.showAddMemberModal = false;
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  }
}
