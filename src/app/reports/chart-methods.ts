// Chart initialization methods for Reports component
import { Chart } from 'chart.js';

// Define types for charts and chartColors
interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  info: string;
  warning: string;
  danger: string;
  purple: string;
  pink: string;
  indigo: string;
  teal: string;
  orange: string;
  chartBackground: string[];
}

/**
 * Initialize Revenue Chart
 */
export function initRevenueChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['revenueChart']) {
    charts['revenueChart'].destroy();
  }
  
  charts['revenueChart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Membership',
        data: [8500, 9200, 9800, 10200, 9850, 10500],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.primary,
        borderWidth: 1
      }, {
        label: 'Classes',
        data: [1200, 1350, 1500, 1650, 1800, 2000],
        backgroundColor: chartColors.success,
        borderColor: chartColors.success,
        borderWidth: 1
      }, {
        label: 'Other',
        data: [600, 550, 700, 750, 800, 850],
        backgroundColor: chartColors.info,
        borderColor: chartColors.info,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Attendance Chart
 */
export function initAttendanceChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('attendanceChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['attendanceChart']) {
    charts['attendanceChart'].destroy();
  }
  
  charts['attendanceChart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'This Week',
        data: [38, 45, 42, 50, 55, 40, 30],
        fill: false,
        borderColor: chartColors.primary,
        tension: 0.1
      }, {
        label: 'Last Week',
        data: [35, 42, 40, 45, 50, 38, 28],
        fill: false,
        borderColor: chartColors.secondary,
        borderDash: [5, 5],
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Membership Chart
 */
export function initMembershipChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('membershipChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['membershipChart']) {
    charts['membershipChart'].destroy();
  }
  
  charts['membershipChart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'New Members',
        data: [15, 20, 18, 25, 22, 30],
        fill: true,
        backgroundColor: 'rgba(67, 97, 238, 0.2)',
        borderColor: chartColors.primary,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Class Times Chart
 */
export function initClassTimesChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('classTimesChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['classTimesChart']) {
    charts['classTimesChart'].destroy();
  }
  
  charts['classTimesChart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['6-8 AM', '8-10 AM', '10-12 PM', '12-2 PM', '2-4 PM', '4-6 PM', '6-8 PM', '8-10 PM'],
      datasets: [{
        label: 'Attendance',
        data: [25, 35, 20, 15, 18, 40, 55, 30],
        backgroundColor: chartColors.chartBackground,
        borderColor: chartColors.chartBackground,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Membership Distribution Chart
 */
export function initMembershipDistributionChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('membershipDistributionChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['membershipDistributionChart']) {
    charts['membershipDistributionChart'].destroy();
  }
  
  charts['membershipDistributionChart'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Premium', 'Standard', 'Family'],
      datasets: [{
        label: 'Members',
        data: [120, 80, 48],
        backgroundColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.warning
        ],
        borderColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.warning
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        }
      }
    }
  });
}

/**
 * Initialize Membership Growth Chart
 */
export function initMembershipGrowthChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('membershipGrowthChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['membershipGrowthChart']) {
    charts['membershipGrowthChart'].destroy();
  }
  
  charts['membershipGrowthChart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Premium',
        data: [90, 95, 100, 110, 115, 120],
        fill: false,
        borderColor: chartColors.primary,
        tension: 0.1
      }, {
        label: 'Standard',
        data: [60, 65, 70, 72, 75, 80],
        fill: false,
        borderColor: chartColors.success,
        tension: 0.1
      }, {
        label: 'Family',
        data: [30, 35, 38, 42, 45, 48],
        fill: false,
        borderColor: chartColors.warning,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Daily Attendance Chart
 */
export function initDailyAttendanceChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('dailyAttendanceChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['dailyAttendanceChart']) {
    charts['dailyAttendanceChart'].destroy();
  }
  
  charts['dailyAttendanceChart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
      datasets: [{
        label: 'Daily Attendance',
        data: [42, 45, 48, 40, 35, 30, 28, 45, 50, 52, 48, 45, 42, 38, 35, 42, 45, 48, 50, 55, 58, 52, 48, 45, 42, 40, 38, 42, 45, 48],
        fill: true,
        backgroundColor: 'rgba(67, 97, 238, 0.2)',
        borderColor: chartColors.primary,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Peak Hours Chart
 */
export function initPeakHoursChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('peakHoursChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['peakHoursChart']) {
    charts['peakHoursChart'].destroy();
  }
  
  charts['peakHoursChart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'],
      datasets: [{
        label: 'Average Attendance',
        data: [8, 12, 18, 22, 15, 10, 12, 15, 10, 8, 15, 25, 35, 30, 20, 10],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.primary,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Attendance By Day Chart
 */
export function initAttendanceByDayChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('attendanceByDayChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['attendanceByDayChart']) {
    charts['attendanceByDayChart'].destroy();
  }
  
  charts['attendanceByDayChart'] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      datasets: [{
        label: 'Average Attendance',
        data: [42, 48, 45, 50, 55, 40, 30],
        fill: true,
        backgroundColor: 'rgba(67, 97, 238, 0.2)',
        borderColor: chartColors.primary,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartColors.primary
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        r: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Class vs General Chart
 */
export function initClassVsGeneralChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('classVsGeneralChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['classVsGeneralChart']) {
    charts['classVsGeneralChart'].destroy();
  }
  
  charts['classVsGeneralChart'] = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Class Attendance', 'General Gym Use'],
      datasets: [{
        label: 'Attendance',
        data: [64, 36],
        backgroundColor: [
          chartColors.primary,
          chartColors.success
        ],
        borderColor: [
          chartColors.primary,
          chartColors.success
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      }
    }
  });
}

/**
 * Initialize Revenue Trends Chart
 */
export function initRevenueTrendsChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('revenueTrendsChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['revenueTrendsChart']) {
    charts['revenueTrendsChart'].destroy();
  }
  
  charts['revenueTrendsChart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [10300, 11100, 12000, 12600, 12450, 13350],
        fill: true,
        backgroundColor: 'rgba(67, 97, 238, 0.2)',
        borderColor: chartColors.primary,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Revenue By Source Chart
 */
export function initRevenueBySourceChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('revenueBySourceChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['revenueBySourceChart']) {
    charts['revenueBySourceChart'].destroy();
  }
  
  charts['revenueBySourceChart'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Memberships', 'Classes', 'Personal Training', 'Merchandise', 'Other'],
      datasets: [{
        label: 'Revenue',
        data: [9850, 1800, 500, 200, 100],
        backgroundColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.warning,
          chartColors.info,
          chartColors.secondary
        ],
        borderColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.warning,
          chartColors.info,
          chartColors.secondary
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        }
      }
    }
  });
}

/**
 * Initialize Revenue By Membership Chart
 */
export function initRevenueByMembershipChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('revenueByMembershipChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['revenueByMembershipChart']) {
    charts['revenueByMembershipChart'].destroy();
  }
  
  charts['revenueByMembershipChart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Premium', 'Standard', 'Family'],
      datasets: [{
        label: 'Revenue',
        data: [4800, 2250, 2800],
        backgroundColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.warning
        ],
        borderColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.warning
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Monthly Comparison Chart
 */
export function initMonthlyComparisonChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('monthlyComparisonChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['monthlyComparisonChart']) {
    charts['monthlyComparisonChart'].destroy();
  }
  
  charts['monthlyComparisonChart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'This Year',
        data: [10300, 11100, 12000, 12600, 12450, 13350],
        backgroundColor: chartColors.primary,
        borderColor: chartColors.primary,
        borderWidth: 1
      }, {
        label: 'Last Year',
        data: [9500, 10200, 11000, 11500, 11800, 12500],
        backgroundColor: chartColors.secondary,
        borderColor: chartColors.secondary,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Class Attendance Chart
 */
export function initClassAttendanceChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('classAttendanceChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['classAttendanceChart']) {
    charts['classAttendanceChart'].destroy();
  }
  
  charts['classAttendanceChart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Yoga',
        data: [10, 12, 11, 10],
        fill: false,
        borderColor: chartColors.primary,
        tension: 0.1
      }, {
        label: 'HIIT',
        data: [12, 13, 14, 12],
        fill: false,
        borderColor: chartColors.success,
        tension: 0.1
      }, {
        label: 'Spin',
        data: [18, 17, 19, 18],
        fill: false,
        borderColor: chartColors.warning,
        tension: 0.1
      }, {
        label: 'Strength',
        data: [12, 14, 13, 12],
        fill: false,
        borderColor: chartColors.info,
        tension: 0.1
      }, {
        label: 'Pilates',
        data: [8, 9, 8, 8],
        fill: false,
        borderColor: chartColors.secondary,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Initialize Class Popularity Chart
 */
export function initClassPopularityChart(charts: { [key: string]: Chart }, chartColors: ChartColors): void {
  const ctx = document.getElementById('classPopularityChart') as HTMLCanvasElement;
  if (!ctx) return;
  
  if (charts['classPopularityChart']) {
    charts['classPopularityChart'].destroy();
  }
  
  charts['classPopularityChart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Spin Class', 'HIIT Training', 'Advanced Weightlifting', 'Morning Yoga', 'Core Pilates', 'Beginner Strength'],
      datasets: [{
        label: 'Capacity %',
        data: [90, 80, 80, 83, 80, 67],
        backgroundColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.info,
          chartColors.warning,
          chartColors.secondary,
          chartColors.purple
        ],
        borderColor: [
          chartColors.primary,
          chartColors.success,
          chartColors.info,
          chartColors.warning,
          chartColors.secondary,
          chartColors.purple
        ],
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}
