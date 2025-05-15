import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AddInstructorComponent } from './components/add-instructor/add-instructor.component';
import { InstructorsComponent } from './instructors.component';

const routes: Routes = [
  { path: '', component: InstructorsComponent },
  { path: 'add', component: AddInstructorComponent }
];

@NgModule({
  declarations: [
    InstructorsComponent,
    AddInstructorComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    InstructorsComponent,
    AddInstructorComponent
  ]
})
export class InstructorsModule { }
