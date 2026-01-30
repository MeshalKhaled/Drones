"use client";

import { useCallback, useRef, useState } from "react";

/**
 * R-094/R-158: Touch Gesture Hooks for Mobile Interactions
 *
 * Provides swipe gestures and pinch-zoom support for touch devices.
 */

export type SwipeDirection = "left" | "right" | "up" | "down";

interface SwipeState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
}

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
}

interface SwipeOptions {
  threshold?: number; // Minimum distance for swipe (default: 50px)
  maxTime?: number; // Maximum time for swipe (default: 300ms)
  preventScroll?: boolean; // Prevent default scroll behavior
}

interface UseSwipeResult {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  swiping: boolean;
  direction: SwipeDirection | null;
}

/**
 * Hook for detecting swipe gestures
 */
export function useSwipe(handlers: SwipeHandlers, options: SwipeOptions = {}): UseSwipeResult {
  const { threshold = 50, maxTime = 300, preventScroll = false } = options;

  const [swiping, setSwiping] = useState(false);
  const [direction, setDirection] = useState<SwipeDirection | null>(null);
  const stateRef = useRef<SwipeState | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      endX: touch.clientX,
      endY: touch.clientY,
      startTime: Date.now(),
    };
    setSwiping(true);
    setDirection(null);
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!stateRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      stateRef.current.endX = touch.clientX;
      stateRef.current.endY = touch.clientY;

      if (preventScroll) {
        const deltaX = Math.abs(touch.clientX - stateRef.current.startX);
        const deltaY = Math.abs(touch.clientY - stateRef.current.startY);

        // Only prevent scroll if horizontal swipe is more significant
        if (deltaX > deltaY && deltaX > 10) {
          e.preventDefault();
        }
      }
    },
    [preventScroll]
  );

  const onTouchEnd = useCallback(() => {
    if (!stateRef.current) return;

    const { startX, startY, endX, endY, startTime } = stateRef.current;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = Date.now() - startTime;

    setSwiping(false);

    // Check if swipe is valid (within time limit)
    if (deltaTime > maxTime) {
      stateRef.current = null;
      return;
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine swipe direction
    let swipeDirection: SwipeDirection | null = null;

    if (absX > absY && absX > threshold) {
      swipeDirection = deltaX > 0 ? "right" : "left";
    } else if (absY > absX && absY > threshold) {
      swipeDirection = deltaY > 0 ? "down" : "up";
    }

    if (swipeDirection) {
      setDirection(swipeDirection);

      // Call appropriate handler
      handlers.onSwipe?.(swipeDirection);

      switch (swipeDirection) {
        case "left":
          handlers.onSwipeLeft?.();
          break;
        case "right":
          handlers.onSwipeRight?.();
          break;
        case "up":
          handlers.onSwipeUp?.();
          break;
        case "down":
          handlers.onSwipeDown?.();
          break;
      }
    }

    stateRef.current = null;
  }, [handlers, threshold, maxTime]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    swiping,
    direction,
  };
}

interface PinchState {
  initialDistance: number;
  currentDistance: number;
  centerX: number;
  centerY: number;
}

interface PinchHandlers {
  onPinchStart?: (center: { x: number; y: number }) => void;
  onPinchMove?: (scale: number, center: { x: number; y: number }) => void;
  onPinchEnd?: (scale: number) => void;
}

interface PinchOptions {
  minScale?: number;
  maxScale?: number;
}

interface UsePinchResult {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  scale: number;
  pinching: boolean;
}

/**
 * Hook for detecting pinch-zoom gestures
 */
export function usePinchZoom(handlers: PinchHandlers, options: PinchOptions = {}): UsePinchResult {
  const { minScale = 0.5, maxScale = 3 } = options;

  const [scale, setScale] = useState(1);
  const [pinching, setPinching] = useState(false);
  const stateRef = useRef<PinchState | null>(null);

  const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: React.Touch, touch2: React.Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        if (!touch1 || !touch2) return;

        const distance = getDistance(touch1, touch2);
        const center = getCenter(touch1, touch2);

        stateRef.current = {
          initialDistance: distance,
          currentDistance: distance,
          centerX: center.x,
          centerY: center.y,
        };

        setPinching(true);
        handlers.onPinchStart?.(center);
      }
    },
    [handlers]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && stateRef.current) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        if (!touch1 || !touch2) return;

        const currentDistance = getDistance(touch1, touch2);
        const center = getCenter(touch1, touch2);

        stateRef.current.currentDistance = currentDistance;
        stateRef.current.centerX = center.x;
        stateRef.current.centerY = center.y;

        const newScale = Math.min(
          maxScale,
          Math.max(minScale, currentDistance / stateRef.current.initialDistance)
        );

        setScale(newScale);
        handlers.onPinchMove?.(newScale, center);

        // Prevent default to stop page zoom
        e.preventDefault();
      }
    },
    [handlers, minScale, maxScale]
  );

  const onTouchEnd = useCallback(() => {
    if (stateRef.current && pinching) {
      handlers.onPinchEnd?.(scale);
    }
    stateRef.current = null;
    setPinching(false);
  }, [handlers, pinching, scale]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    scale,
    pinching,
  };
}

/**
 * Combined hook for both swipe and pinch gestures
 */
export function useTouchGestures(
  swipeHandlers: SwipeHandlers,
  pinchHandlers: PinchHandlers,
  options: SwipeOptions & PinchOptions = {}
) {
  const swipe = useSwipe(swipeHandlers, options);
  const pinch = usePinchZoom(pinchHandlers, options);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        pinch.onTouchStart(e);
      } else if (e.touches.length === 1) {
        swipe.onTouchStart(e);
      }
    },
    [pinch, swipe]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        pinch.onTouchMove(e);
      } else if (e.touches.length === 1) {
        swipe.onTouchMove(e);
      }
    },
    [pinch, swipe]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      pinch.onTouchEnd();
      swipe.onTouchEnd(e);
    },
    [pinch, swipe]
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    swiping: swipe.swiping,
    swipeDirection: swipe.direction,
    pinching: pinch.pinching,
    pinchScale: pinch.scale,
  };
}

/**
 * Hook for pull-to-refresh gesture
 */
interface PullToRefreshOptions {
  threshold?: number; // Distance to trigger refresh (default: 80px)
  resistance?: number; // Pull resistance factor (default: 2.5)
}

interface UsePullToRefreshResult {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  pullDistance: number;
  refreshing: boolean;
}

export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: PullToRefreshOptions = {}
): UsePullToRefreshResult {
  const { threshold = 80, resistance = 2.5 } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    // Only enable pull-to-refresh when at top of scroll
    if (window.scrollY === 0) {
      startY.current = touch.clientY;
      pulling.current = true;
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || refreshing) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaY = touch.clientY - startY.current;

      if (deltaY > 0) {
        // Apply resistance to make pull feel natural
        const distance = deltaY / resistance;
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    },
    [refreshing, resistance, threshold]
  );

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;

    pulling.current = false;

    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [pullDistance, threshold, refreshing, onRefresh]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    pullDistance,
    refreshing,
  };
}
