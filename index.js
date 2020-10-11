'use strict';

module.exports = {
  name: require('./package').name,
  options: {
    babel: {
      plugins: [require.resolve('ember-auto-import/babel-plugin')]
    }
  },

  included() {
    this.import('node_modules/@yaireo/tagify/dist/tagify.css');
    this._super.included.apply(this, arguments);
  },
};
