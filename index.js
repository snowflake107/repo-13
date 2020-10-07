'use strict';

const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const map = require('broccoli-stew').map;
const path = require('path');

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
