
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class EmberTagify extends Controller {
  @tracked value = null;
  @tracked tagsStr = null;

  get classString() {
    return `docs-transition
    focus:docs-outline-0
    docs-border docs-border-transparent
    focus:docs-bg-white
    focus:docs-border-grey-light
    docs-placeholder-grey-darkest
    docs-rounded
    docs-bg-grey-lighter
    docs-py-2 docs-pr-4
    docs-pl-10
    docs-block
    docs-w-2/3
    docs-appearance-none
    docs-leading-normal
    docs-ds-input`;
  }

  @action
  onTagChange(tagStr) {
    this.tagsStr = tagsStr;
    console.log('onTagChange called');
  }
}