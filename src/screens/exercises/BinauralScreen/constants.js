// Constants for BinauralScreen
export const FREQUENCIES = [
  { 
    value: 'focus', 
    label: 'Focus (Beta)', 
    description: 'Enhance concentration and mental alertness',
    details: 'Beta waves (15-30 Hz) stimulate focus and concentration for productive work',
    duration: 600,
    icon: 'brain',
    color: '#4C63B6',
    gradient: ['#4C63B6', '#3F51B5'],
    frequency: 20, // Beta wave middle frequency in Hz
  },
  { 
    value: 'relax', 
    label: 'Relax (Alpha)', 
    description: 'Promote relaxation and reduce stress',
    details: 'Alpha waves (8-14 Hz) induce a calm, relaxed state while remaining alert',
    duration: 900,
    icon: 'waves',
    color: '#7D8CC4',
    gradient: ['#7D8CC4', '#5C6BC0'],
    frequency: 10, // Alpha wave middle frequency in Hz
  },
  { 
    value: 'meditate', 
    label: 'Meditate (Theta)', 
    description: 'Deep meditation and creativity',
    details: 'Theta waves (4-8 Hz) create a deeply meditative state for spiritual awareness',
    duration: 1200,
    icon: 'meditation',
    color: '#6A8EAE',
    gradient: ['#6A8EAE', '#4A6B8A'],
    frequency: 6, // Theta wave middle frequency in Hz
  },
]; 