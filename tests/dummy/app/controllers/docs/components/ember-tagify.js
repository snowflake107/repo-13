
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class EmberTagify extends Controller {
  @tracked tagsvalue = 'tag1,tag2';
  @tracked tags = [];

  get classString() {
    return `tagify docs-transition
    focus:docs-outline-0
    docs-border docs-border-transparent
    focus:docs-bg-white
    focus:docs-border-grey-light
    docs-placeholder-grey-darkest
    docs-rounded
    docs-bg-grey-lighter
    docs-pl-10
    docs-block
    docs-appearance-none
    docs-ds-input`;
  }

  @action
  onTagChange(e) {
    this.tags = e.detail.value;
    console.log(`onTagChange: ${this.tags}`);
  }

  @action
  onTagAdded(e) {
    console.log(`onTagAdded, tag value: ${e.detail.data.value}, index: ${e.detail.index}`);
  }

  @action
  onTagRemoved(e) {
    console.log(`onTagRemoved, tag value: ${e.detail.data.value}, index: ${e.detail.index}`);
  }

  @action
  clearAll() {
    this.tagsvalue = '';
  }
}