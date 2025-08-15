// postcss.config.cjs
const purgecssImport = require('@fullhuman/postcss-purgecss');
const discardImport = require('postcss-discard-duplicates');

// compat: ia default dacă există, altfel modulul direct
const purgecss = purgecssImport.default || purgecssImport;
const discardDuplicates = discardImport.default || discardImport;

module.exports = {
  plugins: [
    purgecss({
      content: ['./**/*.html', './assets/js/**/*.js'],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      // safelist: { standard: ['is-open','active'], patterns: [/^btn-/, /^nav-/, /^swiper-/, /^glightbox/] }
    }),
    discardDuplicates()
    // , require('cssnano')({ preset: 'default' }) // opțional: minificare
  ]
};
