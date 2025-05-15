import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { ScheduleComponent } from './schedule.component';
import { AddScheduleComponent } from './components/add-schedule/add-schedule.component';
import { ScheduleService } from './services/schedule.service';

const routes: Routes = [
  { path: '', component: ScheduleComponent },
  { path: 'add', component: AddScheduleComponent }
];

@NgModule({
  declarations: [
    ScheduleComponent,
    AddScheduleComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ScheduleService
  ],
  exports: [
    ScheduleComponent
  ]
})
export class ScheduleModule { }
