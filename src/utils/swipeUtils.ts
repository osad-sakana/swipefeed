import { SwipeAction } from '@/types';

const SCREEN_WIDTH = window.innerWidth;

export const SWIPE_CONFIG = {
  THRESHOLD: SCREEN_WIDTH * 0.3, // 30% of screen width
  VELOCITY_THRESHOLD: 500, // minimum velocity to trigger swipe
  ANIMATION_DURATION: 250, // milliseconds
  SPRING_CONFIG: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
  SCALE_FACTOR: 0.05, // how much the card scales during swipe
  OPACITY_FACTOR: 0.3, // how much opacity changes during swipe
} as const;

export const SWIPE_ACTIONS: Record<'left' | 'right', SwipeAction> = {
  left: {
    type: 'bookmark',
    direction: 'left',
    threshold: -SWIPE_CONFIG.THRESHOLD,
  },
  right: {
    type: 'read',
    direction: 'right',
    threshold: SWIPE_CONFIG.THRESHOLD,
  },
} as const;

export function calculateSwipeProgress(translateX: number): number {
  const progress = Math.abs(translateX) / SWIPE_CONFIG.THRESHOLD;
  return Math.min(progress, 1);
}

export function getSwipeAction(translateX: number, velocity: number): SwipeAction | null {
  const absTranslateX = Math.abs(translateX);
  const absVelocity = Math.abs(velocity);

  // Check if velocity is high enough for immediate action
  if (absVelocity > SWIPE_CONFIG.VELOCITY_THRESHOLD) {
    if (translateX > 0) {
      return SWIPE_ACTIONS.right;
    } else if (translateX < 0) {
      return SWIPE_ACTIONS.left;
    }
  }

  // Check if distance threshold is met
  if (absTranslateX > SWIPE_CONFIG.THRESHOLD) {
    if (translateX > 0) {
      return SWIPE_ACTIONS.right;
    } else if (translateX < 0) {
      return SWIPE_ACTIONS.left;
    }
  }

  return null;
}

export function calculateSwipeTransform(translateX: number): {
  scale: number;
  opacity: number;
  rotation: number;
} {
  const progress = calculateSwipeProgress(translateX);
  
  return {
    scale: 1 - (progress * SWIPE_CONFIG.SCALE_FACTOR),
    opacity: 1 - (progress * SWIPE_CONFIG.OPACITY_FACTOR),
    rotation: (translateX / SCREEN_WIDTH) * 15, // Max 15 degrees rotation
  };
}

export function getActionColor(direction: 'left' | 'right', theme: any): string {
  switch (direction) {
    case 'left': // bookmark
      return theme.colors.warning;
    case 'right': // read
      return theme.colors.success;
    default:
      return theme.colors.border;
  }
}

export function getActionIcon(direction: 'left' | 'right'): string {
  switch (direction) {
    case 'left': // bookmark
      return 'bookmark';
    case 'right': // read
      return 'check';
    default:
      return 'help';
  }
}

export function getActionText(direction: 'left' | 'right'): string {
  switch (direction) {
    case 'left': // bookmark
      return 'Bookmark';
    case 'right': // read
      return 'Mark as Read';
    default:
      return '';
  }
}

export function shouldShowActionHint(translateX: number): {
  showHint: boolean;
  direction?: 'left' | 'right' | undefined;
  progress: number;
} {
  const progress = calculateSwipeProgress(translateX);
  const showHint = progress > 0.2; // Show hint when 20% through
  
  let direction: 'left' | 'right' | undefined;
  if (showHint) {
    direction = translateX > 0 ? 'right' : 'left';
  }
  
  return {
    showHint,
    direction,
    progress,
  };
}

export function interpolateColor(
  progress: number,
  startColor: string,
  endColor: string
): string {
  // Simple color interpolation - in a real app, you might want to use a library
  // For now, return the end color when progress > 0.5
  return progress > 0.5 ? endColor : startColor;
}

export function calculateBackgroundOpacity(translateX: number): {
  leftOpacity: number;
  rightOpacity: number;
} {
  const progress = calculateSwipeProgress(translateX);
  
  if (translateX > 0) {
    // Swiping right
    return {
      leftOpacity: 0,
      rightOpacity: progress,
    };
  } else if (translateX < 0) {
    // Swiping left
    return {
      leftOpacity: progress,
      rightOpacity: 0,
    };
  }
  
  return {
    leftOpacity: 0,
    rightOpacity: 0,
  };
}

export function getHapticFeedbackType(action: SwipeAction): 'light' | 'medium' | 'heavy' {
  switch (action.type) {
    case 'read':
      return 'light';
    case 'bookmark':
      return 'medium';
    default:
      return 'light';
  }
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateSwipeVelocity(
  deltaX: number,
  deltaTime: number
): number {
  if (deltaTime === 0) return 0;
  return deltaX / deltaTime;
}

export function shouldCancelSwipe(translateX: number, velocity: number): boolean {
  const action = getSwipeAction(translateX, velocity);
  return action === null;
}