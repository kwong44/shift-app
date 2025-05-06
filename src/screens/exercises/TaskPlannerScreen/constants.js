// Constants for TaskPlannerScreen
export const PRIORITY_LEVELS = [
  { 
    value: 'high', 
    label: 'High', 
    icon: 'flag', 
    color: '#E53935',
    gradient: ['#E53935', '#C62828'],
    description: 'Tasks that need immediate attention'
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    icon: 'flag-outline', 
    color: '#FB8C00',
    gradient: ['#FB8C00', '#EF6C00'],
    description: 'Important but not urgent tasks'
  },
  { 
    value: 'low', 
    label: 'Low', 
    icon: 'flag-variant-outline', 
    color: '#43A047',
    gradient: ['#43A047', '#2E7D32'],
    description: 'Tasks to complete when time allows'
  },
]; 