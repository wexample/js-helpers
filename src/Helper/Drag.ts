export type DragAxis = 'x' | 'y';

export interface DragAxisOptions {
  // The element the pointer grabs.
  handle: HTMLElement;
  // Which way the pointer is followed: the other one is ignored.
  axis: DragAxis;
  // The size the drag starts from, read when it starts and not before: what is
  // being dragged may have been resized by something else in between.
  start: () => number;
  // Which way the pointer has to travel for the size to grow. A handle on the
  // far edge of what it sizes grows with the pointer, one on the near edge
  // against it.
  direction?: 1 | -1;
  min?: () => number;
  max?: () => number;
  // Called on every move with the size asked for, already kept within bounds.
  onMove: (size: number) => void;
  // Called once when the pointer is let go, with the size it settled on. Where
  // a size is written down, this is where to write it: the moves in between are
  // a gesture, not a decision.
  onEnd?: (size: number) => void;
}

// Follows a pointer along one axis and answers with a size.
//
// The pointer is captured on the handle, so the gesture survives leaving the
// element, the window, or passing over an iframe — which is what a handle a few
// pixels wide needs. Pointer events and not mouse ones, so a pen and a finger
// do the same thing as a mouse.
//
// Returns the function that detaches it.
export function dragAxis(options: DragAxisOptions): () => void {
  const { handle, axis, start, onMove, onEnd } = options;
  const direction = options.direction ?? 1;

  let pointerId: number | null = null;
  let origin = 0;
  let originSize = 0;
  let current = 0;
  let bodyUserSelect = '';

  const coordinate = (event: PointerEvent): number => (axis === 'x' ? event.clientX : event.clientY);

  const clamp = (size: number): number => {
    const min = options.min ? options.min() : 0;
    const max = options.max ? options.max() : Number.POSITIVE_INFINITY;
    return Math.min(Math.max(size, min), Math.max(min, max));
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (pointerId !== null || event.button !== 0) {
      return;
    }

    event.preventDefault();

    pointerId = event.pointerId;
    origin = coordinate(event);
    originSize = start();
    current = originSize;

    handle.setPointerCapture(pointerId);

    // A drag that selects the text it passes over is a drag that looks broken.
    bodyUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) {
      return;
    }

    current = clamp(originSize + (coordinate(event) - origin) * direction);
    onMove(current);
  };

  const onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) {
      return;
    }

    handle.releasePointerCapture(pointerId);
    pointerId = null;

    document.body.style.userSelect = bodyUserSelect;

    handle.removeEventListener('pointermove', onPointerMove);
    handle.removeEventListener('pointerup', onPointerUp);
    handle.removeEventListener('pointercancel', onPointerUp);

    onEnd?.(current);
  };

  handle.addEventListener('pointerdown', onPointerDown);

  return (): void => {
    handle.removeEventListener('pointerdown', onPointerDown);
    handle.removeEventListener('pointermove', onPointerMove);
    handle.removeEventListener('pointerup', onPointerUp);
    handle.removeEventListener('pointercancel', onPointerUp);
  };
}
