import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import './RectRing.css';

// Caption for each image (by index in the images array)
const IMAGE_CAPTIONS: Record<number, string> = {
  0: 'Paris, 2026',
  1: 'Tokyo, 2025',
  2: 'Berlin, 2025',
  3: 'Helsinki, 2025',
  4: 'London, 2024',
  5: 'Paris, 2025',
  6: 'Stockholm, 2025',
  7: 'London, 2024',
};

const OVERLAY_ANIM_DURATION = 0.6;
const LETTER_DELAY_MS = 60; // ms between each letter appearing
const PIVOT_DISTANCE_RIGHT = 3; // right edge (outer)
const PIVOT_DISTANCE_LEFT = 1; // left edge (inner)
const PLANE_WIDTH = 2;
const PLANE_HEIGHT = 1.4;
const FLAT_TILT_X = -Math.atan2(3, 8);
const START_SCALE = 1.05; // HOVER_SCALE - card scale when clicked
const START_LIFT_Y = 0.2; // HOVER_LIFT_Y - card lift when clicked
const END_SCALE = 2.5;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const UnfoldingCard: React.FC<{
  tex: THREE.Texture;
  openedIndex: number;
  openedSpinY: number;
  startTime: number;
  count: number;
  caption: string;
}> = ({ tex, openedIndex, openedSpinY, startTime, count, caption }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = (performance.now() - startTime) / 1000;
    const t = Math.min(1, elapsed / OVERLAY_ANIM_DURATION);
    const eased = easeOutCubic(t);

    let angle = openedSpinY + openedIndex * (Math.PI * 2) / count;
    const twoPi = Math.PI * 2;
    angle = ((angle % twoPi) + twoPi) % twoPi;
    const isLeftSide = angle > Math.PI / 2 && angle < (3 * Math.PI) / 2;
    const pivotDist = isLeftSide ? PIVOT_DISTANCE_RIGHT : PIVOT_DISTANCE_LEFT;
    const startPivotX = pivotDist * Math.cos(angle);
    const startPivotZ = pivotDist * Math.sin(angle);

    const targetRotY = isLeftSide ? Math.PI : 0;
    const rotY = eased >= 1 ? targetRotY : isLeftSide
      ? angle + (Math.PI - angle) * eased
      : angle <= Math.PI
        ? angle * (1 - eased)
        : angle + (twoPi - angle) * eased;
    groupRef.current.rotation.y = rotY;
    groupRef.current.rotation.x = FLAT_TILT_X * eased;
    const scale = START_SCALE + (END_SCALE - START_SCALE) * eased;
    groupRef.current.scale.setScalar(scale);
    const meshHalfWidth = PLANE_WIDTH / 2;
    const endCenterX = isLeftSide ? -scale * meshHalfWidth : -scale * meshHalfWidth;
    groupRef.current.position.set(
      startPivotX + (endCenterX - startPivotX) * eased,
      START_LIFT_Y * (1 - eased),
      startPivotZ * (1 - eased)
    );
  });

  const isLeftSide = (() => {
    let a = openedSpinY + openedIndex * (Math.PI * 2) / count;
    a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return a > Math.PI / 2 && a < (3 * Math.PI) / 2;
  })();
  const meshOffsetX = isLeftSide ? -PLANE_WIDTH / 2 : PLANE_WIDTH / 2;

  // Both sides: caption centered below image
  const captionX = meshOffsetX;
  const captionY = -PLANE_HEIGHT / 2 - 0.06; // 0.06 = vertical gap
  const captionTransform = 'translate(-50%, 0)';
  const captionAlign = 'center';

  return (
    <group ref={groupRef}>
      <Html
        position={[captionX, captionY, 0.01]}
        center={false}
        style={{ margin: 0, padding: 0, lineHeight: 1 }}
      >
        <div
          style={{
            transform: captionTransform,
            textAlign: captionAlign,
            whiteSpace: 'nowrap',
            display: 'inline-block',
            margin: 0,
            padding: 0,
          }}
        >
          <span style={{ color: '#ffffff', fontSize: 18, fontFamily: "'SA No Rules', sans-serif", margin: 0, padding: 0, display: 'inline-block' }}>
            {Array.from(caption).map((letter, i) => (
              <span
                key={i}
                className="rect-ring-caption-letter"
                style={{
                  animationDelay: `${OVERLAY_ANIM_DURATION + (i * LETTER_DELAY_MS) / 1000}s`,
                  fontFamily: "'SA No Rules', sans-serif",
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>
      </Html>
      <mesh position={[meshOffsetX, 0, 0]}>
        <planeGeometry args={[PLANE_WIDTH, PLANE_HEIGHT]} />
        <meshBasicMaterial map={tex} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
};

const HoverRaycaster: React.FC<{
  groupRef: React.RefObject<THREE.Group | null>;
  onHoveredChange: (index: number | null) => void;
  isPointerOver: boolean;
}> = ({ groupRef, onHoveredChange, isPointerOver }) => {
  const { camera, pointer, raycaster } = useThree();
  const prevRef = useRef<number | null>(null);

  useFrame(() => {
    if (!groupRef.current || !isPointerOver) return;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(groupRef.current, true);
    const hit = hits.find((h) => h.object.userData.index !== undefined);
    const next = hit ? (hit.object.userData.index as number) : null;
    // Only update when we have a hit; don't clear when cursor is between images (avoids flicker while scrolling)
    if (next !== null) {
      prevRef.current = next;
      onHoveredChange(next);
    }
  });

  return null;
};

interface RectRingProps {
  count: number;
  radius: number;
  spinY?: number;
  images: string[];
  hoveredIndex: number | null;
  onHoveredChange: (index: number | null) => void;
  pendingIndex: number | null;
  pendingOpacity?: number;
  openedIndex?: number | null;
  openedSpinY?: number;
  overlayStartTime?: number;
  isPointerOver?: boolean;
}

const HALF_H = 1.4 / 2;
const CENTER_GAP = 1;
const HOVER_SCALE = 1.05;
const HOVER_LIFT_Y = 0.2; // ~20px lift in 3D units
const WAVY_DISTORT = 0.3;
const WAVY_SPEED = 6;
const BW_TINT = '#555555'; // darkens the bw image (lower = darker)

const toBwUrl = (url: string) => url.replace(/\.(jpg|jpeg|png)$/i, '-bw.$1');

const RectRing: React.FC<RectRingProps> = ({
  count,
  radius,
  spinY = 0,
  images,
  hoveredIndex,
  onHoveredChange,
  pendingIndex,
  pendingOpacity = 1,
  openedIndex = null,
  openedSpinY = 0,
  overlayStartTime = 0,
  isPointerOver = true,
}) => {
  // Load textures: color and bw versions (cycles if count > images.length)
  const colorUrls = useMemo(
    () => Array.from({ length: count }, (_, i) => images[i % images.length]),
    [count, images]
  );
  const bwUrls = useMemo(
    () => colorUrls.map(toBwUrl),
    [colorUrls]
  );
  const allTextures = useTexture([...colorUrls, ...bwUrls]);

  const planeWidth = radius - CENTER_GAP;
  const planeHeight = HALF_H * 2;
  const planeCenterX = (CENTER_GAP + radius) / 2;

  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = i * ((Math.PI * 2) / count);
        return {
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, angle, 0] as [number, number, number],
        };
      }),
    [count]
  );

  const groupRef = useRef<THREE.Group>(null);

  if (images.length === 0) return null;

  const isOpened = openedIndex !== null && openedIndex !== undefined;

  return (
    <>
      <HoverRaycaster groupRef={groupRef} onHoveredChange={onHoveredChange} isPointerOver={isPointerOver} />
      <group
        ref={groupRef}
        rotation={[0, spinY, 0]}
        onPointerLeave={() => onHoveredChange(null)}
      >
      {items.map((item, i) => {
        if (isOpened) return null;
        const colorTex = allTextures[i];
        const bwTex = allTextures[colorUrls.length + i];
        const isHighlighted = hoveredIndex === null || hoveredIndex === i;
        const isPending = pendingIndex === i;
        const useBw = hoveredIndex !== null && !isHighlighted && !isPending;
        const tex = useBw ? bwTex : colorTex;
        const baseScale = isHighlighted || isPending ? HOVER_SCALE : 1;
        const liftY = isHighlighted || isPending ? HOVER_LIFT_Y : 0;
        return (
          <group
            key={i}
            position={[item.position[0], item.position[1] + liftY, item.position[2]]}
            rotation={item.rotation}
          >
            <mesh
              position={[planeCenterX, 0, 0]}
              scale={[baseScale, baseScale, baseScale]}
              userData={{ index: i }}
              onPointerEnter={() => onHoveredChange(i)}
            >
              <planeGeometry args={[planeWidth, planeHeight, 24, 24]} />
              {isPending ? (
                <MeshDistortMaterial
                  map={tex}
                  emissiveMap={tex}
                  emissive="#ffffff"
                  emissiveIntensity={1}
                  color="#000000"
                  transparent
                  opacity={pendingOpacity}
                  side={THREE.DoubleSide}
                  distort={WAVY_DISTORT}
                  speed={WAVY_SPEED}
                  roughness={1}
                  metalness={0}
                />
              ) : (
                <meshBasicMaterial
                  map={tex}
                  color={useBw ? BW_TINT : '#ffffff'}
                  side={THREE.DoubleSide}
                />
              )}
            </mesh>
          </group>
        );
      })}
      </group>
      {isOpened && (
        <UnfoldingCard
          tex={allTextures[openedIndex % colorUrls.length]}
          openedIndex={openedIndex}
          openedSpinY={openedSpinY}
          startTime={overlayStartTime}
          count={count}
          caption={IMAGE_CAPTIONS[openedIndex % images.length] ?? ''}
        />
      )}
    </>
  );
};

export default RectRing;
