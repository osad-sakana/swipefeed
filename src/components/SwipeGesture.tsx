import React, { ReactNode, useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue } from 'framer-motion';
import styled from 'styled-components';
import { SwipeAction } from '@/types';
import { useAppContext } from '@/context/AppContext';
import {
  SWIPE_CONFIG,
  getSwipeAction,
} from '@/utils/swipeUtils';

interface SwipeGestureProps {
  children: ReactNode;
  onSwipeAction: (action: SwipeAction) => void;
  disabled?: boolean;
}

export function SwipeGesture({ 
  children, 
  onSwipeAction, 
  disabled = false,
}: SwipeGestureProps): JSX.Element {
  const { theme, settings } = useAppContext();
  
  const x = useMotionValue(0);
  const [leftOpacity, setLeftOpacity] = useState(0);
  const [rightOpacity, setRightOpacity] = useState(0);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    const adjustedX = info.offset.x * settings.swipeSensitivity;
    
    // Update background opacity based on drag distance
    const maxDistance = 200;
    const progress = Math.min(Math.abs(adjustedX) / maxDistance, 1);
    
    if (adjustedX > 0) {
      setRightOpacity(progress);
      setLeftOpacity(0);
    } else {
      setLeftOpacity(progress);
      setRightOpacity(0);
    }
  };

  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    const adjustedTranslateX = info.offset.x * settings.swipeSensitivity;
    const adjustedVelocity = info.velocity.x * settings.swipeSensitivity;
    
    const action = getSwipeAction(adjustedTranslateX, adjustedVelocity);
    
    // Clear any existing timeout
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
    }
    
    // Always reset to center position
    x.set(0);
    
    // Reset opacity immediately
    setLeftOpacity(0);
    setRightOpacity(0);
    
    if (action) {
      // Execute action for next article
      onSwipeAction(action);
    }
  };

  return (
    <Container>
      {/* Left swipe background (read) */}
      <SwipeBackground 
        style={{ opacity: leftOpacity }}
        color={theme.colors.success}
        align="right"
      >
        <ActionContent>
          ✓
        </ActionContent>
      </SwipeBackground>

      {/* Right swipe background (bookmark) */}
      <SwipeBackground 
        style={{ opacity: rightOpacity }}
        color={theme.colors.warning}
        align="left"
      >
        <ActionContent>
          📖
        </ActionContent>
      </SwipeBackground>

      {/* Main card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -400, right: 400 }}
        dragElastic={0.2}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ 
          x,
          zIndex: 1,
          height: '100%',
          cursor: disabled ? 'default' : 'grab'
        }}
        whileDrag={{ cursor: 'grabbing' }}
        initial={{ x: 0 }}
      >
        {children}
      </motion.div>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const SwipeBackground = styled.div<{ color: string; align: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  background-color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: ${props => props.align === 'left' ? 'flex-start' : 'flex-end'};
  padding: ${props => props.align === 'left' ? '0 0 0 30px' : '0 30px 0 0'};
  z-index: 0;
`;

const ActionContent = styled.div`
  font-size: 48px;
`;