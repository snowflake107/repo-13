
import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from 'dummy/config/environment';

export default class Router extends AddonDocsRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  docsRoute(this, function() {
    this.route('usage');

    this.route('components', function() {
      this.route('ember-tagify');
    });
  });

  this.route('not-found', { path: '/*path' });
});
