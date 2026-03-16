const DEFAULTS = {
  radiusMode: 'angleScaled', // 'angleScaled' | 'globalSqrt2'
  linkFit: true, // only used for globalSqrt2
  precision: 4,
};

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

function cubicBezierFromPolar({ a1, r1, a2, r2 }, options) {
  const radiusMode = options.radiusMode ?? DEFAULTS.radiusMode;
  const linkFit = options.linkFit ?? DEFAULTS.linkFit;
  const precision = options.precision ?? DEFAULTS.precision;

  const na1 = clamp01(a1);
  const na2 = clamp01(a2);
  const nr1n = clamp01(r1);
  const nr2n = clamp01(r2);

  const theta1 = na1 * (Math.PI / 2);
  const theta2 = na2 * (Math.PI / 2);
  const c1 = Math.cos(theta1);
  const s1 = Math.sin(theta1);
  const c2 = Math.cos(theta2);
  const s2 = Math.sin(theta2);

  const r1Max = rMaxForTheta(theta1);
  const r2Max = rMaxForTheta(theta2);

  let R1 = 0;
  let R2 = 0;

  if (radiusMode === 'angleScaled') {
    R1 = nr1n * r1Max;
    R2 = nr2n * r2Max;
  } else {
    R1 = nr1n * Math.SQRT2;
    R2 = nr2n * Math.SQRT2;

    const k1 = R1 === 0 ? 1 : Math.min(1, r1Max / R1);
    const k2 = R2 === 0 ? 1 : Math.min(1, r2Max / R2);

    if (linkFit) {
      const k = Math.min(k1, k2);
      R1 *= k;
      R2 *= k;
    } else {
      R1 *= k1;
      R2 *= k2;
    }
  }

  const x1 = clamp01(R1 * c1);
  const y1 = R1 * s1;
  const x2 = clamp01(1 - R2 * c2);
  const y2 = 1 - R2 * s2;

  return `cubic-bezier(${formatNumber(x1, precision)}, ${formatNumber(y1, precision)}, ${formatNumber(
    x2,
    precision
  )}, ${formatNumber(y2, precision)})`;
}

function parseArgs(argsText) {
  const parts = argsText
    .trim()
    .split(/[\s,]+/g)
    .filter(Boolean);
  if (parts.length !== 4) {
    return null;
  }
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n))) {
    return null;
  }
  return { a1: nums[0], r1: nums[1], a2: nums[2], r2: nums[3] };
}

function replaceBezierPolar(value, options, result, decl) {
  const needle = 'bezier-polar(';
  let out = '';
  let idx = 0;

  while (true) {
    const start = value.indexOf(needle, idx);
    if (start === -1) {
      out += value.slice(idx);
      break;
    }

    out += value.slice(idx, start);
    const open = start + needle.length - 1; // points at '('

    // find matching ')', respecting nested parens (defensive)
    let depth = 0;
    let end = -1;
    for (let i = open; i < value.length; i++) {
      const ch = value[i];
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }

    if (end === -1) {
      out += value.slice(start);
      break;
    }

    const argsText = value.slice(open + 1, end);
    const args = parseArgs(argsText);
    if (!args) {
      if (result && decl) {
        result.warn(`Invalid bezier-polar(...) args: "${argsText.trim()}" (expected 4 numbers).`, {
          node: decl,
        });
      }
      out += value.slice(start, end + 1);
      idx = end + 1;
      continue;
    }

    out += cubicBezierFromPolar(args, options);
    idx = end + 1;
  }

  return out;
}

module.exports = function postcssBezierPolar(userOptions = {}) {
  const options = { ...DEFAULTS, ...userOptions };

  return {
    postcssPlugin: 'postcss-bezier-polar',
    Declaration(decl, { result }) {
      if (!decl.value || !decl.value.includes('bezier-polar(')) {
        return;
      }
      decl.value = replaceBezierPolar(decl.value, options, result, decl);
    },
  };
};

module.exports.postcss = true;

