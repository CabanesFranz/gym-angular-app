import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './dashboard/header/header.component';
import { SidePanelComponent } from './dashboard/side-panel/side-panel.component';

// Import new components
import { DashboardComponent } from './dashboard/dashboard.component';
import { MembersComponent } from './members/members.component';
import { ClassesComponent } from './classes/classes.component';
// Schedule component is now lazy loaded
import { ReportsComponent } from './reports/reports.component';
import { AddMemberComponent } from './members/add-member/add-member.component';

// Import services
import { MemberService } from './services/member.service';
import { EditMemberComponent } from './members/edit-member/edit-member.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidePanelComponent,
    DashboardComponent,
    MembersComponent,
    ClassesComponent,
    ReportsComponent,
    AddMemberComponent,
    EditMemberComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
