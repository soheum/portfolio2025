import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import './About3.css';

type Point = {
  x: number;
  y: number;
};

const VIEWBOX_SIZE = 500;
const NEIGHBOR_NUDGE_FACTOR = 0.35;
const CROSS_EPSILON = 0.001;
const RANDOM_RECOVERY_ATTEMPTS_PER_BAND = 45;
const MIN_EDGE_LENGTH = 24;
const MAX_EDGE_RATIO = 2.25;
const MIN_INTERIOR_ANGLE_DEGREES = 26;
const MAX_INTERIOR_ANGLE_DEGREES = 168;
const MIN_POLYGON_AREA = 3500;
const MIN_FACE_AREA = 1200;

/**
 * True isometric orthographic projection of a cube onto the SVG plane.
 *
 * In 3D, the cube is axis-aligned. Each 3D edge projects to the same length `L` in 2D (equal
 * foreshortening on the three visible axes). The three projected axis directions are 120° apart:
 *   dir_x = L·(√3/2,  1/2)   (down-right in SVG y-down)
 *   dir_y = L·(-√3/2, 1/2)   (down-left)
 *   dir_z = L·(0, -1)        (up)
 * They sum to zero, so the two body-diagonal vertices (0,0,0) and (a,a,a) project to the same
 * 2D point — the center where the three faces meet.
 *
 * The six silhouette vertices are the remaining cube corners. Order is clockwise in SVG (y-down),
 * matching the existing face split: 0 top-left, 1 top, 2 top-right, 3 bottom-right, 4 bottom, 5 bottom-left.
 */
const buildIsometricCubeHexVertices = (
  projectedEdgeLength: number,
  centerX: number,
  centerY: number
): Point[] => {
  const L = projectedEdgeLength;
  const half = L / 2;
  const h = (Math.sqrt(3) / 2) * L;
  return [
    { x: centerX - h, y: centerY - half },
    { x: centerX, y: centerY - L },
    { x: centerX + h, y: centerY - half },
    { x: centerX + h, y: centerY + half },
    { x: centerX, y: centerY + L },
    { x: centerX - h, y: centerY + half },
  ];
};

/** Screen length of every projected cube edge (outer hex side and internal Y edges). */
const PROJECTED_CUBE_EDGE_LENGTH = 105;

const INITIAL_CUBE_POINTS: Point[] = buildIsometricCubeHexVertices(
  PROJECTED_CUBE_EDGE_LENGTH,
  VIEWBOX_SIZE / 2,
  VIEWBOX_SIZE / 2
);

const getAxisAlignedBounds = (points: Point[]) => {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const INITIAL_CUBE_AXIS_BOUNDS = getAxisAlignedBounds(INITIAL_CUBE_POINTS);
const MAX_CUBE_BBOX_WIDTH = INITIAL_CUBE_AXIS_BOUNDS.width * 1.22;
const MAX_CUBE_BBOX_HEIGHT = INITIAL_CUBE_AXIS_BOUNDS.height * 1.22;
const SIZE_PULL_LERP = 0.065;
const MAX_SIZE_PULL_ITERATIONS = 90;

const RIPPLE_DURATION_MS = 1800;
const RIPPLE_MAX_AMPLITUDE = 2.6;
const RIPPLE_WAVES_PER_EDGE = 0.5;
const RIPPLE_SEGMENTS_PER_EDGE = 14;
/** Below this, treat as straight paths (avoids jitter). Kept low so motion starts almost immediately. */
const RIPPLE_MIN_AMPLITUDE_FOR_DEFORM = 0.012;
/**
 * Pretend the ripple started a few ms ago so the first layout frame already has visible displacement.
 * (The sine envelope is 0 at t=0, so without this the first paint can look idle until the next frame.)
 */
const RIPPLE_FIRST_FRAME_ALIGN_MS = 8;

const buildStraightQuadPath = (corners: Point[]): string => {
  if (corners.length !== 4) {
    return '';
  }
  const [cornerA, cornerB, cornerC, cornerD] = corners;
  return `M ${cornerA.x} ${cornerA.y} L ${cornerB.x} ${cornerB.y} L ${cornerC.x} ${cornerC.y} L ${cornerD.x} ${cornerD.y} Z`;
};

/** Outer hex only (ring vertices 0–5). Matches clip silhouette; internal Y edges are not included. */
const buildStraightHexPath = (ringPoints: Point[]): string => {
  if (ringPoints.length < 6) {
    return '';
  }
  const parts: string[] = [];
  for (let index = 0; index < 6; index += 1) {
    const corner = ringPoints[index];
    parts.push(index === 0 ? `M ${corner.x} ${corner.y}` : `L ${corner.x} ${corner.y}`);
  }
  parts.push('Z');
  return parts.join(' ');
};

const CENTER_VERTEX_ID = 6;

const CUBE_UNDIRECTED_EDGE_IDS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, CENTER_VERTEX_ID],
  [0, CENTER_VERTEX_ID],
  [2, 3],
  [3, 4],
  [4, CENTER_VERTEX_ID],
  [4, 5],
  [0, 5],
];

const vertexPointById = (cubePoints: Point[], center: Point, id: number): Point =>
  id === CENTER_VERTEX_ID ? center : cubePoints[id];

const buildSharedEdgeRippleCache = (
  cubePoints: Point[],
  center: Point,
  phase: number,
  amplitude: number,
  wavesPerEdge: number,
  segmentsPerEdge: number
): Map<string, Point[]> => {
  const cache = new Map<string, Point[]>();
  if (amplitude < RIPPLE_MIN_AMPLITUDE_FOR_DEFORM) {
    return cache;
  }

  const segments = Math.max(4, Math.round(segmentsPerEdge));

  for (const [minId, maxId] of CUBE_UNDIRECTED_EDGE_IDS) {
    const key = `${minId}-${maxId}`;
    const pointA = vertexPointById(cubePoints, center, minId);
    const pointB = vertexPointById(cubePoints, center, maxId);
    const deltaX = pointB.x - pointA.x;
    const deltaY = pointB.y - pointA.y;
    const edgeLength = Math.hypot(deltaX, deltaY);
    if (edgeLength < 1e-4) {
      continue;
    }
    const normalX = -deltaY / edgeLength;
    const normalY = deltaX / edgeLength;

    const samples: Point[] = [];
    for (let step = 0; step <= segments; step += 1) {
      const t = step / segments;
      const envelope = Math.sin(Math.PI * t);
      const wobble = Math.sin(2 * Math.PI * wavesPerEdge * t + phase);
      const displacement = amplitude * envelope * wobble;
      samples.push({
        x: pointA.x + t * deltaX + displacement * normalX,
        y: pointA.y + t * deltaY + displacement * normalY,
      });
    }
    cache.set(key, samples);
  }

  return cache;
};

const getDirectedEdgeSamples = (
  cache: Map<string, Point[]>,
  fromId: number,
  toId: number
): Point[] | null => {
  const minId = Math.min(fromId, toId);
  const maxId = Math.max(fromId, toId);
  const forward = cache.get(`${minId}-${maxId}`);
  if (!forward) {
    return null;
  }
  return fromId === minId ? forward : [...forward].reverse();
};

const buildRipplingFacePathFromSharedEdges = (
  vertexCycle: number[],
  cache: Map<string, Point[]>
): string => {
  if (cache.size === 0) {
    return '';
  }

  const parts: string[] = [];
  let isFirstCommand = true;

  for (let edgeIndex = 0; edgeIndex < vertexCycle.length - 1; edgeIndex += 1) {
    const fromId = vertexCycle[edgeIndex];
    const toId = vertexCycle[edgeIndex + 1];
    const samples = getDirectedEdgeSamples(cache, fromId, toId);
    if (!samples) {
      continue;
    }
    const startStep = edgeIndex === 0 ? 0 : 1;
    for (let step = startStep; step < samples.length; step += 1) {
      const point = samples[step];
      const roundedX = Math.round(point.x * 100) / 100;
      const roundedY = Math.round(point.y * 100) / 100;
      if (isFirstCommand) {
        parts.push(`M ${roundedX} ${roundedY}`);
        isFirstCommand = false;
      } else {
        parts.push(`L ${roundedX} ${roundedY}`);
      }
    }
  }

  parts.push('Z');
  return parts.join(' ');
};

const clampPointToViewBox = (point: Point): Point => ({
  x: Math.min(VIEWBOX_SIZE, Math.max(0, point.x)),
  y: Math.min(VIEWBOX_SIZE, Math.max(0, point.y)),
});

const getDistanceSquared = (from: Point, to: Point): number => {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return dx * dx + dy * dy;
};

const wrapIndex = (index: number, total: number): number => ((index % total) + total) % total;

const getPolygonCenter = (points: Point[]): Point => {
  const total = points.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x,
      y: accumulator.y + point.y,
    }),
    { x: 0, y: 0 }
  );
  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
};

const getFaceCornersFromCubePoints = (points: Point[]): { top: Point[]; right: Point[]; left: Point[] } => {
  const center = getPolygonCenter(points);
  return {
    top: [points[0], points[1], points[2], center],
    right: [center, points[2], points[3], points[4]],
    left: [points[0], center, points[4], points[5]],
  };
};

const getCrossProductZ = (previous: Point, current: Point, next: Point): number =>
  (current.x - previous.x) * (next.y - current.y) - (current.y - previous.y) * (next.x - current.x);

const isConvexPolygon = (points: Point[]): boolean => {
  if (points.length < 4) return true;

  let sign = 0;
  for (let index = 0; index < points.length; index += 1) {
    const previous = points[wrapIndex(index - 1, points.length)];
    const current = points[index];
    const next = points[wrapIndex(index + 1, points.length)];
    const cross = getCrossProductZ(previous, current, next);

    if (Math.abs(cross) <= CROSS_EPSILON) {
      continue;
    }

    const currentSign = cross > 0 ? 1 : -1;
    if (sign === 0) {
      sign = currentSign;
      continue;
    }

    if (currentSign !== sign) {
      return false;
    }
  }

  return sign !== 0;
};

const getPolygonSignedArea = (points: Point[]): number => {
  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[wrapIndex(index + 1, points.length)];
    sum += current.x * next.y - next.x * current.y;
  }
  return sum / 2;
};

const getInteriorAngleDegrees = (previous: Point, current: Point, next: Point): number => {
  const ax = previous.x - current.x;
  const ay = previous.y - current.y;
  const bx = next.x - current.x;
  const by = next.y - current.y;
  const magnitudeProduct = Math.hypot(ax, ay) * Math.hypot(bx, by);
  if (magnitudeProduct <= CROSS_EPSILON) {
    return 180;
  }
  const cosine = Math.max(-1, Math.min(1, (ax * bx + ay * by) / magnitudeProduct));
  return (Math.acos(cosine) * 180) / Math.PI;
};

const hasRenderableCubeFaces = (points: Point[]): boolean => {
  const center = getPolygonCenter(points);
  const faces = [
    [points[0], points[1], points[2], center],
    [center, points[2], points[3], points[4]],
    [points[0], center, points[4], points[5]],
  ];

  for (const face of faces) {
    if (!isConvexPolygon(face)) {
      return false;
    }
    if (Math.abs(getPolygonSignedArea(face)) < MIN_FACE_AREA) {
      return false;
    }
  }

  return true;
};

const isValidCubeShape = (points: Point[]): boolean => {
  if (!isConvexPolygon(points)) {
    return false;
  }

  const polygonArea = Math.abs(getPolygonSignedArea(points));
  if (polygonArea < MIN_POLYGON_AREA) {
    return false;
  }

  let minimumEdge = Number.POSITIVE_INFINITY;
  let maximumEdge = 0;
  let minimumAngle = Number.POSITIVE_INFINITY;
  let maximumAngle = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[wrapIndex(index + 1, points.length)];
    const previous = points[wrapIndex(index - 1, points.length)];
    const edgeLength = Math.hypot(next.x - current.x, next.y - current.y);
    const interiorAngle = getInteriorAngleDegrees(previous, current, next);

    minimumEdge = Math.min(minimumEdge, edgeLength);
    maximumEdge = Math.max(maximumEdge, edgeLength);
    minimumAngle = Math.min(minimumAngle, interiorAngle);
    maximumAngle = Math.max(maximumAngle, interiorAngle);
  }

  if (minimumEdge < MIN_EDGE_LENGTH) {
    return false;
  }

  if (maximumEdge / minimumEdge > MAX_EDGE_RATIO) {
    return false;
  }

  if (minimumAngle < MIN_INTERIOR_ANGLE_DEGREES || maximumAngle > MAX_INTERIOR_ANGLE_DEGREES) {
    return false;
  }

  return hasRenderableCubeFaces(points);
};

const isPointInsidePolygon = (point: Point, polygon: Point[]): boolean => {
  let isInside = false;
  for (let currentIndex = 0, previousIndex = polygon.length - 1; currentIndex < polygon.length; previousIndex = currentIndex++) {
    const current = polygon[currentIndex];
    const previous = polygon[previousIndex];
    const intersectsYAxis =
      (current.y > point.y) !== (previous.y > point.y) &&
      point.x < ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y) + current.x;
    if (intersectsYAxis) {
      isInside = !isInside;
    }
  }
  return isInside;
};

const getNearestPointIndex = (target: Point, points: Point[]): number => {
  let nearestIndex = 0;
  let shortestDistanceSquared = Number.POSITIVE_INFINITY;
  points.forEach((point, index) => {
    const distanceSquared = getDistanceSquared(point, target);
    if (distanceSquared < shortestDistanceSquared) {
      shortestDistanceSquared = distanceSquared;
      nearestIndex = index;
    }
  });
  return nearestIndex;
};

const getAdjacentNeighborIndices = (anchorIndex: number, points: Point[], target: Point): number[] => {
  const total = points.length;
  if (total < 4) return [];

  const previousIndex = wrapIndex(anchorIndex - 1, total);
  const nextIndex = wrapIndex(anchorIndex + 1, total);
  const previousSecondIndex = wrapIndex(anchorIndex - 2, total);
  const nextSecondIndex = wrapIndex(anchorIndex + 2, total);

  const previousSecondDistance = getDistanceSquared(points[previousSecondIndex], target);
  const nextSecondDistance = getDistanceSquared(points[nextSecondIndex], target);
  const thirdNeighborIndex =
    previousSecondDistance <= nextSecondDistance ? previousSecondIndex : nextSecondIndex;

  return [previousIndex, nextIndex, thirdNeighborIndex];
};

const lerpPointToward = (from: Point, to: Point, factor: number): Point => ({
  x: from.x + (to.x - from.x) * factor,
  y: from.y + (to.y - from.y) * factor,
});

const buildCandidatePoints = (
  points: Point[],
  nearestPointIndex: number,
  clickedPoint: Point,
  nearestScale: number,
  neighborFactorsByIndex: Map<number, number>
): Point[] => {
  const snappedNearest = clampPointToViewBox(
    lerpPointToward(points[nearestPointIndex], clickedPoint, nearestScale)
  );

  return points.map((point, index) => {
    if (index === nearestPointIndex) {
      return snappedNearest;
    }

    const neighborFactor = neighborFactorsByIndex.get(index);
    if (neighborFactor !== undefined && neighborFactor !== 0) {
      return clampPointToViewBox(lerpPointToward(point, clickedPoint, neighborFactor));
    }

    return point;
  });
};

const enforceMaxSizeKeepingAnchorFixed = (
  points: Point[],
  anchorIndex: number,
  anchorPosition: Point
): Point[] => {
  const anchor = clampPointToViewBox(anchorPosition);

  const withFixedAnchor = (pts: Point[]): Point[] =>
    pts.map((point, index) => (index === anchorIndex ? anchor : clampPointToViewBox(point)));

  let current = withFixedAnchor(points);

  if (!isValidCubeShape(current)) {
    return current;
  }

  const fitsBoundingBox = (pts: Point[]): boolean => {
    const bounds = getAxisAlignedBounds(pts);
    return bounds.width <= MAX_CUBE_BBOX_WIDTH && bounds.height <= MAX_CUBE_BBOX_HEIGHT;
  };

  if (fitsBoundingBox(current)) {
    return current;
  }

  const snapshotBeforeShrink = current;

  for (let iteration = 0; iteration < MAX_SIZE_PULL_ITERATIONS; iteration += 1) {
    if (fitsBoundingBox(current)) {
      return current;
    }

    const centroid = getPolygonCenter(current);
    const movableIndices = points
      .map((_, index) => index)
      .filter((index) => index !== anchorIndex)
      .sort(
        (a, b) => getDistanceSquared(current[b], centroid) - getDistanceSquared(current[a], centroid)
      );

    const pullFirst = movableIndices[0];
    const pullSecond = movableIndices[1];
    if (pullFirst === undefined) {
      break;
    }

    const tryStep = (factor: number): Point[] => {
      const next = current.map((point, index) => {
        if (index === anchorIndex) {
          return anchor;
        }
        if (index === pullFirst || index === pullSecond) {
          return clampPointToViewBox(lerpPointToward(point, centroid, factor));
        }
        return point;
      });
      return withFixedAnchor(next);
    };

    let applied = false;
    let stepFactor = SIZE_PULL_LERP;
    for (let softenAttempt = 0; softenAttempt < 5; softenAttempt += 1) {
      const candidate = tryStep(stepFactor);
      if (isValidCubeShape(candidate)) {
        current = candidate;
        applied = true;
        break;
      }
      stepFactor *= 0.5;
    }

    if (!applied) {
      break;
    }
  }

  if (fitsBoundingBox(current)) {
    return current;
  }

  return snapshotBeforeShrink;
};

const tryRandomConvexRecovery = (
  points: Point[],
  nearestPointIndex: number,
  clickedPoint: Point
): Point[] | null => {
  const jitterBands = [60, 100, 140, 180, 220];

  for (const jitter of jitterBands) {
    for (let attempt = 0; attempt < RANDOM_RECOVERY_ATTEMPTS_PER_BAND; attempt += 1) {
      const candidate = points.map((point, index) => {
        if (index === nearestPointIndex) {
          return clickedPoint;
        }

        const randomX = point.x + (Math.random() * 2 - 1) * jitter;
        const randomY = point.y + (Math.random() * 2 - 1) * jitter;
        return clampPointToViewBox({ x: randomX, y: randomY });
      });

      if (isValidCubeShape(candidate)) {
        return candidate;
      }
    }
  }

  return null;
};

const About3: React.FC = () => {
  const [cubePoints, setCubePoints] = useState<Point[]>(INITIAL_CUBE_POINTS);
  const [rippleToken, setRippleToken] = useState(0);
  const cubeBoxRef = useRef<HTMLDivElement>(null);
  const cubePointsRef = useRef<Point[]>(INITIAL_CUBE_POINTS);
  const pathTopRef = useRef<SVGPathElement>(null);
  const pathRightRef = useRef<SVGPathElement>(null);
  const pathLeftRef = useRef<SVGPathElement>(null);
  const clipSilhouettePathRef = useRef<SVGPathElement>(null);
  const rippleRafRef = useRef<number>(0);
  const rippleActiveRef = useRef(false);

  cubePointsRef.current = cubePoints;

  const straightFacePaths = useMemo(() => {
    const { top, right, left } = getFaceCornersFromCubePoints(cubePoints);
    return {
      top: buildStraightQuadPath(top),
      right: buildStraightQuadPath(right),
      left: buildStraightQuadPath(left),
    };
  }, [cubePoints]);

  const straightHexPath = useMemo(() => buildStraightHexPath(cubePoints), [cubePoints]);

  const writeStraightFacePaths = (points: Point[]) => {
    const { top, right, left } = getFaceCornersFromCubePoints(points);
    pathTopRef.current?.setAttribute('d', buildStraightQuadPath(top));
    pathRightRef.current?.setAttribute('d', buildStraightQuadPath(right));
    pathLeftRef.current?.setAttribute('d', buildStraightQuadPath(left));
  };

  const writeStraightClipSilhouette = (ringPoints: Point[]) => {
    clipSilhouettePathRef.current?.setAttribute('d', buildStraightHexPath(ringPoints));
  };

  const cancelRippleAnimation = () => {
    if (rippleRafRef.current !== 0) {
      window.cancelAnimationFrame(rippleRafRef.current);
      rippleRafRef.current = 0;
    }
  };

  useLayoutEffect(() => {
    if (rippleToken < 1) {
      return undefined;
    }

    const points = cubePointsRef.current;
    const { top: topFace, right: rightFace, left: leftFace } = getFaceCornersFromCubePoints(points);

    rippleActiveRef.current = true;
    cancelRippleAnimation();

    const startTime = performance.now() - RIPPLE_FIRST_FRAME_ALIGN_MS;

    const tick = (now: number) => {
      const linearProgress = Math.min(1, (now - startTime) / RIPPLE_DURATION_MS);
      const easedProgress =
        linearProgress < 0.5
          ? 4 * linearProgress * linearProgress * linearProgress
          : 1 - Math.pow(-2 * linearProgress + 2, 3) / 2;
      const amplitude = RIPPLE_MAX_AMPLITUDE * Math.sin(Math.PI * linearProgress);
      const phase = easedProgress * Math.PI * 2;

      if (amplitude < RIPPLE_MIN_AMPLITUDE_FOR_DEFORM) {
        pathTopRef.current?.setAttribute('d', buildStraightQuadPath(topFace));
        pathRightRef.current?.setAttribute('d', buildStraightQuadPath(rightFace));
        pathLeftRef.current?.setAttribute('d', buildStraightQuadPath(leftFace));
        writeStraightClipSilhouette(points);
      } else {
        const centerForRipple = getPolygonCenter(points);
        const edgeCache = buildSharedEdgeRippleCache(
          points,
          centerForRipple,
          phase,
          amplitude,
          RIPPLE_WAVES_PER_EDGE,
          RIPPLE_SEGMENTS_PER_EDGE
        );
        pathTopRef.current?.setAttribute(
          'd',
          buildRipplingFacePathFromSharedEdges(
            [0, 1, 2, CENTER_VERTEX_ID, 0],
            edgeCache
          )
        );
        pathRightRef.current?.setAttribute(
          'd',
          buildRipplingFacePathFromSharedEdges(
            [CENTER_VERTEX_ID, 2, 3, 4, CENTER_VERTEX_ID],
            edgeCache
          )
        );
        pathLeftRef.current?.setAttribute(
          'd',
          buildRipplingFacePathFromSharedEdges(
            [0, CENTER_VERTEX_ID, 4, 5, 0],
            edgeCache
          )
        );
        // Outer ring edges belong to only one face each; clip must ripple with them or straight clip cuts fill and shows background.
        clipSilhouettePathRef.current?.setAttribute(
          'd',
          buildRipplingFacePathFromSharedEdges([0, 1, 2, 3, 4, 5, 0], edgeCache)
        );
      }

      if (linearProgress < 1) {
        rippleRafRef.current = window.requestAnimationFrame(tick);
      } else {
        rippleActiveRef.current = false;
        writeStraightFacePaths(cubePointsRef.current);
        writeStraightClipSilhouette(cubePointsRef.current);
        rippleRafRef.current = 0;
      }
    };

    // Run once synchronously so the browser’s next paint already shows motion (no extra rAF wait).
    tick(performance.now());

    return () => {
      cancelRippleAnimation();
      rippleActiveRef.current = false;
      writeStraightFacePaths(cubePointsRef.current);
      writeStraightClipSilhouette(cubePointsRef.current);
    };
  }, [rippleToken]);

  const handleCubeSceneClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const cubeBox = cubeBoxRef.current;
    if (!cubeBox) return;
    const boxRect = cubeBox.getBoundingClientRect();
    if (boxRect.width === 0 || boxRect.height === 0) return;

    setRippleToken((previous) => previous + 1);

    const clickedPoint: Point = {
      x: ((event.clientX - boxRect.left) / boxRect.width) * VIEWBOX_SIZE,
      y: ((event.clientY - boxRect.top) / boxRect.height) * VIEWBOX_SIZE,
    };

    setCubePoints((previousPoints) => {
      if (isPointInsidePolygon(clickedPoint, previousPoints)) {
        return previousPoints;
      }

      const nearestPointIndex = getNearestPointIndex(clickedPoint, previousPoints);
      const boundedClickPoint = clampPointToViewBox(clickedPoint);
      const adjacentNeighborIndices = getAdjacentNeighborIndices(
        nearestPointIndex,
        previousPoints,
        boundedClickPoint
      );
      // Mixed-direction attempts: each neighbor can independently move toward (+) or away (-).
      const directionPatterns: number[][] = [
        [1, 1, 1],
        [1, 1, -1],
        [1, -1, 1],
        [-1, 1, 1],
        [1, -1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
        [-1, -1, -1],
      ];
      const magnitudeAttempts = [NEIGHBOR_NUDGE_FACTOR, 0.28, 0.2, 0.14, 0.08];
      const primaryNeighborFactorMaps: Map<number, number>[] = [];

      for (const magnitude of magnitudeAttempts) {
        for (const pattern of directionPatterns) {
          const neighborFactorsByIndex = new Map<number, number>();
          adjacentNeighborIndices.forEach((neighborIndex, patternIndex) => {
            neighborFactorsByIndex.set(neighborIndex, pattern[patternIndex] * magnitude);
          });
          primaryNeighborFactorMaps.push(neighborFactorsByIndex);

          const candidatePoints = buildCandidatePoints(
            previousPoints,
            nearestPointIndex,
            boundedClickPoint,
            1,
            neighborFactorsByIndex
          );

          if (isValidCubeShape(candidatePoints)) {
            return enforceMaxSizeKeepingAnchorFixed(candidatePoints, nearestPointIndex, boundedClickPoint);
          }
        }
      }

      const nearestOnlyNeighborFactors = new Map<number, number>();
      const nearestOnlyCandidate = buildCandidatePoints(
        previousPoints,
        nearestPointIndex,
        boundedClickPoint,
        1,
        nearestOnlyNeighborFactors
      );
      if (isValidCubeShape(nearestOnlyCandidate)) {
        return enforceMaxSizeKeepingAnchorFixed(nearestOnlyCandidate, nearestPointIndex, boundedClickPoint);
      }
      primaryNeighborFactorMaps.push(nearestOnlyNeighborFactors);

      const adjacentNeighborSet = new Set(adjacentNeighborIndices);
      const secondaryIndices = previousPoints
        .map((_, index) => index)
        .filter((index) => index !== nearestPointIndex && !adjacentNeighborSet.has(index));
      const secondaryDirectionPatterns: number[][] = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      const secondaryMagnitudeAttempts = [0.15, 0.12, 0.1, 0.08, 0.06];

      if (secondaryIndices.length === 2) {
        for (const primaryNeighborFactors of primaryNeighborFactorMaps) {
          for (const secondaryMagnitude of secondaryMagnitudeAttempts) {
            for (const secondaryPattern of secondaryDirectionPatterns) {
              const mixedNeighborFactors = new Map(primaryNeighborFactors);

              secondaryIndices.forEach((secondaryIndex, secondaryPatternIndex) => {
                const signedFactor = secondaryPattern[secondaryPatternIndex] * secondaryMagnitude;
                if (signedFactor === 0) return;
                mixedNeighborFactors.set(secondaryIndex, signedFactor);
              });

              const mixedCandidatePoints = buildCandidatePoints(
                previousPoints,
                nearestPointIndex,
                boundedClickPoint,
                1,
                mixedNeighborFactors
              );

              if (isValidCubeShape(mixedCandidatePoints)) {
                return enforceMaxSizeKeepingAnchorFixed(
                  mixedCandidatePoints,
                  nearestPointIndex,
                  boundedClickPoint
                );
              }
            }
          }
        }
      }

      const randomRecoveryCandidate = tryRandomConvexRecovery(
        previousPoints,
        nearestPointIndex,
        boundedClickPoint
      );
      if (randomRecoveryCandidate) {
        return enforceMaxSizeKeepingAnchorFixed(
          randomRecoveryCandidate,
          nearestPointIndex,
          boundedClickPoint
        );
      }

      // If every nearest-anchored candidate is invalid, keep the previous stable shape.
      return previousPoints;
    });
  };

  return (
    <main className="about3-page">
      <div ref={cubeBoxRef} className="about3-box">
        <div
          className="about3-cube-scene"
          aria-label="Interactive cube"
          onClick={handleCubeSceneClick}
        >
          <svg className="about3-cube-svg" viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} aria-hidden="true">
            <defs>
              <linearGradient
                id="about3-face-grad-top"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="#7c7a7a" stopOpacity={0.82} />
                <stop offset="45%" stopColor="#484646" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#141312" stopOpacity={1} />
              </linearGradient>
              <linearGradient
                id="about3-face-grad-right"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="#5e5a5a" stopOpacity={0.84} />
                <stop offset="50%" stopColor="#383636" stopOpacity={0.92} />
                <stop offset="100%" stopColor="#100f0f" stopOpacity={1} />
              </linearGradient>
              <linearGradient
                id="about3-face-grad-left"
                x1="1"
                y1="0"
                x2="0"
                y2="1"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="#4c4848" stopOpacity={0.83} />
                <stop offset="55%" stopColor="#262424" stopOpacity={0.91} />
                <stop offset="100%" stopColor="#0c0b0b" stopOpacity={1} />
              </linearGradient>
              <clipPath id="about3-cube-silhouette" clipPathUnits="userSpaceOnUse">
                <path ref={clipSilhouettePathRef} d={straightHexPath} />
              </clipPath>
              <filter
                id="about3-cube-grain"
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.85"
                  numOctaves="4"
                  stitchTiles="stitch"
                  result="turbulence"
                />
                <feColorMatrix in="turbulence" type="saturate" values="0" result="grayNoise" />
                <feComponentTransfer in="grayNoise" result="softNoise">
                  <feFuncR type="linear" slope="0.42" intercept="0.29" />
                  <feFuncG type="linear" slope="0.42" intercept="0.29" />
                  <feFuncB type="linear" slope="0.42" intercept="0.29" />
                </feComponentTransfer>
                <feBlend in="SourceGraphic" in2="softNoise" mode="overlay" result="grainBlend" />
              </filter>
            </defs>
            <g clipPath="url(#about3-cube-silhouette)">
              <g filter="url(#about3-cube-grain)">
                <path
                  ref={pathTopRef}
                  className="about3-cube-face about3-cube-face--top"
                  d={straightFacePaths.top}
                  fill="url(#about3-face-grad-top)"
                />
                <path
                  ref={pathRightRef}
                  className="about3-cube-face about3-cube-face--right"
                  d={straightFacePaths.right}
                  fill="url(#about3-face-grad-right)"
                />
                <path
                  ref={pathLeftRef}
                  className="about3-cube-face about3-cube-face--left"
                  d={straightFacePaths.left}
                  fill="url(#about3-face-grad-left)"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </main>
  );
};

export default About3;
