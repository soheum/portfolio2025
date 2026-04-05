import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './About4.css';

const VIEWBOX = 500;
const CX = VIEWBOX / 2;
const CY = VIEWBOX / 2;

/** Rotate the whole torus drawing in the SVG plane (degrees, around view center). Use −90 for the other direction. */
const VIEW_ROTATION_DEG = 45;

/**
 * 3D tilt controls (applied before 2D projection).
 * - **X tilt**: “forward/back” lean (what you described as tilt forward).
 * - **Z tilt**: in-plane spin; mostly the same idea as VIEW_ROTATION_DEG, but done in 3D space.
 */
const TILT_X_DEG = 48;
const TILT_Z_DEG = 24;

/** Distance from torus center to tube center (middle of the donut ring). */
const TORUS_MAJOR_R = 200;
/** Tube radius — with TORUS_MAJOR_R this leaves a visible hole (inner rim ≈ major − minor). */
const TORUS_MINOR_R = 48;

const MERIDIAN_COUNT = 32;
const LOOP_DURATION_MS = 32000;
/** Initial preset: no duration until the user sets mm:ss (at least 00:01 to start). */
const INITIAL_DURATION_MS = 0;
/** Upper bound for parsed mm:ss (99 minutes, 59 seconds). */
const MAX_DURATION_MS = 99 * 60_000 + 59 * 1000;
/** Points sampled per meridian circle. */
const SEGMENTS = 72;
const DEG_TO_RAD = Math.PI / 180;
const TWO_PI = Math.PI * 2;
/** Keep a tiny “seam” at the start marker so the start always reads clearly while spinning. */
const START_SEAM_RADIANS = 0.14; // ~8°
/** Width of the progress boundary fade (radians). Larger = softer edge, less “blinky” boundary. */
const PROGRESS_FADE_RADIANS = 0.62;
/**
 * Soft ramp from grey at the fixed start (cwFromSeam → 0) into the filled arc — same idea as PROGRESS_FADE_RADIANS
 * on the advancing edge, applied along cwFromSeam near 0.
 */
const SEAM_EDGE_FADE_RADIANS = PROGRESS_FADE_RADIANS;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const wrapRadians0To2Pi = (radians: number) => {
  const wrapped = radians % TWO_PI;
  return wrapped < 0 ? wrapped + TWO_PI : wrapped;
};

const rotatePoint2D = (x: number, y: number, degrees: number, originX: number, originY: number) => {
  const rad = degrees * DEG_TO_RAD;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - originX;
  const dy = y - originY;
  return {
    x: originX + dx * cos - dy * sin,
    y: originY + dx * sin + dy * cos,
  };
};

/** Display ms as mm:ss (floored to whole seconds). */
const formatMsToMmSs = (ms: number): string => {
  const totalSec = Math.floor(Math.max(0, ms) / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * Countdown label from elapsed time (avoids floor(remainingMs) showing one second short on the first frames).
 */
const formatCountdownMmSs = (totalMs: number, elapsedMs: number): string => {
  const totalWhole = Math.floor(Math.max(0, totalMs) / 1000);
  const elapsedWhole = Math.floor(Math.max(0, elapsedMs) / 1000);
  const secondsLeft = Math.max(0, totalWhole - elapsedWhole);
  return formatMsToMmSs(secondsLeft * 1000);
};

/**
 * Parse "mm:ss" into milliseconds. Allows 00:00; at least 00:01 is required to Start.
 * Returns null if invalid.
 */
const parseMmSsToMs = (raw: string): number | null => {
  const t = raw.trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return null;
  const minutes = parseInt(m[1], 10);
  const seconds = parseInt(m[2], 10);
  if (seconds >= 60 || Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
  const out = minutes * 60_000 + seconds * 1000;
  if (out < 0 || out > MAX_DURATION_MS) return null;
  return out;
};

/**
 * One meridian = tube cross-section: fixed u, v runs 0…2π on the torus:
 *   x = (R + r cos v) cos u
 *   y = r sin v
 *   z = (R + r cos v) sin u
 * Then rotate the whole torus around Y by ψ (spin). Orthographic view from +Z: project (x', y').
 */
const buildTorusMeridianPathD = (uFixed: number, psi: number): string => {
  const parts: string[] = [];

  const cosP = Math.cos(psi);
  const sinP = Math.sin(psi);
  const tiltX = TILT_X_DEG * DEG_TO_RAD;
  const tiltZ = TILT_Z_DEG * DEG_TO_RAD;
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const cosZ = Math.cos(tiltZ);
  const sinZ = Math.sin(tiltZ);

  for (let step = 0; step <= SEGMENTS; step += 1) {
    const v = (step / SEGMENTS) * TWO_PI;
    const ringRadius = TORUS_MAJOR_R + TORUS_MINOR_R * Math.cos(v);
    const x = ringRadius * Math.cos(uFixed);
    const y = TORUS_MINOR_R * Math.sin(v);
    const z = ringRadius * Math.sin(uFixed);

    // 1) Spin around Y by psi.
    const x2 = cosP * x + sinP * z;
    const y2 = y;
    const z2 = -sinP * x + cosP * z;

    // 2) Tilt around X (forward/back lean).
    const x3 = x2;
    const y3 = cosX * y2 - sinX * z2;
    // const z3 = sinX * y2 + cosX * z2; // depth not needed for the timer fill

    // 3) Optional tilt around Z (in-plane in 3D space).
    const x4 = cosZ * x3 - sinZ * y3;
    const y4 = sinZ * x3 + cosZ * y3;

    const xSvg = CX + x4;
    const ySvg = CY - y4;

    const commandPoint = `${Math.round(xSvg * 100) / 100} ${Math.round(ySvg * 100) / 100}`;
    parts.push(`${step === 0 ? 'M' : 'L'} ${commandPoint}`);
  }

  parts.push('Z');
  return parts.join(' ');
};

/**
 * Representative point for a meridian’s current screen location.
 * Uses the tube-center point (the main donut ring), so progress fills in ONE direction.
 * (Using the outer rim can make the fill look like it advances on both sides at once because
 * the tilted torus can project two “outer” points to similar clock angles.)
 * Returns a point in SVG coordinates AFTER applying the same 2D view rotation.
 */
const getMeridianScreenPoint = (uFixed: number, psi: number): { x: number; y: number } => {
  const ringRadius = TORUS_MAJOR_R;
  const x = ringRadius * Math.cos(uFixed);
  const y = 0;
  const z = ringRadius * Math.sin(uFixed);

  const cosP = Math.cos(psi);
  const sinP = Math.sin(psi);
  const tiltX = TILT_X_DEG * DEG_TO_RAD;
  const tiltZ = TILT_Z_DEG * DEG_TO_RAD;
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const cosZ = Math.cos(tiltZ);
  const sinZ = Math.sin(tiltZ);

  // 1) Spin around Y by psi.
  const x2 = cosP * x + sinP * z;
  const y2 = y;
  const z2 = -sinP * x + cosP * z;

  // 2) Tilt around X.
  const x3 = x2;
  const y3 = cosX * y2 - sinX * z2;

  // 3) Tilt around Z.
  const x4 = cosZ * x3 - sinZ * y3;
  const y4 = sinZ * x3 + cosZ * y3;

  const xSvg = CX + x4;
  const ySvg = CY - y4;

  // Match the visible rotation applied in the <g transform="rotate(...)">.
  return rotatePoint2D(xSvg, ySvg, VIEW_ROTATION_DEG, CX, CY);
};

/**
 * Convert a screen point to “clockwise from top” angle:
 * - 0 at 12 o’clock
 * - increases clockwise to 2π
 */
const getClockwiseFromTopAngle = (x: number, y: number) => {
  const a = Math.atan2(y - CY, x - CX); // standard atan2 from +x, CCW (in SVG coords)
  return wrapRadians0To2Pi(Math.PI / 2 - a);
};

/** Evenly spaced u around the full torus (0 … 2π, exclusive of duplicate at 2π). */
const buildMeridianAngles = (count: number): number[] =>
  Array.from({ length: count }, (_, index) => (index / count) * TWO_PI);

const About4: React.FC = () => {
  const meridianU = useMemo(() => buildMeridianAngles(MERIDIAN_COUNT), []);
  const [psi, setPsi] = useState(0);

  const [durationMs, setDurationMs] = useState(INITIAL_DURATION_MS);
  const [activeDurationMs, setActiveDurationMs] = useState(INITIAL_DURATION_MS);
  /** Elapsed time for the current or last run (driven by rAF while running). */
  const [elapsedMs, setElapsedMs] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'running' | 'paused'>('idle');
  /** After a natural completion, keep the ring full until the next Start. */
  const [idleRingFull, setIdleRingFull] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(formatMsToMmSs(INITIAL_DURATION_MS));
  const timeInputRef = useRef<HTMLInputElement>(null);

  const phaseRef = useRef<'idle' | 'running' | 'paused'>('idle');
  const runStartRef = useRef<number | null>(null);
  /** Snapshot for the rAF loop so the effect stays mount-stable (avoids resetting rotation). */
  const activeDurationRef = useRef(INITIAL_DURATION_MS);
  /**
   * Mirrors `durationMs` but updates synchronously when the user commits the input.
   * Fixes blur-then-click Start: React may not have applied `setDurationMs` yet when Start runs,
   * so reading state alone can keep a stale value.
   */
  const durationMsRef = useRef(INITIAL_DURATION_MS);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    durationMsRef.current = durationMs;
  }, [durationMs]);

  useEffect(() => {
    if (isEditing) {
      timeInputRef.current?.focus();
      timeInputRef.current?.select();
    }
  }, [isEditing]);

  useLayoutEffect(() => {
    let raf = 0;
    const loopStart = performance.now();
    const tick = (now: number) => {
      const rotationElapsed = (now - loopStart) % LOOP_DURATION_MS;
      setPsi((rotationElapsed / LOOP_DURATION_MS) * TWO_PI);

      if (phaseRef.current === 'running' && runStartRef.current !== null) {
        const limit = activeDurationRef.current;
        const elapsed = Math.min(limit, now - runStartRef.current);
        setElapsedMs(elapsed);
        if (elapsed >= limit) {
          phaseRef.current = 'idle';
          runStartRef.current = null;
          setPhase('idle');
          setIdleRingFull(true);
          setElapsedMs(limit);
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Ring length for this run must match the duration you started (ref is set synchronously on Start).
  const effectiveTotalMs =
    phase === 'running' || phase === 'paused'
      ? activeDurationRef.current
      : idleRingFull
        ? activeDurationMs
        : durationMs;

  let ringElapsedMs = 0;
  if (phase === 'running' || phase === 'paused') {
    ringElapsedMs = elapsedMs;
  } else if (idleRingFull) {
    ringElapsedMs = effectiveTotalMs;
  }

  // One meridian step per whole second (matches the mm:ss countdown ticks).
  const safeTotalMs = Math.max(1, effectiveTotalMs);
  const totalSeconds = Math.max(1, Math.round(safeTotalMs / 1000));
  const elapsedWholeSeconds = Math.min(totalSeconds, Math.floor(ringElapsedMs / 1000));
  const progressStep = elapsedWholeSeconds / totalSeconds;
  const filledAngle = progressStep * TWO_PI;

  const commitDraft = () => {
    const parsed = parseMmSsToMs(draft);
    if (parsed !== null) {
      durationMsRef.current = parsed;
      setDurationMs(parsed);
      setDraft(formatMsToMmSs(parsed));
    } else {
      setDraft(formatMsToMmSs(durationMs));
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraft(formatMsToMmSs(durationMs));
    setIsEditing(false);
  };

  const handleStart = () => {
    if (phase === 'running' || phase === 'paused') return;
    // Prefer ref so we see the value just committed on blur (same gesture as clicking Start).
    let ms = durationMsRef.current;
    if (isEditing) {
      const parsed = parseMmSsToMs(draft);
      if (parsed === null) return;
      ms = parsed;
      durationMsRef.current = ms;
      setDurationMs(ms);
      setDraft(formatMsToMmSs(ms));
      setIsEditing(false);
    }
    if (ms < 1000) return;
    activeDurationRef.current = ms;
    setActiveDurationMs(ms);
    phaseRef.current = 'running';
    runStartRef.current = performance.now();
    setElapsedMs(0);
    setIdleRingFull(false);
    setPhase('running');
  };

  const handleResume = () => {
    if (phase !== 'paused') return;
    phaseRef.current = 'running';
    runStartRef.current = performance.now() - elapsedMs;
    setPhase('running');
  };

  const handlePause = () => {
    if (phase !== 'running') return;
    phaseRef.current = 'paused';
    runStartRef.current = null;
    setPhase('paused');
  };

  /** Full cancel: stop and reset timer + preset to 00:00. */
  const handleCancelTimer = () => {
    if (phase !== 'running' && phase !== 'paused') return;
    phaseRef.current = 'idle';
    runStartRef.current = null;
    setPhase('idle');
    setElapsedMs(0);
    setIdleRingFull(false);
    activeDurationRef.current = INITIAL_DURATION_MS;
    setActiveDurationMs(INITIAL_DURATION_MS);
    durationMsRef.current = INITIAL_DURATION_MS;
    setDurationMs(INITIAL_DURATION_MS);
    setDraft(formatMsToMmSs(INITIAL_DURATION_MS));
  };

  // Countdown in the center while running or paused (e.g. 00:15 → 00:00); preset when idle; 00:00 when finished.
  const centerLabel =
    phase === 'running' || phase === 'paused'
      ? formatCountdownMmSs(activeDurationMs, elapsedMs)
      : idleRingFull
        ? formatMsToMmSs(0)
        : formatMsToMmSs(durationMs);

  const startCandidateMs = isEditing ? parseMmSsToMs(draft.trim()) : durationMsRef.current;
  const canStart = startCandidateMs !== null && startCandidateMs >= 1000;

  return (
    <main className="about4-page">
      <div className="about4-box">
        <svg
          className="about4-globe-svg"
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          role="img"
          aria-label="Rotating torus wireframe"
        >
          <g transform={`rotate(${VIEW_ROTATION_DEG} ${CX} ${CY})`}>
            {meridianU.map((u, index) => {
              const point = getMeridianScreenPoint(u, psi);
              const cw = getClockwiseFromTopAngle(point.x, point.y);
              const seam = START_SEAM_RADIANS;
              const cwFromSeam = wrapRadians0To2Pi(cw - seam);
              const progressEdgeOpacity =
                progressStep >= 1
                  ? 1
                  : clamp01((filledAngle - cwFromSeam) / Math.max(1e-4, PROGRESS_FADE_RADIANS));
              // Soft transition at the seam (start of arc): ramp in as cwFromSeam moves away from 0.
              const seamEdgeOpacity = clamp01(cwFromSeam / Math.max(1e-4, SEAM_EDGE_FADE_RADIANS));
              const overlayOpacity =
                progressStep >= 1 ? 1 : progressEdgeOpacity * seamEdgeOpacity;
              return (
                <g key={index}>
                  <path className="about4-meridian-path" d={buildTorusMeridianPathD(u, psi)} />
                  <path
                    className="about4-meridian-path about4-meridian-path--active"
                    d={buildTorusMeridianPathD(u, psi)}
                    style={{ opacity: overlayOpacity }}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        <div className="about4-timer-overlay" aria-live="polite">
          <div className="about4-timer-time-row">
            <div className="about4-time-slot">
              {isEditing ? (
                <input
                  ref={timeInputRef}
                  className="about4-time-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label="Timer duration in minutes and seconds"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commitDraft}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitDraft();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEdit();
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="about4-time-button"
                  aria-label="Edit timer duration. Current value in minutes and seconds."
                  disabled={phase === 'running' || phase === 'paused'}
                  onClick={() => {
                    if (phase === 'running' || phase === 'paused') return;
                    setDraft(formatMsToMmSs(durationMs));
                    setIsEditing(true);
                  }}
                >
                  {centerLabel}
                </button>
              )}
            </div>
          </div>
          <div className="about4-timer-actions">
            {phase === 'running' ? (
              <>
                <button type="button" className="about4-timer-action" aria-label="Pause timer" onClick={handlePause}>
                  Pause
                </button>
                <button
                  type="button"
                  className="about4-timer-action"
                  aria-label="Cancel timer and reset to zero"
                  onClick={handleCancelTimer}
                >
                  Cancel
                </button>
              </>
            ) : phase === 'paused' ? (
              <>
                <button type="button" className="about4-timer-action" aria-label="Resume timer" onClick={handleResume}>
                  Resume
                </button>
                <button
                  type="button"
                  className="about4-timer-action"
                  aria-label="Cancel timer and reset to zero"
                  onClick={handleCancelTimer}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="about4-timer-action"
                aria-label={isEditing ? 'Set timer duration' : 'Start timer'}
                disabled={!isEditing && !canStart}
                onClick={() => {
                  if (isEditing) {
                    commitDraft();
                  } else {
                    handleStart();
                  }
                }}
              >
                {isEditing ? 'Set time' : 'Start'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default About4;
