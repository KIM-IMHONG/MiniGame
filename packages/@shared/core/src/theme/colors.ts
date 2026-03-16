export const colors = {
  // 배경
  background: {
    primary: '#0F0F1E',
    secondary: '#1A1A2E',
    tertiary: '#16213E',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // 텍스트
  text: {
    primary: '#FFFFFF',
    secondary: '#B8B8CC',
    muted: '#666680',
    accent: '#FFD700',
  },

  // 게임 UI
  ui: {
    primary: '#6C63FF',
    primaryDark: '#5548CC',
    secondary: '#FF6584',
    success: '#2ED573',
    warning: '#FFA502',
    danger: '#FF4757',
    info: '#3742FA',
  },

  // 버튼
  button: {
    primary: '#6C63FF',
    primaryPressed: '#5548CC',
    secondary: '#2D2D44',
    secondaryPressed: '#3D3D55',
    danger: '#FF4757',
    reward: '#FFD700',
    rewardPressed: '#E6C200',
  },

  // 보더
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
  },
} as const;

export type Colors = typeof colors;
