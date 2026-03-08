import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import RectRing from './RectRing';
import './PhotoCloud3D.css';

interface PhotoCloud3DProps {
  images: string[];
}

const PhotoCloud3D: React.FC<PhotoCloud3DProps> = ({ images }) => {
  const [spinY, setSpinY] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openedImageUrl, setOpenedImageUrl] = useState<string | null>(null);
  const [openedImageIndex, setOpenedImageIndex] = useState<number>(0);
  const [openedSpinY, setOpenedSpinY] = useState<number>(0);
  const spinYRef = useRef(0);
  const overlayStartTimeRef = useRef(0);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const spinVelocityRef = useRef(0);
  const [isCanvasActive, setIsCanvasActive] = useState(false);
  const isCanvasActiveRef = useRef(false);

  useEffect(() => {
    isCanvasActiveRef.current = isCanvasActive;
  }, [isCanvasActive]);

  useEffect(() => {
    spinYRef.current = spinY;
  }, [spinY]);

  useEffect(() => {
    if (!openedImageUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenedImageUrl(null);
        setPendingIndex(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openedImageUrl]);

  useEffect(() => {
    if (!isCanvasActive) return;

    const handlePopState = () => {
      // While user is interacting with the canvas, bounce back navigation.
      if (!isCanvasActiveRef.current) return;
      window.history.forward();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isCanvasActive]);

  useEffect(() => {
    let rafId = 0;

    const tick = () => {
      // Apply friction so the ring slows down naturally.
      spinVelocityRef.current *= 0.9;
      if (Math.abs(spinVelocityRef.current) < 0.00001) {
        spinVelocityRef.current = 0;
      }

      if (spinVelocityRef.current !== 0) {
        setSpinY((prev) => prev + spinVelocityRef.current);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleWheelCapture: React.WheelEventHandler<HTMLDivElement> = (event) => {
    const horizontalDelta = event.deltaX;
    const normalized =
      Math.abs(horizontalDelta) < 0.01
        ? 0
        : Math.sign(horizontalDelta) * Math.min(40, Math.abs(horizontalDelta));

    const adjusted = normalized === 0 ? 0 : Math.sign(normalized) * Math.max(3, Math.abs(normalized));
    const impulse = adjusted * 0.0009;

    spinVelocityRef.current += impulse;

    if (normalized === 0) return;

    event.stopPropagation();
    event.preventDefault();
  };

  const PENDING_DURATION = 0.5;
  const OVERLAP = 0.3;
  const FULLSCREEN_DELAY = (PENDING_DURATION - OVERLAP) * 1000;

  const [pendingOpacity, setPendingOpacity] = useState(1);
  const pendingStartRef = useRef<number | null>(null);
  const pendingCancelRef = useRef(false);

  useEffect(() => {
    if (pendingIndex === null) {
      pendingStartRef.current = null;
      pendingCancelRef.current = false;
      return;
    }
    pendingCancelRef.current = false;
    pendingStartRef.current = performance.now();
    setPendingOpacity(1);

    let rafId: number;
    const tick = () => {
      if (pendingCancelRef.current) return;
      const start = pendingStartRef.current;
      if (start === null) return;
      const elapsed = (performance.now() - start) / 1000;
      if (elapsed >= PENDING_DURATION) return;

      if (elapsed >= FULLSCREEN_DELAY / 1000) {
        const overlapProgress = Math.min(
          1,
          (elapsed - FULLSCREEN_DELAY / 1000) / OVERLAP
        );
        setPendingOpacity(1 - overlapProgress);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      pendingCancelRef.current = true;
      cancelAnimationFrame(rafId);
    };
  }, [pendingIndex]);

  const handleCanvasClick = () => {
    if (openedImageUrl) {
      handleOverlayClose();
      return;
    }
    if (hoveredIndex !== null && pendingIndex === null) {
      const index = hoveredIndex;
      setPendingIndex(index);
      setTimeout(() => {
        overlayStartTimeRef.current = performance.now();
        setOpenedImageUrl(images[index % images.length]);
        setOpenedImageIndex(index);
        setOpenedSpinY(spinYRef.current);
      }, FULLSCREEN_DELAY);
    }
  };

  const handleOverlayClose = () => {
    setOpenedImageUrl(null);
    setPendingIndex(null);
  };

  return (
    <div
      className="photo-cloud-3d"
      style={{ cursor: openedImageUrl || hoveredIndex !== null ? 'pointer' : 'default' }}
      onWheelCapture={handleWheelCapture}
      onClick={handleCanvasClick}
      onPointerEnter={() => setIsCanvasActive(true)}
      onPointerLeave={() => {
        setIsCanvasActive(false);
        setHoveredIndex(null);
      }}
      onTouchStart={() => setIsCanvasActive(true)}
      onTouchEnd={() => setIsCanvasActive(false)}
      onTouchCancel={() => setIsCanvasActive(false)}
    >
      <Canvas camera={{ position: [0, 3, 8], fov: 42 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <RectRing
          count={12}
          radius={3}
          spinY={spinY}
          images={images}
          hoveredIndex={hoveredIndex}
          onHoveredChange={setHoveredIndex}
          pendingIndex={pendingIndex}
          pendingOpacity={pendingOpacity}
          openedIndex={openedImageUrl ? openedImageIndex : null}
          openedSpinY={openedSpinY}
          overlayStartTime={overlayStartTimeRef.current}
        />
      </Canvas>
    </div>
  );
};

export default PhotoCloud3D;
