const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const bezierPolar = require('./devtools/artifacts/postcss-bezier-polar/index.cjs');

module.exports = {
  plugins: [
    tailwindcss,
    bezierPolar({
      radiusMode: 'angleScaled',
      precision: 4,
    }),
    autoprefixer
  ]
};
