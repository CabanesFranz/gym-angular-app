import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import * as ChartMethods from './chart-methods';

interface Member {
  id: number;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  revenue: number;
}

interface CheckIn {
  id: number;
  member: string;
  checkInTime: string;
  checkOutTime: string | null;
  duration: string;
  classAttended: string | null;
}

interface Transaction {
  id: number;
  date: string;
  member: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: string;
}

interface ClassPerformance {
  id: number;
  name: string;
  instructor: string;
  type: string;
  avgAttendance: number;
  capacity: number;
  capacityPercentage: number;
  revenue: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, AfterViewInit {
  // Tab state
  activeTab: 'overview' | 'membership' | 'attendance' | 'revenue' | 'classes' = 'overview';
  
  // Date range state
  showDateRangeDropdown = false;
  selectedDateRange: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom' = 'thisMonth';
  customStartDate: string = '';
  customEndDate: string = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Filters
  membershipTypeFilter = 'all';
  membershipStatusFilter = 'all';
  memberSearchQuery = '';
  classTypeFilter = 'all';
  instructorFilter = 'all';
  
  // Mock data for members
  members: Member[] = [
    { id: 1, name: 'John Doe', type: 'Premium', startDate: '2025-01-15', endDate: '2026-01-15', status: 'active', revenue: 1200 },
    { id: 2, name: 'Jane Smith', type: 'Standard', startDate: '2025-02-10', endDate: '2025-08-10', status: 'active', revenue: 600 },
    { id: 3, name: 'Mike Johnson', type: 'Family', startDate: '2025-03-05', endDate: '2026-03-05', status: 'active', revenue: 1800 },
    { id: 4, name: 'Sarah Williams', type: 'Premium', startDate: '2024-11-20', endDate: '2025-11-20', status: 'active', revenue: 1200 },
    { id: 5, name: 'David Brown', type: 'Standard', startDate: '2024-12-15', endDate: '2025-06-15', status: 'active', revenue: 600 },
    { id: 6, name: 'Emily Davis', type: 'Premium', startDate: '2024-10-05', endDate: '2025-04-05', status: 'expired', revenue: 600 },
    { id: 7, name: 'Robert Wilson', type: 'Family', startDate: '2025-04-10', endDate: '2026-04-10', status: 'pending', revenue: 1800 },
    { id: 8, name: 'Lisa Martinez', type: 'Standard', startDate: '2025-03-25', endDate: '2025-09-25', status: 'active', revenue: 600 },
    { id: 9, name: 'James Taylor', type: 'Premium', startDate: '2025-02-15', endDate: '2026-02-15', status: 'active', revenue: 1200 },
    { id: 10, name: 'Jennifer Garcia', type: 'Standard', startDate: '2025-01-20', endDate: '2025-07-20', status: 'active', revenue: 600 },
    { id: 11, name: 'Michael Rodriguez', type: 'Family', startDate: '2024-12-10', endDate: '2025-12-10', status: 'active', revenue: 1800 },
    { id: 12, name: 'Amanda Lee', type: 'Premium', startDate: '2025-04-05', endDate: '2026-04-05', status: 'pending', revenue: 1200 }
  ];
  
  // Filtered members
  filteredMembers: Member[] = [];
  
  // Mock data for check-ins
  checkIns: CheckIn[] = [
    { id: 1, member: 'John Doe', checkInTime: '2025-05-06 08:15 AM', checkOutTime: '2025-05-06 09:45 AM', duration: '1h 30m', classAttended: 'Morning Yoga' },
    { id: 2, member: 'Jane Smith', checkInTime: '2025-05-06 10:00 AM', checkOutTime: '2025-05-06 11:30 AM', duration: '1h 30m', classAttended: null },
    { id: 3, member: 'Mike Johnson', checkInTime: '2025-05-06 04:30 PM', checkOutTime: '2025-05-06 06:00 PM', duration: '1h 30m', classAttended: null },
    { id: 4, member: 'Sarah Williams', checkInTime: '2025-05-06 05:15 PM', checkOutTime: '2025-05-06 06:30 PM', duration: '1h 15m', classAttended: 'Spin Class' },
    { id: 5, member: 'David Brown', checkInTime: '2025-05-06 06:45 PM', checkOutTime: '2025-05-06 08:00 PM', duration: '1h 15m', classAttended: 'HIIT Training' },
    { id: 6, member: 'Emily Davis', checkInTime: '2025-05-06 07:00 PM', checkOutTime: null, duration: 'In Progress', classAttended: null }
  ];
  
  // Mock data for transactions
  transactions: Transaction[] = [
    { id: 1, date: '2025-05-06', member: 'John Doe', description: 'Premium Membership - Annual', amount: 1200, paymentMethod: 'Credit Card', status: 'completed' },
    { id: 2, date: '2025-05-05', member: 'Jane Smith', description: 'Standard Membership - 6 Months', amount: 600, paymentMethod: 'Credit Card', status: 'completed' },
    { id: 3, date: '2025-05-05', member: 'Mike Johnson', description: 'Family Membership - Annual', amount: 1800, paymentMethod: 'Bank Transfer', status: 'completed' },
    { id: 4, date: '2025-05-04', member: 'Sarah Williams', description: 'Personal Training Session', amount: 75, paymentMethod: 'Credit Card', status: 'completed' },
    { id: 5, date: '2025-05-03', member: 'David Brown', description: 'Protein Supplements', amount: 45, paymentMethod: 'Cash', status: 'completed' },
    { id: 6, date: '2025-05-02', member: 'Emily Davis', description: 'Premium Membership - 6 Months', amount: 600, paymentMethod: 'Credit Card', status: 'failed' },
    { id: 7, date: '2025-05-01', member: 'Robert Wilson', description: 'Family Membership - Annual', amount: 1800, paymentMethod: 'Bank Transfer', status: 'pending' }
  ];
  
  // Mock data for class performance
  classPerformance: ClassPerformance[] = [
    { id: 1, name: 'Morning Yoga', instructor: 'Sarah Johnson', type: 'yoga', avgAttendance: 10, capacity: 12, capacityPercentage: 83, revenue: 500 },
    { id: 2, name: 'HIIT Training', instructor: 'Mike Peterson', type: 'hiit', avgAttendance: 12, capacity: 15, capacityPercentage: 80, revenue: 600 },
    { id: 3, name: 'Spin Class', instructor: 'Emma Roberts', type: 'cardio', avgAttendance: 18, capacity: 20, capacityPercentage: 90, revenue: 900 },
    { id: 4, name: 'Advanced Weightlifting', instructor: 'David Kim', type: 'strength', avgAttendance: 12, capacity: 15, capacityPercentage: 80, revenue: 600 },
    { id: 5, name: 'Core Pilates', instructor: 'Lisa Chen', type: 'pilates', avgAttendance: 8, capacity: 10, capacityPercentage: 80, revenue: 400 },
    { id: 6, name: 'Beginner Strength', instructor: 'James Wilson', type: 'strength', avgAttendance: 8, capacity: 12, capacityPercentage: 67, revenue: 400 }
  ];
  
  // Filtered classes
  filteredClasses: ClassPerformance[] = [];
  
  // Chart instances
  charts: { [key: string]: Chart } = {};
  
  // Chart colors
  chartColors = {
    primary: '#4361ee',
    secondary: '#3f37c9',
    success: '#4cc9f0',
    info: '#4895ef',
    warning: '#f72585',
    danger: '#e63946',
    purple: '#7209b7',
    pink: '#f72585',
    indigo: '#560bad',
    teal: '#4cc9f0',
    orange: '#fb8500',
    chartBackground: [
      '#4361ee', '#3f37c9', '#4cc9f0', '#4895ef', '#f72585', 
      '#e63946', '#7209b7', '#f72585', '#560bad', '#4cc9f0', '#fb8500'
    ]
  };
  
  constructor() {
    // Register Chart.js components
    Chart.register(...registerables);
  }
  
  ngOnInit(): void {
    // Set default date range
    const today = new Date();
    this.customStartDate = this.formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
    this.customEndDate = this.formatDate(today);
    
    // Initialize filtered data
    this.applyMembershipFilters();
    this.applyClassFilters();
  }
  
  ngAfterViewInit(): void {
    // Initialize charts after view is initialized
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }
  
  /**
   * Set the active tab
   */
  setActiveTab(tab: 'overview' | 'membership' | 'attendance' | 'revenue' | 'classes'): void {
    this.activeTab = tab;
    
    // Reinitialize charts when tab changes
    setTimeout(() => this.initializeCharts(), 100);
  }
  
  /**
   * Toggle the date range dropdown
   */
  toggleDateRangeDropdown(): void {
    this.showDateRangeDropdown = !this.showDateRangeDropdown;
  }
  
  /**
   * Set the date range
   */
  setDateRange(range: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom'): void {
    this.selectedDateRange = range;
    
    const today = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (range) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = startDate;
        break;
      case 'thisWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = today;
        break;
      case 'lastWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 7);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'custom':
        // Keep existing custom dates
        return;
    }
    
    this.customStartDate = this.formatDate(startDate);
    this.customEndDate = this.formatDate(endDate);
  }
  
  /**
   * Format date
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Get date range text
   */
  getDateRangeText(): string {
    switch (this.selectedDateRange) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'thisWeek':
        return 'This Week';
      case 'lastWeek':
        return 'Last Week';
      case 'thisMonth':
        return 'This Month';
      case 'lastMonth':
        return 'Last Month';
      case 'custom':
        return `${this.customStartDate} - ${this.customEndDate}`;
      default:
        return 'Select Date Range';
    }
  }
  
  /**
   * Update custom date range
   */
  updateCustomDateRange(): void {
    // Validate dates
    const startDate = new Date(this.customStartDate);
    const endDate = new Date(this.customEndDate);
    
    if (endDate < startDate) {
      // If end date is before start date, set end date to start date
      this.customEndDate = this.customStartDate;
    }
  }
  
  /**
   * Apply date range
   */
  applyDateRange(): void {
    // Close dropdown
    this.showDateRangeDropdown = false;
    
    // In a real application, you would fetch data based on the date range
    // For now, we'll just reinitialize the charts
    this.initializeCharts();
    
    // Apply filters
    this.applyMembershipFilters();
    this.applyClassFilters();
  }
  
  /**
   * Apply membership filters
   */
  applyMembershipFilters(): void {
    // Filter members based on type and status
    this.filteredMembers = this.members.filter(member => {
      const typeMatch = this.membershipTypeFilter === 'all' || member.type.toLowerCase() === this.membershipTypeFilter;
      const statusMatch = this.membershipStatusFilter === 'all' || member.status === this.membershipStatusFilter;
      const searchMatch = !this.memberSearchQuery || 
                         member.name.toLowerCase().includes(this.memberSearchQuery.toLowerCase());
      
      return typeMatch && statusMatch && searchMatch;
    });
    
    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredMembers.length / this.itemsPerPage);
    
    // Reset to first page if current page is out of bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }
  
  /**
   * Apply class filters
   */
  applyClassFilters(): void {
    // Filter classes based on type and instructor
    this.filteredClasses = this.classPerformance.filter(classItem => {
      const typeMatch = this.classTypeFilter === 'all' || classItem.type === this.classTypeFilter;
      const instructorMatch = this.instructorFilter === 'all' || 
                            classItem.instructor.toLowerCase().includes(this.instructorFilter);
      
      return typeMatch && instructorMatch;
    });
  }
  
  /**
   * Search members
   */
  searchMembers(): void {
    this.applyMembershipFilters();
  }
  
  /**
   * Go to page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  /**
   * Export reports
   */
  exportReports(): void {
    // In a real application, you would generate a CSV or PDF file
    // For now, we'll just log a message
    console.log('Exporting reports...');
    alert('Reports exported successfully!');
  }
  
  /**
   * Print reports
   */
  printReports(): void {
    window.print();
  }
  
  /**
   * Initialize all charts
   */
  initializeCharts(): void {
    // Only initialize charts for the active tab
    switch (this.activeTab) {
      case 'overview':
        ChartMethods.initRevenueChart(this.charts, this.chartColors);
        ChartMethods.initAttendanceChart(this.charts, this.chartColors);
        ChartMethods.initMembershipChart(this.charts, this.chartColors);
        ChartMethods.initClassTimesChart(this.charts, this.chartColors);
        break;
      case 'membership':
        ChartMethods.initMembershipDistributionChart(this.charts, this.chartColors);
        ChartMethods.initMembershipGrowthChart(this.charts, this.chartColors);
        break;
      case 'attendance':
        ChartMethods.initDailyAttendanceChart(this.charts, this.chartColors);
        ChartMethods.initPeakHoursChart(this.charts, this.chartColors);
        ChartMethods.initAttendanceByDayChart(this.charts, this.chartColors);
        ChartMethods.initClassVsGeneralChart(this.charts, this.chartColors);
        break;
      case 'revenue':
        ChartMethods.initRevenueTrendsChart(this.charts, this.chartColors);
        ChartMethods.initRevenueBySourceChart(this.charts, this.chartColors);
        ChartMethods.initRevenueByMembershipChart(this.charts, this.chartColors);
        ChartMethods.initMonthlyComparisonChart(this.charts, this.chartColors);
        break;
      case 'classes':
        ChartMethods.initClassAttendanceChart(this.charts, this.chartColors);
        ChartMethods.initClassPopularityChart(this.charts, this.chartColors);
        break;
    }
  }
}
