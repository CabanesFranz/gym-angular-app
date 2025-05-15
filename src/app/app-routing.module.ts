import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Placeholder components (you'll need to create these)
import { DashboardComponent } from './dashboard/dashboard.component';
import { MembersComponent } from './members/members.component';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'members', component: MembersComponent },
  { 
    path: 'classes', 
    loadChildren: () => import('./classes/classes.module').then(m => m.ClassesModule) 
  },
  { 
    path: 'schedule', 
    loadChildren: () => import('./schedule/schedule.module').then(m => m.ScheduleModule) 
  },
  { 
    path: 'instructors', 
    loadChildren: () => import('./instructors/instructors.module').then(m => m.InstructorsModule) 
  },
  { path: 'reports', component: ReportsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
