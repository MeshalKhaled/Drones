import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSwipe, usePinchZoom, usePullToRefresh } from "@/hooks/ui/useTouchGestures";

// Helper to create mock touch events
function createTouchEvent(
  type: "touchstart" | "touchmove" | "touchend",
  touches: Array<{ clientX: number; clientY: number }>
): React.TouchEvent {
  return {
    touches: touches.map((t, i) => ({
      ...t,
      identifier: i,
      target: document.body,
      screenX: t.clientX,
      screenY: t.clientY,
      pageX: t.clientX,
      pageY: t.clientY,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    })) as unknown as React.TouchList,
    preventDefault: vi.fn(),
    type,
  } as unknown as React.TouchEvent;
}

describe("useTouchGestures hooks", () => {
  describe("useSwipe", () => {
    it("should detect swipe left", () => {
      const onSwipeLeft = vi.fn();
      const onSwipe = vi.fn();

      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft, onSwipe }, { threshold: 50, maxTime: 500 })
      );

      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [{ clientX: 200, clientY: 100 }])
        );
      });

      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", [{ clientX: 100, clientY: 100 }]));
      });

      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", []));
      });

      expect(onSwipeLeft).toHaveBeenCalled();
      expect(onSwipe).toHaveBeenCalledWith("left");
    });

    it("should detect swipe right", () => {
      const onSwipeRight = vi.fn();

      const { result } = renderHook(() =>
        useSwipe({ onSwipeRight }, { threshold: 50, maxTime: 500 })
      );

      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [{ clientX: 100, clientY: 100 }])
        );
      });

      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", [{ clientX: 200, clientY: 100 }]));
      });

      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", []));
      });

      expect(onSwipeRight).toHaveBeenCalled();
    });

    it("should detect swipe up", () => {
      const onSwipeUp = vi.fn();

      const { result } = renderHook(() => useSwipe({ onSwipeUp }, { threshold: 50, maxTime: 500 }));

      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [{ clientX: 100, clientY: 200 }])
        );
      });

      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", [{ clientX: 100, clientY: 100 }]));
      });

      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", []));
      });

      expect(onSwipeUp).toHaveBeenCalled();
    });

    it("should detect swipe down", () => {
      const onSwipeDown = vi.fn();

      const { result } = renderHook(() =>
        useSwipe({ onSwipeDown }, { threshold: 50, maxTime: 500 })
      );

      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [{ clientX: 100, clientY: 100 }])
        );
      });

      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", [{ clientX: 100, clientY: 200 }]));
      });

      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", []));
      });

      expect(onSwipeDown).toHaveBeenCalled();
    });

    it("should not trigger swipe if distance is below threshold", () => {
      const onSwipe = vi.fn();

      const { result } = renderHook(() => useSwipe({ onSwipe }, { threshold: 50 }));

      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [{ clientX: 100, clientY: 100 }])
        );
      });

      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", [{ clientX: 120, clientY: 100 }])); // Only 20px
      });

      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", []));
      });

      expect(onSwipe).not.toHaveBeenCalled();
    });

    it("should track swiping state", () => {
      const { result } = renderHook(() => useSwipe({}));

      expect(result.current.swiping).toBe(false);

      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [{ clientX: 100, clientY: 100 }])
        );
      });

      expect(result.current.swiping).toBe(true);

      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", []));
      });

      expect(result.current.swiping).toBe(false);
    });
  });

  describe("usePinchZoom", () => {
    it("should detect pinch zoom in", () => {
      const onPinchMove = vi.fn();
      const onPinchStart = vi.fn();

      const { result } = renderHook(() => usePinchZoom({ onPinchMove, onPinchStart }));

      // Start with two fingers 100px apart
      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 100 },
          ])
        );
      });

      expect(onPinchStart).toHaveBeenCalled();
      expect(result.current.pinching).toBe(true);

      // Move fingers 200px apart (zoom in)
      act(() => {
        result.current.onTouchMove(
          createTouchEvent("touchmove", [
            { clientX: 50, clientY: 100 },
            { clientX: 250, clientY: 100 },
          ])
        );
      });

      expect(onPinchMove).toHaveBeenCalled();
      expect(result.current.scale).toBeGreaterThan(1);
    });

    it("should detect pinch zoom out", () => {
      const { result } = renderHook(() => usePinchZoom({}));

      // Start with two fingers 200px apart
      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [
            { clientX: 50, clientY: 100 },
            { clientX: 250, clientY: 100 },
          ])
        );
      });

      // Move fingers 100px apart (zoom out)
      act(() => {
        result.current.onTouchMove(
          createTouchEvent("touchmove", [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 100 },
          ])
        );
      });

      expect(result.current.scale).toBeLessThan(1);
    });

    it("should respect min/max scale limits", () => {
      const { result } = renderHook(() => usePinchZoom({}, { minScale: 0.5, maxScale: 2 }));

      // Start zoom
      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 100 },
          ])
        );
      });

      // Try to zoom way out
      act(() => {
        result.current.onTouchMove(
          createTouchEvent("touchmove", [
            { clientX: 145, clientY: 100 },
            { clientX: 155, clientY: 100 },
          ])
        );
      });

      expect(result.current.scale).toBeGreaterThanOrEqual(0.5);

      // Start fresh zoom
      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 100 },
          ])
        );
      });

      // Try to zoom way in
      act(() => {
        result.current.onTouchMove(
          createTouchEvent("touchmove", [
            { clientX: 0, clientY: 100 },
            { clientX: 400, clientY: 100 },
          ])
        );
      });

      expect(result.current.scale).toBeLessThanOrEqual(2);
    });

    it("should call onPinchEnd when touch ends", () => {
      const onPinchEnd = vi.fn();

      const { result } = renderHook(() => usePinchZoom({ onPinchEnd }));

      act(() => {
        result.current.onTouchStart(
          createTouchEvent("touchstart", [
            { clientX: 100, clientY: 100 },
            { clientX: 200, clientY: 100 },
          ])
        );
      });

      act(() => {
        result.current.onTouchEnd();
      });

      expect(onPinchEnd).toHaveBeenCalled();
      expect(result.current.pinching).toBe(false);
    });
  });

  describe("usePullToRefresh", () => {
    it("should track pull distance", () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined);

      // Mock window.scrollY
      Object.defineProperty(window, "scrollY", { value: 0, writable: true });

      const { result } = renderHook(() => usePullToRefresh(onRefresh));

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", [{ clientX: 100, clientY: 0 }]));
      });

      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", [{ clientX: 100, clientY: 100 }]));
      });

      expect(result.current.pullDistance).toBeGreaterThan(0);
    });

    it("should not enable when scrollY > 0", () => {
      const onRefresh = vi.fn().mockResolvedValue(undefined);

      Object.defineProperty(window, "scrollY", { value: 100, writable: true });

      const { result } = renderHook(() => usePullToRefresh(onRefresh));

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", [{ clientX: 100, clientY: 0 }]));
      });

      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", [{ clientX: 100, clientY: 100 }]));
      });

      expect(result.current.pullDistance).toBe(0);
    });
  });
});
