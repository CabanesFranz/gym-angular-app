import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Components
import { ClassesComponent } from './components/classes/classes.component';
import { EditClassComponent } from './components/edit-class/edit-class.component';

// Services
import { GymClassService } from './services/gym-class.service';
import { InstructorService } from './services/instructor.service';

// Routing
import { ClassesRoutingModule } from './classes-routing.module';

@NgModule({
  declarations: [
    ClassesComponent,
    EditClassComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ClassesRoutingModule
  ],
  providers: [
    GymClassService,
    InstructorService
  ]
})
export class ClassesModule { }
