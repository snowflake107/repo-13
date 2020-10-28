
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class EmberTagify extends Controller {
  @tracked tagsvalue = 'tag1,tag2';

  classStringDefault =
  `tagify docs-transition
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

  @tracked
  classString = this.classStringDefault;
  
  @action
  onTagChange(e) {
    this.tagsvalue = JSON.parse(e.detail.value).map((item) => item['value']).join(',');
    console.log(`onTagChange: ${this.tagsvalue}`);
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