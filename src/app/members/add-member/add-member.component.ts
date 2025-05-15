import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberService, Member } from '../../services/member.service';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  
  memberForm!: FormGroup;
  isSubmitting = false;
  activeTab = 'personal';
  
  constructor(private fb: FormBuilder, private memberService: MemberService) { }

  ngOnInit(): void {
    this.initForm();
  }
  
  private initForm(){
    this.memberForm = this.fb.group({
      // Personal Information
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
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
      status: ['ACTIVE', Validators.required],
      paymentMethod: ['Credit Card'],
      assignedTrainer: [''],
      trainingProgram: [''],

      // Emergency Contact
      emergencyName: [''],
      emergencyPhone: [''],
      emergencyRelationship: [''],

      // Notes
      membershipNotes: [''],
      notes: ['']
    });
  }

  // Tab navigation
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  nextTab(): void {
    const tabs = ['personal', 'health', 'membership', 'emergency', 'notes'];
    const currentIndex = tabs.indexOf(this.activeTab);
    if (currentIndex < tabs.length - 1) {
      this.activeTab = tabs[currentIndex + 1];
    }
  }
  
  previousTab(): void {
    const tabs = ['personal', 'health', 'membership', 'emergency', 'notes'];
    const currentIndex = tabs.indexOf(this.activeTab);
    if (currentIndex > 0) {
      this.activeTab = tabs[currentIndex - 1];
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
    
    // Create new member object
    const newMember: Partial<Member> = {
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
      medicalConditions: medicalConditions.length > 0 ? medicalConditions : undefined,
      
      // Membership details
      paymentMethod: formData.paymentMethod || undefined,
      membershipNotes: formData.membershipNotes || undefined,
      assignedTrainer: formData.assignedTrainer || undefined,
      trainingProgram: formData.trainingProgram || undefined,
      
      // Emergency contact
      emergencyContact: emergencyContact || undefined,
      
      // Notes
      notes: formData.notes || undefined,
      
      // These fields will be set by the service
      memberId: `M${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, // Generate a random member ID
      initials: '',
      joinDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      lastVisit: null
    };
    
    // Add the new member using the MemberService
    this.memberService.addMember(newMember as Member).subscribe({
      next: (addedMember) => {
        console.log('New member added successfully', addedMember);
        this.isSubmitting = false;
        this.memberForm.reset({
          membership: 'STANDARD',
          status: 'ACTIVE',
          paymentMethod: 'Credit Card',
          medicalConditions: 'None'
        });
        this.activeTab = 'personal';
        this.closeModal.emit();
      },
      error: (error) => {
        console.error('Error adding member:', error);
        this.isSubmitting = false;
      }
    });
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
