import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberService, Member } from '../../services/member.service';

@Component({
  selector: 'app-edit-member',
  templateUrl: './edit-member.component.html',
  styleUrls: ['./edit-member.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditMemberComponent implements OnInit {
  @Input() member!: Member;
  @Output() closeModal = new EventEmitter<void>();
  @Output() memberUpdated = new EventEmitter<Member>();
  
  memberForm!: FormGroup;
  isSubmitting = false;
  activeTab = 'personal';
  
  constructor(
    private fb: FormBuilder, 
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.populateForm();
  }
  
  private initForm(): void {
    this.memberForm = this.fb.group({
      // Personal Information
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      status: ['ACTIVE', Validators.required],
      photoUrl: [''],
      
      // Health Metrics
      height: [null],
      weight: [null],
      bmi: [null],
      bodyFat: [null],
      goalWeightLoss: [false],
      goalMuscleGain: [false],
      goalEndurance: [false],
      goalFlexibility: [false],
      goalStrength: [false],
      medicalConditions: ['None'],
      
      // Membership Details
      membership: ['STANDARD', Validators.required],
      paymentMethod: ['Credit Card'],
      membershipNotes: [''],
      assignedTrainer: [''],
      trainingProgram: [''],
      
      // Emergency Contact
      emergencyName: [''],
      emergencyPhone: [''],
      emergencyRelationship: [''],
      
      // Notes
      notes: ['']
    });
  }
  
  private populateForm(): void {
    if (!this.member) return;
    
    // Populate personal information
    this.memberForm.patchValue({
      name: this.member.name,
      email: this.member.email,
      phone: this.member.phone,
      status: this.member.status,
      photoUrl: this.member.photoUrl || '',
      
      // Health metrics
      height: this.member.height || null,
      weight: this.member.weight || null,
      bmi: this.member.bmi || null,
      bodyFat: this.member.bodyFat || null,
      medicalConditions: this.member.medicalConditions?.join(', ') || 'None',
      
      // Membership details
      membership: this.member.membership,
      paymentMethod: this.member.paymentMethod || 'Credit Card',
      membershipNotes: this.member.membershipNotes || '',
      assignedTrainer: this.member.assignedTrainer || '',
      trainingProgram: this.member.trainingProgram || '',
      
      // Notes
      notes: this.member.notes || ''
    });
    
    // Populate fitness goals checkboxes
    if (this.member.fitnessGoals) {
      this.memberForm.patchValue({
        goalWeightLoss: this.member.fitnessGoals.includes('Weight loss'),
        goalMuscleGain: this.member.fitnessGoals.includes('Muscle gain'),
        goalEndurance: this.member.fitnessGoals.includes('Endurance'),
        goalFlexibility: this.member.fitnessGoals.includes('Flexibility'),
        goalStrength: this.member.fitnessGoals.includes('Strength')
      });
    }
    
    // Populate emergency contact
    if (this.member.emergencyContact) {
      this.memberForm.patchValue({
        emergencyName: this.member.emergencyContact.name,
        emergencyPhone: this.member.emergencyContact.phone,
        emergencyRelationship: this.member.emergencyContact.relationship
      });
    }
  }
  
  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }
  
  previousTab(): void {
    switch (this.activeTab) {
      case 'health':
        this.activeTab = 'personal';
        break;
      case 'membership':
        this.activeTab = 'health';
        break;
      case 'emergency':
        this.activeTab = 'membership';
        break;
      case 'notes':
        this.activeTab = 'emergency';
        break;
    }
  }
  
  nextTab(): void {
    switch (this.activeTab) {
      case 'personal':
        this.activeTab = 'health';
        break;
      case 'health':
        this.activeTab = 'membership';
        break;
      case 'membership':
        this.activeTab = 'emergency';
        break;
      case 'emergency':
        this.activeTab = 'notes';
        break;
    }
  }
  
  onSubmit(): void {
    if (this.memberForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.memberForm.controls).forEach(key => {
        const control = this.memberForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    // Get form values
    const formData = this.memberForm.value;
    
    // Process fitness goals
    const fitnessGoals: string[] = [];
    if (formData.goalWeightLoss) fitnessGoals.push('Weight loss');
    if (formData.goalMuscleGain) fitnessGoals.push('Muscle gain');
    if (formData.goalEndurance) fitnessGoals.push('Endurance');
    if (formData.goalFlexibility) fitnessGoals.push('Flexibility');
    if (formData.goalStrength) fitnessGoals.push('Strength');
    
    // Process medical conditions
    const medicalConditions = formData.medicalConditions ? 
      formData.medicalConditions.split(',').map((condition: string) => condition.trim()).filter((condition: string) => condition) : 
      ['None'];
    
    // Process emergency contact
    let emergencyContact = null;
    if (formData.emergencyName && formData.emergencyPhone) {
      emergencyContact = {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relationship: formData.emergencyRelationship || 'Not specified'
      };
    }
    
    // Create updated member object
    const updatedMember: Member = {
      ...this.member,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status.toUpperCase(), // Ensure uppercase for enum
      membership: formData.membership.toUpperCase(), // Ensure uppercase for enum,
      photoUrl: formData.photoUrl || undefined,
      // Health metrics
      height: formData.height || undefined,
      weight: formData.weight || undefined,
      bmi: formData.bmi || undefined,
      bodyFat: formData.bodyFat || undefined,
      fitnessGoals: fitnessGoals.length > 0 ? fitnessGoals : undefined,
      medicalConditions: typeof medicalConditions === 'string' ? 
        medicalConditions.split(',').map(c => c.trim()).filter(c => c) : 
        medicalConditions,
      // Membership details
      paymentMethod: formData.paymentMethod || undefined,
      membershipNotes: formData.membershipNotes || undefined,
      assignedTrainer: formData.assignedTrainer || undefined,
      trainingProgram: formData.trainingProgram || undefined,
      // Emergency contact
      emergencyContact: emergencyContact || undefined,
      // Notes
      notes: formData.notes || undefined
    };
    
    // Update the member using the service
    this.memberService.updateMember(updatedMember).subscribe({
      next: (updatedMemberResponse) => {
        // Emit the updated member
        this.memberUpdated.emit(updatedMemberResponse);
        this.isSubmitting = false;
        this.closeModal.emit();
      },
      error: (error) => {
        console.error('Error updating member:', error);
        this.isSubmitting = false;
      }
    });
    
    // Reset form and close modal after successful update
    setTimeout(() => {
      console.log('Member updated successfully');
      this.isSubmitting = false;
      this.closeModal.emit();
    }, 500); // Small delay to allow the service to update
  }
  
  onCancel(): void {
    this.closeModal.emit();
  }
  
  // Prevent modal from closing when clicking inside it
  preventClose(event: Event): void {
    event.stopPropagation();
  }
  
  // Helper for form validation
  get formControls() {
    return this.memberForm.controls;
  }
}
