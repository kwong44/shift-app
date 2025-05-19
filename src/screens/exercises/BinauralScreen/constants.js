import { COLORS } from '../../../config/theme';

// Constants for BinauralScreen
export const FREQUENCIES = {
  focus: {
    name: 'Focus',
    description: 'Enhance concentration and mental clarity',
    frequency: 15,
    baseFrequency: 200,
    duration: 1200, // 20 minutes
    waveform: 'sine',
    category: 'Beta',
    // Reference to audio file will be added later by user
    // audioFile: require('../../../../assets/audio/binaural-15hz.mp3'),
  },
  meditation: {
    name: 'Meditation',
    description: 'Deep relaxation and mindfulness',
    frequency: 6,
    baseFrequency: 180,
    duration: 900, // 15 minutes
    waveform: 'sine',
    category: 'Theta',
    // audioFile: require('../../../../assets/audio/binaural-6hz.mp3'),
  },
  creativity: {
    name: 'Creativity',
    description: 'Boost creative thinking and flow state',
    frequency: 8,
    baseFrequency: 160,
    duration: 1800, // 30 minutes
    waveform: 'triangle',
    category: 'Alpha',
    // audioFile: require('../../../../assets/audio/binaural-8hz.mp3'),
  },
  sleep: {
    name: 'Sleep',
    description: 'Aid in falling asleep and better rest',
    frequency: 4,
    baseFrequency: 140,
    duration: 1800, // 30 minutes
    waveform: 'sine',
    category: 'Theta',
    // audioFile: require('../../../../assets/audio/binaural-4hz.mp3'),
  },
};

// Available waveform types
export const WAVEFORM_TYPES = [
  { id: 'sine', label: 'Sine Wave', description: 'Smooth and pure tone' },
  { id: 'triangle', label: 'Triangle Wave', description: 'Warmer with more harmonics' },
  { id: 'square', label: 'Square Wave', description: 'Rich and harsh with strong harmonics' },
  { id: 'sawtooth', label: 'Sawtooth Wave', description: 'Bright and buzzy sound' },
];

// Binaural beat frequency ranges and their effects
export const FREQUENCY_RANGES = [
  { range: '0.5-4 Hz', name: 'Delta', description: 'Deep sleep, healing' },
  { range: '4-8 Hz', name: 'Theta', description: 'Meditation, REM sleep' },
  { range: '8-14 Hz', name: 'Alpha', description: 'Relaxation, creativity' },
  { range: '14-30 Hz', name: 'Beta', description: 'Focus, alertness' },
  { range: '30-100 Hz', name: 'Gamma', description: 'Cognitive processing' },
]; 