import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassesComponent } from './components/classes/classes.component';
import { EditClassComponent } from './components/edit-class/edit-class.component';

const routes: Routes = [
  { path: '', component: ClassesComponent },
  { path: 'add', component: EditClassComponent },
  { path: 'edit/:id', component: EditClassComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassesRoutingModule { }
