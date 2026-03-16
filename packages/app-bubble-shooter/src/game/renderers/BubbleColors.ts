import type { BubbleColor } from '../types';

export const BUBBLE_RENDER_COLORS: Record<BubbleColor, { main: string; light: string; dark: string }> = {
  red:    { main: '#FF4757', light: '#FF6B7A', dark: '#CC3945' },
  blue:   { main: '#3742FA', light: '#5B63FB', dark: '#2C35C8' },
  green:  { main: '#2ED573', light: '#58DE91', dark: '#25AA5C' },
  yellow: { main: '#FFA502', light: '#FFB733', dark: '#CC8402' },
  purple: { main: '#A55EEA', light: '#B97AEE', dark: '#843EBB' },
  orange: { main: '#FF6348', light: '#FF856D', dark: '#CC4F3A' },
};
