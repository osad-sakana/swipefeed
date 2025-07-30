import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SwipeAction } from '@/types';
import { useAppContext } from '@/context/AppContext';
import {
  SWIPE_CONFIG,
  getSwipeAction,
  calculateSwipeTransform,
  calculateBackgroundOpacity,
  shouldShowActionHint,
  getHapticFeedbackType,
} from '@/utils/swipeUtils';

interface SwipeGestureProps {
  children: ReactNode;
  onSwipeAction: (action: SwipeAction) => void;
  disabled?: boolean;
  style?: any;
}

export function SwipeGesture({ 
  children, 
  onSwipeAction, 
  disabled = false,
  style 
}: SwipeGestureProps): JSX.Element {
  const { theme, settings } = useAppContext();
  
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const leftBackgroundOpacity = useSharedValue(0);
  const rightBackgroundOpacity = useSharedValue(0);
  
  const hapticTriggered = useSharedValue(false);

  const triggerHaptic = (action: SwipeAction): void => {
    if (hapticTriggered.value) return;
    
    const feedbackType = getHapticFeedbackType(action);
    switch (feedbackType) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
    
    hapticTriggered.value = true;
  };

  const resetAnimation = (): void => {
    'worklet';
    translateX.value = withSpring(0, SWIPE_CONFIG.SPRING_CONFIG);
    scale.value = withSpring(1, SWIPE_CONFIG.SPRING_CONFIG);
    opacity.value = withSpring(1, SWIPE_CONFIG.SPRING_CONFIG);
    rotation.value = withSpring(0, SWIPE_CONFIG.SPRING_CONFIG);
    leftBackgroundOpacity.value = withTiming(0, { duration: 200 });
    rightBackgroundOpacity.value = withTiming(0, { duration: 200 });
    hapticTriggered.value = false;
  };

  const executeSwipeAction = (action: SwipeAction): void => {
    'worklet';
    
    // Animate card off screen
    const targetX = action.direction === 'left' ? -1000 : 1000;
    translateX.value = withTiming(targetX, { duration: SWIPE_CONFIG.ANIMATION_DURATION });
    scale.value = withTiming(0.8, { duration: SWIPE_CONFIG.ANIMATION_DURATION });
    opacity.value = withTiming(0, { duration: SWIPE_CONFIG.ANIMATION_DURATION });
    
    // Execute the action after animation
    setTimeout(() => {
      runOnJS(onSwipeAction)(action);
      // Reset values for next card
      translateX.value = 0;
      scale.value = 1;
      opacity.value = 1;
      rotation.value = 0;
      leftBackgroundOpacity.value = 0;
      rightBackgroundOpacity.value = 0;
      hapticTriggered.value = false;
    }, SWIPE_CONFIG.ANIMATION_DURATION);
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      hapticTriggered.value = false;
    },
    
    onActive: (event) => {
      if (disabled) return;
      
      // Apply sensitivity setting
      const adjustedTranslateX = event.translationX * settings.swipeSensitivity;
      translateX.value = adjustedTranslateX;
      
      // Calculate transform values
      const transform = calculateSwipeTransform(adjustedTranslateX);
      scale.value = transform.scale;
      opacity.value = transform.opacity;
      rotation.value = transform.rotation;
      
      // Calculate background opacity
      const backgroundOpacity = calculateBackgroundOpacity(adjustedTranslateX);
      leftBackgroundOpacity.value = backgroundOpacity.leftOpacity;
      rightBackgroundOpacity.value = backgroundOpacity.rightOpacity;
      
      // Check if we should show action hint and trigger haptic
      const { showHint } = shouldShowActionHint(adjustedTranslateX);
      if (showHint && !hapticTriggered.value) {
        const action = getSwipeAction(adjustedTranslateX, event.velocityX);
        if (action) {
          runOnJS(triggerHaptic)(action);
        }
      }
    },
    
    onEnd: (event) => {
      if (disabled) {
        resetAnimation();
        return;
      }
      
      const adjustedTranslateX = event.translationX * settings.swipeSensitivity;
      const adjustedVelocity = event.velocityX * settings.swipeSensitivity;
      
      const action = getSwipeAction(adjustedTranslateX, adjustedVelocity);
      
      if (action) {
        executeSwipeAction(action);
      } else {
        resetAnimation();
      }
    },
  });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const leftBackgroundStyle = useAnimatedStyle(() => ({
    opacity: leftBackgroundOpacity.value,
  }));

  const rightBackgroundStyle = useAnimatedStyle(() => ({
    opacity: rightBackgroundOpacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      {/* Left swipe background (bookmark) */}
      <Animated.View 
        style={[
          styles.swipeBackground, 
          styles.leftBackground,
          { backgroundColor: theme.colors.warning },
          leftBackgroundStyle
        ]}
      >
        <View style={styles.actionContent}>
          {/* Icon and text would go here */}
        </View>
      </Animated.View>

      {/* Right swipe background (read) */}
      <Animated.View 
        style={[
          styles.swipeBackground, 
          styles.rightBackground,
          { backgroundColor: theme.colors.success },
          rightBackgroundStyle
        ]}
      >
        <View style={styles.actionContent}>
          {/* Icon and text would go here */}
        </View>
      </Animated.View>

      {/* Main card content */}
      <PanGestureHandler onGestureEvent={gestureHandler} enabled={!disabled}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  card: {
    flex: 1,
    zIndex: 1,
  },
  swipeBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    zIndex: 0,
  },
  leftBackground: {
    alignItems: 'flex-end',
    paddingRight: 30,
  },
  rightBackground: {
    alignItems: 'flex-start',
    paddingLeft: 30,
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});