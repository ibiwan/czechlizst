const clamp01 = (value) => Math.min(1, Math.max(0, value));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function rMaxForTheta(theta) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return 1 / Math.max(c, s || 1);
}

function formatNumber(value, precision) {
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
 * Options:
 * - a1/a2: normalized angles in [0,1] mapped to [0°,90°]
 * - r1/r2: normalized radii in [0,1]
 * - radiusMode: 'angleScaled' | 'globalSqrt2'
 * - linkFit: only for globalSqrt2; shrink both proportionally when either would exceed the square
 * - precision: output digits after decimal
 */
export function cubicBezierFromPolar(options) {
  const radiusMode = options.radiusMode ?? 'angleScaled';
  const linkFit = options.linkFit ?? true;
  const precision = options.precision ?? 4;

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

