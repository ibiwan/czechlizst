export type PolarBezierOptions = {
  /**
   * Normalized angles in [0, 1] mapped to [0°, 90°].
   * a1 is the start handle angle; a2 is the end handle angle (measured back from (1,1)).
   */
  a1: number;
  a2: number;

  /**
   * Normalized radii in [0, 1].
   * r1 is the start handle length; r2 is the end handle length.
   */
  r1: number;
  r2: number;

  /**
   * How to interpret r1/r2.
   * - angleScaled: r=1 means "as long as possible without leaving the unit square" for that angle.
   * - globalSqrt2: r=1 means "length √2", then fitted into the unit square (optionally linked).
   */
  radiusMode?: 'angleScaled' | 'globalSqrt2';

  /**
   * Only used in globalSqrt2 mode.
   * When true, if either handle would exceed the unit square, shrink BOTH proportionally,
   * preserving the r1:r2 ratio.
   */
  linkFit?: boolean;

  /**
   * Digits after decimal for output formatting.
   */
  precision?: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function rMaxForTheta(theta: number) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return 1 / Math.max(c, s || 1);
}

function formatNumber(value: number, precision: number) {
  if (!Number.isFinite(value)) {
    return '0';
  }
  const p = clamp(precision, 0, 10);
  const s = value.toFixed(p);
  return s.replace(/\.0+$/, '').replace(/(\.\d+?)0+$/, '$1');
}

/**
 * Convert polar-handle parameters into a standard cubic-bezier() string.
 *
 * This is meant for Tailwind configs (transitionTimingFunction), but it's generic.
 */
export function cubicBezierFromPolar(options: PolarBezierOptions) {
  const {
    radiusMode = 'angleScaled',
    linkFit = true,
    precision = 4,
  } = options;

  const a1 = clamp01(options.a1);
  const a2 = clamp01(options.a2);
  const r1n = clamp01(options.r1);
  const r2n = clamp01(options.r2);

  const theta1 = a1 * (Math.PI / 2);
  const theta2 = a2 * (Math.PI / 2);
  const c1 = Math.cos(theta1);
  const s1 = Math.sin(theta1);
  const c2 = Math.cos(theta2);
  const s2 = Math.sin(theta2);

  const r1Max = rMaxForTheta(theta1);
  const r2Max = rMaxForTheta(theta2);

  let r1 = 0;
  let r2 = 0;

  if (radiusMode === 'angleScaled') {
    r1 = r1n * r1Max;
    r2 = r2n * r2Max;
  } else {
    r1 = r1n * Math.SQRT2;
    r2 = r2n * Math.SQRT2;

    const k1 = r1 === 0 ? 1 : Math.min(1, r1Max / r1);
    const k2 = r2 === 0 ? 1 : Math.min(1, r2Max / r2);

    if (linkFit) {
      const k = Math.min(k1, k2);
      r1 *= k;
      r2 *= k;
    } else {
      r1 *= k1;
      r2 *= k2;
    }
  }

  const x1 = clamp01(r1 * c1);
  const y1 = r1 * s1;
  const x2 = clamp01(1 - r2 * c2);
  const y2 = 1 - r2 * s2;

  return `cubic-bezier(${formatNumber(x1, precision)}, ${formatNumber(y1, precision)}, ${formatNumber(
    x2,
    precision
  )}, ${formatNumber(y2, precision)})`;
}

