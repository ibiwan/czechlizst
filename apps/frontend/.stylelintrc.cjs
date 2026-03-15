module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
  rules: {
    'at-rule-no-unknown': null,
    'custom-property-empty-line-before': null,
    'declaration-empty-line-before': null,
    'comment-empty-line-before': [
      'always',
      {
        ignore: ['stylelint-commands']
      }
    ]
  }
};
